# api/endpoints/processing.py
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from core.database import get_db, ProcessingStatus, Batch

router = APIRouter()

@router.post("/batches/{batch_id}/trigger")
async def trigger_processing(
    batch_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Manually trigger processing of a pending batch.
    In production this will be called by the watcher automatically.
    """
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    if batch.status != ProcessingStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Batch is already {batch.status}")

    # Here you would normally add the real background processing task
    # For now we just mark it as processing
    batch.status = ProcessingStatus.PROCESSING
    db.commit()

    return {"message": f"Processing triggered for batch {batch_id}", "status": batch.status}