import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    create_engine,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, sessionmaker

from app.config import get_settings


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:16]}"


class Base(DeclarativeBase):
    pass


class UserORM(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(64), default="reviewer")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    workspace_memberships: Mapped[list["WorkspaceMemberORM"]] = relationship(back_populates="user")


class WorkspaceORM(Base):
    __tablename__ = "workspaces"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str] = mapped_column(String(64), unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    members: Mapped[list["WorkspaceMemberORM"]] = relationship(back_populates="workspace")
    documents: Mapped[list["DocumentORM"]] = relationship(back_populates="workspace")


class WorkspaceMemberORM(Base):
    __tablename__ = "workspace_members"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(ForeignKey("workspaces.id"))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    role: Mapped[str] = mapped_column(String(64), default="member")

    workspace: Mapped["WorkspaceORM"] = relationship(back_populates="members")
    user: Mapped["UserORM"] = relationship(back_populates="workspace_memberships")


class DocumentORM(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(ForeignKey("workspaces.id"), index=True)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(512))
    filename: Mapped[str] = mapped_column(String(512))
    mime_type: Mapped[str] = mapped_column(String(128))
    status: Mapped[str] = mapped_column(String(64), default="processing")
    risk_level: Mapped[str | None] = mapped_column(String(32), nullable=True)
    page_count: Mapped[int] = mapped_column(Integer, default=0)
    storage_path: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    processing_run_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )

    workspace: Mapped["WorkspaceORM"] = relationship(back_populates="documents")
    pages: Mapped[list["PageORM"]] = relationship(back_populates="document")
    findings: Mapped[list["FindingORM"]] = relationship(back_populates="document")


class PageORM(Base):
    __tablename__ = "pages"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    document_id: Mapped[str] = mapped_column(ForeignKey("documents.id"), index=True)
    page_no: Mapped[int] = mapped_column(Integer)
    storage_path: Mapped[str | None] = mapped_column(String(1024), nullable=True)

    document: Mapped["DocumentORM"] = relationship(back_populates="pages")
    paragraphs: Mapped[list["ParagraphORM"]] = relationship(back_populates="page")


class ParagraphORM(Base):
    __tablename__ = "paragraphs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    page_id: Mapped[str] = mapped_column(ForeignKey("pages.id"), index=True)
    paragraph_id: Mapped[str] = mapped_column(String(64))
    text: Mapped[str] = mapped_column(Text)

    page: Mapped["PageORM"] = relationship(back_populates="paragraphs")


class FindingORM(Base):
    __tablename__ = "findings"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    document_id: Mapped[str] = mapped_column(ForeignKey("documents.id"), index=True)
    type: Mapped[str] = mapped_column(String(128))
    label: Mapped[str] = mapped_column(String(255))
    value: Mapped[dict] = mapped_column(JSON)
    raw_value: Mapped[str] = mapped_column(Text)
    risk_level: Mapped[str] = mapped_column(String(32))
    confidence: Mapped[float] = mapped_column(Float)
    confidence_breakdown: Mapped[dict] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String(64))
    reason_for_review: Mapped[str | None] = mapped_column(Text, nullable=True)
    model_version: Mapped[str] = mapped_column(String(64))
    prompt_version: Mapped[str] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )

    document: Mapped["DocumentORM"] = relationship(back_populates="findings")
    citations: Mapped[list["CitationORM"]] = relationship(back_populates="finding")
    audit_entries: Mapped[list["FindingAuditORM"]] = relationship(back_populates="finding")


class CitationORM(Base):
    __tablename__ = "citations"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    finding_id: Mapped[str] = mapped_column(ForeignKey("findings.id"), index=True)
    document_id: Mapped[str] = mapped_column(String(64), index=True)
    page_no: Mapped[int] = mapped_column(Integer)
    paragraph_id: Mapped[str] = mapped_column(String(64))
    quote: Mapped[str] = mapped_column(Text)
    start_offset: Mapped[int] = mapped_column(Integer)
    end_offset: Mapped[int] = mapped_column(Integer)
    bbox: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    finding: Mapped["FindingORM"] = relationship(back_populates="citations")


class FindingAuditORM(Base):
    __tablename__ = "finding_audits"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    finding_id: Mapped[str] = mapped_column(ForeignKey("findings.id"), index=True)
    action: Mapped[str] = mapped_column(String(64))
    actor_id: Mapped[str] = mapped_column(String(64))
    rationale: Mapped[str | None] = mapped_column(Text, nullable=True)
    previous_value: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    new_value: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    finding: Mapped["FindingORM"] = relationship(back_populates="audit_entries")


class ProcessingRunORM(Base):
    __tablename__ = "processing_runs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    document_id: Mapped[str] = mapped_column(String(64), index=True)
    status: Mapped[str] = mapped_column(String(64), default="queued")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class EvaluationORM(Base):
    __tablename__ = "evaluations"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(String(64), index=True)
    name: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(64), default="running")
    config: Mapped[dict] = mapped_column(JSON, default=dict)
    metrics: Mapped[dict] = mapped_column(JSON, default=dict)
    results: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


settings = get_settings()
engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
