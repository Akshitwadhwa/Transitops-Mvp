import { Plus, Truck } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import type { AppData, Vehicle } from "../types";

type VehiclesProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
};

export function Vehicles({ data, setData }: VehiclesProps) {
  function addVehicle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const registrationNumber = String(form.get("registrationNumber")).trim().toUpperCase();
    if (data.vehicles.some((vehicle) => vehicle.registrationNumber === registrationNumber)) {
      window.alert("Registration number must be unique.");
      return;
    }

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
    event.currentTarget.reset();
  }

  return (
    <div className="content-grid form-and-table">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Register Vehicle</h2>
            <p>New vehicles enter the dispatch pool as Available.</p>
          </div>
        </div>
        <form className="form-grid" onSubmit={addVehicle}>
          <label>
            Registration Number
            <input name="registrationNumber" placeholder="DL-01-TA-4521" required />
          </label>
          <label>
            Model
            <input name="model" placeholder="Tata Ace Gold" required />
          </label>
          <label>
            Type
            <select name="type">
              <option>Mini Truck</option>
              <option>Van</option>
              <option>Truck</option>
              <option>Reefer</option>
            </select>
          </label>
          <label>
            Region
            <select name="region">
              <option>North</option>
              <option>South</option>
              <option>East</option>
              <option>West</option>
            </select>
          </label>
          <label>
            Max Load (kg)
            <input name="maxLoadKg" min="1" type="number" required />
          </label>
          <label>
            Odometer (km)
            <input name="odometerKm" min="0" type="number" required />
          </label>
          <label>
            Acquisition Cost
            <input name="acquisitionCost" min="1" type="number" required />
          </label>
          <button className="primary-button" type="submit">
            <Plus size={16} />
            Add Vehicle
          </button>
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
              </tr>
            </thead>
            <tbody>
              {data.vehicles.length === 0 ? (
                <tr className="empty-state-row">
                  <td colSpan={6}>
                    <div className="empty-state">
                      <Truck size={26} className="empty-state-icon" />
                      <p>No vehicles registered yet</p>
                      <small>Use the form to add your first vehicle to the fleet.</small>
                    </div>
                  </td>
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
