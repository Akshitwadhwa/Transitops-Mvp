# Team Member 2: Business Logic and Data Workflows

## Goal

Make the TransitOps workflows reliable. This person owns validation, status transitions, and the rules from the problem statement.

## Main Files

- `src/logic/rules.ts`
- `src/logic/storage.ts`
- `src/types.ts`
- `src/data/seed.ts`
- `src/pages/Trips.tsx`
- `src/pages/Maintenance.tsx`
- `src/pages/Vehicles.tsx`
- `src/pages/Drivers.tsx`

## Tasks

1. Strengthen trip dispatch validation.
   - Block vehicles with status `In Shop`, `Retired`, or `On Trip`.
   - Block drivers with status `Suspended`, `Off Duty`, or `On Trip`.
   - Block expired licenses.
   - Block cargo weight above max vehicle capacity.

2. Add better validation messages.
   - Show exactly why dispatch failed.
   - Include vehicle registration number and driver name in error messages.

3. Improve status transitions.
   - Dispatch trip: vehicle and driver become `On Trip`.
   - Complete trip: vehicle and driver return to `Available`.
   - Cancel dispatched trip: vehicle and driver return to `Available`.
   - Open maintenance: vehicle becomes `In Shop`.
   - Close maintenance: vehicle returns to `Available`.

4. Improve seeded data.
   - Add realistic vehicles, drivers, trips, expenses, and maintenance logs.
   - Include at least one expired license case.
   - Include at least one vehicle in maintenance.
   - Include at least one active dispatched trip.

5. Add edit/delete later if time permits.
   - Vehicle edit
   - Driver edit
   - Expense delete
   - Trip delete only for `Draft` trips

## Deliverable

A reliable demo where the app correctly enforces transport operations rules and prevents invalid dispatches.

## Demo Talking Points

- "The system does not just store data. It enforces operational rules."
- "Invalid dispatches are blocked before they create real-world conflicts."
- "Vehicle and driver statuses update automatically as trips and maintenance move through their lifecycle."

