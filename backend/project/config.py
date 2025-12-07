
# project/config.py
import os
import json
from pathlib import Path


class classproperty(property):
    """A property that works on the class, not instances."""
    def __get__(self, obj, cls):
        return self.fget(cls)


class Config:
    CONFIG_FILE = Path(__file__).parent / "runtime_config.json"

    # Default configuration
    DEFAULTS = {
        "HOT_FOLDER_PATH": str(Path.home() / "hot_folder"),
        "EXTRACTION_ENGINE": "rule_based",
        "DATABASE_URL": f"sqlite:///{Path(__file__).parent / 'project.db'}",
        "LOG_FILE": str(Path(__file__).parent / "logs" / "app.log"),

    }

    _cache = None
    
    @classproperty
    def LOG_FILE(cls) -> str:
        return cls.get("LOG_FILE")


    @classmethod
    def load(cls):
        if cls._cache is not None:
            return cls._cache

        if cls.CONFIG_FILE.exists():
            try:
                with open(cls.CONFIG_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                cls._cache = {**cls.DEFAULTS, **data}
            except Exception as e:
                print(f"[Config] Could not read config file, using defaults: {e}")
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
        # Save to disk
        try:
            os.makedirs(cls.CONFIG_FILE.parent, exist_ok=True)
            with open(cls.CONFIG_FILE, "w", encoding="utf-8") as f:
                json.dump(config, f, indent=2)
        except Exception as e:
            print(f"[Config] Failed to save config: {e}")

    # ---- True class-level properties ----
    @classproperty
    def HOT_FOLDER_PATH(cls) -> str:
        return cls.get("HOT_FOLDER_PATH")

    @classproperty
    def EXTRACTION_ENGINE(cls) -> str:
        return cls.get("EXTRACTION_ENGINE")

    @classproperty
    def DATABASE_URL(cls) -> str:
        return cls.get("DATABASE_URL")

    @classmethod
    def init_dirs(cls):
        try:
            os.makedirs(cls.HOT_FOLDER_PATH, exist_ok=True)
            os.makedirs(Path(__file__).parent / "temp_processing", exist_ok=True)
            os.makedirs(Path(__file__).parent / "logs", exist_ok=True)
        except Exception as e:
            print(f"[Config] Failed to create directories: {e}")
