import mongoose from "mongoose";

const SellerSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
  },
  { _id: false }
);

const LeadSchema = new mongoose.Schema(
  {
    // Your app uses ids like L-1001; keep that for now.
    id: { type: String, required: true, unique: true, index: true },

    address: { type: String, required: true },
    city: { type: String, required: true },

    propertyType: { type: String, default: "multifamily" },
    units: { type: Number, required: true },
    isMultiFamily: { type: Boolean, default: true },

    conditionScore: { type: Number, default: 3 }, // 1..5
    vacant: { type: Boolean, default: false },
    inAuction: { type: Boolean, default: false },

    askingPrice: { type: Number, required: true },
    estimatedARV: { type: Number, default: 0 },
    estimatedRepairCost: { type: Number, default: 0 },
    estimatedEquity: { type: Number, default: 0 },

    seller: { type: SellerSchema, default: () => ({}) },

    leadStatus: { type: String, default: "new" },

    image: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Lead", LeadSchema);
