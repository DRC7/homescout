import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function PropertyCard({ property, initialSaved = false }) {
  const { user } = useAuth();

  const score = property.dealScore ?? 0;

  const [saved, setSaved] = useState(!!initialSaved);
  const [saving, setSaving] = useState(false);

  // If we get userMeta from /api/my/saved-deals, use it
  const metaSaved = useMemo(() => property?.userMeta?.saved, [property]);
  const effectiveSaved = metaSaved !== undefined ? metaSaved : saved;

  async function toggleSave(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert("Please log in to save deals to your account.");
      return;
    }

    try {
      setSaving(true);

      if (effectiveSaved) {
        await apiFetch(`/api/my/leads/${property.id}/save`, { method: "DELETE" });
        setSaved(false);
      } else {
        await apiFetch(`/api/my/leads/${property.id}/save`, { method: "POST" });
        setSaved(true);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Link
      to={`/property/${property.id}`}
      className="group overflow-hidden rounded-2xl border bg-white hover:shadow-md transition"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
        <img
          src={property.image}
          alt={property.address}
          className="h-full w-full object-cover group-hover:scale-[1.02] transition"
          loading="lazy"
        />

        <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold shadow">
          Deal Score: {score}
        </div>

        <div className="absolute right-3 top-3 flex gap-2">
          {property.vacant && (
            <span className="rounded-full bg-zinc-900/90 px-3 py-1 text-xs font-medium text-white">
              Vacant
            </span>
          )}
          {property.inAuction && (
            <span className="rounded-full bg-red-600/90 px-3 py-1 text-xs font-medium text-white">
              Auction
            </span>
          )}
          {property.units >= 5 && (
            <span className="rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-medium text-white">
              5+ Units
            </span>
          )}
        </div>

        <button
          onClick={toggleSave}
          disabled={saving}
          className={`absolute bottom-3 right-3 rounded-full px-3 py-2 text-xs font-semibold shadow transition disabled:opacity-60
            ${effectiveSaved ? "bg-zinc-900 text-white hover:bg-zinc-800" : "bg-white/95 text-zinc-900 hover:bg-white"}`}
        >
          {effectiveSaved ? "Saved" : "Save Deal"}
        </button>
      </div>

      <div className="p-4 space-y-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug">{property.address}</h3>
          <div className="font-semibold">
            ${Number(property.askingPrice).toLocaleString()}
          </div>
        </div>

        <div className="text-sm text-zinc-600">{property.city}</div>

        <div className="text-sm text-zinc-600">
          {property.units} units • Condition {property.conditionScore}/5
        </div>

        <div className="pt-2 text-sm">
          <span className="text-zinc-600">Est. Equity: </span>
          <span className="font-medium">
            ${Number(property.estimatedEquity || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
