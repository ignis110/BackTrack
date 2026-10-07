import streamlit as st
import pandas as pd
from app.models.database import SessionLocal
from app.models.schema import Faculty, Student, Backlog, Subject, Remark, ActivityLog, Notification, StudentSubject
from app.utils.helpers import log_activity, add_notification
from app.utils.pdf_generator import generate_backlog_report

def show():
    with st.sidebar:
        st.write(f"**👨‍🏫 {st.session_state['username']}**")
        st.write("Faculty Portal")
        st.divider()
        page = st.radio("Navigation", ["🏠 Home", "👨‍🎓 Students", "📚 Subjects", "⚠️ Backlogs", "🔔 Notifications", "📊 Reports", "⚙️ Settings", "🚪 Logout"])

    db = SessionLocal()
    user_id = st.session_state['user_id']
    faculty = db.query(Faculty).filter(Faculty.user_id == user_id).first()
    
    if page == "🚪 Logout":
        log_activity(db, user_id, "Logout", "Faculty logged out.")
        db.close()
        st.session_state.clear()
        st.rerun()

    if not faculty:
        st.error("Faculty profile not found.")
        db.close()
        return

    if page == "🏠 Home":
        show_home(db, faculty)
    elif page == "👨‍🎓 Students":
        show_students(db, faculty)
    elif page == "📚 Subjects":
        show_subjects(db, faculty)
    elif page == "⚠️ Backlogs":
        show_backlogs(db, faculty)
    elif page == "🔔 Notifications":
        show_notifications(db, user_id)
    elif page == "📊 Reports":
        show_reports(db, faculty)
    elif page == "⚙️ Settings":
        show_settings(db, faculty)
        
    db.close()

def show_home(db, faculty):
    st.title("📊 Faculty Dashboard")
    
    subjects = db.query(Subject).filter(Subject.faculty_id == faculty.id).all()
    sub_ids = [s.id for s in subjects]
    backlogs = db.query(Backlog).filter(Backlog.subject_id.in_(sub_ids)).all() if sub_ids else []
    
    st.write(f"Welcome back, **{faculty.name}**.")
    
    c1, c2, c3 = st.columns(3)
    c1.metric("My Subjects", len(subjects))
    c2.metric("Total Backlog Applications", len(backlogs))
    c3.metric("Pending Verifications", sum(1 for b in backlogs if b.status == "Pending Verification"))
    
    st.divider()
    st.subheader("Recent Actions")
    activities = db.query(ActivityLog).filter(ActivityLog.user_id == faculty.user_id).order_by(ActivityLog.created_at.desc()).limit(10).all()
    if not activities:
        st.info("No recent actions.")
    for act in activities:
        st.write(f"> **{act.created_at.strftime('%Y-%m-%d %H:%M')}** - {act.action}: {act.details}")

def show_students(db, faculty):
    st.title("👨‍🎓 Student Viewer")
    
    # Get all students enrolled in faculty's subjects
    subjects = db.query(Subject).filter(Subject.faculty_id == faculty.id).all()
    sub_ids = [s.id for s in subjects]
    enrolled = db.query(StudentSubject).filter(StudentSubject.subject_id.in_(sub_ids)).all() if sub_ids else []
    student_ids = list(set([e.student_id for e in enrolled]))
    students = db.query(Student).filter(Student.id.in_(student_ids)).all() if student_ids else []
    
    search = st.text_input("Search student by name or enrollment no:")
    if search:
        students = [s for s in students if search.lower() in s.name.lower() or search.lower() in s.enrollment_no.lower()]
        
    if not students:
        st.info("No students found.")
        return
        
    sel_student = st.selectbox("Select Student Profile to View", [f"{s.enrollment_no} - {s.name}" for s in students])
    if sel_student:
        enr = sel_student.split(" - ")[0]
        stu = next((s for s in students if s.enrollment_no == enr), None)
        
        st.write(f"### Profile: {stu.name}")
        st.write(f"**Course:** {stu.course.name if stu.course else 'N/A'} | **Sem:** {stu.semester_rel.number if stu.semester_rel else 'N/A'}")
        
        stu_bls = db.query(Backlog).filter(Backlog.student_id == stu.id).all()
        st.write(f"**Total Backlogs:** {len(stu_bls)} | **Cleared:** {sum(1 for b in stu_bls if b.status == 'Cleared')}")
        
        st.write("#### Subject Records")
        stu_subjects = db.query(StudentSubject).filter(StudentSubject.student_id == stu.id).all()
        data = []
        for ss in stu_subjects:
            data.append({"Subject": ss.subject.name, "Status": ss.status})
        st.table(pd.DataFrame(data))

