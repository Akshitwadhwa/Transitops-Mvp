import { useState } from "react";
import { Edit2, Plus, X } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { isLicenseExpired } from "../logic/rules";
import type { AppData, Driver } from "../types";
import { createDriver, updateDriverApi } from "../logic/api";

type DriversProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
};

export function Drivers({ data, setData }: DriversProps) {
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const licenseNumber = String(form.get("licenseNumber")).trim().toUpperCase();

    // Check duplicate only for new drivers
    if (!editingDriver && data.drivers.some((driver) => driver.licenseNumber === licenseNumber)) {
      window.alert("License number must be unique.");
      return;
    }

    const driverInput = {
      id: editingDriver ? editingDriver.id : crypto.randomUUID(),
      name: String(form.get("name")).trim(),
      licenseNumber,
      licenseCategory: String(form.get("licenseCategory")) as Driver["licenseCategory"],
      licenseExpiryDate: String(form.get("licenseExpiryDate")),
      contactNumber: String(form.get("contactNumber")).trim(),
      safetyScore: Number(form.get("safetyScore")),
      status: editingDriver ? (String(form.get("status")) as Driver["status"]) : undefined,
    };

    try {
      if (editingDriver) {
        const updated = await updateDriverApi(editingDriver.id, driverInput);
        setData((current) => ({
          ...current,
          drivers: current.drivers.map((d) => (d.id === editingDriver.id ? updated : d)),
        }));
        setEditingDriver(null);
      } else {
        const savedDriver = await createDriver(driverInput);
        setData((current) => ({ ...current, drivers: [savedDriver, ...current.drivers] }));
      }
      formElement.reset();
    } catch (error: any) {
      window.alert(error.message || "Failed to save driver.");
    }
  }

  return (
    <div className="content-grid form-and-table">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>{editingDriver ? "Edit Driver" : "Add Driver"}</h2>
            <p>
              {editingDriver
                ? `Editing ${editingDriver.name}`
                : "Expired licenses and suspended drivers are blocked at dispatch."}
            </p>
          </div>
        </div>
        <form className="form-grid" key={editingDriver?.id || "new"} onSubmit={handleFormSubmit}>
          <label>
            Name
            <input
              defaultValue={editingDriver?.name || ""}
              name="name"
              placeholder="Aman Verma"
              required
            />
          </label>
          <label>
            License Number
            <input
              defaultValue={editingDriver?.licenseNumber || ""}
              disabled={!!editingDriver}
              name="licenseNumber"
              placeholder="DL0420261122"
              required
            />
          </label>
          <label>
            Category
            <select defaultValue={editingDriver?.licenseCategory || "LMV"} name="licenseCategory">
              <option>LMV</option>
              <option>HMV</option>
              <option>Transport</option>
            </select>
          </label>
          <label>
            License Expiry
            <input
              defaultValue={editingDriver?.licenseExpiryDate || ""}
              name="licenseExpiryDate"
              type="date"
              required
            />
          </label>
          <label>
            Contact
            <input
              defaultValue={editingDriver?.contactNumber || ""}
              name="contactNumber"
              placeholder="+91 98765 43012"
              required
            />
          </label>
          <label>
            Safety Score
            <input
              defaultValue={editingDriver?.safetyScore || ""}
              max="100"
              min="0"
              name="safetyScore"
              type="number"
              required
            />
          </label>
          {editingDriver && (
            <label>
              Status
              <select defaultValue={editingDriver.status} name="status">
                <option>Available</option>
                <option>On Trip</option>
                <option>Off Duty</option>
                <option>Suspended</option>
              </select>
            </label>
          )}
          <div className="form-buttons">
            <button className="primary-button" type="submit">
              {editingDriver ? <Edit2 size={16} /> : <Plus size={16} />}
              {editingDriver ? "Save Changes" : "Add Driver"}
            </button>
            {editingDriver && (
              <button
                className="secondary-button ghost-button"
                onClick={() => setEditingDriver(null)}
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
            <h2>Driver Management</h2>
            <p>Compliance status is evaluated before trip dispatch.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>License</th>
                <th>Expiry</th>
                <th>Safety</th>
                <th>Status</th>
                <th>Compliance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.drivers.length === 0 ? (
                <tr>
                  <td className="empty-cell" colSpan={7}>No drivers added yet. Register your first driver using the form.</td>
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
                    <td>
                      <button
                        className="small-button"
                        onClick={() => setEditingDriver(driver)}
                        title="Edit driver"
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
