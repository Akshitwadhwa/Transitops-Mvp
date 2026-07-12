type StatusBadgeProps = { status: string };

const CLASS_MAP: Record<string, string> = {
  Available:  "available",
  Valid:      "valid",
  Completed:  "completed",
  "On Trip":  "on-trip",
  Dispatched: "dispatched",
  Active:     "active",
  "In Shop":  "in-shop",
  Draft:      "draft",
  "Off Duty": "off-duty",
  Suspended:  "suspended",
  Expired:    "expired",
  Cancelled:  "cancelled",
  Retired:    "retired",
  Closed:     "closed",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const cls = CLASS_MAP[status] ?? status.toLowerCase().replace(/\s+/g, "-");
  return <span className={`status-badge ${cls}`}>{status}</span>;
}
