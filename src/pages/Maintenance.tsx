import { Check, Plus } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { formatMoney, getVehicleName } from "../logic/rules";
import type { AppData, MaintenanceLog } from "../types";
import { openMaintenanceApi, closeMaintenanceApi, fetchAppData } from "../logic/api";

type MaintenanceProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
};

export function Maintenance({ data, setData }: MaintenanceProps) {
  const eligibleVehicles = data.vehicles.filter((vehicle) => vehicle.status === "Available");

  async function reloadData() {
    try {
      const freshData = await fetchAppData();
      setData(freshData);
    } catch (e) {
      console.error(e);
    }
  }

  async function createMaintenance(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const vehicleId = String(form.get("vehicleId"));
    const title = String(form.get("title")).trim();
    const cost = Number(form.get("cost"));

    try {
      await openMaintenanceApi(vehicleId, title, cost);
      await reloadData();
      formElement.reset();
    } catch (error: any) {
      window.alert(error.message || "Failed to create log.");
    }
  }

  async function closeMaintenance(logId: string) {
    try {
      await closeMaintenanceApi(logId);
      await reloadData();
    } catch (error: any) {
      window.alert(error.message || "Failed to close log.");
    }
  }

  return (
    <div className="content-grid form-and-table">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Open Maintenance</h2>
            <p>Opening a log moves the vehicle to In Shop immediately.</p>
          </div>
        </div>
        <form className="form-grid" onSubmit={createMaintenance}>
          <label>
            Vehicle
            <select name="vehicleId" required>
              {eligibleVehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.registrationNumber} - {vehicle.model}
                </option>
              ))}
            </select>
          </label>
          <label>
            Work Required
            <input name="title" placeholder="Oil change" required />
          </label>
          <label>
            Estimated Cost
            <input name="cost" min="0" type="number" required />
          </label>
          <button className="primary-button" disabled={!eligibleVehicles.length} type="submit">
            <Plus size={16} />
            Create Log
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Maintenance Logs</h2>
            <p>Closing a log restores the vehicle to Available unless retired.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Work</th>
                <th>Cost</th>
                <th>Opened</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.maintenanceLogs.length === 0 ? (
                <tr>
                  <td className="empty-cell" colSpan={6}>No maintenance logs yet. Open a log to begin tracking vehicle service.</td>
                </tr>
              ) : (
                data.maintenanceLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{getVehicleName(data, log.vehicleId)}</td>
                    <td>{log.title}</td>
                    <td>{formatMoney(log.cost)}</td>
                    <td>{log.openedAt}</td>
                    <td><StatusBadge status={log.status} /></td>
                    <td>
                      <button className="small-button" disabled={log.status === "Closed"} onClick={() => closeMaintenance(log.id)} type="button">
                        <Check size={14} />
                        Close
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
