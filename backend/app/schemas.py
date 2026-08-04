from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class BBox(BaseModel):
    x: float
    y: float
    width: float
    height: float


class Citation(BaseModel):
    id: str
    document_id: str
    page_no: int
    paragraph_id: str
    quote: str
    start_offset: int
    end_offset: int
    bbox: Optional[BBox] = None


class ConfidenceBreakdown(BaseModel):
    retrieval: float
    reranker: float
    citation_valid: bool
    ocr_quality: float
    cross_check: float


class AuditHistoryEntry(BaseModel):
    id: str
    action: str
    actor_id: str
    actor_email: Optional[str] = None
    rationale: Optional[str] = None
    previous_value: Optional[Dict[str, Any]] = None
    new_value: Optional[Dict[str, Any]] = None
    created_at: datetime


class Finding(BaseModel):
    id: str
    document_id: str
    type: str
    label: str
    value: Dict[str, Any]
    raw_value: str
    risk_level: Literal["low", "medium", "high", "critical"]
    confidence: float
    confidence_breakdown: ConfidenceBreakdown
    status: Literal["pending", "needs_review", "approved", "rejected", "edited"]
    reason_for_review: Optional[str] = None
    citations: List[Citation]
    model_version: str
    prompt_version: str
    created_at: datetime
    updated_at: datetime


class FindingDetail(Finding):
    audit_history: List[AuditHistoryEntry] = Field(default_factory=list)


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserMe(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    workspace_ids: List[str]


class Workspace(BaseModel):
    id: str
    name: str
    slug: str
    created_at: datetime


class ContractUploadResponse(BaseModel):
    document_id: str
    status: Literal["uploaded"] = "uploaded"
    run_id: str


class ContractSummary(BaseModel):
    id: str
    workspace_id: str
    title: str
    status: str
    risk_level: Optional[str] = None
    owner_id: str
    page_count: int
    created_at: datetime
    updated_at: datetime


class ContractDetail(ContractSummary):
    filename: str
    mime_type: str
    processing_run_id: Optional[str] = None


class PaginatedMeta(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int


class ContractListResponse(BaseModel):
    items: List[ContractSummary]
    meta: PaginatedMeta


class FindingListResponse(BaseModel):
    items: List[Finding]
    meta: PaginatedMeta


class PageContentResponse(BaseModel):
    document_id: str
    page_no: int
    signed_url: Optional[str] = None
    content_type: str = "application/pdf"
    expires_at: Optional[datetime] = None


class FindingReviewRequest(BaseModel):
    action: Literal["approve", "edit", "reject", "request_reprocess"]
    value: Dict[str, Any] = Field(default_factory=dict)
    rationale: Optional[str] = None
    expected_updated_at: datetime


class FindingReviewResponse(BaseModel):
    finding: FindingDetail


class ReprocessResponse(BaseModel):
    document_id: str
    run_id: str
    status: str


class EvaluationRunRequest(BaseModel):
    name: Optional[str] = None
    document_ids: Optional[List[str]] = None


class EvaluationSummary(BaseModel):
    id: str
    name: str
    status: str
    metrics: Dict[str, Any]
    created_at: datetime
    completed_at: Optional[datetime] = None


class EvaluationDetail(EvaluationSummary):
    config: Dict[str, Any] = Field(default_factory=dict)
    results: Dict[str, Any] = Field(default_factory=dict)


class EvaluationListResponse(BaseModel):
    items: List[EvaluationSummary]
    meta: PaginatedMeta


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime


class SeedResponse(BaseModel):
    message: str
    workspace_id: str
    user_emails: List[str]
    document_ids: List[str]
