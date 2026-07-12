import { Plus, Trash2 } from "lucide-react";
import { formatMoney, getVehicleName } from "../logic/rules";
import type { AppData, Expense } from "../types";
import { createExpense, deleteExpenseApi } from "../logic/api";

type ExpensesProps = {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
};

export function Expenses({ data, setData }: ExpensesProps) {
  async function addExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const expenseInput = {
      vehicleId: String(form.get("vehicleId")),
      type: String(form.get("type")) as Expense["type"],
      amount: Number(form.get("amount")),
      liters: form.get("liters") ? Number(form.get("liters")) : undefined,
      date: String(form.get("date")),
    };

    try {
      const savedExpense = await createExpense(expenseInput);
      setData((current) => ({ ...current, expenses: [savedExpense, ...current.expenses] }));
      formElement.reset();
    } catch (error: any) {
      window.alert(error.message || "Failed to log expense.");
    }
  }

  async function handleDelete(expenseId: string) {
    try {
      await deleteExpenseApi(expenseId);
      setData((current) => ({
        ...current,
        expenses: current.expenses.filter((e) => e.id !== expenseId),
      }));
    } catch (error: any) {
      window.alert(error.message || "Failed to delete expense.");
    }
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.expenses.length === 0 ? (
                <tr>
                  <td className="empty-cell" colSpan={6}>No expenses logged yet. Add a fuel, toll, or maintenance expense to get started.</td>
                </tr>
              ) : (
                data.expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{getVehicleName(data, expense.vehicleId)}</td>
                    <td>{expense.type}</td>
                    <td>{formatMoney(expense.amount)}</td>
                    <td>{expense.liters ?? "-"}</td>
                    <td>{expense.date}</td>
                    <td>
                      <button
                        className="small-button danger"
                        onClick={() => handleDelete(expense.id)}
                        title="Delete expense"
                        type="button"
                      >
                        <Trash2 size={14} />
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
