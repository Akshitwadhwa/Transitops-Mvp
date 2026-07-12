import {
  BarChart3,
  CarFront,
  ClipboardList,
  Fuel,
  Gauge,
  LogOut,
  Menu,
  ShieldCheck,
  Truck,
  UserRound,
  Wrench,
} from "lucide-react";
import type { Page, User } from "../types";

type LayoutProps = {
  activePage: Page;
  currentUser: User;
  onPageChange: (page: Page) => void;
  onLogout: () => void;
  children: React.ReactNode;
};

const navItems: { page: Page; label: string; icon: typeof Gauge }[] = [
  { page: "dashboard", label: "Dashboard", icon: Gauge },
  { page: "vehicles", label: "Vehicles", icon: Truck },
  { page: "drivers", label: "Drivers", icon: UserRound },
  { page: "trips", label: "Trips", icon: ClipboardList },
  { page: "maintenance", label: "Maintenance", icon: Wrench },
  { page: "expenses", label: "Expenses", icon: Fuel },
  { page: "reports", label: "Reports", icon: BarChart3 },
];

export function Layout({ activePage, currentUser, onPageChange, onLogout, children }: LayoutProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <CarFront size={22} />
          </div>
          <div>
            <strong>TransitOps</strong>
            <span>Command Center</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Primary">
          {navItems.map(({ page, label, icon: Icon }) => (
            <button
              className={activePage === page ? "nav-item active" : "nav-item"}
              key={page}
              onClick={() => onPageChange(page)}
              type="button"
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="role-card">
          <ShieldCheck size={18} />
          <div>
            <strong>{currentUser.name}</strong>
            <span>{currentUser.role}</span>
          </div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">Smart Transport Operations Platform</span>
            <h1>{navItems.find((item) => item.page === activePage)?.label}</h1>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" title="Menu">
              <Menu size={18} />
            </button>
            <button className="ghost-button" onClick={onLogout} type="button">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
