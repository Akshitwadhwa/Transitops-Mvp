import type { AppData, Driver, Expense, MaintenanceLog, Trip, Vehicle } from "../types";

const API_BASE = "http://localhost:5000/api";

export async function fetchAppData(): Promise<AppData> {
  const res = await fetch(`${API_BASE}/data`);
  if (!res.ok) throw new Error("Failed to fetch data from database");
  return res.json();
}

export async function createVehicle(vehicle: Omit<Vehicle, "status">): Promise<Vehicle> {
  const res = await fetch(`${API_BASE}/vehicles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vehicle),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create vehicle");
  }
  return res.json();
}

export async function createDriver(driver: Omit<Driver, "status">): Promise<Driver> {
  const res = await fetch(`${API_BASE}/drivers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(driver),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create driver");
  }
  return res.json();
}

export async function createTrip(trip: Omit<Trip, "status">): Promise<Trip> {
  const res = await fetch(`${API_BASE}/trips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trip),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create trip");
  }
  return res.json();
}

export async function dispatchTripApi(tripId: string): Promise<Trip> {
  const res = await fetch(`${API_BASE}/trips/${tripId}/dispatch`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || err.errors?.join("\n") || "Failed to dispatch trip");
  }
  return res.json();
}

export async function completeTripApi(tripId: string): Promise<Trip> {
  const res = await fetch(`${API_BASE}/trips/${tripId}/complete`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to complete trip");
  }
  return res.json();
}

export async function cancelTripApi(tripId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/trips/${tripId}/cancel`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to cancel trip");
  }
  return res.json();
}

export async function deleteTripApi(tripId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/trips/${tripId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to delete trip");
  }
  return res.json();
}

export async function openMaintenanceApi(vehicleId: string, title: string, cost: number): Promise<MaintenanceLog> {
  const res = await fetch(`${API_BASE}/maintenance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vehicleId, title, cost }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to open maintenance log");
  }
  return res.json();
}

export async function closeMaintenanceApi(logId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/maintenance/${logId}/close`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to close maintenance log");
  }
  return res.json();
}

export async function createExpense(expense: Omit<Expense, "id">): Promise<Expense> {
  const res = await fetch(`${API_BASE}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to log expense");
  }
  return res.json();
}

export async function resetDatabaseApi(): Promise<any> {
  const res = await fetch(`${API_BASE}/reset`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to reset database");
  }
  return res.json();
}

export async function updateVehicleApi(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
  const res = await fetch(`${API_BASE}/vehicles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vehicle),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update vehicle");
  }
  return res.json();
}

export async function updateDriverApi(id: string, driver: Partial<Driver>): Promise<Driver> {
  const res = await fetch(`${API_BASE}/drivers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(driver),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update driver");
  }
  return res.json();
}

export async function deleteExpenseApi(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/expenses/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to delete expense");
  }
  return res.json();
}
