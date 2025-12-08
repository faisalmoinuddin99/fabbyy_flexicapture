# api/endpoints/batches.py
"""
Batch management endpoints.
List, view, delete, and reprocess document batches.
"""

from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from core.database import get_db, Batch, ProcessingStatus
from core.models import BatchResponse
from watcher.processor import ProcessManager  # We'll use this to trigger reprocessing

router = APIRouter(prefix="/batches", tags=["Batches"])

# Global process manager instance (or inject via dependency later)
process_manager = ProcessManager()


@router.get(
    "/",
    response_model=List[BatchResponse],
    summary="List batches",
    description="Retrieve batches with optional status and date filtering. Defaults to last 7 days."
)
async def get_batches(
    db: Session = Depends(get_db),
    status: Optional[ProcessingStatus] = None,
    limit: int = Query(100, ge=1, le=1000, description="Max items per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    days: int = Query(7, ge=1, le=365, description="Filter: show batches from last N days"),
):
    """
    Get paginated list of batches.
    """
    query = db.query(Batch)

    if status:
        query = query.filter(Batch.status == status)

    since_date = datetime.now(timezone.utc) - timedelta(days=days)
    query = query.filter(Batch.created_at >= since_date)

    batches = (
        query.order_by(Batch.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return batches


@router.get(
    "/{batch_id}",
    response_model=BatchResponse,
    responses={404: {"description": "Batch not found"}}
)
async def get_batch(batch_id: int, db: Session = Depends(get_db)):
    """Get detailed information about a specific batch."""
    batch = db.get(Batch, batch_id)  # Better than filter().first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    return batch


@router.delete(
    "/{batch_id}",
    status_code=status.HTTP_200_OK,
    responses={
        404: {"description": "Batch not found"},
        200: {"description": "Batch deleted successfully"}
    }
)
async def delete_batch(batch_id: int, db: Session = Depends(get_db)):
    """
    Delete a batch and its related data (documents, pages, fields).
    Use with caution — ideally protect with admin auth.
    """
    batch = db.get(Batch, batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    db.delete(batch)
    db.commit()

    return {"detail": f"Batch {batch_id} and related data deleted successfully"}


@router.post(
    "/{batch_id}/reprocess",
    status_code=status.HTTP_202_ACCEPTED,
    responses={
        404: {"description": "Batch not found"},
        202: {"description": "Batch queued for reprocessing"}
    }
)
async def reprocess_batch(batch_id: int, db: Session = Depends(get_db)):
    """
    Mark a failed/processed batch for reprocessing.
    Resets status and immediately submits to the processing queue.
    """
    batch = db.get(Batch, batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    if batch.status == ProcessingStatus.PROCESSING:
        raise HTTPException(
            status_code=400,
            detail="Batch is currently being processed"
        )

    # Reset for reprocessing
    batch.status = ProcessingStatus.PENDING
    batch.processed_at = None
    batch.processing_time = None
    batch.error_message = None
    batch.started_at = None

    db.commit()

    # Actually trigger processing immediately
    try:
        process_manager.process_file(batch)
        return {
            "detail": f"Batch {batch_id} queued for reprocessing",
            "status": "queued"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to queue reprocessing: {str(e)}"
        )