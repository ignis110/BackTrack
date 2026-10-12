"""
BackTrack Extended Student Cohort and Examination History Mock Data.
Provides mock records for multi-semester academic cohorts, continuous evaluations,
remedial counseling sessions, and clearance records for university testing.
"""

from typing import List, Dict, Any

EXTENDED_STUDENT_COHORTS: List[Dict[str, Any]] = [
    {
        "usn": "1BT23BCA001",
        "name": "Aditya Verma",
        "email": "aditya.v@backtrack.edu",
        "course": "BCA",
        "current_semester": 3,
        "cgpa": 8.42,
        "backlogs": []
    },
    {
        "usn": "1BT23BCA002",
        "name": "Bhavya Nair",
        "email": "bhavya.n@backtrack.edu",
        "course": "BCA",
        "current_semester": 3,
        "cgpa": 7.89,
        "backlogs": [
            {
                "subject_code": "BCA201",
                "subject_name": "Object-Oriented Programming with C++",
                "attempt_number": 1,
                "status": "Cleared",
                "reason": "Absent due to medical emergency"
            }
        ]
    },
    {
        "usn": "1BT23BCA003",
        "name": "Ananya Sharma",
        "email": "ananya.s@backtrack.edu",
        "course": "BCA",
        "current_semester": 3,
        "cgpa": 9.15,
        "backlogs": []
    },
    {
        "usn": "1BT23BCA004",
        "name": "Devansh Kulkarni",
        "email": "devansh.k@backtrack.edu",
        "course": "BCA",
        "current_semester": 3,
        "cgpa": 6.75,
        "backlogs": [
            {
                "subject_code": "BCA103",
                "subject_name": "Discrete Mathematics",
                "attempt_number": 2,
                "status": "Pending",
                "reason": "Scored 32/100 in Semester End Exam"
            }
        ]
    },
    {
        "usn": "1BT23BCA005",
        "name": "Ishaan Sen",
        "email": "ishaan.s@backtrack.edu",
        "course": "BCA",
        "current_semester": 3,
        "cgpa": 7.30,
        "backlogs": []
    },
    {
        "usn": "1BT23BCA014",
        "name": "Aarav Patel",
        "email": "aarav.p@backtrack.edu",
        "course": "BCA",
        "current_semester": 3,
        "cgpa": 8.20,
        "backlogs": []
    },
    {
        "usn": "1BT23BCA048",
        "name": "Sneha Deshmukh",
        "email": "sneha.d@backtrack.edu",
        "course": "BCA",
        "current_semester": 3,
        "cgpa": 6.85,
        "backlogs": [
            {
                "subject_code": "BCA304",
                "subject_name": "Discrete Mathematics & Graph Theory",
                "attempt_number": 1,
                "status": "Pending",
                "reason": "Low Marks in End-Sem (34/100)"
            }
        ]
    },
    {
        "usn": "1BT23BCA089",
        "name": "Vikram Mehta",
        "email": "vikram.m@backtrack.edu",
        "course": "BCA",
        "current_semester": 3,
        "cgpa": 7.10,
        "backlogs": [
            {
                "subject_code": "BCA301",
                "subject_name": "Database Management Systems",
                "attempt_number": 1,
                "status": "Cleared",
                "reason": "Attendance Shortage & Low Marks"
            }
        ]
    },
    {
        "usn": "1BT23BCA055",
        "name": "Karan Johar",
        "email": "karan.j@backtrack.edu",
        "course": "BCA",
        "current_semester": 3,
        "cgpa": 8.50,
        "backlogs": []
    },
    {
        "usn": "1BT23BCA060",
        "name": "Pooja Hegde",
        "email": "pooja.h@backtrack.edu",
        "course": "BCA",
        "current_semester": 3,
        "cgpa": 7.40,
        "backlogs": []
    }
]


FACULTY_MENTOR_ROSTER: List[Dict[str, Any]] = [
    {
        "employee_id": "FAC-1001",
        "name": "Dr. Ramesh Sharma",
        "department": "Computer Science & Applications",
        "designation": "Associate Professor & Backlog Mentor",
        "cabin": "Block IV, Room 302",
        "email": "ramesh.sharma@backtrack.edu",
        "assigned_subjects": ["BCA301", "BCA302"],
        "sections": ["Section A", "Section B"]
    },
    {
        "employee_id": "FAC-1002",
        "name": "Prof. Sunita Rao",
        "department": "Mathematical Sciences",
        "designation": "Assistant Professor",
        "cabin": "Block II, Room 108",
        "email": "sunita.rao@backtrack.edu",
        "assigned_subjects": ["BCA103", "BCA304"],
        "sections": ["Section A", "Section C"]
    },
    {
        "employee_id": "FAC-1003",
        "name": "Dr. Arvind Swaminathan",
        "department": "Computer Science & Engineering",
        "designation": "Professor & Academic Dean",
        "cabin": "Main Admin Block, Room 101",
        "email": "dean.academics@backtrack.edu",
        "assigned_subjects": ["BCA401", "BCA501"],
        "sections": ["Section A"]
    }
]
