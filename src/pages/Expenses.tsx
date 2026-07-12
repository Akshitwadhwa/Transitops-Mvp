import { Fuel, Plus } from "lucide-react";
import { formatMoney, getVehicleName } from "../logic/rules";
import type { AppData, Expense } from "../types";

type ExpensesProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
};

export function Expenses({ data, setData }: ExpensesProps) {
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

    setData((current) => ({ ...current, expenses: [expense, ...current.expenses] }));
    event.currentTarget.reset();
  }

  return (
    <div className="content-grid form-and-table">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Log Expense</h2>
            <p>Fuel and maintenance feed reports and vehicle cost totals.</p>
          </div>
        </div>
        <form className="form-grid" onSubmit={addExpense}>
          <label>
            Vehicle
            <select name="vehicleId">
              {data.vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.registrationNumber}
                </option>
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
            <input name="amount" min="0" type="number" required />
          </label>
          <label>
            Liters
            <input name="liters" min="0" step="0.1" type="number" />
          </label>
          <label>
            Date
            <input name="date" type="date" required />
          </label>
          <button className="primary-button" type="submit">
            <Plus size={16} />
            Add Expense
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Expense Ledger</h2>
            <p>Simple operational costing for the MVP demo.</p>
          </div>
        </div>
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
                      <Fuel size={26} className="empty-state-icon" />
                      <p>No expenses logged</p>
                      <small>Log fuel, toll, or maintenance costs using the form.</small>
                    </div>
                  </td>
                </tr>
              ) : (
                data.expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{getVehicleName(data, expense.vehicleId)}</td>
                    <td>{expense.type}</td>
                    <td>{formatMoney(expense.amount)}</td>
                    <td>{expense.liters ?? "—"}</td>
                    <td>{expense.date}</td>
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
