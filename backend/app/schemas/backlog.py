"""
Pydantic Schemas for Backlog Records and Clearance Workflows in BackTrack.
Models all 5 stages of the resolution funnel: logging, meeting, assignments, repeat exam, and clearance.
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class BacklogBase(BaseModel):
    """Core backlog data attributes."""
    student_name: str
    usn: str
    subject_code: str
    subject_name: str
    semester: str
    semester_type: str = "Odd"
    backlog_reason: str = Field(default="Low Marks in End-Sem", description="Low marks or attendance shortage")
    original_marks: int = Field(default=28, ge=0, le=100)
    max_marks: int = Field(default=100, ge=50, le=100)


class BacklogCreate(BacklogBase):
    """Payload sent by student or exam cell when registering a backlog."""
    student_remarks: Optional[str] = "Registered for repeat examination"


class BacklogProgressUpdate(BaseModel):
    """Payload updated by students or faculty during resolution."""
    met_teacher: Optional[bool] = None
    assignments_completed: Optional[str] = Field(None, description="'Completed' or 'Pending'")
    teacher_consultation: Optional[str] = Field(None, description="'Guidance Received' or 'Pending Guidance'")
    repeat_exam_status: Optional[str] = Field(None, description="'Not started', 'Preparing', 'Scheduled', 'Appeared'")
    result_status: Optional[str] = Field(None, description="'Awaiting result', 'Cleared', 'Not cleared'")
    student_remarks: Optional[str] = None


class FacultyGuidanceNote(BaseModel):
    """Advice or guidance posted by a faculty mentor."""
    advice_text: str = Field(..., min_length=5, max_length=1000)
    recommended_reading: Optional[str] = None
    meeting_deadline: Optional[str] = None


class BacklogClearanceConfirmation(BaseModel):
    """Official faculty or exam controller sign-off."""
    faculty_signature_id: str
    verification_notes: Optional[str] = "Verified repeat examination results and assignment submissions."
    clearance_status: str = "Cleared"
    result_status: str = "Cleared"


class BacklogResponse(BacklogBase):
    """Full representation of a backlog item returned by the API."""
    id: str
    met_teacher: bool = False
    assignments_completed: str = "Pending"
    teacher_consultation: str = "Pending Guidance"
    repeat_exam_status: str = "Preparing"
    result_status: str = "Awaiting result"
    clearance_status: str = "Pending"
    student_remarks: str = ""
    faculty_notes: Optional[str] = None
    last_updated: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BacklogFunnelStats(BaseModel):
    """Aggregate counts for the 5-stage Visual Resolution Funnel."""
    total_backlogs: int
    met_teacher_count: int
    assignments_done_count: int
    exam_appeared_count: int
    cleared_count: int
    clearance_percentage: float
