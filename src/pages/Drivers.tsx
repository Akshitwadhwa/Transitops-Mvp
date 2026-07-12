import { useState } from "react";
import { Plus, UserRound, X } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { isLicenseExpired } from "../logic/rules";
import type { AppData, Driver } from "../types";

type DriversProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
};

export function Drivers({ data, setData }: DriversProps) {
  const [showModal, setShowModal] = useState(false);

  function addDriver(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
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
      status: "Available",
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
                <tr className="empty-state-row">
                  <td colSpan={8}>
                    <div className="empty-state">
                      <UserRound size={24} className="empty-state-icon" />
                      <p>No drivers on record</p>
                      <small>Use Add Driver to build your dispatch pool.</small>
                    </div>
                  </td>
                </tr>
              ) : (
                data.drivers.map((d) => {
                  const expired = isLicenseExpired(d);
                  return (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 600, color: "var(--text-1)" }}>{d.name}</td>
                      <td>{d.licenseNumber}</td>
                      <td>{d.licenseCategory}</td>
                      <td style={{ color: expired ? "var(--s-red)" : "var(--text-2)" }}>
                        {d.licenseExpiryDate}
                        {expired && <span style={{ marginLeft: 4, fontSize: "0.65rem", fontWeight: 700 }}>EXPIRED</span>}
                      </td>
                      <td>{d.contactNumber}</td>
                      <td>
                        <span style={{ color: d.safetyScore < 70 ? "var(--s-orange)" : "var(--text-2)", fontWeight: 600 }}>
                          {d.safetyScore}%
                        </span>
                      </td>
                      <td><StatusBadge status={d.status} /></td>
                      <td><StatusBadge status={expired ? "Expired" : "Valid"} /></td>
                    </tr>
                  );
                })
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
