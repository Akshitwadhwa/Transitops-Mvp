import { Plus, UserRound } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { isLicenseExpired } from "../logic/rules";
import type { AppData, Driver } from "../types";

type DriversProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
};

export function Drivers({ data, setData }: DriversProps) {
  function addDriver(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const licenseNumber = String(form.get("licenseNumber")).trim().toUpperCase();
    if (data.drivers.some((driver) => driver.licenseNumber === licenseNumber)) {
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

    setData((current) => ({ ...current, drivers: [driver, ...current.drivers] }));
    event.currentTarget.reset();
  }

  return (
    <div className="content-grid form-and-table">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Add Driver</h2>
            <p>Expired licenses and suspended drivers are blocked at dispatch.</p>
          </div>
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
            Safety Score
            <input name="safetyScore" max="100" min="0" type="number" required />
          </label>
          <button className="primary-button" type="submit">
            <Plus size={16} />
            Add Driver
          </button>
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
              </tr>
            </thead>
            <tbody>
              {data.drivers.length === 0 ? (
                <tr className="empty-state-row">
                  <td colSpan={6}>
                    <div className="empty-state">
                      <UserRound size={26} className="empty-state-icon" />
                      <p>No drivers on record</p>
                      <small>Add drivers using the form to build your dispatch pool.</small>
                    </div>
                  </td>
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
      </section>
    </div>
  );
}
