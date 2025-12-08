# api/endpoints/__init__.py
from .batches import router as batches
from .settings import router as settings
from .processing import router as processing   # ← this line was missing

__all__ = ["batches", "settings", "processing"]