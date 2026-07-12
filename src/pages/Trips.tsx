import { Check, Play, Plus, Trash2, X } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { createTrip, dispatchTripApi, completeTripApi, cancelTripApi, deleteTripApi, fetchAppData } from "../logic/api";
import { getDriverName, getVehicleName } from "../logic/rules";
import type { AppData, Trip } from "../types";

type TripsProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
};

export function Trips({ data, setData }: TripsProps) {
  const [showModal, setShowModal] = useState(false);

  const availableVehicles = data.vehicles.filter((v) => v.status === "Available");
  const availableDrivers  = data.drivers.filter((d)  => d.status === "Available");

  async function reloadData() {
    try {
      const freshData = await fetchAppData();
      setData(freshData);
    } catch (e) {
      console.error(e);
    }
  }

  async function addTrip(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const tripInput = {
      id: crypto.randomUUID(),
      source: String(form.get("source")).trim(),
      destination: String(form.get("destination")).trim(),
      vehicleId: String(form.get("vehicleId")),
      driverId: String(form.get("driverId")),
      cargoWeightKg: Number(form.get("cargoWeightKg")),
      plannedDistanceKm: Number(form.get("plannedDistanceKm")),
      revenue: Number(form.get("revenue")),
    };
    setData((cur) => ({ ...cur, trips: [trip, ...cur.trips] }));
    event.currentTarget.reset();
    setShowModal(false);
  }

  function handleDispatch(tripId: string) {
    setData((cur) => {
      const result = dispatchTrip(cur, tripId);
      if (result.errors.length) window.alert(result.errors.join("\n"));
      return result.data;
    });
  }

  async function deleteTrip(tripId: string) {
    try {
      await deleteTripApi(tripId);
      await reloadData();
    } catch (error: any) {
      window.alert(error.message || "Failed to delete trip.");
    }
  }

  return (
    <div className="page-stack">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h2>Trip Dispatcher</h2>
          <p>On Complete: odometer → fuel log → expenses → Vehicle &amp; Driver Available</p>
        </div>
        <button
          className="primary-button"
          disabled={!canCreate}
          onClick={() => setShowModal(true)}
          title={canCreate ? undefined : "No available vehicles or drivers"}
          type="button"
        >
          <Plus size={13} />
          Create Trip
        </button>
      </div>

      {/* Table */}
      <div className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Trip</th>
                <th>Route</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Cargo</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.trips.length === 0 ? (
                <tr>
                  <td className="empty-cell" colSpan={6}>No trips yet. Create a draft trip to get started.</td>
                </tr>
              ) : (
                data.trips.map((trip) => (
                  <tr key={trip.id}>
                    <td>{trip.source} to {trip.destination}</td>
                    <td>{getVehicleName(data, trip.vehicleId)}</td>
                    <td>{getDriverName(data, trip.driverId)}</td>
                    <td>{trip.cargoWeightKg} kg</td>
                    <td><StatusBadge status={trip.status} /></td>
                    <td>
                      <div className="row-actions">
                        <button className="small-button" disabled={trip.status !== "Draft"} onClick={() => handleDispatch(trip.id)} type="button">
                          <Play size={14} />
                          Dispatch
                        </button>
                        <button className="small-button" disabled={trip.status !== "Dispatched"} onClick={() => handleComplete(trip.id)} type="button">
                          <Check size={14} />
                          Complete
                        </button>
                        <button className="small-button danger" disabled={trip.status === "Completed" || trip.status === "Cancelled"} onClick={() => handleCancel(trip.id)} type="button">
                          <X size={14} />
                          Cancel
                        </button>
                        <button className="small-button danger" disabled={trip.status !== "Draft"} onClick={() => deleteTrip(trip.id)} title="Delete draft" type="button">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Trip Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Create Trip</h3>
                <p>Draft trips are validated when dispatch starts.</p>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)} type="button">
                <X size={14} />
              </button>
            </div>
            <form className="form-grid" onSubmit={addTrip}>
              <label>
                Source
                <input name="source" placeholder="Gandhinagar Depot" required />
              </label>
              <label>
                Destination
                <input name="destination" placeholder="Ahmedabad Hub" required />
              </label>
              <label>
                Vehicle (Available only)
                <select name="vehicleId" required>
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} — {v.maxLoadKg} kg capacity
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Driver (Available only)
                <select name="driverId" required>
                  {availableDrivers.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Cargo Weight (kg)
                <input name="cargoWeightKg" min="1" placeholder="700" type="number" required />
              </label>
              <label>
                Planned Distance (km)
                <input name="plannedDistanceKm" min="1" placeholder="38" type="number" required />
              </label>
              <label>
                Revenue
                <input name="revenue" min="0" placeholder="5000" type="number" required />
              </label>
              <button className="primary-button" type="submit" style={{ marginTop: "4px" }}>
                <Plus size={13} />
                Add Draft Trip
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
