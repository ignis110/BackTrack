"""
BackTrack University Examination & Clearance Data Export Service.
Generates administrative exports, official clearance gazettes, CSV tabular summaries,
and examination center seating manifests for academic controllers.
"""

import csv
import io
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.schema import Backlog, Student, Subject, Faculty, Course, Semester


class ExaminationExportService:
    """Provides high-fidelity tabular data exports for university administration."""

    @staticmethod
    def generate_backlog_gazette_csv(db: Session, course_id: Optional[int] = None) -> str:
        """
        Generates CSV format university clearance gazette.
        Contains complete student ledger: USN, Student Name, Subject Code, Subject Name,
        Attempt Number, Current Status, and Clearance Date.
        """
        output = io.StringIO()
        writer = csv.writer(output)

        # Header row
        writer.writerow([
            "Official Gazette ID",
            "Student USN",
            "Student Name",
            "Course",
            "Semester",
            "Subject Code",
            "Subject Name",
            "Attempt Count",
            "Resolution Status",
            "Filing Date",
            "Clearance Date",
            "Academic Standing"
        ])

        query = db.query(Backlog).join(Student).join(Subject)
        if course_id:
            query = query.filter(Student.course_id == course_id)

        records = query.all()

        for idx, b in enumerate(records, start=1001):
            st = b.student
            sub = b.subject
            c_name = st.course.name if st.course else "BCA"
            sem_num = st.semester_rel.number if st.semester_rel else 3
            cleared_str = b.cleared_at.strftime("%Y-%m-%d %H:%M") if b.cleared_at else "N/A"
            created_str = b.created_at.strftime("%Y-%m-%d") if b.created_at else "2026-08-15"

            writer.writerow([
                f"GAZ-2026-{idx}",
                st.enrollment_no,
                st.name,
                c_name,
                f"Semester {sem_num}",
                sub.code,
                sub.name,
                b.attempt_number,
                b.status,
                created_str,
                cleared_str,
                "Eligible for Final Degree" if b.status == "Cleared" else "Clearance In Progress"
            ])

        return output.getvalue()

    @staticmethod
    def generate_clearance_manifest_json(db: Session) -> Dict[str, Any]:
        """
        Compiles structured JSON payload for external university ERP synchronization.
        """
        total_backlogs = db.query(Backlog).count()
        cleared_backlogs = db.query(Backlog).filter(Backlog.status == "Cleared").count()
        pending_backlogs = db.query(Backlog).filter(Backlog.status != "Cleared").count()

        students = db.query(Student).all()
        student_summaries = []

        for st in students:
            st_backlogs = db.query(Backlog).filter(Backlog.student_id == st.id).all()
            total_b = len(st_backlogs)
            cleared_b = sum(1 for b in st_backlogs if b.status == "Cleared")
            active_b = total_b - cleared_b

            student_summaries.append({
                "student_id": st.id,
                "usn": st.enrollment_no,
                "name": st.name,
                "total_backlogs_recorded": total_b,
                "cleared_count": cleared_b,
                "active_count": active_b,
                "has_provisional_noc": (active_b == 0),
                "subjects": [
                    {
                        "code": b.subject.code,
                        "name": b.subject.name,
                        "status": b.status,
                        "attempts": b.attempt_number
                    } for b in st_backlogs
                ]
            })

        return {
            "university_name": "University Institute of Technology & Academic Examinations",
            "export_timestamp": datetime.utcnow().isoformat(),
            "academic_cycle": "2026-2027",
            "aggregate_statistics": {
                "total_records": total_backlogs,
                "cleared_count": cleared_backlogs,
                "pending_count": pending_backlogs,
                "overall_clearance_rate_pct": round((cleared_backlogs / (total_backlogs or 1)) * 100, 2)
            },
            "student_roster": student_summaries
        }

    @staticmethod
    def generate_exam_seating_manifest(db: Session, exam_session_name: str = "Winter Supplementary 2026") -> List[Dict[str, Any]]:
        """
        Produces examination center room allocation and desk seating charts for supplementary exams.
        """
        pending = db.query(Backlog).filter(Backlog.status != "Cleared").all()
        seating_charts = []

        room_capacities = {"Hall A (Main Block)": 30, "Hall B (Science Block)": 30, "Room 204 (CS Dept)": 20}
        current_room_idx = 0
        room_names = list(room_capacities.keys())
        seat_counter = 1

        for b in pending:
            st = b.student
            sub = b.subject
            room_name = room_names[current_room_idx % len(room_names)]

            seating_charts.append({
                "seat_number": f"{room_name[:4].upper()}-{seat_counter:03d}",
                "examination_session": exam_session_name,
                "room": room_name,
                "usn": st.enrollment_no,
                "candidate_name": st.name,
                "subject_code": sub.code,
                "subject_title": sub.name,
                "invigilator_signature_box": "[          ]"
            })

            seat_counter += 1
            if seat_counter > 30:
                seat_counter = 1
                current_room_idx += 1

        return seating_charts
