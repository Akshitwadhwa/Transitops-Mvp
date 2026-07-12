import { useEffect, useMemo, useState } from "react";
import { Truck } from "lucide-react";
import { Layout } from "./components/Layout";
import { users } from "./data/seed";
import { loadData } from "./logic/storage";
import { fetchAppData, resetDatabaseApi } from "./logic/api";
import { Dashboard } from "./pages/Dashboard";
import { Drivers } from "./pages/Drivers";
import { Expenses } from "./pages/Expenses";
import { Maintenance } from "./pages/Maintenance";
import { Reports } from "./pages/Reports";
import { Trips } from "./pages/Trips";
import { Vehicles } from "./pages/Vehicles";
import type { AppData, Page, User } from "./types";

const ROLES = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"] as const;
type LoginRole = typeof ROLES[number];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePage, setActivePage]   = useState<Page>("dashboard");
  const [data, setData]               = useState<AppData>(() => loadData());

  // Login form state
  const [selectedRole, setSelectedRole] = useState<LoginRole>(ROLES[0]);
  const [loginError, setLoginError]     = useState("");

  useEffect(() => { saveData(data); }, [data]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const user = users.find((u) => u.role === selectedRole);
    if (user) {
      setCurrentUser(user);
      setLoginError("");
    } else {
      setLoginError("No account found for this role in the demo dataset.");
    }
  }

  const page = useMemo(() => {
    switch (activePage) {
      case "vehicles":    return <Vehicles    data={data} setData={setData} />;
      case "drivers":     return <Drivers     data={data} setData={setData} />;
      case "trips":       return <Trips       data={data} setData={setData} />;
      case "maintenance": return <Maintenance data={data} setData={setData} />;
      case "expenses":    return <Expenses    data={data} setData={setData} />;
      case "reports":     return <Reports     data={data} />;
      default:            return currentUser
        ? <Dashboard data={data} currentUser={currentUser} onPageChange={setActivePage} />
        : null;
    }
  }, [activePage, currentUser, data]);

  /* ── Login screen ─────────────────────────────────────── */
  if (!currentUser) {
    return (
      <main className="login-screen">
        {/* Left — branding */}
        <div className="login-left">
          <div className="login-brand">
            <div className="brand-mark">
              <Truck size={20} strokeWidth={1.75} />
            </div>
            <div>
              <strong>TransitOps</strong>
              <span>Smart Transport Operations Platform</span>
            </div>
          </div>

          <p className="login-tagline">
            End-to-end fleet management — vehicles, drivers, trips,
            maintenance, and cost analytics in one command centre.
          </p>

          <div className="login-visual" aria-hidden="true">
            <div className="login-map-card">
              <span className="map-grid-line vertical one" />
              <span className="map-grid-line vertical two" />
              <span className="map-grid-line horizontal one" />
              <span className="map-grid-line horizontal two" />
              <span className="route-thread primary" />
              <span className="route-thread secondary" />
              <span className="fleet-node depot">
                <Truck size={20} strokeWidth={2} />
              </span>
              <span className="fleet-node moving one">
                <Truck size={16} strokeWidth={2.2} />
              </span>
              <span className="fleet-node moving two">
                <Truck size={16} strokeWidth={2.2} />
              </span>
              <span className="pulse-ring one" />
              <span className="pulse-ring two" />
            </div>

            <div className="login-visual-stat active">
              <strong>24/7</strong>
              <span>live dispatch</span>
            </div>
            <div className="login-visual-stat cost">
              <strong>₹26K</strong>
              <span>tracked cost</span>
            </div>
          </div>

          <div className="login-role-list">
            <p>One login, four roles:</p>
            {ROLES.map((r) => (
              <div className="login-role-item" key={r}>
                <span className="login-role-dot" />
                {r}
              </div>
            ))}
          </div>

          <div className="login-footer">
            TRANSITOPS © 2026 · RBAC MVP
          </div>
        </div>

        {/* Right — form */}
        <div className="login-right">
          <div className="login-form-box">
            <h2>Sign in to your account</h2>
            <p>Select your role to continue</p>

            <form className="login-form" onSubmit={handleLogin}>
              {loginError && (
                <div className="login-error">{loginError}</div>
              )}

              <label>
                Email
                <input
                  defaultValue="demo@transitops.in"
                  placeholder="you@transitops.in"
                  readOnly
                  type="email"
                />
              </label>

              <label>
                Password
                <input defaultValue="••••••••" readOnly type="password" />
              </label>

              <label>
                Role (RBAC)
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as LoginRole)}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </label>

              <button className="login-submit" type="submit">
                Sign In
              </button>
            </form>

            <div className="login-access-note">
              <strong>Access is scoped by role after login:</strong>
              Fleet Manager → Fleet, Maintenance<br />
              Dispatcher → Dashboard, Trips<br />
              Safety Officer → Drivers, Compliance<br />
              Financial Analyst → Fuel &amp; Expenses, Analytics
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ── Main app ─────────────────────────────────────────── */
  return (
    <Layout
      activePage={activePage}
      currentUser={currentUser}
      onLogout={() => setCurrentUser(null)}
      onPageChange={setActivePage}
      onReset={() => setData(resetData())}
    >
      {page}
    </Layout>
  );
}
