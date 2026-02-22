import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm ${
      isActive ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"
    }`;

  return (
    <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold tracking-tight text-lg">
          HomeScout
        </Link>

        <nav className="flex items-center gap-2">
          <NavLink to="/" className={linkClass} end>
            Find Deals
          </NavLink>
          <NavLink to="/favorites" className={linkClass}>
            Saved Deals
          </NavLink>
          <NavLink to="/login" className={linkClass}>
            Login
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
