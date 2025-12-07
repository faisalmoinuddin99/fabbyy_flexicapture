# project/watcher.py

import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from processor import process_pdf
from utils.logging import setup_logging
from config import Config

logger = setup_logging()

_observer = None

class HotFolderHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory and event.src_path.lower().endswith('.pdf'):
            logger.info(f'New PDF detected: {event.src_path}')
            process_pdf(event.src_path)

def start_watcher(path=None):
    global _observer
    if _observer is not None:
        _observer.stop()
        _observer.join()

    watch_path = path or Config.HOT_FOLDER_PATH
    logger.info(f"Starting watcher on: {watch_path}")

    event_handler = HotFolderHandler()
    _observer = Observer()
    _observer.schedule(event_handler, watch_path, recursive=False)
    _observer.start()

def restart_watcher(new_path=None):
    logger.info("Restarting hot folder watcher...")
    start_watcher(path=new_path)

# Initial start
def start_watcher_initial():
    start_watcher()

# Call this in main.py