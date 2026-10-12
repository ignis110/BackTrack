import { useState, useMemo, useEffect } from 'react';
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
  MessageSquare
} from 'lucide-react';
import {
  getBacklogRecords,
  confirmClearance,
  toggleTeacherMeetingStatus,
  addFacultyAdvice
} from '../utils/backlogStore';
import ClearanceCertificateModal from '../components/ClearanceCertificateModal';
import FacultyAdviceModal from '../components/FacultyAdviceModal';
import { RecordFunnelStepper, ResolutionFunnelSummary } from '../components/ResolutionFunnel';

// Sample Mock Data for Faculty
const INITIAL_FACULTY = {
  name: 'Dr. Ramesh Sharma',
  empId: 'FAC-1001',
  designation: 'Professor & HOD',
  department: 'Computer Applications',
  email: 'sharma@univ.edu',
  phone: '+91 98450 12890',
  cabin: 'Room 304, IT Block',
  assignedSubjects: [
    { id: 'SUB-301', code: 'BCA301', name: 'Database Management Systems', credits: 4, type: 'Core', section: 'Sec A & B', enrolled: 68, progress: 75 },
    { id: 'SUB-303', code: 'BCA303', name: 'Python & Data Structures', credits: 3, type: 'Practical', section: 'Sec A', enrolled: 65, progress: 85 }
  ],
  assignedSections: ['BCA Sem 3 - Sec A', 'BCA Sem 3 - Sec B']
};

const INITIAL_ASSIGNED_STUDENTS = [
  {
    id: 'STU-01',
    name: 'Aarav Patel',
    usn: '1BT23BCA014',
    section: 'Sec A',
    semester: 'Sem 3',
    semesterType: 'Odd',
    email: 'aarav.p@student.univ.edu',
    cgpa: 8.74,
    midsemMarks: 44,
    midsemMax: 50,
    endsemMarks: 88,
    endsemMax: 100,
    endsemStatus: 'Eligible',
    dbmsMarks: 88,
    pythonMarks: 94,
    backlogs: 0,
    status: 'Regular',
    history: []
  },
  {
    id: 'STU-02',
    name: 'Sneha Deshmukh',
    usn: '1BT23BCA048',
    section: 'Sec B',
    semester: 'Sem 3',
    semesterType: 'Odd',
    email: 'sneha.d@student.univ.edu',
    cgpa: 7.62,
    midsemMarks: 36,
    midsemMax: 50,
    endsemMarks: 72,
    endsemMax: 100,
    endsemStatus: 'Eligible',
    dbmsMarks: 72,
    pythonMarks: 78,
    backlogs: 1,
    status: 'Backlog Candidate',
    history: [{ code: 'BCA202', name: 'Discrete Mathematics', sem: 'Sem 2 (Even)', status: 'Re-evaluation Requested' }]
  },
  {
    id: 'STU-03',
    name: 'Vikram Mehta',
    usn: '1BT23BCA089',
    section: 'Sec A',
    semester: 'Sem 3',
    semesterType: 'Odd',
    email: 'vikram.m@student.univ.edu',
    cgpa: 7.20,
    midsemMarks: 34,
    midsemMax: 50,
    endsemMarks: 65,
    endsemMax: 100,
    endsemStatus: 'Eligible',
    dbmsMarks: 65,
    pythonMarks: 70,
    backlogs: 1,
    status: 'Re-exam Scheduled',
    history: [{ code: 'BCA101', name: 'Intro to Programming in C', sem: 'Sem 1 (Odd)', status: 'Fee Verified' }]
  },
  {
    id: 'STU-04',
    name: 'Ananya Sharma',
    usn: '1BT23BCA003',
    section: 'Sec A',
    semester: 'Sem 3',
    semesterType: 'Odd',
    email: 'ananya.s@student.univ.edu',
    cgpa: 9.20,
    midsemMarks: 48,
    midsemMax: 50,
    endsemMarks: 95,
    endsemMax: 100,
    endsemStatus: 'Eligible',
    dbmsMarks: 95,
    pythonMarks: 92,
    backlogs: 0,
    status: 'Top Performer',
    history: []
  },
  {
    id: 'STU-05',
    name: 'Karan Johar',
    usn: '1BT23BCA055',
    section: 'Sec B',
    semester: 'Sem 3',
    semesterType: 'Odd',
    email: 'karan.j@student.univ.edu',
    cgpa: 6.90,
    midsemMarks: 28,
    midsemMax: 50,
    endsemMarks: 58,
    endsemMax: 100,
    endsemStatus: 'Retest Required',
    dbmsMarks: 58,
    pythonMarks: 64,
    backlogs: 2,
    status: 'Midsem Retest Candidate',
    history: [
      { code: 'BCA201', name: 'Computer Architecture', sem: 'Sem 2 (Even)', status: 'Pending Approval' },
      { code: 'BCA204', name: 'Financial Accounting', sem: 'Sem 2 (Even)', status: 'Pending Approval' }
    ]
  },
  {
    id: 'STU-06',
    name: 'Pooja Iyer',
    usn: '1BT22CSE031',
    section: 'Sec A',
    semester: 'Sem 4',
    semesterType: 'Even',
    email: 'pooja.i@student.univ.edu',
    cgpa: 9.15,
    midsemMarks: 46,
    midsemMax: 50,
    endsemMarks: 92,
    endsemMax: 100,
    endsemStatus: 'Eligible',
    dbmsMarks: 91,
    pythonMarks: 89,
    backlogs: 0,
    status: 'Top Performer',
    history: []
  },
  {
    id: 'STU-07',
    name: 'Rohan Gupta',
    usn: '1BT22ECE082',
    section: 'Sec B',
    semester: 'Sem 2',
    semesterType: 'Even',
    email: 'rohan.g@student.univ.edu',
    cgpa: 6.85,
    midsemMarks: 31,
    midsemMax: 50,
    endsemMarks: 62,
    endsemMax: 100,
    endsemStatus: 'Eligible',
    dbmsMarks: 64,
    pythonMarks: 68,
    backlogs: 1,
    status: 'Backlog Candidate',
    history: [{ code: 'ECE102', name: 'Basic Electrical Eng', sem: 'Sem 1 (Odd)', status: 'Exam Pending' }]
  }
];

