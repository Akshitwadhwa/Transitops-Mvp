import { useState } from "react";
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
  X,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleNavClick(page: Page) {
    onPageChange(page);
    setSidebarOpen(false); // close drawer on mobile after navigation
  }

  return (
    <div className="app-shell">
      {/* Mobile overlay — tapping it closes the sidebar */}
      <div
        className={sidebarOpen ? "sidebar-overlay overlay--visible" : "sidebar-overlay"}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside className={sidebarOpen ? "sidebar sidebar--open" : "sidebar"}>
        <div className="brand">
          <div className="brand-mark">
            <CarFront size={20} />
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
              onClick={() => handleNavClick(page)}
              type="button"
              aria-current={activePage === page ? "page" : undefined}
            >
              <Icon size={17} className="nav-icon" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="role-card">
          <ShieldCheck size={16} color="var(--clr-brand)" />
          <div>
            <strong>{currentUser.name}</strong>
            <span>{currentUser.role}</span>
          </div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          {/* Hamburger — visible only on tablet/mobile via CSS */}
          <button
            className="hamburger-btn"
            type="button"
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="topbar-left">
            <span className="eyebrow">Smart Transport Operations Platform</span>
            <h1>{navItems.find((item) => item.page === activePage)?.label}</h1>
          </div>

          <div className="topbar-actions">
            <button className="ghost-button" onClick={onLogout} type="button">
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
