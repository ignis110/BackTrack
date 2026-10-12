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
  MessageSquare,
  Send,
  Filter,
  Award
} from 'lucide-react';
import {
  getBacklogRecords,
  updateStudentBacklogProgress,
  saveBacklogRecords,
  DEMO_STUDENTS
} from '../utils/backlogStore';
import ClearanceCertificateModal from '../components/ClearanceCertificateModal';
import { RecordFunnelStepper } from '../components/ResolutionFunnel';

// Mock Initial Student Data
const STUDENT_PROFILE = {
  name: 'Aarav Patel',
  usn: '1BT23BCA014',
  course: 'Bachelor of Computer Applications (BCA)',
  semester: 'Semester 3',
  semesterType: 'Odd Semester',
  section: 'Section A',
  email: 'aarav.p@student.univ.edu',
  phone: '+91 98765 43210',
  advisor: 'Dr. Ramesh Sharma (HOD)',
  cgpa: 8.74,
  creditsEarned: 52,
  totalCredits: 140,
  midsemAverage: 88.5
};

const ENROLLED_SUBJECTS = [
  // Odd Semester Subjects (Semester 3)
  {
    code: 'BCA301',
    name: 'Database Management Systems',
    credits: 4,
    semester: 'Semester 3',
    semesterType: 'Odd',
    type: 'Core Theory',
    faculty: 'Dr. Ramesh Sharma',
    midsemMarks: 44,
    midsemMax: 50,
    midsemStatus: 'Evaluated (Passed)',
    endsemStatus: 'Eligible - Hall Ticket Issued',
    endsemMarks: 86,
    endsemMax: 100,
    status: 'Eligible for End-Sem Exam'
  },
  {
    code: 'BCA302',
    name: 'Operating Systems & Architecture',
    credits: 4,
    semester: 'Semester 3',
    semesterType: 'Odd',
    type: 'Core Theory',
    faculty: 'Prof. Ananya Sen',
    midsemMarks: 41,
    midsemMax: 50,
    midsemStatus: 'Evaluated (Passed)',
    endsemStatus: 'Eligible - Hall Ticket Issued',
    endsemMarks: 82,
    endsemMax: 100,
    status: 'Eligible for End-Sem Exam'
  },
  {
    code: 'BCA303',
    name: 'Python Programming & Data Structures',
    credits: 3,
    semester: 'Semester 3',
    semesterType: 'Odd',
    type: 'Practical Lab',
    faculty: 'Dr. Ramesh Sharma',
    midsemMarks: 48,
    midsemMax: 50,
    midsemStatus: 'Evaluated (Distinction)',
    endsemStatus: 'Eligible - Hall Ticket Issued',
    endsemMarks: 94,
    endsemMax: 100,
    status: 'Eligible for End-Sem Exam'
  },
  {
    code: 'BCA304',
    name: 'Discrete Mathematical Structures',
    credits: 4,
    semester: 'Semester 3',
    semesterType: 'Odd',
    type: 'Core Theory',
    faculty: 'Prof. S. Ranganath',
    midsemMarks: 40,
    midsemMax: 50,
    midsemStatus: 'Evaluated (Passed)',
    endsemStatus: 'Eligible - Hall Ticket Issued',
    endsemMarks: 78,
    endsemMax: 100,
    status: 'Eligible for End-Sem Exam'
  },
  // Even Semester Subjects (Semester 2 Record)
  {
    code: 'BCA201',
    name: 'Data Structures with C++',
    credits: 4,
    semester: 'Semester 2',
    semesterType: 'Even',
    type: 'Core Theory',
    faculty: 'Prof. Ananya Sen',
    midsemMarks: 45,
    midsemMax: 50,
    midsemStatus: 'Evaluated (Passed)',
    endsemStatus: 'Cleared (Grade: A)',
    endsemMarks: 88,
    endsemMax: 100,
    status: 'Term Cleared'
  },
  {
    code: 'BCA202',
    name: 'Computer Organization & Architecture',
    credits: 4,
    semester: 'Semester 2',
    semesterType: 'Even',
    type: 'Core Theory',
    faculty: 'Dr. Ramesh Sharma',
    midsemMarks: 42,
    midsemMax: 50,
    midsemStatus: 'Evaluated (Passed)',
    endsemStatus: 'Cleared (Grade: A+)',
    endsemMarks: 90,
    endsemMax: 100,
    status: 'Term Cleared'
  }
];

