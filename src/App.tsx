import { useEffect, useMemo, useState } from "react";
import { RotateCcw, ShieldCheck, Truck } from "lucide-react";
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

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(users[0]);
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [data, setData] = useState<AppData>({
    vehicles: [],
    drivers: [],
    trips: [],
    maintenanceLogs: [],
    expenses: [],
  });

  const loadBackendData = async () => {
    try {
      const backendData = await fetchAppData();
      setData(backendData);
    } catch (err) {
      console.warn("Could not reach backend, falling back to localStorage", err);
      setData(loadData());
    }
  };

  useEffect(() => {
    loadBackendData();
  }, []);

  const handleResetData = async () => {
    try {
      await resetDatabaseApi();
      await loadBackendData();
    } catch (err) {
      alert("Failed to reset backend database. Resetting local storage instead.");
      setData(loadData());
    }
  };

  const page = useMemo(() => {
    switch (activePage) {
      case "vehicles":
        return <Vehicles data={data} setData={setData} />;
      case "drivers":
        return <Drivers data={data} setData={setData} />;
      case "trips":
        return <Trips data={data} setData={setData} />;
      case "maintenance":
        return <Maintenance data={data} setData={setData} />;
      case "expenses":
        return <Expenses data={data} setData={setData} />;
      case "reports":
        return <Reports data={data} />;
      default:
        return <Dashboard data={data} />;
    }
  }, [activePage, data]);

  if (!currentUser) {
    return (
      <main className="login-screen">
        <section className="login-panel">
          <div className="brand large">
            <div className="brand-mark">
              <Truck size={28} />
            </div>
            <div>
              <strong>TransitOps</strong>
              <span>Smart Transport Operations Platform</span>
            </div>
          </div>

          <div>
            <h1>Choose a demo role</h1>
            <p>
              The MVP uses seeded users so the hackathon demo can start immediately. Role-based access can
              be tightened in the next layer.
            </p>
          </div>

          <div className="login-grid">
            {users.map((user) => (
              <button className="login-card" key={user.id} onClick={() => setCurrentUser(user)} type="button">
                <ShieldCheck size={18} />
                <strong>{user.name}</strong>
                <span>{user.role}</span>
                <small>{user.email}</small>
              </button>
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <Layout
      activePage={activePage}
      currentUser={currentUser}
      onLogout={() => setCurrentUser(null)}
      onPageChange={setActivePage}
    >
      <div className="workspace-actions">
        <button className="ghost-button" onClick={handleResetData} type="button">
          <RotateCcw size={16} />
          Reset Demo Data
        </button>
      </div>
      {page}
    </Layout>
  );
}
