import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

import bcrypt from "bcryptjs";

import { connectDB } from "./db.js";
import Lead from "./models/Lead.js";
import User from "./models/User.js";
import UserLeadMeta from "./models/UserLeadMeta.js";

import { signToken, requireAuth } from "./auth.js";

const isProd = process.env.NODE_ENV === "production";

const app = express();

// ---- Middleware ----
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow tools like Postman or server-to-server (no origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ---- Helpers (Deal Score) ----
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// Simple scoring model (tune later)
function calcDealScore(lead) {
  let score = 0;

  // Multifamily focus
  if (lead.isMultiFamily) score += 25;

  // Units
  if (lead.units >= 2 && lead.units <= 4) score += 15;
  if (lead.units >= 5) score += 20;

  // Condition: 1=great ... 5=very run-down
  score += clamp((lead.conditionScore || 3) * 8, 0, 40);

  // Vacancy
  if (lead.vacant) score += 15;

  // Auction signal
  if (lead.inAuction) score += 15;

  // Equity
  if (typeof lead.estimatedEquity === "number") {
    if (lead.estimatedEquity >= 100000) score += 15;
    else if (lead.estimatedEquity >= 50000) score += 10;
    else if (lead.estimatedEquity >= 20000) score += 5;
  }

  return clamp(score, 0, 100);
}

// ---- Health check ----
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "HomeScout/DealScout API is running" });
});

// =====================================================
// DEALS / LEADS (MongoDB-powered)
// =====================================================

