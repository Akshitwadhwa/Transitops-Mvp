# Team Member 3: Demo, Documentation, and Testing

## Goal

Make the project easy to present, run, and judge. This person owns the README, demo script, test cases, and final GitHub polish.

## Main Files

- `README.md`
- `package.json`
- `src/data/seed.ts`
- All app screens for manual testing

## Tasks

1. Write or improve the README.
   - Project overview
   - Tech stack
   - Setup instructions
   - Demo login roles
   - Features completed
   - Business rules implemented
   - Future scope

2. Create a demo script.
   - Login as Fleet Manager.
   - Show dashboard.
   - Add a vehicle.
   - Add a driver.
   - Create a trip.
   - Dispatch the trip.
   - Show automatic `On Trip` status update.
   - Try an invalid dispatch.
   - Complete the trip.
   - Add maintenance.
   - Add expenses.
   - Show reports.

3. Manual test checklist.
   - Vehicle registration number cannot be duplicated.
   - In-shop vehicles cannot be dispatched.
   - Suspended drivers cannot be dispatched.
   - Expired licenses cannot be dispatched.
   - Cargo cannot exceed vehicle capacity.
   - Maintenance status transitions work.
   - Data persists after refresh.
   - Reset demo data works.

4. Prepare GitHub presentation.
   - Add screenshots if time permits.
   - Add a short project description.
   - Make sure `npm install`, `npm run dev`, and `npm run build` work.

5. Final quality pass.
   - Check spelling.
   - Check mobile layout.
   - Check console errors.
   - Check that all buttons do something understandable.

## Deliverable

A clear README, a confident demo flow, and a tested app that can be shown without confusion.

## Demo Talking Points

- "This project is built around a realistic fleet operations workflow."
- "The demo shows data entry, rule validation, automatic status changes, and reporting."
- "The app is intentionally scoped as an MVP that can be extended into a full backend-backed platform."

