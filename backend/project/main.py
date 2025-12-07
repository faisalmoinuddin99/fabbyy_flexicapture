# project/main.py
import logging
from config import Config
from database import init_db
from utils.logging import setup_logging
from watcher import start_watcher_initial

logger = setup_logging()

if __name__ == '__main__':
    try:
        Config.init_dirs()
        logger.info("Directories ready")

        init_db()
        logger.info("Database ready")

        logger.info(f"Hot folder → {Config.HOT_FOLDER_PATH}")
        start_watcher_initial()          # ← this now blocks forever

    except Exception as e:
        logger.critical(f"Application failed: {e}")
        raise