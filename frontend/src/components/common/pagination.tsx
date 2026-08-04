import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaginatedMeta } from "@/types/api";

interface PaginationProps {
  meta: PaginatedMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ meta, onPageChange, className }: PaginationProps) {
  if (meta.total_pages <= 1) return null;

  const pages: (number | "...")[] = [];
  const { page, total_pages } = meta;

  if (total_pages <= 7) {
    for (let i = 1; i <= total_pages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(total_pages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < total_pages - 2) pages.push("...");
    pages.push(total_pages);
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <p className="text-sm text-slate-400">
        Showing{" "}
        <span className="font-medium text-slate-200">
          {(page - 1) * meta.page_size + 1}
        </span>
        –
        <span className="font-medium text-slate-200">
          {Math.min(page * meta.page_size, meta.total)}
        </span>{" "}
        of{" "}
        <span className="font-medium text-slate-200">{meta.total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-2 text-slate-500">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                "h-8 min-w-[2rem] rounded-lg text-sm font-medium transition-colors",
                p === page
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
              )}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= total_pages}
          className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
