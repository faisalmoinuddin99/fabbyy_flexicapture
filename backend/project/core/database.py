"""
core/database.py

SQLAlchemy 2.0+ ORM models and database connection setup.

Defines the full relational schema:
    batches ↔ documents ↔ pages ↔ fields

Features:
- Duplicate prevention via file_hash (SHA256)
- Full audit trail (created_at, processed_at, processing_time)
- JSON columns for flexible metadata/coordinates
- Proper cascading deletes
- Performance indexes on common query fields
- Thread-safe session factory
"""

from __future__ import annotations

import enum
from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    Boolean,
    Enum as SQLEnum,
    JSON,
    ForeignKey,
    Index,
    func,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
    sessionmaker,
)
from core.config import config

# =============================================================================
# SQLAlchemy 2.0+ Base & Session
# =============================================================================


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


# Thread-local session factory
engine = create_engine(
    config.database_url,
    echo=False,  # Set to True only in debug mode
    future=True,  # Enables SQLAlchemy 2.0 behavior
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


def get_db():
    """Dependency for FastAPI: yield a new session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(drop_all: bool = False) -> None:
    """
    Create all tables. Call on startup.

    Args:
        drop_all: If True, drops all tables first (use only in tests!)
    """
    if drop_all:
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


# =============================================================================
# Native Python Enums (shared with Pydantic models)
# =============================================================================


class ProcessingStatus(enum.StrEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    VALIDATING = "validating"
    EXPORTING = "exporting"
    COMPLETED = "completed"
    ERROR = "error"


class DocumentType(enum.StrEnum):
    INVOICE = "invoice"
    RECEIPT = "receipt"
    PURCHASE_ORDER = "purchase_order"
    BILL = "bill"
    STATEMENT = "statement"
    UNKNOWN = "unknown"


# =============================================================================
# ORM Models
# =============================================================================


class Batch(Base):
    __tablename__ = "batches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    filename: Mapped[str] = mapped_column(String, nullable=False, index=True)
    original_path: Mapped[str] = mapped_column(String, nullable=False)
    file_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    file_size: Mapped[Optional[int]] = mapped_column(Integer)  # bytes

    status: Mapped[ProcessingStatus] = mapped_column(
        SQLEnum(ProcessingStatus), default=ProcessingStatus.PENDING, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    processed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    processing_time: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # seconds
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    documents: Mapped[List["Document"]] = relationship(
        "Document",
        back_populates="batch",
        cascade="all, delete-orphan",
        lazy="selectin",  # Better for performance with multiple documents
    )

    __table_args__ = (
        Index("ix_batches_status_created", status, created_at.desc()),
        Index("ix_batches_file_hash", file_hash),
    )

    def __repr__(self) -> str:
        return f"<Batch id={self.id} filename='{self.filename}' status='{self.status}'>"


# core/database.py
# ... everything else stays exactly the same ...

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    batch_id: Mapped[int] = mapped_column(ForeignKey("batches.id", ondelete="CASCADE"))

    doc_type: Mapped[DocumentType] = mapped_column(
        SQLEnum(DocumentType), default=DocumentType.UNKNOWN, index=True
    )
    confidence: Mapped[float] = mapped_column(Float, default=0.0)

    # RENAME THIS LINE — this was the problem!
    extra_metadata: Mapped[dict] = mapped_column(          # ← changed from "metadata"
        JSON, default=dict, server_default="{}", nullable=False
    )

    # Relationships
    batch: Mapped[Batch] = relationship("Batch", back_populates="documents")
    pages: Mapped[List["Page"]] = relationship(
        "Page",
        back_populates="document",
        cascade="all, delete-orphan",
        order_by="Page.page_number",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Document id={self.id} type={self.doc_type} batch={self.batch_id}>"
        
class Page(Base):
    __tablename__ = "pages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"))
    page_number: Mapped[int] = mapped_column(Integer, nullable=False, index=True)

    image_path: Mapped[Optional[str]] = mapped_column(String)
    original_text: Mapped[Optional[str]] = mapped_column(Text)
    processed_text: Mapped[Optional[str]] = mapped_column(Text)
    ocr_confidence: Mapped[Optional[float]] = mapped_column(Float)

    # Relationships
    document: Mapped[Document] = relationship("Document", back_populates="pages")
    fields: Mapped[List["Field"]] = relationship(
        "Field",
        back_populates="page",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = (Index("ix_pages_document_page", document_id, page_number),)


class Field(Base):
    __tablename__ = "fields"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    page_id: Mapped[int] = mapped_column(ForeignKey("pages.id", ondelete="CASCADE"))

    name: Mapped[str] = mapped_column(String(100), index=True)
    value: Mapped[Optional[str]] = mapped_column(String)
    confidence: Mapped[Optional[float]] = mapped_column(Float)
    coordinates: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    validation_status: Mapped[str] = mapped_column(
        String(20), default="unverified", server_default="unverified"
    )
    corrected_value: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    page: Mapped[Page] = relationship("Page", back_populates="fields")

    __table_args__ = (
        Index("ix_fields_name", name),
        Index("ix_fields_page_name", page_id, name),
    )