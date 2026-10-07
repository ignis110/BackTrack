import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.models.database import engine, Base, SessionLocal
from app.models.schema import User, Student, Faculty, Subject, Course, Semester, AcademicSession, StudentSubject, ActivityLog
from app.utils.auth import hash_password
from datetime import datetime

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if admin exists
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        admin_user = User(username="admin", password_hash=hash_password("admin123"), role="admin", email="admin@univ.edu")
        db.add(admin_user)
        db.commit()

    # Add Courses and Semesters
    if db.query(Course).count() == 0:
        c1 = Course(name="Bachelor of Computer Applications", code="BCA")
        db.add(c1)
        db.commit()

    if db.query(Semester).count() == 0:
        sems = [Semester(number=i, name=f"Semester {i}") for i in range(1, 9)]
        db.add_all(sems)
        db.commit()
        
    if db.query(AcademicSession).count() == 0:
        sess = AcademicSession(name="2023-2024", is_active=True)
        db.add(sess)
        db.commit()
    
    # Add faculty
    if db.query(Faculty).count() == 0:
        fac_user = User(username="faculty1", password_hash=hash_password("fac123"), role="faculty", email="sharma@univ.edu")
        db.add(fac_user)
        db.commit()
        
        faculty = Faculty(user_id=fac_user.id, employee_id="F1001", name="Dr. Sharma", department="Computer Science")
        db.add(faculty)
        db.commit()
        
    # Add subjects
    if db.query(Subject).count() == 0:
        course = db.query(Course).first()
        sem3 = db.query(Semester).filter(Semester.number == 3).first()
        faculty = db.query(Faculty).first()
        
        subjects = [
            Subject(code="BCA301", name="Database Management Systems", credits=4, course_id=course.id, semester_id=sem3.id, faculty_id=faculty.id),
            Subject(code="BCA302", name="Operating Systems", credits=4, course_id=course.id, semester_id=sem3.id, faculty_id=faculty.id),
            Subject(code="BCA303", name="Python Programming", credits=3, course_id=course.id, semester_id=sem3.id, faculty_id=faculty.id)
        ]
        db.add_all(subjects)
        db.commit()
        
    # Add students
    if db.query(Student).count() == 0:
        stu_user = User(username="student1", password_hash=hash_password("stu123"), role="student", email="rahul@univ.edu")
        db.add(stu_user)
        db.commit()
        
        course = db.query(Course).first()
        sem5 = db.query(Semester).filter(Semester.number == 5).first()
        
        student = Student(user_id=stu_user.id, enrollment_no="23BCA101", name="Rahul Sharma", course_id=course.id, semester_id=sem5.id)
        db.add(student)
        db.commit()
        
        # Add StudentSubjects
        subjects = db.query(Subject).all()
        db.add(StudentSubject(student_id=student.id, subject_id=subjects[0].id, status="Backlog")) # DBMS
        db.add(StudentSubject(student_id=student.id, subject_id=subjects[1].id, status="Passed"))  # OS
        db.add(StudentSubject(student_id=student.id, subject_id=subjects[2].id, status="Passed"))  # Python
        db.commit()
        
        # Add Activity log for account creation
        log = ActivityLog(user_id=stu_user.id, action="Account Created", details="Student account provisioned.")
        db.add(log)
        db.commit()

    db.close()
    print("Database initialized with sample data.")

if __name__ == "__main__":
    init_db()
