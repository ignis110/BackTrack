"""
BackTrack Pure-Python Automated Verification & Test Suite.
Tests domain models, business logic, academic rule engines, database CRUD operations,
export utilities, and cryptographic clearance verification without requiring external packages.
"""

import sys
import os
import unittest

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)

from app.models.database import SessionLocal
from app.models.schema import User, Student, Backlog, Subject
from app.services.rule_engine import AcademicRuleEngine, AcademicStanding
from app.services.clearance_service import compute_certificate_hash, format_certificate_payload
from app.services.export_service import ExaminationExportService
from app.services.notification_service import NotificationService
from app.data.curriculum_catalog import get_curriculum_for_semester, get_subject_by_code, get_total_program_credits
from app.utils.auth import hash_password, verify_password
from app.crud.crud_backlog import list_backlogs, compute_funnel_statistics
from app.crud.crud_student import get_student_by_usn, get_enrolled_subjects_for_student
from app.crud.crud_faculty import get_faculty_by_employee_id, get_faculty_dashboard_stats


class TestAcademicRuleEngine(unittest.TestCase):
    """Verifies university policy compliance algorithms."""

    def test_academic_standing_good(self):
        res = AcademicRuleEngine.evaluate_academic_standing(0, 3)
        self.assertEqual(res.standing, AcademicStanding.GOOD_STANDING)
        self.assertTrue(res.is_promoted)
        self.assertFalse(res.remedial_classes_required)

    def test_academic_standing_warning(self):
        res = AcademicRuleEngine.evaluate_academic_standing(2, 3)
        self.assertEqual(res.standing, AcademicStanding.ACADEMIC_WARNING)
        self.assertTrue(res.is_promoted)
        self.assertTrue(res.remedial_classes_required)

    def test_academic_standing_detention(self):
        res = AcademicRuleEngine.evaluate_academic_standing(5, 3)
        self.assertEqual(res.standing, AcademicStanding.DETAINED_YEAR_BACK)
        self.assertFalse(res.is_promoted)

    def test_grace_marks_awarded(self):
        res = AcademicRuleEngine.calculate_grace_marks("BCA304", 38, 40)
        self.assertTrue(res.eligible)
        self.assertEqual(res.grace_marks_awarded, 2)
        self.assertEqual(res.revised_marks, 40)

    def test_grace_marks_ineligible_excess_deficit(self):
        res = AcademicRuleEngine.calculate_grace_marks("BCA304", 34, 40)
        self.assertFalse(res.eligible)

    def test_prerequisites_check(self):
        res = AcademicRuleEngine.verify_prerequisites("BCA401", ["BCA302"])
        self.assertTrue(res.can_enroll)
        res_blocked = AcademicRuleEngine.verify_prerequisites("BCA401", [])
        self.assertFalse(res_blocked.can_enroll)
        self.assertIn("BCA302", res_blocked.missing_prerequisites)

    def test_exam_fee_calculation(self):
        res = AcademicRuleEngine.calculate_backlog_exam_fee(3, is_late=False)
        self.assertEqual(res["total_fee"], 2250)


class TestSecurityAndClearance(unittest.TestCase):
    """Verifies hashing, tamper-proofing, and cryptographic signatures."""

    def test_password_hashing_and_verification(self):
        pwd = "EnterprisePassword2026!"
        h = hash_password(pwd)
        self.assertNotEqual(pwd, h)
        self.assertTrue(verify_password(pwd, h))
        self.assertFalse(verify_password("WrongPassword!", h))

    def test_deterministic_clearance_hash(self):
        h1 = compute_certificate_hash("1BT23BCA014", "BCA301", 1)
        h2 = compute_certificate_hash("1BT23BCA014", "BCA301", 1)
        self.assertEqual(h1, h2)
        self.assertEqual(len(h1), 16)


class TestExportAndNotifications(unittest.TestCase):
    """Verifies administrative reporting, gazettes, and notifications."""

    def setUp(self):
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_gazette_generation(self):
        csv_text = ExaminationExportService.generate_backlog_gazette_csv(self.db)
        self.assertIn("Official Gazette ID", csv_text)
        self.assertIn("Student USN", csv_text)
        self.assertIn("1BT23BCA048", csv_text)

    def test_clearance_manifest_json(self):
        manifest = ExaminationExportService.generate_clearance_manifest_json(self.db)
        self.assertIn("aggregate_statistics", manifest)
        self.assertGreaterEqual(manifest["aggregate_statistics"]["total_records"], 2)

    def test_seating_manifest(self):
        seating = ExaminationExportService.generate_exam_seating_manifest(self.db)
        self.assertIsInstance(seating, list)
        if seating:
            self.assertIn("seat_number", seating[0])

    def test_email_template_generation(self):
        tmpl = NotificationService.generate_email_template(
            "detention_warning", "Sneha Deshmukh", {"usn": "1BT23BCA048", "backlog_count": 5}
        )
        self.assertIn("URGENT: Academic Detention Warning", tmpl["subject"])
        self.assertIn("1BT23BCA048", tmpl["body"])


class TestDatabaseCRUD(unittest.TestCase):
    """Verifies database queries on the seeded database."""

    def setUp(self):
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_query_student_by_usn(self):
        st = get_student_by_usn(self.db, "1BT23BCA014")
        self.assertIsNotNone(st)
        self.assertEqual(st.name, "Aarav Patel")

    def test_student_enrolled_subjects(self):
        st = get_student_by_usn(self.db, "1BT23BCA014")
        subjects = get_enrolled_subjects_for_student(self.db, st.id)
        self.assertEqual(len(subjects), 6)
        self.assertEqual(subjects[0]["subject_code"], "BCA301")

    def test_faculty_desk_stats(self):
        fac = get_faculty_by_employee_id(self.db, "FAC-1001")
        self.assertIsNotNone(fac)
        stats = get_faculty_dashboard_stats(self.db, fac.id)
        self.assertEqual(stats["employee_id"], "FAC-1001")

    def test_funnel_statistics(self):
        stats = compute_funnel_statistics(self.db)
        self.assertIn("total_backlogs", stats)
        self.assertGreaterEqual(stats["total_backlogs"], 2)


class TestCurriculumCatalog(unittest.TestCase):
    """Verifies course curriculum and syllabus data."""

    def test_sem_3_curriculum(self):
        sem3 = get_curriculum_for_semester(3)
        self.assertEqual(len(sem3), 6)
        codes = [s["code"] for s in sem3]
        self.assertIn("BCA301", codes)
        self.assertIn("BCA302", codes)

    def test_subject_lookup(self):
        sub = get_subject_by_code("BCA301")
        self.assertEqual(sub["name"], "Database Management Systems")
        self.assertEqual(sub["credits"], 4)
        self.assertIn("ACID Properties", " ".join(sub["syllabus_modules"]))

    def test_total_credits(self):
        credits = get_total_program_credits()
        self.assertGreaterEqual(credits, 90)


if __name__ == "__main__":
    suite = unittest.TestSuite()
    for test_class in [
        TestAcademicRuleEngine,
        TestSecurityAndClearance,
        TestExportAndNotifications,
        TestDatabaseCRUD,
        TestCurriculumCatalog,
    ]:
        suite.addTests(unittest.TestLoader().loadTestsFromTestCase(test_class))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
