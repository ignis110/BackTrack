from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False) # 'student', 'faculty', 'admin'
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    profile_pic = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    student = relationship("Student", back_populates="user", uselist=False)
    faculty = relationship("Faculty", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")
    activity_logs = relationship("ActivityLog", back_populates="user")

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False)
    
    students = relationship("Student", back_populates="course")
    subjects = relationship("Subject", back_populates="course")

class Semester(Base):
    __tablename__ = "semesters"
    id = Column(Integer, primary_key=True, index=True)
    number = Column(Integer, nullable=False)
    name = Column(String, nullable=False)
    
    students = relationship("Student", back_populates="semester_rel")
    subjects = relationship("Subject", back_populates="semester_rel")

class AcademicSession(Base):
    __tablename__ = "academic_sessions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    is_active = Column(Boolean, default=False)

class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    enrollment_no = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    semester_id = Column(Integer, ForeignKey("semesters.id"), nullable=True)
    
    user = relationship("User", back_populates="student")
    course = relationship("Course", back_populates="students")
    semester_rel = relationship("Semester", back_populates="students")
    backlogs = relationship("Backlog", back_populates="student")
    enrolled_subjects = relationship("StudentSubject", back_populates="student")

class Faculty(Base):
    __tablename__ = "faculty"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    employee_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    
    user = relationship("User", back_populates="faculty")
    subjects = relationship("Subject", back_populates="faculty")

class Subject(Base):
    __tablename__ = "subjects"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    credits = Column(Integer, nullable=False)
    
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    semester_id = Column(Integer, ForeignKey("semesters.id"), nullable=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=True)
    
    course = relationship("Course", back_populates="subjects")
    semester_rel = relationship("Semester", back_populates="subjects")
    faculty = relationship("Faculty", back_populates="subjects")
    
    backlogs = relationship("Backlog", back_populates="subject")
    enrolled_students = relationship("StudentSubject", back_populates="subject")

class StudentSubject(Base):
    __tablename__ = "student_subjects"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    status = Column(String, default="Passed") # Passed, Failed, Backlog, Cleared
    
    student = relationship("Student", back_populates="enrolled_subjects")
    subject = relationship("Subject", back_populates="enrolled_students")

class Backlog(Base):
    __tablename__ = "backlogs"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    session_id = Column(Integer, ForeignKey("academic_sessions.id"), nullable=True)
    attempt_number = Column(Integer, default=1)
    status = Column(String, default="Pending Verification") 
    exam_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    student = relationship("Student", back_populates="backlogs")
    subject = relationship("Subject", back_populates="backlogs")
    session = relationship("AcademicSession")
    documents = relationship("Document", back_populates="backlog")
    remarks = relationship("Remark", back_populates="backlog")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    backlog_id = Column(Integer, ForeignKey("backlogs.id"))
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    backlog = relationship("Backlog", back_populates="documents")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=True)
    message = Column(Text, nullable=False)
    notification_type = Column(String, default="General")
    sender = Column(String, default="System")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="notifications")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="activity_logs")

class Remark(Base):
    __tablename__ = "remarks"
    
    id = Column(Integer, primary_key=True, index=True)
    backlog_id = Column(Integer, ForeignKey("backlogs.id"))
    faculty_id = Column(Integer, ForeignKey("faculty.id"))
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    backlog = relationship("Backlog", back_populates="remarks")
    faculty = relationship("Faculty")
