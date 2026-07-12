# TransitOps MVP

TransitOps is a smart transport operations platform for hackathon demos. It helps a logistics team manage vehicles, drivers, trips, maintenance, expenses, and operational reports from one dashboard.

## Tech Stack

- React
- TypeScript
- Vite
- Lucide React icons
- Browser `localStorage` for MVP persistence

## Current Features

- Demo login with seeded roles
- Dashboard KPIs and risk alerts
- Vehicle registry
- Driver management
- Trip creation, dispatch, completion, and cancellation
- Dispatch validation rules
- Automatic vehicle and driver status updates
- Maintenance workflow
- Fuel, toll, maintenance, and other expense tracking
- Reports with vehicle cost and utilization views

## Application Flowchart

```mermaid
flowchart TD
    A["Start App"] --> B["Login as Demo User"]
    B --> C["Dashboard"]

    C --> D["Vehicle Registry"]
    C --> E["Driver Management"]
    C --> F["Trip Management"]
    C --> G["Maintenance"]
    C --> H["Expenses"]
    C --> I["Reports"]

    D --> D1["Add Vehicle"]
    D1 --> D2["Validate Unique Registration Number"]
    D2 --> D3["Vehicle Status = Available"]

    E --> E1["Add Driver"]
    E1 --> E2["Store License, Expiry, Safety Score"]
    E2 --> E3["Driver Status = Available"]

    F --> F1["Create Draft Trip"]
    F1 --> F2["Select Vehicle and Driver"]
    F2 --> F3["Validate Dispatch Rules"]

    F3 --> J{"Can Dispatch?"}
    J -->|No| K["Show Blocking Reason"]
    K --> F1

    J -->|Yes| L["Dispatch Trip"]
    L --> M["Vehicle Status = On Trip"]
    L --> N["Driver Status = On Trip"]
    M --> O["Complete or Cancel Trip"]
    N --> O
    O --> P["Vehicle and Driver Return to Available"]
    P --> C

    G --> G1["Open Maintenance Log"]
    G1 --> G2["Vehicle Status = In Shop"]
    G2 --> G3["Vehicle Hidden from Dispatch"]
    G3 --> G4["Close Maintenance"]
    G4 --> G5["Vehicle Status = Available"]
    G5 --> C

    H --> H1["Add Fuel, Toll, Maintenance, or Other Expense"]
    H1 --> H2["Update Vehicle Cost"]
    H2 --> I

    I --> I1["Show Fleet Utilization"]
    I --> I2["Show Operating Cost"]
    I --> I3["Show Vehicle Cost Breakdown"]
```

## Core Business Rules

- Vehicle registration number must be unique.
- Retired, in-shop, or on-trip vehicles cannot be dispatched.
- Suspended, off-duty, or on-trip drivers cannot be dispatched.
- Drivers with expired licenses cannot be dispatched.
- Cargo weight cannot exceed vehicle capacity.
- Dispatching a trip changes the vehicle and driver to `On Trip`.
- Completing a trip restores the vehicle and driver to `Available`.
- Cancelling a dispatched trip restores the vehicle and driver to `Available`.
- Opening maintenance changes the vehicle to `In Shop`.
- Closing maintenance restores the vehicle to `Available`.

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Demo Flow

1. Log in as `Fleet Manager`.
2. Show dashboard KPIs.
3. Add a vehicle.
4. Add a driver.
5. Create a draft trip.
6. Dispatch the trip.
7. Show the vehicle and driver moving to `On Trip`.
8. Complete or cancel the trip.
9. Show the vehicle and driver returning to `Available`.
10. Open a maintenance log.
11. Show the vehicle moving to `In Shop`.
12. Add expenses.
13. Show reports updating.

## Team Work Files

- `TEAM_FRONTEND_UI.md`
- `TEAM_BUSINESS_LOGIC.md`
- `TEAM_DEMO_DOCS_TESTING.md`

## Suggested Next Work

- Add edit/delete actions
- Add filters and search
- Add CSV export
- Add real authentication and RBAC guards
- Add backend API and database
- Add screenshots to this README
