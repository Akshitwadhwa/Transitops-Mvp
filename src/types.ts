export type Role = "Fleet Manager" | "Driver" | "Safety Officer" | "Financial Analyst";
export type Page = "dashboard" | "vehicles" | "drivers" | "trips" | "maintenance" | "expenses" | "reports";
export type VehicleStatus = "Available" | "On Trip" | "In Shop" | "Retired";
export type DriverStatus = "Available" | "On Trip" | "Off Duty" | "Suspended";
export type TripStatus = "Draft" | "Dispatched" | "Completed" | "Cancelled";
export type MaintenanceStatus = "Active" | "Closed";
export type ExpenseType = "Fuel" | "Maintenance" | "Toll" | "Other";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type Vehicle = {
  id: string;
  registrationNumber: string;
  model: string;
  type: "Van" | "Truck" | "Mini Truck" | "Reefer";
  region: "North" | "South" | "East" | "West";
  maxLoadKg: number;
  odometerKm: number;
  acquisitionCost: number;
  status: VehicleStatus;
};

export type Driver = {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: "LMV" | "HMV" | "Transport";
  licenseExpiryDate: string;
  contactNumber: string;
  safetyScore: number;
  status: DriverStatus;
};

export type Trip = {
  id: string;
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeightKg: number;
  plannedDistanceKm: number;
  revenue: number;
  status: TripStatus;
};

export type MaintenanceLog = {
  id: string;
  vehicleId: string;
  title: string;
  cost: number;
  openedAt: string;
  status: MaintenanceStatus;
};

export type Expense = {
  id: string;
  vehicleId: string;
  type: ExpenseType;
  amount: number;
  liters?: number;
  date: string;
};

export type AppData = {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenanceLogs: MaintenanceLog[];
  expenses: Expense[];
};
