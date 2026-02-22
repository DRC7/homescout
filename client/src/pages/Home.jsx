import { useEffect, useState } from "react";
import PropertyCard from "../components/PropertyCard";
import SkeletonCard from "../components/SkeletonCard";

export default function Home() {
  // Results
  const [leads, setLeads] = useState([]);
  const [meta, setMeta] = useState(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters (these match the backend query params)
  const [search, setSearch] = useState("");
  const [minUnits, setMinUnits] = useState("2");
  const [maxUnits, setMaxUnits] = useState(""); // blank = no max
  const [conditionMin, setConditionMin] = useState("4"); // 4+ = run-down focus
  const [vacantOnly, setVacantOnly] = useState(false);
  const [auctionOnly, setAuctionOnly] = useState(false);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [sort, setSort] = useState("score_desc");

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 9;

  function buildParams(overrides = {}) {
    const params = {
      search,
      minUnits,
      maxUnits,
      conditionMin,
      minPrice,
      maxPrice,
      sort,
      page,
      limit,
      ...overrides,
    };

    // Convert booleans into the strings our API expects
    if (vacantOnly) params.vacant = "true";
    if (auctionOnly) params.inAuction = "true";

    // Remove empty values so the URL stays clean
    Object.keys(params).forEach((k) => {
      if (params[k] === "" || params[k] === null || params[k] === undefined) {
        delete params[k];
      }
    });

    return params;
  }

  async function load(overrides = {}) {
    try {
      setLoading(true);
      setError("");

      const params = buildParams(overrides);
      const qs = new URLSearchParams(params).toString();
      const url = `http://localhost:5050/api/properties?${qs}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load deals");

      const data = await res.json();
      setLeads(data.results || []);
      setMeta(data.meta || null);
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Initial load on page open
  useEffect(() => {
    load({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSearchClick() {
    // Reset to page 1 whenever filters change
    setPage(1);
    load({ page: 1 });
  }

  function clearFilters() {
    setSearch("");
    setMinUnits("2");
    setMaxUnits("");
    setConditionMin("4");
    setVacantOnly(false);
    setAuctionOnly(false);
    setMinPrice("");
    setMaxPrice("");
    setSort("score_desc");
    setPage(1);
    load({
      search: "",
      minUnits: "2",
      maxUnits: "",
      conditionMin: "4",
      vacant: undefined,
      inAuction: undefined,
      minPrice: "",
      maxPrice: "",
      sort: "score_desc",
      page: 1,
    });
  }

  function goPrev() {
    const next = Math.max(1, page - 1);
    setPage(next);
    load({ page: next });
  }

  function goNext() {
    const totalPages = meta?.totalPages || 1;
    const next = Math.min(totalPages, page + 1);
    setPage(next);
    load({ page: next });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border bg-white p-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Find distressed multifamily deals
        </h1>
        <p className="mt-1 text-zinc-600">
          Filter leads, rank opportunities, and save the best prospects.
        </p>

        {/* Filters */}
        <div className="mt-5 grid gap-3 lg:grid-cols-12">
          {/* Search */}
          <div className="lg:col-span-5">
            <label className="text-xs font-medium text-zinc-600">Location / Address</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900/20"
              placeholder="Newark, Jersey City, Queens…"
            />
          </div>

          {/* Units */}
          <div className="lg:col-span-2">
            <label className="text-xs font-medium text-zinc-600">Min Units</label>
            <select
              value={minUnits}
              onChange={(e) => setMinUnits(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-3 bg-white"
            >
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5+</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="text-xs font-medium text-zinc-600">Max Units</label>
            <select
              value={maxUnits}
              onChange={(e) => setMaxUnits(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-3 bg-white"
            >
              <option value="">No max</option>
              <option value="4">4</option>
              <option value="8">8</option>
              <option value="12">12</option>
              <option value="20">20</option>
            </select>
          </div>

          {/* Condition */}
          <div className="lg:col-span-3">
            <label className="text-xs font-medium text-zinc-600">Condition (run-down)</label>
            <select
              value={conditionMin}
              onChange={(e) => setConditionMin(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-3 bg-white"
            >
              <option value="3">3+ (some work)</option>
              <option value="4">4+ (run-down)</option>
              <option value="5">5 (very run-down)</option>
            </select>
          </div>

          {/* Price */}
          <div className="lg:col-span-2">
            <label className="text-xs font-medium text-zinc-600">Min Price</label>
            <input
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-3"
              placeholder="e.g. 150000"
              inputMode="numeric"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="text-xs font-medium text-zinc-600">Max Price</label>
            <input
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-3"
              placeholder="e.g. 600000"
              inputMode="numeric"
            />
          </div>

          {/* Toggles */}
          <div className="lg:col-span-2 flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={vacantOnly}
                onChange={(e) => setVacantOnly(e.target.checked)}
              />
              Vacant only
            </label>
          </div>

          <div className="lg:col-span-2 flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={auctionOnly}
                onChange={(e) => setAuctionOnly(e.target.checked)}
              />
              Auction only
            </label>
          </div>

          {/* Sort */}
          <div className="lg:col-span-3">
            <label className="text-xs font-medium text-zinc-600">Sort</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-3 bg-white"
            >
              <option value="score_desc">Deal Score (High → Low)</option>
              <option value="equity_desc">Equity (High → Low)</option>
              <option value="price_asc">Asking Price (Low → High)</option>
              <option value="price_desc">Asking Price (High → Low)</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="lg:col-span-2 flex items-end gap-3">
            <button
              onClick={onSearchClick}
              className="w-full rounded-xl bg-zinc-900 px-5 py-3 text-white font-medium hover:bg-zinc-800"
            >
              Search
            </button>
          </div>

          <div className="lg:col-span-2 flex items-end gap-3">
            <button
              onClick={clearFilters}
              className="w-full rounded-xl border px-5 py-3 font-medium hover:bg-zinc-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Status */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}


      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && leads.length === 0 && (
        <div className="rounded-2xl border bg-white p-6 text-zinc-600">
          No deals match these filters. Try loosening the condition or price range.
        </div>
      )}

      {!loading && !error && leads.length > 0 && (
        <>
          {/* Meta */}
          <div className="flex items-center justify-between text-sm text-zinc-600">
            <div>
              Showing {leads.length} of {meta?.total ?? leads.length} deals
            </div>
            <div>
              Page {meta?.page ?? page} of {meta?.totalPages ?? 1}
            </div>
          </div>

          {/* Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {leads.map((l) => (
              <PropertyCard key={l.id} property={l} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-3">
            <button
              onClick={goPrev}
              disabled={(meta?.page ?? page) <= 1 || loading}
              className="rounded-xl border px-4 py-2 font-medium disabled:opacity-50 hover:bg-zinc-50"
            >
              Prev
            </button>
            <button
              onClick={goNext}
              disabled={(meta?.page ?? page) >= (meta?.totalPages ?? 1) || loading}
              className="rounded-xl border px-4 py-2 font-medium disabled:opacity-50 hover:bg-zinc-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

