# project/utils/logging.py
import logging
from config import Config

def setup_logging():
    logging.basicConfig(
        filename=Config.LOG_FILE,
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    return logging.getLogger(__name__)