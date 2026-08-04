import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Upload,
  FileText,
  X,
  Loader2,
  Filter,
} from "lucide-react";
import { useContracts, useUploadContract } from "@/hooks/use-contracts";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { RiskBadge } from "@/components/common/risk-badge";
import { StatusBadge } from "@/components/common/status-badge";
import { Pagination } from "@/components/common/pagination";
import { EmptyState } from "@/components/common/empty-state";
import { TableSkeleton } from "@/components/common/loading-skeleton";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { ContractListParams, RiskLevel } from "@/types/api";
import { extractApiError } from "@/api/client";

export default function ContractsPage() {
  const [params, setParams] = useState<ContractListParams>({
    page: 1,
    page_size: 20,
  });
  const [showUpload, setShowUpload] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRisk, setFilterRisk] = useState("");

  const { data, isLoading } = useContracts({
    ...params,
    status: filterStatus || undefined,
    risk_level: filterRisk || undefined,
  });
  const contracts = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Contracts</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage and review your contract portfolio
          </p>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn-primary">
          <Upload className="h-4 w-4" />
          Upload Contract
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card-static p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowFilters((s) => !s)}
            className={`btn-secondary text-xs py-2 px-3 ${showFilters ? "border-indigo-500/50 text-indigo-400" : ""}`}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>
          {showFilters && (
            <>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setParams((p) => ({ ...p, page: 1 }));
                }}
                className="input-field w-auto text-xs py-2 px-3"
              >
                <option value="">All statuses</option>
                <option value="uploaded">Uploaded</option>
                <option value="processing">Processing</option>
                <option value="ready">Ready</option>
              </select>
              <select
                value={filterRisk}
                onChange={(e) => {
                  setFilterRisk(e.target.value);
                  setParams((p) => ({ ...p, page: 1 }));
                }}
                className="input-field w-auto text-xs py-2 px-3"
              >
                <option value="">All risk levels</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              {(filterStatus || filterRisk) && (
                <button
                  onClick={() => {
                    setFilterStatus("");
                    setFilterRisk("");
                  }}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Clear filters
                </button>
              )}
            </>
          )}
          {meta && (
            <span className="text-xs text-slate-500 ml-auto">
              {meta.total} contract{meta.total !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : contracts.length === 0 ? (
        <EmptyState
          icon={<Search className="h-8 w-8 text-slate-400" />}
          title="No contracts found"
          description={
            filterStatus || filterRisk
              ? "Try adjusting your filters"
              : "Upload your first contract to get started"
          }
          action={
            !filterStatus && !filterRisk ? (
              <button
                onClick={() => setShowUpload(true)}
                className="btn-primary text-sm"
              >
                <Upload className="h-4 w-4" />
                Upload Contract
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="glass-card-static overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    Contract
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    Risk
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    Pages
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <tr
                    key={contract.id}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <Link
                        to={`/contracts/${contract.id}`}
                        className="flex items-center gap-3"
                      >
                        <div className="h-9 w-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/10 transition-colors">
                          <FileText className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                        </div>
                        <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                          {contract.title}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={contract.status} />
                    </td>
                    <td className="px-5 py-4">
                      <RiskBadge level={contract.risk_level as RiskLevel} />
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">
                      {contract.page_count}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">
                      {formatDate(contract.created_at)}
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

      {/* Upload modal */}
      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} />
      )}
    </div>
  );
}

function UploadModal({ onClose }: { onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const { data: workspaces } = useWorkspaces();
  const upload = useUploadContract();

  // Auto-select first workspace
  if (!workspaceId && workspaces && workspaces.length > 0) {
    setWorkspaceId(workspaces[0].id);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !workspaceId) return;

    try {
      await upload.mutateAsync({
        file,
        workspaceId,
        title: title || undefined,
      });
      toast.success("Contract uploaded successfully");
      onClose();
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card-static w-full max-w-lg p-6 animate-scale-in m-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">
            Upload Contract
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all"
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-5 w-5 text-indigo-400" />
                <span className="text-sm text-slate-200">{file.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-slate-500 hover:text-white ml-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400">
                  Click to select a file or drag & drop
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  PDF, DOC, DOCX
                </p>
              </>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Title (optional)
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contract title"
              className="input-field"
            />
          </div>

          {/* Workspace */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Workspace
            </label>
            <select
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              className="input-field"
            >
              {workspaces?.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || !workspaceId || upload.isPending}
              className="btn-primary"
            >
              {upload.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {upload.isPending ? "Uploading…" : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
