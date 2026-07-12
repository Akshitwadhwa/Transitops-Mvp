import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

export type KpiAccent = "positive" | "warning" | "critical" | "info" | "neutral";

export type KpiCardProps = {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  /** Semantic color for the top bar + icon container. Defaults to "neutral". */
  accent?: KpiAccent;
};

/**
 * Animates a number from 0 → target using easeOutQuart over `duration` ms.
 * Pass null to skip animation (for string values).
 */
function useCountUp(target: number | null, duration = 900): number | null {
  const [count, setCount] = useState<number | null>(target === null ? null : 0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (target === null) return;
    setCount(0);
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart: fast start, smooth landing
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return count;
}

export function KpiCard({ label, value, detail, icon: Icon, accent = "neutral" }: KpiCardProps) {
  const numericTarget = typeof value === "number" ? value : null;
  const animatedValue = useCountUp(numericTarget);
  const displayValue = numericTarget !== null ? animatedValue : value;

  return (
    <section className={`kpi-card kpi-card--${accent}`} aria-label={label}>
      <div className="kpi-card__header">
        <span className="kpi-label">{label}</span>
        <div className="kpi-icon">
          <Icon size={15} strokeWidth={2} />
        </div>
      </div>
      <strong className="kpi-value">{displayValue}</strong>
      <span className="kpi-detail">{detail}</span>
    </section>
  );
}