def show_subjects(db, faculty):
    st.title("📚 My Assigned Subjects")
    subjects = db.query(Subject).filter(Subject.faculty_id == faculty.id).all()
    if not subjects:
        st.info("You have no subjects assigned.")
    else:
        for s in subjects:
            st.write(f"**{s.name} ({s.code})** - Semester {s.semester_rel.number if s.semester_rel else 'N/A'} - {s.credits} Credits")

def show_backlogs(db, faculty):
    st.title("⚠️ Backlog Management")
    subjects = db.query(Subject).filter(Subject.faculty_id == faculty.id).all()
    sub_ids = [s.id for s in subjects]
    backlogs = db.query(Backlog).filter(Backlog.subject_id.in_(sub_ids)).all() if sub_ids else []
    
    if not backlogs:
        st.success("No backlog applications to manage.")
        return
        
    for b in backlogs:
        with st.expander(f"{b.student.name} - {b.subject.name} | Status: {b.status}"):
            st.write(f"**Attempt:** {b.attempt_number} | **Applied:** {b.created_at.strftime('%Y-%m-%d')}")
            
            new_status = st.selectbox("Update Status", 
                ["Pending Verification", "Verified", "Application Submitted", "Exam Scheduled", "Result Pending", "Cleared", "Not Cleared"],
                index=["Pending Verification", "Verified", "Application Submitted", "Exam Scheduled", "Result Pending", "Cleared", "Not Cleared"].index(b.status),
                key=f"stat_{b.id}")
            
            remark = st.text_input("Add Remark", key=f"rem_{b.id}")
            
            if st.button("Save Update", key=f"btn_{b.id}"):
                b.status = new_status
                if remark:
                    db.add(Remark(backlog_id=b.id, faculty_id=faculty.id, comment=remark))
                log_activity(db, faculty.user_id, "Backlog Updated", f"Updated backlog for {b.student.name} to {new_status}")
                add_notification(db, b.student.user_id, f"Your {b.subject.name} backlog status is now: {new_status}", title="Backlog Update", sender=faculty.name)
                db.commit()
                st.success("Updated!")
                st.rerun()

def show_notifications(db, user_id):
    st.title("🔔 Notifications")
    notifs = db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()
    if st.button("Mark all read"):
        for n in notifs: n.is_read = True
        db.commit()
        st.rerun()
    for n in notifs:
        icon = "⚪" if n.is_read else "🟢"
        st.write(f"{icon} **{n.title}** - {n.message}")
        if not n.is_read: n.is_read = True
    db.commit()

def show_reports(db, faculty):
    st.title("📊 Reports")
    if st.button("Generate Backlog PDF Report"):
        subjects = db.query(Subject).filter(Subject.faculty_id == faculty.id).all()
        sub_ids = [s.id for s in subjects]
        backlogs = db.query(Backlog).filter(Backlog.subject_id.in_(sub_ids)).all() if sub_ids else []
        
        data = [{"Student": b.student.name, "Subject": b.subject.code, "Status": b.status} for b in backlogs]
        if data:
            pdf = generate_backlog_report(pd.DataFrame(data), f"Backlog Report - {faculty.name}")
            st.download_button("Download PDF", data=pdf, file_name="report.pdf")
        else:
            st.warning("No data.")

def show_settings(db, faculty):
    st.title("⚙️ Settings")
    with st.form("fac_set"):
        name = st.text_input("Name", faculty.name)
        email = st.text_input("Email", faculty.user.email if faculty.user.email else "")
        if st.form_submit_button("Save"):
            faculty.name = name
            faculty.user.email = email
            db.commit()
            st.success("Saved.")
