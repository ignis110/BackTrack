"""
Student Portal API Endpoints.
Provides queries for student profiles, enrolled subject syllabi, and transcripts.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.student import StudentResponse, StudentCohortSummary
from app.crud.crud_student import (
    get_student_by_usn,
    list_students,
    get_student_academic_summary,
    get_enrolled_subjects_for_student
)

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("/", response_model=List[StudentResponse])
def get_all_students(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """List student cohort members for faculty and exam supervisors."""
    students = list_students(db, skip=skip, limit=limit)
    response = []
    for s in students:
        summary = get_student_academic_summary(db, s.id)
        response.append(
            StudentResponse(
                id=s.id,
                name=s.name,
                enrollment_no=s.enrollment_no,
                email=s.user.email if s.user else None,
                section="Sec A",
                semester="Sem 3",
                semester_type="Odd",
                cgpa=8.2,
                active_backlogs_count=summary.get("active_backlogs", 0),
                resolved_backlogs_count=summary.get("cleared_backlogs", 0),
                enrolled_subjects=[]
            )
        )
    return response


@router.get("/{usn}/subjects")
def get_student_enrolled_subjects(usn: str, db: Session = Depends(get_db)):
    """Fetch enrolled subjects with mid-sem and end-sem assessments."""
    student = get_student_by_usn(db, usn)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student record with USN {usn} was not found."
        )
        
    return get_enrolled_subjects_for_student(db, student.id)
