"""
Analytics & Resolution Funnel API Routes.
Exposes real-time conversion stages and cohort recovery trends for department administrators.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.crud.crud_backlog import list_backlogs
from app.services.analytics_service import compute_resolution_funnel

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/funnel")
def get_funnel_analytics(db: Session = Depends(get_db)):
    """Fetch 5-stage Visual Resolution Funnel conversion metrics."""
    backlogs = list_backlogs(db)
    
    # Convert ORM instances to dictionary representation for funnel calculation
    record_dicts = []
    for b in backlogs:
        record_dicts.append({
            "met_teacher": b.status == "Cleared",
            "assignments_completed": "Completed" if b.status == "Cleared" else "Pending",
            "repeat_exam_status": "Appeared" if b.status == "Cleared" else "Preparing",
            "status": b.status or "Pending"
        })
        
    return compute_resolution_funnel(record_dicts)
