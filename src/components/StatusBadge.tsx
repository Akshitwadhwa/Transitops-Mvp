type StatusBadgeProps = {
  status: string;
};

/** Maps display status strings to their CSS class name. */
const STATUS_CLASS_MAP: Record<string, string> = {
  Available: "available",
  Valid: "valid",
  Completed: "completed",
  "On Trip": "on-trip",
  Dispatched: "dispatched",
  Active: "active",
  "In Shop": "in-shop",
  Draft: "draft",
  "Off Duty": "off-duty",
  Retired: "retired",
  Suspended: "suspended",
  Expired: "expired",
  Cancelled: "cancelled",
  Closed: "closed",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const cls = STATUS_CLASS_MAP[status] ?? status.toLowerCase().replace(/\s+/g, "-");
  return <span className={`status-badge ${cls}`}>{status}</span>;
}
