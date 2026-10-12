"""
BackTrack Academic Regulations and Ordinances Rule Engine.
Implements standard university academic policies, including:
1. Choice Based Credit System (CBCS) promotion criteria and detention thresholds.
2. Grace mark allocation algorithms (maximum 3 marks per subject, 5 marks total per semester).
3. Prerequisite course dependency validation (e.g., Data Structures before Design & Analysis of Algorithms).
4. Odd/Even semester examination eligibility matrix.
5. Backlog examination attempt limits and remedial coaching requirements.
"""

from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum


class AcademicStanding(str, Enum):
    GOOD_STANDING = "Good Standing"
    ACADEMIC_WARNING = "Academic Warning"
    ACADEMIC_PROBATION = "Academic Probation"
    DETAINED_YEAR_BACK = "Detained (Year Back)"


@dataclass
class GraceMarkResult:
    eligible: bool
    subject_code: str
    original_marks: int
    grace_marks_awarded: int
    revised_marks: int
    passing_threshold: int
    reason: str


@dataclass
class DetentionAssessment:
    standing: AcademicStanding
    total_active_backlogs: int
    max_permissible_backlogs: int
    is_promoted: bool
    remedial_classes_required: bool
    recommendations: List[str]


@dataclass
class PrerequisiteCheckResult:
    can_enroll: bool
    target_subject: str
    missing_prerequisites: List[str]
    message: str


