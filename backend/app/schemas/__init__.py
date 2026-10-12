"""
Schema package aggregator for BackTrack API.
Imports all validation structures for rapid consumption in routers and services.
"""

from .auth import (
    TokenPayload,
    TokenResponse,
    LoginRequest,
    RegisterRequest,
    PasswordChangeRequest,
    UserProfileResponse,
)
from .student import (
    StudentBase,
    StudentCreate,
    StudentUpdate,
    StudentResponse,
    StudentSubjectScore,
    StudentCohortSummary,
)
from .backlog import (
    BacklogBase,
    BacklogCreate,
    BacklogProgressUpdate,
    FacultyGuidanceNote,
    BacklogClearanceConfirmation,
    BacklogResponse,
    BacklogFunnelStats,
)
from .faculty import (
    FacultyBase,
    FacultyResponse,
    ClearanceCertificatePayload,
    CertificateVerifyResponse,
)

__all__ = [
    "TokenPayload",
    "TokenResponse",
    "LoginRequest",
    "RegisterRequest",
    "PasswordChangeRequest",
    "UserProfileResponse",
    "StudentBase",
    "StudentCreate",
    "StudentUpdate",
    "StudentResponse",
    "StudentSubjectScore",
    "StudentCohortSummary",
    "BacklogBase",
    "BacklogCreate",
    "BacklogProgressUpdate",
    "FacultyGuidanceNote",
    "BacklogClearanceConfirmation",
    "BacklogResponse",
    "BacklogFunnelStats",
    "FacultyBase",
    "FacultyResponse",
    "ClearanceCertificatePayload",
    "CertificateVerifyResponse",
]
