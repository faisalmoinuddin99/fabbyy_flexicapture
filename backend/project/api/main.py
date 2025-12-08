# api/main.py
"""
FastAPI entrypoint for the Invoice Automation System.

Provides REST API for monitoring batches, triggering processing,
viewing extracted pages/images, and system health.
"""

import os
import logging
from pathlib import Path
from datetime import datetime
from typing import Generator

import uvicorn
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text

from core.config import config
from core.database import SessionLocal, engine
from api.endpoints import batches, settings, processing

# --------------------------------------------------------------------------- #
# Logging Configuration
# --------------------------------------------------------------------------- #
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------- #
# FastAPI App
# --------------------------------------------------------------------------- #
app = FastAPI(
    title="Invoice Automation API",
    description="Hot-folder based document processing system (similar to ABBYY FlexiCapture)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# --------------------------------------------------------------------------- #
# CORS Middleware
# --------------------------------------------------------------------------- #
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.allowed_origins,  # e.g. ["http://localhost:3000", ...] or ["*"] in dev
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# --------------------------------------------------------------------------- #
# Dependency: Database Session (FIXED!)
# --------------------------------------------------------------------------- #
def get_db() -> Generator[Session, None, None]:
    """
    Dependency that provides a SQLAlchemy session.
    Automatically closes the session after the request, even if an error occurs.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --------------------------------------------------------------------------- #
# Include Routers
# --------------------------------------------------------------------------- #
app.include_router(batches.router, prefix="/api/v1", tags=["Batches"])
app.include_router(settings.router, prefix="/api/v1", tags=["Settings"])
app.include_router(processing.router, prefix="/api/v1", tags=["Processing"])

# --------------------------------------------------------------------------- #
# Static Files (processed page images, previews, etc.)
# --------------------------------------------------------------------------- #
static_dir = Path(config.temp_folder)
static_dir.mkdir(parents=True, exist_ok=True)

app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Optional: serve archived/exported files
# app.mount("/archives", StaticFiles(directory=config.processed_folder), name="archives")

# --------------------------------------------------------------------------- #
# Root & Health Endpoints
# --------------------------------------------------------------------------- #
@app.get("/", tags=["General"])
async def root():
    """Welcome endpoint with basic system info."""
    return {
        "message": "Invoice Automation API is running",
        "version": "1.0.0",
        "hot_folder": str(config.hot_folder),
        "docs_url": "/docs",
        "health_check": "/api/v1/health",
    }


@app.get("/api/v1/health", tags=["Health"])
async def health_check(db: Session = Depends(get_db)):
    """
    Comprehensive health check:
    - Database connectivity
    - Hot folder existence & writability
    - Critical storage folders
    """
    try:
        # Test database connection
        db.execute(text("SELECT 1"))

        # Check hot folder
        hot_folder_path = Path(config.hot_folder)
        hot_folder_exists = hot_folder_path.exists()
        hot_folder_writable = os.access(config.hot_folder, os.W_OK) if hot_folder_exists else False

        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "database": "connected",
            "hot_folder": {
                "path": str(config.hot_folder),
                "exists": hot_folder_exists,
                "writable": hot_folder_writable,
            },
            "storage": {
                "temp_folder": {"exists": Path(config.temp_folder).exists()},
                "processed_folder": {"exists": Path(config.processed_folder).exists()},
                "error_folder": {"exists": Path(config.error_folder).exists()},
            },
            "api_version": "1.0.0",
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}", exc_info=True)
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")


# --------------------------------------------------------------------------- #
# Startup / Shutdown Events
# --------------------------------------------------------------------------- #
@app.on_event("startup")
async def startup_event():
    """Actions to perform when the API starts."""
    logger.info("Starting Invoice Automation API...")

    # Ensure all critical directories exist
    for path in [
        config.hot_folder,
        config.temp_folder,
        config.processed_folder,
        config.error_folder,
    ]:
        Path(path).mkdir(parents=True, exist_ok=True)
        logger.info(f"Ensured directory exists: {path}")

    # Test DB connection on startup
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    logger.info("Database connection successful")


@app.on_event("shutdown")
async def shutdown_event():
    """Actions to perform when the API shuts down."""
    logger.info("Shutting down Invoice Automation API...")


# --------------------------------------------------------------------------- #
# Entry Point
# --------------------------------------------------------------------------- #
if __name__ == "__main__":
    uvicorn.run(
        "api.main:app",  # Reliable even if filename changes
        host=config.api_host,
        port=config.api_port,
        reload=config.debug,
        log_level="info",
        workers=1 if config.debug else None,  # Workers + reload = crash
    )