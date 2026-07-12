type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const className = status.toLowerCase().replace(/\s+/g, "-");
  return <span className={`status-badge ${className}`}>{status}</span>;
}
