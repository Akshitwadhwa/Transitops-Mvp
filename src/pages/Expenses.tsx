import { useState } from "react";
import { Fuel, Plus, X } from "lucide-react";
import { formatMoney, getVehicleName } from "../logic/rules";
import type { AppData, Expense } from "../types";

type ExpensesProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
};

export function Expenses({ data, setData }: ExpensesProps) {
  const [showModal, setShowModal] = useState(false);

  function addExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const expense: Expense = {
      id: crypto.randomUUID(),
      vehicleId: String(form.get("vehicleId")),
      type: String(form.get("type")) as Expense["type"],
      amount: Number(form.get("amount")),
      liters: form.get("liters") ? Number(form.get("liters")) : undefined,
      date: String(form.get("date")),
    };
    setData((cur) => ({ ...cur, expenses: [expense, ...cur.expenses] }));
    event.currentTarget.reset();
    setShowModal(false);
  }

  const totalCost = data.expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="page-stack">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Fuel &amp; Expenses</h2>
          <p>Fuel and maintenance costs feed reports and vehicle cost totals</p>
        </div>
        <button className="primary-button" onClick={() => setShowModal(true)} type="button">
          <Plus size={13} />
          Log Expense
        </button>
      </div>

      {/* Summary strip */}
      {data.expenses.length > 0 && (
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderLeft: "3px solid var(--kpi-orange)",
          borderRadius: "var(--r-md)",
          padding: "12px 16px",
          display: "inline-flex",
          flexDirection: "column",
          alignSelf: "flex-start",
        }}>
          <span style={{ color: "var(--text-3)", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>
            Total Operating Cost
          </span>
          <strong style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.025em", marginTop: "4px" }}>
            {formatMoney(totalCost)}
          </strong>
        </div>
      )}

      <div className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Liters</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.expenses.length === 0 ? (
                <tr className="empty-state-row">
                  <td colSpan={5}>
                    <div className="empty-state">
                      <Fuel size={24} className="empty-state-icon" />
                      <p>No expenses logged</p>
                      <small>Log fuel, toll, or maintenance costs using the button above.</small>
                    </div>
                  </td>
                </tr>
              ) : (
                data.expenses.map((e) => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 600, color: "var(--text-1)" }}>{getVehicleName(data, e.vehicleId)}</td>
                    <td>{e.type}</td>
                    <td>{formatMoney(e.amount)}</td>
                    <td>{e.liters ?? "—"}</td>
                    <td>{e.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(ev) => ev.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Log Expense</h3>
                <p>Fuel and maintenance feed reports and vehicle cost totals.</p>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)} type="button">
                <X size={14} />
              </button>
            </div>
            <form className="form-grid" onSubmit={addExpense}>
              <label>
                Vehicle
                <select name="vehicleId">
                  {data.vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.registrationNumber}</option>
                  ))}
                </select>
              </label>
              <label>
                Type
                <select name="type">
                  <option>Fuel</option>
                  <option>Maintenance</option>
                  <option>Toll</option>
                  <option>Other</option>
                </select>
              </label>
              <label>
                Amount
                <input name="amount" min="0" placeholder="2500" type="number" required />
              </label>
              <label>
                Liters (fuel only)
                <input name="liters" min="0" placeholder="45.5" step="0.1" type="number" />
              </label>
              <label>
                Date
                <input name="date" type="date" required />
              </label>
              <button className="primary-button" type="submit" style={{ marginTop: "4px" }}>
                <Plus size={13} />
                Add Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
