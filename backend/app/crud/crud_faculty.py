"""
Faculty and Mentorship CRUD Operations.
Provides queries for faculty assignments, student consultations, and clearance audits.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.models.schema import Faculty, Subject, Student, Backlog, Notification, ActivityLog


def get_faculty_by_id(db: Session, faculty_id: int) -> Optional[Faculty]:
    """Fetch faculty member by integer primary key."""
    return db.query(Faculty).filter(Faculty.id == faculty_id).first()


def get_faculty_by_user_id(db: Session, user_id: int) -> Optional[Faculty]:
    """Retrieve faculty record bound to a specific user authentication ID."""
    return db.query(Faculty).filter(Faculty.user_id == user_id).first()


def get_faculty_by_employee_id(db: Session, emp_id: str) -> Optional[Faculty]:
    """Retrieve faculty by staff employment number (e.g. FAC-1001)."""
    return db.query(Faculty).filter(Faculty.employee_id.ilike(emp_id.strip())).first()


def list_faculty_members(db: Session, department: Optional[str] = None) -> List[Faculty]:
    """List all teaching staff with optional department filtering."""
    query = db.query(Faculty)
    if department:
        query = query.filter(Faculty.department == department)
    return query.all()


def get_faculty_dashboard_stats(db: Session, faculty_id: int) -> Dict[str, Any]:
    """Aggregate statistics for the Faculty Academic Desk."""
    faculty = get_faculty_by_id(db, faculty_id)
    if not faculty:
        return {}
        
    assigned_subjects = db.query(Subject).filter(Subject.faculty_id == faculty_id).all()
    subject_ids = [s.id for s in assigned_subjects]
    
    active_backlogs_count = db.query(Backlog).filter(
        Backlog.subject_id.in_(subject_ids),
        Backlog.status != "Cleared"
    ).count() if subject_ids else 0
    
    cleared_count = db.query(Backlog).filter(
        Backlog.subject_id.in_(subject_ids),
        Backlog.status == "Cleared"
    ).count() if subject_ids else 0
    
    return {
        "faculty_name": faculty.name,
        "employee_id": faculty.employee_id,
        "department": faculty.department,
        "assigned_subjects_count": len(assigned_subjects),
        "active_backlogs_under_review": active_backlogs_count,
        "resolved_backlogs": cleared_count,
        "sections": ["BCA Sem 3 - Sec A", "BCA Sem 3 - Sec B"]
    }
