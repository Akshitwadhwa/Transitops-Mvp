import { AlertTriangle, CircleDollarSign, Route, Truck, UserCheck, Wrench } from "lucide-react";
import { KpiCard } from "../components/KpiCard";
import { StatusBadge } from "../components/StatusBadge";
import { formatMoney, getDriverName, getVehicleName, isLicenseExpired } from "../logic/rules";
import type { AppData } from "../types";

type DashboardProps = {
  data: AppData;
};

export function Dashboard({ data }: DashboardProps) {
  const activeVehicles = data.vehicles.filter((vehicle) => vehicle.status !== "Retired").length;
  const availableVehicles = data.vehicles.filter((vehicle) => vehicle.status === "Available").length;
  const inShop = data.vehicles.filter((vehicle) => vehicle.status === "In Shop").length;
  const activeTrips = data.trips.filter((trip) => trip.status === "Dispatched").length;
  const availableDrivers = data.drivers.filter((driver) => driver.status === "Available").length;
  const utilization = activeVehicles ? Math.round((activeTrips / activeVehicles) * 100) : 0;
  const totalCost = data.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const licenseAlerts = data.drivers.filter((driver) => isLicenseExpired(driver) || driver.safetyScore < 70);

  return (
    <div className="page-stack">
      <section className="kpi-grid">
        <KpiCard label="Active Vehicles" value={activeVehicles} detail={`${availableVehicles} available`} icon={Truck} />
        <KpiCard label="Vehicles In Shop" value={inShop} detail="Hidden from dispatch" icon={Wrench} />
        <KpiCard label="Active Trips" value={activeTrips} detail={`${utilization}% utilization`} icon={Route} />
        <KpiCard label="Drivers Ready" value={availableDrivers} detail="Valid and available pool" icon={UserCheck} />
        <KpiCard label="Operating Cost" value={formatMoney(totalCost)} detail="Fuel, tolls, maintenance" icon={CircleDollarSign} />
      </section>

      <section className="content-grid two">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h2>Live Trips</h2>
              <p>Dispatched work currently consuming vehicles and drivers.</p>
            </div>
          </div>
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
                {data.trips
                  .filter((trip) => trip.status === "Dispatched")
                  .map((trip) => (
                    <tr key={trip.id}>
                      <td>{trip.source} to {trip.destination}</td>
                      <td>{getVehicleName(data, trip.vehicleId)}</td>
                      <td>{getDriverName(data, trip.driverId)}</td>
                      <td><StatusBadge status={trip.status} /></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel alert-panel">
          <div className="panel-heading">
            <div>
              <h2>Risk Alerts</h2>
              <p>License, safety, and maintenance signals for the demo.</p>
            </div>
          </div>
          <div className="alert-list">
            {licenseAlerts.map((driver) => (
              <div className="alert-item" key={driver.id}>
                <AlertTriangle size={18} />
                <div>
                  <strong>{driver.name}</strong>
                  <span>
                    {isLicenseExpired(driver) ? "License expired" : `Safety score ${driver.safetyScore}`}
                  </span>
                </div>
              </div>
            ))}
            {data.maintenanceLogs
              .filter((item) => item.status === "Active")
              .map((item) => (
                <div className="alert-item" key={item.id}>
                  <Wrench size={18} />
                  <div>
                    <strong>{getVehicleName(data, item.vehicleId)}</strong>
                    <span>{item.title}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
