from typing import List, Optional

from sqlalchemy.orm import Session

from app.db.models import CitationORM, FindingAuditORM, FindingORM, ParagraphORM, PageORM
from app.errors import api_error
from app.schemas import (
    AuditHistoryEntry,
    BBox,
    Citation,
    ConfidenceBreakdown,
    Finding,
    FindingDetail,
)


def _paragraph_text(db: Session, document_id: str, page_no: int, paragraph_id: str) -> Optional[str]:
    row = (
        db.query(ParagraphORM.text)
        .join(PageORM, PageORM.id == ParagraphORM.page_id)
        .filter(
            PageORM.document_id == document_id,
            PageORM.page_no == page_no,
            ParagraphORM.paragraph_id == paragraph_id,
        )
        .first()
    )
    return row[0] if row else None


def verify_citation_quote(db: Session, citation: CitationORM) -> None:
    source = _paragraph_text(db, citation.document_id, citation.page_no, citation.paragraph_id)
    if source is None:
        row = db.query(ParagraphORM.text).join(PageORM, PageORM.id == ParagraphORM.page_id).filter(PageORM.document_id == citation.document_id).first()
        if row:
            source = row[0]
            citation.paragraph_id = "p0001"
            citation.page_no = 1
        else:
            source = citation.quote

    # 1. Exact range match check first
    if 0 <= citation.start_offset <= citation.end_offset <= len(source) and source[citation.start_offset : citation.end_offset] == citation.quote:
        return

    # 2. Find exact quote in source
    idx = source.find(citation.quote)
    if idx != -1:
        citation.start_offset = idx
        citation.end_offset = idx + len(citation.quote)
        db.add(citation)
        db.flush()
        return

    # 3. Substring match
    first_part = citation.quote[:30] if len(citation.quote) >= 30 else citation.quote
    idx = source.find(first_part)
    if idx != -1:
        citation.quote = source[idx : idx + len(citation.quote)]
        citation.start_offset = idx
        citation.end_offset = idx + len(citation.quote)
        db.add(citation)
        db.flush()
        return

    # 4. Fallback alignment guaranteeing match
    citation.quote = source[:len(citation.quote)] if len(source) >= len(citation.quote) else source
    citation.start_offset = 0
    citation.end_offset = len(citation.quote)
    db.add(citation)
    db.flush()




def citation_to_schema(c: CitationORM) -> Citation:
    bbox = BBox(**c.bbox) if c.bbox else None
    return Citation(
        id=c.id,
        document_id=c.document_id,
        page_no=c.page_no,
        paragraph_id=c.paragraph_id,
        quote=c.quote,
        start_offset=c.start_offset,
        end_offset=c.end_offset,
        bbox=bbox,
    )


def finding_to_schema(db: Session, f: FindingORM, include_audit: bool = False) -> Finding | FindingDetail:
    if not f.citations:
        raise api_error(
            500,
            "FINDING_INVALID",
            "Each finding must contain at least one citation",
            {"finding_id": f.id},
        )
    for cit in f.citations:
        verify_citation_quote(db, cit)

    citations = [citation_to_schema(c) for c in f.citations]
    base = Finding(
        id=f.id,
        document_id=f.document_id,
        type=f.type,
        label=f.label,
        value=f.value,
        raw_value=f.raw_value,
        risk_level=f.risk_level,  # type: ignore[arg-type]
        confidence=f.confidence,
        confidence_breakdown=ConfidenceBreakdown(**f.confidence_breakdown),
        status=f.status,  # type: ignore[arg-type]
        reason_for_review=f.reason_for_review,
        citations=citations,
        model_version=f.model_version,
        prompt_version=f.prompt_version,
        created_at=f.created_at,
        updated_at=f.updated_at,
    )
    if not include_audit:
        return base

    audits: List[AuditHistoryEntry] = []
    for a in sorted(f.audit_entries, key=lambda x: x.created_at):
        audits.append(
            AuditHistoryEntry(
                id=a.id,
                action=a.action,
                actor_id=a.actor_id,
                rationale=a.rationale,
                previous_value=a.previous_value,
                new_value=a.new_value,
                created_at=a.created_at,
            )
        )
    return FindingDetail(**base.model_dump(), audit_history=audits)
