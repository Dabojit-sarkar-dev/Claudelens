import io
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload

from app.config import get_settings
from app.db.models import DocumentORM, FindingORM, PageORM, ProcessingRunORM, UserORM, get_db, new_id, utcnow
from app.deps import ensure_document_access, get_current_user, user_workspace_ids
from app.errors import api_error
from app.schemas import (
    ContractDetail,
    ContractListResponse,
    ContractSummary,
    ContractUploadResponse,
    FindingListResponse,
    PageContentResponse,
    PaginatedMeta,
    ReprocessResponse,
)
from app.services.citations import finding_to_schema
from app.services.storage import complete_processing_run, paginate, parse_date_filter, page_signed_url, save_upload

router = APIRouter()


def _summary(doc: DocumentORM) -> ContractSummary:
    return ContractSummary(
        id=doc.id,
        workspace_id=doc.workspace_id,
        title=doc.title,
        status=doc.status,
        risk_level=doc.risk_level,
        owner_id=doc.owner_id,
        page_count=doc.page_count,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
    )


@router.post("", status_code=202, response_model=ContractUploadResponse)
async def upload_contract(
    file: UploadFile = File(...),
    workspace_id: str = Form(...),
    title: Optional[str] = Form(None),
    user: UserORM = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ContractUploadResponse:
    allowed = user_workspace_ids(db, user.id)
    if workspace_id not in allowed:
        raise api_error(403, "FORBIDDEN", "You do not have access to this workspace")

    content = await file.read()
    if not content:
        raise api_error(422, "VALIDATION_ERROR", "Uploaded file is empty")

    document_id = new_id("doc")
    filename = file.filename or "contract.pdf"
    mime = file.content_type or "application/pdf"
    path = save_upload(workspace_id, document_id, filename, content)

    run_id = new_id("run")
    doc = DocumentORM(
        id=document_id,
        workspace_id=workspace_id,
        owner_id=user.id,
        title=title or filename,
        filename=filename,
        mime_type=mime,
        status="uploaded" if get_settings().use_mock_api else "processing",
        page_count=1,
        storage_path=path,
        processing_run_id=run_id,
    )
    run = ProcessingRunORM(id=run_id, document_id=document_id, status="queued")
    db.add(doc)
    db.add(run)
    db.commit()

    if get_settings().use_mock_api:
        complete_processing_run(db, run_id)
    else:
        # Synchronous lightweight processing for local dev (no external queue)
        complete_processing_run(db, run_id)

    return ContractUploadResponse(document_id=document_id, status="uploaded", run_id=run_id)


@router.get("", response_model=ContractListResponse)
def list_contracts(
    status: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    owner_id: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: UserORM = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ContractListResponse:
    allowed = user_workspace_ids(db, user.id)
    if not allowed:
        return ContractListResponse(
            items=[], meta=PaginatedMeta(page=page, page_size=page_size, total=0, total_pages=0)
        )

    q = db.query(DocumentORM).filter(DocumentORM.workspace_id.in_(allowed))
    if status:
        q = q.filter(DocumentORM.status == status)
    if risk_level:
        q = q.filter(DocumentORM.risk_level == risk_level)
    if owner_id:
        q = q.filter(DocumentORM.owner_id == owner_id)
    df = parse_date_filter(date_from, "date_from")
    dt = parse_date_filter(date_to, "date_to")
    if df:
        q = q.filter(DocumentORM.created_at >= df)
    if dt:
        q = q.filter(DocumentORM.created_at <= dt)

    total = q.count()
    meta_dict = paginate(page, page_size, total)
    rows = (
        q.order_by(DocumentORM.created_at.desc())
        .offset((meta_dict["page"] - 1) * meta_dict["page_size"])
        .limit(meta_dict["page_size"])
        .all()
    )
    return ContractListResponse(
        items=[_summary(r) for r in rows],
        meta=PaginatedMeta(**meta_dict),
    )


@router.get("/{contract_id}", response_model=ContractDetail)
def get_contract(
    contract_id: str,
    user: UserORM = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ContractDetail:
    doc = ensure_document_access(db, user, contract_id)
    return ContractDetail(
        **_summary(doc).model_dump(),
        filename=doc.filename,
        mime_type=doc.mime_type,
        processing_run_id=doc.processing_run_id,
    )


@router.get("/{contract_id}/findings", response_model=FindingListResponse)
def list_findings(
    contract_id: str,
    type: Optional[str] = Query(None, alias="type"),
    risk_level: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    min_confidence: Optional[float] = Query(None, ge=0, le=1),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: UserORM = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FindingListResponse:
    ensure_document_access(db, user, contract_id)
    q = (
        db.query(FindingORM)
        .options(joinedload(FindingORM.citations))
        .filter(FindingORM.document_id == contract_id)
    )
    if type:
        q = q.filter(FindingORM.type == type)
    if risk_level:
        q = q.filter(FindingORM.risk_level == risk_level)
    if status:
        q = q.filter(FindingORM.status == status)
    if min_confidence is not None:
        q = q.filter(FindingORM.confidence >= min_confidence)

    total = q.count()
    meta_dict = paginate(page, page_size, total)
    rows = (
        q.order_by(FindingORM.created_at.desc())
        .offset((meta_dict["page"] - 1) * meta_dict["page_size"])
        .limit(meta_dict["page_size"])
        .all()
    )
    items = [finding_to_schema(db, f) for f in rows]  # type: ignore[misc]
    return FindingListResponse(items=items, meta=PaginatedMeta(**meta_dict))


@router.get("/{contract_id}/pages/{page_no}", response_model=PageContentResponse)
def get_page(
    contract_id: str,
    page_no: int,
    user: UserORM = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PageContentResponse:
    doc = ensure_document_access(db, user, contract_id)
    page = (
        db.query(PageORM)
        .filter(PageORM.document_id == contract_id, PageORM.page_no == page_no)
        .first()
    )
    if not page and doc.storage_path:
        url, expires = page_signed_url(contract_id, page_no)
        return PageContentResponse(
            document_id=contract_id,
            page_no=page_no,
            signed_url=url,
            content_type=doc.mime_type,
            expires_at=expires,
        )
    if not page:
        raise api_error(404, "NOT_FOUND", "Page not found")

    url, expires = page_signed_url(contract_id, page_no)
    return PageContentResponse(
        document_id=contract_id,
        page_no=page_no,
        signed_url=url,
        content_type=doc.mime_type,
        expires_at=expires,
    )


@router.get("/{contract_id}/pages/{page_no}/stream")
def stream_page(
    contract_id: str,
    page_no: int,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    # Dev streaming endpoint referenced by signed_url; token is not cryptographically signed in dev
    parts = token.split(":")
    if len(parts) != 3 or parts[0] != contract_id or int(parts[1]) != page_no:
        raise api_error(403, "FORBIDDEN", "Invalid page token")

    doc = db.query(DocumentORM).filter(DocumentORM.id == contract_id).first()
    if not doc or not doc.storage_path:
        raise api_error(404, "NOT_FOUND", "Document file not found")

    from pathlib import Path

    data = Path(doc.storage_path).read_bytes()
    return StreamingResponse(io.BytesIO(data), media_type=doc.mime_type)


@router.post("/{contract_id}/reprocess", response_model=ReprocessResponse)
def reprocess_contract(
    contract_id: str,
    user: UserORM = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReprocessResponse:
    doc = ensure_document_access(db, user, contract_id)
    run_id = new_id("run")
    run = ProcessingRunORM(id=run_id, document_id=contract_id, status="queued")
    doc.status = "processing"
    doc.processing_run_id = run_id
    doc.updated_at = utcnow()
    db.add(run)
    db.commit()
    complete_processing_run(db, run_id)
    return ReprocessResponse(document_id=contract_id, run_id=run_id, status="completed")
