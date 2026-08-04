import { Link } from "react-router-dom";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Upload,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useContracts } from "@/hooks/use-contracts";
import { useAuth } from "@/contexts/auth-context";
import { RiskBadge } from "@/components/common/risk-badge";
import { StatusBadge } from "@/components/common/status-badge";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { formatDate } from "@/lib/utils";
import type { RiskLevel } from "@/types/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useContracts({ page: 1, page_size: 100 });

  const contracts = data?.items ?? [];
  const total = contracts.length;
  const highRisk = contracts.filter(
    (c) => c.risk_level === "high" || c.risk_level === "critical",
  ).length;
  const ready = contracts.filter((c) => c.status === "ready").length;
  const processing = contracts.filter((c) => c.status === "processing").length;

  const statCards = [
    {
      label: "Total Contracts",
      value: total,
      icon: FileText,
      gradient: "from-indigo-500/20 to-violet-500/20",
      iconColor: "text-indigo-400",
    },
    {
      label: "High Risk",
      value: highRisk,
      icon: AlertTriangle,
      gradient: "from-orange-500/20 to-red-500/20",
      iconColor: "text-orange-400",
    },
    {
      label: "Ready",
      value: ready,
      icon: CheckCircle2,
      gradient: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-400",
    },
    {
      label: "Processing",
      value: processing,
      icon: Clock,
      gradient: "from-violet-500/20 to-purple-500/20",
      iconColor: "text-violet-400",
    },
  ];

  if (isLoading) return <LoadingSkeleton count={4} />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.full_name?.split(" ")[0]}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Here's an overview of your contract intelligence
          </p>
        </div>
        <Link to="/contracts" className="btn-primary">
          <Upload className="h-4 w-4" />
          Upload Contract
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="glass-card p-5 group cursor-default"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">
                  {card.label}
                </p>
                <p className="text-3xl font-bold text-white mt-1">
                  {card.value}
                </p>
              </div>
              <div
                className={`rounded-xl bg-gradient-to-br ${card.gradient} p-2.5`}
              >
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Risk distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card-static p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              Recent Contracts
            </h2>
            <Link
              to="/contracts"
              className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {contracts.slice(0, 5).map((contract) => (
              <Link
                key={contract.id}
                to={`/contracts/${contract.id}`}
                className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                      {contract.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(contract.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <RiskBadge level={contract.risk_level as RiskLevel} />
                  <StatusBadge status={contract.status} />
                </div>
              </Link>
            ))}
            {contracts.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                No contracts yet. Upload your first contract to get started.
              </div>
            )}
          </div>
        </div>

        {/* Risk breakdown */}
        <div className="glass-card-static p-6">
          <h2 className="text-lg font-semibold text-white mb-5">
            Risk Distribution
          </h2>
          <div className="space-y-4">
            {(["critical", "high", "medium", "low"] as const).map((level) => {
              const count = contracts.filter(
                (c) => c.risk_level === level,
              ).length;
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={level}>
                  <div className="flex items-center justify-between mb-1.5">
                    <RiskBadge level={level} />
                    <span className="text-sm font-medium text-slate-300">
                      {count}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        level === "critical"
                          ? "bg-red-500"
                          : level === "high"
                            ? "bg-orange-500"
                            : level === "medium"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
