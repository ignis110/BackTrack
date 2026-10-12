"""
Authentication & User Account API Routes.
Provides session creation, registration, and credentials management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    PasswordChangeRequest,
    UserProfileResponse
)
from app.crud.crud_user import (
    authenticate_user,
    create_user,
    get_user_by_username,
    get_user_by_email,
    update_user_password
)
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login_endpoint(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate student, faculty, or exam cell admin."""
    user = authenticate_user(db, payload.username, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify your USN/Employee ID and password."
        )

    record_audit_log(db, user.id, "LOGIN", f"User logged into {user.role} portal.")
    
    # Return session metadata
    return TokenResponse(
        access_token=f"demo-session-token-{user.id}-{user.username}",
        token_type="bearer",
        user_id=user.id,
        username=user.username,
        name=user.username.capitalize(),
        role=user.role,
        email=user.email
    )


@router.post("/register", response_model=UserProfileResponse)
def register_endpoint(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new student or faculty account."""
    if get_user_by_username(db, payload.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this username or USN already exists."
        )
        
    if payload.email and get_user_by_email(db, payload.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This university email is already registered."
        )
        
    user = create_user(db, payload)
    record_audit_log(db, user.id, "REGISTER", f"Account created with role: {user.role}.")
    
    return UserProfileResponse(
        id=user.id,
        username=user.username,
        name=payload.name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        created_at=user.created_at
    )
