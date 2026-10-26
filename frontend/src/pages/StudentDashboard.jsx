import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CheckCircle2,
  Bell,
  Clock,
  Download,
  Settings,
  LogOut,
  Menu,
  Sparkles,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  FileCheck,
  KeyRound,
  X,
  Plus,
  Edit3,
  AlertCircle,
  Check,
  CheckCheck,
  UserCheck,
  Users,
  MessageSquare,
  Send,
  Filter,
  Award,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import {
  getBacklogRecords,
  updateStudentBacklogProgress,
  saveBacklogRecords,
  getStudents,
  saveStudents,
  getUsers,
  isFacultyIdentifier,
  BCA_CURRICULUM,
  getCurriculumSubjectsForYearAndSem,
  getTeachers,
  getRequests,
  saveRequests,
  addMeetingRequest,
  getNotifications,
  saveNotifications,
  addNotification
} from '../utils/backlogStore';
import ClearanceCertificateModal from '../components/ClearanceCertificateModal';
import { RecordFunnelStepper } from '../components/ResolutionFunnel';
import SubjectMarksModal from '../components/SubjectMarksModal';
import SemesterSubjectSelector from '../components/SemesterSubjectSelector';

// Default Student Data when no session is loaded
const STUDENT_PROFILE = {
  name: 'Student',
  usn: 'USN',
  course: 'Bachelor of Computer Applications (BCA)',
  academicYear: '1st Year',
  semester: 'Semester 1',
  semesterType: 'Odd Semester',
  section: 'Section A',
  email: 'student@student.univ.edu',
  phone: '',
  advisor: 'Faculty Advisor',
  cgpa: 0.0,
  creditsEarned: 0,
  totalCredits: 140,
  midsemAverage: 0
};

const ENROLLED_SUBJECTS = [];
const STUDENT_REQUESTS = [];
const NOTIFICATIONS_LIST = [];

