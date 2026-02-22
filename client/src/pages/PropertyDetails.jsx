import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";

function money(n) {
  const num = Number(n || 0);
  return `$${num.toLocaleString()}`;
}

export default function PropertyDetails() {
  const { id } = useParams();
  const { user, loadingUser } = useAuth();

  const [deal, setDeal] = useState(null);
  const [loadingDeal, setLoadingDeal] = useState(true);
  const [dealError, setDealError] = useState("");

  const [meta, setMeta] = useState({
    saved: false,
    status: "new",
    notes: "",
  });
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState("");

  const [savingMeta, setSavingMeta] = useState(false);
  const [savingSaved, setSavingSaved] = useState(false);

  // ---------- Load deal ----------
  useEffect(() => {
    async function loadDeal() {
      try {
        setDealError("");
        setLoadingDeal(true);
        const data = await apiFetch(`/api/properties/${id}`, { method: "GET" });
        setDeal(data);
      } catch (e) {
        setDealError(e.message);
      } finally {
        setLoadingDeal(false);
      }
    }
    loadDeal();
  }, [id]);

  // ---------- Load user meta (saved + status + notes) ----------
  useEffect(() => {
    async function loadMeta() {
      if (!user) {
        setMeta({ saved: false, status: "new", notes: "" });
        setLoadingMeta(false);
        setMetaError("");
        return;
      }

      try {
        setMetaError("");
        setLoadingMeta(true);
        const data = await apiFetch(`/api/my/leads/${id}/meta`, { method: "GET" });
        setMeta({
          saved: !!data.meta.saved,
          status: data.meta.status || "new",
          notes: data.meta.notes || "",
        });
      } catch (e) {
        setMetaError(e.message);
      } finally {
        setLoadingMeta(false);
      }
    }

    if (!loadingUser) {
      loadMeta();
    }
  }, [id, user, loadingUser]);

  // ---------- Derived values ----------
  const profitSpread = useMemo(() => {
    if (!deal) return 0;
    const arv = Number(deal.estimatedARV || 0);
    const repairs = Number(deal.estimatedRepairCost || 0);
    const ask = Number(deal.askingPrice || 0);
    return arv - repairs - ask;
  }, [deal]);

  const showLoading = loadingDeal || (!deal && loadingMeta);

  // ---------- Handlers ----------
  async function handleSaveToggle() {
    if (!deal) return;
    if (!user) {
      alert("Please log in to save deals to your account.");
      return;
    }

    try {
      setSavingSaved(true);

      if (meta.saved) {
        await apiFetch(`/api/my/leads/${deal.id}/save`, { method: "DELETE" });
        setMeta((m) => ({ ...m, saved: false }));
      } else {
        await apiFetch(`/api/my/leads/${deal.id}/save`, { method: "POST" });
        setMeta((m) => ({ ...m, saved: true }));
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingSaved(false);
    }
  }

  async function handleSaveMeta() {
    if (!deal) return;
    if (!user) {
      alert("Log in to save notes and status.");
      return;
    }

    try {
      setSavingMeta(true);
      await apiFetch(`/api/my/leads/${deal.id}/meta`, {
        method: "PUT",
        body: JSON.stringify({
          status: meta.status,
          notes: meta.notes,
        }),
      });
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingMeta(false);
    }
  }

  function handleResetMeta() {
    setMeta({ saved: meta.saved, status: "new", notes: "" });
  }

  // ---------- Render ----------
  return (
    <div className="space-y-6">
      {/* Top: deal summary */}
      <div className="rounded-2xl border bg-white p-6">
        {showLoading && <div className="text-zinc-600">Loading deal…</div>}

        {dealError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {dealError}
          </div>
        )}

        {!showLoading && !dealError && deal && (
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Image */}
            <div className="lg:w-1/2">
              <div className="overflow-hidden rounded-2xl bg-zinc-100">
                <img
                  src={deal.image}
                  alt={deal.address}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="lg:w-1/2 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {deal.address}
                  </h1>
                  <p className="text-zinc-600">{deal.city}</p>
                </div>

                <div className="text-right">
                  <div className="text-sm text-zinc-600">Deal Score</div>
                  <div className="text-2xl font-semibold">{deal.dealScore}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-zinc-600">Asking</div>
                  <div className="font-semibold">{money(deal.askingPrice)}</div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-zinc-600">Units</div>
                  <div className="font-semibold">{deal.units}</div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-zinc-600">ARV</div>
                  <div className="font-semibold">{money(deal.estimatedARV)}</div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-zinc-600">Repairs</div>
                  <div className="font-semibold">
                    {money(deal.estimatedRepairCost)}
                  </div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-zinc-600">Equity</div>
                  <div className="font-semibold">
                    {money(deal.estimatedEquity)}
                  </div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-zinc-600">
                    Spread (ARV - Repairs - Ask)
                  </div>
                  <div className="font-semibold">{money(profitSpread)}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {deal.vacant && (
                  <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white">
                    Vacant
                  </span>
                )}
                {deal.inAuction && (
                  <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white">
                    Auction
                  </span>
                )}
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-800">
                  Condition {deal.conditionScore}/5
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveToggle}
                  disabled={savingSaved}
                  className={`rounded-xl px-5 py-3 font-medium transition disabled:opacity-60 ${
                    meta.saved
                      ? "bg-zinc-900 text-white hover:bg-zinc-800"
                      : "border hover:bg-zinc-50"
                  }`}
                >
                  {meta.saved ? "Saved" : "Save Deal"}
                </button>

                <button
                  className="rounded-xl border px-5 py-3 font-medium text-zinc-700 hover:bg-zinc-50"
                  type="button"
                >
                  Request Tour (demo)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Seller + CRM */}
      {!showLoading && !dealError && deal && (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Seller */}
          <div className="rounded-2xl border bg-white p-6 lg:col-span-1">
            <h2 className="text-lg font-semibold">Seller</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Demo data – in a real system this would come from uploads or an external API.
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <div>
                <div className="text-xs text-zinc-600">Name</div>
                <div className="font-medium">{deal.seller?.name || "N/A"}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-600">Phone</div>
                <div className="font-medium">{deal.seller?.phone || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-600">Email</div>
                <div className="font-medium">{deal.seller?.email || "—"}</div>
              </div>
            </div>
          </div>

          {/* CRM Meta */}
          <div className="rounded-2xl border bg-white p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold">Lead Management</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Track status and notes. Synced to your account in MongoDB.
            </p>

            {loadingMeta && (
              <div className="mt-4 text-sm text-zinc-600">
                Loading lead meta…
              </div>
            )}

            {metaError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
                {metaError}
              </div>
            )}

            {!loadingMeta && (
              <>
                {!user && (
                  <div className="mt-3 rounded-xl border bg-zinc-50 p-3 text-sm text-zinc-700">
                    Log in to save notes and status for this lead.
                  </div>
                )}

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="md:col-span-1">
                    <label className="text-xs font-medium text-zinc-600">
                      Status
                    </label>
                    <select
                      value={meta.status}
                      onChange={(e) =>
                        setMeta((m) => ({ ...m, status: e.target.value }))
                      }
                      disabled={!user}
                      className="mt-1 w-full rounded-xl border px-3 py-3 bg-white disabled:bg-zinc-100"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="negotiating">Negotiating</option>
                      <option value="offer_made">Offer Made</option>
                      <option value="under_contract">Under Contract</option>
                      <option value="closed">Closed</option>
                      <option value="dead">Dead Lead</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-zinc-600">
                      Notes
                    </label>
                    <textarea
                      value={meta.notes}
                      onChange={(e) =>
                        setMeta((m) => ({ ...m, notes: e.target.value }))
                      }
                      rows={5}
                      disabled={!user}
                      className="mt-1 w-full rounded-xl border px-3 py-3 disabled:bg-zinc-100"
                      placeholder="Called seller, left voicemail… follow up Friday…"
                    />
                  </div>
                </div>

                <div className="mt-3 flex gap-3">
                  <button
                    onClick={handleSaveMeta}
                    disabled={!user || savingMeta}
                    className="rounded-xl bg-zinc-900 px-5 py-3 text-white font-medium hover:bg-zinc-800 disabled:opacity-60"
                  >
                    Save Notes
                  </button>
                  <button
                    onClick={handleResetMeta}
                    disabled={!user}
                    className="rounded-xl border px-5 py-3 font-medium hover:bg-zinc-50 disabled:opacity-60"
                  >
                    Reset
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}