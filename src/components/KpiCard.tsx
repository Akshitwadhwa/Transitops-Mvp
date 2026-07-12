import type { LucideIcon } from "lucide-react";

type KpiAccent = "positive" | "warning" | "critical" | "info" | "neutral";

type KpiCardProps = {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  /** Optional semantic color for the icon container. Defaults to "neutral". */
  accent?: KpiAccent;
};

export function KpiCard({ label, value, detail, icon: Icon, accent = "neutral" }: KpiCardProps) {
  return (
    <section className="kpi-card" aria-label={label}>
      <div className="kpi-card-body">
        <div className="kpi-value-block">
          <p className="kpi-label">{label}</p>
          <strong className="kpi-value">{value}</strong>
        </div>
        <div className={`kpi-icon ${accent}`}>
          <Icon size={18} />
        </div>
      </div>
      <span className="kpi-detail">{detail}</span>
    </section>
  );
}
