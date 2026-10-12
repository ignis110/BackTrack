"""
Pydantic Schemas for Faculty and Certificate Generation in BackTrack.
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class FacultyBase(BaseModel):
    """Faculty profile data."""
    name: str = Field(..., min_length=2, max_length=100)
    employee_id: str
    department: str = "Computer Applications"
    designation: str = "Professor & HOD"
    email: Optional[str] = None
    phone: Optional[str] = None
    cabin: Optional[str] = "Room 304, IT Block"


class FacultyResponse(FacultyBase):
    """Faculty output representation."""
    id: int
    user_id: Optional[int] = None
    supervised_cohort_count: int = 0
    assigned_sections: List[str] = []

    class Config:
        from_attributes = True


class ClearanceCertificatePayload(BaseModel):
    """Data required to generate an official Backlog Clearance Certificate."""
    certificate_id: str
    student_name: str
    usn: str
    course: str = "Bachelor of Computer Applications (BCA)"
    subject_code: str
    subject_name: str
    semester: str
    academic_year: str = "2026-2027"
    issue_date: str
    faculty_mentor: str
    exam_controller: str = "Dr. Arvind Rao (Controller of Examinations)"
    verification_hash: str
    status: str = "Officially Cleared & Certified"


class CertificateVerifyResponse(BaseModel):
    """Verification output for scanning QR code or checking certificate ID."""
    is_valid: bool
    certificate_id: str
    student_name: str
    usn: str
    subject_code: str
    verified_at: str
    message: str
