import { useEffect, useState } from "react";
import {
  BarChart3,
  CarFront,
  ClipboardList,
  Fuel,
  Gauge,
  LogOut,
  Menu,
  Moon,
  RotateCcw,
  ShieldCheck,
  Sun,
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
  onReset: () => void;
  children: React.ReactNode;
};

const NAV_ITEMS: { page: Page; label: string; icon: typeof Gauge }[] = [
  { page: "dashboard",   label: "Dashboard",   icon: Gauge       },
  { page: "vehicles",    label: "Vehicles",     icon: Truck       },
  { page: "drivers",     label: "Drivers",      icon: UserRound   },
  { page: "trips",       label: "Trips",        icon: ClipboardList },
  { page: "maintenance", label: "Maintenance",  icon: Wrench      },
  { page: "expenses",    label: "Expenses",     icon: Fuel        },
  { page: "reports",     label: "Reports",      icon: BarChart3   },
];

export function Layout({ activePage, currentUser, onPageChange, onLogout, onReset, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dark mode — persisted to localStorage
  const [dark, setDark] = useState<boolean>(() => {
    try { return localStorage.getItem("transitops-theme") === "dark"; }
    catch { return false; }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    try { localStorage.setItem("transitops-theme", dark ? "dark" : "light"); }
    catch { /* ignore */ }
  }, [dark]);

  function handleNavClick(page: Page) {
    onPageChange(page);
    setSidebarOpen(false);
  }

  const pageLabel = NAV_ITEMS.find((i) => i.page === activePage)?.label ?? "";

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      <div
        aria-hidden="true"
        className={sidebarOpen ? "sidebar-overlay overlay--visible" : "sidebar-overlay"}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={sidebarOpen ? "sidebar sidebar--open" : "sidebar"}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-mark">
            <CarFront size={17} strokeWidth={1.75} />
          </div>
          <div className="brand-name">
            <strong>TransitOps</strong>
            <span>Command Center</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="nav-list" aria-label="Primary navigation">
          {NAV_ITEMS.map(({ page, label, icon: Icon }) => (
            <button
              aria-current={activePage === page ? "page" : undefined}
              className={activePage === page ? "nav-item active" : "nav-item"}
              key={page}
              onClick={() => handleNavClick(page)}
              type="button"
            >
              <Icon size={16} strokeWidth={1.75} className="nav-icon" />
              {label}
            </button>
          ))}
        </nav>

        {/* User + role */}
        <div className="sidebar-footer">
          <div className="role-card">
            <div className="role-card-avatar">
              <ShieldCheck size={14} strokeWidth={2} />
            </div>
            <div className="role-card-info">
              <strong>{currentUser.name}</strong>
              <span>{currentUser.role}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main workspace */}
      <div className="workspace">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            {/* Hamburger — visible on tablet/mobile via CSS */}
            <button
              aria-expanded={sidebarOpen}
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
              className="hamburger-btn"
              onClick={() => setSidebarOpen((p) => !p)}
              type="button"
            >
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>

            <span className="topbar-eyebrow">Fleet Operations</span>
            <span className="topbar-divider" aria-hidden="true">/</span>
            <h1>{pageLabel}</h1>
          </div>

          <div className="topbar-actions">
            <button
              className="ghost-button"
              onClick={onReset}
              title="Reset all demo data"
              type="button"
            >
              <RotateCcw size={13} />
              <span className="btn-label">Reset Data</span>
            </button>

            <button
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              className="theme-toggle"
              onClick={() => setDark((d) => !d)}
              type="button"
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <button
              className="ghost-button"
              onClick={onLogout}
              type="button"
            >
              <LogOut size={13} />
              <span className="btn-label">Logout</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}
