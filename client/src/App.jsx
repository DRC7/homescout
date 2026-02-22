import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import PropertyDetails from "./pages/PropertyDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      nav("/");
    } catch (e) {
      console.error(e);
    }
  }

  const linkBase =
    "inline-flex items-center rounded-xl px-3 py-2 text-sm font-medium transition";
  const activeClasses = "bg-zinc-900 text-white";
  const inactiveClasses = "text-zinc-600 hover:bg-zinc-100";

  return (
    <header className="border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-sm font-bold">
            HS
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">
              HomeScout
            </div>
            <div className="text-xs text-zinc-500">
              Multifamily deal finder & CRM
            </div>
          </div>
        </div>

        <nav className="hidden gap-2 md:flex">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? activeClasses : inactiveClasses}`
            }
          >
            Find Deals
          </NavLink>
          <NavLink
            to="/saved"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? activeClasses : inactiveClasses}`
            }
          >
            Saved Deals
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? activeClasses : inactiveClasses}`
            }
          >
            Dashboard
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `${linkBase} text-xs ${
                    isActive ? activeClasses : inactiveClasses
                  }`
                }
              >
                Log in
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `${linkBase} text-xs ${
                    isActive ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                  }`
                }
              >
                Sign up
              </NavLink>
            </>
          ) : (
            <>
              <div className="hidden flex-col text-right text-xs text-zinc-600 sm:flex">
                <span className="font-medium text-zinc-900">
                  {user.name || "User"}
                </span>
                <span>{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center rounded-xl border px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/saved" element={<Favorites />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
}
