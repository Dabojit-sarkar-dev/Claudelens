import { cn } from "@/lib/utils";
import type { FindingStatus, ContractStatus } from "@/types/api";

type StatusType = FindingStatus | ContractStatus | string;

const statusConfig: Record<string, { label: string; className: string }> = {
  // Contract statuses
  uploaded: {
    label: "Uploaded",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  processing: {
    label: "Processing",
    className: "bg-violet-500/15 text-violet-400 border-violet-500/30 animate-pulse",
  },
  ready: {
    label: "Ready",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  error: {
    label: "Error",
    className: "bg-red-500/15 text-red-400 border-red-500/30",
  },
  // Finding statuses
  pending: {
    label: "Pending",
    className: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  },
  needs_review: {
    label: "Needs Review",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-500/15 text-red-400 border-red-500/30",
  },
  edited: {
    label: "Edited",
    className: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  },
  // Evaluation statuses
  running: {
    label: "Running",
    className: "bg-violet-500/15 text-violet-400 border-violet-500/30 animate-pulse",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  };
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