function sanitizeEmail(email) {
  if (!email) return 'student@student.univ.edu';
  if (email.includes('@')) {
    const parts = email.split('@');
    if (parts.length > 2) {
      // User entered an email that got appended (e.g. user@gmail.com@student.univ.edu)
      return `${parts[0]}@${parts[1]}`;
    }
    return email;
  }
  return `${email}@student.univ.edu`;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // STRICT AUTHENTICATION GUARD: Only authorized students can view Student Dashboard
  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (!stored) {
        navigate('/login?role=student');
        return;
      }
      const u = JSON.parse(stored);

      // If user is faculty or has faculty email/identifier, redirect immediately
      if (
        u.role?.toLowerCase() === 'faculty' ||
        u.role?.toLowerCase() === 'teacher' ||
        isFacultyIdentifier(u.email) ||
        isFacultyIdentifier(u.id) ||
        isFacultyIdentifier(u.username)
      ) {
        navigate('/faculty');
        return;
      }

      // If user is admin, redirect to admin
      if (u.role?.toLowerCase() === 'admin' || u.role?.toLowerCase() === 'administrator') {
        navigate('/admin');
        return;
      }

      // If role is not student, kick out to login
      if (u.role && u.role.toLowerCase() !== 'student') {
        localStorage.removeItem('currentUser');
        navigate('/login?role=student');
        return;
      }

      // Verify that student actually exists in registered students or users store
      const allStudents = getStudents();
      const allUsers = getUsers();
      const isRegistered =
        allStudents.some(
          (s) =>
            s.usn?.toLowerCase() === (u.usn || u.id || '').toLowerCase() ||
            s.id?.toLowerCase() === (u.id || '').toLowerCase() ||
            s.email?.toLowerCase() === (u.email || '').toLowerCase() ||
            s.username?.toLowerCase() === (u.username || '').toLowerCase()
        ) ||
        allUsers.some(
          (usr) =>
            usr.role?.toLowerCase() === 'student' &&
            (usr.id?.toLowerCase() === (u.id || '').toLowerCase() ||
              usr.email?.toLowerCase() === (u.email || '').toLowerCase() ||
              usr.username?.toLowerCase() === (u.username || '').toLowerCase())
        );

      if (!isRegistered) {
        localStorage.removeItem('currentUser');
        navigate('/login?role=student');
        return;
      }
    } catch {
      localStorage.removeItem('currentUser');
      navigate('/login?role=student');
    }
  }, [navigate]);

  // Load current user from login session or fallback to mock
  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const u = JSON.parse(stored);
        if (
          u &&
          u.role === 'student' &&
          !isFacultyIdentifier(u.email) &&
          !isFacultyIdentifier(u.id)
        ) {
          const rawEmail = u.email || STUDENT_PROFILE.email;
          const cleanedEmail = sanitizeEmail(rawEmail);
          if (cleanedEmail !== rawEmail) {
            localStorage.setItem('currentUser', JSON.stringify({ ...u, email: cleanedEmail }));
          }
          const validSubs = Array.isArray(u.enrolledSubjects) ? u.enrolledSubjects : [];
          const validMid = validSubs.filter(
            (s) => s.midsemMarks !== null && s.midsemMarks !== undefined && s.midsemMarks !== ''
          );
          const computedMid = validMid.length > 0
            ? Number(((validMid.reduce((acc, s) => acc + Number(s.midsemMarks) / (Number(s.midsemMax) || 50), 0) / validMid.length) * 100).toFixed(1))
            : null;

          const computedMidScore = validMid.length > 0
            ? Math.round((validMid.reduce((acc, s) => acc + (Number(s.midsemMarks) / (Number(s.midsemMax) || 50)), 0) / validMid.length) * 50)
            : null;

          const validEnd = validSubs.filter(
            (s) => s.endsemMarks !== null && s.endsemMarks !== undefined && s.endsemMarks !== ''
          );
          const computedEnd = validEnd.length > 0
            ? Number(((validEnd.reduce((acc, s) => acc + Number(s.endsemMarks) / (Number(s.endsemMax) || 100), 0) / validEnd.length) * 10).toFixed(1))
            : 0;

          const computedEndScore = validEnd.length > 0
            ? Math.round((validEnd.reduce((acc, s) => acc + (Number(s.endsemMarks) / (Number(s.endsemMax) || 100)), 0) / validEnd.length) * 100)
            : null;

          return {
            ...STUDENT_PROFILE,
            name: u.name || u.username || STUDENT_PROFILE.name,
            usn: u.usn || u.id || u.username || STUDENT_PROFILE.usn,
            course: u.course || 'Bachelor of Computer Applications (BCA)',
            academicYear: u.academicYear || '1st Year',
            semester: u.semester || STUDENT_PROFILE.semester,
            enrolledSubjects: u.enrolledSubjects,
            cgpa: computedEnd > 0 ? computedEnd : (u.cgpa !== undefined && u.cgpa !== null ? Number(u.cgpa) : 0.0),
            midsemAverage: computedMid,
            midsemMarks: computedMidScore,
            endsemMarks: computedEndScore,
            email: cleanedEmail
          };
        }
      }
    } catch { }
    return STUDENT_PROFILE;
  });

  const [subjects, setSubjects] = useState(() => {
    // 1. If enrolledSubjects exist on current session profile
    if (Array.isArray(profile?.enrolledSubjects)) {
      return profile.enrolledSubjects;
    }
    // 2. Try matching from registered students store
    try {
      const allStudents = getStudents();
      const match = allStudents.find((s) => s.usn === profile.usn || s.id === profile.id);
      if (match && Array.isArray(match.enrolledSubjects)) {
        return match.enrolledSubjects;
      }
    } catch {}
    // Do not auto-assign subjects - student will choose their own subjects
    return [];
  });

  const [requests, setRequests] = useState(() => {
    const all = getRequests();
    return all.filter((r) => r.usn === profile.usn || r.studentName === profile.name || (!r.usn && !r.studentName));
  });
  const [notifications, setNotifications] = useState(() => {
    const all = getNotifications();
    return all.filter((n) => n.targetRole === 'student' || n.targetRole === 'all' || n.targetUsn === profile.usn);
  });
  const [backlogRecords, setBacklogRecords] = useState(() => getBacklogRecords());
  const [selectedCertificateRecord, setSelectedCertificateRecord] = useState(null);

  // Modal state for manual subject & marks profile builder
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const persistSubjects = (newSubjects) => {
    setSubjects(newSubjects);
    // Dynamically recalculate midsemAverage, midsemMarks, and CGPA from entered marks
    const validMid = newSubjects.filter(
      (s) => s.midsemMarks !== null && s.midsemMarks !== undefined && s.midsemMarks !== ''
    );
    const avgMidPercent = validMid.length > 0
      ? Number(
          ((validMid.reduce((acc, s) => acc + Number(s.midsemMarks) / (Number(s.midsemMax) || 50), 0) /
            validMid.length) *
          100).toFixed(1)
        )
      : null;

    const avgMidScore = validMid.length > 0
      ? Math.round(
          (validMid.reduce((acc, s) => acc + (Number(s.midsemMarks) / (Number(s.midsemMax) || 50)), 0) /
            validMid.length) * 50
        )
      : null;

    const validEnd = newSubjects.filter(
      (s) => s.endsemMarks !== null && s.endsemMarks !== undefined && s.endsemMarks !== ''
    );
    const avgEnd = validEnd.length > 0
      ? Number(
          ((validEnd.reduce((acc, s) => acc + Number(s.endsemMarks) / (Number(s.endsemMax) || 100), 0) /
            validEnd.length) *
          10).toFixed(1)
        )
      : 0.0;

    const validEndScore = validEnd.length > 0
      ? Math.round(
          (validEnd.reduce((acc, s) => acc + (Number(s.endsemMarks) / (Number(s.endsemMax) || 100)), 0) /
            validEnd.length) * 100
        )
      : null;

    const updatedProfile = {
      ...profile,
      midsemAverage: avgMidPercent,
      midsemMarks: avgMidScore,
      endsemMarks: validEndScore,
      cgpa: Number(avgEnd),
      enrolledSubjects: newSubjects
    };
    setProfile(updatedProfile);

    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const u = JSON.parse(stored);
        localStorage.setItem(
          'currentUser',
          JSON.stringify({
            ...u,
            midsemAverage: avgMidPercent,
            midsemMarks: avgMidScore,
            endsemMarks: validEndScore,
            cgpa: Number(avgEnd),
            enrolledSubjects: newSubjects
          })
        );
      }
      const allStudents = getStudents();
      const sIdx = allStudents.findIndex((s) => s.usn === profile.usn || s.id === profile.usn);
      if (sIdx !== -1) {
        allStudents[sIdx] = {
          ...allStudents[sIdx],
          midsemAverage: avgMidPercent,
          midsemMarks: avgMidScore,
          endsemMarks: validEndScore,
          cgpa: Number(avgEnd),
          enrolledSubjects: newSubjects
        };
        saveStudents(allStudents);
      }
    } catch (e) {
      console.warn('Error saving subjects:', e);
    }

    // Synchronize Backlog / Repeat exam records
    try {
      const currentBacklogs = getBacklogRecords();
      let updatedBacklogs = [...currentBacklogs];
      let backlogChanged = false;

      newSubjects.forEach((sub) => {
        const isBacklogOrRepeat =
          sub.isRepeat ||
          sub.isBacklog ||
          sub.enrollmentType?.includes('Repeat') ||
          sub.enrollmentType?.includes('Backlog') ||
          sub.endsemStatus?.includes('Backlog') ||
          sub.endsemStatus?.includes('Failed') ||
          sub.endsemStatus?.includes('Repeat') ||
          sub.midsemStatus?.includes('Backlog') ||
          (sub.endsemMarks !== null && sub.endsemMarks !== undefined && Number(sub.endsemMarks) < 40 && sub.examType !== 'Mid-Sem');

        const existingIdx = updatedBacklogs.findIndex(
          (b) =>
            (b.usn === profile.usn || b.studentName === profile.name) &&
            (b.subjectCode === sub.code || b.subjectName === sub.name)
        );

        if (isBacklogOrRepeat) {
          backlogChanged = true;
          const repeatStatus = sub.repeatExamStatus && sub.repeatExamStatus !== 'Not Applicable' ? sub.repeatExamStatus : 'Preparing';
          if (existingIdx !== -1) {
            updatedBacklogs[existingIdx] = {
              ...updatedBacklogs[existingIdx],
              repeatExamStatus: repeatStatus,
              clearanceStatus: repeatStatus === 'Cleared' ? 'Cleared' : 'In Review',
              originalMarks: sub.endsemMarks ?? sub.midsemMarks ?? updatedBacklogs[existingIdx].originalMarks,
              semester: sub.semester || profile.semester,
              backlogReason: sub.backlogReason || updatedBacklogs[existingIdx].backlogReason || 'Repeat due to Marks',
              reason: sub.backlogReason || updatedBacklogs[existingIdx].reason || 'Repeat due to Marks'
            };
          } else {
            updatedBacklogs.unshift({
              id: `BL-${profile.usn || 'STU'}-${(sub.code || 'SUB').replace(/[^a-zA-Z0-9]/g, '')}`,
              studentName: profile.name,
              usn: profile.usn || profile.id,
              course: profile.course || 'Bachelor of Computer Applications (BCA)',
              semester: sub.semester || profile.semester || 'Semester 1',
              subjectCode: sub.code,
              subjectName: sub.name,
              facultyInCharge: sub.faculty || 'Department Professor',
              backlogReason: sub.backlogReason || 'Repeat due to Marks',
              reason: sub.backlogReason || (sub.endsemStatus?.includes('Backlog')
                ? 'Backlog in Semester Examination'
                : sub.isRepeat || sub.enrollmentType?.includes('Repeat')
                ? 'Registered for Repeat Examination'
                : 'Scored below passing cutoff'),
              clearanceStatus: repeatStatus === 'Cleared' ? 'Cleared' : 'In Review',
              metTeacher: false,
              assignmentsCompleted: 'Pending',
              teacherConsultation: 'Pending Guidance',
              repeatExamStatus: repeatStatus,
              resultStatus: repeatStatus === 'Cleared' ? 'Cleared' : 'Awaiting result',
              lastUpdated: 'Just now'
            });
          }
        } else if (existingIdx !== -1 && (sub.endsemStatus === 'Passed' || sub.repeatExamStatus === 'Cleared')) {
          backlogChanged = true;
          updatedBacklogs[existingIdx] = {
            ...updatedBacklogs[existingIdx],
            clearanceStatus: 'Cleared',
            repeatExamStatus: 'Cleared',
            resultStatus: 'Passed'
          };
        }
      });

      if (backlogChanged) {
        saveBacklogRecords(updatedBacklogs);
        setBacklogRecords(updatedBacklogs);
      }
    } catch (e) {
      console.warn('Error syncing backlogs:', e);
    }
  };

  const handleSaveSubject = (subjectData) => {
    let updated;
    const existingIndex = subjects.findIndex((s) => s.id === subjectData.id || s.code === subjectData.code);
    if (existingIndex !== -1) {
      updated = [...subjects];
      updated[existingIndex] = subjectData;
    } else {
      updated = [subjectData, ...subjects];
    }
    persistSubjects(updated);
    triggerToast(`Subject ${subjectData.code} and marks saved successfully!`);
  };

  const handleEnrollSubject = (newSub) => {
    const existingIndex = subjects.findIndex((s) => s.code === newSub.code);
    if (existingIndex !== -1) {
      triggerToast(`Subject ${newSub.code} is already in your enrolled list.`);
      return;
    }
    const updated = [...subjects, newSub];
    persistSubjects(updated);
    triggerToast(`Added ${newSub.code} to your subjects!`);
  };

  const handleEnrollAsBacklog = (sub) => {
    const existingIndex = subjects.findIndex((s) => s.code === sub.code);
    if (existingIndex !== -1) {
      triggerToast(`Subject ${sub.code} is already in your enrolled list.`);
      return;
    }
    const yearNum = Math.ceil((sub.semesterNum || 1) / 2);
    const semName = sub.semesterName || sub.semester || `Semester ${sub.semesterNum || 1}`;
    const newSub = {
      id: sub.id || `SUB-${sub.code.replace(/[^a-zA-Z0-9]/g, '')}`,
      code: sub.code,
      name: sub.name,
      course: profile.course || 'Bachelor of Computer Applications (BCA)',
      academicYear: `${yearNum === 1 ? '1st' : yearNum === 2 ? '2nd' : yearNum === 3 ? '3rd' : '4th'} Year`,
      semester: semName,
      semesterNum: sub.semesterNum || 1,
      semesterType: (sub.semesterNum || 1) % 2 !== 0 ? 'Odd' : 'Even',
      type: sub.type || 'Core',
      faculty: sub.faculty || 'Department Professor',
      enrollmentType: 'Active Backlog Paper',
      isRepeat: true,
      isBacklog: true,
      backlogReason: sub.backlogReason || 'Repeat due to Marks',
      reasonCategory: sub.reasonCategory || 'Repeat due to Marks',
      otherReason: sub.otherReason || '',
      repeatExamStatus: sub.repeatExamStatus || 'Preparing',
      examType: 'Both',
      midsemMarks: sub.midsemMarks ?? null,
      midsemMax: sub.midsemMax || 50,
      midsemStatus: sub.midsemStatus || (sub.backlogReason?.includes('Attendance') ? 'Attendance Shortfall' : 'Backlog Internal'),
      endsemMarks: sub.endsemMarks ?? null,
      endsemMax: sub.endsemMax || 100,
      endsemStatus: sub.endsemStatus || 'Backlog / Failed (<40)',
      status: `Active Backlog Paper (${semName})`,
      isCurrentSemester: false,
      ...sub
    };
    const updated = [...subjects, newSub];
    persistSubjects(updated);
    triggerToast(`Added ${sub.code} (${sub.name}) as an Active Backlog Paper!`);
  };

  const handleEnrollAllForSemester = (newSubsList) => {
    const updated = [...subjects, ...newSubsList];
    persistSubjects(updated);
    triggerToast(`Enrolled ${newSubsList.length} subjects for this semester!`);
  };

  const handleDeleteSubject = (codeOrId) => {
    const updated = subjects.filter((s) => s.code !== codeOrId && s.id !== codeOrId);
    persistSubjects(updated);
    triggerToast(`Subject removed from your enrolled list.`);
  };

  const handleClearAllSubjects = () => {
    persistSubjects([]);
    try {
      const currentBL = getBacklogRecords();
      const filtered = currentBL.filter(
        (b) => b.usn !== profile.usn && b.studentName !== profile.name
      );
      saveBacklogRecords(filtered);
      setBacklogRecords(filtered);
    } catch {}
    triggerToast('All enrolled courses & backlogs cleared. Choose your subjects fresh below!');
  };

  const handleOpenAddSubject = (initial = null) => {
    setEditingSubject(initial || null);
    setSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (sub) => {
    setEditingSubject(sub);
    setSubjectModalOpen(true);
  };

  // Route check: redirect admin or faculty to their authorized portal
  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && (u.role?.toLowerCase() === 'admin' || u.role?.toLowerCase() === 'administrator')) {
          navigate('/admin');
          return;
        }
        if (u && (u.role?.toLowerCase() === 'faculty' || u.role?.toLowerCase() === 'teacher')) {
          navigate('/faculty');
          return;
        }
      }
    } catch {}
  }, [navigate]);

  const handleSwitchStudent = (stu) => {
    setProfile(stu);
    try {
      localStorage.setItem('currentUser', JSON.stringify({
        ...stu,
        role: 'student'
      }));
    } catch { }
    triggerToast(`Switched active student to ${stu.name} (${stu.usn})!`);
  };

  // Real-time synchronization with Faculty Dashboard updates
  useEffect(() => {
    const handleSync = (e) => {
      if (e?.detail) {
        setBacklogRecords(e.detail);
      } else {
        setBacklogRecords(getBacklogRecords());
      }
    };
    window.addEventListener('backtrack_backlog_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('backtrack_backlog_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Teacher Meeting Request Modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [teachersList, setTeachersList] = useState(() => getTeachers());
  const [requestForm, setRequestForm] = useState(() => {
    const defaultTeacher = getTeachers()[0];
    return {
      teacher: defaultTeacher ? `${defaultTeacher.name} — ${defaultTeacher.designation} (${defaultTeacher.cabin || 'Faculty Cabin'})` : '',
      subject: '',
      meetingSlot: 'Faculty Cabin (Morning Slot: 10:30 AM - 11:30 AM)',
      type: 'Backlog Doubt Clearance & Subject Guidance',
      reason: ''
    };
  });

  // Keep teachersList, requests, and notifications in sync with updates
  useEffect(() => {
    const handleTeachersSync = () => {
      setTeachersList(getTeachers());
    };
    const handleRequestsSync = () => {
      const all = getRequests();
      setRequests(all.filter((r) => r.usn === profile.usn || r.studentName === profile.name || (!r.usn && !r.studentName)));
    };
    const handleNotificationsSync = () => {
      const all = getNotifications();
      setNotifications(all.filter((n) => n.targetRole === 'student' || n.targetRole === 'all' || n.targetUsn === profile.usn));
    };

    window.addEventListener('backtrack_teachers_updated', handleTeachersSync);
    window.addEventListener('backtrack_requests_updated', handleRequestsSync);
    window.addEventListener('backtrack_notifications_updated', handleNotificationsSync);
    window.addEventListener('storage', handleTeachersSync);
    window.addEventListener('storage', handleRequestsSync);
    window.addEventListener('storage', handleNotificationsSync);

    return () => {
      window.removeEventListener('backtrack_teachers_updated', handleTeachersSync);
      window.removeEventListener('backtrack_requests_updated', handleRequestsSync);
      window.removeEventListener('backtrack_notifications_updated', handleNotificationsSync);
      window.removeEventListener('storage', handleTeachersSync);
      window.removeEventListener('storage', handleRequestsSync);
      window.removeEventListener('storage', handleNotificationsSync);
    };
  }, [profile.usn, profile.name]);

  // Toast Feedback
  const [toast, setToast] = useState(null);
  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login?role=student');
  };

  const handleCreateRequest = (e) => {
    e.preventDefault();
    if (!requestForm.teacher) {
      triggerToast('Please select a teacher / faculty member to schedule a meeting.');
      return;
    }
    const teacherShort = requestForm.teacher.split('—')[0].trim();
    const matchedTeacher = teachersList.find((t) =>
      requestForm.teacher.includes(t.name) ||
      (t.empId && requestForm.teacher.includes(t.empId))
    ) || teachersList[0];

    const newReq = {
      id: `MEET-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`,
      studentName: profile.name || 'Student',
      usn: profile.usn || profile.id || 'USN',
      studentEmail: profile.email || '',
      course: profile.course || 'Bachelor of Computer Applications (BCA)',
      semester: profile.semester || 'Semester 1',
      teacher: requestForm.teacher,
      teacherName: matchedTeacher?.name || teacherShort,
      teacherEmpId: matchedTeacher?.empId || '',
      teacherUsername: matchedTeacher?.username || '',
      subject: requestForm.subject ? requestForm.subject : 'General Consultation / Not Specified',
      type: requestForm.type,
      slot: requestForm.meetingSlot,
      reason: requestForm.reason,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      timestamp: Date.now(),
      status: 'Pending',
      facultyResponse: `Meeting requested with ${matchedTeacher?.name || teacherShort} for ${requestForm.meetingSlot}.`,
      remarks: ''
    };

    // Save to persistent requests store & dispatch event
    addMeetingRequest(newReq);
    setRequests((prev) => [newReq, ...prev.filter((r) => r.id !== newReq.id)]);

    // Create persistent Notification for the targeted Faculty Member
    addNotification({
      id: `NOTIF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      title: `New 1-on-1 Meeting Request`,
      category: 'Student Requests',
      body: `${profile.name} (${profile.usn}) requested a 1-on-1 meeting for "${newReq.subject}" at ${newReq.slot}. Note: "${newReq.reason}"`,
      time: 'Just now',
      timestamp: Date.now(),
      read: false,
      targetRole: 'faculty',
      targetEmpId: newReq.teacherEmpId,
      targetTeacherName: newReq.teacherName,
      targetTeacherUsername: newReq.teacherUsername,
      studentName: profile.name,
      usn: profile.usn,
      requestId: newReq.id
    });

    // Create confirmation notification for Student
    addNotification({
      id: `NOTIF-${Date.now() + 1}-${Math.floor(100 + Math.random() * 900)}`,
      title: `Meeting Requested: ${newReq.teacherName}`,
      category: 'Student Requests',
      body: `Your meeting request with ${newReq.teacherName} for ${newReq.slot} has been submitted. Check this tab for faculty confirmation.`,
      time: 'Just now',
      timestamp: Date.now(),
      read: false,
      targetRole: 'student',
      targetUsn: profile.usn,
      studentName: profile.name,
      requestId: newReq.id
    });

    triggerToast(`Meeting requested with ${newReq.teacherName}!`);
    setIsApplyModalOpen(false);
    const defaultTeacher = teachersList[0] || getTeachers()[0];
    setRequestForm({
      teacher: defaultTeacher ? `${defaultTeacher.name} — ${defaultTeacher.designation} (${defaultTeacher.cabin || 'Faculty Cabin'})` : '',
      subject: '',
      meetingSlot: 'Faculty Cabin (Morning Slot: 10:30 AM - 11:30 AM)',
      type: 'Backlog Doubt Clearance & Subject Guidance',
      reason: ''
    });
  };

  return (
    <div className="flex h-screen bg-[#f4f9fd] font-sans overflow-hidden text-[#03045e]">
      {/* Toast Feedback */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-[#03045e] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#0077b6]/40 animate-bounce">
          <Sparkles size={18} className="text-[#00b4d8]" />
          <span className="text-sm font-medium">{toast}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-[#90e0ef] hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Mobile Top Navbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#03045e] text-white flex items-center justify-between px-5 z-40 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white text-[#03045e] flex items-center justify-center font-bold text-sm">
            BT
          </div>
          <span className="font-bold text-lg tracking-tight">BackTrack</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-[#caf0f8]">Student</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            title="Log Out"
            className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-300 hover:text-white">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Modern Sleek Dark Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 left-0 h-full z-40 w-68
          bg-[#03045e] text-white flex flex-col justify-between
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:my-3 lg:ml-3 lg:rounded-[2.2rem] shadow-2xl shadow-[#03045e]/25 overflow-hidden
        `}
      >
        <div>
          {/* Logo Header */}
          <div className="p-6 pb-6 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white text-[#03045e] flex items-center justify-center font-extrabold text-lg shadow-sm">
                BT
              </div>
              <div>
                <h1 className="font-extrabold text-lg tracking-tight flex items-center gap-1.5">
                  BackTrack
                  <span className="w-2 h-2 rounded-full bg-[#00b4d8] inline-block animate-pulse"></span>
                </h1>
                <p className="text-[11px] text-[#90e0ef] font-medium">Student Academic Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="px-3 py-6 space-y-1.5">
            <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-[#90e0ef]/70 uppercase">Student Hub</div>

            <SidebarBtn
              icon={<LayoutDashboard size={19} />}
              label="Dashboard"
              active={activeTab === 'Dashboard'}
              onClick={() => { setActiveTab('Dashboard'); setIsMobileMenuOpen(false); }}
            />
            <SidebarBtn
              icon={<BookOpen size={19} />}
              label="My Subjects"
              active={activeTab === 'My Subjects'}
              badge={subjects.length}
              onClick={() => { setActiveTab('My Subjects'); setIsMobileMenuOpen(false); }}
            />
            <SidebarBtn
              icon={<GraduationCap size={19} />}
              label="Backlog Tracking"
              active={activeTab === 'Backlog Tracking'}
              badge={backlogRecords.filter((b) => b.studentName === profile.name || b.usn === profile.usn).length || backlogRecords.length}
              badgeColor="bg-[#caf0f8] text-[#0077b6]"
              onClick={() => { setActiveTab('Backlog Tracking'); setIsMobileMenuOpen(false); }}
            />
            <SidebarBtn
              icon={<Users size={19} />}
              label="Teacher Meetings"
              active={activeTab === 'Teacher Meetings' || activeTab === 'My Requests'}
              badge={requests.length}
              onClick={() => { setActiveTab('Teacher Meetings'); setIsMobileMenuOpen(false); }}
            />
            <SidebarBtn
              icon={<Bell size={19} />}
              label="Notifications"
              active={activeTab === 'Notifications'}
              badge={notifications.filter((n) => !n.read).length || undefined}
              onClick={() => { setActiveTab('Notifications'); setIsMobileMenuOpen(false); }}
            />
            <SidebarBtn
              icon={<Settings size={19} />}
              label="Settings & Profile"
              active={activeTab === 'Settings & Profile'}
              onClick={() => { setActiveTab('Settings & Profile'); setIsMobileMenuOpen(false); }}
            />
          </div>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="p-4 border-t border-white/10 bg-[#02033b]/60">
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
            <button
              onClick={() => { setActiveTab('Settings & Profile'); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-3 text-left hover:opacity-85 transition cursor-pointer w-full min-w-0 group"
              title="Click to view Profile & Settings"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#caf0f8] to-[#90e0ef] text-[#03045e] flex items-center justify-center font-bold text-xs shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                {profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'ST'}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-xs font-bold text-white leading-tight truncate group-hover:text-[#caf0f8] transition-colors">{profile.name}</p>
                <p className="text-[10px] text-[#00b4d8] font-medium font-mono truncate">
                  {profile.usn}
                </p>
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="mt-2.5 w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white border border-rose-500/20 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              title="Sign Out of Student Account"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden pt-16 lg:pt-0">


        {/* Top Header */}
        <header className="h-20 px-6 lg:px-8 flex items-center justify-between border-b border-[#caf0f8] bg-[#f4f9fd]/90 backdrop-blur-md">
          <div>
            <h2 className="text-xl lg:text-2xl font-extrabold text-[#03045e] tracking-tight">{activeTab}</h2>
            <p className="text-xs text-[#0077b6] font-medium">{profile.course} • {profile.semester}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#0077b6] text-white text-xs font-bold hover:bg-[#03045e] transition shadow-md shadow-[#0077b6]/20 cursor-pointer"
            >
              <Plus size={15} /> Request Teacher Meet
            </button>

            <button
              onClick={() => setActiveTab('Notifications')}
              className="relative p-2.5 rounded-2xl bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 shadow-xs hover:shadow-sm transition-all"
            >
              <Bell size={18} />
              {notifications.some((n) => !n.read) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full"></span>
              )}
            </button>
          </div>
        </header>

        {/* View Routing Container */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6 custom-scrollbar">
          {activeTab === 'Dashboard' && (
            <StudentDashboardTab
              profile={profile}
              subjects={subjects}
              requests={requests}
              backlogRecords={backlogRecords}
              onNavigate={(t) => setActiveTab(t)}
              openApplyModal={() => setIsApplyModalOpen(true)}
              onOpenAddSubject={handleOpenAddSubject}
              onOpenEditSubject={handleOpenEditSubject}
              onEnrollSubject={handleEnrollSubject}
              onEnrollAsBacklog={handleEnrollAsBacklog}
              onEnrollAllForSemester={handleEnrollAllForSemester}
              onRemoveSubject={handleDeleteSubject}
              onClearAllSubjects={handleClearAllSubjects}
            />
          )}

          {activeTab === 'My Subjects' && (
            <StudentSubjectsTab
              subjects={subjects}
              onOpenAddSubject={handleOpenAddSubject}
              onOpenEditSubject={handleOpenEditSubject}
              onDeleteSubject={handleDeleteSubject}
              onEnrollSubject={handleEnrollSubject}
              onEnrollAsBacklog={handleEnrollAsBacklog}
              onEnrollAllForSemester={handleEnrollAllForSemester}
              onClearAllSubjects={handleClearAllSubjects}
              triggerToast={triggerToast}
              profile={profile}
            />
          )}

          {activeTab === 'Backlog Tracking' && (
            <StudentBacklogsTab
              studentProfile={profile}
              backlogRecords={backlogRecords}
              setBacklogRecords={setBacklogRecords}
              openApplyModal={() => setIsApplyModalOpen(true)}
              triggerToast={triggerToast}
              onOpenCertificate={(record) => setSelectedCertificateRecord(record)}
            />
          )}

          {(activeTab === 'Teacher Meetings' || activeTab === 'My Requests') && (
            <StudentRequestsTab
              requests={requests}
              openApplyModal={() => setIsApplyModalOpen(true)}
            />
          )}

          {activeTab === 'Notifications' && (
            <StudentNotificationsTab
              notifications={notifications}
              setNotifications={setNotifications}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'Settings & Profile' && (
            <StudentProfileSettingsTab
              profile={profile}
              setProfile={setProfile}
              setSubjects={setSubjects}
              triggerToast={triggerToast}
              onOpenAddSubject={handleOpenAddSubject}
            />
          )}
        </div>
      </main>

      {/* Modal: Request Teacher Meeting */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#fdeedc] text-[#8a4816] flex items-center justify-center font-bold shadow-xs">
                  <Users size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 tracking-tight">Request Teacher Meet</h3>
                  <p className="text-[11px] text-slate-500">Schedule 1-on-1 cabin consultation & faculty guidance</p>
                </div>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 mt-4 text-xs">
              {/* 1. SELECT TEACHER / FACULTY MEMBER (PRIMARY REQUIRED FIELD) */}
              <div>
                <label className="font-bold text-slate-700 flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <UserCheck size={13} className="text-[#8a4816]" /> Select Teacher / Faculty Member <span className="text-red-500 font-bold">*</span>
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    {teachersList.length} Faculty Members Available
                  </span>
                </label>
                <select
                  required
                  value={requestForm.teacher}
                  onChange={(e) => setRequestForm({ ...requestForm, teacher: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-medium focus:bg-white focus:border-[#8a4816] transition text-slate-800"
                >
                  <option value="">-- Choose Faculty Member to Meet --</option>
                  {teachersList.map((t) => (
                    <option
                      key={t.id || t.empId || t.name}
                      value={`${t.name} — ${t.designation} (${t.cabin || 'Faculty Cabin'})`}
                    >
                      👨‍🏫 {t.name} — {t.designation} ({t.cabin || 'Faculty Cabin'})
                    </option>
                  ))}
                </select>
                {requestForm.teacher && (
                  <p className="text-[10px] text-slate-500 mt-1 pl-1">
                    Meeting location:{' '}
                    <span className="font-semibold text-slate-700">
                      {requestForm.teacher.split('(')[1]?.replace(')', '') || 'Faculty Cabin'}
                    </span>
                  </p>
                )}
              </div>

              {/* 2. RELATED SUBJECT (OPTIONAL - CAN SKIP) */}
              <div>
                <label className="font-bold text-slate-700 flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={13} className="text-slate-500" /> Related Course / Backlog Paper (Optional)
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/60">
                    Optional — Can skip if general query
                  </span>
                </label>
                <select
                  value={requestForm.subject}
                  onChange={(e) => setRequestForm({ ...requestForm, subject: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-medium focus:bg-white focus:border-[#8a4816] transition text-slate-800"
                >
                  <option value="">-- None / General Consultation (Optional) --</option>

                  {/* Active Student Backlogs */}
                  {subjects.filter((s) => s.isBacklog || s.isRepeat).length > 0 && (
                    <optgroup label="⚠️ Your Active Backlogs (Priority Guidance)">
                      {subjects
                        .filter((s) => s.isBacklog || s.isRepeat)
                        .map((sub) => (
                          <option
                            key={sub.code || sub.id}
                            value={`${sub.code} - ${sub.name} (Active Backlog)`}
                          >
                            ⚠️ {sub.code} — {sub.name} ({sub.semester || `Sem ${sub.semesterNum}`})
                          </option>
                        ))}
                    </optgroup>
                  )}

                  {/* Regular Enrolled Courses */}
                  {subjects.filter((s) => !s.isBacklog && !s.isRepeat).length > 0 && (
                    <optgroup label="📖 Your Currently Enrolled Subjects">
                      {subjects
                        .filter((s) => !s.isBacklog && !s.isRepeat)
                        .map((sub) => (
                          <option
                            key={sub.code || sub.id}
                            value={`${sub.code} - ${sub.name}`}
                          >
                            📘 {sub.code} — {sub.name} ({sub.semester || `Sem ${sub.semesterNum}`})
                          </option>
                        ))}
                    </optgroup>
                  )}

                  {/* Full Curriculum Arranged Semester-Wise */}
                  {[1, 2, 3, 4, 5, 6].map((sem) => (
                    <optgroup
                      key={sem}
                      label={`Semester ${sem} Curriculum (${BCA_CURRICULUM.filter((s) => s.semesterNum === sem).length} Subjects)`}
                    >
                      {BCA_CURRICULUM.filter((s) => s.semesterNum === sem).map((sub) => (
                        <option
                          key={sub.code}
                          value={`${sub.code} - ${sub.name}`}
                        >
                          {sub.code} — {sub.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* 3. PREFERRED MEETING SLOT - FULL WIDTH STACKED */}
              <div>
                <label className="font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                  <Clock size={13} className="text-[#8a4816]" /> Preferred Meeting Slot & Cabin Time
                </label>
                <select
                  value={requestForm.meetingSlot}
                  onChange={(e) => setRequestForm({ ...requestForm, meetingSlot: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-medium focus:bg-white focus:border-[#8a4816] transition text-slate-800"
                >
                  <option value="Faculty Cabin (Morning Slot: 10:30 AM - 11:30 AM)">
                    Faculty Cabin (Morning Slot: 10:30 AM - 11:30 AM)
                  </option>
                  <option value="Faculty Cabin (Afternoon Slot: 02:30 PM - 03:30 PM)">
                    Faculty Cabin (Afternoon Slot: 02:30 PM - 03:30 PM)
                  </option>
                  <option value="Department Lab (Evening Slot: 04:00 PM - 05:00 PM)">
                    Department Lab (Evening Slot: 04:00 PM - 05:00 PM)
                  </option>
                </select>
              </div>

              {/* 4. CONSULTATION PURPOSE - FULL WIDTH STACKED */}
              <div>
                <label className="font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                  <Sparkles size={13} className="text-[#8a4816]" /> Consultation Purpose
                </label>
                <select
                  value={requestForm.type}
                  onChange={(e) => setRequestForm({ ...requestForm, type: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-medium focus:bg-white focus:border-[#8a4816] transition text-slate-800"
                >
                  <option value="Backlog Doubt Clearance & Subject Guidance">
                    Backlog Doubt Clearance & Subject Guidance
                  </option>
                  <option value="Remedial Coursework & Assignment Verification">
                    Remedial Coursework & Assignment Verification
                  </option>
                  <option value="Mid-Semester Retest / Make-up Consultation">
                    Mid-Semester Retest / Make-up Consultation
                  </option>
                  <option value="Practical & Lab Examination Preparation">
                    Practical & Lab Examination Preparation
                  </option>
                  <option value="General Academic & Career Mentorship">
                    General Academic & Career Mentorship
                  </option>
                </select>
              </div>

              {/* 5. TOPICS TO DISCUSS */}
              <div>
                <label className="font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                  <MessageSquare size={13} className="text-slate-500" /> Topics to Discuss / Note to Teacher
                </label>
                <textarea
                  required
                  rows={3}
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                  placeholder="Mention topics, syllabus units, questions, or guidance you wish to discuss during cabin hours..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-[#8a4816] transition text-xs text-slate-800 leading-relaxed"
                />
              </div>

              {/* 6. ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#13141b] text-[#f5caa0] hover:text-white font-bold hover:bg-slate-900 transition shadow-sm cursor-pointer"
                >
                  Request Meeting with Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Official Clearance Certificate */}
      {selectedCertificateRecord && (
        <ClearanceCertificateModal
          record={selectedCertificateRecord}
          onClose={() => setSelectedCertificateRecord(null)}
        />
      )}

      {/* Modal: Manual Subject & Examination Marks Builder */}
      <SubjectMarksModal
        isOpen={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        initialSubject={editingSubject}
        onSave={handleSaveSubject}
        studentCourse={profile.course}
        defaultSemester={profile.semester}
      />
    </div>
  );
}

// -------------------------------------------------------------
// Sub-component: Sidebar Nav Button
// -------------------------------------------------------------
function SidebarBtn({ icon, label, active, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center justify-between px-4 py-3 rounded-2xl font-medium text-xs
        transition-all duration-200 cursor-pointer
        ${active
          ? 'bg-white text-[#03045e] font-bold shadow-md shadow-[#03045e]/25 translate-x-1'
          : 'text-[#caf0f8]/70 hover:text-white hover:bg-white/10'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <span className={active ? 'text-[#0077b6]' : 'text-[#90e0ef]'}>{icon}</span>
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span
          className={`
            text-[10px] font-bold px-2 py-0.5 rounded-full
            ${active ? 'bg-[#0077b6] text-white' : 'bg-white/10 text-[#caf0f8]'}
          `}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// =============================================================
// TAB 1: STUDENT DASHBOARD OVERVIEW
// =============================================================
function StudentDashboardTab({
  profile,
  subjects,
  requests,
  backlogRecords = [],
  onNavigate,
  openApplyModal,
  onOpenAddSubject,
  onOpenEditSubject,
  onEnrollSubject,
  onEnrollAsBacklog,
  onEnrollAllForSemester,
  onRemoveSubject,
  onClearAllSubjects
}) {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="w-full bg-white rounded-3xl p-6 lg:p-7 border border-[#caf0f8] shadow-[0_8px_30px_rgba(3,4,94,0.03)] relative overflow-hidden flex flex-col justify-between">
        <div className="relative z-10">
          <h3 className="text-2xl font-extrabold text-[#03045e] tracking-tight">
            Welcome back, {profile.name}
          </h3>
          <p className="text-xs text-[#0077b6] mt-1 max-w-xl leading-relaxed">
            You are currently enrolled in <strong>{subjects.length} course subjects</strong> for {profile.semester}.
            Your faculty advisor is <strong>{profile.advisor}</strong>. You can customize your subjects and enter your marks anytime!
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-[#caf0f8] flex flex-wrap items-center gap-4 relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0077b6] bg-[#caf0f8]/70 px-3.5 py-2 rounded-xl font-mono">
            USN: {profile.usn} • {profile.section}
          </div>
          <button
            onClick={() => onNavigate('My Subjects')}
            className="text-xs font-bold text-[#0077b6] bg-[#caf0f8] hover:bg-[#90e0ef] px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            My Subjects ({subjects.length}) <ChevronRight size={14} />
          </button>
          <button
            onClick={onOpenAddSubject}
            className="text-xs font-bold text-white bg-[#0077b6] hover:bg-[#03045e] px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#0077b6]/20"
          >
            <Plus size={14} /> Build / Add Subject & Marks
          </button>
          <button
            onClick={openApplyModal}
            className="text-xs font-bold text-[#03045e] bg-[#00b4d8]/20 hover:bg-[#00b4d8]/35 border border-[#00b4d8]/40 px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            Request Teacher Meet <ChevronRight size={14} />
          </button>
        </div>

        <div className="absolute right-[-40px] top-[-40px] w-64 h-64 rounded-full bg-gradient-to-br from-[#caf0f8] to-[#90e0ef]/50 blur-2xl pointer-events-none" />
      </div>

      {/* 4 Coolors Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Current CGPA - Powder Ice to Soft Sky */}
        <div className="bg-gradient-to-br from-[#caf0f8] to-[#90e0ef]/40 border border-[#90e0ef] rounded-3xl p-5 shadow-[0_6px_20px_rgba(0,119,182,0.1)]">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-white text-[#0077b6] flex items-center justify-center font-bold shadow-xs">
              <GraduationCap size={22} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#0077b6] text-white shadow-xs">
              {Number(profile.cgpa) >= 8.5 ? 'Distinction' : Number(profile.cgpa) >= 6.0 ? 'First Class' : Number(profile.cgpa) > 0 ? 'Passing' : 'Pending Evaluation'}
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-[#0077b6]/90 uppercase tracking-wide">Cumulative CGPA</span>
            <div className="text-2xl font-black text-[#03045e] tracking-tight mt-0.5">
              {Number(profile.cgpa) > 0 ? `${profile.cgpa} / 10.0` : 'Not Entered'}
            </div>
            <p className="text-[11px] text-[#0077b6] mt-1 font-medium">Calculated from End-Sem papers</p>
          </div>
        </div>

        {/* Mid-Semester Performance - Soft Sky to Vivid Cyan */}
        <div className="bg-gradient-to-br from-[#90e0ef]/40 to-[#00b4d8]/20 border border-[#00b4d8]/40 rounded-3xl p-5 shadow-[0_6px_20px_rgba(0,180,216,0.1)]">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-white text-[#00b4d8] flex items-center justify-center font-bold shadow-xs">
              <Sparkles size={22} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#00b4d8] text-[#03045e] shadow-xs">
              {Number(profile.midsemAverage) > 0 ? 'Evaluated' : 'Pending'}
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-[#0077b6]/90 uppercase tracking-wide">Mid-Semester Avg</span>
            <div className="text-2xl font-black text-[#03045e] tracking-tight mt-0.5">
              {Number(profile.midsemAverage) > 0 ? `${profile.midsemAverage}%` : 'Not Entered'}
            </div>
            <p className="text-[11px] text-[#0077b6] mt-1 font-medium">Internal continuous evaluation</p>
          </div>
        </div>

        {/* Enrolled Subjects - Pacific Cyan to Ocean Blue */}
        <div
          onClick={() => onNavigate('My Subjects')}
          className="bg-gradient-to-br from-[#00b4d8]/15 to-[#0077b6]/15 border border-[#0077b6]/30 rounded-3xl p-5 shadow-[0_6px_20px_rgba(0,119,182,0.1)] cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-white text-[#0077b6] flex items-center justify-center font-bold shadow-xs">
              <BookOpen size={22} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#0077b6]/15 text-[#03045e]">
              {profile.semester}
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-[#0077b6]/90 uppercase tracking-wide">Enrolled Subjects</span>
            <div className="text-2xl font-black text-[#03045e] tracking-tight mt-0.5">{subjects.length} Courses</div>
            <p className="text-[11px] text-[#0077b6] mt-1 font-medium">Odd & Even Semester Modules</p>
          </div>
        </div>

        {/* Backlog Status - Deep Navy Gradient Accent */}
        <div
          onClick={() => onNavigate('Backlog Tracking')}
          className="bg-gradient-to-br from-[#03045e]/10 to-[#caf0f8]/60 border border-[#90e0ef] rounded-3xl p-5 shadow-[0_6px_20px_rgba(3,4,94,0.08)] cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#03045e] text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap size={22} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#03045e]/15 text-[#03045e]">
              {backlogRecords.filter((b) => b.studentName === profile.name || b.usn === profile.usn).length > 0 ? 'Active' : 'All Clear'}
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-[#03045e]/80 uppercase tracking-wide">Backlog Tracking</span>
            <div className="text-2xl font-black text-[#03045e] tracking-tight mt-0.5">
              {backlogRecords.filter((b) => b.studentName === profile.name || b.usn === profile.usn).length || backlogRecords.length} Subjects
            </div>
            <p className="text-[11px] text-[#0077b6] mt-1 font-medium">Click to update teacher progress</p>
          </div>
        </div>
      </div>

      {/* Space to Select Subjects as per Semester & Enter Details */}
      <SemesterSubjectSelector
        enrolledSubjects={subjects}
        currentSemester={profile.semester}
        studentCourse={profile.course}
        onEnrollSubject={onEnrollSubject}
        onEnrollAsBacklog={onEnrollAsBacklog}
        onEnrollAllForSemester={onEnrollAllForSemester}
        onRemoveSubject={onRemoveSubject}
        onEditSubject={onOpenEditSubject}
        onOpenCustomModal={onOpenAddSubject}
        onClearAllSubjects={onClearAllSubjects}
      />

      {/* Subjects Overview & Teacher Meetings Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h4 className="text-base font-extrabold text-slate-900 tracking-tight">Your Enrolled Courses</h4>
              <p className="text-xs text-slate-500">Mid-Semester evaluation, End-Semester exam standing, and repeat paper progress</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAddSubject}
                className="text-xs font-bold text-[#8a4816] bg-[#fdeedc] hover:bg-[#fadab6] px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Plus size={13} /> Add Custom / Enter Marks
              </button>
              <button onClick={() => onNavigate('My Subjects')} className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:underline">
                View all details
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {subjects.length === 0 ? (
              <div className="p-8 text-center bg-[#fbfbfd] rounded-2xl border border-slate-100 space-y-2">
                <p className="text-xs text-slate-600 font-bold">No courses enrolled in your profile yet.</p>
                <p className="text-xs text-slate-400">
                  Select your semester above and click "+ Choose Subject" or "Select All Available" to build your course list.
                </p>
                <button
                  onClick={onOpenAddSubject}
                  className="mt-2 text-xs font-bold text-[#8a4816] hover:underline"
                >
                  + Or click to enter a custom subject manually
                </button>
              </div>
            ) : (
              subjects.map((sub) => {
                const hasMid = sub.midsemMarks !== null && sub.midsemMarks !== undefined;
                const hasEnd = sub.endsemMarks !== null && sub.endsemMarks !== undefined;
                const isRepeat = sub.isRepeat || sub.enrollmentType?.includes('Repeat');
                const isBacklog = sub.isBacklog || sub.endsemStatus?.includes('Backlog');

                return (
                  <div key={sub.code || sub.id} className="p-4 rounded-2xl bg-[#fbfbfd] border border-slate-100 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-xs text-slate-900 font-mono">{sub.code}</span>
                        <span className="text-xs font-bold text-slate-700">{sub.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sub.semesterType === 'Odd' ? 'bg-[#fdeedc] text-[#8a4816]' : 'bg-[#e9f2fc] text-[#1e40af]'}`}>
                          {sub.semester || (sub.semesterType + ' Sem')}
                        </span>
                        {isRepeat && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-[#8a4816]">
                            Repeat: {sub.repeatExamStatus || 'Preparing'}
                          </span>
                        )}
                        {isBacklog && !isRepeat && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                            Backlog
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{sub.faculty} • {sub.type}</p>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-bold">MIDSEM SCORE</span>
                        <span className="text-xs font-extrabold text-emerald-600">
                          {hasMid ? `${sub.midsemMarks} / ${sub.midsemMax || 50}` : '—'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-bold">ENDSEM EXAM</span>
                        <span className="text-xs font-extrabold text-[#1e40af]">
                          {hasEnd ? `${sub.endsemMarks} / ${sub.endsemMax || 100}` : (sub.endsemStatus || 'Pending')}
                        </span>
                      </div>
                      <button
                        onClick={() => onOpenEditSubject(sub)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-[#fdeedc] text-slate-500 hover:text-[#8a4816] transition cursor-pointer"
                        title="Edit Marks and Standing"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => onRemoveSubject(sub.code)}
                        className="p-1.5 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Remove Subject"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Teacher Meetings Status */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-extrabold text-slate-900 tracking-tight">Teacher Meetings</h4>
              <button onClick={() => onNavigate('Teacher Meetings')} className="text-xs font-bold text-[#6b21a8] hover:underline cursor-pointer">
                View all
              </button>
            </div>

            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r.id} className="p-3.5 rounded-2xl bg-[#f6f7fa] border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900">{r.type}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === 'Approved' ? 'bg-[#e7f6ee] text-[#166534]' : 'bg-[#fdeedc] text-[#8a4816]'}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 truncate">{r.subject}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={openApplyModal}
            className="w-full mt-4 py-2.5 bg-[#13141b] text-white rounded-2xl font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
          >
            + Request Teacher Meet
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// TAB 2: MY SUBJECTS DETAILED VIEW
// =============================================================
function StudentSubjectsTab({
  subjects,
  onOpenAddSubject,
  onOpenEditSubject,
  onDeleteSubject,
  onEnrollSubject,
  onEnrollAsBacklog,
  onEnrollAllForSemester,
  onClearAllSubjects,
  triggerToast,
  profile
}) {
  const [semesterFilter, setSemesterFilter] = useState('All'); // 'All', 'Odd', 'Even', 'Semester 1' ... 'Semester 8'
  const [examFilter, setExamFilter] = useState('All'); // 'All', 'Both', 'Mid-Sem', 'End-Sem'

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      // Semester filter
      if (semesterFilter === 'Odd' && s.semesterType !== 'Odd') return false;
      if (semesterFilter === 'Even' && s.semesterType !== 'Even') return false;
      if (semesterFilter.startsWith('Semester ') && s.semester !== semesterFilter) return false;

      // Exam filter
      if (examFilter === 'Both') {
        const hasMid = s.midsemMarks !== null && s.midsemMarks !== undefined;
        const hasEnd = s.endsemMarks !== null && s.endsemMarks !== undefined;
        if (!hasMid || !hasEnd) return false;
      } else if (examFilter === 'Mid-Sem') {
        const hasMid = s.midsemMarks !== null && s.midsemMarks !== undefined;
        if (!hasMid) return false;
      } else if (examFilter === 'End-Sem') {
        const hasEnd = s.endsemMarks !== null && s.endsemMarks !== undefined;
        if (!hasEnd) return false;
      }
      return true;
    });
  }, [subjects, semesterFilter, examFilter]);

  const midCount = subjects.filter((s) => s.midsemMarks !== null && s.midsemMarks !== undefined).length;
  const endCount = subjects.filter((s) => s.endsemMarks !== null && s.endsemMarks !== undefined).length;

  return (
    <div className="space-y-6">
      {/* Semester Course Selection Workspace */}
      <SemesterSubjectSelector
        enrolledSubjects={subjects}
        currentSemester={profile.semester}
        studentCourse={profile.course}
        onEnrollSubject={onEnrollSubject}
        onEnrollAsBacklog={onEnrollAsBacklog}
        onEnrollAllForSemester={onEnrollAllForSemester}
        onRemoveSubject={onDeleteSubject}
        onEditSubject={onOpenEditSubject}
        onOpenCustomModal={onOpenAddSubject}
        onClearAllSubjects={onClearAllSubjects}
      />

      {/* Top Banner with Manual Builder Action */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_6px_20px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Academic Subjects & Examination Marks</h3>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#fdeedc] text-[#8a4816]">
              {subjects.length} Enrolled
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Build your academic profile: select your semester subjects and enter your Mid-Sem and End-Sem marks.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenAddSubject}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#13141b] text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer shadow-sm"
          >
            <Plus size={15} /> Select Subject & Enter Marks
          </button>
        </div>
      </div>

      {/* Filter Bar with Semester Dropdown & Exam Dropdown */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_4px_14px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Semester Filter Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
              <Filter size={13} className="text-slate-400" />
              Semester:
            </label>
            <div className="relative">
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none cursor-pointer focus:bg-white"
              >
                <option value="All">All Semesters ({subjects.length})</option>
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Semester 3">Semester 3</option>
                <option value="Semester 4">Semester 4</option>
                <option value="Semester 5">Semester 5</option>
                <option value="Semester 6">Semester 6</option>
                <option value="Odd">Odd Semesters (1, 3, 5)</option>
                <option value="Even">Even Semesters (2, 4, 6)</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Examination Filter Dropdown (explicitly requested) */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
              <BookOpen size={13} className="text-slate-400" />
              Exam Type:
            </label>
            <div className="relative">
              <select
                value={examFilter}
                onChange={(e) => setExamFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none cursor-pointer focus:bg-white"
              >
                <option value="All">All Examinations</option>
                <option value="Both">Both Mid-Sem & End-Sem</option>
                <option value="Mid-Sem">Mid-Semester Exam ({midCount})</option>
                <option value="End-Sem">End-Semester Exam ({endCount})</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-semibold">
          Showing <strong>{filteredSubjects.length}</strong> of <strong>{subjects.length}</strong> subjects
        </div>
      </div>

      {/* Subjects Rows */}
      <div className="space-y-3.5">
        {filteredSubjects.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#fdeedc] text-[#8a4816] flex items-center justify-center font-bold mx-auto">
              <BookOpen size={22} />
            </div>
            <h4 className="font-extrabold text-sm text-slate-800">No subjects found for this selection</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Select your semester and add subjects to record your Mid-Semester and End-Semester marks.
            </p>
            <button
              onClick={onOpenAddSubject}
              className="mt-2 px-5 py-2.5 bg-[#13141b] text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
            >
              + Add / Select Subject Now
            </button>
          </div>
        ) : (
          filteredSubjects.map((sub) => {
            const hasMid = sub.midsemMarks !== null && sub.midsemMarks !== undefined;
            const hasEnd = sub.endsemMarks !== null && sub.endsemMarks !== undefined;

            return (
              <div
                key={sub.code || sub.id}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_16px_rgb(0,0,0,0.02)] hover:border-slate-200 hover:shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left Section: Subject Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-black text-sm text-slate-900 tracking-tight font-mono">{sub.code}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${sub.semesterType === 'Odd' ? 'bg-[#fdeedc] text-[#8a4816]' : 'bg-[#e9f2fc] text-[#1e40af]'}`}>
                      {sub.semester} ({sub.semesterType} Sem)
                    </span>
                    {sub.type && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {sub.type}
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                      {hasMid && hasEnd ? 'Mid & End-Sem' : hasMid ? 'Mid-Sem' : 'End-Sem'}
                    </span>
                    {(sub.isRepeat || sub.enrollmentType?.includes('Repeat')) && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-[#8a4816] font-semibold">
                        Repeat: {sub.repeatExamStatus || 'Preparing'}
                      </span>
                    )}
                    {(sub.isBacklog || sub.endsemStatus?.includes('Backlog')) && !sub.isRepeat && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        Backlog
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 tracking-tight truncate">{sub.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Faculty In-charge: <strong className="text-slate-700">{sub.faculty}</strong>
                  </p>
                </div>

                {/* Middle: Assessment Scores & Repeat Status */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0 flex-wrap">
                  {/* Mid-Sem Box */}
                  <div className="px-3.5 py-2.5 rounded-2xl bg-[#f6f7fa] border border-slate-100 min-w-[130px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mid-Sem</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${hasMid && Number(sub.midsemMarks) >= 20 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                        {sub.midsemStatus || (hasMid ? 'Passed' : 'Pending')}
                      </span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="font-black text-slate-900 text-sm">
                        {hasMid ? sub.midsemMarks : '—'}
                      </span>
                      <span className="text-slate-400 text-xs">/ {sub.midsemMax || 50} Marks</span>
                    </div>
                  </div>

                  {/* End-Sem Box */}
                  <div className="px-3.5 py-2.5 rounded-2xl bg-[#fbf9fe] border border-[#f1e5fa] min-w-[130px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-[#6b21a8] uppercase tracking-wider">End-Sem</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${hasEnd && Number(sub.endsemMarks) >= 40 ? 'text-blue-600 bg-blue-50' : 'text-slate-500 bg-slate-100'}`}>
                        {sub.endsemStatus || (hasEnd ? 'Eligible' : 'Pending')}
                      </span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="font-black text-slate-900 text-sm">
                        {hasEnd ? sub.endsemMarks : '—'}
                      </span>
                      <span className="text-slate-400 text-xs">/ {sub.endsemMax || 100} Marks</span>
                    </div>
                  </div>

                  {/* Repeat Status Box */}
                  {(sub.isRepeat || sub.isBacklog || sub.enrollmentType?.includes('Repeat') || sub.endsemStatus?.includes('Backlog')) && (
                    <div className="px-3.5 py-2.5 rounded-2xl bg-[#fffbf0] border border-[#f5e1a4] min-w-[130px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-[#8a4816] uppercase tracking-wider">Repeat Exam</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-[#8a4816]">
                          {sub.repeatExamStatus || 'Preparing'}
                        </span>
                      </div>
                      <div className="mt-1 text-slate-800 font-extrabold text-xs">
                        {sub.isRepeat ? 'Repeat Paper' : 'Backlog Retest'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                  <button
                    onClick={() => onOpenEditSubject(sub)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#fdeedc] text-[#8a4816] hover:bg-[#fadab6] transition cursor-pointer whitespace-nowrap shadow-xs"
                    title="Edit Marks and Subject Details"
                  >
                    <Edit3 size={13} /> Edit Marks
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Remove subject ${sub.code} (${sub.name}) from your enrolled list?`)) {
                        onDeleteSubject(sub.code);
                      }
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Remove Subject from Profile"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// =============================================================
// TAB 3: BACKLOG TRACKING & STUDENT PROGRESS UPDATES
// =============================================================
function StudentBacklogsTab({
  studentProfile,
  backlogRecords = [],
  setBacklogRecords,
  openApplyModal,
  triggerToast,
  onOpenCertificate
}) {
  const [cycleFilter, setCycleFilter] = useState('All'); // 'All', 'Odd', 'Even'
  const [viewFilter, setViewFilter] = useState('my'); // 'my' or 'all'

  // Modal for editing student progress
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({
    metTeacher: false,
    assignmentsCompleted: 'Completed',
    teacherConsultation: 'Pending Guidance',
    repeatExamStatus: 'Preparing',
    resultStatus: 'Awaiting result',
    studentRemarks: ''
  });

  // Modal for adding new backlog paper
  const [isAddBacklogModalOpen, setIsAddBacklogModalOpen] = useState(false);
  const [newBacklog, setNewBacklog] = useState({
    subjectCode: 'BCA202',
    subjectName: 'Discrete Mathematics',
    backlogReason: 'Repeat due to Marks',
    otherReason: '',
    originalMarks: 0,
    maxMarks: 100,
    studentRemarks: ''
  });

  // Filter records
  const myRecords = useMemo(() => {
    return backlogRecords.filter(
      (b) =>
        b.studentName.toLowerCase() === studentProfile.name.toLowerCase() ||
        b.usn.toLowerCase() === studentProfile.usn.toLowerCase()
    );
  }, [backlogRecords, studentProfile]);

  const displayedRecords = viewFilter === 'my' && myRecords.length > 0 ? myRecords : backlogRecords;

  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    setEditForm({
      metTeacher: record.metTeacher,
      assignmentsCompleted: record.assignmentsCompleted || 'Completed',
      teacherConsultation: record.teacherConsultation || 'Pending Guidance',
      repeatExamStatus: record.repeatExamStatus || 'Preparing',
      resultStatus: record.resultStatus || 'Awaiting result',
      studentRemarks: record.studentRemarks || ''
    });
  };

  const handleSaveProgress = (e) => {
    e.preventDefault();
    if (!editingRecord) return;

    const payload = {
      metTeacher: editForm.metTeacher,
      assignmentsCompleted: editForm.assignmentsCompleted,
      teacherConsultation: editForm.metTeacher ? 'Completed' : editForm.teacherConsultation,
      repeatExamStatus: editForm.repeatExamStatus,
      resultStatus: editForm.resultStatus,
      studentRemarks: editForm.studentRemarks
    };

    const updated = updateStudentBacklogProgress(editingRecord.id, payload);
    if (setBacklogRecords) setBacklogRecords(updated);
    triggerToast(`Progress report updated for ${editingRecord.subjectCode}! Teacher will review your submission.`);
    setEditingRecord(null);
  };

  const handleCreateBacklog = (e) => {
    e.preventDefault();
    const finalReason = newBacklog.backlogReason === 'Repeat due to Other Reasons'
      ? (newBacklog.otherReason?.trim() ? `Other: ${newBacklog.otherReason.trim()}` : 'Repeat due to Other Reasons')
      : newBacklog.backlogReason;

    const newRecord = {
      id: `BL-${Date.now().toString().slice(-4)}`,
      studentId: studentProfile.usn || 'STU-01',
      studentName: studentProfile.name,
      usn: studentProfile.usn,
      semester: studentProfile.semester || 'Sem 3 (Odd)',
      subjectCode: newBacklog.subjectCode,
      subjectName: newBacklog.subjectName,
      backlogReason: finalReason,
      reason: finalReason,
      originalMarks: newBacklog.originalMarks !== '' && newBacklog.originalMarks !== undefined ? Number(newBacklog.originalMarks) : 0,
      maxMarks: 100,
      clearanceStatus: 'In Review',
      metTeacher: false,
      assignmentsCompleted: 'Pending',
      teacherConsultation: 'Pending Guidance',
      repeatExamStatus: 'Preparing',
      resultStatus: 'Awaiting result',
      studentRemarks: newBacklog.studentRemarks || 'Registered backlog paper for repeat examination.',
      lastUpdated: 'Just now',
      facultyClearedDate: null,
      facultyNotes: null
    };

    const updated = [newRecord, ...backlogRecords];
    saveBacklogRecords(updated);
    if (setBacklogRecords) setBacklogRecords(updated);
    triggerToast(`Added ${newBacklog.subjectCode} to your backlog tracking!`);
    setIsAddBacklogModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#fdeedc] border border-[#fcd7b5] rounded-3xl p-5 shadow-[0_6px_20px_rgba(250,238,220,0.4)]">
          <span className="text-[11px] font-bold text-[#8a4816] uppercase tracking-wide">Tracked Backlog Papers</span>
          <div className="text-2xl font-black text-[#2c1d11] mt-1">{displayedRecords.length} Subjects</div>
          <p className="text-[11px] text-[#8a4816] mt-1">Subjects requiring repeat examination</p>
        </div>

        <div className="bg-[#fef3c7]/70 border border-[#fde68a] rounded-3xl p-5 shadow-[0_6px_20px_rgba(254,243,199,0.4)]">
          <span className="text-[11px] font-bold text-[#b45309] uppercase tracking-wide">Teacher Consultations</span>
          <div className="text-2xl font-black text-[#92400e] mt-1">
            {displayedRecords.filter((b) => b.metTeacher).length} / {displayedRecords.length}
          </div>
          <p className="text-[11px] text-[#b45309] mt-1">Subject teachers met for guidance</p>
        </div>

        <div className="bg-[#e0f2fe]/70 border border-[#bae6fd] rounded-3xl p-5 shadow-[0_6px_20px_rgba(224,242,254,0.4)]">
          <span className="text-[11px] font-bold text-[#0369a1] uppercase tracking-wide">Repeat Exam Prep</span>
          <div className="text-2xl font-black text-[#075985] mt-1">
            {displayedRecords.filter((b) => b.repeatExamStatus === 'Preparing' || b.repeatExamStatus === 'Scheduled').length} Papers
          </div>
          <p className="text-[11px] text-[#0369a1] mt-1">Scheduled or under preparation</p>
        </div>

        <div className="bg-[#e7f6ee] border border-[#bce8ce] rounded-3xl p-5 shadow-[0_6px_20px_rgba(231,246,238,0.4)]">
          <span className="text-[11px] font-bold text-[#166534] uppercase tracking-wide">Cleared Backlogs</span>
          <div className="text-2xl font-black text-[#133722] mt-1">
            {displayedRecords.filter((b) => b.clearanceStatus === 'Cleared').length} Cleared
          </div>
          <p className="text-[11px] text-[#166534] mt-1">Certified cleared by faculty</p>
        </div>
      </div>

      {/* Action and Switcher Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_6px_20px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-base text-slate-900">Backlog Subjects & Student Updates</h3>
          <p className="text-xs text-slate-500">
            Submit regular progress updates to faculty for teacher meetings, assignments, exam preparation, and results.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {myRecords.length > 0 && (
            <div className="flex items-center gap-1 p-1 bg-[#f6f7fa] rounded-2xl text-xs font-bold">
              <button
                onClick={() => setViewFilter('my')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${viewFilter === 'my' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                My Backlogs ({myRecords.length})
              </button>
              <button
                onClick={() => setViewFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${viewFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                All Subjects ({backlogRecords.length})
              </button>
            </div>
          )}

          <button
            onClick={() => setIsAddBacklogModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#13141b] text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Plus size={15} /> Add Backlog Subject
          </button>
        </div>
      </div>

      {/* Backlog Subjects Cards */}
      <div className="space-y-4">
        {displayedRecords.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2" />
            <h4 className="font-extrabold text-base text-slate-900">Zero Active Backlogs!</h4>
            <p className="text-xs text-slate-400 mt-1">All examination subjects have been cleared successfully.</p>
          </div>
        ) : (
          displayedRecords.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-start justify-between gap-6"
            >
              {/* Left Column: Subject and Update Fields */}
              <div className="space-y-3 flex-1">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-extrabold text-lg text-slate-900">{item.subjectName}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#fdeedc] text-[#8a4816]">
                      {item.subjectCode}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">({item.semester})</span>
                    <span className="text-xs text-slate-400 font-mono">• Candidate: {item.studentName} ({item.usn})</span>
                  </div>

                  {/* Status Pills */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${item.backlogReason.includes('Attendance')
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                      Reason: {item.backlogReason}
                    </span>

                    {item.meetingRequired && !item.metTeacher ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 animate-pulse">
                        <AlertTriangle size={11} className="text-rose-600" />
                        Meeting Required by {item.meetingDeadline} {item.meetingDeadlineTime ? `(${item.meetingDeadlineTime})` : ''}
                      </span>
                    ) : !item.metTeacher ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fef3c7] text-[#b45309] border border-[#fde68a]">
                        Teacher meeting pending
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e7f6ee] text-[#166534] border border-[#bce8ce]">
                        Teacher meeting: Completed
                      </span>
                    )}

                    {item.resultStatus === 'Awaiting result' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
                        Awaiting result
                      </span>
                    ) : item.resultStatus === 'Cleared' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e7f6ee] text-[#166534] border border-[#bce8ce]">
                        Result: Cleared ✓
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Result: Not cleared
                      </span>
                    )}

                    {item.clearanceStatus === 'Cleared' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e7f6ee] text-[#166534] border border-[#bce8ce] flex items-center gap-1">
                        <CheckCircle2 size={11} /> Faculty Clearance Confirmed
                      </span>
                    )}
                  </div>
                </div>

                {/* 5-Stage Visual Resolution Stepper */}
                <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-100">
                  <RecordFunnelStepper record={item} />
                </div>

                {/* 7 Update Fields Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div className="p-3 rounded-2xl bg-[#fbfbfd] border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Met Subject Teacher</span>
                    <strong className={`block mt-0.5 ${item.metTeacher ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {item.metTeacher ? 'Yes, Met Teacher' : 'No / Pending'}
                    </strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#fbfbfd] border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Assignments Completed</span>
                    <strong className={`block mt-0.5 ${item.assignmentsCompleted === 'Completed' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {item.assignmentsCompleted}
                    </strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#fbfbfd] border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Teacher Consultation</span>
                    <strong className={`block mt-0.5 ${item.teacherConsultation === 'Completed' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {item.teacherConsultation}
                    </strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#fbfbfd] border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Repeat Exam Status</span>
                    <strong className="text-[#1e40af] block mt-0.5">
                      {item.repeatExamStatus}
                    </strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#fbfbfd] border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Result Status</span>
                    <strong className={`block mt-0.5 ${item.resultStatus === 'Cleared' ? 'text-emerald-700' : item.resultStatus === 'Awaiting result' ? 'text-blue-700' : 'text-rose-700'}`}>
                      {item.resultStatus}
                    </strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#fbfbfd] border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Last Updated</span>
                    <strong className="text-slate-700 block mt-0.5 flex items-center gap-1 font-mono text-[11px]">
                      <Clock size={11} className="text-slate-400" /> {item.lastUpdated}
                    </strong>
                  </div>
                </div>

                {/* Mandatory Faculty Meeting Alert Notice */}
                {item.meetingRequired && !item.metTeacher && (
                  <div className="p-3.5 bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 rounded-2xl border border-rose-200 text-xs shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 font-extrabold text-rose-900">
                        <AlertTriangle size={15} className="text-rose-600 shrink-0 animate-bounce" />
                        <span>MANDATORY FACULTY CONSULTATION NOTICE</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-900">
                          Deadline: {item.meetingDeadline} {item.meetingDeadlineTime || ''}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-rose-800 bg-white/80 px-2 py-0.5 rounded-lg border border-rose-200">
                        Venue: {item.meetingCabinLocation || 'Faculty Cabin'}
                      </span>
                    </div>
                    <p className="text-rose-950 font-medium italic text-[11px] leading-relaxed">
                      &quot;{item.meetingWarningMessage}&quot;
                    </p>
                    <div className="text-[10px] text-rose-800 font-semibold flex items-center justify-between flex-wrap gap-1 pt-0.5">
                      <span>Issued by: {item.meetingRequestedBy || 'Faculty Advisor'}</span>
                      <span className="text-rose-700 font-bold">Please report to cabin in-person before deadline date</span>
                    </div>
                  </div>
                )}

                {/* Latest Remarks Quote */}
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Latest Progress Remarks:</span>
                  <p className="text-xs text-slate-800 italic leading-relaxed font-medium">
                    &quot;{item.studentRemarks}&quot;
                  </p>
                </div>

                {/* Enhanced Faculty Guidance Display */}
                {item.facultyNotes && (
                  <div className="p-3.5 bg-gradient-to-r from-[#fefbf6] to-[#fdeedc]/50 rounded-2xl border border-[#fcd7b5] text-xs space-y-1 shadow-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-[#8a4816] flex items-center gap-1.5">
                        <Sparkles size={13} /> Faculty Guidance & Advice ({item.facultyAuthor || 'Faculty Advisor'})
                      </span>
                      {item.facultyNotesDate && (
                        <span className="text-[10px] text-slate-400 font-mono">{item.facultyNotesDate}</span>
                      )}
                    </div>
                    <p className="text-slate-800 font-medium leading-relaxed italic">
                      &quot;{item.facultyNotes}&quot;
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Update Button & Certificate Download */}
              <div className="flex flex-row lg:flex-col items-end gap-2.5 shrink-0 pt-2 lg:pt-0">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="px-4 py-2.5 bg-[#13141b] text-white hover:bg-slate-800 rounded-2xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <Edit3 size={14} className="text-[#f5caa0]" /> Update Progress Report
                </button>

                {item.clearanceStatus === 'Cleared' && (
                  <button
                    onClick={() => onOpenCertificate && onOpenCertificate(item)}
                    className="px-4 py-2.5 bg-[#e7f6ee] text-[#166534] hover:bg-[#d8f0e2] border border-[#bce8ce] rounded-2xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <Award size={14} /> Official Certificate
                  </button>
                )}

                {item.clearanceStatus === 'Cleared' ? (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCheck size={14} /> Backlog Cleared
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">
                    In Review by Faculty
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Update Student Backlog Progress */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#fdeedc] text-[#8a4816] flex items-center justify-center font-bold">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Update Progress Report</h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {editingRecord.subjectCode} - {editingRecord.subjectName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProgress} className="space-y-4 text-xs">
              {/* Field 1: Met Subject Teacher */}
              <div className="p-3.5 bg-slate-50 rounded-2xl flex items-center justify-between">
                <div>
                  <label className="font-bold text-slate-800 block">Met Subject Teacher</label>
                  <p className="text-[11px] text-slate-500">Whether you have met the relevant teacher for this backlog</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.metTeacher}
                    onChange={(e) => setEditForm({ ...editForm, metTeacher: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#166534]"></div>
                </label>
              </div>

              {/* Field 2 & 3: Assignments & Teacher Consultation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assignments Completed</label>
                  <select
                    value={editForm.assignmentsCompleted}
                    onChange={(e) => setEditForm({ ...editForm, assignmentsCompleted: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#f6f7fa] border border-slate-200 text-xs text-slate-800 font-medium outline-none"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending / In Progress</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Teacher Consultation</label>
                  <select
                    value={editForm.teacherConsultation}
                    onChange={(e) => setEditForm({ ...editForm, teacherConsultation: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#f6f7fa] border border-slate-200 text-xs text-slate-800 font-medium outline-none"
                  >
                    <option value="Completed">Guidance Received / Visited</option>
                    <option value="Pending Guidance">Pending Guidance</option>
                  </select>
                </div>
              </div>

              {/* Field 4 & 5: Repeat Exam Status & Result Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Repeat Exam Status</label>
                  <select
                    value={editForm.repeatExamStatus}
                    onChange={(e) => setEditForm({ ...editForm, repeatExamStatus: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#f6f7fa] border border-slate-200 text-xs text-slate-800 font-medium outline-none"
                  >
                    <option value="Not started">Not started</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Appeared">Appeared</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Result Status</label>
                  <select
                    value={editForm.resultStatus}
                    onChange={(e) => setEditForm({ ...editForm, resultStatus: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#f6f7fa] border border-slate-200 text-xs text-slate-800 font-medium outline-none"
                  >
                    <option value="Awaiting result">Awaiting result</option>
                    <option value="Cleared">Cleared</option>
                    <option value="Not cleared">Not cleared</option>
                  </select>
                </div>
              </div>

              {/* Field 6: Student Remarks */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Student Remarks (Explanation or latest progress)
                </label>
                <textarea
                  rows={3}
                  required
                  value={editForm.studentRemarks}
                  onChange={(e) => setEditForm({ ...editForm, studentRemarks: e.target.value })}
                  placeholder="Explain your latest progress, units completed, or guidance received from teacher..."
                  className="w-full p-3 rounded-2xl bg-[#f6f7fa] border border-slate-200 text-xs text-slate-900 outline-none focus:bg-white focus:border-slate-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#13141b] hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Send size={14} className="text-[#f5caa0]" /> Save & Submit to Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Register New Backlog Subject */}
      {isAddBacklogModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#13141b] text-white flex items-center justify-center font-bold text-xs">
                  <Plus size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Register Backlog Subject</h4>
                  <p className="text-[11px] text-slate-500">Track an active backlog paper for repeat examination</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddBacklogModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBacklog} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject Code</label>
                <input
                  type="text"
                  required
                  value={newBacklog.subjectCode}
                  onChange={(e) => setNewBacklog({ ...newBacklog, subjectCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. BCA202"
                  className="w-full p-2.5 rounded-xl bg-[#f6f7fa] border border-slate-200 outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={newBacklog.subjectName}
                  onChange={(e) => setNewBacklog({ ...newBacklog, subjectName: e.target.value })}
                  placeholder="e.g. Discrete Mathematics"
                  className="w-full p-2.5 rounded-xl bg-[#f6f7fa] border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Backlog</label>
                <select
                  value={newBacklog.backlogReason}
                  onChange={(e) => setNewBacklog({ ...newBacklog, backlogReason: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#f6f7fa] border border-slate-200 outline-none font-medium"
                >
                  <option value="Repeat due to Attendance">Repeat due to Attendance</option>
                  <option value="Repeat due to Marks">Repeat due to Marks</option>
                  <option value="Repeat due to Other Reasons">Repeat due to Other Reasons</option>
                </select>
              </div>

              {newBacklog.backlogReason === 'Repeat due to Other Reasons' && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block mb-1">
                    Specify Reason for Backlog (Other) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={newBacklog.otherReason || ''}
                    onChange={(e) => setNewBacklog({ ...newBacklog, otherReason: e.target.value })}
                    placeholder="Write reason of giving backlog in others..."
                    className="w-full p-2.5 rounded-xl bg-white border border-amber-300 text-xs text-slate-900 outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Initial Remarks / Plan</label>
                <textarea
                  rows={2}
                  value={newBacklog.studentRemarks}
                  onChange={(e) => setNewBacklog({ ...newBacklog, studentRemarks: e.target.value })}
                  placeholder="Briefly describe your re-exam preparation plan..."
                  className="w-full p-2.5 rounded-xl bg-[#f6f7fa] border border-slate-200 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddBacklogModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#13141b] hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer shadow-md"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolution Pipeline Visualizer */}
      <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <h4 className="font-extrabold text-base text-slate-900 mb-1">Standard Backlog Resolution Workflow</h4>
        <p className="text-xs text-slate-500 mb-6">Step-by-step examination and backlog resolution procedure</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#fdeedc]/60 border border-[#fcd7b5]">
            <span className="w-6 h-6 rounded-full bg-[#f7d6b8] text-[#8a4816] flex items-center justify-center font-bold text-xs mb-2">1</span>
            <span className="font-bold text-[#8a4816] block">Teacher Meeting & Guidance</span>
            <p className="text-[11px] text-slate-500 mt-1">Request 1-on-1 cabin consultation via BackTrack portal and review backlog progress with your teacher.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f4e8fd]/60 border border-[#e8c7fb]">
            <span className="w-6 h-6 rounded-full bg-[#eccffc] text-[#6b21a8] flex items-center justify-center font-bold text-xs mb-2">2</span>
            <span className="font-bold text-[#6b21a8] block">Faculty Consultation & Sign-Off</span>
            <p className="text-[11px] text-slate-500 mt-1">Assigned subject faculty verifies assignments, consults with student, and confirms clearance eligibility.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#e7f6ee]/60 border border-[#bce8ce]">
            <span className="w-6 h-6 rounded-full bg-[#cceed7] text-[#166534] flex items-center justify-center font-bold text-xs mb-2">3</span>
            <span className="font-bold text-[#166534] block">Fee & Hall Ticket</span>
            <p className="text-[11px] text-slate-500 mt-1">Accounts department issues End-Semester re-exam hall ticket after clearance.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#e9f2fc]/60 border border-[#bedafb]">
            <span className="w-6 h-6 rounded-full bg-[#d3e5fa] text-[#1e40af] flex items-center justify-center font-bold text-xs mb-2">4</span>
            <span className="font-bold text-[#1e40af] block">Result Re-issue</span>
            <p className="text-[11px] text-slate-500 mt-1">Updated grade card and backlog clearance certificate generated.</p>
          </div>
        </div>
      </div>

      {/* Cleared Semester Transcripts with Even / Odd Cycle Filter */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="font-extrabold text-base text-slate-900">Cleared Semester History</h4>
            <p className="text-xs text-slate-500">Official university examination cycles</p>
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-[#f6f7fa] rounded-2xl">
            <button
              onClick={() => setCycleFilter('All')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${cycleFilter === 'All' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
            >
              All Cycles
            </button>
            <button
              onClick={() => setCycleFilter('Odd')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${cycleFilter === 'Odd' ? 'bg-[#fdeedc] text-[#8a4816] shadow-xs' : 'text-slate-500'}`}
            >
              Odd Cycle (Winter)
            </button>
            <button
              onClick={() => setCycleFilter('Even')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${cycleFilter === 'Even' ? 'bg-[#e9f2fc] text-[#1e40af] shadow-xs' : 'text-slate-500'}`}
            >
              Even Cycle (Spring)
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {(cycleFilter === 'All' || cycleFilter === 'Odd') && (
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 block">Semester 1 Examinations (Winter 2025)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fdeedc] text-[#8a4816]">
                    Odd Semester Cycle
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">Total 5 Subjects • 20 Credits • SGPA: 8.65 • Midsem & Endsem Cleared</span>
              </div>
              <button
                onClick={() => triggerToast('Semester 1 Grade Card downloaded!')}
                className="text-xs font-bold text-[#6b21a8] hover:underline cursor-pointer"
              >
                Download Marks Card
              </button>
            </div>
          )}

          {(cycleFilter === 'All' || cycleFilter === 'Even') && (
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 block">Semester 2 Examinations (Spring 2026)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e9f2fc] text-[#1e40af]">
                    Even Semester Cycle
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">Total 5 Subjects • 20 Credits • SGPA: 8.82 • Midsem & Endsem Cleared</span>
              </div>
              <button
                onClick={() => triggerToast('Semester 2 Grade Card downloaded!')}
                className="text-xs font-bold text-[#6b21a8] hover:underline cursor-pointer"
              >
                Download Marks Card
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================
// TAB 4: TEACHER MEETINGS & CONSULTATIONS
// =============================================================
function StudentRequestsTab({ requests, openApplyModal }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_6px_20px_rgba(0,0,0,0.02)] flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-base text-slate-900">Teacher Meetings & Consultations</h3>
          <p className="text-xs text-slate-500">Track 1-on-1 cabin consultations, meeting slots, and faculty guidance</p>
        </div>
        <button
          onClick={openApplyModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#13141b] text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
        >
          <Plus size={15} /> Request Teacher Meet
        </button>
      </div>

      <div className="space-y-4">
        {requests.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col md:flex-row md:items-start justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-sm text-slate-900">{r.type}</span>
                {r.slot && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fdeedc] text-[#8a4816]">
                    {r.slot}
                  </span>
                )}
                {r.teacher && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center gap-1">
                    <span>👨‍🏫</span> {r.teacher.split('—')[0].trim()}
                  </span>
                )}
                {r.semesterCycle && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.semesterCycle.includes('Odd') ? 'bg-[#fdeedc] text-[#8a4816]' : 'bg-[#e9f2fc] text-[#1e40af]'}`}>
                    {r.semesterCycle}
                  </span>
                )}
                {r.subject && r.subject !== 'General Consultation / Not Specified' && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    📚 {r.subject}
                  </span>
                )}
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${r.status === 'Approved' ? 'bg-[#e7f6ee] text-[#166534]' : 'bg-amber-50 text-amber-700'}`}>
                  {r.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-3 rounded-2xl max-w-xl">
                <strong>Discussion Agenda:</strong> &ldquo;{r.reason}&rdquo;
              </p>

              {r.facultyResponse && (
                <p className="text-xs text-[#6b21a8] mt-2 bg-[#f4e8fd]/40 p-3 rounded-2xl max-w-xl border border-[#e8c7fb]">
                  <strong>Teacher Feedback:</strong> {r.facultyResponse}
                </p>
              )}

              <span className="text-[10px] text-slate-400 block mt-2">Requested: {r.date}</span>
            </div>

            <div className="shrink-0">
              <span className="text-[11px] font-mono text-slate-400 font-bold">{r.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================
// TAB 5: STUDENT NOTIFICATIONS
// =============================================================
function StudentNotificationsTab({ notifications, setNotifications, triggerToast }) {
  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    try {
      const allNotifs = getNotifications();
      const updatedAll = allNotifs.map((n) =>
        n.targetRole === 'student' || n.targetUsn === (notifications[0]?.targetUsn || '')
          ? { ...n, read: true }
          : n
      );
      saveNotifications(updatedAll);
    } catch {}
    triggerToast('All announcements marked as read!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_6px_20px_rgba(0,0,0,0.02)] flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-base text-slate-900">Campus Circulars & Alerts</h3>
          <p className="text-xs text-slate-500">Official updates from Exam Cell, Department Head, and Class Faculty</p>
        </div>
        <button onClick={markAllRead} className="text-xs font-bold text-[#8a4816] hover:underline">
          Mark all read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`
              p-5 rounded-3xl border transition-all flex items-start justify-between gap-4
              ${n.read ? 'bg-white border-slate-100' : 'bg-[#fdeedc]/30 border-[#fcd7b5] shadow-xs'}
            `}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#fdeedc] text-[#8a4816] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                <Bell size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-xs text-slate-900">{n.title}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {n.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.body}</p>
                <span className="text-[10px] text-slate-400 mt-2 block">{n.time}</span>
              </div>
            </div>

            {!n.read && <span className="w-2.5 h-2.5 rounded-full bg-[#8a4816] shrink-0 mt-2"></span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================
// TAB 6: STUDENT PROFILE & SETTINGS
// =============================================================
function StudentProfileSettingsTab({ profile, setProfile, setSubjects, triggerToast, onOpenAddSubject }) {
  const [profileForm, setProfileForm] = useState({
    name: profile.name,
    usn: profile.usn,
    email: sanitizeEmail(profile.email),
    phone: profile.phone,
    course: profile.course || 'Bachelor of Computer Applications (BCA)',
    academicYear: profile.academicYear || '1st Year',
    semester: profile.semester || 'Semester 1'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const getSemesterOptions = (year) => {
    if (year === '1st Year') return ['Semester 1', 'Semester 2'];
    if (year === '2nd Year') return ['Semester 3', 'Semester 4'];
    if (year === '3rd Year') return ['Semester 5', 'Semester 6'];
    if (year === '4th Year') return ['Semester 7', 'Semester 8'];
    return ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];
  };

  const handleYearChange = (newYear) => {
    let nextSem = profileForm.semester;
    if (newYear === '1st Year' && !['Semester 1', 'Semester 2'].includes(nextSem)) {
      nextSem = 'Semester 1';
    } else if (newYear === '2nd Year' && !['Semester 3', 'Semester 4'].includes(nextSem)) {
      nextSem = 'Semester 3';
    } else if (newYear === '3rd Year' && !['Semester 5', 'Semester 6'].includes(nextSem)) {
      nextSem = 'Semester 5';
    } else if (newYear === '4th Year' && !['Semester 7', 'Semester 8'].includes(nextSem)) {
      nextSem = 'Semester 7';
    }
    setProfileForm({ ...profileForm, academicYear: newYear, semester: nextSem });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const cleanMail = sanitizeEmail(profileForm.email);
    const newEnrolled = getCurriculumSubjectsForYearAndSem(
      profileForm.course,
      profileForm.academicYear,
      profileForm.semester
    );
    const updated = {
      ...profile,
      ...profileForm,
      email: cleanMail,
      enrolledSubjects: newEnrolled
    };
    setProfile(updated);
    if (setSubjects) {
      setSubjects(newEnrolled);
    }
    try {
      const stored = localStorage.getItem('currentUser');
      const u = stored ? JSON.parse(stored) : {};
      localStorage.setItem(
        'currentUser',
        JSON.stringify({
          ...u,
          name: profileForm.name,
          id: profileForm.usn,
          usn: profileForm.usn,
          email: cleanMail,
          course: profileForm.course,
          academicYear: profileForm.academicYear,
          semester: profileForm.semester,
          enrolledSubjects: newEnrolled
        })
      );
      const allStudents = getStudents();
      const sIdx = allStudents.findIndex((s) => s.usn === profile.usn || s.id === profile.usn);
      if (sIdx !== -1) {
        allStudents[sIdx] = {
          ...allStudents[sIdx],
          name: profileForm.name,
          usn: profileForm.usn,
          id: profileForm.usn,
          email: cleanMail,
          course: profileForm.course,
          academicYear: profileForm.academicYear,
          semester: profileForm.semester,
          enrolledSubjects: newEnrolled
        };
        localStorage.setItem('backtrack_registered_students', JSON.stringify(allStudents));
      }
    } catch { }
    triggerToast(`Profile updated! Enrolled in ${newEnrolled.length} curriculum subjects for ${profileForm.academicYear}.`);
  };

  const handlePassword = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      triggerToast('New password and confirmation do not match.');
      return;
    }
    triggerToast('Student portal password changed successfully!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Student Academic Card */}
      <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-3xl bg-[#fdeedc] text-[#8a4816] flex items-center justify-center font-black text-2xl shadow-inner">
            {profile.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">{profile.name}</h3>
            <p className="text-xs text-slate-500 font-mono">USN: <strong>{profile.usn}</strong> • {profile.section || 'Section A'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#e7f6ee] text-[#166534] inline-block">
                {profile.course}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#fdeedc] text-[#8a4816] inline-block">
                {profileForm.academicYear} • {profileForm.semester}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="mt-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Student Name</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Student University ID / USN</label>
              <input
                type="text"
                required
                value={profileForm.usn}
                onChange={(e) => setProfileForm({ ...profileForm, usn: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Student University Email</label>
              <input
                type="email"
                required
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                placeholder="name@univ.edu or name@gmail.com"
                pattern="^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                title="Please enter a valid email format, e.g. student@univ.edu"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
              <input
                type="text"
                required
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Degree Program</label>
              <select
                value={profileForm.course}
                onChange={(e) => setProfileForm({ ...profileForm, course: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white text-xs font-semibold"
              >
                <option value="Bachelor of Computer Applications (BCA)">Bachelor of Computer Applications (BCA)</option>
                <option value="B.Tech Computer Science & Engineering">B.Tech Computer Science & Engineering</option>
                <option value="B.Sc Information Technology">B.Sc Information Technology</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Academic Year</label>
              <select
                value={profileForm.academicYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white text-xs font-semibold"
              >
                <option value="1st Year">1st Year (Freshman)</option>
                <option value="2nd Year">2nd Year (Sophomore)</option>
                <option value="3rd Year">3rd Year (Junior)</option>
                <option value="4th Year">4th Year (Final Year)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Current Active Semester</label>
              <select
                value={profileForm.semester}
                onChange={(e) => setProfileForm({ ...profileForm, semester: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white text-xs font-semibold"
              >
                {getSemesterOptions(profileForm.academicYear).map((sem) => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/50 flex items-start gap-2.5 text-slate-700">
            <Sparkles size={16} className="text-[#8a4816] shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Curriculum Auto-Assignment:</strong> Updating your Academic Year or Semester will automatically enroll you in all corresponding subjects for that year (e.g., selecting 3rd Year loads 3rd Year Semester 5 & Semester 6 subjects).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f8f9fa] border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h5 className="font-extrabold text-xs text-slate-900">Custom Subject & Marks Profile Builder</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Manually choose your semester subjects and enter your Mid-Sem & End-Sem marks.
              </p>
            </div>
            {onOpenAddSubject && (
              <button
                type="button"
                onClick={onOpenAddSubject}
                className="px-4 py-2 bg-[#fdeedc] text-[#8a4816] hover:bg-[#fadab6] rounded-xl font-bold text-xs transition cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <Plus size={14} /> Add / Select Subject & Marks
              </button>
            )}
          </div>

          <div className="pt-2 text-right">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#13141b] text-white rounded-2xl font-bold hover:bg-slate-800 transition cursor-pointer"
            >
              Save Profile & Sync Subjects
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="flex items-center gap-2 mb-2">
          <KeyRound size={18} className="text-[#8a4816]" />
          <h4 className="font-extrabold text-base text-slate-900">Account Password</h4>
        </div>
        <p className="text-xs text-slate-500 mb-5">Ensure your student account is secured with a strong password.</p>

        <form onSubmit={handlePassword} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Current Password</label>
            <input
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full max-w-md p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
            <div>
              <label className="font-bold text-slate-700 block mb-1">New Password</label>
              <input
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#13141b] text-white rounded-2xl font-bold hover:bg-slate-800 transition"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
