"""
User and Authentication CRUD Operations.
Provides secure database interactions for credentials, password verification, and session tokens.
"""

from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.schema import User
from app.utils.auth import hash_password, verify_password
from app.schemas.auth import RegisterRequest


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Retrieve user record by numeric primary key."""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Retrieve user record by unique login username (case-insensitive)."""
    return db.query(User).filter(User.username.ilike(username.strip())).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Retrieve user record by registered university email address."""
    return db.query(User).filter(User.email.ilike(email.strip())).first()


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """
    Authenticate credentials against stored password hashes.
    Supports login via either Username or University Email.
    """
    clean = username.strip()
    user = get_user_by_username(db, clean)
    if not user and "@" in clean:
        user = get_user_by_email(db, clean)
        
    if not user:
        return None
        
    if not verify_password(password, user.password_hash):
        return None
        
    return user


def create_user(db: Session, req: RegisterRequest) -> User:
    """Create a new user with hashed credentials and role assignments."""
    hashed = hash_password(req.password)
    user = User(
        username=req.username.strip(),
        password_hash=hashed,
        role=req.role,
        email=req.email.lower().strip() if req.email else None,
        phone=req.phone.strip() if req.phone else None
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user_password(db: Session, user_id: int, new_plain_password: str) -> bool:
    """Rotate and commit a new password hash for a designated user."""
    user = get_user_by_id(db, user_id)
    if not user:
        return False
    user.password_hash = hash_password(new_plain_password)
    db.commit()
    return True


def list_users(db: Session, role: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[User]:
    """List system users with optional role filtering."""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.offset(skip).limit(limit).all()
