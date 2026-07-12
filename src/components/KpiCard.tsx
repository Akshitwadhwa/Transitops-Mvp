import type { LucideIcon } from "lucide-react";

type KpiCardProps = {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
};

export function KpiCard({ label, value, detail, icon: Icon }: KpiCardProps) {
  return (
    <section className="kpi-card">
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{detail}</span>
      </div>
      <Icon size={22} />
    </section>
  );
}
