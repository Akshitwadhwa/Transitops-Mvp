import { useState } from "react";
import { Edit2, Plus, X } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import type { AppData, Vehicle } from "../types";
import { createVehicle, updateVehicleApi } from "../logic/api";

type VehiclesProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
};

export function Vehicles({ data, setData }: VehiclesProps) {
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const registrationNumber = String(form.get("registrationNumber")).trim().toUpperCase();

    // Check duplicate only for new vehicles
    if (!editingVehicle && data.vehicles.some((vehicle) => vehicle.registrationNumber === registrationNumber)) {
      window.alert("Registration number must be unique.");
      return;
    }

    const vehicleInput = {
      id: editingVehicle ? editingVehicle.id : crypto.randomUUID(),
      registrationNumber,
      model: String(form.get("model")).trim(),
      type: String(form.get("type")) as Vehicle["type"],
      region: String(form.get("region")) as Vehicle["region"],
      maxLoadKg: Number(form.get("maxLoadKg")),
      odometerKm: Number(form.get("odometerKm")),
      acquisitionCost: Number(form.get("acquisitionCost")),
      status: editingVehicle ? (String(form.get("status")) as Vehicle["status"]) : undefined,
    };

    try {
      if (editingVehicle) {
        const updated = await updateVehicleApi(editingVehicle.id, vehicleInput);
        setData((current) => ({
          ...current,
          vehicles: current.vehicles.map((v) => (v.id === editingVehicle.id ? updated : v)),
        }));
        setEditingVehicle(null);
      } else {
        const savedVehicle = await createVehicle(vehicleInput);
        setData((current) => ({ ...current, vehicles: [savedVehicle, ...current.vehicles] }));
      }
      formElement.reset();
    } catch (error: any) {
      window.alert(error.message || "Failed to save vehicle.");
    }
  }

  return (
    <div className="content-grid form-and-table">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>{editingVehicle ? "Edit Vehicle" : "Register Vehicle"}</h2>
            <p>
              {editingVehicle
                ? `Editing ${editingVehicle.registrationNumber}`
                : "New vehicles enter the dispatch pool as Available."}
            </p>
          </div>
        </div>
        <form className="form-grid" key={editingVehicle?.id || "new"} onSubmit={handleFormSubmit}>
          <label>
            Registration Number
            <input
              defaultValue={editingVehicle?.registrationNumber || ""}
              disabled={!!editingVehicle}
              name="registrationNumber"
              placeholder="DL-01-TA-4521"
              required
            />
          </label>
          <label>
            Model
            <input
              defaultValue={editingVehicle?.model || ""}
              name="model"
              placeholder="Tata Ace Gold"
              required
            />
          </label>
          <label>
            Type
            <select defaultValue={editingVehicle?.type || "Mini Truck"} name="type">
              <option>Mini Truck</option>
              <option>Van</option>
              <option>Truck</option>
              <option>Reefer</option>
            </select>
          </label>
          <label>
            Region
            <select defaultValue={editingVehicle?.region || "North"} name="region">
              <option>North</option>
              <option>South</option>
              <option>East</option>
              <option>West</option>
            </select>
          </label>
          <label>
            Max Load (kg)
            <input
              defaultValue={editingVehicle?.maxLoadKg || ""}
              min="1"
              name="maxLoadKg"
              type="number"
              required
            />
          </label>
          <label>
            Odometer (km)
            <input
              defaultValue={editingVehicle?.odometerKm || ""}
              min="0"
              name="odometerKm"
              type="number"
              required
            />
          </label>
          <label>
            Acquisition Cost
            <input
              defaultValue={editingVehicle?.acquisitionCost || ""}
              min="1"
              name="acquisitionCost"
              type="number"
              required
            />
          </label>
          {editingVehicle && (
            <label>
              Status
              <select defaultValue={editingVehicle.status} name="status">
                <option>Available</option>
                <option>On Trip</option>
                <option>In Shop</option>
                <option>Retired</option>
              </select>
            </label>
          )}
          <div className="form-buttons">
            <button className="primary-button" type="submit">
              {editingVehicle ? <Edit2 size={16} /> : <Plus size={16} />}
              {editingVehicle ? "Save Changes" : "Add Vehicle"}
            </button>
            {editingVehicle && (
              <button
                className="secondary-button ghost-button"
                onClick={() => setEditingVehicle(null)}
                type="button"
              >
                <X size={16} />
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Vehicle Registry</h2>
            <p>Retired and in-shop vehicles are blocked from dispatch.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Registration</th>
                <th>Model</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Region</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.vehicles.length === 0 ? (
                <tr>
                  <td className="empty-cell" colSpan={7}>No vehicles registered yet. Add your first vehicle using the form.</td>
                </tr>
              ) : (
                data.vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.registrationNumber}</td>
                    <td>{vehicle.model}</td>
                    <td>{vehicle.type}</td>
                    <td>{vehicle.maxLoadKg} kg</td>
                    <td>{vehicle.region}</td>
                    <td><StatusBadge status={vehicle.status} /></td>
                    <td>
                      <button
                        className="small-button"
                        onClick={() => setEditingVehicle(vehicle)}
                        title="Edit vehicle"
                        type="button"
                      >
                        <Edit2 size={14} />
                        Edit
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
