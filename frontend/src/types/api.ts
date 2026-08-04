export type RiskLevel = "critical" | "high" | "medium" | "low";
export type ContractStatus = "uploaded" | "processing" | "ready" | "error";
export type FindingStatus = "pending" | "needs_review" | "approved" | "rejected" | "edited";
export type EvaluationStatus = "running" | "completed" | "failed";
export type ReviewAction = "approve" | "reject" | "edit" | "request_reprocess";

export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  created_at: string;
}

export interface Contract {
  id: string;
  workspace_id: string;
  title: string;
  filename: string;
  status: ContractStatus;
  risk_level?: RiskLevel;
  page_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Citation {
  id: string;
  finding_id: string;
  document_id: string;
  page_no: number;
  paragraph_id: string;
  quote: string;
  bbox?: any;
}

export interface AuditEntry {
  id: string;
  finding_id: string;
  actor_id: string;
  actor_email?: string;
  action: string;
  rationale?: string;
  created_at: string;
}

export interface Finding {
  id: string;
  document_id: string;
  type: string;
  label: string;
  value: Record<string, unknown>;
  confidence: number;
  confidence_breakdown: Record<string, unknown>;
  status: FindingStatus;
  risk_level: RiskLevel;
  reason_for_review?: string;
  citations: Citation[];
  audit_history: AuditEntry[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginatedMeta;
}

export interface ContractListParams {
  page?: number;
  page_size?: number;
  workspace_id?: string;
  status?: string;
  risk_level?: string;
}

export interface FindingListParams {
  page?: number;
  page_size?: number;
  status?: string;
  risk_level?: string;
}

export interface FindingReviewRequest {
  action: ReviewAction;
  rationale?: string;
  value?: Record<string, unknown>;
  expected_updated_at: string;
}

export interface EvaluationMetrics {
  precision: number;
  recall: number;
  f1: number;
}

export interface Evaluation {
  id: string;
  name: string;
  status: EvaluationStatus;
  metrics: EvaluationMetrics;
  created_at: string;
  completed_at?: string;
}

export interface EvaluationListParams {
  page?: number;
  page_size?: number;
}

export interface EvaluationRunRequest {
  document_ids?: string[];
  name?: string;
}
