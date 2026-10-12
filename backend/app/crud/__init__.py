"""
Database Access Object (CRUD) Package.
Exports modular database access routines across all core domain entities.
"""

from .crud_user import (
    get_user_by_id,
    get_user_by_username,
    get_user_by_email,
    authenticate_user,
    create_user,
    update_user_password,
    list_users,
)
from .crud_student import (
    get_student_by_id,
    get_student_by_usn,
    get_student_by_user_id,
    list_students,
    get_student_academic_summary,
    get_enrolled_subjects_for_student,
)
from .crud_backlog import (
    get_backlog_by_id,
    list_backlogs,
    create_backlog_entry,
    update_backlog_progress,
    confirm_backlog_clearance,
    compute_funnel_statistics,
)
from .crud_faculty import (
    get_faculty_by_id,
    get_faculty_by_user_id,
    get_faculty_by_employee_id,
    list_faculty_members,
    get_faculty_dashboard_stats,
)

__all__ = [
    "get_user_by_id",
    "get_user_by_username",
    "get_user_by_email",
    "authenticate_user",
    "create_user",
    "update_user_password",
    "list_users",
    "get_student_by_id",
    "get_student_by_usn",
    "get_student_by_user_id",
    "list_students",
    "get_student_academic_summary",
    "get_enrolled_subjects_for_student",
    "get_backlog_by_id",
    "list_backlogs",
    "create_backlog_entry",
    "update_backlog_progress",
    "confirm_backlog_clearance",
    "compute_funnel_statistics",
    "get_faculty_by_id",
    "get_faculty_by_user_id",
    "get_faculty_by_employee_id",
    "list_faculty_members",
    "get_faculty_dashboard_stats",
]
