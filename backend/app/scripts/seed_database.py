"""
Database Seeding Script for BackTrack.
Initializes courses, semesters, faculty advisors, enrolled students, subjects,
and realistic backlog candidates matching the frontend demonstrations.
"""

import sys
import os
from datetime import datetime

# Add root backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.models.database import engine, Base, SessionLocal
from app.models.schema import User, Student, Faculty, Subject, Course, Semester, AcademicSession, StudentSubject, Backlog, ActivityLog
from app.utils.auth import hash_password


def run_seed():
    """Execute complete database schema population."""
    print("Initializing BackTrack SQLite Database Tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Academic Sessions
        session = db.query(AcademicSession).filter(AcademicSession.name == "2026-2027").first()
        if not session:
            session = AcademicSession(name="2026-2027", is_active=True)
            db.add(session)
            db.commit()
            print("[OK] Academic Session 2026-2027 created.")

        # 2. Courses
        bca_course = db.query(Course).filter(Course.code == "BCA").first()
        if not bca_course:
            bca_course = Course(name="Bachelor of Computer Applications", code="BCA")
            db.add(bca_course)
            db.commit()
            print("[OK] Course BCA created.")

        # 3. Semesters (Sem 1 to Sem 6)
        for i in range(1, 7):
            sem = db.query(Semester).filter(Semester.number == i).first()
            if not sem:
                sem = Semester(number=i, name=f"Semester {i}")
                db.add(sem)
        db.commit()
        print("[OK] Semesters 1-6 configured.")

        # 4. University Administrative Users
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_user = User(
                username="admin",
                password_hash=hash_password("admin123"),
                role="admin",
                email="exam.controller@univ.edu",
                phone="+91 98450 00001"
            )
            db.add(admin_user)
            db.commit()
            print("[OK] Exam Controller Admin user created.")

        # 5. Faculty Staff
        fac_user = db.query(User).filter(User.username == "faculty1").first()
        if not fac_user:
            fac_user = User(
                username="faculty1",
                password_hash=hash_password("fac123"),
                role="faculty",
                email="sharma@univ.edu",
                phone="+91 98450 12890"
            )
            db.add(fac_user)
            db.commit()

        faculty = db.query(Faculty).filter(Faculty.employee_id == "FAC-1001").first()
        if not faculty:
            faculty = Faculty(
                user_id=fac_user.id,
                employee_id="FAC-1001",
                name="Dr. Ramesh Sharma",
                department="Computer Applications"
            )
            db.add(faculty)
            db.commit()
            print("[OK] Faculty member Dr. Ramesh Sharma created.")

        # 6. Core BCA Course Subjects
        sem3 = db.query(Semester).filter(Semester.number == 3).first()
        subjects_data = [
            ("BCA301", "Database Management Systems", 4),
            ("BCA302", "Operating Systems & Architecture", 4),
            ("BCA303", "Python Programming & Data Structures", 3),
            ("BCA304", "Discrete Mathematical Structures", 4),
            ("BCA305", "Computer Networks & Protocols", 4),
            ("BCA306", "Web Technologies & Full Stack Lab", 4),
        ]

        subject_map = {}
        for code, name, credits in subjects_data:
            sub = db.query(Subject).filter(Subject.code == code).first()
            if not sub:
                sub = Subject(
                    code=code,
                    name=name,
                    credits=credits,
                    course_id=bca_course.id,
                    semester_id=sem3.id,
                    faculty_id=faculty.id
                )
                db.add(sub)
                db.commit()
            subject_map[code] = sub
        print(f"[OK] {len(subjects_data)} BCA Semester 3 subjects seeded.")

        # 7. Students (Aarav, Sneha, Vikram, Ananya, Karan)
        student_configs = [
            ("student1", "stu123", "1BT23BCA014", "Aarav Patel", "aarav.p@student.univ.edu"),
            ("student2", "stu123", "1BT23BCA048", "Sneha Deshmukh", "sneha.d@student.univ.edu"),
            ("student3", "stu123", "1BT23BCA089", "Vikram Mehta", "vikram.m@student.univ.edu"),
            ("student4", "stu123", "1BT23BCA003", "Ananya Sharma", "ananya.s@student.univ.edu"),
            ("student5", "stu123", "1BT23BCA055", "Karan Johar", "karan.j@student.univ.edu"),
        ]

        student_objs = []
        for uname, pwd, usn, name, mail in student_configs:
            u = db.query(User).filter(User.username == uname).first()
            if not u:
                u = User(username=uname, password_hash=hash_password(pwd), role="student", email=mail)
                db.add(u)
                db.commit()

            st = db.query(Student).filter(Student.enrollment_no == usn).first()
            if not st:
                st = Student(user_id=u.id, enrollment_no=usn, name=name, course_id=bca_course.id, semester_id=sem3.id)
                db.add(st)
                db.commit()
            student_objs.append(st)
        print(f"[OK] {len(student_objs)} Student cohort accounts verified.")

        # 8. Enroll Students into Subjects & Record Marks
        for st in student_objs:
            for code, sub in subject_map.items():
                existing = db.query(StudentSubject).filter(
                    StudentSubject.student_id == st.id,
                    StudentSubject.subject_id == sub.id
                ).first()
                if not existing:
                    enrollment = StudentSubject(
                        student_id=st.id,
                        subject_id=sub.id,
                        internal_marks=42,
                        external_marks=84,
                        attendance_percentage=90.0
                    )
                    db.add(enrollment)
        db.commit()
        print("[OK] Student subject enrollments and continuous evaluation marks recorded.")

        # 9. Realistic Backlog Records
        sneha = student_objs[1] # Sneha Deshmukh (Discrete Math backlog)
        vikram = student_objs[2] # Vikram Mehta (C programming backlog)

        b_math = subject_map.get("BCA304")
        if b_math:
            ex_b1 = db.query(Backlog).filter(Backlog.student_id == sneha.id, Backlog.subject_id == b_math.id).first()
            if not ex_b1:
                b1 = Backlog(student_id=sneha.id, subject_id=b_math.id, reason="Low Marks in End-Sem (34/100)", status="Pending")
                db.add(b1)

        b_dbms = subject_map.get("BCA301")
        if b_dbms:
            ex_b2 = db.query(Backlog).filter(Backlog.student_id == vikram.id, Backlog.subject_id == b_dbms.id).first()
            if not ex_b2:
                b2 = Backlog(student_id=vikram.id, subject_id=b_dbms.id, reason="Attendance Shortage & Low Marks", status="Cleared", cleared_at=datetime.utcnow())
                db.add(b2)

        db.commit()
        print("[OK] Backlog candidates and resolution records populated.")
        print("\n=== BackTrack Database Seeding Completed Successfully! ===")

    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
