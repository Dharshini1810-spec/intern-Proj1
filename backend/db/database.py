from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from core.config import settings

# Ensure DATABASE_URL always starts with sqlite:// as safe fallback
_db_url = settings.DATABASE_URL.strip()
if not _db_url.startswith("sqlite") and not _db_url.startswith("postgresql") and not _db_url.startswith("postgres"):
    _db_url = "sqlite:///./database.db"

engine = create_engine(
    _db_url,
    connect_args={"check_same_thread": False} if "sqlite" in _db_url else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    from models.story import Story, StoryNode
    from models.job import StoryJob
    Base.metadata.create_all(bind=engine)