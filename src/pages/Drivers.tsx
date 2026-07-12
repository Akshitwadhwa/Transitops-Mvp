import { Edit2, Plus } from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "../components/StatusBadge";
import { isLicenseExpired } from "../logic/rules";
import type { AppData, Driver } from "../types";

type DriversProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
};

export function Drivers({ data, setData }: DriversProps) {
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const licenseNumber = String(form.get("licenseNumber")).trim().toUpperCase();

    if (
      data.drivers.some(
        (driver) => driver.licenseNumber === licenseNumber && driver.id !== editingDriver?.id,
      )
    ) {
      window.alert("License number must be unique.");
      return;
    }

    if (editingDriver) {
      setData((current) => ({
        ...current,
        drivers: current.drivers.map((d) =>
          d.id === editingDriver.id
            ? {
                ...d,
                name: String(form.get("name")).trim(),
                licenseNumber,
                licenseCategory: String(form.get("licenseCategory")) as Driver["licenseCategory"],
                licenseExpiryDate: String(form.get("licenseExpiryDate")),
                contactNumber: String(form.get("contactNumber")).trim(),
                safetyScore: Number(form.get("safetyScore")),
                status: (form.get("status") as Driver["status"]) ?? d.status,
              }
            : d,
        ),
      }));
      setEditingDriver(null);
    } else {
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
      setData((current) => ({ ...current, drivers: [driver, ...current.drivers] }));
    }
    event.currentTarget.reset();
  }

  return (
    <div className="content-grid form-and-table">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>{editingDriver ? "Edit Driver" : "Add Driver"}</h2>
            <p>
              {editingDriver
                ? "Update driver properties and status."
                : "Expired licenses and suspended drivers are blocked at dispatch."}
            </p>
          </div>
        </div>
        <form key={editingDriver ? editingDriver.id : "add"} className="form-grid" onSubmit={handleSubmit}>
          <label>
            Name
            <input name="name" defaultValue={editingDriver?.name} placeholder="Aman Verma" required />
          </label>
          <label>
            License Number
            <input
              name="licenseNumber"
              defaultValue={editingDriver?.licenseNumber}
              placeholder="DL0420261122"
              required
            />
          </label>
          <label>
            Category
            <select name="licenseCategory" defaultValue={editingDriver?.licenseCategory ?? "LMV"}>
              <option>LMV</option>
              <option>HMV</option>
              <option>Transport</option>
            </select>
          </label>
          <label>
            License Expiry
            <input name="licenseExpiryDate" defaultValue={editingDriver?.licenseExpiryDate} type="date" required />
          </label>
          <label>
            Contact
            <input name="contactNumber" defaultValue={editingDriver?.contactNumber} placeholder="+91 98765 43012" required />
          </label>
          <label>
            Safety Score
            <input
              name="safetyScore"
              defaultValue={editingDriver?.safetyScore}
              max="100"
              min="0"
              type="number"
              required
            />
          </label>
          {editingDriver && (
            <label>
              Status
              <select name="status" defaultValue={editingDriver.status}>
                <option value="Available">Available</option>
                <option value="On Trip" disabled={editingDriver.status !== "On Trip"}>On Trip</option>
                <option value="Off Duty">Off Duty</option>
                <option value="Suspended">Suspended</option>
              </select>
            </label>
          )}
          {editingDriver ? (
            <div className="row-actions" style={{ display: "flex", gap: "8px" }}>
              <button className="primary-button" type="submit" style={{ flex: 1 }}>
                Save Changes
              </button>
              <button
                className="ghost-button"
                onClick={() => setEditingDriver(null)}
                type="button"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button className="primary-button" type="submit">
              <Plus size={16} />
              Add Driver
            </button>
          )}
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
              {data.drivers.map((driver) => (
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

