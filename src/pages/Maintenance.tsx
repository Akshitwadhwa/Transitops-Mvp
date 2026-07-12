import { useState } from "react";
import { Check, ClipboardList, Plus, X } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { formatMoney, getVehicleName } from "../logic/rules";
import type { AppData, MaintenanceLog } from "../types";

type MaintenanceProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
};

export function Maintenance({ data, setData }: MaintenanceProps) {
  const [showModal, setShowModal] = useState(false);

  const eligibleVehicles = data.vehicles.filter((v) => v.status === "Available");

  function createMaintenance(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const vehicleId = String(form.get("vehicleId"));
    const log: MaintenanceLog = {
      id: crypto.randomUUID(),
      vehicleId,
      title: String(form.get("title")).trim(),
      cost: Number(form.get("cost")),
      openedAt: new Date().toISOString().slice(0, 10),
      status: "Active",
    };
    setData((cur) => ({
      ...cur,
      maintenanceLogs: [log, ...cur.maintenanceLogs],
      expenses: [
        { id: crypto.randomUUID(), vehicleId, type: "Maintenance", amount: log.cost, date: log.openedAt },
        ...cur.expenses,
      ],
      vehicles: cur.vehicles.map((v) =>
        v.id === vehicleId ? { ...v, status: "In Shop" as const } : v
      ),
    }));
    event.currentTarget.reset();
    setShowModal(false);
  }

  function closeMaintenance(logId: string) {
    setData((cur) => {
      const log = cur.maintenanceLogs.find((l) => l.id === logId);
      if (!log) return cur;
      return {
        ...cur,
        maintenanceLogs: cur.maintenanceLogs.map((l) =>
          l.id === logId ? { ...l, status: "Closed" as const } : l
        ),
        vehicles: cur.vehicles.map((v) =>
          v.id === log.vehicleId && v.status !== "Retired"
            ? { ...v, status: "Available" as const }
            : v
        ),
      };
    });
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Maintenance Logs</h2>
          <p>Opening a log moves the vehicle to In Shop · Closing restores it to Available</p>
        </div>
        <button
          className="primary-button"
          disabled={!eligibleVehicles.length}
          onClick={() => setShowModal(true)}
          title={!eligibleVehicles.length ? "No available vehicles" : undefined}
          type="button"
        >
          <Plus size={13} />
          Open Log
        </button>
      </div>

      <div className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Work Required</th>
                <th>Cost</th>
                <th>Opened</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.maintenanceLogs.length === 0 ? (
                <tr className="empty-state-row">
                  <td colSpan={6}>
                    <div className="empty-state">
                      <ClipboardList size={24} className="empty-state-icon" />
                      <p>No maintenance logs</p>
                      <small>Open a log to move a vehicle into shop status.</small>
                    </div>
                  </td>
                </tr>
              ) : (
                data.maintenanceLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 600, color: "var(--text-1)" }}>{getVehicleName(data, log.vehicleId)}</td>
                    <td>{log.title}</td>
                    <td>{formatMoney(log.cost)}</td>
                    <td>{log.openedAt}</td>
                    <td><StatusBadge status={log.status} /></td>
                    <td>
                      <button
                        className="small-button"
                        disabled={log.status === "Closed"}
                        onClick={() => closeMaintenance(log.id)}
                        type="button"
                      >
                        <Check size={12} />
                        Close
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Open Maintenance Log</h3>
                <p>Opening a log moves the vehicle to In Shop immediately.</p>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)} type="button">
                <X size={14} />
              </button>
            </div>
            <form className="form-grid" onSubmit={createMaintenance}>
              <label>
                Vehicle
                <select name="vehicleId" required>
                  {eligibleVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} — {v.model}
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
                <input name="cost" min="0" placeholder="5000" type="number" required />
              </label>
              <button className="primary-button" type="submit" style={{ marginTop: "4px" }}>
                <Plus size={13} />
                Create Log
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
