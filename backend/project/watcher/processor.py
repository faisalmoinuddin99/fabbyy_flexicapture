# watcher/processor.py
"""
Document processing module using OCR and PDF parsing.

Handles PDFs and images uploaded via the watcher system.
Extracts text, creates database records for documents, pages, and fields.
Moves files to processed/error folders accordingly.
"""

import logging
import shutil
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Tuple, Dict, Any
import mimetypes

import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import magic  # python-magic

from concurrent.futures import ThreadPoolExecutor
from core.config import config
from core.database import SessionLocal, Batch, Document, Page, Field, ProcessingStatus, DocumentType

logger = logging.getLogger(__name__)

# Initialize mime detector
mime = magic.Magic(mime=True)


def is_pdf_file(filepath: Path) -> bool:
    """Detect if file is actually a PDF using both extension and MIME."""
    if filepath.suffix.lower() == ".pdf":
        return True
    file_mime = mime.from_file(str(filepath))
    return "pdf" in file_mime.lower()


def is_image_file(filepath: Path) -> bool:
    """Detect if file is an image using MIME type."""
    file_mime = mime.from_file(str(filepath))
    return file_mime.startswith("image/")


def sanitize_filename(filename: str) -> str:
    """Prevent path traversal and sanitize filename."""
    return Path(filename).name


