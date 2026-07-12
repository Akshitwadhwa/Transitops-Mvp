import {
  AlertTriangle,
  CheckCircle,
  CircleDollarSign,
  Route,
  ShieldAlert,
  Truck,
  UserCheck,
  Wrench,
} from "lucide-react";
import { KpiCard } from "../components/KpiCard";
import { StatusBadge } from "../components/StatusBadge";
import { formatMoney, getDriverName, getVehicleName, isLicenseExpired } from "../logic/rules";
import type { AppData } from "../types";

type DashboardProps = {
  data: AppData;
};

type AlertItem = {
  id: string;
  icon: typeof AlertTriangle;
  title: string;
  detail: string;
  severity: "critical" | "warning";
};

export function Dashboard({ data }: DashboardProps) {
  // ── Computed values ─────────────────────────────────────────
  const activeVehicles   = data.vehicles.filter((v) => v.status !== "Retired").length;
  const availableVehicles = data.vehicles.filter((v) => v.status === "Available").length;
  const inShop           = data.vehicles.filter((v) => v.status === "In Shop").length;
  const activeTrips      = data.trips.filter((t) => t.status === "Dispatched").length;
  const availableDrivers = data.drivers.filter((d) => d.status === "Available").length;
  const utilization      = activeVehicles ? Math.round((activeTrips / activeVehicles) * 100) : 0;
  const totalCost        = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  const liveTrips        = data.trips.filter((t) => t.status === "Dispatched");

  // ── Risk alerts — severity-tagged ───────────────────────────
  const alertItems: AlertItem[] = [
    // Critical: expired licenses
    ...data.drivers
      .filter((d) => isLicenseExpired(d))
      .map((d) => ({
        id: `lic-${d.id}`,
        icon: ShieldAlert,
        title: d.name,
        detail: `License expired ${d.licenseExpiryDate}`,
        severity: "critical" as const,
      })),
    // Warning: low safety score (non-expired only)
    ...data.drivers
      .filter((d) => !isLicenseExpired(d) && d.safetyScore < 70)
      .map((d) => ({
        id: `score-${d.id}`,
        icon: AlertTriangle,
        title: d.name,
        detail: `Safety score ${d.safetyScore}/100 — below threshold`,
        severity: "warning" as const,
      })),
    // Warning: active maintenance
    ...data.maintenanceLogs
      .filter((log) => log.status === "Active")
      .map((log) => ({
        id: `maint-${log.id}`,
        icon: Wrench,
        title: getVehicleName(data, log.vehicleId),
        detail: log.title,
        severity: "warning" as const,
      })),
  ].sort((a, b) => (a.severity === "critical" ? -1 : b.severity === "critical" ? 1 : 0));

  const criticalCount = alertItems.filter((a) => a.severity === "critical").length;
  const totalAlerts   = alertItems.length;

  return (
    <div className="page-stack">
      {/* ── KPI strip ───────────────────────────────────────── */}
      <section className="kpi-grid">
        <KpiCard
          accent="info"
          detail={`${availableVehicles} available`}
          icon={Truck}
          label="Active Vehicles"
          value={activeVehicles}
        />
        <KpiCard
          accent={inShop > 0 ? "warning" : "neutral"}
          detail="Blocked from dispatch"
          icon={Wrench}
          label="In Shop"
          value={inShop}
        />
        <KpiCard
          accent="info"
          detail={`${utilization}% fleet utilization`}
          icon={Route}
          label="Live Trips"
          value={activeTrips}
        />
        <KpiCard
          accent="positive"
          detail="Valid, available pool"
          icon={UserCheck}
          label="Drivers Ready"
          value={availableDrivers}
        />
        <KpiCard
          accent="neutral"
          detail="Fuel, tolls, maintenance"
          icon={CircleDollarSign}
          label="Operating Cost"
          value={formatMoney(totalCost)}
        />
      </section>

      {/* ── Live trips + Risk alerts ─────────────────────────── */}
      <div className="content-grid two">
        {/* Live Trips */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h2>Live Trips</h2>
              <p>Dispatched work currently consuming vehicles and drivers.</p>
            </div>
          </div>

          {liveTrips.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={26} className="empty-state-icon" />
              <p>No active trips right now</p>
              <small>Dispatch a trip from the Trips page to see it here.</small>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>Vehicle</th>
                    <th>Driver</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {liveTrips.map((trip) => (
                    <tr key={trip.id}>
                      <td>{trip.source} → {trip.destination}</td>
                      <td>{getVehicleName(data, trip.vehicleId)}</td>
                      <td>{getDriverName(data, trip.driverId)}</td>
                      <td><StatusBadge status={trip.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Risk Alerts */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h2>Risk Alerts</h2>
              <p>License, safety, and maintenance signals.</p>
            </div>
            <div className="panel-heading-meta">
              <span className={`alert-count${totalAlerts === 0 ? " zero" : ""}`}>
                {totalAlerts === 0 ? "✓" : totalAlerts}
              </span>
            </div>
          </div>

          {alertItems.length === 0 ? (
            <div className="empty-state">
              <CheckCircle
                size={26}
                className="empty-state-icon"
                style={{ color: "var(--accent)", opacity: 1 }}
              />
              <p>Fleet is clear</p>
              <small>No license, safety, or maintenance issues detected.</small>
            </div>
          ) : (
            <>
              <div className="alert-list">
                {alertItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div className={`alert-item ${item.severity}`} key={item.id}>
                      <Icon size={15} className="alert-icon" strokeWidth={2} />
                      <div>
                        <strong>{item.title}</strong>
                        <span>{item.detail}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {criticalCount > 0 && (
                <p style={{
                  color: "var(--badge-red-txt)",
                  fontSize: "0.72rem",
                  marginBottom: 0,
                  marginTop: "12px",
                }}>
                  {criticalCount} critical issue{criticalCount !== 1 ? "s" : ""} — action required before dispatch.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
