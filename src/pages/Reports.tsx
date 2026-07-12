import { formatMoney } from "../logic/rules";
import type { AppData } from "../types";

type ReportsProps = {
  data: AppData;
};

export function Reports({ data }: ReportsProps) {
  const maxCost = Math.max(...data.vehicles.map((vehicle) => vehicleCost(data, vehicle.id)), 1);
  const completedRevenue = data.trips
    .filter((trip) => trip.status === "Completed" || trip.status === "Dispatched")
    .reduce((sum, trip) => sum + trip.revenue, 0);
  const totalCost = data.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const roi = totalCost ? Math.round(((completedRevenue - totalCost) / totalCost) * 100) : 0;

  return (
    <div className="page-stack">
      <section className="content-grid three">
        <div className="metric-panel">
          <span>Revenue Tracked</span>
          <strong>{formatMoney(completedRevenue)}</strong>
        </div>
        <div className="metric-panel">
          <span>Operational Cost</span>
          <strong>{formatMoney(totalCost)}</strong>
        </div>
        <div className="metric-panel">
          <span>Simple ROI</span>
          <strong>{roi}%</strong>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Vehicle Cost Breakdown</h2>
            <p>Fuel, toll, and maintenance spend grouped by vehicle.</p>
          </div>
        </div>
        <div className="bar-list">
          {data.vehicles.map((vehicle) => {
            const cost = vehicleCost(data, vehicle.id);
            return (
              <div className="bar-row" key={vehicle.id}>
                <div>
                  <strong>{vehicle.registrationNumber}</strong>
                  <span>{vehicle.model}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${Math.max((cost / maxCost) * 100, 4)}%` }} />
                </div>
                <strong>{formatMoney(cost)}</strong>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Fleet Utilization Snapshot</h2>
            <p>Status distribution for operations review.</p>
          </div>
        </div>
        <div className="status-grid">
          {["Available", "On Trip", "In Shop", "Retired"].map((status) => (
            <div className="status-tile" key={status}>
              <span>{status}</span>
              <strong>{data.vehicles.filter((vehicle) => vehicle.status === status).length}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function vehicleCost(data: AppData, vehicleId: string) {
  return data.expenses
    .filter((expense) => expense.vehicleId === vehicleId)
    .reduce((sum, expense) => sum + expense.amount, 0);
}
