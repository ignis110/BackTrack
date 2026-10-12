"""
BackTrack Consolidated Grade Card and Academic Transcript Service.
Calculates UGC Choice Based Credit System (CBCS) grading parameters:
1. Absolute to Letter Grade Mapping (O, A+, A, B+, B, C, P, F).
2. Grade Point (GP) and Credit Point (CP = Credits * GP) computations.
3. Semester Grade Point Average (SGPA) = Sum(CP) / Sum(Credits).
4. Cumulative Grade Point Average (CGPA) progression across completed terms.
5. Degree Classification (First Class with Distinction, First Class, Higher Second Class).
"""

from typing import List, Dict, Any, Tuple
from dataclasses import dataclass


@dataclass
class SubjectGrade:
    code: str
    name: str
    credits: int
    internal_marks: int
    external_marks: int
    total_marks: int
    letter_grade: str
    grade_point: int
    credit_points: int
    status: str  # "Passed", "Backlog", "Cleared"


@dataclass
class SemesterTranscript:
    semester_number: int
    total_credits: int
    earned_credits: int
    total_credit_points: int
    sgpa: float
    status: str  # "Passed", "Promoted with Backlogs", "Detained"
    grades: List[SubjectGrade]


class TranscriptService:
    """Computes university transcripts under 10-point UGC Choice Based Credit System."""

    GRADE_SCALE: List[Tuple[int, str, int, str]] = [
        # (min_marks, letter_grade, grade_point, performance_descriptor)
        (90, "O", 10, "Outstanding"),
        (80, "A+", 9, "Excellent"),
        (70, "A", 8, "Very Good"),
        (60, "B+", 7, "Good"),
        (55, "B", 6, "Above Average"),
        (50, "C", 5, "Average"),
        (40, "P", 4, "Pass"),
        (0, "F", 0, "Fail / Backlog"),
    ]

    @classmethod
    def marks_to_grade(cls, total_marks: int) -> Tuple[str, int, str]:
        """Maps percentage marks out of 100 to standard 10-point UGC letter grade."""
        for min_m, letter, point, desc in cls.GRADE_SCALE:
            if total_marks >= min_m:
                return letter, point, desc
        return "F", 0, "Fail / Backlog"

    @classmethod
    def evaluate_subject(
        cls,
        code: str,
        name: str,
        credits: int,
        internal_marks: int,
        external_marks: int
    ) -> SubjectGrade:
        """Evaluates a single subject paper against university criteria."""
        total = internal_marks + external_marks
        letter, point, _ = cls.marks_to_grade(total)

        # In university rules, a student must obtain >= 40% in endsem and >= 40% overall to pass
        if external_marks < 40 or total < 40:
            letter = "F"
            point = 0
            status = "Backlog"
        else:
            status = "Passed"

        credit_points = credits * point

        return SubjectGrade(
            code=code,
            name=name,
            credits=credits,
            internal_marks=internal_marks,
            external_marks=external_marks,
            total_marks=total,
            letter_grade=letter,
            grade_point=point,
            credit_points=credit_points,
            status=status
        )

    @classmethod
    def generate_semester_transcript(
        cls,
        semester_number: int,
        raw_subjects: List[Dict[str, Any]]
    ) -> SemesterTranscript:
        """
        Calculates SGPA and credit points for all subjects in a semester.
        Formula: SGPA = sum(Credits_i * GradePoint_i) / sum(Credits_i)
        """
        grades: List[SubjectGrade] = []
        total_credits = 0
        earned_credits = 0
        total_credit_points = 0
        backlog_count = 0

        for s in raw_subjects:
            c = s.get("credits", 4)
            int_m = s.get("internal_marks", 0)
            ext_m = s.get("external_marks", 0)
            sub_grade = cls.evaluate_subject(
                code=s.get("code", "SUB"),
                name=s.get("name", "Subject"),
                credits=c,
                internal_marks=int_m,
                external_marks=ext_m
            )
            grades.append(sub_grade)
            total_credits += c

            if sub_grade.status == "Passed":
                earned_credits += c
                total_credit_points += sub_grade.credit_points
            else:
                backlog_count += 1

        sgpa = round(total_credit_points / total_credits, 2) if total_credits > 0 else 0.0

        if backlog_count == 0:
            status = "Passed"
        elif backlog_count <= 4:
            status = "Promoted with Backlogs"
        else:
            status = "Detained (Year Back)"

        return SemesterTranscript(
            semester_number=semester_number,
            total_credits=total_credits,
            earned_credits=earned_credits,
            total_credit_points=total_credit_points,
            sgpa=sgpa,
            status=status,
            grades=grades
        )

    @classmethod
    def calculate_cgpa(cls, semester_transcripts: List[SemesterTranscript]) -> Dict[str, Any]:
        """
        Calculates Cumulative Grade Point Average (CGPA) and Degree Award Division.
        Formula: CGPA = sum(Total Credit Points across terms) / sum(Total Credits across terms)
        """
        total_cp = sum(st.total_credit_points for st in semester_transcripts)
        total_credits = sum(st.total_credits for st in semester_transcripts)
        total_earned = sum(st.earned_credits for st in semester_transcripts)
        any_active_backlogs = any(
            g.status == "Backlog" for st in semester_transcripts for g in st.grades
        )

        cgpa = round(total_cp / total_credits, 2) if total_credits > 0 else 0.0

        # University Degree Classification
        if any_active_backlogs:
            division = "Incomplete (Pending Backlog Clearance)"
        elif cgpa >= 8.5:
            division = "First Class with Distinction (Honors)"
        elif cgpa >= 7.0:
            division = "First Class"
        elif cgpa >= 6.0:
            division = "Higher Second Class"
        elif cgpa >= 5.0:
            division = "Second Class"
        elif cgpa >= 4.0:
            division = "Pass Class"
        else:
            division = "Academic Deficiency"

        return {
            "cgpa": cgpa,
            "total_registered_credits": total_credits,
            "total_earned_credits": total_earned,
            "total_credit_points": total_cp,
            "has_uncleared_backlogs": any_active_backlogs,
            "degree_division": division,
            "percentage_equivalent": round(cgpa * 9.5, 2)  # Standard AICTE conversion formula
        }
