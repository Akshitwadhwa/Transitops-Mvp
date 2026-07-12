import type { AppData, Driver, Trip, Vehicle } from "../types";

export function isLicenseExpired(driver: Driver) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(driver.licenseExpiryDate) < today;
}

export function canDispatchTrip(trip: Trip, vehicle: Vehicle, driver: Driver) {
  const errors: string[] = [];

  if (trip.status !== "Draft") {
    errors.push("Only draft trips can be dispatched.");
  }

  if (vehicle.status !== "Available") {
    errors.push(`${vehicle.registrationNumber} is ${vehicle.status} and cannot be dispatched.`);
  }

  if (driver.status !== "Available") {
    errors.push(`${driver.name} is ${driver.status} and cannot be assigned.`);
  }

  if (isLicenseExpired(driver)) {
    errors.push(`${driver.name} has an expired license.`);
  }

  if (trip.cargoWeightKg > vehicle.maxLoadKg) {
    errors.push(`Cargo ${trip.cargoWeightKg} kg exceeds vehicle capacity ${vehicle.maxLoadKg} kg.`);
  }

  return errors;
}

export function dispatchTrip(data: AppData, tripId: string) {
  const trip = data.trips.find((item) => item.id === tripId);
  if (!trip) return { data, errors: ["Trip not found."] };

  const vehicle = data.vehicles.find((item) => item.id === trip.vehicleId);
  const driver = data.drivers.find((item) => item.id === trip.driverId);
  if (!vehicle || !driver) return { data, errors: ["Vehicle or driver missing."] };

  const errors = canDispatchTrip(trip, vehicle, driver);
  if (errors.length) return { data, errors };

  return {
    errors: [],
    data: {
      ...data,
      trips: data.trips.map((item) => (item.id === tripId ? { ...item, status: "Dispatched" as const } : item)),
      vehicles: data.vehicles.map((item) => (item.id === vehicle.id ? { ...item, status: "On Trip" as const } : item)),
      drivers: data.drivers.map((item) => (item.id === driver.id ? { ...item, status: "On Trip" as const } : item)),
    },
  };
}

export function completeTrip(data: AppData, tripId: string) {
  const trip = data.trips.find((item) => item.id === tripId);
  if (!trip || trip.status !== "Dispatched") return data;

  return {
    ...data,
    trips: data.trips.map((item) => (item.id === tripId ? { ...item, status: "Completed" as const } : item)),
    vehicles: data.vehicles.map((item) => (item.id === trip.vehicleId ? { ...item, status: "Available" as const } : item)),
    drivers: data.drivers.map((item) => (item.id === trip.driverId ? { ...item, status: "Available" as const } : item)),
  };
}

export function cancelTrip(data: AppData, tripId: string) {
  const trip = data.trips.find((item) => item.id === tripId);
  if (!trip || trip.status === "Completed") return data;
  const restore = trip.status === "Dispatched";

  return {
    ...data,
    trips: data.trips.map((item) => (item.id === tripId ? { ...item, status: "Cancelled" as const } : item)),
    vehicles: restore
      ? data.vehicles.map((item) => (item.id === trip.vehicleId ? { ...item, status: "Available" as const } : item))
      : data.vehicles,
    drivers: restore
      ? data.drivers.map((item) => (item.id === trip.driverId ? { ...item, status: "Available" as const } : item))
      : data.drivers,
  };
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getVehicleName(data: AppData, vehicleId: string) {
  const vehicle = data.vehicles.find((item) => item.id === vehicleId);
  return vehicle ? `${vehicle.registrationNumber} - ${vehicle.model}` : "Unknown vehicle";
}

export function getDriverName(data: AppData, driverId: string) {
  return data.drivers.find((item) => item.id === driverId)?.name ?? "Unknown driver";
}
