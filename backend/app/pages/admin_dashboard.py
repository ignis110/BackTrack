import streamlit as st
import pandas as pd
import plotly.express as px
from app.models.database import SessionLocal
from app.models.schema import User, Student, Faculty, Subject, Course, Semester, Backlog, Notification, ActivityLog
from app.utils.auth import hash_password
from app.utils.helpers import log_activity

def show():
    with st.sidebar:
        st.write(f"**🛡️ {st.session_state['username']}**")
        st.write("Admin Portal")
        st.divider()
        page = st.radio("Navigation", [
            "🏠 Home", "👨‍🎓 Students", "👨‍🏫 Faculty", "📚 Subjects", "🏫 Courses & Semesters", 
            "⚠️ Backlogs", "🔔 Notifications", "📊 Reports & Analytics", "⚙️ Settings", "🚪 Logout"
        ])

    db = SessionLocal()
    user_id = st.session_state['user_id']
    admin_user = db.query(User).filter(User.id == user_id).first()
    
    if page == "🚪 Logout":
        log_activity(db, user_id, "Logout", "Admin logged out.")
        db.close()
        st.session_state.clear()
        st.rerun()

    if page == "🏠 Home":
        show_home(db)
    elif page == "👨‍🎓 Students":
        show_students(db)
    elif page == "👨‍🏫 Faculty":
        show_faculty(db)
    elif page == "📚 Subjects":
        show_subjects(db)
    elif page == "🏫 Courses & Semesters":
        show_courses_semesters(db)
    elif page == "⚠️ Backlogs":
        show_backlogs(db)
    elif page == "🔔 Notifications":
        show_notifications(db, user_id)
    elif page == "📊 Reports & Analytics":
        show_reports(db)
    elif page == "⚙️ Settings":
        show_settings(db, admin_user)

    db.close()

def show_home(db):
    st.title("📊 Admin Dashboard")
    st.write("### Platform Overview")
    
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Total Students", db.query(Student).count())
    c2.metric("Total Faculty", db.query(Faculty).count())
    c3.metric("Total Subjects", db.query(Subject).count())
    c4.metric("Total Backlogs", db.query(Backlog).count())
    
    st.divider()
    st.write("### Recent System Activity")
    logs = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(15).all()
    for log in logs:
        st.write(f"> **{log.created_at.strftime('%Y-%m-%d %H:%M')}** - *{log.user.username}* ({log.user.role}): {log.action} - {log.details}")

def show_students(db):
    st.title("👨‍🎓 Manage Students")
    students = db.query(Student).all()
    if students:
        df = pd.DataFrame([{"Enrollment": s.enrollment_no, "Name": s.name, "Course": s.course.name if s.course else "", "Sem": s.semester_rel.number if s.semester_rel else ""} for s in students])
        st.dataframe(df, use_container_width=True)

def show_faculty(db):
    st.title("👨‍🏫 Manage Faculty")
    facs = db.query(Faculty).all()
    if facs:
        df = pd.DataFrame([{"ID": f.employee_id, "Name": f.name, "Department": f.department} for f in facs])
        st.dataframe(df, use_container_width=True)

def show_subjects(db):
    st.title("📚 Manage Subjects")
    
    with st.expander("Assign Teacher to Subject"):
        with st.form("assign_teacher"):
            subs = db.query(Subject).all()
            facs = db.query(Faculty).all()
            
            sub_dict = {s.name: s for s in subs}
            fac_dict = {f.name: f for f in facs}
            
            sel_sub = st.selectbox("Subject", list(sub_dict.keys()))
            sel_fac = st.selectbox("Assign Faculty", list(fac_dict.keys()))
            
            if st.form_submit_button("Assign"):
                sub_dict[sel_sub].faculty_id = fac_dict[sel_fac].id
                log_activity(db, st.session_state['user_id'], "Subject Assigned", f"Assigned {sel_fac} to {sel_sub}")
                db.commit()
                st.success("Assigned successfully!")
                st.rerun()

    st.write("### Subject List")
    if subs:
        df = pd.DataFrame([{"Code": s.code, "Name": s.name, "Teacher": s.faculty.name if s.faculty else "None"} for s in subs])
        st.table(df)

def show_courses_semesters(db):
    st.title("🏫 Courses & Semesters")
    c1, c2 = st.columns(2)
    with c1:
        st.write("#### Courses")
        courses = db.query(Course).all()
        for c in courses: st.write(f"- {c.code}: {c.name}")
    with c2:
        st.write("#### Semesters")
        sems = db.query(Semester).order_by(Semester.number).all()
        for s in sems: st.write(f"- {s.name}")

def show_backlogs(db):
    st.title("⚠️ System Backlogs")
    bls = db.query(Backlog).all()
    if bls:
        df = pd.DataFrame([{"Student": b.student.name, "Subject": b.subject.code, "Status": b.status} for b in bls])
        st.dataframe(df, use_container_width=True)

def show_notifications(db, user_id):
    st.title("🔔 Notifications")
    notifs = db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()
    for n in notifs:
        st.write(f"- **{n.title}**: {n.message}")

def show_reports(db):
    st.title("📊 Analytics")
    bls = db.query(Backlog).all()
    if bls:
        df = pd.DataFrame([{"Status": b.status} for b in bls])
        counts = df['Status'].value_counts().reset_index()
        counts.columns = ['Status', 'Count']
        st.plotly_chart(px.bar(counts, x='Status', y='Count', title="Overall Backlog Statuses", color='Status'), use_container_width=True)

def show_settings(db, admin_user):
    st.title("⚙️ Settings")
    st.write("Admin details")
    st.write(f"Email: {admin_user.email}")
