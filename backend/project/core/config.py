"""
core/config.py

Central configuration management for the invoice automation system.
Uses a singleton pattern to ensure only one instance exists throughout
the application lifecycle. Loads settings from config.json with fallback
to sensible defaults, and automatically creates required directories.
"""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List
from typing import cast

# Configure early logging (before logger is fully set up elsewhere)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class Config:
    """
    Singleton configuration class.

    Loads configuration from config.json in the project root.
    Falls back to defaults if file is missing or invalid.
    Automatically creates required directories on first load.
    All configuration values are accessible via properties or .get()
    """

    _instance = None
    _config: Dict[str, Any] = {}

    # Project root and config file location (relative to project root)
    PROJECT_ROOT = Path(__file__).parent.parent.resolve()
    CONFIG_FILE = PROJECT_ROOT / "config.json"

    def __new__(cls) -> "Config":
        """Implement singleton pattern."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self) -> None:
        """Initialize only once."""
        if not getattr(self, "_initialized", False):
            self._load_config()
            self._initialized = True

    def _load_config(self) -> None:
        """Load configuration from JSON file or use defaults."""
        defaults = {
            "hot_folder": str(Path.home() / "invoice_hot_folder"),
            "processed_folder": str(self.PROJECT_ROOT / "storage" / "processed"),
            "error_folder": str(self.PROJECT_ROOT / "storage" / "errors"),
            "archive_folder": str(self.PROJECT_ROOT / "storage" / "archive"),
            "temp_folder": str(self.PROJECT_ROOT / "storage" / "temp_processing"),
            "database_url": f"sqlite:///{self.PROJECT_ROOT / 'storage' / 'database.db'}",
            "extraction_engine": "rule_based",  # rule_based, ml_based, hybrid
            "ocr_engine": "tesseract",          # tesseract, easyocr, google_vision
            "watch_subfolders": False,
            "file_patterns": ["*.pdf", "*.jpg", "*.jpeg", "*.png", "*.tiff", "*.tif"],
            "poll_interval": 5,                 # seconds between folder scans
            "max_file_size_mb": 50,
            "api_host": "0.0.0.0",
            "api_port": 8000,
            "log_level": "INFO",
            "enable_notifications": False,
            "notification_email": "",
            "auto_start_processing": True,
            "parallel_workers": 2
        }

        if self.CONFIG_FILE.exists():
            try:
                with open(self.CONFIG_FILE, "r", encoding="utf-8") as f:
                    user_config = json.load(f)
                # Merge defaults first, then override with user values
                self._config = {**defaults, **user_config}
                logger.info(f"Configuration loaded from {self.CONFIG_FILE}")
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON in config file: {e}. Using defaults.")
                self._config = defaults
            except Exception as e:
                logger.error(f"Failed to read config file: {e}. Using defaults.")
                self._config = defaults
        else:
            logger.info("config.json not found. Creating with default settings.")
            self._config = defaults
            self._save_config()

        # Ensure all paths are absolute and converted properly
        self._normalize_paths()

        # Create required directories
        self._ensure_folders()

    def _normalize_paths(self) -> None:
        """Convert all folder paths to absolute Path objects where needed."""
        path_keys = [
            "hot_folder",
            "processed_folder",
            "error_folder",
            "archive_folder",
            "temp_folder",
        ]
        for key in path_keys:
            if key in self._config:
                self._config[key] = str(Path(self._config[key]).resolve())

        # Special case: ensure database_url uses absolute path
        if self._config["database_url"].startswith("sqlite:///"):
            db_path = self._config["database_url"][10:]  # strip sqlite:///
            abs_db_path = str(Path(db_path).resolve())
            self._config["database_url"] = f"sqlite:///{abs_db_path}"

    def _ensure_folders(self) -> None:
        """Create all necessary directories if they don't exist."""
        folders_to_create = [
            self.hot_folder,
            self.processed_folder,
            self.error_folder,
            self.archive_folder,
            self.temp_folder,
            self.PROJECT_ROOT / "logs",
            self.PROJECT_ROOT / "storage",
        ]

        for folder_path in folders_to_create:
            path = Path(folder_path)
            try:
                path.mkdir(parents=True, exist_ok=True)
                if path.exists():
                    logger.debug(f"Ensured directory exists: {path}")
            except Exception as e:
                logger.error(f"Failed to create directory {path}: {e}")

    def _save_config(self) -> None:
        """Save current configuration to config.json."""
        try:
            # Use relative paths in saved config for portability (optional)
            save_data = self._config.copy()
            # Convert Path objects back to relative strings if desired
            # Or keep absolute — your call. Here we keep clean relative where possible.
            with open(self.CONFIG_FILE, "w", encoding="utf-8") as f:
                json.dump(save_data, f, indent=2, default=str)
            logger.debug(f"Configuration saved to {self.CONFIG_FILE}")
        except Exception as e:
            logger.error(f"Failed to save config file: {e}")

    # ================================================================
    # Public API
    # ================================================================

    def get(self, key: str, default: Any = None) -> Any:
        """Get a configuration value by key."""
        return self._config.get(key, default)

    def set(self, key: str, value: Any) -> None:
        """Set a configuration value and persist to disk."""
        self._config[key] = value
        self._save_config()

    def update(self, updates: Dict[str, Any]) -> None:
        """Update multiple values at once and save."""
        self._config.update(updates)
        self._save_config()

    def reload(self) -> None:
        """Force reload configuration from disk (useful after external edit)."""
        logger.info("Reloading configuration from disk...")
        self._load_config()

    # ================================================================
    # Convenience Properties
    # ================================================================

    @property
    def hot_folder(self) -> str:
        return cast(str, self.get("hot_folder"))

    @property
    def processed_folder(self) -> str:
        return cast(str, self.get("processed_folder"))

    @property
    def error_folder(self) -> str:
        return cast(str, self.get("error_folder"))

    @property
    def archive_folder(self) -> str:
        return cast(str, self.get("archive_folder"))

    @property
    def temp_folder(self) -> str:
        return cast(str, self.get("temp_folder"))

    @property
    def database_url(self) -> str:
        return cast(str, self.get("database_url"))

    @property
    def extraction_engine(self) -> str:
        return cast(str, self.get("extraction_engine", "rule_based"))

    @property
    def ocr_engine(self) -> str:
        return cast(str, self.get("ocr_engine", "tesseract"))

    @property
    def file_patterns(self) -> List[str]:
        return cast(List[str], self.get("file_patterns", []))

    @property
    def poll_interval(self) -> int:
        return int(self.get("poll_interval", 5))

    @property
    def max_file_size_mb(self) -> int:
        return int(self.get("max_file_size_mb", 50))

    @property
    def api_port(self) -> int:
        return int(self.get("api_port", 8000))

    @property
    def api_host(self) -> str:
        return cast(str, self.get("api_host", "0.0.0.0"))

    @property
    def log_level(self) -> str:
        return cast(str, self.get("log_level", "INFO").upper())

    @property
    def parallel_workers(self) -> int:
        return max(1, int(self.get("parallel_workers", 2)))

    @property
    def watch_subfolders(self) -> bool:
        return bool(self.get("watch_subfolders", False))


# Global singleton instance (imported elsewhere as `from core.config import config`)
config = Config()


# Optional: Load once at import time
if not getattr(config, "_initialized", False):
    config.__init__()