import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper function to check expired license
function isLicenseExpired(licenseExpiryDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(licenseExpiryDate) < today;
}

// GET all app data
app.get("/api/data", async (req, res) => {
  try {
    const [vehicles, drivers, trips, maintenanceLogs, expenses] = await Promise.all([
      prisma.vehicle.findMany({ orderBy: { registrationNumber: "asc" } }),
      prisma.driver.findMany({ orderBy: { name: "asc" } }),
      prisma.trip.findMany(),
      prisma.maintenanceLog.findMany({ orderBy: { openedAt: "desc" } }),
      prisma.expense.findMany({ orderBy: { date: "desc" } }),
    ]);

    res.json({
      vehicles,
      drivers,
      trips,
      maintenanceLogs,
      expenses,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST register vehicle
app.post("/api/vehicles", async (req, res) => {
  const { registrationNumber, model, type, region, maxLoadKg, odometerKm, acquisitionCost } = req.body;

  if (!registrationNumber || !model || !type || !region || !maxLoadKg || !acquisitionCost) {
    return res.status(400).json({ error: "Missing required vehicle fields." });
  }

  try {
    const existing = await prisma.vehicle.findUnique({
      where: { registrationNumber: registrationNumber.toUpperCase().trim() },
    });

    if (existing) {
      return res.status(400).json({ error: "Registration number must be unique." });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        registrationNumber: registrationNumber.toUpperCase().trim(),
        model: model.trim(),
        type,
        region,
        maxLoadKg: Number(maxLoadKg),
        odometerKm: Number(odometerKm || 0),
        acquisitionCost: Number(acquisitionCost),
        status: "Available",
      },
    });

    res.status(201).json(vehicle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create vehicle." });
  }
});

// POST add driver
app.post("/api/drivers", async (req, res) => {
  const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore } = req.body;

  if (!name || !licenseNumber || !licenseCategory || !licenseExpiryDate || !contactNumber || safetyScore === undefined) {
    return res.status(400).json({ error: "Missing required driver fields." });
  }

  try {
    const existing = await prisma.driver.findUnique({
      where: { licenseNumber: licenseNumber.toUpperCase().trim() },
    });

    if (existing) {
      return res.status(400).json({ error: "License number must be unique." });
    }

    const driver = await prisma.driver.create({
      data: {
        name: name.trim(),
        licenseNumber: licenseNumber.toUpperCase().trim(),
        licenseCategory,
        licenseExpiryDate,
        contactNumber: contactNumber.trim(),
        safetyScore: Number(safetyScore),
        status: "Available",
      },
    });

    res.status(201).json(driver);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create driver." });
  }
});

// POST add draft trip
app.post("/api/trips", async (req, res) => {
  const { source, destination, vehicleId, driverId, cargoWeightKg, plannedDistanceKm, revenue } = req.body;

  if (!source || !destination || !vehicleId || !driverId || !cargoWeightKg || !plannedDistanceKm || !revenue) {
    return res.status(400).json({ error: "Missing required trip fields." });
  }

  try {
    const [vehicle, driver] = await Promise.all([
      prisma.vehicle.findUnique({ where: { id: vehicleId } }),
      prisma.driver.findUnique({ where: { id: driverId } }),
    ]);

    if (!vehicle || !driver) {
      return res.status(404).json({ error: "Vehicle or Driver not found." });
    }

    const trip = await prisma.trip.create({
      data: {
        source: source.trim(),
        destination: destination.trim(),
        vehicleId,
        driverId,
        cargoWeightKg: Number(cargoWeightKg),
        plannedDistanceKm: Number(plannedDistanceKm),
        revenue: Number(revenue),
        status: "Draft",
      },
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create trip." });
  }
});

// POST dispatch trip with business rules validation
app.post("/api/trips/:id/dispatch", async (req, res) => {
  const { id } = req.params;

  try {
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      return res.status(404).json({ error: "Trip not found." });
    }

    if (trip.status !== "Draft") {
      return res.status(400).json({ error: "Only draft trips can be dispatched." });
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: trip.vehicleId } });
    const driver = await prisma.driver.findUnique({ where: { id: trip.driverId } });

    if (!vehicle || !driver) {
      return res.status(400).json({ error: "Vehicle or Driver assigned to this trip is missing." });
    }

    const errors: string[] = [];

    if (vehicle.status !== "Available") {
      errors.push(`${vehicle.registrationNumber} is ${vehicle.status} and cannot be dispatched.`);
    }

    if (driver.status !== "Available") {
      errors.push(`${driver.name} is ${driver.status} and cannot be assigned.`);
    }

    if (isLicenseExpired(driver.licenseExpiryDate)) {
      errors.push(`${driver.name} has an expired license.`);
    }

    if (trip.cargoWeightKg > vehicle.maxLoadKg) {
      errors.push(`Cargo ${trip.cargoWeightKg} kg exceeds vehicle capacity ${vehicle.maxLoadKg} kg.`);
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Begin updates in transaction
    const [updatedTrip] = await prisma.$transaction([
      prisma.trip.update({
        where: { id },
        data: { status: "Dispatched" },
      }),
      prisma.vehicle.update({
        where: { id: vehicle.id },
        data: { status: "On Trip" },
      }),
      prisma.driver.update({
        where: { id: driver.id },
        data: { status: "On Trip" },
      }),
    ]);

    res.json(updatedTrip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to dispatch trip." });
  }
});

// POST complete trip
app.post("/api/trips/:id/complete", async (req, res) => {
  const { id } = req.params;

  try {
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      return res.status(404).json({ error: "Trip not found." });
    }

    if (trip.status !== "Dispatched") {
      return res.status(400).json({ error: "Only dispatched trips can be completed." });
    }

    const [updatedTrip] = await prisma.$transaction([
      prisma.trip.update({
        where: { id },
        data: { status: "Completed" },
      }),
      prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: "Available" },
      }),
      prisma.driver.update({
        where: { id: trip.driverId },
        data: { status: "Available" },
      }),
    ]);

    res.json(updatedTrip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to complete trip." });
  }
});

// POST cancel trip
app.post("/api/trips/:id/cancel", async (req, res) => {
  const { id } = req.params;

  try {
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      return res.status(404).json({ error: "Trip not found." });
    }

    if (trip.status === "Completed" || trip.status === "Cancelled") {
      return res.status(400).json({ error: "Trip is already finalized." });
    }

    const restore = trip.status === "Dispatched";

    if (restore) {
      await prisma.$transaction([
        prisma.trip.update({
          where: { id },
          data: { status: "Cancelled" },
        }),
        prisma.vehicle.update({
          where: { id: trip.vehicleId },
          data: { status: "Available" },
        }),
        prisma.driver.update({
          where: { id: trip.driverId },
          data: { status: "Available" },
        }),
      ]);
    } else {
      await prisma.trip.update({
        where: { id },
        data: { status: "Cancelled" },
      });
    }

    res.json({ message: "Trip cancelled successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to cancel trip." });
  }
});

