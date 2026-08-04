import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types/api";

const riskConfig: Record<RiskLevel, { label: string; className: string }> = {
  low: {
    label: "Low",
    className:
      "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  medium: {
    label: "Medium",
    className:
      "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  high: {
    label: "High",
    className:
      "bg-orange-500/15 text-orange-400 border-orange-500/30",
  },
  critical: {
    label: "Critical",
    className:
      "bg-red-500/15 text-red-400 border-red-500/30",
  },
};

interface RiskBadgeProps {
  level: RiskLevel | null | undefined;
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  if (!level) return <span className="text-slate-500 text-xs">—</span>;
  const config = riskConfig[level];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
