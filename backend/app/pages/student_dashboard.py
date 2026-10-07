import streamlit as st
import pandas as pd
import plotly.express as px
import os
from datetime import datetime
from app.models.database import SessionLocal
from app.models.schema import Student, Backlog, Document, Subject, ActivityLog, Notification, StudentSubject
from app.utils.helpers import log_activity, get_risk_level

def show():
    # Render Student Sidebar
    with st.sidebar:
        st.write(f"**👨‍🎓 {st.session_state['username']}**")
        st.write("Student Portal")
        st.divider()
        page = st.radio("Navigation", ["🏠 Home", "📚 My Subjects", "⚠️ My Backlogs", "📄 Documents", "🔔 Notifications", "📈 Academic Progress", "⚙️ Settings", "🚪 Logout"])

    db = SessionLocal()
    user_id = st.session_state['user_id']
    student = db.query(Student).filter(Student.user_id == user_id).first()
    
    if page == "🚪 Logout":
        log_activity(db, user_id, "Logout", "User logged out successfully.")
        db.close()
        st.session_state.clear()
        st.rerun()

    if not student:
        st.error("Student profile not found.")
        db.close()
        return

    if page == "🏠 Home":
        show_home(db, student)
    elif page == "📚 My Subjects":
        show_subjects(db, student)
    elif page == "⚠️ My Backlogs":
        show_backlogs(db, student)
    elif page == "📄 Documents":
        show_documents(db, student)
    elif page == "🔔 Notifications":
        show_notifications(db, user_id)
    elif page == "📈 Academic Progress":
        show_progress(db, student)
    elif page == "⚙️ Settings":
        show_settings(db, student)
        
    db.close()

def show_home(db, student):
    st.title("📊 Dashboard")
    
    backlogs = db.query(Backlog).filter(Backlog.student_id == student.id).all()
    enrolled = db.query(StudentSubject).filter(StudentSubject.student_id == student.id).all()
    
    total_subjects = len(enrolled)
    total_backlogs = len(backlogs)
    cleared = sum(1 for b in backlogs if b.status == "Cleared")
    pending = total_backlogs - cleared
    
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Total Subjects", total_subjects)
    c2.metric("Total Backlogs", total_backlogs)
    c3.metric("Pending", pending)
    c4.metric("Cleared", cleared)
    
    st.divider()
    st.subheader("Recent Activity")
    activities = db.query(ActivityLog).filter(ActivityLog.user_id == student.user_id).order_by(ActivityLog.created_at.desc()).limit(10).all()
    if not activities:
        st.info("No recent activity.")
    else:
        for act in activities:
            time_str = act.created_at.strftime("%I:%M %p, %b %d")
            st.markdown(f"> **{time_str}** - {act.action}: {act.details}")

def show_subjects(db, student):
    st.title("📚 My Subjects")
    
    enrolled = db.query(StudentSubject).filter(StudentSubject.student_id == student.id).all()
    
    data = []
    for en in enrolled:
        sub = en.subject
        teacher = sub.faculty.name if sub.faculty else "Unassigned"
        email = sub.faculty.user.email if sub.faculty and sub.faculty.user else "N/A"
        
        data.append({
            "Subject": sub.name,
            "Code": sub.code,
            "Semester": sub.semester_rel.number if sub.semester_rel else "N/A",
            "Teacher": teacher,
            "Contact": email,
            "Status": en.status,
            "Credits": sub.credits
        })
        
    if data:
        st.table(pd.DataFrame(data))
    else:
        st.info("You are not enrolled in any subjects.")

def show_backlogs(db, student):
    st.title("⚠️ My Backlogs")
    
    tab1, tab2 = st.tabs(["Active Backlogs", "Apply for Backlog"])
    
    with tab1:
        backlogs = db.query(Backlog).filter(Backlog.student_id == student.id).all()
        if backlogs:
            for b in backlogs:
                sub = b.subject
                with st.expander(f"{sub.name} ({sub.code}) - Status: {b.status}"):
                    st.write(f"**Attempt:** {b.attempt_number} | **Exam Date:** {b.exam_date if b.exam_date else 'TBA'}")
                    # Show Remarks
                    for r in b.remarks:
                        st.markdown(f"💬 _{r.faculty.name}:_ {r.comment}")
        else:
            st.success("You have no backlog records!")
            
    with tab2:
        with st.form("apply_backlog"):
            enrolled = db.query(StudentSubject).filter(StudentSubject.student_id == student.id).all()
            opts = {f"{en.subject.code} - {en.subject.name}": en.subject.id for en in enrolled}
            
            sel = st.selectbox("Select Subject", list(opts.keys()) if opts else ["None"])
            attempt = st.number_input("Attempt Number", min_value=1)
            file = st.file_uploader("Upload Document (PDF)")
            
            if st.form_submit_button("Submit Application") and opts:
                b = Backlog(student_id=student.id, subject_id=opts[sel], attempt_number=attempt)
                db.add(b)
                db.flush()
                
                if file:
                    os.makedirs("uploads", exist_ok=True)
                    path = f"uploads/{file.name}"
                    with open(path, "wb") as f:
                        f.write(file.getbuffer())
                    doc = Document(backlog_id=b.id, filename=file.name, filepath=path)
                    db.add(doc)
                
                log_activity(db, student.user_id, "Backlog Applied", f"Applied for backlog exam in {sel}")
                db.commit()
                st.success("Applied successfully!")

def show_documents(db, student):
    st.title("📄 Documents")
    backlogs = db.query(Backlog).filter(Backlog.student_id == student.id).all()
    b_ids = [b.id for b in backlogs]
    docs = db.query(Document).filter(Document.backlog_id.in_(b_ids)).all() if b_ids else []
    
    if docs:
        for d in docs:
            st.write(f"📁 {d.filename} (Uploaded on {d.uploaded_at.strftime('%Y-%m-%d')}) for {d.backlog.subject.name}")
    else:
        st.info("No documents uploaded yet.")

def show_notifications(db, user_id):
    st.title("🔔 Notifications")
    if st.button("Mark all as read"):
        db.query(Notification).filter(Notification.user_id == user_id).update({"is_read": True})
        db.commit()
        st.success("All caught up!")
        st.rerun()
        
    notifs = db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()
    for n in notifs:
        icon = "⚪" if n.is_read else "🟢"
        st.markdown(f"{icon} **{n.title}** - {n.message} *(from {n.sender})*")
        if not n.is_read:
            n.is_read = True
    db.commit()

def show_progress(db, student):
    st.title("📈 Academic Progress")
    backlogs = db.query(Backlog).filter(Backlog.student_id == student.id).all()
    if backlogs:
        df = pd.DataFrame([{"Status": b.status} for b in backlogs])
        st.plotly_chart(px.pie(df, names='Status', title="Backlog Status Distribution"), use_container_width=True)
    else:
        st.info("No data available.")

def show_settings(db, student):
    st.title("⚙️ Settings")
    st.write("Account Settings")
    with st.form("settings"):
        name = st.text_input("Name", student.name)
        email = st.text_input("Email", student.user.email if student.user.email else "")
        if st.form_submit_button("Save Changes"):
            student.name = name
            student.user.email = email
            db.commit()
            st.success("Saved!")
