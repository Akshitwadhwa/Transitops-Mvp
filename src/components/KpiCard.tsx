import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

export type KpiCardProps = {
  label: string;
  value: string | number;
  detail?: string;
  icon?: LucideIcon;
  /** CSS color value for the left border, e.g. "var(--kpi-cyan)" */
  color?: string;
};

function useCountUp(target: number | null, duration = 800): number | null {
  const [count, setCount] = useState<number | null>(target === null ? null : 0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (target === null) return;
    setCount(0);
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
      setCount(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return count;
}

export function KpiCard({ label, value, detail, color }: KpiCardProps) {
  const numericTarget = typeof value === "number" ? value : null;
  const animatedCount = useCountUp(numericTarget);
  const displayValue  = numericTarget !== null ? animatedCount : value;

  return (
    <section
      className="kpi-card"
      style={{ "--kpi-color": color } as React.CSSProperties}
      aria-label={label}
    >
      <span className="kpi-label">{label}</span>
      <strong className="kpi-value">{displayValue}</strong>
      {detail && <span className="kpi-detail">{detail}</span>}
    </section>
  );
}
