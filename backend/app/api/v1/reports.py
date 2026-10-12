"""
Administrative Reports and University Gazette API Endpoints.
Provides official clearance gazette CSV downloads, ERP JSON manifests,
and examination center room seating charts.
"""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.services.export_service import ExaminationExportService

router = APIRouter(prefix="/reports", tags=["Administrative Reports"])


@router.get("/gazette/csv")
def download_backlog_gazette_csv(db: Session = Depends(get_db)):
    """Downloads official CSV backlog clearance gazette for university exam records."""
    csv_data = ExaminationExportService.generate_backlog_gazette_csv(db)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=BackTrack_Clearance_Gazette_2026.csv"}
    )


@router.get("/manifest/json")
def get_clearance_manifest_json(db: Session = Depends(get_db)):
    """Fetches complete university clearance ledger in structured JSON for ERP synchronization."""
    return ExaminationExportService.generate_clearance_manifest_json(db)


@router.get("/seating")
def get_exam_seating_manifest(db: Session = Depends(get_db)):
    """Generates supplementary examination hall desk assignments and invigilation rosters."""
    return ExaminationExportService.generate_exam_seating_manifest(db)
