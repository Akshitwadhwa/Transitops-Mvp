import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning database...");
  await prisma.expense.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding users...");
  await prisma.user.createMany({
    data: [
      { id: "u-1", name: "Akshit Wadhwa", email: "fleet@transitops.dev", role: "Fleet Manager" },
      { id: "u-2", name: "Meera Nair", email: "safety@transitops.dev", role: "Safety Officer" },
      { id: "u-3", name: "Rohan Shah", email: "finance@transitops.dev", role: "Financial Analyst" },
      { id: "u-4", name: "Arjun Driver", email: "driver@transitops.dev", role: "Driver" },
    ],
  });

  console.log("Seeding vehicles...");
  await prisma.vehicle.createMany({
    data: [
      {
        id: "v-1",
        registrationNumber: "DL-01-TA-4521",
        model: "Tata Ace Gold",
        type: "Mini Truck",
        region: "North",
        maxLoadKg: 750,
        odometerKm: 42000,
        acquisitionCost: 620000,
        status: "Available",
      },
      {
        id: "v-2",
        registrationNumber: "MH-12-BX-1180",
        model: "Ashok Leyland Dost",
        type: "Van",
        region: "West",
        maxLoadKg: 1250,
        odometerKm: 63500,
        acquisitionCost: 870000,
        status: "On Trip",
      },
      {
        id: "v-3",
        registrationNumber: "KA-05-RF-9012",
        model: "Eicher Pro 2049",
        type: "Truck",
        region: "South",
        maxLoadKg: 3500,
        odometerKm: 81400,
        acquisitionCost: 1750000,
        status: "In Shop",
      },
      {
        id: "v-4",
        registrationNumber: "GJ-18-CH-2210",
        model: "Mahindra Bolero Maxx",
        type: "Reefer",
        region: "West",
        maxLoadKg: 1000,
        odometerKm: 28800,
        acquisitionCost: 1120000,
        status: "Available",
      },
      {
        id: "v-5",
        registrationNumber: "RJ-14-PQ-5500",
        model: "Force Traveller Cargo",
        type: "Van",
        region: "North",
        maxLoadKg: 900,
        odometerKm: 55200,
        acquisitionCost: 740000,
        status: "Available",
      },
      {
        id: "v-6",
        registrationNumber: "TN-09-MZ-3310",
        model: "SML Isuzu Samrat",
        type: "Truck",
        region: "South",
        maxLoadKg: 5000,
        odometerKm: 120000,
        acquisitionCost: 2200000,
        status: "Retired",
      },
    ],
  });

  console.log("Seeding drivers...");
  await prisma.driver.createMany({
    data: [
      {
        id: "d-1",
        name: "Aman Verma",
        licenseNumber: "DL0420261122",
        licenseCategory: "Transport",
        licenseExpiryDate: "2028-05-19",
        contactNumber: "+91 98765 43012",
        safetyScore: 94,
        status: "Available",
      },
      {
        id: "d-2",
        name: "Kavya Menon",
        licenseNumber: "KA0520297721",
        licenseCategory: "HMV",
        licenseExpiryDate: "2029-01-03",
        contactNumber: "+91 99887 76554",
        safetyScore: 88,
        status: "On Trip",
      },
      {
        id: "d-3",
        name: "Sameer Khan",
        licenseNumber: "MH1420245511",
        licenseCategory: "LMV",
        licenseExpiryDate: "2025-11-11",
        contactNumber: "+91 91234 55678",
        safetyScore: 72,
        status: "Available",
      },
      {
        id: "d-4",
        name: "Neha Sethi",
        licenseNumber: "HR2620273198",
        licenseCategory: "Transport",
        licenseExpiryDate: "2027-09-27",
        contactNumber: "+91 90000 12121",
        safetyScore: 63,
        status: "Suspended",
      },
      {
        id: "d-5",
        name: "Vikram Pillai",
        licenseNumber: "KL1120281045",
        licenseCategory: "HMV",
        licenseExpiryDate: "2028-12-15",
        contactNumber: "+91 97001 22334",
        safetyScore: 91,
        status: "Available",
      },
      {
        id: "d-6",
        name: "Priya Rajput",
        licenseNumber: "RJ0320299988",
        licenseCategory: "Transport",
        licenseExpiryDate: "2030-03-22",
        contactNumber: "+91 93456 78901",
        safetyScore: 97,
        status: "Available",
      },
    ],
  });

  console.log("Seeding trips...");
  await prisma.trip.createMany({
    data: [
      {
        id: "t-1",
        source: "Mumbai Hub",
        destination: "Pune Warehouse",
        vehicleId: "v-2",
        driverId: "d-2",
        cargoWeightKg: 870,
        plannedDistanceKm: 148,
        revenue: 14500,
        status: "Dispatched",
      },
      {
        id: "t-2",
        source: "Delhi Depot",
        destination: "Noida Retail Park",
        vehicleId: "v-1",
        driverId: "d-3",
        cargoWeightKg: 520,
        plannedDistanceKm: 42,
        revenue: 5200,
        status: "Draft",
      },
      {
        id: "t-3",
        source: "Chennai Port",
        destination: "Bengaluru Depot",
        vehicleId: "v-5",
        driverId: "d-5",
        cargoWeightKg: 800,
        plannedDistanceKm: 346,
        revenue: 31000,
        status: "Completed",
      },
      {
        id: "t-4",
        source: "Jaipur Cold Store",
        destination: "Delhi NCR Hub",
        vehicleId: "v-4",
        driverId: "d-1",
        cargoWeightKg: 950,
        plannedDistanceKm: 275,
        revenue: 22500,
        status: "Draft",
      },
    ],
  });

  console.log("Seeding maintenance logs...");
  await prisma.maintenanceLog.createMany({
    data: [
      {
        id: "m-1",
        vehicleId: "v-3",
        title: "Brake pad replacement",
        cost: 18500,
        openedAt: "2026-07-11",
        status: "Active",
      },
      {
        id: "m-2",
        vehicleId: "v-5",
        title: "Oil change and filter service",
        cost: 7200,
        openedAt: "2026-07-01",
        status: "Closed",
      },
    ],
  });

  console.log("Seeding expenses...");
  await prisma.expense.createMany({
    data: [
      { id: "e-1", vehicleId: "v-2", type: "Fuel", amount: 6400, liters: 72, date: "2026-07-10" },
      { id: "e-2", vehicleId: "v-3", type: "Maintenance", amount: 18500, date: "2026-07-11" },
      { id: "e-3", vehicleId: "v-2", type: "Toll", amount: 1100, date: "2026-07-10" },
      { id: "e-4", vehicleId: "v-5", type: "Maintenance", amount: 7200, date: "2026-07-01" },
      { id: "e-5", vehicleId: "v-5", type: "Fuel", amount: 9800, liters: 110, date: "2026-06-28" },
      { id: "e-6", vehicleId: "v-4", type: "Fuel", amount: 5600, liters: 63, date: "2026-07-09" },
      { id: "e-7", vehicleId: "v-1", type: "Toll", amount: 320, date: "2026-07-08" },
      { id: "e-8", vehicleId: "v-2", type: "Fuel", amount: 7100, liters: 80, date: "2026-07-07" },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
