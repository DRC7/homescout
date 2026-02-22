import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await register({ name, email, password });
      nav("/");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="rounded-2xl border bg-white p-6">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="mt-1 text-zinc-600">Save deals and manage your lead pipeline.</p>

        {err && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-zinc-600">Name</label>
            <input
              className="mt-1 w-full rounded-xl border px-4 py-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dan"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-600">Email</label>
            <input
              className="mt-1 w-full rounded-xl border px-4 py-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-600">Password (6+)</label>
            <input
              className="mt-1 w-full rounded-xl border px-4 py-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete="new-password"
            />
          </div>

          <button className="w-full rounded-xl bg-zinc-900 px-5 py-3 text-white font-medium hover:bg-zinc-800">
            Create account
          </button>
        </form>

        <p className="mt-4 text-sm text-zinc-600">
          Already have an account?{" "}
          <Link className="font-medium text-zinc-900 underline" to="/login">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

