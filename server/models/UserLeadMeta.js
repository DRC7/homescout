import mongoose from "mongoose";

const UserLeadMetaSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    leadId: { type: String, required: true, index: true }, // your Lead.id like "L-1001"

    saved: { type: Boolean, default: false },

    status: { type: String, default: "new" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// prevent duplicates per user+lead
UserLeadMetaSchema.index({ userId: 1, leadId: 1 }, { unique: true });

export default mongoose.model("UserLeadMeta", UserLeadMetaSchema);