class AcademicRuleEngine:
    """
    University ordinance compliance engine for academic evaluation.
    Enforces standardized credit rules and clearance regulations.
    """

    MAX_ACTIVE_BACKLOGS_PROMOTION = 4  # Maximum backlogs allowed before year-back detention
    PASSING_PERCENTAGE = 40.0           # Minimum aggregate percentage to pass
    MIDSEM_PASSING_MIN = 20             # Minimum out of 50 in internal assessment
    ENDSEM_PASSING_MIN = 40             # Minimum out of 100 in university end-semester
    MAX_GRACE_PER_SUBJECT = 3           # Max grace marks permitted per single course
    MAX_GRACE_PER_SEMESTER = 5          # Max aggregate grace marks permitted in a semester
    MAX_PERMISSIBLE_ATTEMPTS = 4        # Maximum attempts allowed before special board appeal

    # Course prerequisite dependency chain
    PREREQUISITE_MAP = {
        "BCA301": ["BCA102"],           # Database Systems requires Fundamentals of Computing
        "BCA302": ["BCA201"],           # Data Structures requires C Programming
        "BCA401": ["BCA302"],           # Design & Analysis of Algorithms requires Data Structures
        "BCA402": ["BCA301"],           # Advanced Web Tech requires Database Systems
        "BCA501": ["BCA302", "BCA401"], # Artificial Intelligence requires Data Structures & Algorithms
        "BCA502": ["BCA403"],           # Software Engineering requires Object Oriented Analysis
        "BCA601": ["BCA501", "BCA502"], # Major Capstone Project requires AI & Software Engineering
    }

    # Semester examination availability (Regular vs Supplementary)
    SEMESTER_SCHEDULE = {
        "odd": [1, 3, 5, 7],            # Winter examination term (Nov - Dec)
        "even": [2, 4, 6, 8]            # Summer examination term (May - Jun)
    }

    @classmethod
    def evaluate_academic_standing(
        cls,
        active_backlog_count: int,
        current_semester: int,
        cgpa: float = 7.0
    ) -> DetentionAssessment:
        """
        Evaluates student promotion eligibility according to university detention ordinances.
        A student carrying more than MAX_ACTIVE_BACKLOGS_PROMOTION into an odd semester
        faces academic detention (Year Back).
        """
        recommendations = []

        if active_backlog_count == 0:
            standing = AcademicStanding.GOOD_STANDING
            is_promoted = True
            remedial = False
            recommendations.append("Student is in regular academic progression. Eligible for all regular honors tracks.")
        elif active_backlog_count <= 2:
            standing = AcademicStanding.ACADEMIC_WARNING
            is_promoted = True
            remedial = True
            recommendations.append("Advise student to attend faculty doubt-clearing sessions.")
            recommendations.append("Mandatory registration in upcoming supplementary examination session.")
        elif active_backlog_count <= cls.MAX_ACTIVE_BACKLOGS_PROMOTION:
            standing = AcademicStanding.ACADEMIC_PROBATION
            is_promoted = True
            remedial = True
            recommendations.append("Conditional promotion granted under academic probation.")
            recommendations.append("Student restricted from participating in extra-curricular executive committees.")
            recommendations.append("Mandatory 20 hours of remedial coaching per uncleared subject.")
        else:
            standing = AcademicStanding.DETAINED_YEAR_BACK
            is_promoted = False
            remedial = True
            recommendations.append("CRITICAL: Backlog count exceeds maximum permissible promotion threshold.")
            recommendations.append("Student detained for 1 academic year to clear outstanding backlogs.")
            recommendations.append("Formal notification dispatched to Guardian and Head of Department.")

        return DetentionAssessment(
            standing=standing,
            total_active_backlogs=active_backlog_count,
            max_permissible_backlogs=cls.MAX_ACTIVE_BACKLOGS_PROMOTION,
            is_promoted=is_promoted,
            remedial_classes_required=remedial,
            recommendations=recommendations
        )

    @classmethod
    def calculate_grace_marks(
        cls,
        subject_code: str,
        obtained_marks: int,
        passing_marks: int = 40,
        already_used_grace: int = 0
    ) -> GraceMarkResult:
        """
        Determines if a borderline failing student qualifies for Ordinance Grace Marks.
        Rules:
        1. Deficit must be between 1 and MAX_GRACE_PER_SUBJECT marks.
        2. Cumulative grace used in the semester cannot exceed MAX_GRACE_PER_SEMESTER.
        """
        deficit = passing_marks - obtained_marks

        if deficit <= 0:
            return GraceMarkResult(
                eligible=False,
                subject_code=subject_code,
                original_marks=obtained_marks,
                grace_marks_awarded=0,
                revised_marks=obtained_marks,
                passing_threshold=passing_marks,
                reason="Subject is already passed; no grace required."
            )

        if deficit > cls.MAX_GRACE_PER_SUBJECT:
            return GraceMarkResult(
                eligible=False,
                subject_code=subject_code,
                original_marks=obtained_marks,
                grace_marks_awarded=0,
                revised_marks=obtained_marks,
                passing_threshold=passing_marks,
                reason=f"Deficit of {deficit} marks exceeds maximum permissible single-subject grace ({cls.MAX_GRACE_PER_SUBJECT} marks)."
            )

        available_grace = cls.MAX_GRACE_PER_SEMESTER - already_used_grace
        if deficit > available_grace:
            return GraceMarkResult(
                eligible=False,
                subject_code=subject_code,
                original_marks=obtained_marks,
                grace_marks_awarded=0,
                revised_marks=obtained_marks,
                passing_threshold=passing_marks,
                reason=f"Insufficient semester grace balance. Needed: {deficit}, Available: {available_grace}."
            )

        revised = obtained_marks + deficit
        return GraceMarkResult(
            eligible=True,
            subject_code=subject_code,
            original_marks=obtained_marks,
            grace_marks_awarded=deficit,
            revised_marks=revised,
            passing_threshold=passing_marks,
            reason=f"Ordinance Grace of {deficit} marks awarded to reach passing threshold ({passing_marks})."
        )

    @classmethod
    def verify_prerequisites(
        cls,
        target_subject_code: str,
        cleared_subject_codes: List[str]
    ) -> PrerequisiteCheckResult:
        """
        Validates whether a student has cleared all prerequisite courses before registering
        for advanced curriculum papers.
        """
        required = cls.PREREQUISITE_MAP.get(target_subject_code, [])
        if not required:
            return PrerequisiteCheckResult(
                can_enroll=True,
                target_subject=target_subject_code,
                missing_prerequisites=[],
                message="No prerequisites required for this course."
            )

        missing = [code for code in required if code not in cleared_subject_codes]
        if not missing:
            return PrerequisiteCheckResult(
                can_enroll=True,
                target_subject=target_subject_code,
                missing_prerequisites=[],
                message="All academic prerequisites successfully cleared."
            )

        return PrerequisiteCheckResult(
            can_enroll=False,
            target_subject=target_subject_code,
            missing_prerequisites=missing,
            message=f"Enrollment blocked: Must first pass {', '.join(missing)} before attempting {target_subject_code}."
        )

    @classmethod
    def check_semester_exam_eligibility(
        cls,
        backlog_semester: int,
        upcoming_session_type: str  # "odd" or "even"
    ) -> Dict[str, Any]:
        """
        Checks whether an uncleared paper can be re-attempted in the upcoming term.
        Odd semester backlogs are typically scheduled in Winter sessions;
        Even semester backlogs in Summer sessions. Special supplementary allows cross-terms.
        """
        is_odd_backlog = (backlog_semester % 2 != 0)
        is_regular_term_match = (
            (is_odd_backlog and upcoming_session_type == "odd") or
            (not is_odd_backlog and upcoming_session_type == "even")
        )

        return {
            "eligible_for_regular_reexam": is_regular_term_match,
            "eligible_for_special_supplementary": True,
            "recommended_exam_period": "Winter Examination Term" if is_odd_backlog else "Summer Examination Term",
            "backlog_semester": backlog_semester,
            "session_type": upcoming_session_type,
            "fee_per_paper_inr": 750 if is_regular_term_match else 1200
        }

    @classmethod
    def calculate_backlog_exam_fee(cls, subject_count: int, is_late: bool = False) -> Dict[str, Any]:
        """Calculates total university backlog examination registration fee with late fee penalties."""
        base_fee_per_paper = 750
        late_fine = 500 if is_late else 0
        total = (subject_count * base_fee_per_paper) + late_fine

        return {
            "subject_count": subject_count,
            "rate_per_paper": base_fee_per_paper,
            "subtotal": subject_count * base_fee_per_paper,
            "late_fine": late_fine,
            "total_fee": total,
            "currency": "INR",
            "challan_reference_format": "BT-FEE-2026-XXXX"
        }
