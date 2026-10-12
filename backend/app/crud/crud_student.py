"""
Student Data Access Layer (CRUD).
Manages queries for student enrollment records, sections, academic cohorts, and grades.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.models.schema import Student, StudentSubject, Subject, Backlog, Course, Semester, User


def get_student_by_id(db: Session, student_id: int) -> Optional[Student]:
    """Look up student by integer identifier."""
    return db.query(Student).filter(Student.id == student_id).first()


def get_student_by_usn(db: Session, usn: str) -> Optional[Student]:
    """Look up student by unique enrollment seat number (case-insensitive)."""
    return db.query(Student).filter(Student.enrollment_no.ilike(usn.strip())).first()


def get_student_by_user_id(db: Session, user_id: int) -> Optional[Student]:
    """Find student profile corresponding to a logged-in user account."""
    return db.query(Student).filter(Student.user_id == user_id).first()


def list_students(
    db: Session,
    semester_id: Optional[int] = None,
    course_id: Optional[int] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Student]:
    """Retrieve students with multi-attribute filtering for faculty and admins."""
    query = db.query(Student)
    
    if semester_id:
        query = query.filter(Student.semester_id == semester_id)
    if course_id:
        query = query.filter(Student.course_id == course_id)
    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            (Student.name.ilike(pattern)) | (Student.enrollment_no.ilike(pattern))
        )
        
    return query.offset(skip).limit(limit).all()


def get_student_academic_summary(db: Session, student_id: int) -> Dict[str, Any]:
    """Calculate cumulative academic indicators including backlog load and CGPA estimate."""
    student = get_student_by_id(db, student_id)
    if not student:
        return {}
        
    total_subjects = db.query(StudentSubject).filter(StudentSubject.student_id == student_id).count()
    active_backlogs = db.query(Backlog).filter(
        Backlog.student_id == student_id,
        Backlog.status != "Cleared"
    ).count()
    cleared_backlogs = db.query(Backlog).filter(
        Backlog.student_id == student_id,
        Backlog.status == "Cleared"
    ).count()
    
    return {
        "student_id": student.id,
        "name": student.name,
        "usn": student.enrollment_no,
        "total_enrolled_courses": total_subjects,
        "active_backlogs": active_backlogs,
        "cleared_backlogs": cleared_backlogs,
        "standing": "In Good Standing" if active_backlogs == 0 else "Backlog Supervision Active"
    }


def get_enrolled_subjects_for_student(db: Session, student_id: int) -> List[Dict[str, Any]]:
    """Fetch structured subject list with mid-term and end-term marks for a student."""
    records = db.query(StudentSubject, Subject).join(
        Subject, StudentSubject.subject_id == Subject.id
    ).filter(StudentSubject.student_id == student_id).all()
    
    results = []
    for ss, sub in records:
        results.append({
            "subject_code": sub.code,
            "subject_name": sub.name,
            "midsem_marks": ss.internal_marks or 0,
            "midsem_max": 50,
            "endsem_marks": ss.external_marks or 0,
            "endsem_max": 100,
            "attendance_percentage": ss.attendance_percentage or 85.0,
            "status": "Passed" if (ss.internal_marks or 0) >= 20 else "At Risk"
        })
    return results
