import { BarChart2, TrendingUp } from "lucide-react";
import { formatMoney } from "../logic/rules";
import type { AppData } from "../types";

type ReportsProps = {
  data: AppData;
};

const UTILIZATION_TILES = [
  { status: "Available", accent: "positive" },
  { status: "On Trip",   accent: "active"   },
  { status: "In Shop",   accent: "warning"  },
  { status: "Retired",   accent: "negative" },
] as const;

function vehicleCost(data: AppData, vehicleId: string): number {
  return data.expenses
    .filter((e) => e.vehicleId === vehicleId)
    .reduce((sum, e) => sum + e.amount, 0);
}

export function Reports({ data }: ReportsProps) {
  // ── Summary metrics ──────────────────────────────────────────
  const completedRevenue = data.trips
    .filter((t) => t.status === "Completed" || t.status === "Dispatched")
    .reduce((sum, t) => sum + t.revenue, 0);
  const totalCost = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  const roi = totalCost
    ? Math.round(((completedRevenue - totalCost) / totalCost) * 100)
    : 0;

  // ── Vehicle costs — sorted descending ───────────────────────
  const vehicleCosts = data.vehicles
    .map((v) => ({ vehicle: v, cost: vehicleCost(data, v.id) }))
    .sort((a, b) => b.cost - a.cost);

  const maxCost = Math.max(...vehicleCosts.map((vc) => vc.cost), 1);
  const hasExpenses = data.expenses.length > 0;

  return (
    <div className="page-stack">
      {/* ── Summary metrics ─────────────────────────────────── */}
      <div className="content-grid three">
        <div className="metric-panel">
          <span className="metric-panel-label">Revenue Tracked</span>
          <strong className="metric-panel-value">{formatMoney(completedRevenue)}</strong>
          <span className="metric-panel-context">Completed &amp; active trips</span>
          <div className="chart-placeholder" data-chart="revenue-trend">
            <TrendingUp size={13} />
            Revenue trend preview
          </div>
        </div>

        <div className="metric-panel">
          <span className="metric-panel-label">Operational Cost</span>
          <strong className="metric-panel-value">{formatMoney(totalCost)}</strong>
          <span className="metric-panel-context">Fuel, toll &amp; maintenance</span>
          <div className="chart-placeholder" data-chart="cost-trend">
            <TrendingUp size={13} />
            Cost trend preview
          </div>
        </div>

        <div className="metric-panel">
          <span className="metric-panel-label">Simple ROI</span>
          <strong
            className="metric-panel-value"
            style={{ color: roi >= 0 ? "var(--accent)" : "var(--badge-red-txt)" }}
          >
            {roi >= 0 ? "+" : ""}{roi}%
          </strong>
          <span className="metric-panel-context">(Revenue − Cost) ÷ Cost</span>
          <div className="chart-placeholder" data-chart="roi-trend">
            <TrendingUp size={13} />
            ROI trend preview
          </div>
        </div>
      </div>

      {/* ── Vehicle cost breakdown ───────────────────────────── */}
      <div className="panel">
        <div className="panel-heading">
          <div>
            <h2>Vehicle Cost Breakdown</h2>
            <p>Fuel, toll, and maintenance spend per vehicle — sorted highest first.</p>
          </div>
        </div>

        {!hasExpenses ? (
          <div className="empty-state">
            <BarChart2 size={26} className="empty-state-icon" />
            <p>No expense data yet</p>
            <small>Log expenses from the Expenses page to populate this chart.</small>
          </div>
        ) : (
          <div className="bar-list">
            {/* Column headers */}
            <div className="bar-list-header" aria-hidden="true">
              <span>Vehicle</span>
              <span className="bar-track-header">Cost share</span>
              <span>Total</span>
            </div>

            {vehicleCosts.map(({ vehicle, cost }) => (
              <div className="bar-row" key={vehicle.id}>
                <div className="bar-row-label">
                  <strong>{vehicle.registrationNumber}</strong>
                  <span>{vehicle.model}</span>
                </div>
                <div className="bar-track" title={`${Math.round((cost / maxCost) * 100)}% of fleet max`}>
                  <div
                    className="bar-fill"
                    style={{ width: `${Math.max((cost / maxCost) * 100, 2)}%` }}
                  />
                </div>
                <span className="bar-cost">{formatMoney(cost)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Fleet utilization snapshot ───────────────────────── */}
      <div className="panel">
        <div className="panel-heading">
          <div>
            <h2>Fleet Utilization Snapshot</h2>
            <p>Current status distribution across all registered vehicles.</p>
          </div>
        </div>

        {data.vehicles.length === 0 ? (
          <div className="empty-state">
            <BarChart2 size={26} className="empty-state-icon" />
            <p>No vehicles registered</p>
            <small>Add vehicles to see utilization data.</small>
          </div>
        ) : (
          <div className="status-grid">
            {UTILIZATION_TILES.map(({ status, accent }) => (
              <div className={`status-tile ${accent}`} key={status}>
                <span>{status}</span>
                <strong>{data.vehicles.filter((v) => v.status === status).length}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
