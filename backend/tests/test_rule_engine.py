"""
Automated Unit Tests for Academic Regulations Rule Engine.
Validates Ordinance Grace Marks, Year-Back Detention, and Prerequisite Chains.
"""

import pytest
import sys
import os

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)

from app.services.rule_engine import (
    AcademicRuleEngine,
    AcademicStanding,
    GraceMarkResult,
    DetentionAssessment
)


class TestAcademicRuleEngine:
    """Tests for academic policy enforcement."""

    def test_academic_standing_good(self):
        """Zero backlogs should yield Good Standing."""
        res = AcademicRuleEngine.evaluate_academic_standing(active_backlog_count=0, current_semester=3)
        assert res.standing == AcademicStanding.GOOD_STANDING
        assert res.is_promoted is True
        assert res.remedial_classes_required is False

    def test_academic_standing_warning(self):
        """1-2 backlogs should yield Academic Warning with remedial advisory."""
        res = AcademicRuleEngine.evaluate_academic_standing(active_backlog_count=2, current_semester=3)
        assert res.standing == AcademicStanding.ACADEMIC_WARNING
        assert res.is_promoted is True
        assert res.remedial_classes_required is True

    def test_academic_standing_probation(self):
        """3-4 backlogs should yield Academic Probation."""
        res = AcademicRuleEngine.evaluate_academic_standing(active_backlog_count=4, current_semester=3)
        assert res.standing == AcademicStanding.ACADEMIC_PROBATION
        assert res.is_promoted is True

    def test_academic_standing_detention(self):
        """5+ backlogs should trigger Year-Back Detention."""
        res = AcademicRuleEngine.evaluate_academic_standing(active_backlog_count=5, current_semester=3)
        assert res.standing == AcademicStanding.DETAINED_YEAR_BACK
        assert res.is_promoted is False

    def test_grace_marks_eligible(self):
        """Marks deficit of 2 should receive grace marks to reach passing threshold."""
        res = AcademicRuleEngine.calculate_grace_marks(
            subject_code="BCA304",
            obtained_marks=38,
            passing_marks=40,
            already_used_grace=0
        )
        assert res.eligible is True
        assert res.grace_marks_awarded == 2
        assert res.revised_marks == 40

    def test_grace_marks_deficit_too_large(self):
        """Deficit exceeding 3 marks is ineligible for ordinance grace."""
        res = AcademicRuleEngine.calculate_grace_marks(
            subject_code="BCA304",
            obtained_marks=35,
            passing_marks=40,
            already_used_grace=0
        )
        assert res.eligible is False
        assert res.grace_marks_awarded == 0

    def test_grace_marks_exhausted_semester_quota(self):
        """Should reject grace if semester quota of 5 is exceeded."""
        res = AcademicRuleEngine.calculate_grace_marks(
            subject_code="BCA304",
            obtained_marks=38,
            passing_marks=40,
            already_used_grace=4
        )
        assert res.eligible is False
        assert "Insufficient semester grace balance" in res.reason

    def test_prerequisite_satisfied(self):
        """Algorithms requires Data Structures (BCA302)."""
        res = AcademicRuleEngine.verify_prerequisites("BCA401", cleared_subject_codes=["BCA302", "BCA101"])
        assert res.can_enroll is True

    def test_prerequisite_missing(self):
        """Algorithms should be blocked if BCA302 is missing."""
        res = AcademicRuleEngine.verify_prerequisites("BCA401", cleared_subject_codes=["BCA101"])
        assert res.can_enroll is False
        assert "BCA302" in res.missing_prerequisites

    def test_fee_calculation(self):
        """Exam fee calculation for 2 papers with late fine."""
        res = AcademicRuleEngine.calculate_backlog_exam_fee(subject_count=2, is_late=True)
        assert res["subtotal"] == 1500
        assert res["late_fine"] == 500
        assert res["total_fee"] == 2000
