"""
core/models.py

Pydantic v2 data models for the Invoice Automation system.

These models define:
- Domain enums (status, document types)
- Extracted field structure with confidence & coordinates
- Per-page and full document data
- API request/response schemas
- Settings management models

All models use `from_attributes = True` (ORM mode) for easy conversion
from SQLAlchemy objects and clean OpenAPI documentation.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from enum import StrEnum

from pydantic import (
    BaseModel,
    Field,
    ConfigDict,
    field_validator,
    model_validator,
)


# =============================================================================
# Domain Enums
# =============================================================================

class ProcessingStatus(StrEnum):
    """Current processing state of a document in the pipeline."""
    PENDING = "pending"
    PROCESSING = "processing"
    VALIDATING = "validating"
    EXPORTING = "exporting"
    COMPLETED = "completed"
    ERROR = "error"


class DocumentType(StrEnum):
    """Supported document types with automatic detection fallback."""
    INVOICE = "invoice"
    RECEIPT = "receipt"
    PURCHASE_ORDER = "purchase_order"
    BILL = "bill"
    STATEMENT = "statement"
    UNKNOWN = "unknown"


# =============================================================================
# Core Extraction Models
# =============================================================================

class FieldData(BaseModel):
    """
    Represents a single extracted field (e.g., invoice number, total amount).

    Attributes:
        name: Human-readable field name (e.g., "invoice_number", "total_amount")
        value: Extracted raw value as string
        confidence: Model confidence score between 0.0 and 1.0
        coordinates: Optional bounding box [x1, y1, x2, y2] in points or pixels
        validation_status: Manual verification state
    """
    name: str = Field(..., description="Field identifier (e.g., invoice_number)")
    value: str = Field(..., description="Extracted value as string")
    confidence: float = Field(
        ..., ge=0.0, le=1.0, description="Extraction confidence score"
    )
    coordinates: Optional[Dict[str, float]] = Field(
        None,
        description="Bounding box coordinates: {'x1': 100.0, 'y1': 200.0, 'x2': 300.0, 'y2': 250.0}",
    )
    validation_status: Literal["unverified", "verified", "rejected"] = Field(
        default="unverified",
        description="Manual review status",
    )

    model_config = ConfigDict(from_attributes=True)


class PageData(BaseModel):
    """
    Represents a single page in a multi-page document (PDF/TIFF).
    """
    page_number: int = Field(..., ge=1, description="Page number (1-indexed)")
    image_path: str = Field(..., description="Path to saved page image (for UI preview)")
    original_text: Optional[str] = Field(
        None, description="Raw OCR text before post-processing"
    )
    processed_text: Optional[str] = Field(
        None, description="Cleaned and corrected text after NLP rules"
    )
    fields: List[FieldData] = Field(
        default_factory=list, description="List of extracted fields on this page"
    )

    model_config = ConfigDict(from_attributes=True)


class DocumentData(BaseModel):
    """
    Complete extracted data from a document.
    Used for storage, export (JSON/XML), and API responses.
    """
    doc_type: DocumentType = Field(..., description="Detected document type")
    confidence: float = Field(
        0.0, ge=0.0, le=1.0, description="Document type classification confidence"
    )
    pages: List[PageData] = Field(
        default_factory=list, description="Extracted data per page"
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional metadata (vendor hints, template ID, etc.)",
    )

    model_config = ConfigDict(from_attributes=True)

    def get_field(self, name: str) -> Optional[FieldData]:
        """Helper: find first field by name across all pages."""
        for page in self.pages:
            for field in page.fields:
                if field.name == name:
                    return field
        return None


# =============================================================================
# API Response Models
# =============================================================================

class BatchResponse(BaseModel):
    """
    Response model for a single processed file (used in list and detail endpoints).
    """
    id: int = Field(..., description="Database primary key")
    filename: str = Field(..., description="Original filename")
    original_path: str = Field(..., description="Full path where file was picked up")
    status: ProcessingStatus = Field(..., description="Current processing status")
    created_at: datetime = Field(..., description="When file entered the system")
    processed_at: Optional[datetime] = Field(None, description="Completion timestamp")
    error_message: Optional[str] = Field(None, description="Error details if failed")
    document: Optional[DocumentData] = Field(
        None, description="Fully extracted and structured data"
    )

    model_config = ConfigDict(from_attributes=True)


class BatchListResponse(BaseModel):
    """Wrapper for paginated list responses."""
    items: List[BatchResponse] = Field(..., description="List of processed files")
    total: int = Field(..., description="Total count in database")
    page: int = Field(..., description="Current page (1-indexed)")
    per_page: int = Field(..., description="Items per page")


# =============================================================================
# Settings Management Models
# =============================================================================

class SettingsResponse(BaseModel):
    """
    Public settings exposed via GET /api/settings
    """
    hot_folder: str = Field(..., description="Monitored folder for new files")
    extraction_engine: str = Field(..., description="rule_based | ml_based | hybrid")
    ocr_engine: str = Field(..., description="tesseract | easyocr | google_vision")
    watch_subfolders: bool
    file_patterns: List[str] = Field(..., description="Glob patterns for file matching")
    poll_interval: int = Field(..., ge=1, le=300, description="Seconds between scans")
    max_file_size_mb: int = Field(..., ge=1, le=500)
    parallel_workers: int = Field(..., ge=1, le=32)
    auto_start_processing: bool = Field(
        ..., description="Start watcher automatically on API startup"
    )

    model_config = ConfigDict(from_attributes=True)


class UpdateSettingsRequest(BaseModel):
    """
    Partial update payload for PATCH /api/settings
    All fields are optional.
    """
    hot_folder: Optional[str] = Field(None, description="New hot folder path")
    extraction_engine: Optional[str] = Field(
        None, description="rule_based | ml_based | hybrid"
    )
    ocr_engine: Optional[str] = Field(
        None, description="tesseract | easyocr | google_vision"
    )
    watch_subfolders: Optional[bool] = None
    file_patterns: Optional[List[str]] = None
    poll_interval: Optional[int] = Field(None, ge=1, le=300)
    max_file_size_mb: Optional[int] = Field(None, ge=1, le=500)
    parallel_workers: Optional[int] = Field(None, ge=1, le=32)
    auto_start_processing: Optional[bool] = None

    @field_validator("extraction_engine")
    @classmethod
    def validate_extraction_engine(cls, v):
        if v is not None and v not in {"rule_based", "ml_based", "hybrid"}:
            raise ValueError("extraction_engine must be rule_based, ml_based, or hybrid")
        return v

    @field_validator("ocr_engine")
    @classmethod
    def validate_ocr_engine(cls, v):
        if v is not None and v not in {"tesseract", "easyocr", "google_vision"}:
            raise ValueError("ocr_engine must be tesseract, easyocr, or google_vision")
        return v