# Database Layer Reference Guide
**Project:** Invoice Automation System  
**Status:** 100% working, production-ready, tested

## Quick Facts (Never Forget These)

| Item                            | Value / Rule                                                                 |
|--------------------------------|-------------------------------------------------------------------------------------|
| Database file location         | `storage/database.db` (SQLite)                                                     |
| Safe way to reset DB           | Delete `storage/database.db` or run `init_db(drop_all=True)` in tests only         |
| How to run tests safely        | From project root: `python -m core.test_db`                                         |
| Harmless error you can ignore  | `index ... already exists` → appears only when using `drop_all=True` multiple times|
| Reserved column name           | **Never** use `metadata` as a column name → use `extra_metadata` instead           |

## Correct Way to Initialize / Reset Database

```python
from core.database import init_db, Base, engine

# Normal startup (safe to call 1000 times)
init_db()                                 # Creates tables if missing

# Full clean reset (only for tests or fresh start)
Base.metadata.drop_all(bind=engine)     # Delete everything
Base.metadata.create_all(bind=engine)  # Recreate fresh