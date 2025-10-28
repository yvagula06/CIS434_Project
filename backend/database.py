"""
Database configuration and session management
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database URL - defaults to SQLite in the backend directory
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./chat_app.db"
)

# Create SQLAlchemy engine
# For SQLite, we need check_same_thread=False to allow multiple threads
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False  # Set to True to see SQL queries in logs
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()


# Dependency to get database session
def get_db():
    """
    Dependency function to get database session.
    Yields a database session and ensures it's closed after use.
    
    Usage in FastAPI:
        @app.get("/items")
        def read_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize the database by creating all tables.
    This is useful for development and testing.
    In production, use Alembic migrations instead.
    """
    from models import User, Conversation, Message, Response
    Base.metadata.create_all(bind=engine)
