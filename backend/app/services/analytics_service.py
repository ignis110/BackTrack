"""
Analytics and Academic Resolution Insights Service.
Computes funnel conversion rates, department recovery velocity, and repeat exam trends.
"""

from typing import List, Dict, Any


def compute_resolution_funnel(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes exact stage drop-offs across the 5 stages:
    1. Total Backlogs Logged
    2. Met Teacher (Consultation Complete)
    3. Assignments Done
    4. Repeat Exam Appeared
    5. Officially Cleared & Certified
    """
    total = len(records)
    if total == 0:
        return {
            "total_logged": 0,
            "met_teacher": 0,
            "assignments_done": 0,
            "exam_appeared": 0,
            "cleared": 0,
            "conversion_rate": 0.0,
            "funnel_stages": []
        }
        
    met_teacher = sum(1 for r in records if r.get("metTeacher") or r.get("met_teacher"))
    assignments_done = sum(1 for r in records if r.get("assignmentsCompleted") == "Completed" or r.get("assignments_completed") == "Completed")
    exam_appeared = sum(1 for r in records if r.get("repeatExamStatus") == "Appeared" or r.get("repeat_exam_status") == "Appeared")
    cleared = sum(1 for r in records if r.get("clearanceStatus") == "Cleared" or r.get("status") == "Cleared")
    
    conversion = round((cleared / total) * 100, 1)
    
    stages = [
        {"stage": "1. Backlogs Logged", "count": total, "percent": 100.0},
        {"stage": "2. Faculty Consultation", "count": met_teacher, "percent": round((met_teacher / total) * 100, 1)},
        {"stage": "3. Assignments Done", "count": assignments_done, "percent": round((assignments_done / total) * 100, 1)},
        {"stage": "4. Repeat Exam Appeared", "count": exam_appeared, "percent": round((exam_appeared / total) * 100, 1)},
        {"stage": "5. Clearance Certified", "count": cleared, "percent": conversion}
    ]
    
    return {
        "total_logged": total,
        "met_teacher": met_teacher,
        "assignments_done": assignments_done,
        "exam_appeared": exam_appeared,
        "cleared": cleared,
        "conversion_rate": conversion,
        "funnel_stages": stages
    }


def compute_cohort_breakdown(students: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Segment student cohort into Regular, At-Risk, and Backlog Candidates."""
    total = len(students)
    if total == 0:
        return {"total": 0, "regular": 0, "backlog_candidates": 0, "average_cgpa": 0.0}
        
    regular = sum(1 for s in students if s.get("backlogs", 0) == 0)
    backlog_cand = total - regular
    cgpas = [s.get("cgpa", 7.0) for s in students if s.get("cgpa")]
    avg_cgpa = round(sum(cgpas) / len(cgpas), 2) if cgpas else 0.0
    
    return {
        "total": total,
        "regular": regular,
        "backlog_candidates": backlog_cand,
        "average_cgpa": avg_cgpa,
        "healthy_cohort_percentage": round((regular / total) * 100, 1)
    }
