"""
Domain Service Layer Package.
Integrates business logic, compliance validation, analytics, and PDF document generation.
"""

from .clearance_service import (
    compute_certificate_hash,
    evaluate_clearance_eligibility,
    format_certificate_payload,
)
from .analytics_service import (
    compute_resolution_funnel,
    compute_cohort_breakdown,
)
from .certificate_service import generate_certificate_pdf
from .audit_service import record_audit_log, get_recent_audit_logs
from .rule_engine import AcademicRuleEngine, AcademicStanding, DetentionAssessment, GraceMarkResult
from .export_service import ExaminationExportService
from .notification_service import NotificationService
from .transcript_service import TranscriptService, SemesterTranscript, SubjectGrade

__all__ = [
    "compute_certificate_hash",
    "evaluate_clearance_eligibility",
    "format_certificate_payload",
    "compute_resolution_funnel",
    "compute_cohort_breakdown",
    "generate_certificate_pdf",
    "record_audit_log",
    "get_recent_audit_logs",
    "AcademicRuleEngine",
    "AcademicStanding",
    "DetentionAssessment",
    "GraceMarkResult",
    "ExaminationExportService",
    "NotificationService",
    "TranscriptService",
    "SemesterTranscript",
    "SubjectGrade",
]
