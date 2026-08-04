import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Edit3,
  RefreshCw,
  Clock,
  User,
  Loader2,
  X,
} from "lucide-react";
import { useFinding, useReviewFinding } from "@/hooks/use-findings";
import { RiskBadge } from "@/components/common/risk-badge";
import { StatusBadge } from "@/components/common/status-badge";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { formatDateTime, formatPercent } from "@/lib/utils";
import { reviewFindingSchema, type ReviewFindingFormValues } from "@/lib/validators";
import { toast } from "sonner";
import type { ReviewAction } from "@/types/api";
import { extractApiError } from "@/api/client";

export default function FindingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: finding, isLoading } = useFinding(id);
  const [showReviewModal, setShowReviewModal] = useState<ReviewAction | null>(null);

  if (isLoading) return <LoadingSkeleton count={3} />;
  if (!finding) return <EmptyState title="Finding not found" />;

  const isReviewed = finding.status === "approved" || finding.status === "rejected";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <Link
        to={`/contracts/${finding.document_id}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to contract
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Finding details */}
          <div className="glass-card-static p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  {finding.label}
                </h1>
                <div className="flex items-center gap-3">
                  <StatusBadge status={finding.status} />
                  <RiskBadge level={finding.risk_level} />
                  <span className="text-sm text-slate-400 font-medium">
                    {finding.type}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-flex flex-col items-end">
                  <span className="text-xs text-slate-400 mb-1">Confidence</span>
                  <span className="text-lg font-semibold text-slate-200">
                    {formatPercent(finding.confidence)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">
                  Extracted Value
                </h3>
                <pre className="bg-white/5 rounded-xl p-4 text-sm text-slate-200 overflow-x-auto border border-white/10">
                  {JSON.stringify(finding.value, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">
                  Confidence Breakdown
                </h3>
                <div className="space-y-3 bg-white/5 rounded-xl p-4 border border-white/10">
                  {Object.entries(finding.confidence_breakdown).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="font-medium text-slate-200">
                        {typeof value === "boolean"
                          ? value
                            ? "Yes"
                            : "No"
                          : formatPercent(value as number)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Citations */}
          <div className="glass-card-static p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Citations</h2>
            <div className="space-y-4">
              {finding.citations.map((citation, idx) => (
                <div
                  key={citation.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center gap-2 text-xs text-indigo-400 mb-2 font-medium">
                    <span className="bg-indigo-500/20 px-2 py-0.5 rounded">
                      Citation {idx + 1}
                    </span>
                    <span>Page {citation.page_no}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">
                      Paragraph {citation.paragraph_id}
                    </span>
                  </div>
                  <p className="text-slate-200 leading-relaxed italic">
                    "{citation.quote}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="glass-card-static p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Review</h2>
            
            {finding.reason_for_review && !isReviewed && (
              <div className="mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-sm text-amber-400">
                <span className="font-semibold block mb-0.5">Reason for review:</span>
                {finding.reason_for_review}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setShowReviewModal("approve")}
                disabled={isReviewed}
                className="btn-success w-full justify-center"
              >
                <CheckCircle2 className="h-4 w-4" /> Approve
              </button>
              <button
                onClick={() => setShowReviewModal("reject")}
                disabled={isReviewed}
                className="btn-danger w-full justify-center"
              >
                <XCircle className="h-4 w-4" /> Reject
              </button>
              <button
                onClick={() => setShowReviewModal("edit")}
                disabled={isReviewed}
                className="btn-secondary w-full justify-center"
              >
                <Edit3 className="h-4 w-4" /> Edit
              </button>
              <button
                onClick={() => setShowReviewModal("request_reprocess")}
                disabled={isReviewed}
                className="btn-secondary w-full justify-center"
              >
                <RefreshCw className="h-4 w-4" /> Reprocess
              </button>
            </div>
          </div>

          {/* Audit History */}
          <div className="glass-card-static p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-400" />
              Audit History
            </h2>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {finding.audit_history.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4 relative z-10 bg-surface">
                  No history available.
                </p>
              ) : (
                finding.audit_history.map((entry) => (
                  <div key={entry.id} className="relative z-10 flex items-start gap-4 group">
                    <div className="h-6 w-6 rounded-full bg-surface border-2 border-indigo-500 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_0_4px_var(--color-surface)]">
                      <div className="h-2 w-2 rounded-full bg-indigo-500 group-hover:scale-150 transition-transform" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200 capitalize">
                        {entry.action.replace(/_/g, " ")}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <User className="h-3 w-3" />
                        <span>
                          {entry.actor_email || entry.actor_id.slice(0, 8)}
                        </span>
                        <span>•</span>
                        <span>{formatDateTime(entry.created_at)}</span>
                      </div>
                      {entry.rationale && (
                        <p className="text-xs text-slate-400 mt-2 bg-white/5 rounded-lg p-2 border border-white/5">
                          "{entry.rationale}"
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          action={showReviewModal}
          findingId={finding.id}
          currentValue={finding.value}
          expectedUpdatedAt={finding.updated_at}
          onClose={() => setShowReviewModal(null)}
        />
      )}
    </div>
  );
}

function ReviewModal({
  action,
  findingId,
  currentValue,
  expectedUpdatedAt,
  onClose,
}: {
  action: ReviewAction;
  findingId: string;
  currentValue: Record<string, unknown>;
  expectedUpdatedAt: string;
  onClose: () => void;
}) {
  const reviewMutation = useReviewFinding();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewFindingFormValues>({
    resolver: zodResolver(reviewFindingSchema),
    defaultValues: {
      action,
      value: action === "edit" ? JSON.stringify(currentValue, null, 2) as any : undefined,
    },
  });

  const onSubmit = async (data: ReviewFindingFormValues) => {
    try {
      let parsedValue = undefined;
      if (action === "edit" && data.value) {
        try {
          parsedValue = JSON.parse(data.value as any);
        } catch (e) {
          toast.error("Invalid JSON format for value");
          return;
        }
      }

      await reviewMutation.mutateAsync({
        findingId,
        data: {
          action,
          rationale: data.rationale,
          value: parsedValue,
          expected_updated_at: expectedUpdatedAt,
        },
      });
      toast.success(`Finding ${action}d successfully`);
      onClose();
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  const actionConfig = {
    approve: { title: "Approve Finding", btn: "Approve", color: "btn-success" },
    reject: { title: "Reject Finding", btn: "Reject", color: "btn-danger" },
    edit: { title: "Edit Finding", btn: "Save Changes", color: "btn-primary" },
    request_reprocess: { title: "Request Reprocess", btn: "Submit Request", color: "btn-primary" },
  };

  const config = actionConfig[action];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in px-4">
      <div className="glass-card-static w-full max-w-lg p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">
            {config.title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("action")} />

          {action === "edit" && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                New Value (JSON)
              </label>
              <textarea
                {...register("value")}
                className="input-field font-mono text-xs h-32"
                placeholder="{}"
              />
              {errors.value && (
                <p className="mt-1 text-xs text-red-400">{errors.value.message as string || "Invalid format"}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Rationale {action === "approve" || action === "request_reprocess" ? "(Optional)" : "(Required)"}
            </label>
            <textarea
              {...register("rationale")}
              className="input-field h-24"
              placeholder="Why are you making this change?"
            />
            {errors.rationale && (
              <p className="mt-1 text-xs text-red-400">{errors.rationale.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-white/10 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={reviewMutation.isPending}
              className={config.color}
            >
              {reviewMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {config.btn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
