import { useState, useMemo, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Search,
  Bell,
  Check,
  X,
  FileText,
  Download,
  Settings,
  LogOut,
  Menu,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Calendar,
  FileCheck,
  Eye,
  KeyRound,
  Printer,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Filter,
  User,
  Clock,
  CheckCheck,
  Award,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import {
  getBacklogRecords,
  confirmClearance,
  toggleTeacherMeetingStatus,
  addFacultyAdvice,
  getStudents,
  isStudentIdentifier,
  getRequests,
  saveRequests,
  getNotifications,
  saveNotifications,
  addNotification,
  UNIVERSITY_DEPARTMENTS
} from '../utils/backlogStore';
import ClearanceCertificateModal from '../components/ClearanceCertificateModal';
import FacultyAdviceModal from '../components/FacultyAdviceModal';
import MeetingDeadlineModal from '../components/MeetingDeadlineModal';
import { RecordFunnelStepper } from '../components/ResolutionFunnel';

// Clean Default Faculty Profile when no session is loaded
const INITIAL_FACULTY = {
  name: 'Faculty Member',
  empId: 'FACULTY',
  designation: 'Faculty Advisor',
  department: 'Academic Department',
  email: 'faculty@univ.edu',
  phone: '',
  cabin: '',
  assignedSubjects: [],
  assignedSections: []
};

const INITIAL_ASSIGNED_STUDENTS = [];
const INITIAL_REQUESTS = [];
const INITIAL_NOTIFICATIONS = [];

function sanitizeFacultyEmail(email) {
  if (!email) return 'faculty@univ.edu';
  if (email.includes('@')) {
    const parts = email.split('@');
    if (parts.length > 2) {
      return `${parts[0]}@${parts[1]}`;
    }
    return email;
  }
  return `${email}@univ.edu`;
}

function isRequestForFaculty(req, fac) {
  if (!req) return false;
  if (!fac) return true;
  const cleanFacName = (fac.name || '').trim().toLowerCase();
  const cleanFacEmpId = (fac.empId || fac.id || '').trim().toLowerCase();
  const cleanFacUser = (fac.username || '').trim().toLowerCase();

  // 1. Direct empId or username match
  if (req.teacherEmpId && cleanFacEmpId && req.teacherEmpId.toLowerCase() === cleanFacEmpId) return true;
  if (req.teacherUsername && cleanFacUser && req.teacherUsername.toLowerCase() === cleanFacUser) return true;

  // 2. Direct teacherName substring or equality
  if (req.teacherName && cleanFacName) {
    if (req.teacherName.toLowerCase().includes(cleanFacName) || cleanFacName.includes(req.teacherName.toLowerCase())) {
      return true;
    }
  }

  // 3. Match from composite teacher string (e.g. "Dr. Rajesh Sharma — Professor...")
  if (req.teacher) {
    const lower = req.teacher.toLowerCase();
    if (cleanFacName && lower.includes(cleanFacName)) return true;
    if (cleanFacEmpId && lower.includes(cleanFacEmpId)) return true;
  }

  // Fallback: if not addressed to any specific teacher, show to all
  if (!req.teacherEmpId && !req.teacherName && !req.teacher) return true;

  return false;
}

function isNotificationForFaculty(notif, fac) {
  if (!notif) return false;
  if (notif.targetRole === 'student') return false;
  if (notif.targetRole === 'all') return true;

  if (!fac) return true;
  const cleanFacName = (fac.name || '').trim().toLowerCase();
  const cleanFacEmpId = (fac.empId || fac.id || '').trim().toLowerCase();
  const cleanFacUser = (fac.username || '').trim().toLowerCase();

  if (notif.targetRole === 'faculty') {
    if (!notif.targetEmpId && !notif.targetTeacherName && !notif.targetTeacherUsername) return true;
    if (notif.targetEmpId === 'ALL') return true;
    if (notif.targetEmpId && cleanFacEmpId && notif.targetEmpId.toLowerCase() === cleanFacEmpId) return true;
    if (notif.targetTeacherUsername && cleanFacUser && notif.targetTeacherUsername.toLowerCase() === cleanFacUser) return true;
    if (notif.targetTeacherName && cleanFacName && (
      notif.targetTeacherName.toLowerCase().includes(cleanFacName) ||
      cleanFacName.includes(notif.targetTeacherName.toLowerCase())
    )) return true;
  }
  return false;
}

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Route Protection: strictly prevent student accounts and student IDs from accessing faculty panel
  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (!stored) {
        navigate('/login?role=faculty');
        return;
      }
      const u = JSON.parse(stored);
      // If student account tries to open faculty portal, immediately kick out
      if (
        u.role?.toLowerCase() === 'student' ||
        isStudentIdentifier(u.id) ||
        isStudentIdentifier(u.username) ||
        isStudentIdentifier(u.usn)
      ) {
        navigate('/login?role=faculty');
        return;
      }
      // If admin, redirect to admin
      if (u.role?.toLowerCase() === 'admin' || u.role?.toLowerCase() === 'administrator') {
        navigate('/admin');
        return;
      }
      if (u.role && u.role.toLowerCase() !== 'faculty' && u.role.toLowerCase() !== 'teacher') {
        navigate('/login?role=faculty');
        return;
      }
    } catch {
      navigate('/login?role=faculty');
    }
  }, [navigate]);

  // Load faculty from logged-in session or fallback to mock
  const [facultyProfile, setFacultyProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const u = JSON.parse(stored);
        if (
          u &&
          (u.role === 'faculty' || u.role === 'teacher' || !u.role) &&
          !isStudentIdentifier(u.id) &&
          !isStudentIdentifier(u.username) &&
          u.role !== 'student'
        ) {
          const rawEmail = u.email || INITIAL_FACULTY.email;
          const cleanedEmail = sanitizeFacultyEmail(rawEmail);
          if (cleanedEmail !== rawEmail) {
            localStorage.setItem('currentUser', JSON.stringify({ ...u, email: cleanedEmail }));
          }
          return {
            ...INITIAL_FACULTY,
            name: u.name || u.username || INITIAL_FACULTY.name,
            empId: u.id || u.empId || u.username || INITIAL_FACULTY.empId,
            email: cleanedEmail,
            department: u.department || INITIAL_FACULTY.department,
            designation: u.designation || INITIAL_FACULTY.designation
          };
        }
      }
    } catch {}
    return INITIAL_FACULTY;
  });
  const [students, setStudents] = useState(() => getStudents());
  const [requests, setRequests] = useState(() => getRequests());
  const [notifications, setNotifications] = useState(() => {
    const all = getNotifications();
    return all.filter((n) => isNotificationForFaculty(n, facultyProfile));
  });
  const [backlogRecords, setBacklogRecords] = useState(() => getBacklogRecords());
  const [selectedCertRecord, setSelectedCertRecord] = useState(null);
  const [selectedAdviceRecord, setSelectedAdviceRecord] = useState(null);
  const [selectedMeetingReqRecord, setSelectedMeetingReqRecord] = useState(null);

  // Real-time synchronization for student updates, clearance, meetings & notifications across windows/tabs
  useEffect(() => {
    const handleSync = (e) => {
      if (e?.detail) {
        setBacklogRecords(e.detail);
      } else {
        setBacklogRecords(getBacklogRecords());
      }
    };
    const handleStudentsSync = (e) => {
      if (e?.detail) {
        setStudents(e.detail);
      } else {
        setStudents(getStudents());
      }
    };
    const handleRequestsSync = (e) => {
      if (e?.detail) {
        setRequests(e.detail);
      } else {
        setRequests(getRequests());
      }
    };
    const handleNotificationsSync = (e) => {
      const all = e?.detail || getNotifications();
      setNotifications(all.filter((n) => isNotificationForFaculty(n, facultyProfile)));
    };

    window.addEventListener('backtrack_backlog_updated', handleSync);
    window.addEventListener('backtrack_students_updated', handleStudentsSync);
    window.addEventListener('backtrack_requests_updated', handleRequestsSync);
    window.addEventListener('backtrack_notifications_updated', handleNotificationsSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('storage', handleStudentsSync);
    window.addEventListener('storage', handleRequestsSync);
    window.addEventListener('storage', handleNotificationsSync);

    return () => {
      window.removeEventListener('backtrack_backlog_updated', handleSync);
      window.removeEventListener('backtrack_students_updated', handleStudentsSync);
      window.removeEventListener('backtrack_requests_updated', handleRequestsSync);
      window.removeEventListener('backtrack_notifications_updated', handleNotificationsSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('storage', handleStudentsSync);
      window.removeEventListener('storage', handleRequestsSync);
      window.removeEventListener('storage', handleNotificationsSync);
    };
  }, [facultyProfile]);

  // Toast feedback
  const [toast, setToast] = useState(null);
  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleToggleMeeting = (recordId, newMet) => {
    const updated = toggleTeacherMeetingStatus(recordId, newMet);
    setBacklogRecords(updated);
    triggerToast(newMet ? 'Marked student consultation as Completed!' : 'Marked teacher meeting as Pending.');
  };

  const handleConfirmBacklogClearance = (recordId, notes = '') => {
    const updated = confirmClearance(recordId, notes);
    setBacklogRecords(updated);
    triggerToast('Confirmed! Backlog has been officially marked Cleared.');
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login?role=faculty');
  };

  const pendingApprovalsCount = useMemo(() => {
    const myPending = requests.filter((r) => r.status === 'Pending' && isRequestForFaculty(r, facultyProfile));
    if (myPending.length > 0) return myPending.length;
    return requests.filter((r) => r.status === 'Pending').length;
  }, [requests, facultyProfile]);

  const pendingStudentUpdatesCount = useMemo(() => {
    return backlogRecords.filter((b) => !b.metTeacher || b.resultStatus === 'Awaiting result').length;
  }, [backlogRecords]);

  const activeBacklogsCount = useMemo(() => {
    return backlogRecords.filter((b) => b.clearanceStatus !== 'Cleared').length;
  }, [backlogRecords]);

  return (
    <div className="flex h-screen bg-[#f4f9fd] font-sans overflow-hidden text-[#03045e]">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-[#03045e] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#0077b6]/40 animate-bounce">
          <Sparkles size={18} className="text-[#00b4d8]" />
          <span className="text-sm font-medium">{toast}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white">
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
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-[#caf0f8]">Faculty</span>
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
          <div className="p-6 pb-6 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white text-[#03045e] flex items-center justify-center font-extrabold text-lg shadow-sm">
                BT
              </div>
              <div>
                <h1 className="font-extrabold text-lg tracking-tight flex items-center gap-1.5">
                  BackTrack
                  <span className="w-2 h-2 rounded-full bg-[#00b4d8] inline-block"></span>
                </h1>
                <p className="text-[11px] text-[#90e0ef]/70 font-medium">Faculty Academic Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="px-3 py-6 space-y-1.5">
            <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">Faculty Menu</div>

            <SidebarBtn
              icon={<LayoutDashboard size={19} />}
              label="Dashboard"
              active={activeTab === 'Dashboard'}
              onClick={() => { setActiveTab('Dashboard'); setIsMobileMenuOpen(false); }}
            />
            <SidebarBtn
              icon={<GraduationCap size={19} />}
              label="Backlog Management"
              active={activeTab === 'Backlog Management'}
              badge={activeBacklogsCount}
              badgeColor="bg-amber-100 text-amber-800"
              onClick={() => { setActiveTab('Backlog Management'); setIsMobileMenuOpen(false); }}
            />
            <SidebarBtn
              icon={<ClipboardList size={19} />}
              label="Student Updates"
              active={activeTab === 'Student Updates'}
              badge={pendingStudentUpdatesCount > 0 ? pendingStudentUpdatesCount : undefined}
              badgeColor="bg-[#fdeedc] text-[#8a4816]"
              onClick={() => { setActiveTab('Student Updates'); setIsMobileMenuOpen(false); }}
            />
            <SidebarBtn
              icon={<Users size={19} />}
              label="Students"
              active={activeTab === 'Students'}
              badge={students.length}
              onClick={() => { setActiveTab('Students'); setIsMobileMenuOpen(false); }}
            />

            <SidebarBtn
              icon={<Users size={19} />}
              label="Teacher Meetings"
              active={activeTab === 'Teacher Meetings' || activeTab === 'Approvals'}
              badge={pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined}
              badgeColor="bg-[#fdeedc] text-[#8a4816]"
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
              label="Settings"
              active={activeTab === 'Settings'}
              onClick={() => { setActiveTab('Settings'); setIsMobileMenuOpen(false); }}
            />
          </div>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="p-4 border-t border-white/5 bg-[#02033b]/60">
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
            <button
              onClick={() => { setActiveTab('Settings'); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-3 text-left hover:opacity-85 transition cursor-pointer w-full min-w-0 group"
              title="Click to view Faculty Settings & Profile"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#caf0f8] to-[#90e0ef] text-[#03045e] flex items-center justify-center font-bold text-xs shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                {facultyProfile.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'FC'}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-xs font-bold text-white leading-tight truncate group-hover:text-[#caf0f8] transition-colors">{facultyProfile.name}</p>
                <p className="text-[10px] text-[#00b4d8] font-medium font-mono truncate">
                  {facultyProfile.empId}
                </p>
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="mt-2.5 w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white border border-rose-500/20 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              title="Sign Out of Faculty Account"
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
            <p className="text-xs text-slate-500 font-medium">Department of {facultyProfile.department}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs text-xs font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {facultyProfile.empId}
            </div>

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
            <FacultyDashboardTab
              faculty={facultyProfile}
              students={students}
              requests={requests}
              setRequests={setRequests}
              backlogRecords={backlogRecords}
              handleToggleMeeting={handleToggleMeeting}
              handleConfirmBacklogClearance={handleConfirmBacklogClearance}
              onNavigate={(tab) => setActiveTab(tab)}
              triggerToast={triggerToast}
              onOpenCertificate={(r) => setSelectedCertRecord(r)}
              onOpenAdvice={(r) => setSelectedAdviceRecord(r)}
            />
          )}

          {activeTab === 'Backlog Management' && (
            <FacultyBacklogManagementTab
              backlogRecords={backlogRecords}
              handleConfirmBacklogClearance={handleConfirmBacklogClearance}
              handleToggleMeeting={handleToggleMeeting}
              onNavigate={(tab) => setActiveTab(tab)}
              triggerToast={triggerToast}
              onOpenCertificate={(r) => setSelectedCertRecord(r)}
              onOpenAdvice={(r) => setSelectedAdviceRecord(r)}
              onOpenMeetingRequirement={(r) => setSelectedMeetingReqRecord(r)}
            />
          )}

          {activeTab === 'Student Updates' && (
            <FacultyStudentUpdatesTab
              backlogRecords={backlogRecords}
              handleToggleMeeting={handleToggleMeeting}
              handleConfirmBacklogClearance={handleConfirmBacklogClearance}
              onNavigate={(tab) => setActiveTab(tab)}
              triggerToast={triggerToast}
              onOpenCertificate={(r) => setSelectedCertRecord(r)}
              onOpenAdvice={(r) => setSelectedAdviceRecord(r)}
              onOpenMeetingRequirement={(r) => setSelectedMeetingReqRecord(r)}
            />
          )}

          {activeTab === 'Students' && (
            <FacultyStudentsTab
              students={students}
              setStudents={setStudents}
              triggerToast={triggerToast}
            />
          )}



          {(activeTab === 'Teacher Meetings' || activeTab === 'Approvals') && (
            <FacultyApprovalsTab
              requests={requests}
              setRequests={setRequests}
              facultyProfile={facultyProfile}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'Notifications' && (
            <FacultyNotificationsTab
              notifications={notifications}
              setNotifications={setNotifications}
              facultyProfile={facultyProfile}
              onNavigate={(tab) => setActiveTab(tab)}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'Settings' && (
            <FacultySettingsTab
              faculty={facultyProfile}
              setFaculty={setFacultyProfile}
              triggerToast={triggerToast}
            />
          )}
        </div>
      </main>

      {/* Official Backlog Clearance Certificate Modal */}
      {selectedCertRecord && (
        <ClearanceCertificateModal
          record={selectedCertRecord}
          onClose={() => setSelectedCertRecord(null)}
        />
      )}

      {/* Faculty Advice & Guidance Modal */}
      {selectedAdviceRecord && (
        <FacultyAdviceModal
          record={selectedAdviceRecord}
          facultyName={facultyProfile.name}
          onClose={() => setSelectedAdviceRecord(null)}
          onAdviceSent={(id, text) => {
            setBacklogRecords(getBacklogRecords());
            triggerToast('Guidance note dispatched to student successfully!');
          }}
        />
      )}

      {/* Faculty Mandatory Meeting Requirement & Deadline Modal */}
      {selectedMeetingReqRecord && (
        <MeetingDeadlineModal
          record={selectedMeetingReqRecord}
          facultyName={facultyProfile.name}
          onClose={() => setSelectedMeetingReqRecord(null)}
          onSave={(updatedRecord) => {
            setBacklogRecords(getBacklogRecords());
            triggerToast(`Mandatory meeting deadline issued to ${updatedRecord.studentName}!`);
          }}
          onClear={(recordId) => {
            setBacklogRecords(getBacklogRecords());
            triggerToast('Meeting requirement removed from student record.', 'info');
          }}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Sub-component: Sidebar Nav Button
// -------------------------------------------------------------
function SidebarBtn({ icon, label, active, badge, badgeColor, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center justify-between px-4 py-3 rounded-2xl font-medium text-xs
        transition-all duration-200 cursor-pointer
        ${active
          ? 'bg-white text-[#03045e] font-bold shadow-md shadow-[#03045e]/25 translate-x-1'
          : 'text-slate-300 hover:text-white hover:bg-white/10'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <span className={active ? 'text-[#0077b6]' : 'text-slate-400'}>{icon}</span>
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span
          className={`
            text-[10px] font-bold px-2 py-0.5 rounded-full
            ${badgeColor || (active ? 'bg-[#03045e] text-white' : 'bg-white/10 text-slate-300')}
          `}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// =============================================================
// TAB 1: FACULTY DASHBOARD VIEW
// =============================================================
function FacultyDashboardTab({
  faculty,
  students,
  requests,
  setRequests,
  backlogRecords = [],
  handleToggleMeeting,
  handleConfirmBacklogClearance,
  onNavigate,
  triggerToast,
  onOpenCertificate,
  onOpenAdvice
}) {
  const pendingRequests = requests.filter((r) => r.status === 'Pending');
  const pendingUpdates = backlogRecords.filter((b) => !b.metTeacher || b.resultStatus === 'Awaiting result');

  return (
    <div className="space-y-6">
      {/* Welcome Academic Banner */}
      <div className="w-full bg-white rounded-3xl p-6 lg:p-7 border border-[#caf0f8] shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden flex flex-col justify-between">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#caf0f8] text-[#0077b6] text-xs font-semibold mb-3">
            <GraduationCap size={14} /> Academic Faculty Desk
          </div>
          <h3 className="text-2xl font-extrabold text-[#03045e] tracking-tight">
            Welcome, {faculty.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Faculty supervision portal for monitoring student backlog clearance, reviewing progress reports, conducting guidance consultations, and certifying backlog resolutions.
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-3 relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-[#03045e] bg-[#f4f9fd] border border-[#caf0f8] px-3.5 py-2 rounded-xl">
            <Calendar size={15} className="text-[#0077b6]" />
            Office Hours: 02:00 PM – 04:30 PM
          </div>
          <button
            onClick={() => onNavigate('Backlog Management')}
            className="text-xs font-bold text-white bg-[#0077b6] hover:bg-[#03045e] px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#0077b6]/20"
          >
            Backlog Management <ChevronRight size={14} />
          </button>
          <button
            onClick={() => onNavigate('Student Updates')}
            className="text-xs font-bold text-[#03045e] bg-[#00b4d8]/20 hover:bg-[#00b4d8]/35 border border-[#00b4d8]/40 px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            Student Updates ({pendingUpdates.length}) <ChevronRight size={14} />
          </button>
          <button
            onClick={() => onNavigate('Students')}
            className="text-xs font-bold text-[#03045e] bg-[#90e0ef]/30 hover:bg-[#90e0ef]/50 border border-[#90e0ef]/60 px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            View Students <ChevronRight size={14} />
          </button>
          <button
            onClick={() => onNavigate('Teacher Meetings')}
            className="text-xs font-bold text-[#03045e] bg-[#caf0f8] hover:bg-[#90e0ef]/60 border border-[#90e0ef]/40 px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            Teacher Meetings ({pendingRequests.length}) <ChevronRight size={14} />
          </button>
        </div>

        <div className="absolute right-[-40px] top-[-40px] w-64 h-64 rounded-full bg-gradient-to-br from-[#caf0f8]/70 to-[#90e0ef]/40 blur-2xl pointer-events-none" />
      </div>

      {/* 4 Ocean Palette Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Backlogs Resolved / Cleared - Coolors Ocean Spectrum Card 1 */}
        <div
          onClick={() => onNavigate('Backlog Management')}
          className="bg-gradient-to-br from-[#caf0f8] to-[#90e0ef]/40 border border-[#90e0ef] rounded-3xl p-5 shadow-[0_6px_20px_rgba(0,180,216,0.1)] cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#0077b6] text-white flex items-center justify-center font-bold shadow-xs">
              <Award size={22} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#0077b6]/15 text-[#0077b6]">Resolved</span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-[#0077b6] uppercase tracking-wide">Backlogs Resolved</span>
            <div className="text-2xl font-black text-[#03045e] tracking-tight mt-0.5">
              {backlogRecords.filter((b) => b.clearanceStatus === 'Cleared').length} Cleared
            </div>
            <p className="text-[11px] text-[#0077b6] mt-1 font-medium">Official certificates issued</p>
          </div>
        </div>

        {/* Backlog Management - Coolors Ocean Spectrum Card 2 */}
        <div
          onClick={() => onNavigate('Backlog Management')}
          className="bg-gradient-to-br from-[#90e0ef]/40 to-[#00b4d8]/20 border border-[#00b4d8]/40 rounded-3xl p-5 shadow-[0_6px_20px_rgba(0,180,216,0.1)] cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#00b4d8] text-[#03045e] flex items-center justify-center font-bold shadow-xs">
              <GraduationCap size={22} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#00b4d8] text-[#03045e] shadow-xs">Backlogs</span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-[#03045e]/80 uppercase tracking-wide">Active Backlogs</span>
            <div className="text-2xl font-black text-[#03045e] tracking-tight mt-0.5">
              {backlogRecords.filter((b) => b.clearanceStatus !== 'Cleared').length} Active
            </div>
            <p className="text-[11px] text-[#03045e]/80 mt-1 font-medium">Tracking repeat exam & clearance</p>
          </div>
        </div>

        {/* Student Updates - Coolors Ocean Spectrum Card 3 */}
        <div
          onClick={() => onNavigate('Student Updates')}
          className="bg-gradient-to-br from-[#00b4d8]/15 to-[#0077b6]/15 border border-[#0077b6]/30 rounded-3xl p-5 shadow-[0_6px_20px_rgba(0,119,182,0.1)] cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#0077b6] text-white flex items-center justify-center font-bold shadow-xs">
              <ClipboardList size={22} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#0077b6]/20 text-[#03045e]">
              {pendingUpdates.length} Pending
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-[#0077b6] uppercase tracking-wide">Student Reports</span>
            <div className="text-2xl font-black text-[#03045e] tracking-tight mt-0.5">{backlogRecords.length} Updates</div>
            <p className="text-[11px] text-[#0077b6] mt-1 font-medium">Consultation & progress status</p>
          </div>
        </div>

        {/* Supervised Students - Coolors Ocean Spectrum Card 4 */}
        <div
          onClick={() => onNavigate('Students')}
          className="bg-gradient-to-br from-[#03045e]/10 to-[#caf0f8]/60 border border-[#90e0ef] rounded-3xl p-5 shadow-[0_6px_20px_rgba(3,4,94,0.08)] cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#03045e] text-white flex items-center justify-center font-bold shadow-xs">
              <Users size={22} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#03045e]/15 text-[#03045e]">Cohort</span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-[#03045e]/80 uppercase tracking-wide">Supervised Students</span>
            <div className="text-2xl font-black text-[#03045e] tracking-tight mt-0.5">{students.length} Candidates</div>
            <p className="text-[11px] text-[#03045e]/80 mt-1 font-medium">Student cohort oversight</p>
          </div>
        </div>
      </div>

      {/* Pending Student Updates Quick Action Feed */}
      <div className="bg-white rounded-3xl p-6 lg:p-7 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-extrabold text-slate-900 tracking-tight">Recent Student Backlog Reports</h4>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fdeedc] text-[#8a4816]">
                {pendingUpdates.length} Requiring Attention
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Student progress reports & backlog updates requiring faculty review</p>
          </div>
          <button
            onClick={() => onNavigate('Student Updates')}
            className="text-xs font-bold text-[#6b21a8] hover:underline flex items-center gap-1 cursor-pointer"
          >
            View all updates ({backlogRecords.length}) <ChevronRight size={14} />
          </button>
        </div>

        <div className="space-y-3">
          {backlogRecords.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
              No student updates right now. All caught up!
            </div>
          ) : (
            backlogRecords.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-100 bg-[#fbfbfd] hover:bg-slate-50/70 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-[#13141b] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-0.5">
                    <User size={18} className="text-slate-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-900">{item.studentName}</span>
                      <span className="text-[11px] font-mono text-slate-400">{item.usn}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-semibold mt-0.5">
                      Subject: <span className="text-slate-900">{item.subjectName}</span>
                    </p>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {!item.metTeacher ? (
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
                          Cleared
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Not cleared
                        </span>
                      )}
                    </div>

                    <div className="mt-2 space-y-1 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400 font-medium">Assignments: </span>
                        <span className="font-semibold text-slate-800">{item.assignmentsCompleted}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Repeat exam: </span>
                        <span className="font-semibold text-slate-800">{item.repeatExamStatus}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 mt-1.5 italic font-medium">
                        &quot;{item.studentRemarks}&quot;
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock size={11} /> Last updated: {item.lastUpdated}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col items-end gap-2 shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() => onOpenAdvice && onOpenAdvice(item)}
                    className="px-3 py-1.5 rounded-xl bg-[#fdeedc] text-[#8a4816] font-bold text-xs hover:bg-[#fcd7b5] transition flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    <MessageSquare size={13} /> Guidance
                  </button>

                  {!item.metTeacher ? (
                    <button
                      onClick={() => handleToggleMeeting(item.id, true)}
                      className="px-3 py-1.5 rounded-xl bg-[#e7f6ee] text-[#166534] font-bold text-xs hover:bg-[#d8f0e2] transition flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <Check size={13} /> Mark Meeting Done
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleMeeting(item.id, false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 font-medium text-xs hover:bg-slate-200 transition cursor-pointer whitespace-nowrap"
                    >
                      Meeting Recorded ✓
                    </button>
                  )}

                  {item.clearanceStatus === 'Cleared' && (
                    <button
                      onClick={() => onOpenCertificate && onOpenCertificate(item)}
                      className="px-3 py-1.5 rounded-xl bg-[#e7f6ee] text-[#166534] font-bold text-xs hover:bg-[#d8f0e2] border border-[#bce8ce] transition flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-xs"
                    >
                      <Award size={13} /> Certificate
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================
// TAB 2: FACULTY STUDENTS VIEW (With PDF Export & Performance)
// =============================================================
function FacultyStudentsTab({ students, triggerToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('All'); // 'All', 'Odd', 'Even'
  const [selectedStudentForPdf, setSelectedStudentForPdf] = useState(null);
  const [inspectStudent, setInspectStudent] = useState(null);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.usn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.section.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSem = semesterFilter === 'All' || s.semesterType === semesterFilter;
      return matchesSearch && matchesSem;
    });
  }, [students, searchTerm, semesterFilter]);

  const handlePrintPdf = () => {
    window.print();
    triggerToast('Generated PDF Print Dialog for student record!');
  };

  return (
    <div className="space-y-6">
      {/* Search & Top Action Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_6px_20px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-base text-slate-900">Assigned Student Cohort</h3>
          <p className="text-xs text-slate-500">Monitor academic performance, Midsem & Endsem results, and generate profile reports</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Odd/Even Semester Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-[#f6f7fa] rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setSemesterFilter('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${semesterFilter === 'All' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
            >
              All Semesters
            </button>
            <button
              onClick={() => setSemesterFilter('Odd')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${semesterFilter === 'Odd' ? 'bg-[#fdeedc] text-[#8a4816] shadow-xs' : 'text-slate-500'}`}
            >
              Odd Sems
            </button>
            <button
              onClick={() => setSemesterFilter('Even')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${semesterFilter === 'Even' ? 'bg-[#e9f2fc] text-[#1e40af] shadow-xs' : 'text-slate-500'}`}
            >
              Even Sems
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student or USN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#f6f7fa] border border-transparent focus:border-slate-300 focus:bg-white text-xs text-slate-900 outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#fafafc] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Student Information</th>
                <th className="py-4 px-4">Semester & Sec</th>
                <th className="py-4 px-4">Mid-Semester (/50)</th>
                <th className="py-4 px-4">End-Semester (/100)</th>
                <th className="py-4 px-4">End-Sem Status</th>
                <th className="py-4 px-4">Backlogs</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#fdeedc] text-[#8a4816] flex items-center justify-center font-bold text-xs">
                        {st.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 block">{st.name}</span>
                        <span className="text-[11px] font-mono text-slate-400">{st.usn} • CGPA: {st.cgpa}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.semesterType === 'Odd' ? 'bg-[#fdeedc] text-[#8a4816]' : 'bg-[#e9f2fc] text-[#1e40af]'}`}>
                        {st.semester} ({st.semesterType})
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {st.section}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    {st.midsemMarks !== null && st.midsemMarks !== undefined ? (
                      <span className="font-black text-slate-900">{st.midsemMarks} / 50</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                        Not Entered
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4">
                    {st.endsemMarks !== null && st.endsemMarks !== undefined ? (
                      <span className="font-bold text-slate-900">{st.endsemMarks} / 100</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                        Not Entered
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${st.endsemStatus === 'Eligible' ? 'bg-[#e7f6ee] text-[#166534]' : 'bg-amber-50 text-amber-700'}`}>
                      {st.endsemStatus}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    {st.backlogs === 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e7f6ee] text-[#166534]">
                        Clear
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fdeedc] text-[#8a4816]">
                        {st.backlogs} Backlog
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setInspectStudent(st)}
                        title="View Full Profile"
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => setSelectedStudentForPdf(st)}
                        title="Export Student Profile as PDF"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#f4e8fd] text-[#6b21a8] font-bold text-xs hover:bg-[#eccffc] transition cursor-pointer"
                      >
                        <Download size={13} /> PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Full Student Profile Inspector */}
      {inspectStudent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#fdeedc] text-[#8a4816] flex items-center justify-center font-bold">
                  {inspectStudent.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{inspectStudent.name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">{inspectStudent.usn} • {inspectStudent.semester} ({inspectStudent.semesterType}) • {inspectStudent.section}</p>
                </div>
              </div>
              <button onClick={() => setInspectStudent(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 bg-[#f6f7fa] rounded-2xl">
                  <span className="text-[10px] text-slate-400 block font-bold">CUMULATIVE CGPA</span>
                  <span className="text-base font-black text-slate-900">
                    {inspectStudent.cgpa && Number(inspectStudent.cgpa) > 0 ? `${inspectStudent.cgpa} / 10.0` : 'Not Available'}
                  </span>
                </div>
                <div className={`p-2.5 rounded-2xl ${inspectStudent.midsemMarks !== null && inspectStudent.midsemMarks !== undefined ? 'bg-[#e7f6ee] text-[#166534]' : 'bg-slate-100 text-slate-500'}`}>
                  <span className="text-[10px] font-bold block">MID-SEMESTER SCORE</span>
                  <span className="text-base font-black">
                    {inspectStudent.midsemMarks !== null && inspectStudent.midsemMarks !== undefined ? `${inspectStudent.midsemMarks} / 50` : 'Not Entered'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">End-Semester Exam Status:</span>
                  <span className="font-bold text-slate-900">
                    {inspectStudent.endsemMarks !== undefined && inspectStudent.endsemMarks !== null
                      ? `${inspectStudent.endsemStatus || 'Eligible'} (${inspectStudent.endsemMarks}/100)`
                      : (inspectStudent.endsemStatus || 'Status Pending')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Subject Assessments:</span>
                  <span className="font-bold text-slate-900">
                    {Array.isArray(inspectStudent.enrolledSubjects) && inspectStudent.enrolledSubjects.length > 0 
                      ? `${inspectStudent.enrolledSubjects.length} Enrolled Course(s)`
                      : 'No Subjects Enrolled Yet'}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Backlog Record Status</span>
                {(!inspectStudent.history || inspectStudent.history.length === 0) && (!inspectStudent.backlogsHistory || inspectStudent.backlogsHistory.length === 0) ? (
                  <div className="p-2.5 bg-[#e7f6ee] text-[#166534] rounded-xl font-medium">
                    All previous semesters cleared with zero backlogs.
                  </div>
                ) : (
                  (inspectStudent.history || inspectStudent.backlogsHistory || []).map((h, i) => (
                    <div key={i} className="p-2.5 bg-[#fdeedc] rounded-xl flex justify-between text-xs text-[#8a4816] mb-1.5">
                      <span>{h.code || h.subjectCode || 'Course'}: {h.name || h.subjectName || ''} ({h.sem || h.semester || 'Past Sem'})</span>
                      <span className="font-bold">{h.status || h.clearanceStatus || 'Active Backlog'}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between">
              <button
                onClick={() => {
                  const s = inspectStudent;
                  setInspectStudent(null);
                  setSelectedStudentForPdf(s);
                }}
                className="px-4 py-2 bg-[#f4e8fd] text-[#6b21a8] rounded-xl font-bold text-xs hover:bg-[#ecd4fb] cursor-pointer"
              >
                Export as PDF
              </button>
              <button
                onClick={() => setInspectStudent(null)}
                className="px-4 py-2 bg-[#13141b] text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Printable Student Profile PDF Preview */}
      {selectedStudentForPdf && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-[#6b21a8]" />
                <h3 className="font-extrabold text-base text-slate-900">Student Academic Record — PDF Export</h3>
              </div>
              <button onClick={() => setSelectedStudentForPdf(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            {/* Printable Document Paper Card */}
            <div className="my-5 p-6 rounded-2xl border border-slate-200 bg-[#fbfbfd] text-xs font-sans space-y-4 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h4 className="font-black text-sm text-slate-900 tracking-tight">BACKTRACK UNIVERSITY ACADEMIC TRANSCRIPT</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Faculty Academic Assessment & Backlog Audit Record</p>
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  <span>Generated: Oct 7, 2026</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 text-[10px] font-bold">STUDENT NAME</p>
                  <p className="font-extrabold text-slate-900 text-sm">{selectedStudentForPdf.name}</p>
                  <p className="text-slate-500 font-mono text-[11px]">{selectedStudentForPdf.usn}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold">PROGRAM & SEMESTER</p>
                  <p className="font-bold text-slate-800">BCA - {selectedStudentForPdf.semester} ({selectedStudentForPdf.semesterType} Sem) • {selectedStudentForPdf.section}</p>
                  <p className="text-slate-500 text-[11px]">Cumulative CGPA: <strong>{selectedStudentForPdf.cgpa}</strong></p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-600 font-bold">
                    <tr>
                      <th className="p-2.5">Subject</th>
                      <th className="p-2.5">Faculty</th>
                      <th className="p-2.5">Mid-Sem (/50)</th>
                      <th className="p-2.5">End-Sem (/100)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Array.isArray(selectedStudentForPdf.enrolledSubjects) && selectedStudentForPdf.enrolledSubjects.length > 0 ? (
                      selectedStudentForPdf.enrolledSubjects.map((sub, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-bold">{sub.code || 'SUB'} - {sub.name || 'Subject'}</td>
                          <td className="p-2.5 text-slate-600">{sub.faculty || facultyProfile.name || 'Department Faculty'}</td>
                          <td className="p-2.5 font-bold text-emerald-600">
                            {sub.midsemMarks !== null && sub.midsemMarks !== undefined && sub.midsemMarks !== ''
                              ? `${sub.midsemMarks} / ${sub.midsemMax || 50}`
                              : <span className="text-slate-400 italic font-normal">Not Entered</span>}
                          </td>
                          <td className="p-2.5 font-bold text-blue-600">
                            {sub.endsemMarks !== null && sub.endsemMarks !== undefined && sub.endsemMarks !== ''
                              ? `${sub.endsemMarks} / ${sub.endsemMax || 100}`
                              : <span className="text-slate-400 italic font-normal">Pending / Not Entered</span>}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-3 text-center text-slate-400 italic">
                          No course subjects enrolled yet. Marks will appear once entered by student.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Backlog Clearance Status</span>
                  <span className="text-slate-500 text-[11px]">
                    {selectedStudentForPdf.backlogs === 0
                      ? 'No pending backlog papers on record.'
                      : `${selectedStudentForPdf.backlogs} paper flagged for backlog examination.`}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800">
                  {selectedStudentForPdf.status}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedStudentForPdf(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handlePrintPdf}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#13141b] text-white hover:bg-slate-800 shadow-sm cursor-pointer"
              >
                <Printer size={15} /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



// =============================================================
// TAB 4: FACULTY APPROVALS VIEW
// =============================================================
function FacultyApprovalsTab({ requests, setRequests, facultyProfile, triggerToast }) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [scopeFilter, setScopeFilter] = useState('My');
  const [remarkModal, setRemarkModal] = useState(null);
  const [remarkText, setRemarkText] = useState('');

  const myRequests = useMemo(() => {
    return requests.filter((r) => isRequestForFaculty(r, facultyProfile));
  }, [requests, facultyProfile]);

  const scopedRequests = useMemo(() => {
    if (scopeFilter === 'My' && myRequests.length > 0) return myRequests;
    if (scopeFilter === 'My' && myRequests.length === 0 && requests.length > 0) return requests;
    return requests;
  }, [scopeFilter, myRequests, requests]);

  const filtered = useMemo(() => {
    if (filterStatus === 'All') return scopedRequests;
    return scopedRequests.filter((r) => r.status === filterStatus);
  }, [scopedRequests, filterStatus]);

  const handleAction = (status) => {
    if (remarkModal) {
      const defaultRemark = status === 'Approved' ? 'Slot confirmed by faculty.' : 'Meeting request declined.';
      const remarkContent = remarkText.trim() || defaultRemark;

      const updatedRequests = requests.map((r) =>
        r.id === remarkModal.id
          ? {
              ...r,
              status,
              remarks: remarkContent,
              facultyResponse: remarkContent
            }
          : r
      );
      setRequests(updatedRequests);
      saveRequests(updatedRequests);

      // Create persistent Notification for the Student
      addNotification({
        id: `NOTIF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        title: `Teacher Meeting ${status}: ${facultyProfile?.name || 'Faculty Member'}`,
        category: 'Approval Updates',
        body: `${facultyProfile?.name || 'Faculty Member'} has ${status.toLowerCase()} your meeting request for "${remarkModal.subject}". Note: "${remarkContent}"`,
        time: 'Just now',
        timestamp: Date.now(),
        read: false,
        targetRole: 'student',
        targetUsn: remarkModal.usn,
        studentName: remarkModal.studentName,
        requestId: remarkModal.id
      });

      triggerToast(`Meeting request for ${remarkModal.studentName} marked as ${status}!`);
      setRemarkModal(null);
      setRemarkText('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_6px_20px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base text-slate-900">Teacher Meetings & Student Consultations</h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fdeedc] text-[#8a4816]">
              {myRequests.filter((r) => r.status === 'Pending').length} Pending for You
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            1-on-1 cabin consultations, academic guidance, and student appointment confirmations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Scope Selector: My vs All */}
          <div className="flex items-center gap-1 p-1 bg-[#f6f7fa] rounded-2xl">
            <button
              onClick={() => setScopeFilter('My')}
              className={`
                px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer
                ${scopeFilter === 'My' ? 'bg-white text-[#13141b] shadow-xs' : 'text-slate-500'}
              `}
            >
              My Appointments ({myRequests.length})
            </button>
            <button
              onClick={() => setScopeFilter('All')}
              className={`
                px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer
                ${scopeFilter === 'All' ? 'bg-white text-[#13141b] shadow-xs' : 'text-slate-500'}
              `}
            >
              All Department ({requests.length})
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 p-1 bg-[#f6f7fa] rounded-2xl">
            {['All', 'Pending', 'Approved', 'Rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`
                  px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer
                  ${filterStatus === s ? 'bg-white text-[#13141b] shadow-xs' : 'text-slate-500'}
                `}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#fdeedc] text-[#8a4816] flex items-center justify-center mx-auto mb-3 font-bold">
              <Users size={24} />
            </div>
            <h4 className="text-sm font-extrabold text-slate-800">No Consultation Requests Found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {scopeFilter === 'My' && myRequests.length === 0
                ? 'No students have scheduled a meeting directly with you yet. Check back once students request appointments.'
                : 'No meeting requests match the selected status filter.'}
            </p>
            {scopeFilter === 'My' && requests.length > 0 && (
              <button
                onClick={() => setScopeFilter('All')}
                className="mt-4 px-4 py-2 bg-[#13141b] text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                View All Department Requests ({requests.length})
              </button>
            )}
          </div>
        ) : (
          filtered.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-extrabold text-sm text-slate-900">{req.studentName}</span>
                  <span className="text-xs font-mono text-slate-400">{req.usn}</span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#fdeedc] text-[#8a4816]">
                    {req.type}
                  </span>
                  {req.slot && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#e9f2fc] text-[#1e40af]">
                      {req.slot}
                    </span>
                  )}

                  {isRequestForFaculty(req, facultyProfile) ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#e7f6ee] text-[#166534] border border-[#bce8ce] flex items-center gap-1">
                      <span>👨‍🏫</span> Assigned to You
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
                      <span>👨‍🏫</span> {req.teacherName || req.teacher?.split('—')[0]?.trim()}
                    </span>
                  )}

                  <span
                    className={`
                      text-[10px] font-bold px-2.5 py-0.5 rounded-full
                      ${req.status === 'Approved' ? 'bg-[#e7f6ee] text-[#166534]' : ''}
                      ${req.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : ''}
                      ${req.status === 'Pending' ? 'bg-amber-50 text-amber-700' : ''}
                    `}
                  >
                    {req.status}
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-800 mt-1.5">{req.subject}</p>
                <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-3 rounded-2xl max-w-xl">
                  <strong>Agenda / Topics:</strong> &ldquo;{req.reason}&rdquo;
                </p>

                {req.remarks && (
                  <p className="text-xs text-[#6b21a8] mt-2 bg-[#f4e8fd]/30 p-2.5 rounded-2xl border border-[#e8c7fb] max-w-xl">
                    <strong>Faculty Cabin Notes:</strong> {req.remarks}
                  </p>
                )}

                <span className="text-[10px] text-slate-400 block mt-2">Requested: {req.date}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {req.status === 'Pending' ? (
                  <>
                    <button
                      onClick={() => { setRemarkModal(req); setRemarkText(''); }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#13141b] text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition shadow-xs cursor-pointer"
                    >
                      Confirm Slot
                    </button>
                  </>
                ) : (
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 block">Slot Finalized</span>
                    <button
                      onClick={() => { setRemarkModal(req); setRemarkText(req.remarks || ''); }}
                      className="text-[11px] font-bold text-[#6b21a8] hover:underline cursor-pointer"
                    >
                      Modify Slot / Notes
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action / Remarks Modal */}
      {remarkModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h4 className="font-extrabold text-base text-slate-900">Confirm Teacher Meeting Slot</h4>
            <p className="text-xs text-slate-500 mt-1">
              Meeting request from <strong>{remarkModal.studentName}</strong> ({remarkModal.type})
            </p>

            <div className="mt-4">
              <label className="font-bold text-slate-700 text-xs block mb-1">Cabin Instructions / Faculty Notes</label>
              <textarea
                rows={3}
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                placeholder="e.g. Slot confirmed. Please visit Cabin 101 with your syllabus notes and assignment question sheet."
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setRemarkModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction('Rejected')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100"
              >
                Reject Request
              </button>
              <button
                onClick={() => handleAction('Approved')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#13141b] text-white hover:bg-slate-800"
              >
                Approve & Confirm Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================
// TAB 5: FACULTY NOTIFICATIONS VIEW
// =============================================================
function FacultyNotificationsTab({ notifications, setNotifications, facultyProfile, onNavigate, triggerToast }) {
  const [filterCat, setFilterCat] = useState('All');

  const filtered = useMemo(() => {
    if (filterCat === 'All') return notifications;
    return notifications.filter((n) => n.category === filterCat);
  }, [notifications, filterCat]);

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    try {
      const allNotifs = getNotifications();
      const updatedAll = allNotifs.map((n) =>
        isNotificationForFaculty(n, facultyProfile) ? { ...n, read: true } : n
      );
      saveNotifications(updatedAll);
    } catch {}
    triggerToast('All notifications marked as read!');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_6px_20px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-base text-slate-900">Faculty Notification Hub</h3>
          <p className="text-xs text-slate-500">Official circulars, student queries, and examination schedule notices</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-[#f6f7fa] rounded-2xl">
            {['All', 'Announcements', 'Student Requests', 'Approval Updates'].map((c) => (
              <button
                key={c}
                onClick={() => setFilterCat(c)}
                className={`
                  px-3.5 py-1.5 rounded-xl text-xs font-bold transition
                  ${filterCat === c ? 'bg-white text-[#13141b] shadow-xs' : 'text-slate-500'}
                `}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            onClick={markAllRead}
            className="text-xs font-bold text-[#6b21a8] hover:underline whitespace-nowrap"
          >
            Mark all read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#f4e8fd] text-[#6b21a8] flex items-center justify-center mx-auto mb-3 font-bold">
              <Bell size={24} />
            </div>
            <h4 className="text-sm font-extrabold text-slate-800">No Notifications Yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              You are all caught up! Student meeting requests and academic updates will appear here in real time.
            </p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`
                p-5 rounded-3xl border transition-all flex items-start justify-between gap-4
                ${n.read ? 'bg-white border-slate-100' : 'bg-[#f4e8fd]/30 border-[#e8c7fb] shadow-xs'}
              `}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`
                    w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5
                    ${n.category === 'Announcements' ? 'bg-[#fdeedc] text-[#8a4816]' : ''}
                    ${n.category === 'Student Requests' ? 'bg-[#f4e8fd] text-[#6b21a8]' : ''}
                    ${n.category === 'Approval Updates' ? 'bg-[#e7f6ee] text-[#166534]' : ''}
                  `}
                >
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

                  {n.category === 'Student Requests' && (
                    <button
                      onClick={() => onNavigate && onNavigate('Teacher Meetings')}
                      className="mt-2 text-[11px] font-bold text-[#6b21a8] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Review in Teacher Meetings</span>
                      <ChevronRight size={13} />
                    </button>
                  )}
                </div>
              </div>

              {!n.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#6b21a8] shrink-0 mt-2"></span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// =============================================================
// TAB 6: FACULTY SETTINGS & PROFILE VIEW
// =============================================================
function FacultySettingsTab({ faculty, setFaculty, triggerToast }) {
  const [profileForm, setProfileForm] = useState({
    name: faculty.name,
    email: sanitizeFacultyEmail(faculty.email),
    phone: faculty.phone,
    cabin: faculty.cabin,
    department: faculty.department
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    const cleanMail = sanitizeFacultyEmail(profileForm.email);
    const updated = { ...faculty, ...profileForm, email: cleanMail };
    setFaculty(updated);
    try {
      const stored = localStorage.getItem('currentUser');
      const u = stored ? JSON.parse(stored) : {};
      localStorage.setItem(
        'currentUser',
        JSON.stringify({
          ...u,
          name: profileForm.name,
          email: cleanMail,
          department: profileForm.department
        })
      );
    } catch {}
    triggerToast('Faculty profile information successfully updated!');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      triggerToast('New password and confirm password do not match.');
      return;
    }
    triggerToast('Password changed successfully! Keep your credentials safe.');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-3xl bg-[#caf0f8] text-[#03045e] flex items-center justify-center font-black text-2xl shadow-inner">
            {faculty.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">{faculty.name}</h3>
            <p className="text-xs text-slate-500">{faculty.designation} • Employee ID: <strong>{faculty.empId}</strong></p>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#caf0f8] text-[#0077b6] inline-block mt-1">
              Department of {faculty.department}
            </span>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-[#0077b6] focus:ring-2 focus:ring-[#0077b6]/20 transition"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Official University Email</label>
              <input
                type="email"
                required
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                placeholder="faculty@univ.edu"
                pattern="^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                title="Please enter a valid email address (e.g. name@domain.com)"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-[#0077b6] focus:ring-2 focus:ring-[#0077b6]/20 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Academic Department</label>
              <select
                value={profileForm.department}
                onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-[#0077b6] focus:ring-2 focus:ring-[#0077b6]/20 font-semibold text-slate-800 transition"
              >
                {UNIVERSITY_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
                {!UNIVERSITY_DEPARTMENTS.includes(profileForm.department) && profileForm.department && (
                  <option value={profileForm.department}>{profileForm.department}</option>
                )}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-[#0077b6] focus:ring-2 focus:ring-[#0077b6]/20 transition"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Cabin / Office Location</label>
              <input
                type="text"
                required
                value={profileForm.cabin}
                onChange={(e) => setProfileForm({ ...profileForm, cabin: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-[#0077b6] focus:ring-2 focus:ring-[#0077b6]/20 transition"
              />
            </div>
          </div>

          <div className="pt-2 text-right">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0077b6] text-white rounded-2xl font-bold hover:bg-[#03045e] shadow-md shadow-[#0077b6]/20 transition active:scale-[0.98]"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="flex items-center gap-2 mb-2">
          <KeyRound size={18} className="text-[#8a4816]" />
          <h4 className="font-extrabold text-base text-slate-900">Security & Credentials</h4>
        </div>
        <p className="text-xs text-slate-500 mb-5">Keep your portal access protected with a secure password.</p>

        <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
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

// =============================================================
// TAB 7: DEDICATED STUDENT UPDATES SECTION
// =============================================================
function FacultyStudentUpdatesTab({
  backlogRecords = [],
  handleToggleMeeting,
  handleConfirmBacklogClearance,
  onNavigate,
  triggerToast,
  onOpenCertificate,
  onOpenAdvice,
  onOpenMeetingRequirement
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [repeatExamFilter, setRepeatExamFilter] = useState('All');
  const [resultFilter, setResultFilter] = useState('All');
  const [meetingFilter, setMeetingFilter] = useState('All');

  // Subjects extracted from records
  const subjectList = useMemo(() => {
    const set = new Set(backlogRecords.map((r) => r.subjectName));
    return ['All', ...Array.from(set)];
  }, [backlogRecords]);

  const filteredUpdates = useMemo(() => {
    return backlogRecords.filter((item) => {
      const matchesSearch =
        item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.usn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subjectCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSubject = selectedSubject === 'All' || item.subjectName === selectedSubject;
      const matchesExam = repeatExamFilter === 'All' || item.repeatExamStatus === repeatExamFilter;
      const matchesResult = resultFilter === 'All' || item.resultStatus === resultFilter;
      const matchesMeeting =
        meetingFilter === 'All' ||
        (meetingFilter === 'Pending' && !item.metTeacher) ||
        (meetingFilter === 'Completed' && item.metTeacher);

      return matchesSearch && matchesSubject && matchesExam && matchesResult && matchesMeeting;
    });
  }, [backlogRecords, searchTerm, selectedSubject, repeatExamFilter, resultFilter, meetingFilter]);

  const pendingMeetingCount = useMemo(() => backlogRecords.filter((b) => !b.metTeacher).length, [backlogRecords]);
  const awaitingResultCount = useMemo(() => backlogRecords.filter((b) => b.resultStatus === 'Awaiting result').length, [backlogRecords]);
  const clearedCount = useMemo(() => backlogRecords.filter((b) => b.clearanceStatus === 'Cleared').length, [backlogRecords]);

  return (
    <div className="space-y-6">
      {/* Overview Metric Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_6px_20px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Total Student Reports</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{backlogRecords.length} Active</div>
          <p className="text-[11px] text-slate-500 mt-1">Submitted by enrolled backlog students</p>
        </div>

        <div className="bg-[#fef3c7]/60 rounded-3xl p-5 border border-[#fde68a] shadow-[0_6px_20px_rgba(254,243,199,0.3)]">
          <span className="text-[11px] font-bold text-[#b45309] uppercase tracking-wide">Teacher Meetings Pending</span>
          <div className="text-2xl font-black text-[#92400e] mt-1">{pendingMeetingCount} Students</div>
          <p className="text-[11px] text-[#b45309] mt-1">Guidance consultation not yet recorded</p>
        </div>

        <div className="bg-[#e0f2fe]/60 rounded-3xl p-5 border border-[#bae6fd] shadow-[0_6px_20px_rgba(224,242,254,0.3)]">
          <span className="text-[11px] font-bold text-[#0369a1] uppercase tracking-wide">Awaiting Results</span>
          <div className="text-2xl font-black text-[#075985] mt-1">{awaitingResultCount} Papers</div>
          <p className="text-[11px] text-[#0369a1] mt-1">Under exam preparation or appeared</p>
        </div>

        <div className="bg-[#e7f6ee] rounded-3xl p-5 border border-[#bce8ce] shadow-[0_6px_20px_rgba(231,246,238,0.3)]">
          <span className="text-[11px] font-bold text-[#166534] uppercase tracking-wide">Backlogs Cleared</span>
          <div className="text-2xl font-black text-[#133722] mt-1">{clearedCount} Confirmed</div>
          <p className="text-[11px] text-[#166534] mt-1">Verified & certified by faculty</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_6px_20px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Student Backlog Progress Reports</h3>
            <p className="text-xs text-slate-500">Live progress reports submitted by students for individual backlog subjects</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student, USN, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#f6f7fa] border border-transparent focus:border-slate-300 focus:bg-white text-xs text-slate-900 outline-none transition"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold mr-1">
            <Filter size={14} /> Filter:
          </div>

          {/* Subject Dropdown */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#f6f7fa] text-slate-700 font-bold border border-slate-200 outline-none cursor-pointer"
          >
            {subjectList.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Subjects' : s}
              </option>
            ))}
          </select>

          {/* Repeat Exam Filter */}
          <select
            value={repeatExamFilter}
            onChange={(e) => setRepeatExamFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#f6f7fa] text-slate-700 font-bold border border-slate-200 outline-none cursor-pointer"
          >
            <option value="All">All Repeat Exam Status</option>
            <option value="Not started">Not started</option>
            <option value="Preparing">Preparing</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Appeared">Appeared</option>
          </select>

          {/* Result Filter */}
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#f6f7fa] text-slate-700 font-bold border border-slate-200 outline-none cursor-pointer"
          >
            <option value="All">All Result Status</option>
            <option value="Awaiting result">Awaiting result</option>
            <option value="Cleared">Cleared</option>
            <option value="Not cleared">Not cleared</option>
          </select>

          {/* Meeting Filter */}
          <select
            value={meetingFilter}
            onChange={(e) => setMeetingFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#f6f7fa] text-slate-700 font-bold border border-slate-200 outline-none cursor-pointer"
          >
            <option value="All">All Meetings</option>
            <option value="Pending">Meeting Pending</option>
            <option value="Completed">Meeting Completed</option>
          </select>

          {(selectedSubject !== 'All' || repeatExamFilter !== 'All' || resultFilter !== 'All' || meetingFilter !== 'All' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedSubject('All');
                setRepeatExamFilter('All');
                setResultFilter('All');
                setMeetingFilter('All');
                setSearchTerm('');
              }}
              className="text-xs font-bold text-rose-600 hover:underline ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Student Updates List */}
      <div className="space-y-4">
        {filteredUpdates.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <ClipboardList size={36} className="mx-auto text-slate-300 mb-2" />
            <h4 className="font-extrabold text-sm text-slate-700">No student progress reports match your filters</h4>
            <p className="text-xs text-slate-400 mt-1">Try resetting the search or filter options above.</p>
          </div>
        ) : (
          filteredUpdates.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-start justify-between gap-6"
            >
              {/* Left Column: Student Details & Badges */}
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-[#13141b] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 mt-0.5">
                  <User size={22} className="text-slate-300" />
                </div>

                <div className="space-y-2.5 flex-1">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-extrabold text-base text-slate-900">{item.studentName}</h4>
                      <span className="text-xs font-mono text-slate-400 font-medium">{item.usn}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {item.semester}
                      </span>
                    </div>

                    <p className="text-sm text-slate-800 font-bold mt-0.5">
                      Subject: <span className="text-[#8a4816] font-extrabold">{item.subjectCode} - {item.subjectName}</span>
                    </p>
                  </div>

                  {/* Status Pills Matching Design */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.meetingRequired && !item.metTeacher ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 shadow-xs">
                        <AlertTriangle size={13} className="text-rose-600 animate-pulse" />
                        Meeting Required by {item.meetingDeadline} {item.meetingDeadlineTime ? `(${item.meetingDeadlineTime})` : ''}
                      </span>
                    ) : !item.metTeacher ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#fef3c7] text-[#b45309] border border-[#fde68a]">
                        Teacher meeting pending
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#e7f6ee] text-[#166534] border border-[#bce8ce]">
                        Teacher meeting: Completed
                      </span>
                    )}

                    {item.resultStatus === 'Awaiting result' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
                        Awaiting result
                      </span>
                    ) : item.resultStatus === 'Cleared' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#e7f6ee] text-[#166534] border border-[#bce8ce]">
                        Result: Cleared ✓
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Result: Not cleared
                      </span>
                    )}

                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                      Reason: {item.backlogReason}
                    </span>
                  </div>

                  {/* Visual Backlog Resolution Stepper */}
                  <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-100">
                    <RecordFunnelStepper record={item} />
                  </div>

                  {/* 7 Required Tracking Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1 text-xs">
                    <div className="p-3 rounded-2xl bg-[#fbfbfd] border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Met Subject Teacher</span>
                      <span className={`font-extrabold mt-0.5 block ${item.metTeacher ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {item.metTeacher ? 'Yes, Met Teacher' : 'Pending Meeting'}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#fbfbfd] border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Assignments Completed</span>
                      <span className={`font-extrabold mt-0.5 block ${item.assignmentsCompleted === 'Completed' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {item.assignmentsCompleted}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#fbfbfd] border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Teacher Consultation</span>
                      <span className={`font-extrabold mt-0.5 block ${item.teacherConsultation === 'Completed' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {item.teacherConsultation}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#fbfbfd] border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Repeat Exam Status</span>
                      <span className="font-extrabold text-[#1e40af] mt-0.5 block">
                        {item.repeatExamStatus}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#fbfbfd] border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Result Status</span>
                      <span className={`font-extrabold mt-0.5 block ${item.resultStatus === 'Cleared' ? 'text-emerald-700' : item.resultStatus === 'Awaiting result' ? 'text-blue-700' : 'text-rose-700'}`}>
                        {item.resultStatus}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#fbfbfd] border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Last Updated</span>
                      <span className="font-bold text-slate-700 mt-0.5 block flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" /> {item.lastUpdated}
                      </span>
                    </div>
                  </div>

                  {/* Student Remarks / Progress Quotation */}
                  <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">Student&apos;s Latest Progress Remarks:</span>
                    <p className="text-xs text-slate-800 italic leading-relaxed font-medium">
                      &quot;{item.studentRemarks}&quot;
                    </p>
                  </div>

                  {/* Mandatory Meeting Warning Banner */}
                  {item.meetingRequired && !item.metTeacher && (
                    <div className="p-3.5 bg-gradient-to-r from-amber-50 via-rose-50/40 to-amber-50 rounded-2xl border border-amber-200 text-xs shadow-xs space-y-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 font-extrabold text-amber-900">
                          <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                          <span>FACULTY MEETING DEADLINE & WARNING ISSUED</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/70 text-amber-900">
                            Deadline: {item.meetingDeadline} {item.meetingDeadlineTime || ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-amber-800 bg-white/80 px-2 py-0.5 rounded-lg border border-amber-200/60">
                            {item.meetingCabinLocation || 'Faculty Cabin'}
                          </span>
                          <button
                            onClick={() => onOpenMeetingRequirement && onOpenMeetingRequirement(item)}
                            className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                          >
                            Edit Warning
                          </button>
                        </div>
                      </div>
                      <p className="text-amber-950 font-medium leading-relaxed italic text-[11px]">
                        &quot;{item.meetingWarningMessage}&quot;
                      </p>
                      <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 pt-0.5">
                        <Clock size={11} className="text-amber-500" />
                        <span>Issued by {item.meetingRequestedBy || 'Faculty Member'} • Alert active on student portal</span>
                      </div>
                    </div>
                  )}

                  {item.facultyNotes && (
                    <div className="p-3.5 bg-gradient-to-r from-[#fefbf6] to-[#fdeedc]/50 rounded-2xl border border-[#fcd7b5] text-xs space-y-1 shadow-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-extrabold text-[#8a4816] flex items-center gap-1.5">
                          <Sparkles size={13} /> Your Academic Guidance ({item.facultyAuthor || facultyProfile.name || 'Faculty Member'})
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
              </div>

              {/* Right Column: Faculty Action Buttons */}
              <div className="flex flex-row lg:flex-col items-end gap-2.5 shrink-0 pt-2 lg:pt-0">
                <button
                  onClick={() => onOpenAdvice && onOpenAdvice(item)}
                  className="px-4 py-2 bg-[#fdeedc] text-[#8a4816] hover:bg-[#fcd7b5] rounded-2xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
                >
                  <MessageSquare size={14} /> Send Guidance Note
                </button>

                {/* Meeting Required / Deadline Warning Button */}
                <button
                  onClick={() => onOpenMeetingRequirement && onOpenMeetingRequirement(item)}
                  className={`px-4 py-2 rounded-2xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs ${
                    item.meetingRequired && !item.metTeacher
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80'
                  }`}
                  title="Warn student with a deadline date if they are missing meetings"
                >
                  <AlertTriangle
                    size={14}
                    className={item.meetingRequired && !item.metTeacher ? 'text-rose-600 animate-pulse' : 'text-amber-600'}
                  />
                  {item.meetingRequired && !item.metTeacher ? 'Meeting Deadline Active' : 'Meeting Required'}
                </button>

                {!item.metTeacher ? (
                  <button
                    onClick={() => handleToggleMeeting(item.id, true)}
                    className="px-4 py-2 bg-[#e7f6ee] text-[#166534] hover:bg-[#d8f0e2] rounded-2xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    <Check size={14} /> Mark Meeting Completed
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleMeeting(item.id, false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-2xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <CheckCheck size={14} className="text-emerald-600" /> Meeting Verified (Revert)
                  </button>
                )}

                {item.clearanceStatus === 'Cleared' && (
                  <button
                    onClick={() => onOpenCertificate && onOpenCertificate(item)}
                    className="px-4 py-2 bg-[#e7f6ee] text-[#166534] hover:bg-[#d8f0e2] rounded-2xl font-bold text-xs border border-[#bce8ce] flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <Award size={14} /> View Certificate
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// =============================================================
// TAB 8: BACKLOG MANAGEMENT (Faculty View)
// =============================================================
function FacultyBacklogManagementTab({
  backlogRecords = [],
  handleConfirmBacklogClearance,
  handleToggleMeeting,
  onNavigate,
  triggerToast,
  onOpenCertificate,
  onOpenAdvice,
  onOpenMeetingRequirement
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [clearanceFilter, setClearanceFilter] = useState('All'); // 'All', 'In Review', 'Pending Clearance', 'Cleared'
  const [reasonFilter, setReasonFilter] = useState('All'); // 'All', 'Low Marks in End-Sem', 'Attendance Shortage', 'Missed Internal Exam'
  const [funnelStageFilter, setFunnelStageFilter] = useState(null);
  const [expandedRowIds, setExpandedRowIds] = useState({});

  const toggleRowExpansion = (id) => {
    setExpandedRowIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Extract unique subjects
  const subjectList = useMemo(() => {
    const set = new Set(backlogRecords.map((r) => r.subjectName));
    return ['All', ...Array.from(set)];
  }, [backlogRecords]);

  const filteredRecords = useMemo(() => {
    return backlogRecords.filter((b) => {
      const matchesSearch =
        b.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.usn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.subjectCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSubject = subjectFilter === 'All' || b.subjectName === subjectFilter;
      const matchesClearance = clearanceFilter === 'All' || b.clearanceStatus === clearanceFilter;
      const matchesReason = reasonFilter === 'All' || b.backlogReason === reasonFilter;

      if (funnelStageFilter === 'met' && !b.metTeacher) return false;
      if (funnelStageFilter === 'assignments' && b.assignmentsCompleted !== 'Completed') return false;
      if (funnelStageFilter === 'appeared' && b.repeatExamStatus !== 'Appeared') return false;
      if (funnelStageFilter === 'cleared' && b.clearanceStatus !== 'Cleared') return false;

      return matchesSearch && matchesSubject && matchesClearance && matchesReason;
    });
  }, [backlogRecords, searchTerm, subjectFilter, clearanceFilter, reasonFilter, funnelStageFilter]);

  return (
    <div className="space-y-6">
      {/* Backlog Management Top Banner & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#fdeedc] border border-[#fcd7b5] rounded-3xl p-5 shadow-[0_6px_20px_rgba(250,238,220,0.4)]">
          <span className="text-[11px] font-bold text-[#8a4816] uppercase tracking-wide">Total Backlog Cases</span>
          <div className="text-2xl font-black text-[#2c1d11] mt-1">{backlogRecords.length} Students</div>
          <p className="text-[11px] text-[#8a4816] mt-1">Across assigned department courses</p>
        </div>

        <div className="bg-[#f4e8fd] border border-[#e8c7fb] rounded-3xl p-5 shadow-[0_6px_20px_rgba(244,232,253,0.4)]">
          <span className="text-[11px] font-bold text-[#6b21a8] uppercase tracking-wide">Under Repeat Exam Prep</span>
          <div className="text-2xl font-black text-[#331342] mt-1">
            {backlogRecords.filter((b) => b.repeatExamStatus === 'Preparing' || b.repeatExamStatus === 'Scheduled').length} Candidates
          </div>
          <p className="text-[11px] text-[#6b21a8] mt-1">Preparing or scheduled for re-exam</p>
        </div>

        <div className="bg-[#e9f2fc] border border-[#bedafb] rounded-3xl p-5 shadow-[0_6px_20px_rgba(233,242,252,0.4)]">
          <span className="text-[11px] font-bold text-[#1e40af] uppercase tracking-wide">Awaiting Faculty Clearance</span>
          <div className="text-2xl font-black text-[#102d54] mt-1">
            {backlogRecords.filter((b) => b.clearanceStatus !== 'Cleared').length} Pending
          </div>
          <p className="text-[11px] text-[#1e40af] mt-1">Ready for verification & approval</p>
        </div>

        <div className="bg-[#e7f6ee] border border-[#bce8ce] rounded-3xl p-5 shadow-[0_6px_20px_rgba(231,246,238,0.4)]">
          <span className="text-[11px] font-bold text-[#166534] uppercase tracking-wide">Cleared Backlogs</span>
          <div className="text-2xl font-black text-[#133722] mt-1">
            {backlogRecords.filter((b) => b.clearanceStatus === 'Cleared').length} Cleared
          </div>
          <p className="text-[11px] text-[#166534] mt-1">Successfully resolved & certified</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_6px_20px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Department Backlog Candidates</h3>
            <p className="text-xs text-slate-500">
              Filter by subject, student, or clearance status; inspect reasons, and track repeat exams.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student or USN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#f6f7fa] border border-transparent focus:border-slate-300 focus:bg-white text-xs text-slate-900 outline-none transition"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold mr-1">
            <Filter size={14} /> Filter By:
          </div>

          {/* Clearance Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#f6f7fa] rounded-2xl">
            {['All', 'In Review', 'Pending Clearance', 'Cleared'].map((status) => (
              <button
                key={status}
                onClick={() => setClearanceFilter(status)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  clearanceFilter === status
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Subject Dropdown */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#f6f7fa] text-slate-700 font-bold border border-slate-200 outline-none cursor-pointer"
          >
            {subjectList.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Subjects' : s}
              </option>
            ))}
          </select>

          {/* Reason Filter */}
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#f6f7fa] text-slate-700 font-bold border border-slate-200 outline-none cursor-pointer"
          >
            <option value="All">All Backlog Reasons</option>
            <option value="Low Marks in End-Sem">Low Marks in End-Sem</option>
            <option value="Attendance Shortage">Attendance Shortage</option>
            <option value="Missed Internal Exam">Missed Internal Exam</option>
          </select>

          {(subjectFilter !== 'All' || clearanceFilter !== 'All' || reasonFilter !== 'All' || searchTerm) && (
            <button
              onClick={() => {
                setSubjectFilter('All');
                setClearanceFilter('All');
                setReasonFilter('All');
                setSearchTerm('');
              }}
              className="text-xs font-bold text-rose-600 hover:underline ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Backlog Management Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#fafafc] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Student Information</th>
                <th className="py-4 px-4">Backlog Subject</th>
                <th className="py-4 px-4">Clearance Status</th>
                <th className="py-4 px-4 text-center">Backlog & Exam Details</th>
                <th className="py-4 px-6 text-right">Faculty Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                    No backlog candidates found matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => (
                  <Fragment key={item.id}>
                    <tr className={`transition-colors ${expandedRowIds[item.id] ? 'bg-slate-50/80' : 'hover:bg-slate-50/70'}`}>
                      {/* Student Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#13141b] text-white flex items-center justify-center font-bold text-xs">
                            {item.studentName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block">{item.studentName}</span>
                            <span className="text-[11px] font-mono text-slate-400">{item.usn} • {item.semester}</span>
                          </div>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="py-4 px-4">
                        <div>
                          <span className="font-extrabold text-slate-900 block">{item.subjectName}</span>
                          <span className="text-[11px] font-mono text-slate-400">{item.subjectCode}</span>
                        </div>
                      </td>

                      {/* Clearance Status */}
                      <td className="py-4 px-4">
                        {item.clearanceStatus === 'Cleared' ? (
                          <div className="space-y-0.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e7f6ee] text-[#166534] border border-[#bce8ce] inline-flex items-center gap-1">
                              <CheckCircle2 size={11} /> Cleared
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {item.facultyClearedDate || 'Oct 09, 2026'}
                            </span>
                          </div>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fdeedc] text-[#8a4816] inline-block">
                            {item.clearanceStatus}
                          </span>
                        )}
                      </td>

                      {/* Dropdown Details Button */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => toggleRowExpansion(item.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer ${
                            expandedRowIds[item.id]
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <span>{expandedRowIds[item.id] ? 'Hide Details' : 'Details'}</span>
                          {expandedRowIds[item.id] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.clearanceStatus === 'Cleared' && (
                            <button
                              onClick={() => onOpenCertificate && onOpenCertificate(item)}
                              title="View Official University Clearance Certificate"
                              className="px-2.5 py-1.5 rounded-xl bg-[#e7f6ee] text-[#166534] hover:bg-[#d8f0e2] border border-[#bce8ce] font-bold text-xs flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-xs"
                            >
                              <Award size={13} /> Certificate
                            </button>
                          )}

                          <button
                            onClick={() => onOpenMeetingRequirement && onOpenMeetingRequirement(item)}
                            title="Require Meeting & Set Deadline Warning"
                            className={`p-1.5 rounded-xl transition cursor-pointer ${
                              item.meetingRequired && !item.metTeacher
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                          >
                            <AlertTriangle size={14} className={item.meetingRequired && !item.metTeacher ? 'text-rose-600 animate-pulse' : 'text-amber-700'} />
                          </button>

                          <button
                            onClick={() => onOpenAdvice && onOpenAdvice(item)}
                            title="Send Academic Advice / Guidance Note"
                            className="p-1.5 rounded-xl text-[#8a4816] bg-[#fdeedc] hover:bg-[#fcd7b5] transition cursor-pointer"
                          >
                            <MessageSquare size={14} />
                          </button>

                          <button
                            onClick={() => onNavigate('Student Updates')}
                            title="View Student Remarks & Progress"
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Details Drawer */}
                    {expandedRowIds[item.id] && (
                      <tr className="bg-slate-50/80 border-b border-slate-100">
                        <td colSpan={5} className="py-3 px-6">
                          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            {/* 1. Reason for Backlog */}
                            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                Reason for Backlog
                              </span>
                              <div className="space-y-1">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                                  item.backlogReason.includes('Attendance')
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                  {item.backlogReason}
                                </span>
                                <div className="text-[11px] text-slate-500 font-mono mt-1">
                                  Initial Score: <strong className="text-slate-800">{item.originalMarks} / {item.maxMarks}</strong>
                                </div>
                              </div>
                            </div>

                            {/* 2. Repeat Exam Progress */}
                            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                Repeat Exam Progress
                              </span>
                              <div className="space-y-1">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                                  item.repeatExamStatus === 'Appeared'
                                    ? 'bg-[#e7f6ee] text-[#166534]'
                                    : item.repeatExamStatus === 'Scheduled'
                                    ? 'bg-[#e0f2fe] text-[#0369a1]'
                                    : item.repeatExamStatus === 'Preparing'
                                    ? 'bg-[#fef3c7] text-[#b45309]'
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {item.repeatExamStatus}
                                </span>
                                <div className="text-[11px] text-slate-500 mt-1">
                                  Result: <strong className="text-slate-800">{item.resultStatus}</strong>
                                </div>
                              </div>
                            </div>

                            {/* 3. Student Updates */}
                            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                Student Updates
                              </span>
                              <div className="space-y-1.5 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500">Teacher Met:</span>
                                  <strong className={item.metTeacher ? 'text-emerald-600' : 'text-amber-600'}>
                                    {item.metTeacher ? 'Yes ✓' : 'Pending'}
                                  </strong>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500">Assignments:</span>
                                  <strong className={item.assignmentsCompleted === 'Completed' ? 'text-emerald-600' : 'text-slate-600'}>
                                    {item.assignmentsCompleted}
                                  </strong>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
