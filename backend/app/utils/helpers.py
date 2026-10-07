import streamlit as st
from app.models.database import SessionLocal
from app.models.schema import Notification, ActivityLog

def add_notification(db, user_id, message, title="Update", notif_type="General", sender="System"):
    notif = Notification(user_id=user_id, title=title, message=message, notification_type=notif_type, sender=sender)
    db.add(notif)
    db.commit()

def log_activity(db, user_id, action, details=""):
    log = ActivityLog(user_id=user_id, action=action, details=details)
    db.add(log)
    db.commit()

def get_risk_level(attempt_number, status):
    if status in ["Cleared", "Passed"]:
        return "Low"
    if attempt_number >= 3:
        return "High"
    elif attempt_number == 2:
        return "Medium"
    return "Low"
