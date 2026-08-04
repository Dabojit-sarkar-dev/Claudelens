from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.db.models import FindingAuditORM, FindingORM, UserORM, get_db, new_id, utcnow
from app.deps import ensure_document_access, get_current_user
from app.errors import api_error
from app.schemas import FindingDetail, FindingReviewRequest, FindingReviewResponse
from app.services.citations import finding_to_schema

router = APIRouter()


@router.get("/{finding_id}", response_model=FindingDetail)
def get_finding(
    finding_id: str,
    user: UserORM = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FindingDetail:
    finding = (
        db.query(FindingORM)
        .options(
            joinedload(FindingORM.citations),
            joinedload(FindingORM.audit_entries),
        )
        .filter(FindingORM.id == finding_id)
        .first()
    )
    if not finding:
        raise api_error(404, "NOT_FOUND", "Finding not found")
    ensure_document_access(db, user, finding.document_id)
    result = finding_to_schema(db, finding, include_audit=True)
    assert isinstance(result, FindingDetail)
    return result


@router.post("/{finding_id}/review", response_model=FindingReviewResponse)
def review_finding(
    finding_id: str,
    body: FindingReviewRequest,
    user: UserORM = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FindingReviewResponse:
    finding = (
        db.query(FindingORM)
        .options(
            joinedload(FindingORM.citations),
            joinedload(FindingORM.audit_entries),
        )
        .filter(FindingORM.id == finding_id)
        .first()
    )
    if not finding:
        raise api_error(404, "NOT_FOUND", "Finding not found")
    ensure_document_access(db, user, finding.document_id)

    if finding.updated_at != body.expected_updated_at:
        raise api_error(
            409,
            "CONFLICT",
            "Finding was modified by another user",
            {"expected_updated_at": body.expected_updated_at.isoformat()},
        )

    if body.action in ("edit", "reject") and not (body.rationale and body.rationale.strip()):
        raise api_error(422, "VALIDATION_ERROR", "rationale is required for edit and reject")

    previous = dict(finding.value)
    action = body.action
    if action == "approve":
        finding.status = "approved"
    elif action == "reject":
        finding.status = "rejected"
    elif action == "edit":
        finding.status = "edited"
        finding.value = body.value
    elif action == "request_reprocess":
        finding.status = "pending"
        finding.reason_for_review = "Reprocess requested by reviewer"

    finding.updated_at = utcnow()
    audit = FindingAuditORM(
        id=new_id("aud"),
        finding_id=finding.id,
        action=action,
        actor_id=user.id,
        rationale=body.rationale,
        previous_value=previous,
        new_value=finding.value if action == "edit" else None,
    )
    db.add(audit)
    db.commit()
    db.refresh(finding)

    detail = finding_to_schema(db, finding, include_audit=True)
    assert isinstance(detail, FindingDetail)
    return FindingReviewResponse(finding=detail)
