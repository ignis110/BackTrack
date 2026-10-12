"""
FastAPI Route Dependencies.
Manages database session lifetimes and request validation.
"""

from typing import Generator
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.database import SessionLocal


def get_db() -> Generator[Session, None, None]:
    """
    Yields an isolated SQLAlchemy session per HTTP request.
    Guarantees session cleanup upon completion or unhandled exceptions.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
