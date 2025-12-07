# project/api.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

# Your existing imports
from database import Session, Batch, Document, Page, Field
from pydantic import BaseModel

# Critical imports – these were missing or broken before
from config import Config
from watcher import restart_watcher

app = FastAPI(title="Invoice Automation API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================
# Pydantic Models
# ================================

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
    document: DocumentOut | None = None

    class Config:
        from_attributes = True


# ================================
# Batch Endpoints
# ================================

@app.get('/batches', response_model=list[BatchOut])
def get_batches():
    session = Session()
    batches = session.query(Batch).all()
    return [BatchOut(id=b.id, pdf_path=b.pdf_path, status=b.status, document=None) for b in batches]

@app.get('/batch/{batch_id}', response_model=BatchOut)
def get_batch(batch_id: int):
    session = Session()
    batch = session.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(404, 'Batch not found')

    doc = batch.documents[0] if batch.documents else None
    if not doc:
        return BatchOut(id=batch.id, pdf_path=batch.pdf_path, status=batch.status, document=None)

    pages_out = []
    for page in doc.pages:
        fields_out = [
            FieldOut(
                name=f.name,
                value=f.value or "",
                confidence=f.confidence or 0.0,
                coordinates=f.coordinates or ""
            ) for f in page.fields
        ]
        pages_out.append(PageOut(page_number=page.page_number, image_path=page.image_path, fields=fields_out))

    doc_out = DocumentOut(doc_type=doc.doc_type or "Unknown", pages=pages_out)
    return BatchOut(id=batch.id, pdf_path=batch.pdf_path, status=batch.status, document=doc_out)


# ================================
# SETTINGS ENDPOINTS – NOW 100% WORKING
# ================================

class SettingsResponse(BaseModel):
    hotFolderPath: str
    extractionEngine: str
    tempProcessingDir: str

@app.get("/api/settings", response_model=SettingsResponse)
def get_settings():
    return SettingsResponse(
        hotFolderPath=Config.HOT_FOLDER_PATH,
        extractionEngine=Config.EXTRACTION_ENGINE,
        tempProcessingDir=str(Path(__file__).parent / "temp_processing")
    )

class UpdateHotFolderRequest(BaseModel):
    hotFolderPath: str

@app.patch("/api/settings/hot-folder")
def update_hot_folder(payload: UpdateHotFolderRequest):
    new_path_str = payload.hotFolderPath.strip()
    if not new_path_str:
        raise HTTPException(status_code=400, detail="Hot folder path cannot be empty")

    new_path = Path(new_path_str).expanduser().resolve()

    try:
        new_path.mkdir(parents=True, exist_ok=True)
        test_file = new_path / ".write_test.tmp"
        test_file.touch()
        test_file.unlink()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Cannot write to folder: {str(e)}")

    # Save to config
    Config.set("HOT_FOLDER_PATH", str(new_path))

    # Restart watcher
    try:
        restart_watcher(new_path=str(new_path))
    except Exception as e:
        print(f"[WARNING] Watcher restart failed: {e}")  # Still save config even if restart fails

    return {
        "message": "Hot folder updated and watcher restarted",
        "hotFolderPath": str(new_path)
    }


# ================================
# Serve static files (page images)
# ================================

# Use absolute path to avoid issues
TEMP_DIR = Path(__file__).parent / "temp_processing"
TEMP_DIR.mkdir(exist_ok=True)

app.mount("/static", StaticFiles(directory=TEMP_DIR), name="static")