const STUDENT_REQUESTS = [
  {
    id: 'REQ-STU-01',
    subject: 'BCA303 - Python Programming',
    semesterCycle: 'Odd Semester',
    examType: 'Mid-Semester Exam',
    type: 'Mid-Semester Re-evaluation',
    reason: 'Requesting re-evaluation of Section B problem solving answers.',
    date: 'Oct 01, 2026',
    status: 'Approved',
    facultyResponse: 'Mid-semester score upgraded to 48/50 upon verification.'
  },
  {
    id: 'REQ-STU-02',
    subject: 'BCA302 - Operating Systems',
    semesterCycle: 'Odd Semester',
    examType: 'End-Semester Exam',
    type: 'End-Semester Hall Ticket Endorsement',
    reason: 'Requesting early hall ticket verification for upcoming semester finals.',
    date: 'Oct 03, 2026',
    status: 'Pending',
    facultyResponse: 'Under review by Dean of Academic Examinations.'
  }
];

const NOTIFICATIONS_LIST = [
  {
    id: 'N-01',
    title: 'Mid-Term Exam Schedule Released',
    category: 'Exam Branch',
    time: '3 hours ago',
    body: 'The timetable for Mid-Term IA-2 has been finalized. BCA301 exam is on Oct 19.',
    read: false
  },
  {
    id: 'N-02',
    title: 'Backlog Re-evaluation Portal Open',
    category: 'Circular',
    time: '1 day ago',
    body: 'Students with backlogs from Sem 1 and 2 can register till Oct 14.',
    read: false
  },
  {
    id: 'N-03',
    title: 'Assignment #3 Uploaded: SQL Triggers',
    category: 'Academics',
    time: '2 days ago',
    body: 'Dr. Ramesh Sharma uploaded Assignment 3 for DBMS. Submission deadline: Oct 15.',
    read: true
  }
];

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

  // Load current user from login session or fallback to mock
  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && (u.role === 'student' || !u.role)) {
          const rawEmail = u.email || STUDENT_PROFILE.email;
          const cleanedEmail = sanitizeEmail(rawEmail);
          if (cleanedEmail !== rawEmail) {
            localStorage.setItem('currentUser', JSON.stringify({ ...u, email: cleanedEmail }));
          }
          return {
            ...STUDENT_PROFILE,
            name: u.name || u.username || STUDENT_PROFILE.name,
            usn: u.usn || u.id || u.username || STUDENT_PROFILE.usn,
            email: cleanedEmail
          };
        }
      }
    } catch {}
    return STUDENT_PROFILE;
  });
  const [subjects] = useState(ENROLLED_SUBJECTS);
  const [requests, setRequests] = useState(STUDENT_REQUESTS);
  const [notifications, setNotifications] = useState(NOTIFICATIONS_LIST);
  const [backlogRecords, setBacklogRecords] = useState(() => getBacklogRecords());
  const [selectedCertificateRecord, setSelectedCertificateRecord] = useState(null);

  const handleSwitchStudent = (stu) => {
    setProfile(stu);
    try {
      localStorage.setItem('currentUser', JSON.stringify({
        ...stu,
        role: 'student'
      }));
    } catch {}
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

  // New Request Modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    subject: 'BCA301 - Database Management Systems',
    semesterCycle: 'Odd Semester',
    semester: 'Semester 3',
    examType: 'Mid-Semester Exam',
    type: 'Mid-Semester Re-evaluation',
    reason: ''
  });

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
    const newReq = {
      id: `REQ-STU-${Math.floor(10 + Math.random() * 90)}`,
      subject: requestForm.subject,
      semesterCycle: requestForm.semesterCycle,
      semester: requestForm.semester,
      examType: requestForm.examType,
      type: requestForm.type,
      reason: requestForm.reason,
      date: 'Today, Oct 7',
      status: 'Pending',
      facultyResponse: `Petition for ${requestForm.examType} submitted for faculty advisor review.`
    };
    setRequests([newReq, ...requests]);
    triggerToast(`Petition submitted for ${requestForm.examType} (${requestForm.semesterCycle})!`);
    setIsApplyModalOpen(false);
    setRequestForm({
      subject: 'BCA301 - Database Management Systems',
      semesterCycle: 'Odd Semester',
      semester: 'Semester 3',
      examType: 'Mid-Semester Exam',
      type: 'Mid-Semester Re-evaluation',
      reason: ''
    });
  };

  return (
    <div className="flex h-screen bg-[#f6f7fa] font-sans overflow-hidden text-[#181920]">
      {/* Toast Feedback */}
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
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-[#fdeedc]">Student</span>
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
                  <span className="w-2 h-2 rounded-full bg-[#fdeedc] inline-block"></span>
                </h1>
                <p className="text-[11px] text-slate-400 font-medium">Student Academic Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="px-3 py-6 space-y-1.5">
            <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">Student Hub</div>

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
              badgeColor="bg-[#fdeedc] text-[#8a4816]"
              onClick={() => { setActiveTab('Backlog Tracking'); setIsMobileMenuOpen(false); }}
            />
            <SidebarBtn
              icon={<FileCheck size={19} />}
              label="My Requests"
              active={activeTab === 'My Requests'}
              badge={requests.length}
              onClick={() => { setActiveTab('My Requests'); setIsMobileMenuOpen(false); }}
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
        <div className="p-4 border-t border-white/5 bg-[#171822]/60">
          <div className="flex items-center justify-between p-2 rounded-2xl bg-white/5 border border-white/5">
            <button
              onClick={() => { setActiveTab('Settings & Profile'); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-3 text-left hover:opacity-85 transition cursor-pointer flex-1 mr-2 group"
              title="Click to view Profile & Settings"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#fdeedc] to-[#e7f6ee] text-[#13141b] flex items-center justify-center font-bold text-xs shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                {profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'ST'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white leading-tight truncate group-hover:text-[#fdeedc] transition-colors">{profile.name}</p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium font-mono truncate">
                  {profile.usn}
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
        {/* 1-Click Demo Student Switcher Bar */}
        <div className="bg-[#14151b] text-white px-6 py-2.5 flex items-center justify-between text-xs overflow-x-auto gap-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-extrabold text-[#fdeedc] tracking-wider uppercase text-[10px]">Demo Student:</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {DEMO_STUDENTS.map((stu) => {
              const isSelected = profile.usn === stu.usn;
              return (
                <button
                  key={stu.id}
                  onClick={() => handleSwitchStudent(stu)}
                  className={`px-3 py-1 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#fdeedc] text-[#8a4816] shadow-xs ring-1 ring-[#fcd7b5]'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <span>{stu.name.split(' ')[0]}</span>
                  <span className="font-mono text-[10px] opacity-75">({stu.usn.slice(-3)})</span>
                  {stu.name === 'Rohan Gupta' && (
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">Cleared ✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Top Header */}
        <header className="h-20 px-6 lg:px-8 flex items-center justify-between border-b border-slate-200/60 bg-[#f6f7fa]/90 backdrop-blur-md">
          <div>
            <h2 className="text-xl lg:text-2xl font-extrabold text-[#181920] tracking-tight">{activeTab}</h2>
            <p className="text-xs text-slate-500 font-medium">{profile.course} • {profile.semester}</p>
          </div>

          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#13141b] text-white text-xs font-bold hover:bg-slate-800 transition shadow-xs"
            >
              <Plus size={15} /> Apply / Petition
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

            <button
              onClick={() => setActiveTab('Settings & Profile')}
              className="flex items-center gap-2.5 pl-2 hover:opacity-85 transition cursor-pointer text-left"
              title="Click to view Profile & Settings"
            >
              <div className="w-9 h-9 rounded-2xl bg-[#13141b] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'ST'}
              </div>
              <div className="hidden md:block text-left">
                <span className="text-xs font-bold text-slate-900 block leading-tight">{profile.name}</span>
                <span className="text-[10px] text-slate-400 font-medium font-mono">{profile.usn}</span>
              </div>
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
            />
          )}

          {activeTab === 'My Subjects' && (
            <StudentSubjectsTab
              subjects={subjects}
              triggerToast={triggerToast}
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

          {activeTab === 'My Requests' && (
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
              triggerToast={triggerToast}
            />
          )}
        </div>
      </main>

      {/* Modal: New Student Petition / Re-evaluation Application */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Academic Exam Petition</h3>
                <p className="text-[11px] text-slate-400">Mid-Semester & End-Semester evaluation request</p>
              </div>
              <button onClick={() => setIsApplyModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Semester Cycle</label>
                  <select
                    value={requestForm.semesterCycle}
                    onChange={(e) => {
                      const newCycle = e.target.value;
                      setRequestForm({
                        ...requestForm,
                        semesterCycle: newCycle,
                        semester: newCycle === 'Odd Semester' ? 'Semester 3' : 'Semester 2'
                      });
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none font-medium"
                  >
                    <option value="Odd Semester">Odd Semester (Sem 1, 3, 5, 7)</option>
                    <option value="Even Semester">Even Semester (Sem 2, 4, 6, 8)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Semester</label>
                  <select
                    value={requestForm.semester}
                    onChange={(e) => setRequestForm({ ...requestForm, semester: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none font-medium"
                  >
                    {requestForm.semesterCycle === 'Odd Semester' ? (
                      <>
                        <option value="Semester 1">Semester 1 (Odd)</option>
                        <option value="Semester 3">Semester 3 (Odd)</option>
                        <option value="Semester 5">Semester 5 (Odd)</option>
                        <option value="Semester 7">Semester 7 (Odd)</option>
                      </>
                    ) : (
                      <>
                        <option value="Semester 2">Semester 2 (Even)</option>
                        <option value="Semester 4">Semester 4 (Even)</option>
                        <option value="Semester 6">Semester 6 (Even)</option>
                        <option value="Semester 8">Semester 8 (Even)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Examination Scope</label>
                  <select
                    value={requestForm.examType}
                    onChange={(e) => setRequestForm({ ...requestForm, examType: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none font-medium"
                  >
                    <option value="Mid-Semester Exam">Mid-Semester Exam (Midsem)</option>
                    <option value="End-Semester Exam">End-Semester Exam (Endsem)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Petition Category</label>
                  <select
                    value={requestForm.type}
                    onChange={(e) => setRequestForm({ ...requestForm, type: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none font-medium"
                  >
                    {requestForm.examType === 'Mid-Semester Exam' ? (
                      <>
                        <option value="Mid-Semester Re-evaluation">Mid-Semester Re-evaluation</option>
                        <option value="Mid-Semester Retest / Make-up">Mid-Semester Retest / Make-up</option>
                        <option value="Mid-Semester Internal Totaling">Mid-Semester Internal Totaling</option>
                      </>
                    ) : (
                      <>
                        <option value="End-Semester Backlog Exam Registration">End-Semester Backlog Exam Registration</option>
                        <option value="End-Semester Script Re-checking">End-Semester Script Re-checking</option>
                        <option value="End-Semester Hall Ticket Endorsement">End-Semester Hall Ticket Endorsement</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Subject</label>
                <select
                  value={requestForm.subject}
                  onChange={(e) => setRequestForm({ ...requestForm, subject: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none font-medium"
                >
                  <option value="BCA301 - Database Management Systems (Sem 3 - Odd)">BCA301 - Database Management Systems (Sem 3 - Odd)</option>
                  <option value="BCA302 - Operating Systems (Sem 3 - Odd)">BCA302 - Operating Systems (Sem 3 - Odd)</option>
                  <option value="BCA303 - Python Programming (Sem 3 - Odd)">BCA303 - Python Programming (Sem 3 - Odd)</option>
                  <option value="BCA304 - Discrete Mathematical Structures (Sem 3 - Odd)">BCA304 - Discrete Mathematical Structures (Sem 3 - Odd)</option>
                  <option value="BCA201 - Data Structures with C++ (Sem 2 - Even)">BCA201 - Data Structures with C++ (Sem 2 - Even)</option>
                  <option value="BCA202 - Computer Architecture (Sem 2 - Even)">BCA202 - Computer Architecture (Sem 2 - Even)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason / Academic Justification</label>
                <textarea
                  required
                  rows={3}
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                  placeholder="Detail your request for faculty and examination branch evaluation..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#13141b] text-white font-bold hover:bg-slate-800"
                >
                  Submit Application
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
            ${active ? 'bg-[#13141b] text-white' : 'bg-white/10 text-slate-300'}
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
function StudentDashboardTab({ profile, subjects, requests, backlogRecords = [], onNavigate, openApplyModal }) {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="w-full bg-white rounded-3xl p-6 lg:p-7 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden flex flex-col justify-between">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fdeedc] text-[#8a4816] text-xs font-semibold mb-3">
            <Sparkles size={13} /> Academic Status: Good Standing
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {profile.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
            You are currently enrolled in <strong>{subjects.length} course subjects</strong> for {profile.semester}. 
            Your faculty advisor is <strong>{profile.advisor}</strong>. Keep up your continuous evaluation marks!
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-4 relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-[#f6f7fa] px-3.5 py-2 rounded-xl font-mono">
            USN: {profile.usn} • {profile.section}
          </div>
          <button
            onClick={() => onNavigate('My Subjects')}
            className="text-xs font-bold text-[#13141b] bg-[#f4e8fd] hover:bg-[#eccffc] px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            My Subjects ({subjects.length}) <ChevronRight size={14} />
          </button>
          <button
            onClick={openApplyModal}
            className="text-xs font-bold text-[#13141b] bg-[#e7f6ee] hover:bg-[#d8f0e2] px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            Submit Petition <ChevronRight size={14} />
          </button>
        </div>

        <div className="absolute right-[-40px] top-[-40px] w-64 h-64 rounded-full bg-gradient-to-br from-[#fdeedc]/60 to-[#f4e8fd]/60 blur-2xl pointer-events-none" />
      </div>

      {/* 4 Pastel Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Current CGPA - Pastel Mint */}
        <div className="bg-[#e7f6ee] border border-[#bce8ce] rounded-3xl p-5 shadow-[0_6px_20px_rgba(231,246,238,0.4)]">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#cceed7] text-[#166534] flex items-center justify-center font-bold shadow-xs">
              <GraduationCap size={22} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#dcf1e3] text-[#166534]">
              Distinction
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-[#166534]/80 uppercase tracking-wide">Cumulative CGPA</span>
            <div className="text-2xl font-black text-[#133722] tracking-tight mt-0.5">{profile.cgpa} / 10.0</div>
            <p className="text-[11px] text-[#166534] mt-1 font-medium">Ranked #4 in Section A</p>
          </div>
        </div>

        {/* Mid-Semester Performance - Pastel Sky Blue */}
        <div className="bg-[#e9f2fc] border border-[#bedafb] rounded-3xl p-5 shadow-[0_6px_20px_rgba(233,242,252,0.4)]">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#d3e5fa] text-[#1e40af] flex items-center justify-center font-bold shadow-xs">
              <Sparkles size={22} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#dce9fb] text-[#1e40af]">
              Evaluated
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-[#1e40af]/80 uppercase tracking-wide">Mid-Semester Avg</span>
            <div className="text-2xl font-black text-[#102d54] tracking-tight mt-0.5">{profile.midsemAverage || 88.5}%</div>
            <p className="text-[11px] text-[#1e40af] mt-1 font-medium">All midsem papers cleared</p>
          </div>
        </div>

        {/* Enrolled Subjects - Pastel Lavender */}
        <div
          onClick={() => onNavigate('My Subjects')}
          className="bg-[#f4e8fd] border border-[#e8c7fb] rounded-3xl p-5 shadow-[0_6px_20px_rgba(244,232,253,0.4)] cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#eccffc] text-[#6b21a8] flex items-center justify-center font-bold shadow-xs">
              <BookOpen size={22} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#eedafc] text-[#6b21a8]">
              {profile.semester}
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-[#6b21a8]/80 uppercase tracking-wide">Enrolled Subjects</span>
            <div className="text-2xl font-black text-[#331342] tracking-tight mt-0.5">{subjects.length} Courses</div>
            <p className="text-[11px] text-[#6b21a8] mt-1 font-medium">Odd & Even Semester Modules</p>
          </div>
        </div>

        {/* Backlog Status - Pastel Peach */}
        <div
          onClick={() => onNavigate('Backlog Tracking')}
          className="bg-[#fdeedc] border border-[#fcd7b5] rounded-3xl p-5 shadow-[0_6px_20px_rgba(250,238,220,0.4)] cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#f7d6b8] text-[#8a4816] flex items-center justify-center font-bold shadow-xs">
              <GraduationCap size={22} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#fae3cb] text-[#8a4816]">
              {backlogRecords.filter((b) => b.studentName === profile.name || b.usn === profile.usn).length > 0 ? 'Active' : 'All Clear'}
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-[#8a4816]/80 uppercase tracking-wide">Backlog Tracking</span>
            <div className="text-2xl font-black text-[#2c1d11] tracking-tight mt-0.5">
              {backlogRecords.filter((b) => b.studentName === profile.name || b.usn === profile.usn).length || backlogRecords.length} Subjects
            </div>
            <p className="text-[11px] text-[#8a4816] mt-1 font-medium">Click to update teacher progress</p>
          </div>
        </div>
      </div>

      {/* Subjects Overview & Petitions Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-extrabold text-slate-900 tracking-tight">Your Enrolled Courses</h4>
              <p className="text-xs text-slate-500">Mid-Semester evaluation and End-Semester exam standing</p>
            </div>
            <button onClick={() => onNavigate('My Subjects')} className="text-xs font-bold text-[#8a4816] hover:underline">
              View all details
            </button>
          </div>

          <div className="space-y-3">
            {subjects.map((sub) => (
              <div key={sub.code} className="p-4 rounded-2xl bg-[#fbfbfd] border border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-slate-900">{sub.code}</span>
                    <span className="text-xs font-bold text-slate-700">{sub.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sub.semesterType === 'Odd' ? 'bg-[#fdeedc] text-[#8a4816]' : 'bg-[#e9f2fc] text-[#1e40af]'}`}>
                      {sub.semester || (sub.semesterType + ' Sem')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{sub.faculty} • {sub.type}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold">MIDSEM SCORE</span>
                    <span className="text-xs font-extrabold text-emerald-600">{sub.midsemMarks} / {sub.midsemMax || 50}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold">ENDSEM EXAM</span>
                    <span className="text-xs font-extrabold text-[#1e40af]">{sub.endsemStatus ? 'Eligible' : 'Pending'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Petitions / Requests Status */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-extrabold text-slate-900 tracking-tight">Submitted Petitions</h4>
              <button onClick={() => onNavigate('My Requests')} className="text-xs font-bold text-[#6b21a8] hover:underline">
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
            className="w-full mt-4 py-2.5 bg-[#13141b] text-white rounded-2xl font-bold text-xs hover:bg-slate-800 transition"
          >
            + Apply for Re-eval or Waiver
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// TAB 2: MY SUBJECTS DETAILED VIEW
// =============================================================
function StudentSubjectsTab({ subjects, triggerToast }) {
  const [semesterFilter, setSemesterFilter] = useState('All'); // 'All', 'Odd', 'Even'

  const filteredSubjects = useMemo(() => {
    if (semesterFilter === 'All') return subjects;
    return subjects.filter((s) => s.semesterType === semesterFilter);
  }, [subjects, semesterFilter]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_6px_20px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-base text-slate-900">Enrolled Semester Syllabus & Exams</h3>
          <p className="text-xs text-slate-500">Track Mid-Semester and End-Semester assessments by semester cycle</p>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-[#f6f7fa] rounded-2xl flex-wrap">
          <button
            onClick={() => setSemesterFilter('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${semesterFilter === 'All' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
          >
            All Semesters ({subjects.length})
          </button>
          <button
            onClick={() => setSemesterFilter('Odd')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${semesterFilter === 'Odd' ? 'bg-[#fdeedc] text-[#8a4816] shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Odd Semesters (Sem 1, 3, 5, 7)
          </button>
          <button
            onClick={() => setSemesterFilter('Even')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${semesterFilter === 'Even' ? 'bg-[#e9f2fc] text-[#1e40af] shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Even Semesters (Sem 2, 4, 6, 8)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSubjects.map((sub, i) => (
          <div
            key={sub.code}
            className={`
              p-6 rounded-3xl border shadow-xs hover:shadow-md transition-all flex flex-col justify-between
              ${i % 2 === 0 ? 'bg-white border-slate-100' : 'bg-white border-slate-100'}
            `}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-slate-900">{sub.code}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sub.semesterType === 'Odd' ? 'bg-[#fdeedc] text-[#8a4816]' : 'bg-[#e9f2fc] text-[#1e40af]'}`}>
                    {sub.semester} ({sub.semesterType} Semester)
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {sub.credits} Credits • {sub.type}
                </span>
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mt-2">{sub.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">Faculty In-charge: <strong>{sub.faculty}</strong></p>

              {/* Mid-Semester & End-Semester Exam Grid */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-[#f6f7fa] rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">MID-SEMESTER EXAM</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">Passed</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-black text-slate-900 text-base">{sub.midsemMarks}</span>
                    <span className="text-slate-400 text-xs">/ {sub.midsemMax || 50} Marks</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{sub.midsemStatus || 'Evaluated'}</p>
                </div>

                <div className="p-3.5 bg-[#fbf9fe] rounded-2xl border border-[#f1e5fa]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#6b21a8] font-bold block uppercase">END-SEMESTER EXAM</span>
                    <span className="text-[10px] font-bold text-[#1e40af] bg-blue-50 px-1.5 py-0.5 rounded-md">Eligible</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-black text-slate-900 text-base">{sub.endsemMarks || 85}</span>
                    <span className="text-slate-400 text-xs">/ {sub.endsemMax || 100} Marks</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{sub.endsemStatus || 'Hall Ticket Issued'}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px]">
                {sub.status}
              </span>
              <button
                onClick={() => triggerToast(`Syllabus and exam notes downloaded for ${sub.code}!`)}
                className="flex items-center gap-1 font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                <Download size={13} /> Syllabus & Model Papers
              </button>
            </div>
          </div>
        ))}
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
    backlogReason: 'Low Marks in End-Sem',
    originalMarks: 32,
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
    const newRecord = {
      id: `BL-${Date.now().toString().slice(-4)}`,
      studentId: studentProfile.usn || 'STU-01',
      studentName: studentProfile.name,
      usn: studentProfile.usn,
      semester: studentProfile.semester || 'Sem 3 (Odd)',
      subjectCode: newBacklog.subjectCode,
      subjectName: newBacklog.subjectName,
      backlogReason: newBacklog.backlogReason,
      originalMarks: Number(newBacklog.originalMarks) || 30,
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
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  viewFilter === 'my' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                My Backlogs ({myRecords.length})
              </button>
              <button
                onClick={() => setViewFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  viewFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
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
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.backlogReason.includes('Attendance')
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      Reason: {item.backlogReason}
                    </span>

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
                        <Sparkles size={13} /> Faculty Guidance & Advice ({item.facultyAuthor || 'Dr. Ramesh Sharma'})
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
                  <option value="Low Marks in End-Sem">Low Marks in End-Sem</option>
                  <option value="Attendance Shortage">Attendance Shortage</option>
                  <option value="Missed Internal Exam">Missed Internal Exam</option>
                </select>
              </div>

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
        <p className="text-xs text-slate-500 mb-6">Step-by-step examination and re-evaluation procedure</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#fdeedc]/60 border border-[#fcd7b5]">
            <span className="w-6 h-6 rounded-full bg-[#f7d6b8] text-[#8a4816] flex items-center justify-center font-bold text-xs mb-2">1</span>
            <span className="font-bold text-[#8a4816] block">Submit Petition & Progress</span>
            <p className="text-[11px] text-slate-500 mt-1">Submit petition via BackTrack portal and update progress reports for teacher guidance.</p>
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
// TAB 4: MY REQUESTS & PETITIONS
// =============================================================
function StudentRequestsTab({ requests, openApplyModal }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_6px_20px_rgba(0,0,0,0.02)] flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-base text-slate-900">Your Submitted Petitions</h3>
          <p className="text-xs text-slate-500">Track real-time status updates and comments from faculty</p>
        </div>
        <button
          onClick={openApplyModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#13141b] text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition"
        >
          <Plus size={15} /> New Petition
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
                {r.semesterCycle && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.semesterCycle.includes('Odd') ? 'bg-[#fdeedc] text-[#8a4816]' : 'bg-[#e9f2fc] text-[#1e40af]'}`}>
                    {r.semesterCycle}
                  </span>
                )}
                {r.examType && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f4e8fd] text-[#6b21a8]">
                    {r.examType}
                  </span>
                )}
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {r.subject}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${r.status === 'Approved' ? 'bg-[#e7f6ee] text-[#166534]' : 'bg-amber-50 text-amber-700'}`}>
                  {r.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-3 rounded-2xl max-w-xl">
                <strong>Your Reason:</strong> &ldquo;{r.reason}&rdquo;
              </p>

              {r.facultyResponse && (
                <p className="text-xs text-[#6b21a8] mt-2 bg-[#f4e8fd]/40 p-3 rounded-2xl max-w-xl border border-[#e8c7fb]">
                  <strong>Faculty Feedback:</strong> {r.facultyResponse}
                </p>
              )}

              <span className="text-[10px] text-slate-400 block mt-2">Submitted: {r.date}</span>
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
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
function StudentProfileSettingsTab({ profile, setProfile, triggerToast }) {
  const [profileForm, setProfileForm] = useState({
    name: profile.name,
    usn: profile.usn,
    email: sanitizeEmail(profile.email),
    phone: profile.phone
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    const cleanMail = sanitizeEmail(profileForm.email);
    const updated = { ...profile, ...profileForm, email: cleanMail };
    setProfile(updated);
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
          email: cleanMail
        })
      );
    } catch {}
    triggerToast('Profile details updated and saved successfully!');
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
            <p className="text-xs text-slate-500 font-mono">USN: <strong>{profile.usn}</strong> • {profile.section}</p>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#e7f6ee] text-[#166534] inline-block mt-1">
              {profile.course}
            </span>
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

          <div className="pt-2 text-right">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#13141b] text-white rounded-2xl font-bold hover:bg-slate-800 transition cursor-pointer"
            >
              Save Profile Updates
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
