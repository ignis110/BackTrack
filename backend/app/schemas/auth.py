"""
Pydantic Schemas for Authentication and Authorization in BackTrack.
Defines request and response validation structures for user sessions.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class TokenPayload(BaseModel):
    """Payload stored inside JWT authentication tokens."""
    sub: str = Field(..., description="Subject identifier (user ID or USN)")
    username: str = Field(..., description="Username used at login")
    role: str = Field(..., description="System role: student, faculty, or admin")
    exp: Optional[datetime] = None


class TokenResponse(BaseModel):
    """Response returned upon successful authentication."""
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
    name: str
    role: str
    email: Optional[str] = None


class LoginRequest(BaseModel):
    """Incoming user login credentials."""
    username: str = Field(..., min_length=2, max_length=50, description="USN, Employee ID, or email")
    password: str = Field(..., min_length=4, max_length=100, description="User plain password")
    role: Optional[str] = Field("student", description="Requested role portal")


class RegisterRequest(BaseModel):
    """New user self-registration schema."""
    username: str = Field(..., min_length=3, max_length=30)
    password: str = Field(..., min_length=4, max_length=100)
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., description="User contact email address")
    role: str = Field(..., pattern="^(student|faculty|admin)$")
    phone: Optional[str] = Field(None, max_length=20)
    enrollment_or_empid: Optional[str] = Field(None, max_length=30)


class PasswordChangeRequest(BaseModel):
    """Password rotation schema for logged-in users."""
    current_password: str = Field(..., min_length=4)
    new_password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)


class UserProfileResponse(BaseModel):
    """Profile representation for account settings."""
    id: int
    username: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
