# test_db.py
from core.database import init_db, SessionLocal, Batch, ProcessingStatus

init_db(drop_all=True)  # only for testing!

db = SessionLocal()
batch = Batch(
    filename="test.pdf",
    original_path="/hot/test.pdf",
    file_hash="abc123",
    file_size=1024,
    status=ProcessingStatus.PENDING
)
db.add(batch)
db.commit()
print("Database working perfectly!")
db.close()