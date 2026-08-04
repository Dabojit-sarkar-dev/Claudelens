import math
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.models import DocumentORM, EvaluationORM, FindingORM, ProcessingRunORM, new_id, utcnow
from app.errors import api_error

STORAGE_ROOT = Path(__file__).resolve().parents[2] / "storage"
STORAGE_ROOT.mkdir(parents=True, exist_ok=True)


def save_upload(workspace_id: str, document_id: str, filename: str, content: bytes) -> str:
    dest_dir = STORAGE_ROOT / workspace_id / document_id
    dest_dir.mkdir(parents=True, exist_ok=True)
    path = dest_dir / filename
    path.write_bytes(content)
    return str(path)


def page_signed_url(document_id: str, page_no: int) -> tuple[str, datetime]:
    settings = get_settings()
    expires = utcnow() + timedelta(hours=1)
    # Local dev: tokenized path served by API (see pages router stream fallback)
    token = f"{document_id}:{page_no}:{int(expires.timestamp())}"
    base = "http://localhost:8000" if settings.use_mock_api else "http://localhost:8000"
    url = f"{base}/v1/contracts/{document_id}/pages/{page_no}/stream?token={token}"
    return url, expires


def complete_processing_run(db: Session, run_id: str) -> None:
    run = db.query(ProcessingRunORM).filter(ProcessingRunORM.id == run_id).first()
    if not run:
        return
    doc = db.query(DocumentORM).filter(DocumentORM.id == run.document_id).first()
    if doc:
        doc.status = "ready"
        doc.updated_at = utcnow()
        if not doc.risk_level:
            doc.risk_level = "medium"
    run.status = "completed"
    run.completed_at = utcnow()
    db.commit()


def paginate(page: int, page_size: int, total: int) -> dict:
    page = max(1, page)
    page_size = min(max(1, page_size), 100)
    total_pages = max(1, math.ceil(total / page_size)) if total else 0
    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
    }


def parse_date_filter(value: Optional[str], field: str) -> Optional[datetime]:
    if not value:
        return None
    try:
        if len(value) == 10:
            return datetime.fromisoformat(value).replace(tzinfo=timezone.utc)
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise api_error(422, "VALIDATION_ERROR", f"Invalid {field} date format", {}) from exc
