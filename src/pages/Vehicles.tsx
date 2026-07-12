import { useState } from "react";
import { Plus, Truck, X } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import type { AppData, Vehicle } from "../types";

import { createVehicle } from "../logic/api";

type VehiclesProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
};

export function Vehicles({ data, setData }: VehiclesProps) {
  const [showModal, setShowModal] = useState(false);

  function addVehicle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const registrationNumber = String(form.get("registrationNumber")).trim().toUpperCase();
    if (data.vehicles.some((v) => v.registrationNumber === registrationNumber)) {
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
    };
    setData((cur) => ({ ...cur, vehicles: [vehicle, ...cur.vehicles] }));
    event.currentTarget.reset();
    setShowModal(false);
  }

  return (
    <div className="page-stack">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h2>Vehicle Registry</h2>
          <p>Registration No. must be unique · Retired/In Shop vehicles are hidden from Trip Dispatcher</p>
        </div>
        <button className="primary-button" onClick={() => setShowModal(true)} type="button">
          <Plus size={13} />
          Add Vehicle
        </button>
      </div>

      {/* Table */}
      <div className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Reg. No. (Unique)</th>
                <th>Name / Model</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Odometer</th>
                <th>Acq. Cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.vehicles.length === 0 ? (
                <tr>
                  <td className="empty-cell" colSpan={6}>No vehicles registered yet. Add your first vehicle using the form.</td>
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
      </div>

      {/* Add Vehicle Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Register Vehicle</h3>
                <p>New vehicles enter the dispatch pool as Available.</p>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)} type="button">
                <X size={14} />
              </button>
            </div>
            <form className="form-grid" onSubmit={addVehicle}>
              <label>
                Registration Number
                <input name="registrationNumber" placeholder="GJ01AB452" required />
              </label>
              <label>
                Model
                <input name="model" placeholder="VAN-05" required />
              </label>
              <label>
                Type
                <select name="type">
                  <option>Van</option>
                  <option>Truck</option>
                  <option>Mini Truck</option>
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
                <input name="maxLoadKg" min="1" placeholder="500" type="number" required />
              </label>
              <label>
                Odometer (km)
                <input name="odometerKm" min="0" placeholder="74000" type="number" required />
              </label>
              <label>
                Acquisition Cost
                <input name="acquisitionCost" min="1" placeholder="620000" type="number" required />
              </label>
              <button className="primary-button" type="submit" style={{ marginTop: "4px" }}>
                <Plus size={13} />
                Register Vehicle
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
