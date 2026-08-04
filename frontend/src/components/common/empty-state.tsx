import { FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className,
      )}
    >
      <div className="mb-4 rounded-2xl bg-white/5 p-4 backdrop-blur-sm border border-white/10">
        {icon || <FileSearch className="h-8 w-8 text-slate-400" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-400 max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
