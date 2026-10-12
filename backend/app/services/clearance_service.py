"""
Academic Clearance Evaluation and Business Rules Engine.
Encapsulates university policy rules for determining student repeat exam eligibility,
attendance prerequisites, and official certification validation.
"""

import hashlib
from typing import Dict, Any, Tuple
from datetime import datetime


def compute_certificate_hash(usn: str, subject_code: str, issue_timestamp: str) -> str:
    """Generate a tamper-evident SHA-256 verification digest for an issued certificate."""
    raw = f"BACKTRACK::{usn.upper()}::{subject_code.upper()}::{issue_timestamp}::OFFICIAL_ACADEMIC_SEAL"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16].upper()


def evaluate_clearance_eligibility(
    met_teacher: bool,
    assignments_status: str,
    repeat_exam_status: str,
    result_status: str
) -> Tuple[bool, str]:
    """
    Evaluate university policy compliance for backlog clearance.
    
    Rules:
    1. Student must have met with the course faculty mentor.
    2. Required remedial assignments must be marked 'Completed'.
    3. Repeat exam must be appeared.
    4. Repeat exam result status must be confirmed as 'Cleared'.
    """
    if not met_teacher:
        return False, "Teacher consultation milestone has not been completed."
        
    if assignments_status != "Completed":
        return False, "Mandatory remedial coursework and assignments are still pending."
        
    if repeat_exam_status not in ["Appeared", "Cleared"]:
        return False, f"Repeat examination has not been appeared (current state: {repeat_exam_status})."
        
    if result_status != "Cleared":
        return False, f"Repeat examination result has not been confirmed as cleared (current: {result_status})."
        
    return True, "All university clearance criteria successfully fulfilled."


def format_certificate_payload(
    student_name: str,
    usn: str,
    subject_code: str,
    subject_name: str,
    semester: str,
    faculty_name: str
) -> Dict[str, Any]:
    """Build structured clearance certificate metadata matching official university transcript formatting."""
    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    v_hash = compute_certificate_hash(usn, subject_code, now_str)
    
    return {
        "certificate_id": f"BTC-2026-{usn[-4:]}-{subject_code}",
        "student_name": student_name,
        "usn": usn.upper(),
        "program": "Bachelor of Computer Applications (BCA)",
        "subject_code": subject_code,
        "subject_name": subject_name,
        "semester": semester,
        "academic_year": "2026-2027",
        "issue_date": now_str,
        "faculty_mentor": faculty_name,
        "controller_of_examinations": "Dr. Arvind Rao (Controller of Examinations)",
        "verification_hash": v_hash,
        "status": "Officially Cleared & Certified"
    }
