# utils/logging.py
import logging
import os
from config import Config

def setup_logging():
    # Auto-create logs directory if missing
    os.makedirs(os.path.dirname(Config.LOG_FILE), exist_ok=True)
    
    logging.basicConfig(
        filename=Config.LOG_FILE,
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        filemode='a'  # append mode
    )
    # Also log to console so you see output when running main.py
    logging.getLogger().addHandler(logging.StreamHandler())
    return logging.getLogger(__name__)