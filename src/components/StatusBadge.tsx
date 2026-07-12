type StatusBadgeProps = {
  status: string;
};

/**
 * Explicit map: display string → CSS class.
 * Expired → "expired" (rose/pink) — visually distinct from Suspended (red).
 * Completed → "completed" (teal) — distinct from Available (green).
 * Falls back to slugified string for unknown statuses.
 */
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
