"""
Backlog Record CRUD Operations.
Manages the complete lifecycle of student backlog entries from creation to certification.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.schema import Backlog, Student, Subject, Faculty
from app.schemas.backlog import BacklogCreate, BacklogProgressUpdate


def get_backlog_by_id(db: Session, backlog_id: int) -> Optional[Backlog]:
    """Retrieve backlog item by database primary key."""
    return db.query(Backlog).filter(Backlog.id == backlog_id).first()


def list_backlogs(
    db: Session,
    student_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    status: Optional[str] = None,
    semester_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Backlog]:
    """Query backlogs with multi-criteria filters for dashboards and exports."""
    query = db.query(Backlog)
    
    if student_id:
        query = query.filter(Backlog.student_id == student_id)
    if subject_id:
        query = query.filter(Backlog.subject_id == subject_id)
    if status:
        query = query.filter(Backlog.status == status)
        
    return query.order_by(Backlog.created_at.desc()).offset(skip).limit(limit).all()


def create_backlog_entry(db: Session, student_id: int, subject_id: int, reason: str, original_marks: int = 0) -> Backlog:
    """Create and persist a new backlog paper record."""
    entry = Backlog(
        student_id=student_id,
        subject_id=subject_id,
        reason=reason,
        status="Pending",
        created_at=datetime.utcnow()
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def update_backlog_progress(db: Session, backlog_id: int, update_data: BacklogProgressUpdate) -> Optional[Backlog]:
    """Update progress tracking fields submitted by students or verified by teachers."""
    backlog = get_backlog_by_id(db, backlog_id)
    if not backlog:
        return None
        
    if update_data.result_status:
        if update_data.result_status == "Cleared":
            backlog.status = "Cleared"
            backlog.cleared_at = datetime.utcnow()
        elif update_data.result_status == "Not cleared":
            backlog.status = "Failed"
            
    db.commit()
    db.refresh(backlog)
    return backlog


def confirm_backlog_clearance(db: Session, backlog_id: int, verified_by_id: Optional[int] = None) -> Optional[Backlog]:
    """Issue formal clearance approval for a resolved backlog subject."""
    backlog = get_backlog_by_id(db, backlog_id)
    if not backlog:
        return None
        
    backlog.status = "Cleared"
    backlog.cleared_at = datetime.utcnow()
    db.commit()
    db.refresh(backlog)
    return backlog


def compute_funnel_statistics(db: Session) -> Dict[str, Any]:
    """Calculate counts across the 5 resolution funnel milestones."""
    total = db.query(Backlog).count() or 1
    cleared = db.query(Backlog).filter(Backlog.status == "Cleared").count()
    pending = db.query(Backlog).filter(Backlog.status == "Pending").count()
    
    return {
        "total_backlogs": total,
        "cleared_count": cleared,
        "pending_count": pending,
        "clearance_rate": round((cleared / total) * 100, 1)
    }
