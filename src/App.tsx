import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, Truck } from "lucide-react";
import { Layout } from "./components/Layout";
import { users } from "./data/seed";
import { loadData, resetData, saveData } from "./logic/storage";
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
  const [data, setData] = useState<AppData>(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

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
          <div className="login-brand">
            <div className="brand-mark">
              <Truck size={20} strokeWidth={1.75} />
            </div>
            <div>
              <strong>TransitOps</strong>
              <span>Smart Transport Operations Platform</span>
            </div>
          </div>

          <h1>Choose a demo role</h1>
          <p>
            The MVP uses seeded users so the demo can start immediately.
            Role-based access can be tightened in the next layer.
          </p>

          <div className="login-grid">
            {users.map((user) => (
              <button className="login-card" key={user.id} onClick={() => setCurrentUser(user)} type="button">
                <ShieldCheck size={16} color="var(--accent)" strokeWidth={2} />
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
      onReset={() => setData(resetData())}
    >
      {page}
    </Layout>
  );
}
