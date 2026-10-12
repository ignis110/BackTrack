import { useState, useMemo, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  UserCheck,
  Search,
  Bell,
  Plus,
  Edit3,
  Trash2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Activity,
  Clock,
  Mail,
  Phone,
  Sparkles,
  Check,
  X,
  LogOut,
  Menu,
  ClipboardList,
  Filter,
  Award
} from 'lucide-react';
import { getBacklogRecords, confirmClearance } from '../utils/backlogStore';
import ClearanceCertificateModal from '../components/ClearanceCertificateModal';
import { ResolutionFunnelSummary } from '../components/ResolutionFunnel';

// Initial Mock Data
const INITIAL_STATS = {
  totalStudents: 1284,
  totalTeachers: 86,
  totalCourses: 14,
  totalSubjects: 142,
  pendingBacklogs: 58,
  clearedRate: 91.2
};

const INITIAL_ACTIVITIES = [
  { id: 1, user: 'Dr. Sharma', role: 'Teacher', action: 'Approved backlog registration for BCA301', time: '12 mins ago', type: 'approval' },
  { id: 2, user: 'Admin Office', role: 'Admin', action: 'Reset credentials for USN: 1BT23CS042', time: '45 mins ago', type: 'security' },
  { id: 3, user: 'Prof. Ananya Sen', role: 'Teacher', action: 'Assigned section B to Operating Systems (BCA302)', time: '2 hours ago', type: 'assignment' },
  { id: 4, user: 'System', role: 'Automation', action: 'Semester 4 grade audit completed with 0 errors', time: '5 hours ago', type: 'system' },
  { id: 5, user: 'Vikram Mehta', role: 'Student', action: 'Submitted backlog exam fee for Python Programming', time: 'Yesterday', type: 'student' }
];

const INITIAL_USERS = [
  { id: 'USR-101', name: 'Dr. Ramesh Sharma', email: 'sharma@univ.edu', role: 'Teacher', department: 'Computer Applications', status: 'Active', lastLogin: 'Today, 09:40 AM' },
  { id: 'USR-102', name: 'Aarav Patel', email: 'aarav.p@student.univ.edu', role: 'Student', department: 'Computer Applications', status: 'Active', lastLogin: 'Today, 11:15 AM' },
  { id: 'USR-103', name: 'Prof. Ananya Sen', email: 'ananya.s@univ.edu', role: 'Teacher', department: 'Information Technology', status: 'Active', lastLogin: 'Yesterday' },
  { id: 'USR-104', name: 'Rohan Gupta', email: 'rohan.g@student.univ.edu', role: 'Student', department: 'Electronics Eng.', status: 'Inactive', lastLogin: '3 days ago' },
  { id: 'USR-105', name: 'Dr. Maya Krishnan', email: 'maya.k@univ.edu', role: 'Teacher', department: 'Data Science', status: 'Active', lastLogin: 'Today, 08:30 AM' },
  { id: 'USR-106', name: 'Sneha Deshmukh', email: 'sneha.d@student.univ.edu', role: 'Student', department: 'Computer Applications', status: 'Active', lastLogin: '2 days ago' },
  { id: 'USR-107', name: 'Kavita Menon', email: 'kavita.admin@univ.edu', role: 'Admin', department: 'Examination Cell', status: 'Active', lastLogin: 'Just now' }
];

const INITIAL_COURSES = [
  { id: 'CRS-01', code: 'BCA', name: 'Bachelor of Computer Applications', duration: '3 Years (6 Sems)', totalSubjects: 36, head: 'Dr. Ramesh Sharma' },
  { id: 'CRS-02', code: 'B.Tech CSE', name: 'B.Tech in Computer Science & Engineering', duration: '4 Years (8 Sems)', totalSubjects: 48, head: 'Dr. Maya Krishnan' },
  { id: 'CRS-03', code: 'MCA', name: 'Master of Computer Applications', duration: '2 Years (4 Sems)', totalSubjects: 24, head: 'Prof. Ananya Sen' },
  { id: 'CRS-04', code: 'B.Tech ECE', name: 'B.Tech in Electronics & Communication', duration: '4 Years (8 Sems)', totalSubjects: 44, head: 'Dr. V. Rao' }
];

const INITIAL_SUBJECTS = [
  { id: 'SUB-301', code: 'BCA301', name: 'Database Management Systems', course: 'BCA', semester: 'Sem 3', credits: 4, type: 'Core', teacher: 'Dr. Ramesh Sharma', enrolled: 68 },
  { id: 'SUB-302', code: 'BCA302', name: 'Operating Systems & Architecture', course: 'BCA', semester: 'Sem 3', credits: 4, type: 'Core', teacher: 'Prof. Ananya Sen', enrolled: 68 },
  { id: 'SUB-303', code: 'BCA303', name: 'Python & Data Structures', course: 'BCA', semester: 'Sem 3', credits: 3, type: 'Practical', teacher: 'Dr. Ramesh Sharma', enrolled: 65 },
  { id: 'SUB-401', code: 'CSE401', name: 'Design and Analysis of Algorithms', course: 'B.Tech CSE', semester: 'Sem 4', credits: 4, type: 'Core', teacher: 'Dr. Maya Krishnan', enrolled: 112 },
  { id: 'SUB-402', code: 'CSE402', name: 'Computer Networks', course: 'B.Tech CSE', semester: 'Sem 4', credits: 3, type: 'Core', teacher: 'Dr. K. Narayanan', enrolled: 112 },
  { id: 'SUB-501', code: 'MCA501', name: 'Cloud Computing & Distributed Systems', course: 'MCA', semester: 'Sem 2', credits: 4, type: 'Elective', teacher: 'Prof. Ananya Sen', enrolled: 45 }
];

const INITIAL_TEACHERS = [
  {
    id: 'TCH-01',
    name: 'Dr. Ramesh Sharma',
    empId: 'FAC-1001',
    email: 'sharma@univ.edu',
    phone: '+91 98450 12890',
    department: 'Computer Applications',
    designation: 'Professor & HOD',
    subjects: ['BCA301 (DBMS)', 'BCA303 (Python)'],
    sections: ['BCA Sem 3 - Sec A', 'BCA Sem 3 - Sec B'],
    hoursPerWeek: 16,
    experience: '14 Years'
  },
  {
    id: 'TCH-02',
    name: 'Prof. Ananya Sen',
    empId: 'FAC-1002',
    email: 'ananya.s@univ.edu',
    phone: '+91 98765 43210',
    department: 'Information Technology',
    designation: 'Associate Professor',
    subjects: ['BCA302 (OS)', 'MCA501 (Cloud)'],
    sections: ['BCA Sem 3 - Sec A', 'MCA Sem 2'],
    hoursPerWeek: 18,
    experience: '9 Years'
  },
  {
    id: 'TCH-03',
    name: 'Dr. Maya Krishnan',
    empId: 'FAC-1003',
    email: 'maya.k@univ.edu',
    phone: '+91 91234 56789',
    department: 'Computer Science & Eng.',
    designation: 'Professor',
    subjects: ['CSE401 (Algorithms)'],
    sections: ['CSE Sem 4 - Sec A', 'CSE Sem 4 - Sec B'],
    hoursPerWeek: 14,
    experience: '12 Years'
  },
  {
    id: 'TCH-04',
    name: 'Dr. K. Narayanan',
    empId: 'FAC-1004',
    email: 'k.narayan@univ.edu',
    phone: '+91 99887 76655',
    department: 'Computer Science & Eng.',
    designation: 'Assistant Professor',
    subjects: ['CSE402 (Computer Networks)'],
    sections: ['CSE Sem 4 - Sec B'],
    hoursPerWeek: 12,
    experience: '6 Years'
  }
];

