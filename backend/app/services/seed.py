from sqlalchemy.orm import Session

from app.auth import hash_password
from app.db.models import (
    CitationORM,
    DocumentORM,
    EvaluationORM,
    FindingAuditORM,
    FindingORM,
    PageORM,
    ParagraphORM,
    UserORM,
    WorkspaceMemberORM,
    WorkspaceORM,
    new_id,
    utcnow,
)

SEED_PASSWORD = "ClauseLens123!"


def run_seed(db: Session) -> dict:
    db.query(FindingAuditORM).delete()
    db.query(CitationORM).delete()
    db.query(FindingORM).delete()
    db.query(ParagraphORM).delete()
    db.query(PageORM).delete()
    db.query(EvaluationORM).delete()
    db.query(DocumentORM).delete()
    db.query(WorkspaceMemberORM).delete()
    db.query(WorkspaceORM).delete()
    db.query(UserORM).delete()
    db.commit()

    workspace_id = new_id("ws")
    db.add(WorkspaceORM(id=workspace_id, name="Acme Legal", slug="acme-legal"))

    users_spec = [
        ("admin@clauselens.local", "Admin User", "admin"),
        ("reviewer@clauselens.local", "Review User", "reviewer"),
    ]
    user_ids: list[str] = []
    for email, name, role in users_spec:
        uid = new_id("usr")
        user_ids.append(uid)
        db.add(
            UserORM(
                id=uid,
                email=email,
                full_name=name,
                role=role,
                hashed_password=hash_password(SEED_PASSWORD),
            )
        )
        db.add(
            WorkspaceMemberORM(
                id=new_id("wsm"),
                workspace_id=workspace_id,
                user_id=uid,
                role=role,
            )
        )

    paragraph_text = (
        "The Agreement renews for successive one-year terms unless either party provides "
        "written notice of non-renewal at least ninety (90) days prior to the end of the then-current term."
    )
    quote = "renews for successive one-year terms unless either party provides written notice"
    start_offset = paragraph_text.index(quote)
    end_offset = start_offset + len(quote)

    document_ids: list[str] = []
    contracts = [
        ("Master Services Agreement", "msa-demo.pdf", "low"),
        ("Software License Agreement", "sla-demo.pdf", "medium"),
        ("NDA — Vendor Onboarding", "nda-demo.pdf", "high"),
    ]

    for idx, (title, filename, risk) in enumerate(contracts):
        doc_id = new_id("doc")
        document_ids.append(doc_id)
        owner = user_ids[idx % len(user_ids)]
        db.add(
            DocumentORM(
                id=doc_id,
                workspace_id=workspace_id,
                owner_id=owner,
                title=title,
                filename=filename,
                mime_type="application/pdf",
                status="ready",
                risk_level=risk,
                page_count=3,
                storage_path=None,
                processing_run_id=new_id("run"),
            )
        )

        for page_no in (1, 2, 3):
            page_id = new_id("pg")
            db.add(PageORM(id=page_id, document_id=doc_id, page_no=page_no))
            db.add(
                ParagraphORM(
                    id=new_id("para"),
                    page_id=page_id,
                    paragraph_id=f"p{page_no:04d}",
                    text=paragraph_text if page_no == 1 else f"Page {page_no} boilerplate. {paragraph_text}",
                )
            )

        finding_id = new_id("finding")
        db.add(
            FindingORM(
                id=finding_id,
                document_id=doc_id,
                type="renewal_date",
                label="Renewal date",
                value={"date": "2027-05-31", "renewal_term_months": 12},
                raw_value=paragraph_text,
                risk_level="medium",
                confidence=0.86,
                confidence_breakdown={
                    "retrieval": 0.91,
                    "reranker": 0.88,
                    "citation_valid": True,
                    "ocr_quality": 0.99,
                    "cross_check": 0.80,
                },
                status="needs_review",
                reason_for_review="Confidence below auto-approval threshold",
                model_version="extractor-v1",
                prompt_version="2026-08-03.1",
            )
        )
        db.add(
            CitationORM(
                id=new_id("cit"),
                finding_id=finding_id,
                document_id=doc_id,
                page_no=1,
                paragraph_id="p0001",
                quote=quote,
                start_offset=start_offset,
                end_offset=end_offset,
                bbox={"x": 72, "y": 210, "width": 420, "height": 60},
            )
        )
        db.add(
            FindingAuditORM(
                id=new_id("aud"),
                finding_id=finding_id,
                action="created",
                actor_id=user_ids[0],
                rationale="Seeded finding",
                new_value={"date": "2027-05-31", "renewal_term_months": 12},
            )
        )

    eval_id = new_id("eval")
    db.add(
        EvaluationORM(
            id=eval_id,
            workspace_id=workspace_id,
            name="Seed baseline evaluation",
            status="completed",
            config={"document_ids": document_ids},
            metrics={
                "precision": 0.91,
                "recall": 0.87,
                "f1": 0.89,
                "citation_accuracy": 0.96,
            },
            results={"documents": len(document_ids)},
            completed_at=utcnow(),
        )
    )

    db.commit()
    return {
        "workspace_id": workspace_id,
        "user_emails": [u[0] for u in users_spec],
        "document_ids": document_ids,
    }
