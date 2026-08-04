import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  RefreshCw,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  useContract,
  useContractFindings,
  useReprocessContract,
} from "@/hooks/use-contracts";
import { RiskBadge } from "@/components/common/risk-badge";
import { StatusBadge } from "@/components/common/status-badge";
import { Pagination } from "@/components/common/pagination";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { formatDate, formatPercent } from "@/lib/utils";
import { toast } from "sonner";
import type { RiskLevel, FindingListParams, Finding } from "@/types/api";
import { extractApiError } from "@/api/client";

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: contract, isLoading: contractLoading } = useContract(id);
  const [findingParams, setFindingParams] = useState<FindingListParams>({
    page: 1,
    page_size: 20,
  });
  const { data: findingsData, isLoading: findingsLoading } =
    useContractFindings(id, findingParams);
  const reprocess = useReprocessContract();

  const findings = findingsData?.items ?? [];
  const meta = findingsData?.meta;

  const handleReprocess = async () => {
    if (!id) return;
    try {
      await reprocess.mutateAsync(id);
      toast.success("Contract reprocessing started");
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  if (contractLoading) return <LoadingSkeleton count={3} />;
  if (!contract) return <EmptyState title="Contract not found" />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <Link
        to="/contracts"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to contracts
      </Link>

      {/* Contract header */}
      <div className="glass-card-static p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center shrink-0">
              <FileText className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {contract.title}
              </h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <StatusBadge status={contract.status} />
                <RiskBadge level={contract.risk_level as RiskLevel} />
                <span className="text-xs text-slate-500">
                  {contract.page_count} pages
                </span>
                <span className="text-xs text-slate-500">
                  {contract.filename}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Created {formatDate(contract.created_at)} · Last updated{" "}
                {formatDate(contract.updated_at)}
              </p>
            </div>
          </div>
          <button
            onClick={handleReprocess}
            disabled={reprocess.isPending}
            className="btn-secondary shrink-0"
          >
            {reprocess.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Reprocess
          </button>
        </div>
      </div>

      {/* Findings section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Findings</h2>
          {meta && (
            <span className="text-xs text-slate-500">
              {meta.total} finding{meta.total !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {findingsLoading ? (
          <LoadingSkeleton count={3} />
        ) : findings.length === 0 ? (
          <EmptyState
            title="No findings"
            description="This contract hasn't been analyzed yet or has no findings"
          />
        ) : (
          <div className="space-y-3">
            {findings.map((finding) => (
              <FindingCard key={finding.id} finding={finding} />
            ))}
            {meta && meta.total_pages > 1 && (
              <Pagination
                meta={meta}
                onPageChange={(page) =>
                  setFindingParams((p) => ({ ...p, page }))
                }
                className="mt-4"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Link
              to={`/findings/${finding.id}`}
              className="text-sm font-semibold text-slate-200 hover:text-white transition-colors"
            >
              {finding.label}
            </Link>
            <StatusBadge status={finding.status} />
            <RiskBadge level={finding.risk_level} />
          </div>
          <p className="text-xs text-slate-500 mb-1">
            Type: {finding.type} · Confidence:{" "}
            <span className="text-slate-300">
              {formatPercent(finding.confidence)}
            </span>
          </p>
          {finding.reason_for_review && (
            <p className="text-xs text-amber-400/80 mt-1">
              ⚠ {finding.reason_for_review}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={`/findings/${finding.id}`}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Review
          </Link>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 transition-colors"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/8 animate-fade-in">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-500 mb-1">Extracted Value</p>
              <pre className="text-slate-300 bg-white/5 rounded-lg p-3 overflow-x-auto">
                {JSON.stringify(finding.value, null, 2)}
              </pre>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Citations</p>
              {finding.citations.map((cit) => (
                <div
                  key={cit.id}
                  className="bg-white/5 rounded-lg p-3 mb-2"
                >
                  <p className="text-slate-300 italic">"{cit.quote}"</p>
                  <p className="text-slate-500 mt-1">
                    Page {cit.page_no} · Paragraph {cit.paragraph_id}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
