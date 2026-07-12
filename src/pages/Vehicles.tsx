import { Edit2, Plus } from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "../components/StatusBadge";
import type { AppData, Vehicle } from "../types";

type VehiclesProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
};

export function Vehicles({ data, setData }: VehiclesProps) {
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const registrationNumber = String(form.get("registrationNumber")).trim().toUpperCase();

    if (
      data.vehicles.some(
        (vehicle) => vehicle.registrationNumber === registrationNumber && vehicle.id !== editingVehicle?.id,
      )
    ) {
      window.alert("Registration number must be unique.");
      return;
    }

    if (editingVehicle) {
      setData((current) => ({
        ...current,
        vehicles: current.vehicles.map((v) =>
          v.id === editingVehicle.id
            ? {
                ...v,
                registrationNumber,
                model: String(form.get("model")).trim(),
                type: String(form.get("type")) as Vehicle["type"],
                region: String(form.get("region")) as Vehicle["region"],
                maxLoadKg: Number(form.get("maxLoadKg")),
                odometerKm: Number(form.get("odometerKm")),
                acquisitionCost: Number(form.get("acquisitionCost")),
                status: (form.get("status") as Vehicle["status"]) ?? v.status,
              }
            : v,
        ),
      }));
      setEditingVehicle(null);
    } else {
      const vehicle: Vehicle = {
        id: crypto.randomUUID(),
        registrationNumber,
        model: String(form.get("model")).trim(),
        type: String(form.get("type")) as Vehicle["type"],
        region: String(form.get("region")) as Vehicle["region"],
        maxLoadKg: Number(form.get("maxLoadKg")),
        odometerKm: Number(form.get("odometerKm")),
        acquisitionCost: Number(form.get("acquisitionCost")),
        status: "Available",
      };
      setData((current) => ({ ...current, vehicles: [vehicle, ...current.vehicles] }));
    }
    event.currentTarget.reset();
  }

  return (
    <div className="content-grid form-and-table">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>{editingVehicle ? "Edit Vehicle" : "Register Vehicle"}</h2>
            <p>
              {editingVehicle
                ? "Update vehicle properties and status."
                : "New vehicles enter the dispatch pool as Available."}
            </p>
          </div>
        </div>
        <form key={editingVehicle ? editingVehicle.id : "add"} className="form-grid" onSubmit={handleSubmit}>
          <label>
            Registration Number
            <input
              name="registrationNumber"
              defaultValue={editingVehicle?.registrationNumber}
              placeholder="DL-01-TA-4521"
              required
            />
          </label>
          <label>
            Model
            <input
              name="model"
              defaultValue={editingVehicle?.model}
              placeholder="Tata Ace Gold"
              required
            />
          </label>
          <label>
            Type
            <select name="type" defaultValue={editingVehicle?.type ?? "Mini Truck"}>
              <option>Mini Truck</option>
              <option>Van</option>
              <option>Truck</option>
              <option>Reefer</option>
            </select>
          </label>
          <label>
            Region
            <select name="region" defaultValue={editingVehicle?.region ?? "North"}>
              <option>North</option>
              <option>South</option>
              <option>East</option>
              <option>West</option>
            </select>
          </label>
          <label>
            Max Load (kg)
            <input
              name="maxLoadKg"
              defaultValue={editingVehicle?.maxLoadKg}
              min="1"
              type="number"
              required
            />
          </label>
          <label>
            Odometer (km)
            <input
              name="odometerKm"
              defaultValue={editingVehicle?.odometerKm}
              min="0"
              type="number"
              required
            />
          </label>
          <label>
            Acquisition Cost
            <input
              name="acquisitionCost"
              defaultValue={editingVehicle?.acquisitionCost}
              min="1"
              type="number"
              required
            />
          </label>
          {editingVehicle && (
            <label>
              Status
              <select name="status" defaultValue={editingVehicle.status}>
                <option value="Available">Available</option>
                <option value="On Trip" disabled={editingVehicle.status !== "On Trip"}>On Trip</option>
                <option value="In Shop">In Shop</option>
                <option value="Retired">Retired</option>
              </select>
            </label>
          )}
          {editingVehicle ? (
            <div className="row-actions" style={{ display: "flex", gap: "8px" }}>
              <button className="primary-button" type="submit" style={{ flex: 1 }}>
                Save Changes
              </button>
              <button
                className="ghost-button"
                onClick={() => setEditingVehicle(null)}
                type="button"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button className="primary-button" type="submit">
              <Plus size={16} />
              Add Vehicle
            </button>
          )}
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
              {data.vehicles.map((vehicle) => (
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
                      type="button"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

