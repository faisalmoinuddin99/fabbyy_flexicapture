# project/processor.py
import os
import shutil
import urllib.request
import zipfile
from pathlib import Path
import numpy as np  # ← ADD THIS (was missing before!)

# ──────────────────────────────────────────────────────────────
# AUTO POPPLER DOWNLOADER – UPDATED FOR LATEST VERSION (25.12.0-0)
# ──────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).parent
POPPLER_DIR = PROJECT_ROOT / "poppler"
BIN_DIR = POPPLER_DIR / "Library" / "bin"

if not BIN_DIR.exists():
    print("Downloading portable poppler (one-time only, ~40 MB)...")
    POPPLER_DIR.mkdir(exist_ok=True)
    zip_path = POPPLER_DIR / "poppler.zip"
    # FIXED URL: Latest release (Dec 2025)
    url = "https://github.com/oschwartz10612/poppler-windows/releases/download/v25.12.0-0/Release-25.12.0-0.zip"
    urllib.request.urlretrieve(url, zip_path)
    print("Extracting poppler...")
    with zipfile.ZipFile(zip_path, 'r') as z:
        z.extractall(POPPLER_DIR)
    zip_path.unlink()
    print("Poppler ready! No admin rights needed.")

# Add poppler to PATH only for this Python process
os.environ["PATH"] += os.pathsep + str(BIN_DIR)
# ──────────────────────────────────────────────────────────────

from pdf2image import convert_from_path
import cv2
import pytesseract
import json
from database import Session, Batch, Document, Page, Field
from extractors import get_extractor
from utils.logging import setup_logging
from config import Config

logger = setup_logging()

def preprocess_image(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = cv2.medianBlur(gray, 3)
    coords = cv2.findNonZero(cv2.Canny(gray, 50, 150))
    if coords is None:
        return gray
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
    (h, w) = gray.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(gray, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    return rotated

def ocr_page(image):
    text = pytesseract.image_to_string(image)
    data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
    return text, data

def process_pdf(pdf_path):
    session = Session()
    batch = None
    try:
        batch = Batch(pdf_path=pdf_path, status='processing')
        session.add(batch)
        session.commit()

        temp_path = os.path.join(Config.TEMP_PROCESSING_DIR, os.path.basename(pdf_path))
        shutil.move(pdf_path, temp_path)

        # This line will now work because poppler is auto-added above
        images = convert_from_path(temp_path, dpi=300)

        doc = Document(batch_id=batch.id, doc_type='invoice')
        session.add(doc)
        session.commit()

        extractor = get_extractor(Config.EXTRACTION_ENGINE)

        for page_num, img in enumerate(images, start=1):
            preprocessed = preprocess_image(np.array(img))
            full_text, ocr_data = ocr_page(preprocessed)

            image_path = os.path.join(Config.TEMP_PROCESSING_DIR, f'page_{batch.id}_{page_num}.jpg')
            cv2.imwrite(image_path, preprocessed)

            page = Page(
                document_id=doc.id,
                page_number=page_num,
                image_path=image_path,
                full_text=full_text
            )
            session.add(page)
            session.commit()

            fields = extractor.extract(full_text, ocr_data)

            for field_name, (value, confidence, coords) in fields.items():
                field = Field(
                    page_id=page.id,
                    name=field_name,
                    value=value,
                    confidence=confidence,
                    coordinates=json.dumps(coords)
                )
                session.add(field)

        session.commit()
        batch.status = 'completed'
        session.commit()
        logger.info(f'Successfully processed: {pdf_path}')

    except Exception as e:
        logger.error(f'Error processing {pdf_path}: {e}')
        if batch:
            batch.status = 'error'
            session.commit()
    finally:
        session.close()