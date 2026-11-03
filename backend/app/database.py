from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import settings

# If sqlite, set check_same_thread=False for FastAPI threads
is_sqlite = settings.DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def ensure_schema_updated():
    with engine.connect() as conn:
        for col, col_type in [
            ("jurisdiction", "VARCHAR(50) DEFAULT 'global'"),
            ("visual_inspection", "JSON"),
            ("cultural_notes", "JSON")
        ]:
            try:
                conn.execute(text(f"ALTER TABLE reviews ADD COLUMN {col} {col_type}"))
                conn.commit()
            except Exception:
                pass

try:
    ensure_schema_updated()
except Exception:
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
