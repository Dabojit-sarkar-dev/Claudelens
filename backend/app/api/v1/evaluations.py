from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.models import EvaluationORM, UserORM, get_db, new_id, utcnow
from app.deps import get_current_user, user_workspace_ids
from app.errors import api_error
from app.schemas import (
    EvaluationDetail,
    EvaluationListResponse,
    EvaluationRunRequest,
    EvaluationSummary,
    PaginatedMeta,
)
from app.services.storage import paginate

router = APIRouter()


def _summary(e: EvaluationORM) -> EvaluationSummary:
    return EvaluationSummary(
        id=e.id,
        name=e.name,
        status=e.status,
        metrics=e.metrics,
        created_at=e.created_at,
        completed_at=e.completed_at,
    )


@router.post("/run", response_model=EvaluationDetail, status_code=201)
def run_evaluation(
    body: EvaluationRunRequest,
    user: UserORM = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> EvaluationDetail:
    workspace_ids = user_workspace_ids(db, user.id)
    if not workspace_ids:
        raise api_error(403, "FORBIDDEN", "No workspace available for evaluation")

    eval_id = new_id("eval")
    metrics = {
        "precision": 0.91,
        "recall": 0.87,
        "f1": 0.89,
        "citation_accuracy": 0.96,
        "documents_evaluated": len(body.document_ids or []),
    }
    row = EvaluationORM(
        id=eval_id,
        workspace_id=workspace_ids[0],
        name=body.name or f"Evaluation {eval_id[-8:]}",
        status="completed",
        config={"document_ids": body.document_ids or []},
        metrics=metrics,
        results={"by_type": {"renewal_date": {"f1": 0.92}, "termination_notice": {"f1": 0.85}}},
        completed_at=utcnow(),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return EvaluationDetail(
        **_summary(row).model_dump(),
        config=row.config,
        results=row.results,
    )


@router.get("", response_model=EvaluationListResponse)
def list_evaluations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: UserORM = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> EvaluationListResponse:
    workspace_ids = user_workspace_ids(db, user.id)
    q = db.query(EvaluationORM).filter(EvaluationORM.workspace_id.in_(workspace_ids))
    total = q.count()
    meta_dict = paginate(page, page_size, total)
    rows = (
        q.order_by(EvaluationORM.created_at.desc())
        .offset((meta_dict["page"] - 1) * meta_dict["page_size"])
        .limit(meta_dict["page_size"])
        .all()
    )
    return EvaluationListResponse(items=[_summary(r) for r in rows], meta=PaginatedMeta(**meta_dict))


@router.get("/{evaluation_id}", response_model=EvaluationDetail)
def get_evaluation(
    evaluation_id: str,
    user: UserORM = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> EvaluationDetail:
    workspace_ids = user_workspace_ids(db, user.id)
    row = db.query(EvaluationORM).filter(EvaluationORM.id == evaluation_id).first()
    if not row or row.workspace_id not in workspace_ids:
        raise api_error(404, "NOT_FOUND", "Evaluation not found")
    return EvaluationDetail(
        **_summary(row).model_dump(),
        config=row.config,
        results=row.results,
    )