const INITIAL_REQUESTS = [
  {
    id: 'REQ-101',
    studentName: 'Sneha Deshmukh',
    usn: '1BT23BCA048',
    type: 'Backlog Re-evaluation',
    subject: 'BCA202 - Discrete Mathematics (Even Sem)',
    examType: 'End-Semester Exam',
    semesterCycle: 'Even Semester',
    reason: 'Scored 32/100, confident about answers in Unit 3 graph theory questions.',
    date: 'Oct 06, 2026',
    status: 'Pending'
  },
  {
    id: 'REQ-102',
    studentName: 'Karan Johar',
    usn: '1BT23BCA055',
    type: 'Mid-Semester Retest Permission',
    subject: 'BCA301 - DBMS Lab & Theory (Odd Sem)',
    examType: 'Mid-Semester Exam',
    semesterCycle: 'Odd Semester',
    reason: 'Hospitalized for 8 days in September with viral fever. Medical fitness certificate submitted for Mid-Semester make-up retest.',
    date: 'Oct 05, 2026',
    status: 'Pending'
  },
  {
    id: 'REQ-103',
    studentName: 'Vikram Mehta',
    usn: '1BT23BCA089',
    type: 'Re-exam Hall Ticket Signature',
    subject: 'BCA101 - Programming in C (Odd Sem)',
    examType: 'End-Semester Exam',
    semesterCycle: 'Odd Semester',
    reason: 'Exam scheduled on Oct 20. Backlog fee of ₹750 verified by accounts department.',
    date: 'Oct 04, 2026',
    status: 'Approved'
  },
  {
    id: 'REQ-104',
    studentName: 'Aarav Patel',
    usn: '1BT23BCA014',
    type: 'Mid-Semester Re-evaluation',
    subject: 'BCA303 - Python Programming (Odd Sem)',
    examType: 'Mid-Semester Exam',
    semesterCycle: 'Odd Semester',
    reason: 'Requesting review of assignment #2 scores and mid-semester coding evaluation.',
    date: 'Oct 01, 2026',
    status: 'Approved'
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-01',
    title: 'Mid-Term Evaluation Marks Due',
    category: 'Announcements',
    body: 'All department faculty must freeze Internal Assessment (IA-1) marks by Friday, Oct 12.',
    time: '2 hours ago',
    read: false
  },
  {
    id: 'NOTIF-02',
    title: 'New Backlog Re-evaluation Petition',
    category: 'Student Requests',
    body: 'Sneha Deshmukh (1BT23BCA048) requested re-checking in Discrete Mathematics.',
    time: '5 hours ago',
    read: false
  },
  {
    id: 'NOTIF-03',
    title: 'Dean Examination Clearance',
    category: 'Approval Updates',
    body: 'Office has acknowledged Vikram Mehta re-exam application for Programming in C.',
    time: 'Yesterday',
    read: true
  }
];

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

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load faculty from logged-in session or fallback to mock
  const [facultyProfile, setFacultyProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && (u.role === 'faculty' || !u.role)) {
          const rawEmail = u.email || INITIAL_FACULTY.email;
          const cleanedEmail = sanitizeFacultyEmail(rawEmail);
          if (cleanedEmail !== rawEmail) {
            localStorage.setItem('currentUser', JSON.stringify({ ...u, email: cleanedEmail }));
          }
          return {
            ...INITIAL_FACULTY,
            name: u.name || u.username || INITIAL_FACULTY.name,
            empId: u.id || u.username || INITIAL_FACULTY.empId,
            email: cleanedEmail
          };
        }
      }
    } catch {}
    return INITIAL_FACULTY;
  });
  const [students, setStudents] = useState(INITIAL_ASSIGNED_STUDENTS);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [backlogRecords, setBacklogRecords] = useState(() => getBacklogRecords());
  const [selectedCertRecord, setSelectedCertRecord] = useState(null);
  const [selectedAdviceRecord, setSelectedAdviceRecord] = useState(null);

  // Real-time synchronization for student updates and clearance across windows/tabs
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
    return requests.filter((r) => r.status === 'Pending').length;
  }, [requests]);

  const pendingStudentUpdatesCount = useMemo(() => {
    return backlogRecords.filter((b) => !b.metTeacher || b.resultStatus === 'Awaiting result').length;
  }, [backlogRecords]);

  const activeBacklogsCount = useMemo(() => {
    return backlogRecords.filter((b) => b.clearanceStatus !== 'Cleared').length;
  }, [backlogRecords]);

  return (
    <div className="flex h-screen bg-[#f6f7fa] font-sans overflow-hidden text-[#181920]">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-[#13141b] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700/60 animate-bounce">
          <Sparkles size={18} className="text-[#f5caa0]" />
          <span className="text-sm font-medium">{toast}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Mobile Top Navbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#13141b] text-white flex items-center justify-between px-5 z-40 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white text-[#13141b] flex items-center justify-center font-bold text-sm">
            BT
          </div>
          <span className="font-bold text-lg tracking-tight">BackTrack</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-[#f4e8fd]">Faculty</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-300 hover:text-white">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Modern Sleek Dark Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 left-0 h-full z-40 w-68
          bg-[#13141b] text-white flex flex-col justify-between
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:my-3 lg:ml-3 lg:rounded-[2.2rem] shadow-2xl overflow-hidden
        `}
      >
        <div>
          {/* Logo Header */}
          <div className="p-6 pb-6 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white text-[#13141b] flex items-center justify-center font-extrabold text-lg shadow-sm">
                BT
              </div>
              <div>
                <h1 className="font-extrabold text-lg tracking-tight flex items-center gap-1.5">
                  BackTrack
                  <span className="w-2 h-2 rounded-full bg-[#f4e8fd] inline-block"></span>
                </h1>
                <p className="text-[11px] text-slate-400 font-medium">Faculty Academic Portal</p>
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
              icon={<BookOpen size={19} />}
              label="Subjects / Classes"
              active={activeTab === 'Subjects / Classes'}
              badge={facultyProfile.assignedSubjects.length}
              onClick={() => { setActiveTab('Subjects / Classes'); setIsMobileMenuOpen(false); }}
            />
            <SidebarBtn
              icon={<FileCheck size={19} />}
              label="Approvals"
              active={activeTab === 'Approvals'}
              badge={pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined}
              badgeColor="bg-[#fdeedc] text-[#8a4816]"
              onClick={() => { setActiveTab('Approvals'); setIsMobileMenuOpen(false); }}
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
        <div className="p-4 border-t border-white/5 bg-[#171822]/60">
          <div className="flex items-center justify-between p-2 rounded-2xl bg-white/5 border border-white/5">
            <button
              onClick={() => { setActiveTab('Settings'); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-3 text-left hover:opacity-85 transition cursor-pointer flex-1 mr-2 group"
              title="Click to view Faculty Settings & Profile"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f4e8fd] to-[#fdeedc] text-[#13141b] flex items-center justify-center font-bold text-xs shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                {facultyProfile.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'FC'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white leading-tight truncate group-hover:text-[#f4e8fd] transition-colors">{facultyProfile.name}</p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium font-mono truncate">
                  {facultyProfile.empId}
                </p>
              </div>
            </button>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            >
              <LogOut size={16} />
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
        <header className="h-20 px-6 lg:px-8 flex items-center justify-between border-b border-slate-200/60 bg-[#f6f7fa]/90 backdrop-blur-md">
          <div>
            <h2 className="text-xl lg:text-2xl font-extrabold text-[#181920] tracking-tight">{activeTab}</h2>
            <p className="text-xs text-slate-500 font-medium">Department of {facultyProfile.department}</p>
          </div>

          <div className="flex items-center gap-3.5">
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

            <button
              onClick={() => setActiveTab('Settings')}
              className="flex items-center gap-2.5 pl-2 hover:opacity-85 transition cursor-pointer text-left"
              title="Click to view Faculty Settings & Profile"
            >
              <div className="w-9 h-9 rounded-2xl bg-[#13141b] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {facultyProfile.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'FC'}
              </div>
              <div className="hidden md:block text-left">
                <span className="text-xs font-bold text-slate-900 block leading-tight">{facultyProfile.name}</span>
                <span className="text-[10px] text-slate-400 font-medium font-mono">{facultyProfile.empId}</span>
              </div>
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
            />
          )}

          {activeTab === 'Students' && (
            <FacultyStudentsTab
              students={students}
              setStudents={setStudents}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'Subjects / Classes' && (
            <FacultySubjectsClassesTab
              faculty={facultyProfile}
              setFaculty={setFacultyProfile}
              students={students}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'Approvals' && (
            <FacultyApprovalsTab
              requests={requests}
              setRequests={setRequests}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'Notifications' && (
            <FacultyNotificationsTab
              notifications={notifications}
              setNotifications={setNotifications}
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
          ? 'bg-white text-[#13141b] font-bold shadow-md shadow-black/20 translate-x-1'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <span className={active ? 'text-[#13141b]' : 'text-slate-400'}>{icon}</span>
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span
          className={`
            text-[10px] font-bold px-2 py-0.5 rounded-full
            ${badgeColor || (active ? 'bg-[#13141b] text-white' : 'bg-white/10 text-slate-300')}
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
      {/* Welcome Banner & Obsidian Class Metric */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 lg:p-7 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f4e8fd] text-[#6b21a8] text-xs font-semibold mb-3">
              <GraduationCap size={14} /> Academic Faculty Desk
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Good Morning, {faculty.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-lg leading-relaxed">
              You are assigned to <strong>2 core subjects</strong> across <strong>{faculty.assignedSections.join(' & ')}</strong>. 
              There are {pendingUpdates.length} student progress reports requiring faculty guidance or backlog clearance.
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-3 relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-[#f6f7fa] px-3.5 py-2 rounded-xl">
              <Calendar size={15} className="text-slate-400" />
              Office Hours: 02:00 PM – 04:30 PM
            </div>
            <button
              onClick={() => onNavigate('Student Updates')}
              className="text-xs font-bold text-[#13141b] bg-[#fdeedc] hover:bg-[#fad8ba] px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              Student Updates ({pendingUpdates.length}) <ChevronRight size={14} />
            </button>
            <button
              onClick={() => onNavigate('Backlog Management')}
              className="text-xs font-bold text-[#13141b] bg-[#e0f2fe] hover:bg-[#bae6fd] px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              Backlog Management <ChevronRight size={14} />
            </button>
            <button
              onClick={() => onNavigate('Students')}
              className="text-xs font-bold text-[#13141b] bg-[#e7f6ee] hover:bg-[#d8f0e2] px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              View Students <ChevronRight size={14} />
            </button>
          </div>

          <div className="absolute right-[-40px] top-[-40px] w-64 h-64 rounded-full bg-gradient-to-br from-[#f4e8fd]/60 to-[#fdeedc]/60 blur-2xl pointer-events-none" />
        </div>

        {/* Dark Obsidian Success Card (Odd & Even Sems badge removed) */}
        <div className="bg-[#14151b] text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mid-Semester Evaluation</span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-white">92.4%</span>
              <span className="text-xs font-bold text-emerald-400">Papers Graded</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              DBMS: 44/50 avg • Python Lab: 46/50 avg. Endsem hall tickets cleared.
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-[11px] font-medium text-slate-400">
              <span>Syllabus Covered</span>
              <span className="text-[#f5caa0] font-bold">85% Total</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden flex">
              <div className="h-full bg-[#f5caa0] rounded-full" style={{ width: '85%' }}></div>
            </div>
            <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400">
              <span>Next End-Sem Exam: <strong className="text-white">Nov 24</strong></span>
              <span>Students in Cohort: <strong className="text-white">133</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Pastel Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Assigned Classes - Pastel Peach */}
        <div
          onClick={() => onNavigate('Subjects / Classes')}
          className="bg-[#fdeedc] border border-[#fcd7b5] rounded-3xl p-5 shadow-[0_6px_20px_rgba(250,238,220,0.4)] cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#f7d6b8] text-[#8a4816] flex items-center justify-center font-bold shadow-xs">
              <BookOpen size={22} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#fae3cb] text-[#8a4816]">Active</span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-[#8a4816]/80 uppercase tracking-wide">Assigned Classes</span>
            <div className="text-2xl font-black text-[#2c1d11] tracking-tight mt-0.5">{faculty.assignedSections.length} Sections</div>
            <p className="text-[11px] text-[#8a4816] mt-1 font-medium">{faculty.assignedSections.join(', ')}</p>
          </div>
        </div>

        {/* Backlog Management - Pastel Lavender */}
        <div
          onClick={() => onNavigate('Backlog Management')}
          className="bg-[#f4e8fd] border border-[#e8c7fb] rounded-3xl p-5 shadow-[0_6px_20px_rgba(244,232,253,0.4)] cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#eccffc] text-[#6b21a8] flex items-center justify-center font-bold shadow-xs">
              <GraduationCap size={22} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#eedafc] text-[#6b21a8]">Backlogs</span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-[#6b21a8]/80 uppercase tracking-wide">Backlog Management</span>
            <div className="text-2xl font-black text-[#331342] tracking-tight mt-0.5">
              {backlogRecords.filter((b) => b.clearanceStatus !== 'Cleared').length} Active
            </div>
            <p className="text-[11px] text-[#6b21a8] mt-1 font-medium">Tracking repeat exam & clearance</p>
          </div>
        </div>

        {/* Student Updates - Pastel Mint */}
        <div
          onClick={() => onNavigate('Student Updates')}
          className="bg-[#e7f6ee] border border-[#bce8ce] rounded-3xl p-5 shadow-[0_6px_20px_rgba(231,246,238,0.4)] cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#cceed7] text-[#166534] flex items-center justify-center font-bold shadow-xs">
              <ClipboardList size={22} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#dcf1e3] text-[#166534]">
              {pendingUpdates.length} Pending
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-[#166534]/80 uppercase tracking-wide">Student Updates</span>
            <div className="text-2xl font-black text-[#133722] tracking-tight mt-0.5">{backlogRecords.length} Reports</div>
            <p className="text-[11px] text-[#166534] mt-1 font-medium">Student backlog progress submissions</p>
          </div>
        </div>

        {/* Assigned Students - Pastel Sky Blue */}
        <div
          onClick={() => onNavigate('Students')}
          className="bg-[#e9f2fc] border border-[#bedafb] rounded-3xl p-5 shadow-[0_6px_20px_rgba(233,242,252,0.4)] cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#d3e5fa] text-[#1e40af] flex items-center justify-center font-bold shadow-xs">
              <Users size={22} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#dce9fb] text-[#1e40af]">Cohort</span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-[#1e40af]/80 uppercase tracking-wide">Total Students</span>
            <div className="text-2xl font-black text-[#102d54] tracking-tight mt-0.5">{students.length * 26} Enrolled</div>
            <p className="text-[11px] text-[#1e40af] mt-1 font-medium">Sec A & Sec B Combined</p>
          </div>
        </div>
      </div>

      {/* Pending Student Updates Quick Action Feed & Lectures */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Student Requests Requiring Faculty Attention */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-extrabold text-slate-900 tracking-tight">Pending Student Requests</h4>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fdeedc] text-[#8a4816]">
                  {pendingUpdates.length} Requiring Attention
                </span>
              </div>
              <p className="text-xs text-slate-500">Student progress reports & backlog updates requiring faculty review</p>
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
              backlogRecords.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-slate-100 bg-[#fbfbfd] hover:bg-slate-50/70 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#13141b] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-0.5">
                      <User size={18} className="text-slate-300" />
                    </div>
                    <div>
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

                    {item.clearanceStatus !== 'Cleared' ? (
                      <button
                        onClick={() => handleConfirmBacklogClearance(item.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#13141b] text-white font-bold text-xs hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <CheckCircle2 size={13} /> Confirm Clearance
                      </button>
                    ) : (
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

        {/* Today's Lectures & Timetable */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h4 className="text-base font-extrabold text-slate-900 tracking-tight mb-1">Today&apos;s Lectures</h4>
            <p className="text-xs text-slate-500 mb-4">Wednesday schedule</p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#fdeedc]/60 border border-[#fcd7b5] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#8a4816] block">DBMS (BCA301) - Lecture</span>
                  <span className="text-[11px] text-slate-500">10:30 AM - 11:30 AM • Room 204</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white text-slate-700">Sec A</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f4e8fd]/60 border border-[#e8c7fb] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#6b21a8] block">Python Lab (BCA303) - Practical</span>
                  <span className="text-[11px] text-slate-500">01:30 PM - 03:30 PM • Lab 3</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white text-slate-700">Sec B</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#e7f6ee]/60 border border-[#bce8ce] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#166534] block">Student Counseling & Backlogs</span>
                  <span className="text-[11px] text-slate-500">03:30 PM - 04:30 PM • Cabin 304</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white text-slate-700">Office</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('Subjects / Classes')}
            className="w-full mt-4 py-2.5 bg-[#13141b] text-white rounded-2xl font-bold text-xs hover:bg-slate-800 transition"
          >
            Manage Class Syllabi
          </button>
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
                    <span className="font-black text-slate-900">{st.midsemMarks} / 50</span>
                  </td>

                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-900">{st.endsemMarks} / 100</span>
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
                  <span className="text-base font-black text-slate-900">{inspectStudent.cgpa} / 10.0</span>
                </div>
                <div className="p-2.5 bg-[#e7f6ee] rounded-2xl text-[#166534]">
                  <span className="text-[10px] font-bold block">MID-SEMESTER SCORE</span>
                  <span className="text-base font-black">{inspectStudent.midsemMarks} / 50</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">End-Semester Exam Status:</span>
                  <span className="font-bold text-slate-900">{inspectStudent.endsemStatus} ({inspectStudent.endsemMarks}/100)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Subject Assessments:</span>
                  <span className="font-bold text-slate-900">DBMS: {inspectStudent.dbmsMarks} • Python: {inspectStudent.pythonMarks}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Backlog Record Status</span>
                {inspectStudent.history.length === 0 ? (
                  <div className="p-2.5 bg-[#e7f6ee] text-[#166534] rounded-xl font-medium">
                    All previous semesters cleared with zero backlogs.
                  </div>
                ) : (
                  inspectStudent.history.map((h, i) => (
                    <div key={i} className="p-2.5 bg-[#fdeedc] rounded-xl flex justify-between text-xs text-[#8a4816]">
                      <span>{h.code}: {h.name} ({h.sem})</span>
                      <span className="font-bold">{h.status}</span>
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
                    <tr>
                      <td className="p-2.5 font-bold">BCA301 - DBMS</td>
                      <td className="p-2.5 text-slate-600">Dr. Ramesh Sharma</td>
                      <td className="p-2.5 font-bold text-emerald-600">{selectedStudentForPdf.midsemMarks} / 50</td>
                      <td className="p-2.5 font-bold text-blue-600">{selectedStudentForPdf.endsemMarks} / 100</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">BCA303 - Python Prog</td>
                      <td className="p-2.5 text-slate-600">Dr. Ramesh Sharma</td>
                      <td className="p-2.5 font-bold text-emerald-600">{(selectedStudentForPdf.midsemMarks + 2) > 50 ? 50 : (selectedStudentForPdf.midsemMarks + 2)} / 50</td>
                      <td className="p-2.5 font-bold text-blue-600">{selectedStudentForPdf.pythonMarks} / 100</td>
                    </tr>
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
// TAB 3: SUBJECTS & CLASSES VIEW
// =============================================================
function FacultySubjectsClassesTab({ faculty, students, triggerToast }) {
  const [selectedSub, setSelectedSub] = useState(faculty.assignedSubjects[0]);
  const [activeSubTab, setActiveSubTab] = useState('Enrolled Students');

  return (
    <div className="space-y-6">
      {/* Subject Selector Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-base text-slate-900">Your Assigned Subjects</h3>
          <span className="text-xs font-bold text-slate-500">2 Courses Allocated</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {faculty.assignedSubjects.map((sub, i) => (
            <div
              key={sub.id}
              onClick={() => setSelectedSub(sub)}
              className={`
                p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden
                ${selectedSub.id === sub.id ? 'ring-2 ring-[#13141b] shadow-md' : 'shadow-xs hover:shadow-sm'}
                ${i === 0 ? 'bg-[#fdeedc] border-[#fcd7b5]' : 'bg-[#f4e8fd] border-[#e8c7fb]'}
              `}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-900">{sub.code}</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/80 text-slate-800">
                  {sub.credits} Credits • {sub.type}
                </span>
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mt-2">{sub.name}</h4>
              <p className="text-xs text-slate-600 mt-0.5">Section: <strong>{sub.section}</strong> • {sub.enrolled} Students</p>

              <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-xs">
                <span className="text-slate-600">Syllabus Progress:</span>
                <span className="font-extrabold text-slate-900">{sub.progress}% Complete</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Management Panel */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h4 className="text-base font-extrabold text-slate-900">
              {selectedSub.code} — {selectedSub.name}
            </h4>
            <p className="text-xs text-slate-500">Section {selectedSub.section} • {selectedSub.enrolled} Enrolled Candidates</p>
          </div>

          <div className="flex items-center gap-2 bg-[#f6f7fa] p-1 rounded-2xl">
            {['Enrolled Students', 'Academic Syllabus'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveSubTab(t)}
                className={`
                  px-4 py-1.5 rounded-xl text-xs font-bold transition
                  ${activeSubTab === t ? 'bg-white text-[#13141b] shadow-xs' : 'text-slate-500'}
                `}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {activeSubTab === 'Enrolled Students' && (
          <div className="pt-4 space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-bold">
                    <th className="py-2.5">Student</th>
                    <th className="py-2.5">USN</th>
                    <th className="py-2.5">Mid-Semester (/50)</th>
                    <th className="py-2.5">End-Semester Score</th>
                    <th className="py-2.5 text-right">Backlog Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="py-3 font-bold text-slate-900">{st.name}</td>
                      <td className="py-3 font-mono text-slate-400">{st.usn}</td>
                      <td className="py-3 font-semibold text-emerald-600">{st.midsemMarks} / 50</td>
                      <td className="py-3 font-bold text-slate-800">
                        {st.endsemMarks} / 100
                      </td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.backlogs === 0 ? 'bg-[#e7f6ee] text-[#166534]' : 'bg-[#fdeedc] text-[#8a4816]'}`}>
                          {st.backlogs === 0 ? 'Regular' : `${st.backlogs} Backlog`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSubTab === 'Academic Syllabus' && (
          <div className="pt-4 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800 block mb-1">Unit 1 & 2: Fundamentals</span>
                <p className="text-slate-500 text-[11px]">Relational Algebra, SQL DDL/DML, Normal Forms up to BCNF.</p>
                <span className="mt-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">Completed</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800 block mb-1">Unit 3: Transactions & ACID</span>
                <p className="text-slate-500 text-[11px]">Concurrency control, Serializability, 2PL Lock protocol.</p>
                <span className="mt-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">Completed</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800 block mb-1">Unit 4: Indexing & Hashing</span>
                <p className="text-slate-500 text-[11px]">B+ Trees, Dynamic hashing, Query optimization pipelines.</p>
                <span className="mt-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full inline-block">In Progress (50%)</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => triggerToast('Syllabus progress updated successfully!')}
                className="px-4 py-2 bg-[#13141b] text-white rounded-xl font-bold text-xs hover:bg-slate-800"
              >
                Save Progress
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================
// TAB 4: FACULTY APPROVALS VIEW
// =============================================================
function FacultyApprovalsTab({ requests, setRequests, triggerToast }) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [remarkModal, setRemarkModal] = useState(null);
  const [remarkText, setRemarkText] = useState('');

  const filtered = useMemo(() => {
    if (filterStatus === 'All') return requests;
    return requests.filter((r) => r.status === filterStatus);
  }, [requests, filterStatus]);

  const handleAction = (status) => {
    if (remarkModal) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === remarkModal.id ? { ...r, status, remarks: remarkText || 'Approved by Faculty' } : r
        )
      );
      triggerToast(`Request ${remarkModal.id} marked as ${status}`);
      setRemarkModal(null);
      setRemarkText('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_6px_20px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-base text-slate-900">Student Petitions & Clearances</h3>
          <p className="text-xs text-slate-500">Sign off on Mid-Semester re-evaluations, End-Semester backlog requests, and hall tickets</p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#f6f7fa] rounded-2xl">
          {['All', 'Pending', 'Approved', 'Rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`
                px-4 py-1.5 rounded-xl text-xs font-bold transition
                ${filterStatus === s ? 'bg-white text-[#13141b] shadow-xs' : 'text-slate-500'}
              `}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filtered.map((req) => (
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

              <p className="text-xs font-bold text-slate-800 mt-1">{req.subject}</p>
              <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-3 rounded-2xl max-w-xl">
                &ldquo;{req.reason}&rdquo;
              </p>
              <span className="text-[10px] text-slate-400 block mt-2">Submitted on: {req.date}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {req.status === 'Pending' ? (
                <>
                  <button
                    onClick={() => { setRemarkModal(req); setRemarkText(''); }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#13141b] text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition shadow-xs"
                  >
                    Take Action
                  </button>
                </>
              ) : (
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 block">Decision Finalized</span>
                  <button
                    onClick={() => { setRemarkModal(req); setRemarkText(''); }}
                    className="text-[11px] font-bold text-[#6b21a8] hover:underline"
                  >
                    Modify Status
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action / Remarks Modal */}
      {remarkModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h4 className="font-extrabold text-base text-slate-900">Review Request</h4>
            <p className="text-xs text-slate-500 mt-1">
              Petition from <strong>{remarkModal.studentName}</strong> ({remarkModal.type})
            </p>

            <div className="mt-4">
              <label className="font-bold text-slate-700 text-xs block mb-1">Faculty Remarks (Optional)</label>
              <textarea
                rows={3}
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                placeholder="e.g. Approved. Answer script reviewed and Mid-Semester marks adjusted."
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
                Approve Request
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
function FacultyNotificationsTab({ notifications, setNotifications, triggerToast }) {
  const [filterCat, setFilterCat] = useState('All');

  const filtered = useMemo(() => {
    if (filterCat === 'All') return notifications;
    return notifications.filter((n) => n.category === filterCat);
  }, [notifications, filterCat]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
        {filtered.map((n) => (
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
              </div>
            </div>

            {!n.read && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#6b21a8] shrink-0 mt-2"></span>
            )}
          </div>
        ))}
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
          email: cleanMail
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
          <div className="w-16 h-16 rounded-3xl bg-[#f4e8fd] text-[#6b21a8] flex items-center justify-center font-black text-2xl shadow-inner">
            {faculty.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">{faculty.name}</h3>
            <p className="text-xs text-slate-500">{faculty.designation} • Employee ID: <strong>{faculty.empId}</strong></p>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#fdeedc] text-[#8a4816] inline-block mt-1">
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
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white"
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
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Cabin / Office Location</label>
              <input
                type="text"
                required
                value={profileForm.cabin}
                onChange={(e) => setProfileForm({ ...profileForm, cabin: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-2 text-right">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#13141b] text-white rounded-2xl font-bold hover:bg-slate-800 transition"
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
  onOpenAdvice
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
                    {!item.metTeacher ? (
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

                  {item.facultyNotes && (
                    <div className="p-3.5 bg-gradient-to-r from-[#fefbf6] to-[#fdeedc]/50 rounded-2xl border border-[#fcd7b5] text-xs space-y-1 shadow-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-extrabold text-[#8a4816] flex items-center gap-1.5">
                          <Sparkles size={13} /> Your Academic Guidance ({item.facultyAuthor || 'Dr. Ramesh Sharma'})
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

                {item.clearanceStatus !== 'Cleared' ? (
                  <button
                    onClick={() => handleConfirmBacklogClearance(item.id)}
                    className="px-4 py-2 bg-[#13141b] text-white hover:bg-slate-800 rounded-2xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    <CheckCircle2 size={14} className="text-emerald-400" /> Confirm Clearance
                  </button>
                ) : (
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
  onOpenAdvice
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [clearanceFilter, setClearanceFilter] = useState('All'); // 'All', 'In Review', 'Pending Clearance', 'Cleared'
  const [reasonFilter, setReasonFilter] = useState('All'); // 'All', 'Low Marks in End-Sem', 'Attendance Shortage', 'Missed Internal Exam'
  const [funnelStageFilter, setFunnelStageFilter] = useState(null);
  const [selectedRecordForClearance, setSelectedRecordForClearance] = useState(null);
  const [clearanceNote, setClearanceNote] = useState('');

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

  const handleOpenClearanceModal = (record) => {
    setSelectedRecordForClearance(record);
    setClearanceNote(`Cleared upon verifying repeat exam score and student consultation.`);
  };

  const handleExecuteClearance = () => {
    if (!selectedRecordForClearance) return;
    handleConfirmBacklogClearance(selectedRecordForClearance.id, clearanceNote);
    setSelectedRecordForClearance(null);
    setClearanceNote('');
  };

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

      {/* Resolution Funnel Summary Analytics */}
      <ResolutionFunnelSummary
        records={backlogRecords}
        activeFilter={funnelStageFilter}
        onFilterSelect={(stage) => setFunnelStageFilter(funnelStageFilter === stage ? null : stage)}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_6px_20px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Department Backlog Candidates</h3>
            <p className="text-xs text-slate-500">
              Filter by subject, student, or clearance status; inspect reasons, track repeat exams, and confirm clearance.
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
                <th className="py-4 px-4">Reason for Backlog</th>
                <th className="py-4 px-4">Repeat Exam Progress</th>
                <th className="py-4 px-4">Student Updates</th>
                <th className="py-4 px-4">Clearance Status</th>
                <th className="py-4 px-6 text-right">Faculty Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No backlog candidates found matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
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

                    {/* Backlog Reason */}
                    <td className="py-4 px-4">
                      <div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                          item.backlogReason.includes('Attendance')
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {item.backlogReason}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          Score: {item.originalMarks} / {item.maxMarks}
                        </span>
                      </div>
                    </td>

                    {/* Repeat Exam Progress */}
                    <td className="py-4 px-4">
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
                        <span className="text-[10px] text-slate-400 block">
                          Result: {item.resultStatus}
                        </span>
                      </div>
                    </td>

                    {/* Student Updates Status */}
                    <td className="py-4 px-4">
                      <div className="space-y-1 text-[11px]">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">Teacher Met:</span>
                          <strong className={item.metTeacher ? 'text-emerald-600' : 'text-amber-600'}>
                            {item.metTeacher ? 'Yes ✓' : 'Pending'}
                          </strong>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">Assignments:</span>
                          <strong className={item.assignmentsCompleted === 'Completed' ? 'text-emerald-600' : 'text-slate-600'}>
                            {item.assignmentsCompleted}
                          </strong>
                        </div>
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

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.clearanceStatus !== 'Cleared' ? (
                          <button
                            onClick={() => handleOpenClearanceModal(item)}
                            className="px-3 py-1.5 rounded-xl bg-[#13141b] text-white font-bold text-xs hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <Check size={13} /> Confirm Clearance
                          </button>
                        ) : (
                          <button
                            onClick={() => onOpenCertificate && onOpenCertificate(item)}
                            title="View Official University Clearance Certificate"
                            className="px-2.5 py-1.5 rounded-xl bg-[#e7f6ee] text-[#166534] hover:bg-[#d8f0e2] border border-[#bce8ce] font-bold text-xs flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-xs"
                          >
                            <Award size={13} /> Certificate
                          </button>
                        )}

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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal: Confirm Backlog Clearance */}
      {selectedRecordForClearance && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#e7f6ee] text-[#166534] flex items-center justify-center font-bold">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Confirm Backlog Clearance</h4>
                  <p className="text-[11px] text-slate-500">Official sign-off for academic clearance certificate</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecordForClearance(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Student Name:</span>
                <strong className="text-slate-900">{selectedRecordForClearance.studentName} ({selectedRecordForClearance.usn})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Subject:</span>
                <strong className="text-slate-900">{selectedRecordForClearance.subjectCode} - {selectedRecordForClearance.subjectName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Backlog Reason:</span>
                <strong className="text-amber-700">{selectedRecordForClearance.backlogReason}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Repeat Exam Status:</span>
                <strong className="text-blue-700">{selectedRecordForClearance.repeatExamStatus}</strong>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Faculty Verification Note / Endorsement:
              </label>
              <textarea
                rows={3}
                value={clearanceNote}
                onChange={(e) => setClearanceNote(e.target.value)}
                placeholder="Enter verification notes for the exam cell..."
                className="w-full p-3 rounded-2xl bg-[#f6f7fa] border border-slate-200 text-xs text-slate-900 outline-none focus:bg-white focus:border-slate-400"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedRecordForClearance(null)}
                className="px-4 py-2.5 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteClearance}
                className="px-5 py-2.5 rounded-xl bg-[#166534] hover:bg-[#13572d] text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <CheckCircle2 size={15} /> Confirm & Mark Cleared
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