// DELETE draft trip
app.delete("/api/trips/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      return res.status(404).json({ error: "Trip not found." });
    }

    if (trip.status !== "Draft") {
      return res.status(400).json({ error: "Only draft trips can be deleted." });
    }

    await prisma.trip.delete({ where: { id } });
    res.json({ message: "Trip deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete trip." });
  }
});

// POST open maintenance log
app.post("/api/maintenance", async (req, res) => {
  const { vehicleId, title, cost } = req.body;

  if (!vehicleId || !title || cost === undefined) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found." });
    }

    if (vehicle.status !== "Available") {
      return res.status(400).json({ error: `Vehicle must be Available, currently it is ${vehicle.status}.` });
    }

    const openedAt = new Date().toISOString().slice(0, 10);

    const [log] = await prisma.$transaction([
      prisma.maintenanceLog.create({
        data: {
          vehicleId,
          title: title.trim(),
          cost: Number(cost),
          openedAt,
          status: "Active",
        },
      }),
      prisma.vehicle.update({
        where: { id: vehicleId },
        data: { status: "In Shop" },
      }),
      prisma.expense.create({
        data: {
          vehicleId,
          type: "Maintenance",
          amount: Number(cost),
          date: openedAt,
        },
      }),
    ]);

    res.status(201).json(log);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create maintenance log." });
  }
});

// POST close maintenance log
app.post("/api/maintenance/:id/close", async (req, res) => {
  const { id } = req.params;

  try {
    const log = await prisma.maintenanceLog.findUnique({ where: { id } });
    if (!log) {
      return res.status(404).json({ error: "Maintenance log not found." });
    }

    if (log.status === "Closed") {
      return res.status(400).json({ error: "Log is already closed." });
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: log.vehicleId } });
    if (!vehicle) {
      return res.status(400).json({ error: "Associated vehicle is missing." });
    }

    const nextStatus = vehicle.status === "Retired" ? "Retired" : "Available";

    await prisma.$transaction([
      prisma.maintenanceLog.update({
        where: { id },
        data: { status: "Closed" },
      }),
      prisma.vehicle.update({
        where: { id: log.vehicleId },
        data: { status: nextStatus },
      }),
    ]);

    res.json({ message: "Maintenance log closed successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to close maintenance log." });
  }
});

// POST add expense
app.post("/api/expenses", async (req, res) => {
  const { vehicleId, type, amount, liters, date } = req.body;

  if (!vehicleId || !type || amount === undefined || !date) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found." });
    }

    const expense = await prisma.expense.create({
      data: {
        vehicleId,
        type,
        amount: Number(amount),
        liters: liters ? Number(liters) : null,
        date,
      },
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to log expense." });
  }
});

// POST reset demo data
app.post("/api/reset", async (req, res) => {
  try {
    // Run the Prisma seed script
    const seedPath = path.join(__dirname, "../prisma/seed.ts");
    exec(`npx tsx "${seedPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error("Error executing seed:", error);
        return res.status(500).json({ error: "Reseed execution failed." });
      }
      console.log(stdout);
      res.json({ message: "Database reseeded successfully." });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Reseed failed." });
  }
});

app.listen(PORT, () => {
  console.log(`TransitOps Backend Server is running on port ${PORT}`);
});
