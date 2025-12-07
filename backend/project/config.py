# project/config.py
import os
import json
from pathlib import Path

class Config:
    CONFIG_FILE = Path(__file__).parent / 'runtime_config.json'
    
    # Default values
    DEFAULTS = {
        "HOT_FOLDER_PATH": str(Path.home() / "hot_folder"),
        "EXTRACTION_ENGINE": "rule_based"
    }

    _cache = None

    @classmethod
    def load(cls):
        if cls._cache is not None:
            return cls._cache

        if cls.CONFIG_FILE.exists():
            try:
                with open(cls.CONFIG_FILE, 'r') as f:
                    data = json.load(f)
                cls._cache = {**cls.DEFAULTS, **data}
            except:
                cls._cache = cls.DEFAULTS.copy()
        else:
            cls._cache = cls.DEFAULTS.copy()
        
        return cls._cache

    @classmethod
    def get(cls, key, default=None):
        return cls.load().get(key, default)

    @classmethod
    def set(cls, key, value):
        config = cls.load()
        config[key] = value
        cls._cache = config
        
        # Ensure directory exists
        os.makedirs(cls.CONFIG_FILE.parent, exist_ok=True)
        with open(cls.CONFIG_FILE, 'w') as f:
            json.dump(config, f, indent=2)

    # Easy access
    HOT_FOLDER_PATH = property(lambda _: cls.get('HOT_FOLDER_PATH'))
    EXTRACTION_ENGINE = property(lambda _: cls.get('EXTRACTION_ENGINE'))

    @classmethod
    def init_dirs(cls):
        os.makedirs(cls.HOT_FOLDER_PATH, exist_ok=True)
        os.makedirs(str(Path(__file__).parent / 'temp_processing'), exist_ok=True)
        os.makedirs(str(Path(__file__).parent / 'logs'), exist_ok=True)