import { useEffect, useState } from "react";
import {
  BarChart3,
  ClipboardList,
  Fuel,
  Gauge,
  LogOut,
  Menu,
  Moon,
  RotateCcw,
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
  { page: "vehicles",    label: "Fleet",        icon: Truck       },
  { page: "drivers",     label: "Drivers",      icon: UserRound   },
  { page: "trips",       label: "Trips",        icon: ClipboardList },
  { page: "maintenance", label: "Maintenance",  icon: Wrench      },
  { page: "expenses",    label: "Fuel & Expenses", icon: Fuel     },
  { page: "reports",     label: "Analytics",    icon: BarChart3   },
];

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function Layout({ activePage, currentUser, onPageChange, onLogout, onReset, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dark is default — toggle to light
  const [dark, setDark] = useState<boolean>(() => {
    try { return localStorage.getItem("transitops-theme") !== "light"; }
    catch { return true; }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "" : "light");
    // Dark = no attribute (matches :root), Light = data-theme="light"
    if (dark) {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
    try { localStorage.setItem("transitops-theme", dark ? "dark" : "light"); }
    catch { /* ignore */ }
  }, [dark]);

  function handleNav(page: Page) {
    onPageChange(page);
    setSidebarOpen(false);
  }

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
        <div className="sidebar-brand">
          <div className="role-card">
            <div className="role-avatar">{getInitials(currentUser.name)}</div>
            <div className="role-card-info">
              <strong>{currentUser.name}</strong>
              <span>{currentUser.role}</span>
            </div>
          </div>
        </div>

        <nav className="nav-list" aria-label="Primary navigation">
          {NAV_ITEMS.map(({ page, label, icon: Icon }) => (
            <button
              aria-current={activePage === page ? "page" : undefined}
              aria-label={label}
              className={activePage === page ? "nav-item active" : "nav-item"}
              key={page}
              onClick={() => handleNav(page)}
              title={label}
              type="button"
            >
              <Icon size={20} strokeWidth={1.85} className="nav-icon" />
              <span className="nav-label">{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-actions">
            <button
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              className="sidebar-icon-btn"
              onClick={() => setDark((d) => !d)}
              title={dark ? "Light mode" : "Dark mode"}
              type="button"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="sidebar-icon-btn" aria-label="Reset Data" onClick={onReset} title="Reset Data" type="button">
              <RotateCcw size={16} />
            </button>
            <button className="sidebar-icon-btn" aria-label="Logout" onClick={onLogout} title="Logout" type="button">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Workspace */}
      <div className="workspace">
        <button
          aria-expanded={sidebarOpen}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          className="hamburger-btn"
          onClick={() => setSidebarOpen((p) => !p)}
          type="button"
        >
          {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        {/* Page */}
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}
