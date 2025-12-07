# project/watcher.py
import time
import logging
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from config import Config
from processor import process_pdf   # ← your existing function

logger = logging.getLogger(__name__)

_observer = None  # global observer so we can stop/restart it

class HotFolderHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory:
            return

        file_path = Path(event.src_path)
        if file_path.suffix.lower() == ".pdf":
            logger.info(f"New PDF detected: {file_path}")
            try:
                process_pdf(str(file_path))
            except Exception as e:
                logger.error(f"Failed to process {file_path}: {e}")

def _start_observer(path: str):
    global _observer
    if _observer is not None:
        _observer.stop()
        _observer.join()

    event_handler = HotFolderHandler()
    _observer = Observer()
    _observer.schedule(event_handler, path, recursive=False)
    _observer.start()
    logger.info(f"Watcher STARTED → {path}")

def start_watcher_initial():
    """Called once at application startup"""
    _start_observer(Config.HOT_FOLDER_PATH)

    # Keep the script alive forever
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Shutting down watcher...")
        if _observer:
            _observer.stop()
            _observer.join()
        logger.info("Watcher stopped.")

def restart_watcher(new_path: str | None = None):
    """Called from the API when user changes hot folder"""
    path = new_path or Config.HOT_FOLDER_PATH
    logger.info(f"Restarting watcher with new path: {path}")
    _start_observer(path)