"""
Pydantic Schemas for Student Management in BackTrack.
Handles student profile representations, enrolled subjects, and cumulative progress.
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class StudentSubjectScore(BaseModel):
    """Assessment scores for a subject enrolled by a student."""
    subject_code: str
    subject_name: str
    faculty_name: str
    semester: str
    semester_type: str = "Odd"
    midsem_marks: int = Field(default=0, ge=0, le=50)
    midsem_max: int = 50
    endsem_marks: Optional[int] = Field(default=None, ge=0, le=100)
    endsem_max: int = 100
    status: str = "Eligible"


class StudentBase(BaseModel):
    """Base student properties shared across request and response models."""
    name: str = Field(..., min_length=2, max_length=100)
    enrollment_no: str = Field(..., description="University Seat Number (USN)")
    email: Optional[str] = None
    section: Optional[str] = "Sec A"
    semester: Optional[str] = "Sem 3"
    semester_type: Optional[str] = "Odd"
    cgpa: Optional[float] = Field(default=7.5, ge=0.0, le=10.0)


class StudentCreate(StudentBase):
    """Payload for creating a new student record."""
    user_id: Optional[int] = None
    course_code: Optional[str] = "BCA"


class StudentUpdate(BaseModel):
    """Partial update payload for a student profile."""
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    section: Optional[str] = None
    semester: Optional[str] = None
    cgpa: Optional[float] = None


class StudentResponse(StudentBase):
    """Detailed response model returned to frontend clients."""
    id: int
    user_id: Optional[int] = None
    active_backlogs_count: int = 0
    resolved_backlogs_count: int = 0
    enrolled_subjects: List[StudentSubjectScore] = []
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StudentCohortSummary(BaseModel):
    """High-level summary of students within a department or section."""
    total_students: int
    regular_students: int
    backlog_candidates: int
    average_cgpa: float
    sections: List[str]
