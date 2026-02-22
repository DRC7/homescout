import { useEffect, useState } from "react";
import PropertyCard from "../components/PropertyCard";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Favorites() {
  const { user, loadingUser } = useAuth();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setErr("");
        setLoading(true);

        if (!user) {
          setSaved([]);
          return;
        }

        const data = await apiFetch("/api/my/saved-deals", { method: "GET" });
        setSaved(data.results || []);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    }

    if (!loadingUser) load();
  }, [user, loadingUser]);

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
          <h2 className="text-xl font-semibold">Saved Deals</h2>
          <p className="mt-1 text-zinc-600">
            Log in to sync saved deals to your account.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 text-zinc-700">
          <Link className="underline font-medium" to="/login">
            Log in
          </Link>{" "}
          to view your saved deals.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="text-xl font-semibold">Saved Deals</h2>
        <p className="mt-1 text-zinc-600">
          Synced to your account (MongoDB).
        </p>
      </div>

      {err && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {err}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border bg-white p-6 text-zinc-600">
          Loading saved deals…
        </div>
      ) : saved.length === 0 ? (
        <div className="rounded-2xl border bg-white p-6 text-zinc-600">
          No saved deals yet. Go to Find Deals and click “Save Deal”.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((p) => (
            <PropertyCard key={p.id} property={p} initialSaved />
          ))}
        </div>
      )}
    </div>
  );
}
