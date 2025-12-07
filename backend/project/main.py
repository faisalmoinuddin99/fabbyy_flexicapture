# project/main.py
from database import init_db
from watcher import start_watcher
from utils.logging import setup_logging
from config import Config

logger = setup_logging()

if __name__ == '__main__':
    Config.init_dirs()
    init_db()
    logger.info('Starting hot folder watcher...')
    start_watcher()  # Runs in background; can run API separately