import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-4 rounded-lg bg-white/5 animate-pulse",
        className,
      )}
    />
  );
}

export function LoadingSkeleton({ className, count = 3 }: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-3"
        >
          <SkeletonLine className="w-1/3 h-5" />
          <SkeletonLine className="w-2/3" />
          <SkeletonLine className="w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-5 gap-4 px-4 py-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonLine key={i} className="h-3 w-20" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-5 gap-4 rounded-lg bg-white/[0.02] px-4 py-4"
        >
          {Array.from({ length: 5 }).map((_, j) => (
            <SkeletonLine key={j} className={j === 0 ? "w-3/4" : "w-1/2"} />
          ))}
        </div>
      ))}
    </div>
  );
}
