"""
Backlog Lifecycle and Progress Tracking API Routes.
Manages student progress submissions, faculty meetings, repeat exams, and clearance confirmations.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.backlog import (
    BacklogCreate,
    BacklogProgressUpdate,
    BacklogResponse,
    BacklogClearanceConfirmation
)
from app.crud.crud_backlog import (
    list_backlogs,
    get_backlog_by_id,
    create_backlog_entry,
    update_backlog_progress,
    confirm_backlog_clearance
)
from app.services.clearance_service import evaluate_clearance_eligibility

router = APIRouter(prefix="/backlogs", tags=["Backlog Management"])


@router.get("/", response_model=List[BacklogResponse])
def get_backlogs(status: Optional[str] = None, db: Session = Depends(get_db)):
    """Fetch active and resolved backlogs for filtering across departments."""
    backlogs = list_backlogs(db, status=status)
    results = []
    for b in backlogs:
        results.append(
            BacklogResponse(
                id=str(b.id),
                student_name=b.student.name if b.student else "Student Candidate",
                usn=b.student.enrollment_no if b.student else "1BT23BCA000",
                subject_code=b.subject.code if b.subject else "BCA301",
                subject_name=b.subject.name if b.subject else "Subject Paper",
                semester="Semester 3",
                semester_type="Odd",
                backlog_reason=b.reason or "Low Marks in End-Sem",
                original_marks=32,
                max_marks=100,
                met_teacher=True if b.status == "Cleared" else False,
                assignments_completed="Completed" if b.status == "Cleared" else "Pending",
                teacher_consultation="Guidance Received" if b.status == "Cleared" else "Pending Guidance",
                repeat_exam_status="Appeared" if b.status == "Cleared" else "Preparing",
                result_status="Cleared" if b.status == "Cleared" else "Awaiting result",
                clearance_status=b.status or "Pending",
                student_remarks="Submitted repeat exam registration.",
                created_at=b.created_at
            )
        )
    return results


@router.patch("/{backlog_id}/progress")
def update_progress(backlog_id: int, payload: BacklogProgressUpdate, db: Session = Depends(get_db)):
    """Update progress tracking indicators for teacher consultation or exam readiness."""
    entry = update_backlog_progress(db, backlog_id, payload)
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Backlog entry with ID {backlog_id} not found."
        )
    return {"message": "Backlog resolution progress updated successfully.", "id": backlog_id}


@router.post("/{backlog_id}/clear")
def clear_backlog_endpoint(backlog_id: int, db: Session = Depends(get_db)):
    """Confirm official backlog clearance and issue certification sign-off."""
    entry = confirm_backlog_clearance(db, backlog_id)
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Backlog entry with ID {backlog_id} not found."
        )
    return {"message": "Backlog officially cleared! Certificate is now generated.", "id": backlog_id}
