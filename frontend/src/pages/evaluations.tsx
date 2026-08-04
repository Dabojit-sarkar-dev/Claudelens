import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Play,
  BarChart3,
  Loader2,
  X,
  FileText,
} from "lucide-react";
import { useEvaluations, useRunEvaluation } from "@/hooks/use-evaluations";
import { useContracts } from "@/hooks/use-contracts";
import { StatusBadge } from "@/components/common/status-badge";
import { Pagination } from "@/components/common/pagination";
import { TableSkeleton } from "@/components/common/loading-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { formatDate, formatPercent } from "@/lib/utils";
import { runEvaluationSchema, type RunEvaluationFormValues } from "@/lib/validators";
import { toast } from "sonner";
import type { EvaluationListParams } from "@/types/api";
import { extractApiError } from "@/api/client";

export default function EvaluationsPage() {
  const [params, setParams] = useState<EvaluationListParams>({
    page: 1,
    page_size: 20,
  });
  const [showRunModal, setShowRunModal] = useState(false);
  const [expandedEvalId, setExpandedEvalId] = useState<string | null>(null);

  const { data, isLoading } = useEvaluations(params);
  const evaluations = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Evaluations</h1>
          <p className="text-slate-400 text-sm mt-1">
            Run and view quality metric evaluations
          </p>
        </div>
        <button
          onClick={() => setShowRunModal(true)}
          className="btn-primary"
        >
          <Play className="h-4 w-4" />
          Run Evaluation
        </button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : evaluations.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="h-8 w-8 text-slate-400" />}
          title="No evaluations run"
          description="Run your first evaluation to measure extraction quality"
          action={
            <button onClick={() => setShowRunModal(true)} className="btn-primary text-sm mt-4">
              <Play className="h-4 w-4" /> Run Evaluation
            </button>
          }
        />
      ) : (
        <div className="glass-card-static overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    Evaluation Name
                  </th>
                  <th className="text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    Status
                  </th>
                  <th className="text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    Precision
                  </th>
                  <th className="text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    Recall
                  </th>
                  <th className="text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    F1 Score
                  </th>
                  <th className="text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((evaluation) => (
                  <tr
                    key={evaluation.id}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group cursor-pointer"
                    onClick={() =>
                      setExpandedEvalId(
                        expandedEvalId === evaluation.id ? null : evaluation.id,
                      )
                    }
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                          <BarChart3 className="h-4 w-4 text-indigo-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-200">
                          {evaluation.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={evaluation.status} />
                    </td>
                    <td className="px-5 py-4">
                      <MetricBadge value={evaluation.metrics.precision} />
                    </td>
                    <td className="px-5 py-4">
                      <MetricBadge value={evaluation.metrics.recall} />
                    </td>
                    <td className="px-5 py-4">
                      <MetricBadge value={evaluation.metrics.f1} />
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">
                      {formatDate(evaluation.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && meta.total_pages > 1 && (
            <div className="px-5 py-4 border-t border-white/8">
              <Pagination
                meta={meta}
                onPageChange={(page) => setParams((p) => ({ ...p, page }))}
              />
            </div>
          )}
        </div>
      )}

      {showRunModal && <RunEvaluationModal onClose={() => setShowRunModal(false)} />}
    </div>
  );
}

function MetricBadge({ value }: { value: number | undefined }) {
  if (value === undefined || value === null) {
    return <span className="text-slate-500">—</span>;
  }
  const colorClass =
    value >= 0.9
      ? "text-emerald-400 bg-emerald-500/10"
      : value >= 0.7
        ? "text-amber-400 bg-amber-500/10"
        : "text-red-400 bg-red-500/10";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}
    >
      {formatPercent(value)}
    </span>
  );
}

function RunEvaluationModal({ onClose }: { onClose: () => void }) {
  const runMutation = useRunEvaluation();
  const { data: contractsData } = useContracts({ page: 1, page_size: 100 });
  const contracts = contractsData?.items ?? [];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RunEvaluationFormValues>({
    resolver: zodResolver(runEvaluationSchema),
    defaultValues: {
      document_ids: [],
    },
  });

  const onSubmit = async (data: RunEvaluationFormValues) => {
    try {
      await runMutation.mutateAsync(data);
      toast.success("Evaluation started successfully");
      onClose();
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in px-4">
      <div className="glass-card-static w-full max-w-lg p-6 animate-scale-in flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-5 shrink-0">
          <h2 className="text-lg font-semibold text-white">
            Run Evaluation
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="space-y-4 overflow-y-auto pr-2 pb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Evaluation Name (Optional)
              </label>
              <input
                {...register("name")}
                className="input-field"
                placeholder="e.g. Q3 Model Baseline"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Select Contracts (Optional)
              </label>
              <p className="text-xs text-slate-500 mb-3">
                If no contracts are selected, the evaluation will run on all eligible contracts.
              </p>
              
              <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5 max-h-64 overflow-y-auto">
                {contracts.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">
                    No contracts available
                  </div>
                ) : (
                  <Controller
                    name="document_ids"
                    control={control}
                    render={({ field }) => (
                      <div className="divide-y divide-white/5">
                        {contracts.map(contract => (
                          <label key={contract.id} className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              value={contract.id}
                              checked={field.value?.includes(contract.id) || false}
                              onChange={(e) => {
                                const current = field.value || [];
                                const updated = e.target.checked
                                  ? [...current, contract.id]
                                  : current.filter(id => id !== contract.id);
                                field.onChange(updated);
                              }}
                              className="rounded border-white/20 bg-black/20 text-indigo-500 focus:ring-indigo-500/50"
                            />
                            <FileText className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-300 truncate">{contract.title}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-2 shrink-0">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={runMutation.isPending}
              className="btn-primary"
            >
              {runMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {runMutation.isPending ? "Starting..." : "Start Evaluation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
