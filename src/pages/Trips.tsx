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
  const availableVehicles = data.vehicles.filter((vehicle) => vehicle.status === "Available");
  const availableDrivers = data.drivers.filter((driver) => driver.status === "Available");

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

    try {
      await createTrip(tripInput);
      await reloadData();
      formElement.reset();
    } catch (error: any) {
      window.alert(error.message || "Failed to create trip.");
    }
  }

  async function handleDispatch(tripId: string) {
    try {
      await dispatchTripApi(tripId);
      await reloadData();
    } catch (error: any) {
      window.alert(error.message || "Failed to dispatch trip.");
    }
  }

  async function handleComplete(tripId: string) {
    try {
      await completeTripApi(tripId);
      await reloadData();
    } catch (error: any) {
      window.alert(error.message || "Failed to complete trip.");
    }
  }

  async function handleCancel(tripId: string) {
    try {
      await cancelTripApi(tripId);
      await reloadData();
    } catch (error: any) {
      window.alert(error.message || "Failed to cancel trip.");
    }
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
    <div className="content-grid form-and-table">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Create Trip</h2>
            <p>Draft trips are validated when dispatch starts.</p>
          </div>
        </div>
        <form className="form-grid" onSubmit={addTrip}>
          <label>
            Source
            <input name="source" placeholder="Delhi Depot" required />
          </label>
          <label>
            Destination
            <input name="destination" placeholder="Noida Retail Park" required />
          </label>
          <label>
            Vehicle
            <select name="vehicleId" required>
              {availableVehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.registrationNumber} - {vehicle.maxLoadKg} kg
                </option>
              ))}
            </select>
          </label>
          <label>
            Driver
            <select name="driverId" required>
              {availableDrivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Cargo Weight (kg)
            <input name="cargoWeightKg" min="1" type="number" required />
          </label>
          <label>
            Planned Distance (km)
            <input name="plannedDistanceKm" min="1" type="number" required />
          </label>
          <label>
            Revenue
            <input name="revenue" min="0" type="number" required />
          </label>
          <button className="primary-button" disabled={!availableVehicles.length || !availableDrivers.length} type="submit">
            <Plus size={16} />
            Add Draft Trip
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Trip Management</h2>
            <p>Dispatch updates vehicle and driver status automatically.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
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
      </section>
    </div>
  );
}
