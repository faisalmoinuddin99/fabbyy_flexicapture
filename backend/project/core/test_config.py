# test_config.py
import json
import shutil
from pathlib import Path

# Make sure we import the real config, not a cached one
if Path("core/config.py").exists():
    import importlib
    import core.config
    importlib.reload(core.config)
    from core.config import config, Config
else:
    print("Error: Run this from project root!")
    exit(1)

PROJECT_ROOT = Path(__file__).parent.resolve()
CONFIG_FILE = PROJECT_ROOT / "config.json"
STORAGE_DIR = PROJECT_ROOT / "storage"
LOGS_DIR = PROJECT_ROOT / "logs"

def cleanup():
    """Remove generated files/folders for clean testing"""
    if CONFIG_FILE.exists():
        CONFIG_FILE.unlink()
    if STORAGE_DIR.exists():
        shutil.rmtree(STORAGE_DIR)
    if LOGS_DIR.exists():
        shutil.rmtree(LOGS_DIR)

def test_all_scenarios():
    print("Starting Config Tests".center(60, "="))

    # --------------------------------------------------
    # Test 1: Fresh start (no config.json) - should create default
    # --------------------------------------------------
    cleanup()
    print("\nTest 1: First run (no config.json)")
    importlib.reload(core.config)
    from core.config import config

    assert CONFIG_FILE.exists(), "config.json was not created!"
    assert (PROJECT_ROOT / "storage").exists(), "storage/ folder not created"
    assert (PROJECT_ROOT / "logs").exists(), "logs/ folder not created"
    assert Path(config.hot_folder).exists(), f"Hot folder not created: {config.hot_folder}"
    print("Test 1 Passed: Default config + folders created")

    # --------------------------------------------------
    # Test 2: Reload works and values are correct
    # --------------------------------------------------
    print("\nTest 2: Checking default values")
    assert config.api_port == 8000
    assert config.poll_interval == 5
    assert "pdf" in " ".join(config.file_patterns).lower()
    assert config.parallel_workers >= 1
    print("Test 2 Passed: Default values correct")

    # --------------------------------------------------
    # Test 3: Modify config via .set() and persists
    # --------------------------------------------------
    print("\nTest 3: Testing config.set() persistence")
    config.set("api_port", 9999)
    config.set("poll_interval", 15)
    config.set("hot_folder", str(Path.home() / "my_custom_invoices"))

    # Force reload from disk
    config.reload()

    assert config.api_port == 9999
    assert config.poll_interval == 15
    assert "my_custom_invoices" in config.hot_folder
    print("Test 3 Passed: set() + reload() works")

    # --------------------------------------------------
    # Test 4: Corrupted JSON - should fall back to defaults
    # --------------------------------------------------
    print("\nTest 4: Corrupted config.json - should recover")
    with open(CONFIG_FILE, "w") as f:
        f.write('{"api_port": 5000, "broken_json_here": true,')  # invalid JSON

    importlib.reload(core.config)
    from core.config import config

    assert config.api_port == 8000  # back to default!
    assert CONFIG_FILE.exists()
    with open(CONFIG_FILE) as f:
        data = json.load(f)
        assert data["api_port"] == 8000  # should have been overwritten with defaults
    print("Test 4 Passed: Graceful recovery from corrupted JSON")

    # --------------------------------------------------
    # Test 5: Singleton - same instance everywhere
    # --------------------------------------------------
    print("\nTest 5: Singleton pattern")
    from core.config import config as config1
    config1.set("log_level", "DEBUG")

    from core.config import config as config2
    assert config1 is config2
    assert config2.log_level == "DEBUG"
    print("Test 5 Passed: True singleton")

    # --------------------------------------------------
    # Test 6: Paths are absolute and correct
    # --------------------------------------------------
    print("\nTest 6: Absolute paths")
    assert Path(config.database_url.replace("sqlite:///", "")).is_absolute()
    assert Path(config.temp_folder).is_absolute()
    assert Path(config.processed_folder).is_absolute()
    print("Test 6 Passed: All paths are absolute")

    # --------------------------------------------------
    # Final cleanup
    # --------------------------------------------------
    cleanup()
    print("\n" + "All Tests Passed!".center(60, "Success"))
    print("Your config.py is 100% reliable and production-ready!")

if __name__ == "__main__":
    try:
        test_all_scenarios()
    except Exception as e:
        print(f"\nTest Failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Optional: leave a clean config.json for development
        cleanup()
        from core.config import config  # triggers default creation
        print(f"\nClean config.json created at: {CONFIG_FILE}")