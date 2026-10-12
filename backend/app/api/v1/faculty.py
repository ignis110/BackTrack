"""
Faculty Portal API Endpoints.
Serves faculty dashboard statistics, student update notifications, and mentorship advice.
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.crud.crud_faculty import list_faculty_members, get_faculty_by_employee_id
from app.schemas.faculty import FacultyResponse
from app.schemas.backlog import FacultyGuidanceNote

router = APIRouter(prefix="/faculty", tags=["Faculty"])


@router.get("/overview")
def get_faculty_overview(emp_id: str = "F1001", db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Retrieve overview metrics for the Faculty Academic Desk."""
    faculty = get_faculty_by_employee_id(db, emp_id)
    if not faculty:
        return {
            "faculty_name": "Dr. Ramesh Sharma",
            "employee_id": emp_id,
            "department": "Computer Applications",
            "active_backlogs": 3,
            "cleared_backlogs": 1,
            "pending_updates": 2
        }
        
    return {
        "faculty_name": faculty.name,
        "employee_id": faculty.employee_id,
        "department": faculty.department,
        "active_backlogs": 3,
        "cleared_backlogs": 1,
        "pending_updates": 2
    }


@router.get("/list", response_model=List[FacultyResponse])
def get_all_faculty(db: Session = Depends(get_db)):
    """List university faculty staff."""
    faculty_list = list_faculty_members(db)
    return [
        FacultyResponse(
            id=f.id,
            name=f.name,
            employee_id=f.employee_id,
            department=f.department,
            designation="Professor & Mentor",
            email=f.user.email if f.user else None,
            supervised_cohort_count=35,
            assigned_sections=["Sec A", "Sec B"]
        ) for f in faculty_list
    ]
