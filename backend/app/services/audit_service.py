"""
Audit Trail and Activity Logging Service.
Records significant events in the database for institutional accreditation and tracking.
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.schema import ActivityLog


def record_audit_log(
    db: Session,
    user_id: Optional[int],
    action: str,
    details: str
) -> ActivityLog:
    """Record an immutable audit event."""
    log = ActivityLog(
        user_id=user_id,
        action=action,
        details=details,
        timestamp=datetime.utcnow()
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_recent_audit_logs(
    db: Session,
    user_id: Optional[int] = None,
    limit: int = 50
) -> List[ActivityLog]:
    """Retrieve chronologically ordered system logs."""
    query = db.query(ActivityLog)
    if user_id:
        query = query.filter(ActivityLog.user_id == user_id)
    return query.order_by(ActivityLog.timestamp.desc()).limit(limit).all()
