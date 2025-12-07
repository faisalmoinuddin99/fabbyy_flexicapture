# project/main.py

import logging
from config import Config
from database import init_db
from utils.logging import setup_logging
from watcher import start_watcher_initial

# Setup logger first
logger = setup_logging()

if __name__ == '__main__':
    try:
        # 1. Create required folders
        Config.init_dirs()
        logger.info("Directories initialized")

        # 2.Initialize database (creates tables if not exist)
        init_db()
        logger.info("Database initialized")

        # 3. Start the hot folder watcher
        logger.info(f'Starting hot folder watcher on: {Config.HOT_FOLDER_PATH}')
        start_watcher_initial()

    except Exception as e:
        logger.critical(f"Failed to start application: {e}")
        raise