# project/api.py (FastAPI for UI backend)
from fastapi import FastAPI, HTTPException
from database import Session, Batch, Document, Page, Field
from pydantic import BaseModel
import os
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FieldOut(BaseModel):
    name: str
    value: str
    confidence: float
    coordinates: str

class PageOut(BaseModel):
    page_number: int
    image_path: str
    fields: list[FieldOut]

class DocumentOut(BaseModel):
    doc_type: str
    pages: list[PageOut]

class BatchOut(BaseModel):
    id: int
    pdf_path: str
    status: str
    document: DocumentOut

@app.get('/batches')
def get_batches():
    session = Session()
    batches = session.query(Batch).all()
    return [BatchOut(id=b.id, pdf_path=b.pdf_path, status=b.status, document=None) for b in batches]

@app.get('/batch/{batch_id}')
def get_batch(batch_id: int):
    session = Session()
    batch = session.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(404, 'Batch not found')
    
    doc = batch.documents[0] if batch.documents else None
    if not doc:
        return BatchOut.from_orm(batch)  # Simplified
    
    pages_out = []
    for page in doc.pages:
        fields_out = [FieldOut(name=f.name, value=f.value, confidence=f.confidence, coordinates=f.coordinates) for f in page.fields]
        pages_out.append(PageOut(page_number=page.page_number, image_path=page.image_path, fields=fields_out))
    
    doc_out = DocumentOut(doc_type=doc.doc_type, pages=pages_out)
    out = BatchOut(id=batch.id, pdf_path=batch.pdf_path, status=batch.status, document=doc_out)
    return out

# Serve static files (images)
app.mount("/static", StaticFiles(directory=Config.TEMP_PROCESSING_DIR), name="static")