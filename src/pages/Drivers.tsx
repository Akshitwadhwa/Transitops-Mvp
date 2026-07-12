import { useState } from "react";
import { Plus, UserRound, X } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { isLicenseExpired } from "../logic/rules";
import type { AppData, Driver } from "../types";

import { createDriver } from "../logic/api";

type DriversProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
};

export function Drivers({ data, setData }: DriversProps) {
  const [showModal, setShowModal] = useState(false);

  function addDriver(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const licenseNumber = String(form.get("licenseNumber")).trim().toUpperCase();
    if (data.drivers.some((d) => d.licenseNumber === licenseNumber)) {
      window.alert("License number must be unique.");
      return;
    }
    const driver: Driver = {
      id: crypto.randomUUID(),
      name: String(form.get("name")).trim(),
      licenseNumber,
      licenseCategory: String(form.get("licenseCategory")) as Driver["licenseCategory"],
      licenseExpiryDate: String(form.get("licenseExpiryDate")),
      contactNumber: String(form.get("contactNumber")).trim(),
      safetyScore: Number(form.get("safetyScore")),
    };
    setData((cur) => ({ ...cur, drivers: [driver, ...cur.drivers] }));
    event.currentTarget.reset();
    setShowModal(false);
  }

  return (
    <div className="page-stack">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h2>Drivers &amp; Safety Profiles</h2>
          <p>Rule: Expired license or Suspended status → blocked from trip assignment</p>
        </div>
        <button className="primary-button" onClick={() => setShowModal(true)} type="button">
          <Plus size={13} />
          Add Driver
        </button>
      </div>

      {/* Table */}
      <div className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Driver</th>
                <th>License No.</th>
                <th>Category</th>
                <th>Expiry</th>
                <th>Contact</th>
                <th>Safety</th>
                <th>Status</th>
                <th>Compliance</th>
              </tr>
            </thead>
            <tbody>
              {data.drivers.length === 0 ? (
                <tr>
                  <td className="empty-cell" colSpan={6}>No drivers added yet. Register your first driver using the form.</td>
                </tr>
              ) : (
                data.drivers.map((driver) => (
                  <tr key={driver.id}>
                    <td>{driver.name}</td>
                    <td>{driver.licenseNumber}</td>
                    <td>{driver.licenseExpiryDate}</td>
                    <td>{driver.safetyScore}</td>
                    <td><StatusBadge status={driver.status} /></td>
                    <td><StatusBadge status={isLicenseExpired(driver) ? "Expired" : "Valid"} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Driver Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Add Driver</h3>
                <p>Expired licenses and suspended drivers are blocked at dispatch.</p>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)} type="button">
                <X size={14} />
              </button>
            </div>
            <form className="form-grid" onSubmit={addDriver}>
              <label>
                Name
                <input name="name" placeholder="Aman Verma" required />
              </label>
              <label>
                License Number
                <input name="licenseNumber" placeholder="DL0420261122" required />
              </label>
              <label>
                Category
                <select name="licenseCategory">
                  <option>LMV</option>
                  <option>HMV</option>
                  <option>Transport</option>
                </select>
              </label>
              <label>
                License Expiry
                <input name="licenseExpiryDate" type="date" required />
              </label>
              <label>
                Contact
                <input name="contactNumber" placeholder="+91 98765 43012" required />
              </label>
              <label>
                Safety Score (0–100)
                <input name="safetyScore" max="100" min="0" placeholder="85" type="number" required />
              </label>
              <button className="primary-button" type="submit" style={{ marginTop: "4px" }}>
                <Plus size={13} />
                Add Driver
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