// List deals with filters + pagination
app.get("/api/properties", async (req, res) => {
  try {
    const {
      search = "",
      minUnits,
      maxUnits,
      minPrice,
      maxPrice,
      conditionMin,
      vacant,
      inAuction,
      sort = "score_desc", // score_desc | equity_desc | price_asc | price_desc
      page = "1",
      limit = "9",
    } = req.query;

    const q = {};

    // Search address/city (case-insensitive)
    if (search.trim()) {
      const s = search.trim();
      q.$or = [
        { address: { $regex: s, $options: "i" } },
        { city: { $regex: s, $options: "i" } },
      ];
    }

    // Units filter
    const minU = minUnits !== undefined ? Number(minUnits) : null;
    const maxU = maxUnits !== undefined ? Number(maxUnits) : null;
    if (minU !== null && !Number.isNaN(minU)) q.units = { ...(q.units || {}), $gte: minU };
    if (maxU !== null && !Number.isNaN(maxU)) q.units = { ...(q.units || {}), $lte: maxU };

    // Price filter
    const minP = minPrice !== undefined ? Number(minPrice) : null;
    const maxP = maxPrice !== undefined ? Number(maxPrice) : null;
    if (minP !== null && !Number.isNaN(minP))
      q.askingPrice = { ...(q.askingPrice || {}), $gte: minP };
    if (maxP !== null && !Number.isNaN(maxP))
      q.askingPrice = { ...(q.askingPrice || {}), $lte: maxP };

    // Condition filter (run-down => higher)
    const cMin = conditionMin !== undefined ? Number(conditionMin) : null;
    if (cMin !== null && !Number.isNaN(cMin)) q.conditionScore = { $gte: cMin };

    // Boolean filters
    if (vacant === "true") q.vacant = true;
    if (vacant === "false") q.vacant = false;

    if (inAuction === "true") q.inAuction = true;
    if (inAuction === "false") q.inAuction = false;

    // Pagination
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 9);
    const skip = (pageNum - 1) * limitNum;

    // Query Mongo
    const total = await Lead.countDocuments(q);
    let results = await Lead.find(q).skip(skip).limit(limitNum).lean();

    // Add dealScore
    results = results.map((l) => ({ ...l, dealScore: calcDealScore(l) }));

    // Sort (in-memory; fine for now with small datasets)
    if (sort === "price_asc") results.sort((a, b) => a.askingPrice - b.askingPrice);
    if (sort === "price_desc") results.sort((a, b) => b.askingPrice - a.askingPrice);
    if (sort === "equity_desc")
      results.sort((a, b) => (b.estimatedEquity || 0) - (a.estimatedEquity || 0));
    if (sort === "score_desc") results.sort((a, b) => b.dealScore - a.dealScore);

    res.json({
      results,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Single deal by id (your Lead.id like "L-1001")
app.get("/api/properties/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const found = await Lead.findOne({ id }).lean();
    if (!found) return res.status(404).json({ message: "Deal not found" });

    res.json({ ...found, dealScore: calcDealScore(found) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Optional: DealScout naming
app.get("/api/leads", (req, res) => {
  // Keep compatibility: treat "leads" same as properties
  res.redirect(307, "/api/properties");
});

// =====================================================
// AUTH (JWT cookie)
// =====================================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name = "", email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be 6+ characters" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail }).lean();
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(String(password), 10);

    const user = await User.create({
      name: String(name),
      email: normalizedEmail,
      passwordHash,
    });

    const token = signToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "Missing credentials" });

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

    const token = signToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.userId).lean();
  if (!user) return res.status(401).json({ message: "Not authenticated" });

  res.json({ user: { id: user._id, name: user.name, email: user.email } });
});

// =====================================================
// USER-SPECIFIC: Saved Deals + Notes/Status (MongoDB)
// =====================================================

// Save a lead
app.post("/api/my/leads/:leadId/save", requireAuth, async (req, res) => {
  try {
    const { leadId } = req.params;

    const doc = await UserLeadMeta.findOneAndUpdate(
      { userId: req.user.userId, leadId },
      { $set: { saved: true } },
      { upsert: true, new: true }
    ).lean();

    res.json({ ok: true, meta: doc });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Unsave a lead
app.delete("/api/my/leads/:leadId/save", requireAuth, async (req, res) => {
  try {
    const { leadId } = req.params;

    const doc = await UserLeadMeta.findOneAndUpdate(
      { userId: req.user.userId, leadId },
      { $set: { saved: false } },
      { upsert: true, new: true }
    ).lean();

    res.json({ ok: true, meta: doc });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get meta (notes/status/saved) for a lead
app.get("/api/my/leads/:leadId/meta", requireAuth, async (req, res) => {
  try {
    const { leadId } = req.params;

    const doc =
      (await UserLeadMeta.findOne({ userId: req.user.userId, leadId }).lean()) ||
      { leadId, saved: false, status: "new", notes: "" };

    res.json({ meta: doc });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update meta (notes/status) for a lead
app.put("/api/my/leads/:leadId/meta", requireAuth, async (req, res) => {
  try {
    const { leadId } = req.params;
    const { status = "new", notes = "" } = req.body;

    const doc = await UserLeadMeta.findOneAndUpdate(
      { userId: req.user.userId, leadId },
      { $set: { status, notes } },
      { upsert: true, new: true }
    ).lean();

    res.json({ ok: true, meta: doc });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// List all saved deals for the logged-in user
app.get("/api/my/saved-deals", requireAuth, async (req, res) => {
  try {
    const savedMeta = await UserLeadMeta.find({
      userId: req.user.userId,
      saved: true,
    })
      .sort({ updatedAt: -1 })
      .lean();

    const leadIds = savedMeta.map((m) => m.leadId);

    const leads = await Lead.find({ id: { $in: leadIds } }).lean();
    const byId = new Map(leads.map((l) => [l.id, l]));

    const results = savedMeta
      .map((m) => {
        const lead = byId.get(m.leadId);
        if (!lead) return null;

        return {
          ...lead,
          dealScore: calcDealScore(lead),
          userMeta: {
            saved: m.saved,
            status: m.status,
            notes: m.notes,
          },
        };
      })
      .filter(Boolean);

    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---- Start server (after DB connects) ----
const PORT = process.env.PORT || 5050;

async function start() {
  await connectDB(process.env.MONGODB_URI);

  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("❌ Server failed to start:", err.message);
  process.exit(1);
});

