# project/database.py
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from config import Config

Base = declarative_base()
engine = create_engine(Config.DATABASE_URL)
Session = sessionmaker(bind=engine)

class Batch(Base):
    __tablename__ = 'batches'
    id = Column(Integer, primary_key=True)
    pdf_path = Column(String, nullable=False)
    status = Column(String, default='pending')  # pending, processing, completed, error
    documents = relationship('Document', backref='batch')

class Document(Base):
    __tablename__ = 'documents'
    id = Column(Integer, primary_key=True)
    batch_id = Column(Integer, ForeignKey('batches.id'))
    doc_type = Column(String)  # e.g., invoice, PO
    pages = relationship('Page', backref='document')

class Page(Base):
    __tablename__ = 'pages'
    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey('documents.id'))
    page_number = Column(Integer)
    image_path = Column(String)  # Processed image
    full_text = Column(Text)

class Field(Base):
    __tablename__ = 'fields'
    id = Column(Integer, primary_key=True)
    page_id = Column(Integer, ForeignKey('pages.id'))
    name = Column(String)
    value = Column(String)
    confidence = Column(Float, default=0.0)
    coordinates = Column(String)  # JSON string of bounding box, e.g., '{"x":10, "y":20, "w":30, "h":40}'

def init_db():
    Base.metadata.create_all(engine)