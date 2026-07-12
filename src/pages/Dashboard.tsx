import {
  AlertTriangle,
  Bell,
  CarFront,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Gauge,
  Route,
  Search,
  ShieldAlert,
  Truck,
  UserCheck,
  Wrench,
} from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { formatMoney, getDriverName, getVehicleName, isLicenseExpired } from "../logic/rules";
import type { AppData, Page, User } from "../types";

type DashboardProps = {
  currentUser: User;
  data: AppData;
  onPageChange: (page: Page) => void;
};

type AlertItem = {
  id: string;
  icon: typeof AlertTriangle;
  targetPage: Page;
  title: string;
  detail: string;
  severity: "critical" | "warning";
};

function getInitials(name: string) {
  return name.split(" ").map((word) => word[0]).join("").toUpperCase().slice(0, 2);
}

export function Dashboard({ currentUser, data, onPageChange }: DashboardProps) {
  const totalVehicles     = data.vehicles.filter((v) => v.status !== "Retired").length;
  const availableVehicles = data.vehicles.filter((v) => v.status === "Available").length;
  const inShop            = data.vehicles.filter((v) => v.status === "In Shop").length;
  const onTripVehicles    = data.vehicles.filter((v) => v.status === "On Trip").length;
  const retiredVehicles   = data.vehicles.filter((v) => v.status === "Retired").length;
  const dispatchedTrips   = data.trips.filter((t) => t.status === "Dispatched").length;
  const pendingTrips      = data.trips.filter((t) => t.status === "Draft").length;
  const driversOnDuty     = data.drivers.filter((d) => d.status === "On Trip").length;
  const totalExpenses     = data.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const utilization       = totalVehicles
    ? Math.round((dispatchedTrips / totalVehicles) * 100)
    : 0;

  const recentTrips = [...data.trips].slice(0, 8);

  const alertItems: AlertItem[] = [
    ...data.drivers
      .filter((d) => isLicenseExpired(d))
      .map((d) => ({
        id: `lic-${d.id}`,
        icon: ShieldAlert,
        targetPage: "drivers" as const,
        title: d.name,
        detail: `License expired ${d.licenseExpiryDate}`,
        severity: "critical" as const,
      })),
    ...data.drivers
      .filter((d) => !isLicenseExpired(d) && d.safetyScore < 70)
      .map((d) => ({
        id: `score-${d.id}`,
        icon: AlertTriangle,
        targetPage: "drivers" as const,
        title: d.name,
        detail: `Safety score ${d.safetyScore}/100 — below threshold`,
        severity: "warning" as const,
      })),
    ...data.maintenanceLogs
      .filter((log) => log.status === "Active")
      .map((log) => ({
        id: `maint-${log.id}`,
        icon: Wrench,
        targetPage: "maintenance" as const,
        title: getVehicleName(data, log.vehicleId),
        detail: log.title,
        severity: "warning" as const,
      })),
  ].sort((a, b) => (a.severity === "critical" ? -1 : b.severity === "critical" ? 1 : 0));

  const criticalCount = alertItems.filter((alert) => alert.severity === "critical").length;

  const fleetCards = [
    {
      icon: Truck,
      label: "Active Vehicles",
      targetPage: "vehicles" as const,
      value: totalVehicles,
      detail: "Non-retired assets",
    },
    {
      icon: CheckCircle,
      label: "Available Vehicles",
      targetPage: "vehicles" as const,
      value: availableVehicles,
      detail: "Ready for dispatch",
    },
    {
      icon: Wrench,
      label: "Vehicles in Shop",
      targetPage: "maintenance" as const,
      value: inShop,
      detail: "Maintenance attention",
    },
  ];

  const compactStats = [
    { label: "Active Trips", value: dispatchedTrips, icon: Route, targetPage: "trips" as const },
    { label: "Pending Trips", value: pendingTrips, icon: Clock3, targetPage: "trips" as const },
    { label: "Drivers on Duty", value: driversOnDuty, icon: UserCheck, targetPage: "drivers" as const },
    { label: "Fleet Utilization", value: `${utilization}%`, icon: Gauge, targetPage: "reports" as const },
  ];

  const taskItems = [
    {
      count: availableVehicles,
      description: `${availableVehicles} vehicles ready to assign`,
      icon: CheckCircle,
      label: "Available",
      targetPage: "vehicles" as const,
    },
    {
      count: onTripVehicles,
      description: `${onTripVehicles} vehicles currently moving`,
      icon: Route,
      label: "On Trip",
      targetPage: "trips" as const,
    },
    {
      count: inShop,
      description: `${inShop} vehicles need service follow-up`,
      icon: Wrench,
      label: "In Shop",
      targetPage: "maintenance" as const,
    },
    {
      count: retiredVehicles,
      description: `${retiredVehicles} vehicles removed from active fleet`,
      icon: CarFront,
      label: "Retired",
      targetPage: "vehicles" as const,
    },
  ];

  return (
    <div className="dashboard-shell">
      <main className="dashboard-main">
        <header className="dashboard-hero">
          <div>
            <span className="hero-kicker">Hello</span>
            <h1>{currentUser.name}</h1>
            <span className="role-pill">{currentUser.role}</span>
          </div>

          <div className="dashboard-utility" aria-label="Dashboard utilities">
            <label className="utility-search">
              <Search size={17} strokeWidth={2} />
              <input aria-label="Search dashboard" placeholder="Search" readOnly type="text" />
            </label>
            <button
              className="utility-icon"
              aria-label="Open risk alerts"
              onClick={() => onPageChange(criticalCount > 0 ? "drivers" : "maintenance")}
              type="button"
            >
              <Bell size={17} />
              {criticalCount > 0 && <span className="notification-dot" />}
            </button>
            <div className="utility-avatar" aria-label={currentUser.name}>
              {getInitials(currentUser.name)}
            </div>
            <button className="utility-chevron" aria-label="Open profile menu" type="button">
              <ChevronDown size={18} />
            </button>
          </div>
        </header>

        <section className="dashboard-section" aria-labelledby="fleet-status-title">
          <div className="section-heading">
            <h2 id="fleet-status-title">Fleet Status</h2>
            <div className="section-arrows" aria-hidden="true">
              <ChevronLeft size={24} />
              <ChevronRight size={24} />
            </div>
          </div>

          <div className="fleet-card-grid">
            {fleetCards.map(({ detail, icon: Icon, label, targetPage, value }) => (
              <button
                className="fleet-stat-card dashboard-action"
                key={label}
                onClick={() => onPageChange(targetPage)}
                type="button"
              >
                <span className="stat-icon-badge">
                  <Icon size={34} strokeWidth={1.85} />
                </span>
                <strong>{value}</strong>
                <span>{label}</span>
                <small>{detail}</small>
              </button>
            ))}
          </div>

          <div className="dashboard-micro-stats">
            {compactStats.map(({ icon: Icon, label, targetPage, value }) => (
              <button
                className="micro-stat dashboard-action"
                key={label}
                onClick={() => onPageChange(targetPage)}
                type="button"
              >
                <Icon size={16} />
                <span>{label}</span>
                <strong>{value}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="dashboard-section" aria-labelledby="operations-title">
          <div className="section-heading">
            <h2 id="operations-title">Operations</h2>
          </div>

          <div className="operations-grid">
            <div className="operations-stack">
              <button
                className="ops-metric-card dashboard-action"
                onClick={() => onPageChange("expenses")}
                type="button"
              >
                <CircleDollarSign size={24} strokeWidth={1.85} />
                <strong>{formatMoney(totalExpenses)}</strong>
                <span>Operating Cost</span>
                <div className="metric-divider" />
                <small>Fuel, tolls &amp; maintenance</small>
              </button>

              <button
                className="ops-metric-card dashboard-action"
                onClick={() => onPageChange("reports")}
                type="button"
              >
                <Gauge size={24} strokeWidth={1.85} />
                <strong>{utilization}%</strong>
                <span>Fleet Utilization</span>
                <div className="metric-divider" />
                <small>{dispatchedTrips} active / {totalVehicles} active vehicles</small>
              </button>
            </div>

            <button
              className="route-visual-panel dashboard-action"
              onClick={() => onPageChange("trips")}
              type="button"
            >
              <div className="panel-heading">
                <div>
                  <h2>Dispatch Flow</h2>
                  <p>Trip lanes using current TransitOps records.</p>
                </div>
              </div>

              <div className="route-canvas" aria-hidden="true">
                <span className="route-line route-line-a" />
                <span className="route-line route-line-b" />
                <span className="route-node node-a"><Truck size={18} /></span>
                <span className="route-node node-b"><Truck size={18} /></span>
                <span className="route-node node-c"><Truck size={18} /></span>
                <span className="route-zoom plus">+</span>
                <span className="route-zoom minus">−</span>
              </div>

              <div className="route-trip-list">
                {recentTrips.slice(0, 2).map((trip) => (
                  <div className="route-trip" key={trip.id}>
                    <span>{trip.source}</span>
                    <Route size={15} />
                    <span>{trip.destination}</span>
                  </div>
                ))}
              </div>
            </button>
          </div>
        </section>

        <section className="panel recent-trips-card" aria-labelledby="recent-trips-title">
          <div className="panel-heading">
            <div>
              <h2 id="recent-trips-title">Recent Trips</h2>
              <p>Latest trip activity across the fleet.</p>
            </div>
          </div>

          {recentTrips.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={24} className="empty-state-icon" />
              <p>No trips yet</p>
              <small>Create a trip from the Trips page.</small>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Trip</th>
                    <th>Vehicle</th>
                    <th>Driver</th>
                    <th>Status</th>
                    <th>ETA</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrips.map((trip) => (
                    <tr key={trip.id}>
                      <td className="trip-id-cell">
                        {trip.id.slice(0, 7).toUpperCase()}
                      </td>
                      <td>{getVehicleName(data, trip.vehicleId)}</td>
                      <td>{getDriverName(data, trip.driverId)}</td>
                      <td><StatusBadge status={trip.status} /></td>
                      <td className="eta-cell">
                        {trip.status === "Dispatched" ? "45 min" :
                         trip.status === "Draft"      ? "Awaiting vehicle" :
                         trip.status === "Completed"  ? "—" : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <aside className="dashboard-rail" aria-label="Alerts and tasks">
        <section className="rail-section">
          <div className="rail-heading">
            <h2>Events</h2>
            <span>{alertItems.length} open</span>
          </div>

          {alertItems.length === 0 ? (
            <button className="event-card dashboard-action" onClick={() => onPageChange("reports")} type="button">
              <span className="event-dot healthy" />
              <div>
                <strong>Fleet is clear</strong>
                <p>No license, safety, or maintenance signals.</p>
              </div>
            </button>
          ) : (
            <div className="event-list">
              {alertItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    className="event-card dashboard-action"
                    key={item.id}
                    onClick={() => onPageChange(item.targetPage)}
                    type="button"
                  >
                    <span className={`event-dot ${item.severity}`} />
                    <div className="event-content">
                      <div className="event-title-row">
                        <strong>{item.title}</strong>
                        <Icon size={16} />
                      </div>
                      <p>{item.detail}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <button
            className="see-more-button"
            onClick={() => onPageChange(criticalCount > 0 ? "drivers" : "maintenance")}
            type="button"
          >
            See more{criticalCount > 0 ? ` · ${criticalCount} critical` : ""}
          </button>
        </section>

        <section className="rail-section">
          <div className="rail-heading">
            <h2>Task List</h2>
          </div>

          <div className="task-list">
            {taskItems.map(({ count, description, icon: Icon, label, targetPage }) => (
              <button
                className="task-item dashboard-action"
                key={label}
                onClick={() => onPageChange(targetPage)}
                type="button"
              >
                <span className="task-icon-badge">
                  <Icon size={18} />
                </span>
                <div>
                  <strong>{label} <span>{count}</span></strong>
                  <p>{description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rail-section">
          <div className="rail-heading">
            <h2>Activity</h2>
          </div>

          <button className="task-item dashboard-action" onClick={() => onPageChange("trips")} type="button">
            <span className="task-icon-badge">
              <ClipboardCheck size={18} />
            </span>
            <div>
              <strong>Review dispatch queue</strong>
              <p>{pendingTrips} pending trips waiting for assignment checks.</p>
            </div>
          </button>
        </section>
      </aside>
    </div>
  );
}
