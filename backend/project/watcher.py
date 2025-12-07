# project/watcher.py
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from processor import process_pdf
from utils.logging import setup_logging
from config import Config

logger = setup_logging()

class HotFolderHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith('.pdf'):
            logger.info(f'New PDF detected: {event.src_path}')
            process_pdf(event.src_path)

def start_watcher():
    event_handler = HotFolderHandler()
    observer = Observer()
    observer.schedule(event_handler, Config.HOT_FOLDER_PATH, recursive=False)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()