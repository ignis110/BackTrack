"""
BackTrack Automated Notification and Alert Dispatch Service.
Coordinates student alerts, faculty advisories, exam controller broadcasts,
and official email templates for academic milestones.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.schema import Notification, ActivityLog, User, Student, Faculty


class NotificationService:
    """Manages transactional notifications and email dispatch previews."""

    @staticmethod
    def create_notification(db: Session, user_id: int, title: str, message: str) -> Notification:
        """Stores a notification message in the user's portal inbox."""
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            created_at=datetime.utcnow()
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return notif

    @staticmethod
    def get_user_notifications(db: Session, user_id: int, unread_only: bool = False) -> List[Notification]:
        """Fetches notifications ordered by most recent."""
        query = db.query(Notification).filter(Notification.user_id == user_id)
        if unread_only:
            query = query.filter(Notification.is_read == False)
        return query.order_by(Notification.created_at.desc()).all()

    @staticmethod
    def dispatch_backlog_registered_alert(db: Session, student: Student, subject_code: str, subject_name: str):
        """Sends confirmation when a student registers a backlog paper."""
        title = f"Backlog Registration Logged: {subject_code}"
        msg = (
            f"Dear {student.name}, your backlog examination file for {subject_name} ({subject_code}) "
            f"has been submitted to the Exam Office. Please review your remediation checklist."
        )
        return NotificationService.create_notification(db, student.user_id, title, msg)

    @staticmethod
    def dispatch_clearance_approved_alert(db: Session, student: Student, subject_code: str):
        """Sends congratulatory alert when a backlog is officially marked Cleared."""
        title = f"Clearance Approved: {subject_code}"
        msg = (
            f"Congratulations {student.name}! Your clearance for course {subject_code} has been ratified. "
            f"You may now generate and download your verified Digital Clearance Certificate."
        )
        return NotificationService.create_notification(db, student.user_id, title, msg)

    @staticmethod
    def generate_email_template(
        notification_type: str,
        recipient_name: str,
        details: Dict[str, Any]
    ) -> Dict[str, str]:
        """
        Generates formatted HTML & Plain Text email representations for university communications.
        """
        if notification_type == "remedial_schedule":
            subject = "Academic Remedial Coaching Schedule - BackTrack"
            body = (
                f"Dear {recipient_name},\n\n"
                f"You have been scheduled for remedial academic sessions in {details.get('subject_name', 'your subject')}.\n"
                f"Faculty In-Charge: {details.get('faculty_name', 'Department Mentor')}\n"
                f"Venue: {details.get('venue', 'Lecture Hall 302')}\n"
                f"Schedule: {details.get('time', 'Every Tuesday & Thursday 4:00 PM - 5:30 PM')}\n\n"
                f"Minimum 75% attendance is required to sit for the supplementary examination.\n\n"
                f"Warm regards,\nOffice of Academic Affairs"
            )
        elif notification_type == "detention_warning":
            subject = "URGENT: Academic Detention Warning"
            body = (
                f"Dear {recipient_name} (USN: {details.get('usn', 'N/A')}),\n\n"
                f"Our academic audit indicates that you currently hold {details.get('backlog_count', 0)} active backlogs.\n"
                f"Under University Regulation Section 7.2, exceeding {details.get('max_allowed', 4)} backlogs "
                f"will lead to academic detention (Year Back).\n\n"
                f"Please report to your Faculty Advisor immediately.\n\n"
                f"Controller of Examinations"
            )
        else:
            subject = "BackTrack Academic Update"
            body = f"Dear {recipient_name},\n\nYou have a new update in your BackTrack academic portal."

        return {
            "subject": subject,
            "body": body,
            "recipient": recipient_name
        }
