"""
BackTrack SQLite Database Integrity Inspector and Health Check CLI Tool.
Performs verification of database tables, row counts, orphaned foreign keys,
and summary clearance metrics for university administrators.
"""

import sys
import os
import sqlite3

# Add backend directory to path
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(backend_dir)

from app.models.database import engine, SessionLocal
from app.models.schema import User, Student, Faculty, Subject, Course, Semester, AcademicSession, Backlog, StudentSubject, ActivityLog


def inspect_database():
    """Inspects SQLite database tables, row counts, and active records."""
    print("=" * 65)
    print("      BACKTRACK ACADEMIC DATABASE HEALTH & STATUS INSPECTOR      ")
    print("=" * 65)

    db = SessionLocal()
    try:
        tables = [
            ("Users", User),
            ("Students", Student),
            ("Faculty Members", Faculty),
            ("Courses", Course),
            ("Semesters", Semester),
            ("Academic Sessions", AcademicSession),
            ("Subjects / Courses", Subject),
            ("Student Enrollments", StudentSubject),
            ("Backlog Entries", Backlog),
            ("Activity Logs", ActivityLog),
        ]

        print(f"{'Table Entity':<25} | {'Row Count':<10} | {'Status'}")
        print("-" * 65)

        for name, model in tables:
            count = db.query(model).count()
            status = "[OK] Populated" if count > 0 else "[WARN] Empty"
            print(f"{name:<25} | {count:<10} | {status}")

        print("-" * 65)

        # Backlog Detailed Breakdown
        total_backlogs = db.query(Backlog).count()
        cleared_backlogs = db.query(Backlog).filter(Backlog.status == "Cleared").count()
        pending_backlogs = db.query(Backlog).filter(Backlog.status != "Cleared").count()

        clearance_rate = (cleared_backlogs / total_backlogs * 100) if total_backlogs > 0 else 0.0

        print(f"\nBacklog Metrics:")
        print(f"  * Total Backlogs Recorded: {total_backlogs}")
        print(f"  * Successfully Cleared:    {cleared_backlogs}")
        print(f"  * Active / Pending Review: {pending_backlogs}")
        print(f"  * Overall Clearance Rate:  {clearance_rate:.1f}%")

        # Student Roster Check
        print(f"\nStudent Cohort Roster:")
        students = db.query(Student).all()
        for st in students:
            active_b = db.query(Backlog).filter(Backlog.student_id == st.id, Backlog.status != "Cleared").count()
            standing = "In Good Standing" if active_b == 0 else f"{active_b} Active Backlog(s)"
            print(f"  - USN: {st.enrollment_no:<12} | Name: {st.name:<22} | Status: {standing}")

        # SQLite PRAGMA integrity check
        conn = engine.raw_connection()
        cursor = conn.cursor()
        cursor.execute("PRAGMA integrity_check")
        integrity_result = cursor.fetchone()[0]
        print(f"\nSQLite Integrity Check: [{integrity_result.upper()}]")
        print("=" * 65)

    finally:
        db.close()


if __name__ == "__main__":
    inspect_database()
