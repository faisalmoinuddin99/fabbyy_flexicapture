"""
watcher/main.py

Main file system watcher for the invoice automation system.
Uses watchdog to monitor the hot folder for new files (PDFs, images, etc.).
Features:
- Initial scan for existing files on startup
- Duplicate prevention via file hash (MD5) and database check
- Configurable polling, file patterns, and subfolder watching
- Background processing via ProcessManager (from processor.py)
- Logging to file and console
- Graceful shutdown on Ctrl+C

Dependencies:
- watchdog: For file system events
- SQLAlchemy: For batch records in database
- core.config: For settings like hot_folder, poll_interval
"""

import time
import hashlib
import logging
from pathlib import Path
from typing import Set

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileCreatedEvent

from core.config import config
from core.database import SessionLocal, Batch, ProcessingStatus
from watcher.processor import ProcessManager  # Handles actual processing

# Setup logging early
logging.basicConfig(
    level=getattr(logging, config.get("log_level", "INFO").upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(Path("logs") / "watcher.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class HotFolderHandler(FileSystemEventHandler):
    """
    Custom watchdog handler for hot folder events.
    
    - Loads processed hashes from DB on init
    - Computes MD5 hash for duplicate check
    - Validates file type, size, and uniqueness
    - Creates Batch record in DB
    - Triggers processing if auto_start_processing is True
    """
    
    def __init__(self):
        self.process_manager = ProcessManager()
        self.processed_files: Set[str] = set()
        self._load_processed_files()

    def _load_processed_files(self) -> None:
        """Load hashes of already processed files from database."""
        session = SessionLocal()
        try:
            batches = session.query(Batch.file_hash).all()
            self.processed_files = {hash_[0] for hash_ in batches}
            logger.info(f"Loaded {len(self.processed_files)} processed files from DB")
        except Exception as e:
            logger.error(f"Failed to load processed files: {e}")
        finally:
            session.close()

    def _get_file_hash(self, filepath: str) -> str:
        """Compute MD5 hash of file contents (chunked for large files)."""
        hasher = hashlib.md5()
        try:
            with open(filepath, 'rb') as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hasher.update(chunk)
            return hasher.hexdigest()
        except Exception as e:
            logger.error(f"Failed to hash file {filepath}: {e}")
            raise

    def _is_valid_file(self, filepath: str) -> bool:
        """Validate file: pattern match, size limit, not duplicate."""
        path = Path(filepath)
        
        # Check against file patterns (e.g., *.pdf, *.jpg)
        patterns = config.file_patterns
        if not any(path.match(pattern) for pattern in patterns):
            logger.debug(f"File does not match patterns: {filepath}")
            return False
        
        # Check max file size
        max_size_bytes = config.max_file_size_mb * 1024 * 1024
        try:
            file_size = path.stat().st_size
            if file_size > max_size_bytes:
                logger.warning(f"File exceeds max size ({config.max_file_size_mb}MB): {filepath}")
                return False
        except Exception as e:
            logger.error(f"Failed to stat file {filepath}: {e}")
            return False
        
        # Check duplicate via hash
        try:
            file_hash = self._get_file_hash(filepath)
            if file_hash in self.processed_files:
                logger.info(f"Duplicate file detected (hash match): {filepath}")
                return False
        except Exception:
            return False  # Skip if hash fails
        
        return True

    def _create_batch_record(self, filepath: str) -> Batch:
        """Create a new Batch entry in DB for the file."""
        session = SessionLocal()
        try:
            path = Path(filepath)
            file_hash = self._get_file_hash(filepath)
            
            batch = Batch(
                filename=path.name,
                original_path=str(path.absolute()),  # Absolute path for reliability
                file_hash=file_hash,
                file_size=path.stat().st_size,
                status=ProcessingStatus.PENDING,
                created_at=datetime.utcnow()  # Explicit for consistency
            )
            
            session.add(batch)
            session.commit()
            session.refresh(batch)
            
            self.processed_files.add(file_hash)
            logger.info(f"Created batch #{batch.id} for {path.name} (hash: {file_hash[:8]}...)")
            
            return batch
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to create batch for {filepath}: {e}")
            raise
        finally:
            session.close()

    def on_created(self, event: FileCreatedEvent) -> None:
        """Event handler for new file creation."""
        if event.is_directory:
            return  # Ignore directories
        
        filepath = event.src_path
        logger.debug(f"File created event: {filepath}")
        
        if self._is_valid_file(filepath):
            try:
                # Brief wait for file write to complete (adjust if needed)
                time.sleep(0.5)
                
                # Create DB record
                batch = self._create_batch_record(filepath)
                
                # Auto-process if enabled
                if config.auto_start_processing:
                    logger.info(f"Auto-processing batch #{batch.id}")
                    self.process_manager.process_file(batch)
                else:
                    logger.info(f"Batch #{batch.id} created - processing deferred")
                    
            except Exception as e:
                logger.error(f"Error processing {filepath}: {e}")
        else:
            logger.debug(f"Skipping invalid file: {filepath}")


class HotFolderWatcher:
    """
    Manages the watchdog observer for hot folder monitoring.
    
    - Creates hot folder if missing
    - Supports recursive watching
    - Custom polling interval from config
    - Graceful start/stop
    """
    
    def __init__(self):
        self.observer = Observer(timeout=config.poll_interval)
        self.handler = HotFolderHandler()
        self.is_running = False

    def start(self) -> None:
        """Start monitoring the hot folder."""
        hot_folder = Path(config.hot_folder).resolve()
        
        # Ensure hot folder exists
        if not hot_folder.exists():
            hot_folder.mkdir(parents=True, exist_ok=True)
            logger.info(f"Created missing hot folder: {hot_folder}")
        
        logger.info(f"Starting watcher on: {hot_folder}")
        logger.info(f"Patterns: {', '.join(config.file_patterns)}")
        logger.info(f"Recursive: {config.watch_subfolders}")
        logger.info(f"Poll interval: {config.poll_interval}s")
        
        # Schedule recursive or non-recursive
        self.observer.schedule(
            self.handler,
            str(hot_folder),
            recursive=config.watch_subfolders
        )
        
        self.is_running = True
        self.observer.start()
        
        try:
            while self.is_running:
                time.sleep(1)
        except KeyboardInterrupt:
            self.stop()

    def stop(self) -> None:
        """Stop the observer gracefully."""
        if self.is_running:
            logger.info("Stopping watcher...")
            self.is_running = False
            self.observer.stop()
            self.observer.join()
            logger.info("Watcher stopped successfully")


def initial_scan() -> None:
    """Scan and process existing files in hot folder on startup."""
    logger.info("Performing initial scan of hot folder...")
    
    hot_folder = Path(config.hot_folder).resolve()
    if not hot_folder.exists():
        logger.warning(f"Hot folder does not exist: {hot_folder}")
        return
    
    handler = HotFolderHandler()
    
    # Glob for patterns (recursive if enabled)
    glob_method = hot_folder.rglob if config.watch_subfolders else hot_folder.glob
    for pattern in config.file_patterns:
        for filepath in glob_method(pattern):
            if filepath.is_file():
                logger.info(f"Found existing file: {filepath}")
                # Simulate creation event
                handler.on_created(FileCreatedEvent(str(filepath)))


if __name__ == "__main__":
    # Ensure DB is initialized
    from core.database import init_db
    init_db()
    logger.info("Database initialized")
    
    # Initial scan if auto-processing enabled
    if config.auto_start_processing:
        initial_scan()
    
    # Start the watcher
    watcher = HotFolderWatcher()
    watcher.start()