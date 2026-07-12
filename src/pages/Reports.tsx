import { BarChart2, TrendingUp } from "lucide-react";
import { formatMoney } from "../logic/rules";
import type { AppData } from "../types";

type ReportsProps = {
  data: AppData;
};

// Status tile metadata: CSS accent class + display label
const UTILIZATION_TILES = [
  { status: "Available", accent: "positive" },
  { status: "On Trip",   accent: "active"   },
  { status: "In Shop",   accent: "warning"  },
  { status: "Retired",   accent: "negative" },
] as const;

export function Reports({ data }: ReportsProps) {
  const completedRevenue = data.trips
    .filter((trip) => trip.status === "Completed" || trip.status === "Dispatched")
    .reduce((sum, trip) => sum + trip.revenue, 0);
  const totalCost = data.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const roi = totalCost ? Math.round(((completedRevenue - totalCost) / totalCost) * 100) : 0;

  // Sort vehicles by cost descending for the bar chart
  const vehicleCosts = data.vehicles
    .map((vehicle) => ({ vehicle, cost: vehicleCost(data, vehicle.id) }))
    .sort((a, b) => b.cost - a.cost);

  const maxCost = Math.max(...vehicleCosts.map((vc) => vc.cost), 1);
  const hasExpenses = data.expenses.length > 0;

  return (
    <div className="page-stack">
      {/* ── Summary Metrics ──────────────────────────────────── */}
      <section className="content-grid three">
        {/* Revenue */}
        <div className="metric-panel">
          <span className="metric-panel-label">Revenue Tracked</span>
          <strong className="metric-panel-value">{formatMoney(completedRevenue)}</strong>
          <span className="metric-panel-context">From completed &amp; active trips</span>
          {/* Chart drop-in zone — replace <div> content with <AreaChart /> later */}
          <div className="chart-placeholder" data-chart="revenue-trend">
            <TrendingUp size={14} />
            Chart available after Recharts integration
          </div>
        </div>

        {/* Cost */}
        <div className="metric-panel">
          <span className="metric-panel-label">Operational Cost</span>
          <strong className="metric-panel-value">{formatMoney(totalCost)}</strong>
          <span className="metric-panel-context">Fuel, toll &amp; maintenance spend</span>
          <div className="chart-placeholder" data-chart="cost-trend">
            <TrendingUp size={14} />
            Chart available after Recharts integration
          </div>
        </div>

        {/* ROI */}
        <div className="metric-panel">
          <span className="metric-panel-label">Simple ROI</span>
          <strong
            className="metric-panel-value"
            style={{ color: roi >= 0 ? "var(--clr-positive-text)" : "var(--clr-negative-text)" }}
          >
            {roi >= 0 ? "+" : ""}
            {roi}%
          </strong>
          <span className="metric-panel-context">(Revenue − Cost) ÷ Cost</span>
          <div className="chart-placeholder" data-chart="roi-trend">
            <TrendingUp size={14} />
            Chart available after Recharts integration
          </div>
        </div>
      </section>

      {/* ── Vehicle Cost Breakdown ───────────────────────────── */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Vehicle Cost Breakdown</h2>
            <p>Fuel, toll, and maintenance spend grouped by vehicle — sorted high to low.</p>
          </div>
        </div>

        {!hasExpenses ? (
          <div className="empty-state">
            <BarChart2 size={28} className="empty-state-icon" />
            <p>No expense data yet</p>
            <small>Log expenses from the Expenses page to see vehicle cost breakdown here.</small>
          </div>
        ) : (
          <div className="bar-list">
            {/* Column headers */}
            <div className="bar-list-header" aria-hidden="true">
              <span>Vehicle</span>
              <span className="bar-track-header">Cost share</span>
              <span style={{ textAlign: "right" }}>Total</span>
            </div>

            {vehicleCosts.map(({ vehicle, cost }) => {
              const pct = Math.max((cost / maxCost) * 100, 2);
              return (
                <div className="bar-row" key={vehicle.id}>
                  <div className="bar-row-label">
                    <strong>{vehicle.registrationNumber}</strong>
                    <span>{vehicle.model}</span>
                  </div>
                  <div className="bar-track" title={`${Math.round(pct)}% of max`}>
                    <div className="bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="bar-cost">{formatMoney(cost)}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Fleet Utilization Snapshot ───────────────────────── */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Fleet Utilization Snapshot</h2>
            <p>Current status distribution across all registered vehicles.</p>
          </div>
        </div>

        {data.vehicles.length === 0 ? (
          <div className="empty-state">
            <BarChart2 size={28} className="empty-state-icon" />
            <p>No vehicles registered</p>
            <small>Add vehicles from the Vehicles page to see utilization data.</small>
          </div>
        ) : (
          <div className="status-grid">
            {UTILIZATION_TILES.map(({ status, accent }) => {
              const count = data.vehicles.filter((v) => v.status === status).length;
              return (
                <div className={`status-tile ${accent}`} key={status}>
                  <span>{status}</span>
                  <strong>{count}</strong>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function vehicleCost(data: AppData, vehicleId: string) {
  return data.expenses
    .filter((expense) => expense.vehicleId === vehicleId)
    .reduce((sum, expense) => sum + expense.amount, 0);
}
