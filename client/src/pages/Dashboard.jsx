import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import { Link } from "react-router-dom";

function money(n) {
  const num = Number(n || 0);
  return `$${num.toLocaleString()}`;
}

export default function Dashboard() {
  const { user, loadingUser } = useAuth();
  const [savedDeals, setSavedDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      if (!user) {
        setSavedDeals([]);
        setLoading(false);
        return;
      }
      try {
        setErr("");
        setLoading(true);
        const data = await apiFetch("/api/my/saved-deals", { method: "GET" });
        setSavedDeals(data.results || []);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    }

    if (!loadingUser) load();
  }, [user, loadingUser]);

  const stats = useMemo(() => {
    if (!savedDeals.length) {
      return {
        total: 0,
        byStatus: {},
        avgEquity: 0,
        avgScore: 0,
        vacantCount: 0,
        auctionCount: 0,
        bigUnitCount: 0,
      };
    }

    const total = savedDeals.length;
    const byStatus = {};
    let equitySum = 0;
    let scoreSum = 0;
    let vacantCount = 0;
    let auctionCount = 0;
    let bigUnitCount = 0;

    for (const deal of savedDeals) {
      const status = deal.userMeta?.status || "new";
      byStatus[status] = (byStatus[status] || 0) + 1;

      equitySum += Number(deal.estimatedEquity || 0);
      scoreSum += Number(deal.dealScore || 0);

      if (deal.vacant) vacantCount += 1;
      if (deal.inAuction) auctionCount += 1;
      if (deal.units >= 5) bigUnitCount += 1;
    }

    const avgEquity = equitySum / total;
    const avgScore = scoreSum / total;

    return {
      total,
      byStatus,
      avgEquity,
      avgScore,
      vacantCount,
      auctionCount,
      bigUnitCount,
    };
  }, [savedDeals]);

  if (loadingUser) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-zinc-600">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border bg-white p-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-zinc-600">
            Log in to view your multifamily deal analytics.
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-6 text-sm text-zinc-700">
          <Link to="/login" className="font-medium underline">
            Log in
          </Link>{" "}
          to see saved deals, pipeline status, and equity metrics.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Overview of your saved multifamily deals and pipeline.
          </p>
        </div>
        <div className="text-sm text-zinc-600">
          Logged in as{" "}
          <span className="font-medium text-zinc-900">{user.email}</span>
        </div>
      </div>

      {err && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {err}
        </div>
      )}

      {/* Top stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Saved deals
          </div>
          <div className="mt-2 text-2xl font-semibold">{stats.total}</div>
          <div className="mt-1 text-xs text-zinc-500">
            Deals currently in your pipeline
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Avg equity
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {stats.total ? money(stats.avgEquity) : "—"}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            Average estimated equity per saved deal
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Avg deal score
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {stats.total ? Math.round(stats.avgScore) : "—"}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            Weighted by condition, vacancy, units & equity
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Vacant / Auction
          </div>
          <div className="mt-2 text-lg font-semibold">
            {stats.vacantCount} vacant • {stats.auctionCount} auction
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            {stats.bigUnitCount} deals with 5+ units
          </div>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Pipeline by status</h2>
        <p className="mt-1 text-sm text-zinc-600">
          How your saved deals are distributed across stages.
        </p>

        {!savedDeals.length ? (
          <div className="mt-4 text-sm text-zinc-600">
            No saved deals yet. Go to{" "}
            <Link to="/" className="font-medium underline">
              Find Deals
            </Link>{" "}
            and click “Save Deal”.
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-3 md:grid-cols-4">
            {[
              "new",
              "contacted",
              "negotiating",
              "offer_made",
              "under_contract",
              "closed",
              "dead",
            ].map((statusKey) => {
              const count = stats.byStatus[statusKey] || 0;
              const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;

              const labels = {
                new: "New",
                contacted: "Contacted",
                negotiating: "Negotiating",
                offer_made: "Offer made",
                under_contract: "Under contract",
                closed: "Closed",
                dead: "Dead lead",
              };

              return (
                <div key={statusKey} className="rounded-xl border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{labels[statusKey]}</div>
                    <div className="text-xs text-zinc-500">
                      {count} ({pct}%)
                    </div>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-zinc-100">
                    <div
                      className="h-2 rounded-full bg-zinc-900"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}