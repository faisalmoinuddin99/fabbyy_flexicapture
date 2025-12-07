# project/config.py
import os
from pathlib import Path

class Config:
    # Configurable hot folder path
    HOT_FOLDER_PATH = os.getenv('HOT_FOLDER_PATH', str(Path.home() / 'hot_folder'))
    
    # Database configuration (using SQLite for simplicity, can switch to PostgreSQL)
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///project.db')
    
    # Extraction engine: 'rule_based' or 'ai_based' (plug and play)
    EXTRACTION_ENGINE = os.getenv('EXTRACTION_ENGINE', 'rule_based')
    
    # Other configs
    TEMP_PROCESSING_DIR = str(Path(__file__).parent / 'temp_processing')
    LOG_FILE = str(Path(__file__).parent / 'logs' / 'app.log')
    
    @classmethod
    def init_dirs(cls):
        os.makedirs(cls.HOT_FOLDER_PATH, exist_ok=True)
        os.makedirs(cls.TEMP_PROCESSING_DIR, exist_ok=True)
        os.makedirs(os.path.dirname(cls.LOG_FILE), exist_ok=True)