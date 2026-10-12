"""
Official Backlog Clearance Certificate PDF Generation Service.
Utilizes ReportLab to generate standard university-formatted A4 clearance certificates.
"""

import io
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors


def generate_certificate_pdf(data: Dict[str, Any]) -> io.BytesIO:
    """
    Renders an official Backlog Clearance Certificate as an in-memory PDF stream.
    Formatted to university exam branch guidelines with border, header, metadata and verification stamps.
    """
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Double Border Decoration
    p.setStrokeColor(colors.HexColor("#1e293b"))
    p.setLineWidth(3)
    p.rect(25, 25, width - 50, height - 50)
    
    p.setStrokeColor(colors.HexColor("#94a3b8"))
    p.setLineWidth(1)
    p.rect(32, 32, width - 64, height - 64)

    # University Header Title
    p.setFillColor(colors.HexColor("#0f172a"))
    p.setFont("Helvetica-Bold", 22)
    p.drawCentredString(width / 2, height - 80, "BACKTRACK UNIVERSITY")

    p.setFont("Helvetica", 10)
    p.setFillColor(colors.HexColor("#64748b"))
    p.drawCentredString(width / 2, height - 98, "OFFICE OF THE CONTROLLER OF EXAMINATIONS • ACADEMIC AUDIT CELL")

    p.setStrokeColor(colors.HexColor("#cbd5e1"))
    p.setLineWidth(1)
    p.line(60, height - 115, width - 60, height - 115)

    # Document Name
    p.setFont("Helvetica-Bold", 16)
    p.setFillColor(colors.HexColor("#166534")) # Emerald theme
    p.drawCentredString(width / 2, height - 150, "OFFICIAL BACKLOG CLEARANCE CERTIFICATE")

    # Body Narrative
    p.setFont("Helvetica", 11)
    p.setFillColor(colors.HexColor("#334155"))
    p.drawCentredString(width / 2, height - 180, "This is to certify that the candidate named below has successfully satisfied")
    p.drawCentredString(width / 2, height - 196, "all academic remediation, faculty guidance, and repeat examination criteria:")

    # Structured Candidate & Subject Data Grid
    start_y = height - 240
    line_gap = 26

    meta_fields = [
        ("Student Full Name:", str(data.get("student_name", "N/A"))),
        ("University Seat No (USN):", str(data.get("usn", "N/A"))),
        ("Academic Program:", str(data.get("program", "Bachelor of Computer Applications (BCA)"))),
        ("Course Subject Code:", str(data.get("subject_code", "N/A"))),
        ("Subject Title:", str(data.get("subject_name", "N/A"))),
        ("Semester Curriculum:", str(data.get("semester", "N/A"))),
        ("Faculty In-Charge:", str(data.get("faculty_mentor", "Dr. Ramesh Sharma"))),
        ("Issue Timestamp:", str(data.get("issue_date", "N/A"))),
        ("Verification Certificate ID:", str(data.get("certificate_id", "N/A"))),
        ("Cryptographic Hash:", str(data.get("verification_hash", "N/A")))
    ]

    for label, val in meta_fields:
        p.setFont("Helvetica-Bold", 10)
        p.setFillColor(colors.HexColor("#475569"))
        p.drawString(90, start_y, label)
        
        p.setFont("Helvetica", 10)
        p.setFillColor(colors.HexColor("#0f172a"))
        p.drawString(280, start_y, val)
        start_y -= line_gap

    # Official Signatures & Seal Area
    sig_y = 100
    p.setStrokeColor(colors.HexColor("#cbd5e1"))
    p.setLineWidth(1)
    p.line(80, sig_y + 35, 230, sig_y + 35)
    p.line(width - 230, sig_y + 35, width - 80, sig_y + 35)

    p.setFont("Helvetica-Bold", 10)
    p.setFillColor(colors.HexColor("#1e293b"))
    p.drawCentredString(155, sig_y + 20, "Subject Faculty Mentor")
    p.drawCentredString(width - 155, sig_y + 20, "Controller of Examinations")

    p.setFont("Helvetica", 8)
    p.setFillColor(colors.HexColor("#64748b"))
    p.drawCentredString(155, sig_y + 8, "Department of Computer Applications")
    p.drawCentredString(width - 155, sig_y + 8, "BackTrack Academic Audit Cell")

    # Footer Notice
    p.setFont("Helvetica", 8)
    p.setFillColor(colors.HexColor("#94a3b8"))
    p.drawCentredString(width / 2, 45, "Verified electronic document generated via BackTrack University Portal. Valid without physical stamp.")

    p.showPage()
    p.save()
    buffer.seek(0)
    return buffer
