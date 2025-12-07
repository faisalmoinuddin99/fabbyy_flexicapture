# project/processor.py
import os
import shutil
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
    # Deskew, noise removal, etc. using OpenCV
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = cv2.medianBlur(gray, 3)  # Noise removal
    # Simple deskew (assuming small skew)
    coords = cv2.findNonZero(cv2.Canny(gray, 50, 150))
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
    # OCR using Tesseract
    text = pytesseract.image_to_string(image)
    data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
    return text, data  # text and bounding boxes

def process_pdf(pdf_path):
    session = Session()
    try:
        # Create batch (1 PDF = 1 batch)
        batch = Batch(pdf_path=pdf_path, status='processing')
        session.add(batch)
        session.commit()

        # Move to temp processing
        temp_path = os.path.join(Config.TEMP_PROCESSING_DIR, os.path.basename(pdf_path))
        shutil.move(pdf_path, temp_path)

        # Convert PDF to images
        images = convert_from_path(temp_path)

        # Create document
        doc = Document(batch_id=batch.id, doc_type='unknown')  # TODO: Classify doc_type
        session.add(doc)
        session.commit()

        extractor = get_extractor(Config.EXTRACTION_ENGINE)

        for page_num, img in enumerate(images, start=1):
            preprocessed = preprocess_image(np.array(img))
            full_text, ocr_data = ocr_page(preprocessed)

            # Save processed image
            image_path = os.path.join(Config.TEMP_PROCESSING_DIR, f'page_{page_num}.jpg')
            cv2.imwrite(image_path, preprocessed)

            page = Page(document_id=doc.id, page_number=page_num, image_path=image_path, full_text=full_text)
            session.add(page)
            session.commit()

            # Extract fields using plug-and-play extractor
            fields = extractor.extract(full_text, ocr_data)

            for field_name, (value, confidence, coords) in fields.items():
                field = Field(page_id=page.id, name=field_name, value=value, confidence=confidence, coordinates=json.dumps(coords))
                session.add(field)

        session.commit()
        batch.status = 'completed'
        session.commit()
        logger.info(f'Processed PDF: {pdf_path}')

    except Exception as e:
        if batch:
            batch.status = 'error'
            session.commit()
        logger.error(f'Error processing {pdf_path}: {e}')
    finally:
        session.close()