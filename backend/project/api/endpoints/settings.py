# api/endpoints/settings.py
"""
Settings management endpoints – 100% compatible with your current models.py
"""

import tempfile
from pathlib import Path
from typing import Dict, Any

from fastapi import APIRouter, HTTPException, status

from core.config import config
from core.models import SettingsResponse, UpdateSettingsRequest  # Your existing models


router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/", response_model=SettingsResponse, summary="Get current settings")
async def get_settings():
    """Return current system configuration."""
    return SettingsResponse(
        hot_folder=config.hot_folder,
        extraction_engine=config.extraction_engine,
        ocr_engine=config.ocr_engine,
        watch_subfolders=config.watch_subfolders,
        file_patterns=config.file_patterns,
        poll_interval=config.poll_interval,
        max_file_size_mb=config.max_file_size_mb,
        parallel_workers=config.parallel_workers,
        auto_start_processing=config.get("auto_start_processing", True),
    )


@router.patch("/", status_code=status.HTTP_200_OK)
async def update_settings(payload: UpdateSettingsRequest):
    """
    Update settings – uses your existing UpdateSettingsRequest model
    which already has perfect validation (engines, bounds, etc.)
    """
    updates: Dict[str, Any] = {}

    # Special handling: hot_folder needs validation + write test
    if payload.hot_folder is not None:
        new_path = Path(payload.hot_folder).expanduser().resolve()

        try:
            new_path.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Cannot create folder: {e}")

        try:
            with tempfile.NamedTemporaryFile(dir=new_path):
                pass
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"No write permission: {e}")

        updates["hot_folder"] = str(new_path)

    # All other fields – already validated by your Pydantic model
    optional_fields = [
        "extraction_engine",
        "ocr_engine",
        "watch_subfolders",
        "file_patterns",
        "poll_interval",
        "max_file_size_mb",
        "parallel_workers",
        "auto_start_processing",
    ]

    for field in optional_fields:
        if (value := getattr(payload, field, None)) is not None:
            updates[field] = value

    if not updates:
        raise HTTPException(status_code=400, detail="No settings provided to update")

    # Persist to config.json
    config.update(updates)

    return {
        "message": "Settings updated successfully",
        "updated_fields": list(updates.keys())
    }


@router.get("/test-hotfolder")
async def test_hotfolder():
    """Test current hot folder readability/writability."""
    folder = Path(config.hot_folder)

    if not folder.exists():
        return {"status": "error", "message": f"Folder does not exist: {folder}"}

    try:
        with tempfile.NamedTemporaryFile(dir=folder):
            pass
        file_count = len(list(folder.iterdir()))
        return {
            "status": "success",
            "message": "Hot folder is fully accessible",
            "path": str(folder),
            "file_count": file_count,
        }
    except Exception as e:
        return {"status": "error", "message": f"Access denied: {e}"}