class ProcessManager:
    """
    Thread-safe manager for processing document batches concurrently.
    """

    def __init__(self, max_workers: int = None):
        self.max_workers = max_workers or config.parallel_workers
        self.executor = ThreadPoolExecutor(max_workers=self.max_workers)
        self.active_tasks: Dict[int, Any, Any] = {}

        # Ensure required directories exist
        for folder in [config.processed_folder, config.error_folder, config.temp_folder]:
            Path(folder).mkdir(parents=True, exist_ok=True)

    def process_file(self, batch: Batch) -> None:
        """Submit a batch for processing task."""
        future = self.executor.submit(self._process_file_task, batch.id)
        self.active_tasks[batch.id] = future
        future.add_done_callback(lambda f: self._cleanup_task(batch.id, f))

    def _cleanup_task(self, batch_id: int, future) -> None:
        """Remove task from tracking and log exceptions."""
        self.active_tasks.pop(batch_id, None)
        try:
            future.result()
        except Exception as e:
            logger.error(f"Background task failed for batch {batch_id}: {e}", exc_info=True)

    def _process_file_task(self, batch_id: int) -> None:
        """Main processing logic for a single batch."""
        session = SessionLocal()
        batch = None
        start_time = time.time()

        try:
            batch = session.query(Batch).filter(Batch.id == batch_id).first()
            if not batch:
                logger.error(f"Batch {batch_id} not found in database")
                return

            # Security: prevent path traversal
            safe_path = Path(config.upload_folder) / sanitize_filename(batch.filename)
            if not str(safe_path.resolve()).startswith(str(Path(config.upload_folder).resolve())):
                raise ValueError("Invalid file path - path traversal attempt detected")

            batch.status = ProcessingStatus.PROCESSING
            batch.started_at = datetime.now(timezone.utc)
            session.commit()

            logger.info(f"Starting processing: {batch.filename} (Batch ID: {batch_id})")
            file_path = Path(batch.original_path)

            if not file_path.exists():
                raise FileNotFoundError(f"File not found: {file_path}")

            # Route to correct processor
            if is_pdf_file(file_path):
                self._process_pdf(session, batch, file_path)
            elif is_image_file(file_path):
                self._process_image(session, batch, file_path)
            else:
                raise ValueError(f"Unsupported file type: {file_path}")

            # Success
            batch.status = ProcessingStatus.COMPLETED
            batch.processed_at = datetime.now(timezone.utc)
            batch.processing_time = time.time() - start_time
            session.commit()

            logger.info(f"Successfully processed {batch.filename} in {batch.processing_time:.2f}s")
            self._archive_file(batch)

        except Exception as e:
            logger.error(f"Failed to process batch {batch_id}: {e}", exc_info=True)
            if batch:
                batch.status = ProcessingStatus.ERROR
                batch.error_message = str(e)[:500]  # Truncate long errors
                batch.processed_at = datetime.now(timezone.utc)
                session.commit()
                self._move_to_error_folder(batch)
        finally:
            session.close()

    def _process_pdf(self, session, batch: Batch, pdf_path: Path) -> None:
        """Extract text and images from PDF pages using PyMuPDF + Tesseract OCR."""
        doc = fitz.open(pdf_path)
        total_pages = len(doc)

        document = Document(
            batch_id=batch.id,
            doc_type=self._infer_document_type_from_content(doc),  # Smart inference
            confidence=0.0,  # Will be updated later if needed
            metadata={"pages": total_pages, "source": "pdf", "title": pdf_path.name}
        )
        session.add(document)
        session.commit()

        for page_num in range(total_pages):
            page = doc[page_num]

            # Render page to image
            zoom = 2.0  # 2x resolution for better OCR
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat, alpha=False)
            img_path = Path(config.temp_folder) / f"{batch.id}_page_{page_num + 1}.png"
            pix.save(img_path)

            # Perform OCR
            pil_img = Image.open(img_path)
            text = pytesseract.image_to_string(pil_img, lang='eng')
            confidence = pytesseract.image_to_data(pil_img, output_type=pytesseract.Output.DICT)
            avg_conf = sum(map(int, confidence["conf"])) / max(1, len(confidence["conf"]))

            # Save page
            page_record = Page(
                document_id=document.id,
                page_number=page_num + 1,
                image_path=str(img_path),
                original_text=text.strip(),
                processed_text=text.strip(),  # Add NLP cleaning later
                ocr_confidence=avg_conf / 100.0
            )
            session.add(page_record)
            session.flush()

            # Extract common fields (very basic heuristic - replace with ML model later)
            fields = self._extract_basic_fields(text)
            for name, value, conf in fields:
                field = Field(
                    page_id=page_record.id,
                    name=name,
                    value=value,
                    confidence=conf,
                    coordinates={"x": 0, "y": 0, "width": 0, "height": 0}  # TODO: Use image_to_data for real bbox
                )
                session.add(field)

        session.commit()
        doc.close()

    def _process_image(self, session, batch: Batch, image_path: Path) -> None:
        """Process single image using OCR."""
        pil_img = Image.open(image_path).convert("RGB")
        text = pytesseract.image_to_string(pil_img, lang='eng')

        document = Document(
            batch_id=batch.id,
            doc_type=DocumentType.UNKNOWN,
            confidence=0.0,
            metadata={"pages": 1, "source": "image"}
        )
        session.add(document)
        session.commit()

        page = Page(
            document_id=document.id,
            page_number=1,
            image_path=str(image_path),  # Keep original or copy to temp?
            original_text=text.strip(),
            processed_text=text.strip(),
            ocr_confidence=0.85  # Approximate
        )
        session.add(page)
        session.flush()

        fields = self._extract_basic_fields(text)
        for name, value, conf in fields:
            session.add(Field(page_id=page.id, name=name, value=value, confidence=conf))

        session.commit()

    def _infer_document_type_from_content(self, doc) -> DocumentType:
        """Very basic heuristic - improve with ML classifier later."""
        text = ""
        for page in doc:
            text += page.get_text("text").lower()
            if len(text) > 2000:
                break
        text = text.lower()
        if any(k in text for k in ["invoice", "bill to", "due date", "total due"]):
            return DocumentType.INVOICE
        if any(k in text for k in ["purchase order", "po number", "order date"]):
            return DocumentType.PURCHASE_ORDER
        if any(k in text for k in ["packing list", "shipped to", "tracking"]):
            return DocumentType.PACKING_SLIP
        return DocumentType.UNKNOWN

    def _extract_basic_fields(self, text: str) -> List[Tuple[str, str, float]]:
        """Very basic field extraction using regex - replace with proper NLP/ML."""
        import re

        fields = []

        # Invoice Number
        m = re.search(r"(?:invoice|inv[. ]?#?)[:\s]*([A-Z0-9-]{5,})", text, re.I)
        if m:
            fields.append(("invoice_number", m.group(1).strip(), 0.92))

        # Date
        m = re.search(r"(?:date|issued)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})", text, re.I)
        if m:
            fields.append(("date", m.group(1), 0.88))

        # Total
        m = re.search(r"total[:\s]*\$?([\d,]+\.?\d*)", text, re.I)
        if m:
            fields.append(("total_amount", f"${m.group(1)}", 0.95))

        return fields

    def _archive_file(self, batch: Batch) -> None:
        """Move successfully processed file to archive folder."""
        try:
            src = Path(batch.original_path)
            dst = Path(config.processed_folder) / src.name

            if dst.exists():
                stem = src.stem
                suffix = src.suffix
                counter = 1
                while dst.exists():
                    dst = Path(config.processed_folder) / f"{stem}_{counter}{suffix}"
                    counter += 1

            shutil.move(str(src), str(dst))
            batch.original_path = str(dst)  # Optional: update DB
            logger.info(f"Archived: {src.name} to processed folder")
        except Exception as e:
            logger.error(f"Failed to archive {batch.filename}: {e}")

    def _move_to_error_folder(self, batch: Batch) -> None:
        """Move failed file to error folder."""
        try:
            src = Path(batch.original_path)
            dst = Path(config.error_folder) / src.name
            shutil.move(str(src), str(dst))
            logger.info(f"Moved to error folder: {src.name}")
        except Exception as e:
            logger.error(f"Failed to move error file {batch.filename}: {e}")

    def shutdown(self, wait: bool = True) -> None:
        """Gracefully shut down the executor."""
        logger.info("Shutting down ProcessManager...")
        self.executor.shutdown(wait=wait)