const INITIAL_STUDENTS = [
  {
    id: 'STU-01',
    name: 'Aarav Patel',
    usn: '1BT23BCA014',
    course: 'BCA',
    semester: 'Semester 3',
    semesterType: 'Odd',
    section: 'Section A',
    email: 'aarav.p@student.univ.edu',
    cgpa: 8.74,
    midsemMarks: 44,
    endsemStatus: 'Eligible',
    backlogsCount: 0,
    status: 'Active',
    enrolledSubjects: ['BCA301', 'BCA302', 'BCA303'],
    backlogsHistory: []
  },
  {
    id: 'STU-02',
    name: 'Sneha Deshmukh',
    usn: '1BT23BCA048',
    course: 'BCA',
    semester: 'Semester 3',
    semesterType: 'Odd',
    section: 'Section B',
    email: 'sneha.d@student.univ.edu',
    cgpa: 7.62,
    midsemMarks: 36,
    endsemStatus: 'Eligible',
    backlogsCount: 1,
    status: 'Active',
    enrolledSubjects: ['BCA301', 'BCA302', 'BCA303'],
    backlogsHistory: [{ code: 'BCA202', name: 'Discrete Mathematics', sem: 'Sem 2 (Even)', status: 'Exam Registration Pending' }]
  },
  {
    id: 'STU-03',
    name: 'Rohan Gupta',
    usn: '1BT22ECE082',
    course: 'B.Tech ECE',
    semester: 'Semester 5',
    semesterType: 'Odd',
    section: 'Section A',
    email: 'rohan.g@student.univ.edu',
    cgpa: 6.85,
    midsemMarks: 32,
    endsemStatus: 'Scheduled',
    backlogsCount: 2,
    status: 'Inactive',
    enrolledSubjects: ['ECE501', 'ECE502'],
    backlogsHistory: [
      { code: 'ECE301', name: 'Signals & Systems', sem: 'Sem 3 (Odd)', status: 'Exam Pending' },
      { code: 'ECE403', name: 'Analog Circuits', sem: 'Sem 4 (Even)', status: 'Fee Paid' }
    ]
  },
  {
    id: 'STU-04',
    name: 'Pooja Iyer',
    usn: '1BT22CSE031',
    course: 'B.Tech CSE',
    semester: 'Semester 4',
    semesterType: 'Even',
    section: 'Section A',
    email: 'pooja.i@student.univ.edu',
    cgpa: 9.15,
    midsemMarks: 46,
    endsemStatus: 'Eligible',
    backlogsCount: 0,
    status: 'Active',
    enrolledSubjects: ['CSE401', 'CSE402'],
    backlogsHistory: []
  },
  {
    id: 'STU-05',
    name: 'Vikram Mehta',
    usn: '1BT23BCA089',
    course: 'BCA',
    semester: 'Semester 3',
    semesterType: 'Odd',
    section: 'Section A',
    email: 'vikram.m@student.univ.edu',
    cgpa: 7.20,
    midsemMarks: 34,
    endsemStatus: 'Eligible',
    backlogsCount: 1,
    status: 'Active',
    enrolledSubjects: ['BCA301', 'BCA302', 'BCA303'],
    backlogsHistory: [{ code: 'BCA101', name: 'Intro to Programming in C', sem: 'Sem 1 (Odd)', status: 'Repeat Exam Scheduled' }]
  }
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global State Collections
  const [users, setUsers] = useState(INITIAL_USERS);
  const [courses] = useState(INITIAL_COURSES);
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const [teachers, setTeachers] = useState(INITIAL_TEACHERS);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [activities] = useState(INITIAL_ACTIVITIES);
  const [backlogRecords, setBacklogRecords] = useState(() => getBacklogRecords());

  // Real-time synchronization
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

  // Feedback Notification Banner
  const [notification, setNotification] = useState(null);

  const triggerToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const [adminUser] = useState(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && (u.role === 'admin' || !u.role)) {
          return {
            name: u.name || u.username || 'Exam Controller',
            id: u.id || u.username || 'ADM-01'
          };
        }
      }
    } catch {}
    return { name: 'Exam Controller', id: 'Superadmin' };
  });

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login?role=admin');
  };

  return (
    <div className="flex h-screen bg-[#f6f7fa] font-sans overflow-hidden text-[#181920]">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-[#13141b] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700/60 animate-bounce">
          <Sparkles size={18} className="text-[#f5caa0]" />
          <span className="text-sm font-medium">{notification.msg}</span>
          <button onClick={() => setNotification(null)} className="ml-2 text-slate-400 hover:text-white">
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
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-[#f5caa0]">Admin</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-300 hover:text-white">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Modern Sleek Dark Sidebar (Refined from Reference Palette) */}
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
          {/* Logo / Brand Header */}
          <div className="p-6 pb-6 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white text-[#13141b] flex items-center justify-center font-extrabold text-lg shadow-sm">
                BT
              </div>
              <div>
                <h1 className="font-extrabold text-lg tracking-tight flex items-center gap-1.5">
                  BackTrack
                  <span className="w-2 h-2 rounded-full bg-[#f5caa0] inline-block"></span>
                </h1>
                <p className="text-[11px] text-slate-400 font-medium">Academic & Backlog Ops</p>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <div className="px-3 py-6 space-y-1.5">
            <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">Menu Navigation</div>
            
            <SidebarNavButton
              icon={<LayoutDashboard size={19} />}
              label="Dashboard"
              active={activeTab === 'Dashboard'}
              onClick={() => { setActiveTab('Dashboard'); setIsMobileMenuOpen(false); }}
            />
            <SidebarNavButton
              icon={<Users size={19} />}
              label="Users Management"
              active={activeTab === 'Users Management'}
              badge={users.length}
              onClick={() => { setActiveTab('Users Management'); setIsMobileMenuOpen(false); }}
            />
            <SidebarNavButton
              icon={<BookOpen size={19} />}
              label="Courses & Subjects"
              active={activeTab === 'Courses & Subjects'}
              badge={subjects.length}
              onClick={() => { setActiveTab('Courses & Subjects'); setIsMobileMenuOpen(false); }}
            />
            <SidebarNavButton
              icon={<GraduationCap size={19} />}
              label="Teacher Management"
              active={activeTab === 'Teacher Management'}
              badge={teachers.length}
              onClick={() => { setActiveTab('Teacher Management'); setIsMobileMenuOpen(false); }}
            />
            <SidebarNavButton
              icon={<UserCheck size={19} />}
              label="Student Management"
              active={activeTab === 'Student Management'}
              badge={students.length}
              onClick={() => { setActiveTab('Student Management'); setIsMobileMenuOpen(false); }}
            />
            <SidebarNavButton
              icon={<ClipboardList size={19} />}
              label="Backlogs & Student Updates"
              active={activeTab === 'Backlogs & Student Updates'}
              badge={backlogRecords.filter((b) => b.clearanceStatus !== 'Cleared').length}
              onClick={() => { setActiveTab('Backlogs & Student Updates'); setIsMobileMenuOpen(false); }}
            />
          </div>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="p-4 border-t border-white/5 bg-[#171822]/60">
          <div className="flex items-center justify-between p-2 rounded-2xl bg-white/5 border border-white/5">
            <button
              onClick={() => { setActiveTab('Users Management'); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-3 text-left hover:opacity-85 transition cursor-pointer flex-1 mr-2 group"
              title="Click to view Users Management"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f5caa0] to-[#f4e6fc] text-[#13141b] flex items-center justify-center font-bold text-xs shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                {adminUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white leading-tight truncate group-hover:text-[#f5caa0] transition-colors">{adminUser.name}</p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium font-mono truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> {adminUser.id}
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

      {/* Main App Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden pt-16 lg:pt-0">
        {/* Top Header Bar */}
        <header className="h-20 px-6 lg:px-8 flex items-center justify-between border-b border-slate-200/60 bg-[#f6f7fa]/90 backdrop-blur-md">
          <div>
            <h2 className="text-xl lg:text-2xl font-extrabold text-[#181920] tracking-tight">{activeTab}</h2>
            <p className="text-xs text-slate-500 font-medium">BackTrack University Administration Portal</p>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Quick Pill Status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs text-xs font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Term: Spring 2026
            </div>

            {/* Notification Icon */}
            <button
              onClick={() => triggerToast('No unread system alarms')}
              className="relative p-2.5 rounded-2xl bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 shadow-xs hover:shadow-sm transition-all"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full"></span>
            </button>

            {/* Current Admin Pill */}
            <button
              onClick={() => setActiveTab('Users Management')}
              className="flex items-center gap-2.5 pl-2 hover:opacity-85 transition cursor-pointer text-left"
              title="Click to view Users Management"
            >
              <div className="w-9 h-9 rounded-2xl bg-[#13141b] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {adminUser.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <span className="text-xs font-bold text-slate-900 block leading-tight">{adminUser.name}</span>
                <span className="text-[10px] text-slate-400 font-medium font-mono">{adminUser.id}</span>
              </div>
            </button>
          </div>
        </header>

        {/* Scrollable View Content */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6 custom-scrollbar">
          {activeTab === 'Dashboard' && (
            <DashboardView
              stats={INITIAL_STATS}
              activities={activities}
              courses={courses}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'Users Management' && (
            <UsersManagementView
              users={users}
              setUsers={setUsers}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'Courses & Subjects' && (
            <CoursesSubjectsView
              courses={courses}
              subjects={subjects}
              setSubjects={setSubjects}
              teachers={teachers}
              students={students}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'Teacher Management' && (
            <TeacherManagementView
              teachers={teachers}
              setTeachers={setTeachers}
              subjects={subjects}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'Student Management' && (
            <StudentManagementView
              students={students}
              setStudents={setStudents}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'Backlogs & Student Updates' && (
            <AdminBacklogsUpdatesView
              backlogRecords={backlogRecords}
              setBacklogRecords={setBacklogRecords}
              triggerToast={triggerToast}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// -------------------------------------------------------------
// Sub-components: Sidebar Button
// -------------------------------------------------------------
function SidebarNavButton({ icon, label, active, badge, onClick }) {
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
// SECTION 1: DASHBOARD VIEW
// =============================================================
function DashboardView({ stats, activities, courses, onNavigate }) {
  return (
    <div className="space-y-6">
      {/* Top Welcome Greeting Banner */}
      <div className="w-full bg-white rounded-3xl p-6 lg:p-7 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden flex flex-col justify-between">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fdeedc] text-[#8a4816] text-xs font-semibold mb-3">
            <Sparkles size={13} /> BackTrack Portal Overview
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Good Morning, Controller Ariel
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
            Semester evaluations and backlog clearance pipelines are operating normally. 
            Review the recent student submissions and faculty assignments below.
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-4 relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-[#f6f7fa] px-3.5 py-2 rounded-xl">
            <Clock size={15} className="text-slate-400" />
            10:29 AM • Wednesday, Oct 7
          </div>
          <button
            onClick={() => onNavigate('Users Management')}
            className="text-xs font-bold text-[#13141b] bg-[#fdeedc] hover:bg-[#fad8ba] px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            Manage Users <ChevronRight size={14} />
          </button>
          <button
            onClick={() => onNavigate('Courses & Subjects')}
            className="text-xs font-bold text-[#13141b] bg-[#f4e8fd] hover:bg-[#eacffc] px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            View Subjects <ChevronRight size={14} />
          </button>
        </div>

        {/* Decorative soft pastel blob background */}
        <div className="absolute right-[-40px] top-[-40px] w-64 h-64 rounded-full bg-gradient-to-br from-[#fdeedc]/60 to-[#f4e8fd]/60 blur-2xl pointer-events-none" />
      </div>

      {/* 4 Pastel Stat Cards (Directly matching Peach, Lavender, Mint, Sky Palette) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Students - Pastel Peach */}
        <div
          onClick={() => onNavigate('Student Management')}
          className="bg-[#fdeedc] border border-[#fcd7b5] rounded-3xl p-5 shadow-[0_6px_20px_rgba(250,238,220,0.4)] cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#f7d6b8] text-[#8a4816] flex items-center justify-center font-bold shadow-xs">
              <Users size={22} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#fae3cb] text-[#8a4816]">
              Active Batch
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-[#8a4816]/80 uppercase tracking-wide">Total Students</span>
            <div className="text-2xl font-black text-[#2c1d11] tracking-tight mt-0.5">{stats.totalStudents}</div>
            <p className="text-[11px] text-[#8a4816] mt-1 font-medium">Enrolled across 14 degree programs</p>
          </div>
        </div>

        {/* Total Teachers - Pastel Lavender */}
        <div
          onClick={() => onNavigate('Teacher Management')}
          className="bg-[#f4e8fd] border border-[#e8c7fb] rounded-3xl p-5 shadow-[0_6px_20px_rgba(244,232,253,0.4)] cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#eccffc] text-[#6b21a8] flex items-center justify-center font-bold shadow-xs">
              <GraduationCap size={22} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#eedafc] text-[#6b21a8]">
              Faculty Staff
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-[#6b21a8]/80 uppercase tracking-wide">Total Teachers</span>
            <div className="text-2xl font-black text-[#331342] tracking-tight mt-0.5">{stats.totalTeachers}</div>
            <p className="text-[11px] text-[#6b21a8] mt-1 font-medium">Average 14.8 teaching hours/wk</p>
          </div>
        </div>

        {/* Total Courses & Subjects - Pastel Mint */}
        <div
          onClick={() => onNavigate('Courses & Subjects')}
          className="bg-[#e7f6ee] border border-[#bce8ce] rounded-3xl p-5 shadow-[0_6px_20px_rgba(231,246,238,0.4)] cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#cceed7] text-[#166534] flex items-center justify-center font-bold shadow-xs">
              <BookOpen size={22} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#dcf1e3] text-[#166534]">
              Accredited
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-[#166534]/80 uppercase tracking-wide">Courses & Subjects</span>
            <div className="text-2xl font-black text-[#133722] tracking-tight mt-0.5">
              {stats.totalCourses} <span className="text-sm font-semibold text-[#166534]">/ {stats.totalSubjects} Sub</span>
            </div>
            <p className="text-[11px] text-[#166534] mt-1 font-medium">Full credit system mapped</p>
          </div>
        </div>

        {/* Active Backlogs - Pastel Sky Blue */}
        <div
          onClick={() => onNavigate('Student Management')}
          className="bg-[#e9f2fc] border border-[#bedafb] rounded-3xl p-5 shadow-[0_6px_20px_rgba(233,242,252,0.4)] cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#d3e5fa] text-[#1e40af] flex items-center justify-center font-bold shadow-xs">
              <AlertCircle size={22} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#dce9fb] text-[#1e40af]">
              Action Needed
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-bold text-[#1e40af]/80 uppercase tracking-wide">Pending Backlogs</span>
            <div className="text-2xl font-black text-[#102d54] tracking-tight mt-0.5">{stats.pendingBacklogs}</div>
            <p className="text-[11px] text-[#1e40af] mt-1 font-medium">42 assigned for re-exam</p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Activities & Courses Quick Glance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities Feed (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h4 className="text-base font-extrabold text-slate-900 tracking-tight">Recent Activities</h4>
              <p className="text-xs text-slate-500">Live operational events logged across campus</p>
            </div>
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Activity size={14} className="text-emerald-500" /> Live Feed
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {activities.map((act) => (
              <div key={act.id} className="py-3.5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`
                      w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5
                      ${act.role === 'Teacher' ? 'bg-[#f4e8fd] text-[#6b21a8]' : ''}
                      ${act.role === 'Admin' ? 'bg-[#fdeedc] text-[#8a4816]' : ''}
                      ${act.role === 'Student' ? 'bg-[#e9f2fc] text-[#1e40af]' : ''}
                      ${act.role === 'Automation' ? 'bg-[#e7f6ee] text-[#166534]' : ''}
                    `}
                  >
                    {act.user.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {act.user}{' '}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 ml-1">
                        {act.role}
                      </span>
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">{act.action}</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Courses & Departments Quick Directory */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-extrabold text-slate-900 tracking-tight">Active Degrees</h4>
              <button
                onClick={() => onNavigate('Courses & Subjects')}
                className="text-xs font-bold text-[#8a4816] hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {courses.slice(0, 4).map((c, i) => (
                <div
                  key={c.id}
                  className={`
                    p-3.5 rounded-2xl flex items-center justify-between border
                    ${i === 0 ? 'bg-[#fdeedc]/50 border-[#fcd7b5]/60' : ''}
                    ${i === 1 ? 'bg-[#f4e8fd]/50 border-[#e8c7fb]/60' : ''}
                    ${i === 2 ? 'bg-[#e7f6ee]/50 border-[#bce8ce]/60' : ''}
                    ${i === 3 ? 'bg-[#e9f2fc]/50 border-[#bedafb]/60' : ''}
                  `}
                >
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">{c.code}</span>
                    <span className="text-[11px] text-slate-500 font-medium truncate block max-w-[150px]">{c.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-xl shadow-2xs">
                    {c.totalSubjects} Sub
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('Courses & Subjects')}
            className="w-full mt-4 py-2.5 bg-[#13141b] text-white rounded-2xl font-bold text-xs hover:bg-slate-800 transition"
          >
            Manage Curriculum & Teachers
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// SECTION 2: USERS MANAGEMENT VIEW
// =============================================================
function UsersManagementView({ users, setUsers, triggerToast }) {
  const [filterRole, setFilterRole] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [resetModalUser, setResetModalUser] = useState(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Student',
    department: 'Computer Applications',
    status: 'Active'
  });

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = filterRole === 'All' || u.role === filterRole;
      const matchSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.department.toLowerCase().includes(searchTerm.toLowerCase());
      return matchRole && matchSearch;
    });
  }, [users, filterRole, searchTerm]);

  const handleToggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const newStatus = u.status === 'Active' ? 'Inactive' : 'Active';
          triggerToast(`Account status updated for ${u.name}: ${newStatus}`);
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const handleDeleteUser = (id, name) => {
    if (window.confirm(`Are you sure you want to delete user: ${name}?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      triggerToast(`User ${name} successfully deleted.`, 'info');
    }
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (editingUser) {
      // Update
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...formData } : u))
      );
      triggerToast(`User details for ${formData.name} updated!`);
      setEditingUser(null);
    } else {
      // Add
      const newUser = {
        id: `USR-${Math.floor(100 + Math.random() * 900)}`,
        ...formData,
        lastLogin: 'Never'
      };
      setUsers((prev) => [newUser, ...prev]);
      triggerToast(`New user ${formData.name} created successfully!`);
      setIsAddUserOpen(false);
    }
    setFormData({ name: '', email: '', role: 'Student', department: 'Computer Applications', status: 'Active' });
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      status: user.status
    });
  };

  const executePasswordReset = () => {
    if (resetModalUser) {
      triggerToast(`Password reset link & temporary key sent to ${resetModalUser.email}`);
      setResetModalUser(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search, Filter & Actions Top Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_6px_20px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Role Segmented Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-[#f6f7fa] rounded-2xl overflow-x-auto">
          {['All', 'Student', 'Teacher', 'Admin'].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`
                px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap
                ${filterRole === r
                  ? 'bg-white text-[#13141b] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
                }
              `}
            >
              {r === 'All' ? 'All Accounts' : `${r}s`}
            </button>
          ))}
        </div>

        {/* Search & Add User CTA */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, email, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#f6f7fa] border border-transparent focus:border-slate-300 focus:bg-white text-xs text-slate-900 outline-none transition"
            />
          </div>

          <button
            onClick={() => {
              setEditingUser(null);
              setFormData({ name: '', email: '', role: 'Student', department: 'Computer Applications', status: 'Active' });
              setIsAddUserOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#13141b] text-white rounded-2xl text-xs font-bold hover:bg-slate-800 shadow-xs cursor-pointer transition"
          >
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      {/* Users Table / Grid */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#fafafc] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">User Account</th>
                <th className="py-4 px-4">Role</th>
                <th className="py-4 px-4">Department</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Last Login</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* User Profile */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0
                          ${u.role === 'Student' ? 'bg-[#fdeedc] text-[#8a4816]' : ''}
                          ${u.role === 'Teacher' ? 'bg-[#f4e8fd] text-[#6b21a8]' : ''}
                          ${u.role === 'Admin' ? 'bg-[#e7f6ee] text-[#166534]' : ''}
                        `}
                      >
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email} • {u.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="py-4 px-4">
                    <span
                      className={`
                        px-2.5 py-1 rounded-full text-[11px] font-bold inline-block
                        ${u.role === 'Student' ? 'bg-[#fdeedc] text-[#8a4816]' : ''}
                        ${u.role === 'Teacher' ? 'bg-[#f4e8fd] text-[#6b21a8]' : ''}
                        ${u.role === 'Admin' ? 'bg-[#e7f6ee] text-[#166534]' : ''}
                      `}
                    >
                      {u.role}
                    </span>
                  </td>

                  {/* Department */}
                  <td className="py-4 px-4 text-slate-600 font-medium">{u.department}</td>

                  {/* Status Toggle */}
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      className={`
                        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition
                        ${u.status === 'Active'
                          ? 'bg-[#e7f6ee] text-[#166534] hover:bg-[#d8f0e2]'
                          : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                        }
                      `}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      {u.status}
                    </button>
                  </td>

                  {/* Last Login */}
                  <td className="py-4 px-4 text-slate-400 font-medium text-[11px]">{u.lastLogin}</td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(u)}
                        title="Edit User"
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => setResetModalUser(u)}
                        title="Reset Password"
                        className="p-2 rounded-xl text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition"
                      >
                        <KeyRound size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        title="Delete User"
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add / Edit User */}
      {(isAddUserOpen || editingUser) && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingUser ? 'Edit User Information' : 'Add New User Account'}
              </h3>
              <button
                onClick={() => { setIsAddUserOpen(false); setEditingUser(null); }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Anand Verma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. anand@univ.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Account Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white outline-none"
                  >
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsAddUserOpen(false); setEditingUser(null); }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#13141b] text-white font-bold hover:bg-slate-800"
                >
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Password */}
      {resetModalUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#fdeedc] text-[#8a4816] flex items-center justify-center mx-auto mb-3">
              <KeyRound size={24} />
            </div>
            <h4 className="font-extrabold text-base text-slate-900">Reset Password</h4>
            <p className="text-xs text-slate-500 mt-1">
              Send temporary password reset instructions for <strong>{resetModalUser.name}</strong> ({resetModalUser.email}).
            </p>
            <div className="mt-4 p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-600 text-left font-mono">
              Temp Password: <strong>BT_Temp#9241Pass</strong>
            </div>
            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                onClick={() => setResetModalUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={executePasswordReset}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#13141b] text-white hover:bg-slate-800"
              >
                Send Reset Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================
// SECTION 3: COURSES & SUBJECTS VIEW
// =============================================================
function CoursesSubjectsView({ courses, subjects, setSubjects, teachers, students, triggerToast }) {
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [assignTeacherModal, setAssignTeacherModal] = useState(null);
  const [assignStudentModal, setAssignStudentModal] = useState(null);

  // Add Subject Form
  const [subjectForm, setSubjectForm] = useState({
    code: '',
    name: '',
    course: 'BCA',
    semester: 'Sem 3',
    credits: 4,
    type: 'Core',
    teacher: 'Dr. Ramesh Sharma',
    enrolled: 60
  });

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchCourse = selectedCourse === 'All' || s.course === selectedCourse;
      const semNum = parseInt(s.semester.replace(/\D/g, ''), 10);
      const isOdd = semNum % 2 !== 0;
      const matchSemester =
        semesterFilter === 'All' ||
        (semesterFilter === 'Odd' && isOdd) ||
        (semesterFilter === 'Even' && !isOdd);
      return matchCourse && matchSemester;
    });
  }, [subjects, selectedCourse, semesterFilter]);

  const handleAddSubject = (e) => {
    e.preventDefault();
    const newSub = {
      id: `SUB-${Math.floor(300 + Math.random() * 600)}`,
      ...subjectForm,
      credits: Number(subjectForm.credits),
      enrolled: Number(subjectForm.enrolled)
    };
    setSubjects((prev) => [...prev, newSub]);
    triggerToast(`Subject ${subjectForm.code} added to ${subjectForm.course}!`);
    setIsAddSubjectOpen(false);
    setSubjectForm({ code: '', name: '', course: 'BCA', semester: 'Sem 3', credits: 4, type: 'Core', teacher: 'Dr. Ramesh Sharma', enrolled: 60 });
  };

  const handleDeleteSubject = (id, code) => {
    if (window.confirm(`Delete subject ${code}?`)) {
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      triggerToast(`Subject ${code} removed.`, 'info');
    }
  };

  const handleAssignTeacher = (teacherName) => {
    if (assignTeacherModal) {
      setSubjects((prev) =>
        prev.map((s) => (s.id === assignTeacherModal.id ? { ...s, teacher: teacherName } : s))
      );
      triggerToast(`${teacherName} assigned to ${assignTeacherModal.code}`);
      setAssignTeacherModal(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Courses Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Academic Degree Courses</h3>
            <p className="text-xs text-slate-500">Degree programs registered with syllabus regulations</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-white rounded-full border border-slate-200 text-slate-600">
            {courses.length} Active Degrees
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {courses.map((c, i) => (
            <div
              key={c.id}
              onClick={() => setSelectedCourse(c.code === selectedCourse ? 'All' : c.code)}
              className={`
                p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden
                ${c.code === selectedCourse ? 'ring-2 ring-[#13141b] shadow-md' : 'shadow-xs hover:shadow-sm'}
                ${i % 4 === 0 ? 'bg-[#fdeedc] border-[#fcd7b5]' : ''}
                ${i % 4 === 1 ? 'bg-[#f4e8fd] border-[#e8c7fb]' : ''}
                ${i % 4 === 2 ? 'bg-[#e7f6ee] border-[#bce8ce]' : ''}
                ${i % 4 === 3 ? 'bg-[#e9f2fc] border-[#bedafb]' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-900">{c.code}</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/70 text-slate-800">
                  {c.duration}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 mt-2 line-clamp-1">{c.name}</h4>
              <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] text-slate-600">
                <span>Head: <strong>{c.head}</strong></span>
                <span className="font-bold">{c.totalSubjects} Subjects</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subjects Header & Actions */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_6px_20px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-base text-slate-900">
            Subject Catalog {selectedCourse !== 'All' && <span className="text-slate-400 font-normal">({selectedCourse})</span>}
          </h3>
          <p className="text-xs text-slate-500">Manage syllabus, assign faculty and enrolled students</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Odd/Even Semester Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-[#f6f7fa] rounded-2xl">
            <button
              onClick={() => setSemesterFilter('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${semesterFilter === 'All' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              All Semesters
            </button>
            <button
              onClick={() => setSemesterFilter('Odd')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${semesterFilter === 'Odd' ? 'bg-[#fdeedc] text-[#8a4816] shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Odd Sems
            </button>
            <button
              onClick={() => setSemesterFilter('Even')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${semesterFilter === 'Even' ? 'bg-[#e9f2fc] text-[#1e40af] shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Even Sems
            </button>
          </div>

          {selectedCourse !== 'All' && (
            <button
              onClick={() => setSelectedCourse('All')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-xl bg-slate-100"
            >
              Clear Course
            </button>
          )}
          <button
            onClick={() => setIsAddSubjectOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#13141b] text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition"
          >
            <Plus size={16} /> Add Subject
          </button>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#fafafc] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Code & Subject Name</th>
                <th className="py-4 px-4">Course</th>
                <th className="py-4 px-4">Semester</th>
                <th className="py-4 px-4">Credits & Type</th>
                <th className="py-4 px-4">Assigned Teacher</th>
                <th className="py-4 px-4">Enrolled Students</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSubjects.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-extrabold text-slate-900">{s.name}</div>
                    <div className="text-[11px] font-mono text-slate-400">{s.code}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-700">{s.course}</span>
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-600">
                    <span className="font-bold text-slate-800">{s.semester}</span>
                    <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      parseInt(s.semester.replace(/\D/g, ''), 10) % 2 !== 0
                        ? 'bg-[#fdeedc] text-[#8a4816]'
                        : 'bg-[#e9f2fc] text-[#1e40af]'
                    }`}>
                      {parseInt(s.semester.replace(/\D/g, ''), 10) % 2 !== 0 ? 'Odd Sem' : 'Even Sem'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fdeedc] text-[#8a4816]">
                      {s.credits} Credits • {s.type}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{s.teacher}</span>
                      <button
                        onClick={() => setAssignTeacherModal(s)}
                        title="Reassign Teacher"
                        className="text-[10px] text-[#6b21a8] bg-[#f4e8fd] px-2 py-0.5 rounded-lg font-bold hover:bg-[#eccffc]"
                      >
                        Change
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">{s.enrolled} Students</span>
                      <button
                        onClick={() => setAssignStudentModal(s)}
                        title="Assign Students"
                        className="text-[10px] text-[#166534] bg-[#e7f6ee] px-2 py-0.5 rounded-lg font-bold hover:bg-[#d8f0e2]"
                      >
                        Manage
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleDeleteSubject(s.id, s.code)}
                      title="Delete Subject"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Subject */}
      {isAddSubjectOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Add New Subject</h3>
              <button onClick={() => setIsAddSubjectOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubject} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BCA401"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    required
                    value={subjectForm.credits}
                    onChange={(e) => setSubjectForm({ ...subjectForm, credits: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Engineering & Agile"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Course</label>
                  <select
                    value={subjectForm.course}
                    onChange={(e) => setSubjectForm({ ...subjectForm, course: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.code}>{c.code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Semester</label>
                  <select
                    value={subjectForm.semester}
                    onChange={(e) => setSubjectForm({ ...subjectForm, semester: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={`Sem ${n}`}>
                        Sem {n} ({n % 2 !== 0 ? 'Odd Sem' : 'Even Sem'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Faculty</label>
                <select
                  value={subjectForm.teacher}
                  onChange={(e) => setSubjectForm({ ...subjectForm, teacher: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.name}>{t.name} ({t.department})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#13141b] text-white font-bold hover:bg-slate-800"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Teacher to Subject */}
      {assignTeacherModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h4 className="font-extrabold text-base text-slate-900">Assign Teacher</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Select faculty for <strong>{assignTeacherModal.code} - {assignTeacherModal.name}</strong>
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {teachers.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleAssignTeacher(t.name)}
                  className={`
                    w-full p-3 rounded-2xl flex items-center justify-between text-left text-xs transition border
                    ${assignTeacherModal.teacher === t.name ? 'bg-[#f4e8fd] border-[#dfbcf5]' : 'bg-slate-50 hover:bg-slate-100 border-transparent'}
                  `}
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{t.name}</span>
                    <span className="text-[10px] text-slate-500">{t.department} • {t.empId}</span>
                  </div>
                  {assignTeacherModal.teacher === t.name && (
                    <Check size={16} className="text-[#6b21a8]" />
                  )}
                </button>
              ))}
            </div>
            <div className="mt-4 text-right">
              <button
                onClick={() => setAssignTeacherModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Assign Students to Subject */}
      {assignStudentModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-extrabold text-base text-slate-900">Enrolled Students</h4>
                <p className="text-xs text-slate-500">{assignStudentModal.code}: {assignStudentModal.name}</p>
              </div>
              <button onClick={() => setAssignStudentModal(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-2 max-h-64 overflow-y-auto custom-scrollbar text-xs">
              <div className="p-3 bg-[#e7f6ee] rounded-2xl text-[#166534] font-medium flex items-center justify-between">
                <span>Active Roster Status</span>
                <span className="font-bold">{assignStudentModal.enrolled} Students Enrolled</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-2 font-medium">Batch enrolled candidates:</p>
              {students.map((st) => (
                <div key={st.id} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{st.name}</span>
                    <span className="text-[10px] text-slate-400 block">{st.usn} • {st.course}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Enrolled
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={() => {
                  triggerToast(`Batch student enrollment synced for ${assignStudentModal.code}`);
                  setAssignStudentModal(null);
                }}
                className="px-4 py-2 bg-[#13141b] text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Sync Class Roster
              </button>
              <button
                onClick={() => setAssignStudentModal(null)}
                className="text-xs font-bold text-slate-500 hover:underline"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================
// SECTION 4: TEACHER MANAGEMENT VIEW
// =============================================================
function TeacherManagementView({ teachers, setTeachers, subjects, triggerToast }) {
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [assignSubjectsModal, setAssignSubjectsModal] = useState(null);
  const [assignSectionsModal, setAssignSectionsModal] = useState(null);

  const [teacherForm, setTeacherForm] = useState({
    name: '',
    empId: '',
    email: '',
    phone: '',
    department: 'Computer Applications',
    designation: 'Assistant Professor',
    hoursPerWeek: 14,
    experience: '5 Years'
  });

  const handleSaveTeacher = (e) => {
    e.preventDefault();
    if (editingTeacher) {
      setTeachers((prev) =>
        prev.map((t) => (t.id === editingTeacher.id ? { ...t, ...teacherForm } : t))
      );
      triggerToast(`Profile for ${teacherForm.name} updated!`);
      setEditingTeacher(null);
    } else {
      const newTeacher = {
        id: `TCH-${Math.floor(10 + Math.random() * 90)}`,
        ...teacherForm,
        subjects: ['BCA301 (DBMS)'],
        sections: ['Sec A'],
        hoursPerWeek: Number(teacherForm.hoursPerWeek)
      };
      setTeachers((prev) => [newTeacher, ...prev]);
      triggerToast(`Teacher ${teacherForm.name} added!`);
      setIsAddTeacherOpen(false);
    }
  };

  const openEdit = (t) => {
    setEditingTeacher(t);
    setTeacherForm({
      name: t.name,
      empId: t.empId,
      email: t.email,
      phone: t.phone,
      department: t.department,
      designation: t.designation,
      hoursPerWeek: t.hoursPerWeek,
      experience: t.experience
    });
  };

  const handleUpdateSections = (sectionName) => {
    if (assignSectionsModal) {
      setTeachers((prev) =>
        prev.map((t) => {
          if (t.id === assignSectionsModal.id) {
            const hasSection = t.sections.includes(sectionName);
            const newSections = hasSection
              ? t.sections.filter((s) => s !== sectionName)
              : [...t.sections, sectionName];
            return { ...t, sections: newSections };
          }
          return t;
        })
      );
      triggerToast(`Section allotment updated for ${assignSectionsModal.name}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_6px_20px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-base text-slate-900">Faculty & Teacher Directory</h3>
          <p className="text-xs text-slate-500">Manage teaching staff, allocate subjects, and track workload</p>
        </div>

        <button
          onClick={() => {
            setEditingTeacher(null);
            setTeacherForm({
              name: '',
              empId: `FAC-${Math.floor(1000 + Math.random() * 9000)}`,
              email: '',
              phone: '',
              department: 'Computer Applications',
              designation: 'Assistant Professor',
              hoursPerWeek: 14,
              experience: '5 Years'
            });
            setIsAddTeacherOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#13141b] text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition shadow-xs"
        >
          <Plus size={16} /> Add Teacher
        </button>
      </div>

      {/* Teacher Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {teachers.map((t, i) => (
          <div
            key={t.id}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              {/* Header Profile */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`
                      w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xs
                      ${i % 2 === 0 ? 'bg-[#f4e8fd] text-[#6b21a8]' : 'bg-[#fdeedc] text-[#8a4816]'}
                    `}
                  >
                    {t.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{t.name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">{t.designation} • {t.empId}</p>
                    <span className="text-[10px] font-bold text-[#6b21a8] bg-[#f4e8fd] px-2 py-0.5 rounded-full inline-block mt-1">
                      {t.department}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(t)}
                    title="Edit Teacher"
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                  >
                    <Edit3 size={15} />
                  </button>
                </div>
              </div>

              {/* Contact Info Pills */}
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5 truncate">
                  <Mail size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{t.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone size={13} className="text-slate-400 shrink-0" />
                  <span>{t.phone}</span>
                </div>
              </div>

              {/* Assigned Subjects */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assigned Subjects</span>
                  <button
                    onClick={() => setAssignSubjectsModal(t)}
                    className="text-[10px] font-bold text-[#8a4816] hover:underline"
                  >
                    + Assign
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {t.subjects.map((sub, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[#fdeedc] text-[#8a4816]"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Assigned Classes / Sections */}
              <div className="mt-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assigned Sections</span>
                  <button
                    onClick={() => setAssignSectionsModal(t)}
                    className="text-[10px] font-bold text-[#166534] hover:underline"
                  >
                    Manage Sections
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {t.sections.map((sec, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[#e7f6ee] text-[#166534]"
                    >
                      {sec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Workload Indicator Footer */}
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 text-[11px]">Workload: </span>
                <span className="font-extrabold text-slate-900">{t.hoursPerWeek} hrs/week</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">Exp: {t.experience}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add / Edit Teacher */}
      {(isAddTeacherOpen || editingTeacher) && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingTeacher ? 'Edit Teacher Profile' : 'Add Faculty Member'}
              </h3>
              <button
                onClick={() => { setIsAddTeacherOpen(false); setEditingTeacher(null); }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={teacherForm.name}
                    onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                    placeholder="e.g. Dr. K. Rao"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Employee ID</label>
                  <input
                    type="text"
                    required
                    value={teacherForm.empId}
                    onChange={(e) => setTeacherForm({ ...teacherForm, empId: e.target.value })}
                    placeholder="FAC-1005"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={teacherForm.email}
                    onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                    placeholder="k.rao@univ.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={teacherForm.phone}
                    onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                    placeholder="+91 99880 12345"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={teacherForm.department}
                    onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Designation</label>
                  <select
                    value={teacherForm.designation}
                    onChange={(e) => setTeacherForm({ ...teacherForm, designation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  >
                    <option value="Professor & HOD">Professor & HOD</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Teaching Hours/Wk</label>
                  <input
                    type="number"
                    min="4"
                    max="30"
                    value={teacherForm.hoursPerWeek}
                    onChange={(e) => setTeacherForm({ ...teacherForm, hoursPerWeek: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Experience</label>
                  <input
                    type="text"
                    value={teacherForm.experience}
                    onChange={(e) => setTeacherForm({ ...teacherForm, experience: e.target.value })}
                    placeholder="e.g. 8 Years"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsAddTeacherOpen(false); setEditingTeacher(null); }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#13141b] text-white font-bold hover:bg-slate-800"
                >
                  {editingTeacher ? 'Save Changes' : 'Create Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Assign Subjects */}
      {assignSubjectsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h4 className="font-extrabold text-base text-slate-900">Assign Subject</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Allocate a syllabus course to <strong>{assignSubjectsModal.name}</strong>
            </p>
            <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
              {subjects.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    const exists = assignSubjectsModal.subjects.includes(`${sub.code} (${sub.name})`);
                    if (!exists) {
                      setTeachers((prev) =>
                        prev.map((t) =>
                          t.id === assignSubjectsModal.id
                            ? { ...t, subjects: [...t.subjects, `${sub.code} (${sub.name.slice(0, 10)}...)`] }
                            : t
                        )
                      );
                      triggerToast(`Subject ${sub.code} assigned to ${assignSubjectsModal.name}`);
                    }
                    setAssignSubjectsModal(null);
                  }}
                  className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-[#fdeedc] text-left text-xs transition border border-transparent hover:border-[#fcd7b5]"
                >
                  <span className="font-bold text-slate-900 block">{sub.code}: {sub.name}</span>
                  <span className="text-[10px] text-slate-500">{sub.course} • {sub.semester}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 text-right">
              <button
                onClick={() => setAssignSubjectsModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Assign Classes/Sections */}
      {assignSectionsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h4 className="font-extrabold text-base text-slate-900">Assign Class & Sections</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Toggle sections handled by <strong>{assignSectionsModal.name}</strong>
            </p>
            <div className="space-y-2">
              {[
                'BCA Sem 3 - Sec A',
                'BCA Sem 3 - Sec B',
                'CSE Sem 4 - Sec A',
                'CSE Sem 4 - Sec B',
                'MCA Sem 2'
              ].map((sec) => {
                const isSelected = assignSectionsModal.sections.includes(sec);
                return (
                  <button
                    key={sec}
                    onClick={() => handleUpdateSections(sec)}
                    className={`
                      w-full p-3 rounded-2xl flex items-center justify-between text-left text-xs transition border
                      ${isSelected ? 'bg-[#e7f6ee] border-[#bce8ce] font-bold text-[#166534]' : 'bg-slate-50 text-slate-700 border-transparent hover:bg-slate-100'}
                    `}
                  >
                    <span>{sec}</span>
                    {isSelected && <Check size={16} className="text-[#166534]" />}
                  </button>
                );
              })}
            </div>
            <div className="mt-5 text-right">
              <button
                onClick={() => setAssignSectionsModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#13141b] text-white hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================
// SECTION 5: STUDENT MANAGEMENT VIEW
// =============================================================
function StudentManagementView({ students, setStudents, triggerToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('All'); // 'All', 'Odd', 'Even'
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);

  const [editForm, setEditForm] = useState({
    name: '',
    semester: 'Semester 3',
    section: 'Section A',
    cgpa: 8.0,
    midsemMarks: 40,
    endsemStatus: 'Eligible'
  });

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.usn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.course.toLowerCase().includes(searchTerm.toLowerCase());
      const isOdd = s.semester.includes('1') || s.semester.includes('3') || s.semester.includes('5') || s.semester.includes('7') || s.semesterType === 'Odd';
      const isEven = s.semester.includes('2') || s.semester.includes('4') || s.semester.includes('6') || s.semester.includes('8') || s.semesterType === 'Even';
      const matchesSem =
        semesterFilter === 'All' ||
        (semesterFilter === 'Odd' && isOdd) ||
        (semesterFilter === 'Even' && isEven);
      return matchesSearch && matchesSem;
    });
  }, [students, searchTerm, semesterFilter]);

  const handleToggleStudentStatus = (id) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const newStatus = s.status === 'Active' ? 'Inactive' : 'Active';
          triggerToast(`Student account for ${s.name} is now ${newStatus}`);
          return { ...s, status: newStatus };
        }
        return s;
      })
    );
  };

  const openEdit = (s) => {
    setEditingStudent(s);
    setEditForm({
      name: s.name,
      semester: s.semester,
      section: s.section,
      cgpa: s.cgpa,
      midsemMarks: s.midsemMarks || 40,
      endsemStatus: s.endsemStatus || 'Eligible'
    });
  };

  const handleSaveStudent = (e) => {
    e.preventDefault();
    if (editingStudent) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editingStudent.id
            ? { ...s, ...editForm, cgpa: Number(editForm.cgpa), midsemMarks: Number(editForm.midsemMarks) }
            : s
        )
      );
      triggerToast(`Information updated for ${editForm.name}!`);
      setEditingStudent(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_6px_20px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-base text-slate-900">Student Profiles & Academic Records</h3>
          <p className="text-xs text-slate-500">Track backlog clearance, enrolled subjects, and Midsem/Endsem results</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Odd/Even Semester Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-[#f6f7fa] rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setSemesterFilter('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${semesterFilter === 'All' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              All Semesters
            </button>
            <button
              onClick={() => setSemesterFilter('Odd')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${semesterFilter === 'Odd' ? 'bg-[#fdeedc] text-[#8a4816] shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Odd Sems
            </button>
            <button
              onClick={() => setSemesterFilter('Even')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${semesterFilter === 'Even' ? 'bg-[#e9f2fc] text-[#1e40af] shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Even Sems
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search USN, name, course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#f6f7fa] border border-transparent focus:border-slate-300 focus:bg-white text-xs text-slate-900 outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStudents.map((st, i) => (
          <div
            key={st.id}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs shadow-xs
                      ${i % 3 === 0 ? 'bg-[#fdeedc] text-[#8a4816]' : ''}
                      ${i % 3 === 1 ? 'bg-[#f4e8fd] text-[#6b21a8]' : ''}
                      ${i % 3 === 2 ? 'bg-[#e9f2fc] text-[#1e40af]' : ''}
                    `}
                  >
                    {st.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{st.name}</h4>
                    <p className="text-[11px] font-mono text-slate-400">{st.usn}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleStudentStatus(st.id)}
                  title="Toggle Account Activation"
                  className={`
                    px-2.5 py-0.5 rounded-full text-[10px] font-bold transition
                    ${st.status === 'Active' ? 'bg-[#e7f6ee] text-[#166534]' : 'bg-rose-50 text-rose-600'}
                  `}
                >
                  {st.status}
                </button>
              </div>

              {/* Academic Highlights */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#f6f7fa] p-2.5 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold block">PROGRAM</span>
                  <span className="font-extrabold text-slate-800 text-[11px]">{st.course} • {st.semester}</span>
                </div>
                <div className="bg-[#f6f7fa] p-2.5 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold block">CGPA SCORE</span>
                  <span className="font-extrabold text-slate-900 text-[11px]">{st.cgpa} / 10.0</span>
                </div>
              </div>

              {/* Midsem & Endsem Exam Standing */}
              <div className="mt-3.5 p-2.5 rounded-2xl bg-[#f6f7fa] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">MIDSEM EXAM</span>
                  <span className="font-extrabold text-slate-900">{st.midsemMarks || 40} / 50</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block">ENDSEM EXAM</span>
                  <span className={`text-[11px] font-bold ${st.endsemStatus === 'Eligible' ? 'text-[#166534]' : 'text-amber-700'}`}>
                    {st.endsemStatus || 'Eligible'}
                  </span>
                </div>
              </div>

              {/* Backlog Status Pill */}
              <div className="mt-4">
                {st.backlogsCount === 0 ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e7f6ee] text-[#166534] text-xs font-bold">
                    <CheckCircle2 size={15} /> All Subjects Cleared (0 Backlogs)
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fdeedc] text-[#8a4816] text-xs font-bold">
                    <AlertCircle size={15} /> {st.backlogsCount} Active Backlog ({st.backlogsHistory[0]?.code})
                  </div>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedStudentDetail(st)}
                className="text-xs font-bold text-[#13141b] bg-[#f4e8fd] hover:bg-[#eccffc] px-3.5 py-1.5 rounded-xl transition"
              >
                Academic Details
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(st)}
                  title="Edit Student Info"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                >
                  <Edit3 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Academic Details Drawer */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#fdeedc] text-[#8a4816] flex items-center justify-center font-bold text-sm">
                  {selectedStudentDetail.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{selectedStudentDetail.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedStudentDetail.usn} • {selectedStudentDetail.course}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudentDetail(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs max-h-96 overflow-y-auto custom-scrollbar">
              {/* Academic Overview Box */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-3 bg-[#f6f7fa] rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold block">SEMESTER</span>
                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{selectedStudentDetail.semester}</span>
                </div>
                <div className="p-3 bg-[#e7f6ee] rounded-2xl text-[#166534]">
                  <span className="text-[10px] font-bold block">CGPA</span>
                  <span className="font-extrabold text-xs sm:text-sm">{selectedStudentDetail.cgpa}</span>
                </div>
                <div className="p-3 bg-[#e9f2fc] rounded-2xl text-[#1e40af]">
                  <span className="text-[10px] font-bold block">MIDSEM</span>
                  <span className="font-extrabold text-xs sm:text-sm">{selectedStudentDetail.midsemMarks || 42}/50</span>
                </div>
                <div className="p-3 bg-[#f4e8fd] rounded-2xl text-[#6b21a8]">
                  <span className="text-[10px] font-bold block">ENDSEM</span>
                  <span className="font-extrabold text-xs sm:text-sm">{selectedStudentDetail.endsemStatus || 'Eligible'}</span>
                </div>
              </div>

              {/* Enrolled Subjects */}
              <div>
                <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2">
                  Enrolled Course Subjects
                </h5>
                <div className="flex flex-wrap gap-2">
                  {selectedStudentDetail.enrolledSubjects.map((sub, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-slate-100 font-bold text-slate-700 text-xs">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Backlog Resolution History */}
              <div>
                <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2">
                  Backlog Track Record
                </h5>
                {selectedStudentDetail.backlogsHistory.length === 0 ? (
                  <div className="p-3 bg-[#e7f6ee] text-[#166534] rounded-2xl font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} /> Clean Academic History — Zero Active Arrears.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedStudentDetail.backlogsHistory.map((b, idx) => (
                      <div key={idx} className="p-3 bg-[#fdeedc] border border-[#fcd7b5] rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="font-bold text-[#8a4816] block">{b.code}: {b.name}</span>
                          <span className="text-[10px] text-slate-500">Origin: {b.sem}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#fae3cb] text-[#8a4816]">
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="px-5 py-2 rounded-xl bg-[#13141b] text-white font-bold text-xs hover:bg-slate-800"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Student Information */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Edit Student Record</h3>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Current Semester</label>
                  <select
                    value={editForm.semester}
                    onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={`Semester ${n}`}>Semester {n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Section</label>
                  <input
                    type="text"
                    value={editForm.section}
                    onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cumulative CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={editForm.cgpa}
                    onChange={(e) => setEditForm({ ...editForm, cgpa: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mid-Semester Score (/50)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={editForm.midsemMarks}
                    onChange={(e) => setEditForm({ ...editForm, midsemMarks: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">End-Semester Exam Status</label>
                <select
                  value={editForm.endsemStatus}
                  onChange={(e) => setEditForm({ ...editForm, endsemStatus: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                >
                  <option value="Eligible">Eligible (Admit Card Issued)</option>
                  <option value="Provisional">Provisional Clearance</option>
                  <option value="Pending Clearance">Pending Clearance</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#13141b] text-white font-bold hover:bg-slate-800"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================
// SECTION 6: ADMIN BACKLOGS & STUDENT UPDATES CONSOLE
// =============================================================
function AdminBacklogsUpdatesView({ backlogRecords = [], setBacklogRecords, triggerToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [clearanceFilter, setClearanceFilter] = useState('All');
  const [reasonFilter, setReasonFilter] = useState('All');
  const [funnelFilter, setFunnelFilter] = useState(null);
  const [selectedCertRecord, setSelectedCertRecord] = useState(null);
  const [expandedRowIds, setExpandedRowIds] = useState({});

  const toggleRowExpansion = (id) => {
    setExpandedRowIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filtered = useMemo(() => {
    return backlogRecords.filter((b) => {
      const matchesSearch =
        b.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.usn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.subjectCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClearance = clearanceFilter === 'All' || b.clearanceStatus === clearanceFilter;
      const matchesReason = reasonFilter === 'All' || b.backlogReason === reasonFilter;

      if (funnelFilter === 'met' && !b.metTeacher) return false;
      if (funnelFilter === 'assignments' && b.assignmentsCompleted !== 'Completed') return false;
      if (funnelFilter === 'appeared' && b.repeatExamStatus !== 'Appeared') return false;
      if (funnelFilter === 'cleared' && b.clearanceStatus !== 'Cleared') return false;

      return matchesSearch && matchesClearance && matchesReason;
    });
  }, [backlogRecords, searchTerm, clearanceFilter, reasonFilter, funnelFilter]);

  const handleAdminClearance = (recordId) => {
    const updated = confirmClearance(recordId, 'Cleared and certified by Academic Examination Cell.');
    if (setBacklogRecords) setBacklogRecords(updated);
    triggerToast('Backlog clearance confirmed by Administrator!');
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#fdeedc] border border-[#fcd7b5] rounded-3xl p-5 shadow-[0_6px_20px_rgba(250,238,220,0.4)]">
          <span className="text-[11px] font-bold text-[#8a4816] uppercase tracking-wide">Tracked Backlogs</span>
          <div className="text-2xl font-black text-[#2c1d11] mt-1">{backlogRecords.length} Cases</div>
          <p className="text-[11px] text-[#8a4816] mt-1">Across all departments</p>
        </div>

        <div className="bg-[#fef3c7]/70 border border-[#fde68a] rounded-3xl p-5 shadow-[0_6px_20px_rgba(254,243,199,0.4)]">
          <span className="text-[11px] font-bold text-[#b45309] uppercase tracking-wide">Teacher Meetings Done</span>
          <div className="text-2xl font-black text-[#92400e] mt-1">
            {backlogRecords.filter((b) => b.metTeacher).length} / {backlogRecords.length}
          </div>
          <p className="text-[11px] text-[#b45309] mt-1">Guidance consultations confirmed</p>
        </div>

        <div className="bg-[#e0f2fe]/70 border border-[#bae6fd] rounded-3xl p-5 shadow-[0_6px_20px_rgba(224,242,254,0.4)]">
          <span className="text-[11px] font-bold text-[#0369a1] uppercase tracking-wide">Repeat Exam Candidates</span>
          <div className="text-2xl font-black text-[#075985] mt-1">
            {backlogRecords.filter((b) => b.repeatExamStatus === 'Preparing' || b.repeatExamStatus === 'Scheduled').length} Preparing
          </div>
          <p className="text-[11px] text-[#0369a1] mt-1">Re-examination pipeline</p>
        </div>

        <div className="bg-[#e7f6ee] border border-[#bce8ce] rounded-3xl p-5 shadow-[0_6px_20px_rgba(231,246,238,0.4)]">
          <span className="text-[11px] font-bold text-[#166534] uppercase tracking-wide">Cleared Backlogs</span>
          <div className="text-2xl font-black text-[#133722] mt-1">
            {backlogRecords.filter((b) => b.clearanceStatus === 'Cleared').length} Cleared
          </div>
          <p className="text-[11px] text-[#166534] mt-1">Certified by faculty and exam cell</p>
        </div>
      </div>

      {/* University-wide Backlog Resolution Funnel */}
      <ResolutionFunnelSummary
        records={backlogRecords}
        activeFilter={funnelFilter}
        onFilterSelect={(stage) => setFunnelFilter(funnelFilter === stage ? null : stage)}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_6px_20px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">University Backlog Candidates & Student Updates</h3>
            <p className="text-xs text-slate-500">
              Centralized oversight of student progress reports submitted to faculty advisors
            </p>
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

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold mr-1">
            <Filter size={14} /> Filter:
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#f6f7fa] rounded-2xl">
            {['All', 'In Review', 'Pending Clearance', 'Cleared'].map((st) => (
              <button
                key={st}
                onClick={() => setClearanceFilter(st)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  clearanceFilter === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

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
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#fafafc] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Student Information</th>
                <th className="py-4 px-4">Subject</th>
                <th className="py-4 px-4">Clearance Status</th>
                <th className="py-4 px-4 text-center">Backlog & Exam Details</th>
                <th className="py-4 px-6 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((item) => (
                <Fragment key={item.id}>
                  <tr className={`transition-colors ${expandedRowIds[item.id] ? 'bg-slate-50/80' : 'hover:bg-slate-50/70'}`}>
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

                    <td className="py-4 px-4">
                      <span className="font-extrabold text-slate-900 block">{item.subjectName}</span>
                      <span className="text-[11px] font-mono text-slate-400">{item.subjectCode}</span>
                    </td>

                    <td className="py-4 px-4">
                      {item.clearanceStatus === 'Cleared' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e7f6ee] text-[#166534] border border-[#bce8ce] inline-flex items-center gap-1">
                          <CheckCircle2 size={11} /> Cleared
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fdeedc] text-[#8a4816]">
                          {item.clearanceStatus}
                        </span>
                      )}
                    </td>

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

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.clearanceStatus === 'Cleared' && (
                          <button
                            onClick={() => setSelectedCertRecord(item)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#e7f6ee] text-[#166534] hover:bg-[#d8f0e2] border border-[#bce8ce] font-bold text-xs flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-xs"
                          >
                            <Award size={13} /> Certificate
                          </button>
                        )}
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
                                <strong className={item.metTeacher ? 'text-emerald-700' : 'text-amber-700'}>
                                  {item.metTeacher ? 'Yes ✓' : 'Pending'}
                                </strong>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500">Assignments:</span>
                                <strong className={item.assignmentsCompleted === 'Completed' ? 'text-emerald-700' : 'text-slate-700'}>
                                  {item.assignmentsCompleted}
                                </strong>
                              </div>
                              {item.studentRemarks && (
                                <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100 truncate">
                                  &quot;{item.studentRemarks}&quot;
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Clearance Certificate Modal */}
      {selectedCertRecord && (
        <ClearanceCertificateModal
          record={selectedCertRecord}
          onClose={() => setSelectedCertRecord(null)}
        />
      )}
    </div>
  );
}

