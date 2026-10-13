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
  Award,
  User,
  Save,
  ShieldCheck
} from 'lucide-react';
import {
  getBacklogRecords,
  saveBacklogRecords,
  confirmClearance,
  addBacklogRecord,
  deleteBacklogRecord,
  getUsers,
  saveUsers,
  addUser,
  deleteUser,
  getCourses,
  saveCourses,
  addCourse,
  deleteCourse,
  getSubjects,
  saveSubjects,
  addSubject,
  deleteSubject,
  getTeachers,
  saveTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
  getStudents,
  saveStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  clearAllSystemData,
  BCA_CURRICULUM,
  populateBcaCurriculum,
  getAdminCredentials,
  saveAdminCredentials,
  DEFAULT_ADMIN_CREDENTIALS,
  isStudentIdentifier
} from '../utils/backlogStore';
import ClearanceCertificateModal from '../components/ClearanceCertificateModal';
import { ResolutionFunnelSummary } from '../components/ResolutionFunnel';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global State Collections from persistent store
  const [users, setUsersState] = useState(() => getUsers());
  const [courses, setCoursesState] = useState(() => getCourses());
  const [subjects, setSubjectsState] = useState(() => getSubjects());
  const [teachers, setTeachersState] = useState(() => getTeachers());
  const [students, setStudentsState] = useState(() => getStudents());
  const [activities] = useState([]);
  const [backlogRecords, setBacklogRecordsState] = useState(() => getBacklogRecords());

  const setUsers = (val) => {
    setUsersState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      saveUsers(next);
      return next;
    });
  };

  const setCourses = (val) => {
    setCoursesState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      saveCourses(next);
      return next;
    });
  };

  const setSubjects = (val) => {
    setSubjectsState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      saveSubjects(next);
      return next;
    });
  };

  const setTeachers = (val) => {
    setTeachersState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      saveTeachers(next);
      return next;
    });
  };

  const setStudents = (val) => {
    setStudentsState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      saveStudents(next);
      return next;
    });
  };

  const setBacklogRecords = (val) => {
    setBacklogRecordsState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      saveBacklogRecords(next);
      return next;
    });
  };

  // Real-time synchronization across browser tabs and components
  useEffect(() => {
    const handleBacklogSync = (e) => {
      if (e?.detail) setBacklogRecordsState(e.detail);
      else setBacklogRecordsState(getBacklogRecords());
    };
    const handleStudentsSync = (e) => {
      if (e?.detail) setStudentsState(e.detail);
      else setStudentsState(getStudents());
    };
    const handleTeachersSync = (e) => {
      if (e?.detail) setTeachersState(e.detail);
      else setTeachersState(getTeachers());
    };
    const handleSubjectsSync = (e) => {
      if (e?.detail) setSubjectsState(e.detail);
      else setSubjectsState(getSubjects());
    };
    const handleCoursesSync = (e) => {
      if (e?.detail) setCoursesState(e.detail);
      else setCoursesState(getCourses());
    };
    const handleUsersSync = (e) => {
      if (e?.detail) setUsersState(e.detail);
      else setUsersState(getUsers());
    };

    window.addEventListener('backtrack_backlog_updated', handleBacklogSync);
    window.addEventListener('backtrack_students_updated', handleStudentsSync);
    window.addEventListener('backtrack_teachers_updated', handleTeachersSync);
    window.addEventListener('backtrack_subjects_updated', handleSubjectsSync);
    window.addEventListener('backtrack_courses_updated', handleCoursesSync);
    window.addEventListener('backtrack_users_updated', handleUsersSync);
    window.addEventListener('storage', handleBacklogSync);

    return () => {
      window.removeEventListener('backtrack_backlog_updated', handleBacklogSync);
      window.removeEventListener('backtrack_students_updated', handleStudentsSync);
      window.removeEventListener('backtrack_teachers_updated', handleTeachersSync);
      window.removeEventListener('backtrack_subjects_updated', handleSubjectsSync);
      window.removeEventListener('backtrack_courses_updated', handleCoursesSync);
      window.removeEventListener('backtrack_users_updated', handleUsersSync);
      window.removeEventListener('storage', handleBacklogSync);
    };
  }, []);

  // Dynamically calculated stats
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const totalTeachers = teachers.length;
    const totalCourses = courses.length;
    const totalSubjects = subjects.length;
    const pendingBacklogs = backlogRecords.filter((b) => b.clearanceStatus !== 'Cleared').length;
    const clearedCount = backlogRecords.filter((b) => b.clearanceStatus === 'Cleared').length;
    const clearedRate = backlogRecords.length > 0
      ? ((clearedCount / backlogRecords.length) * 100).toFixed(1)
      : '0.0';
    return {
      totalStudents,
      totalTeachers,
      totalCourses,
      totalSubjects,
      pendingBacklogs,
      clearedRate
    };
  }, [students, teachers, courses, subjects, backlogRecords]);

  // Feedback Notification Banner
  const [notification, setNotification] = useState(null);

  const triggerToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Route Protection: strictly enforce that only authenticated admin can access
  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (!stored) {
        navigate('/login?role=admin');
        return;
      }
      const u = JSON.parse(stored);
      // Strictly prevent student accounts and student IDs from accessing administrator portal
      if (
        u.role?.toLowerCase() === 'student' ||
        isStudentIdentifier(u.id) ||
        isStudentIdentifier(u.username) ||
        isStudentIdentifier(u.name)
      ) {
        localStorage.removeItem('currentUser');
        navigate('/login?role=admin');
        return;
      }
      if (!u || (u.role?.toLowerCase() !== 'admin' && u.role?.toLowerCase() !== 'administrator')) {
        navigate('/login?role=admin');
        return;
      }
    } catch {
      navigate('/login?role=admin');
    }
  }, [navigate]);

  const [adminUser, setAdminUser] = useState(() => {
    const defaultCreds = getAdminCredentials();
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && (u.role?.toLowerCase() === 'admin' || u.role?.toLowerCase() === 'administrator')) {
          // If session contains contaminated student info, purge and restore official admin
          if (
            isStudentIdentifier(u.id) ||
            isStudentIdentifier(u.username) ||
            u.name?.toLowerCase().includes('anirudh') ||
            u.id === '24215107'
          ) {
            const cleanCreds = {
              name: defaultCreds.name || 'Exam Controller',
              id: defaultCreds.id || 'ADM-001',
              email: defaultCreds.email || 'admin@univ.edu',
              department: defaultCreds.department || 'Office of Academic Affairs & Examination Cell',
              role: 'Administrator',
              phone: defaultCreds.phone || '+91 98765 00001',
              designation: defaultCreds.designation || 'Chief Academic Controller & Administrator'
            };
            localStorage.setItem('currentUser', JSON.stringify({ ...u, ...cleanCreds }));
            return cleanCreds;
          }
          return {
            name: u.name || defaultCreds.name || 'Exam Controller',
            id: u.id || u.empId || defaultCreds.id || 'ADM-001',
            email: u.email || defaultCreds.email || 'admin@univ.edu',
            department: u.department || defaultCreds.department || 'Office of Academic Affairs & Examination Cell',
            role: 'Administrator',
            phone: u.phone || defaultCreds.phone || '+91 98765 00001',
            designation: u.designation || defaultCreds.designation || 'Chief Academic Controller & Administrator'
          };
        }
      }
    } catch { }
    return {
      name: defaultCreds.name || 'Exam Controller',
      id: defaultCreds.id || 'ADM-001',
      email: defaultCreds.email || 'admin@univ.edu',
      department: defaultCreds.department || 'Office of Academic Affairs & Examination Cell',
      role: 'Administrator',
      phone: defaultCreds.phone || '+91 98765 00001',
      designation: defaultCreds.designation || 'Chief Academic Controller & Administrator'
    };
  });

  const handleSaveProfile = (updatedProfile) => {
    setAdminUser(updatedProfile);
    try {
      const stored = localStorage.getItem('currentUser');
      const existing = stored ? JSON.parse(stored) : {};
      const newSession = {
        ...existing,
        ...updatedProfile,
        lastProfileUpdate: new Date().toISOString()
      };
      localStorage.setItem('currentUser', JSON.stringify(newSession));
      saveAdminCredentials({
        name: updatedProfile.name,
        email: updatedProfile.email,
        department: updatedProfile.department,
        id: updatedProfile.id
      });
    } catch (err) {
      console.warn('Failed to update currentUser in localStorage', err);
    }

    // Sync matching user in users list (Users Management table)
    setUsers((prev) =>
      prev.map((u) => {
        if (
          u.id === adminUser.id ||
          u.name === adminUser.name ||
          u.email === adminUser.email ||
          u.id === updatedProfile.id
        ) {
          return {
            ...u,
            name: updatedProfile.name,
            id: updatedProfile.id,
            email: updatedProfile.email,
            department: updatedProfile.department
          };
        }
        return u;
      })
    );

    triggerToast(`Profile updated successfully! Name set to "${updatedProfile.name}"`);
  };

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
            <SidebarNavButton
              icon={<User size={19} />}
              label="Profile & Settings"
              active={activeTab === 'Profile & Settings'}
              onClick={() => { setActiveTab('Profile & Settings'); setIsMobileMenuOpen(false); }}
            />
          </div>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="p-4 border-t border-white/5 bg-[#171822]/60">
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
            <button
              onClick={() => { setActiveTab('Profile & Settings'); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-3 text-left hover:opacity-85 transition cursor-pointer w-full min-w-0 group"
              title="Click to view & edit your Admin Profile"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f5caa0] to-[#f4e6fc] text-[#13141b] flex items-center justify-center font-bold text-xs shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                {adminUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-xs font-bold text-white leading-tight truncate group-hover:text-[#f5caa0] transition-colors">{adminUser.name}</p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium font-mono truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> {adminUser.id}
                </p>
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="mt-2.5 w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white border border-rose-500/20 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              title="Sign Out of Admin Account"
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

      {/* Main App Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden pt-16 lg:pt-0">
        {/* Top Header Bar */}
        <header className="h-20 px-6 lg:px-8 flex items-center justify-between border-b border-slate-200/60 bg-[#f6f7fa]/90 backdrop-blur-md">
          <div>
            <h2 className="text-xl lg:text-2xl font-extrabold text-[#181920] tracking-tight">{activeTab}</h2>
            <p className="text-xs text-slate-500 font-medium">BackTrack University Administration Portal</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Purge / Clear All Data Button */}
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to completely reset and remove all data? Everything will be cleared.')) {
                  clearAllSystemData();
                  setUsers([]);
                  setCourses([]);
                  setSubjects([]);
                  setTeachers([]);
                  setStudents([]);
                  setBacklogRecords([]);
                  triggerToast('All system data cleared. You can now build from scratch!', 'info');
                }
              }}
              className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition cursor-pointer"
              title="Reset all users, students, faculty, subjects, and backlogs to blank"
            >
              Reset All Data
            </button>

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
              onClick={() => setActiveTab('Profile & Settings')}
              className="flex items-center gap-2.5 pl-2 hover:opacity-85 transition cursor-pointer text-left group"
              title="Click to view & edit your Admin Profile"
            >
              <div className="w-9 h-9 rounded-2xl bg-[#13141b] text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">
                {adminUser.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="hidden md:block text-left max-w-[130px]">
                <span className="text-xs font-bold text-slate-900 block leading-tight truncate group-hover:text-indigo-600 transition-colors">{adminUser.name}</span>
                <span className="text-[10px] text-slate-400 font-medium font-mono truncate block">{adminUser.id}</span>
              </div>
            </button>

            {/* Prominent Log Out Header Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 hover:text-rose-700 font-bold text-xs transition cursor-pointer shadow-xs ml-1"
              title="Sign Out of Admin Account"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </header>

        {/* Scrollable View Content */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6 custom-scrollbar">
          {activeTab === 'Dashboard' && (
            <DashboardView
              stats={stats}
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
              setCourses={setCourses}
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

          {activeTab === 'Profile & Settings' && (
            <AdminProfileView
              adminUser={adminUser}
              onSaveProfile={handleSaveProfile}
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
// SECTION: ADMIN PROFILE & ACCOUNT SETTINGS VIEW
// =============================================================
function AdminProfileView({ adminUser, onSaveProfile, triggerToast }) {
  const [profileForm, setProfileForm] = useState({
    name: adminUser?.name || 'Exam Controller',
    id: adminUser?.id || 'ADM-001',
    email: adminUser?.email || 'admin@univ.edu',
    department: adminUser?.department || 'Office of Academic Affairs & Examination Cell',
    role: adminUser?.role || 'Administrator',
    phone: adminUser?.phone || '+91 98765 00001',
    designation: adminUser?.designation || 'Chief Academic Controller & Administrator'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  useEffect(() => {
    if (adminUser) {
      setProfileForm({
        name: adminUser.name || 'Exam Controller',
        id: adminUser.id || 'ADM-001',
        email: adminUser.email || 'admin@univ.edu',
        department: adminUser.department || 'Office of Academic Affairs & Examination Cell',
        role: adminUser.role || 'Administrator',
        phone: adminUser.phone || '+91 98765 00001',
        designation: adminUser.designation || 'Chief Academic Controller & Administrator'
      });
    }
  }, [adminUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      triggerToast('Display Name cannot be empty', 'error');
      return;
    }
    onSaveProfile(profileForm);
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 4500);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword) {
      triggerToast('Please provide a new password', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      triggerToast('New password and confirm password do not match', 'error');
      return;
    }
    saveAdminCredentials({ password: passwordForm.newPassword });
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    triggerToast('Administrator security password updated successfully! New password is now active.');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Hero Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#f5caa0] via-[#f4e6fc] to-[#e7f6ee] text-[#13141b] flex items-center justify-center font-black text-2xl shadow-md border-2 border-white shrink-0">
              {profileForm.name.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#13141b] text-white">
                  {profileForm.role}
                </span>
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active Session
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                {profileForm.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                ID: <span className="font-mono font-bold text-slate-700">{profileForm.id}</span> • {profileForm.department}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#13141b] text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer shadow-md hover:shadow-lg"
            >
              <Save size={15} />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {isSavedSuccess && (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>Your profile has been saved successfully! Your name is now updated to <strong>{profileForm.name}</strong> across the portal.</span>
            </div>
            <button onClick={() => setIsSavedSuccess(false)} className="text-emerald-600 hover:text-emerald-900">
              <X size={15} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Editable Personal Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 lg:p-7 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <User size={18} className="text-[#8a4816]" /> Personal Account Information
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Edit your name, identification number, and departmental records</p>
              </div>
              <span className="text-[11px] font-bold text-slate-400">All fields editable</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* Name Field */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 focus-within:border-slate-900 transition-colors">
                <label className="font-extrabold text-slate-900 text-xs block mb-1.5 flex items-center justify-between">
                  <span>Full Name (Display Name) *</span>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Displayed in Top Bar & Sidebar
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="e.g. Exam Controller"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <p className="text-[11px] text-slate-500 mt-2">
                  Changing this name immediately updates your profile greeting, top navigation pill, and sidebar account card.
                </p>

                {/* Quick Name Presets */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => setProfileForm({ ...profileForm, name: 'Exam Controller' })}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-400 text-[11px] font-bold text-slate-700 transition cursor-pointer"
                  >
                    Exam Controller
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileForm({ ...profileForm, name: 'Chief Administrator' })}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-400 text-[11px] font-bold text-slate-700 transition cursor-pointer"
                  >
                    Chief Administrator
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileForm({ ...profileForm, name: 'Dean of Academic Affairs' })}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-400 text-[11px] font-bold text-slate-700 transition cursor-pointer"
                  >
                    Dean of Academic Affairs
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">User ID / Staff ID *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.id}
                    onChange={(e) => setProfileForm({ ...profileForm, id: e.target.value })}
                    placeholder="e.g. ADM-001"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    placeholder="e.g. admin@univ.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Department / Office</label>
                <input
                  type="text"
                  value={profileForm.department}
                  onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                  placeholder="e.g. Office of Academic Affairs & Examination Cell"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Official Designation</label>
                  <input
                    type="text"
                    value={profileForm.designation}
                    onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })}
                    placeholder="Academic Operations Controller"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Data is permanently stored in browser local storage.
                </span>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#13141b] text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer shadow-sm hover:shadow"
                >
                  <Check size={16} /> Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Security & Role Details */}
        <div className="space-y-6">
          {/* Change Password / Security */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <KeyRound size={17} className="text-amber-600" /> Security & Passwords
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* System Access & Capabilities */}
          <div className="bg-[#13141b] text-white rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2.5 mb-3">
              <ShieldCheck size={20} className="text-[#f5caa0]" />
              <h4 className="font-extrabold text-sm text-white">Administrator Privileges</h4>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              You are signed in as an authenticated Super Administrator with complete system authority.
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="text-slate-300">Degree & Subject Catalog</span>
                <span className="text-emerald-400 font-bold">48 BCA Subjects</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="text-slate-300">User Account Roles</span>
                <span className="text-emerald-400 font-bold">Full Control</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="text-slate-300">Certificate Generation</span>
                <span className="text-emerald-400 font-bold">Authorized</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-sm text-slate-700">No users created yet</p>
                    <p className="text-xs text-slate-400 mt-1">Click &apos;Add User&apos; above or register users to populate this list.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
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
                )))}
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
function CoursesSubjectsView({ courses, setCourses, subjects, setSubjects, teachers, students, triggerToast }) {
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [assignTeacherModal, setAssignTeacherModal] = useState(null);
  const [assignStudentModal, setAssignStudentModal] = useState(null);

  // Add Course Form
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    duration: '3 Years (6 Sems)',
    head: ''
  });

  // Add Subject Form
  const [subjectForm, setSubjectForm] = useState({
    code: '',
    name: '',
    course: courses[0]?.code || 'BCA',
    semester: 'Sem 1',
    credits: 4,
    type: 'Core',
    teacher: teachers[0]?.name || 'Unassigned',
    enrolled: 0
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

  const handleAddCourse = (e) => {
    e.preventDefault();
    if (!courseForm.code.trim() || !courseForm.name.trim()) return;
    const newCourse = {
      id: `CRS-${Date.now().toString().slice(-4)}`,
      code: courseForm.code.trim().toUpperCase(),
      name: courseForm.name.trim(),
      duration: courseForm.duration.trim() || '3 Years (6 Sems)',
      head: courseForm.head.trim() || (teachers[0]?.name || 'Department HOD'),
      totalSubjects: 0
    };
    if (setCourses) setCourses((prev) => [...prev, newCourse]);
    triggerToast(`Degree program ${newCourse.code} created successfully!`);
    setIsAddCourseOpen(false);
    setCourseForm({ code: '', name: '', duration: '3 Years (6 Sems)', head: '' });
  };

  const handleDeleteCourse = (id, code, e) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Delete degree course ${code}?`)) {
      if (setCourses) setCourses((prev) => prev.filter((c) => c.id !== id));
      triggerToast(`Degree course ${code} removed.`, 'info');
    }
  };

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
    setSubjectForm({ code: '', name: '', course: courses[0]?.code || 'BCA', semester: 'Sem 1', credits: 4, type: 'Core', teacher: teachers[0]?.name || 'Unassigned', enrolled: 0 });
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 bg-white rounded-full border border-slate-200 text-slate-600">
              {courses.length} Active Degrees
            </span>
            <button
              onClick={() => setIsAddCourseOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#13141b] text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
            >
              <Plus size={14} /> Add Degree Course
            </button>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <BookOpen size={32} className="mx-auto text-slate-300 mb-2" />
            <h4 className="font-extrabold text-sm text-slate-700">No Degree Courses registered yet</h4>
            <p className="text-xs text-slate-400 mt-1">Click &apos;Add Degree Course&apos; above to register degree programs (e.g. BCA, B.Tech, MCA).</p>
          </div>
        ) : (
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
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/70 text-slate-800">
                      {c.duration}
                    </span>
                    <button
                      onClick={(e) => handleDeleteCourse(c.id, c.code, e)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Degree Course"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-slate-800 mt-2 line-clamp-1">{c.name}</h4>
                <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] text-slate-600">
                  <span>Head: <strong>{c.head}</strong></span>
                  <span className="font-bold">{c.totalSubjects || 0} Subjects</span>
                </div>
              </div>
            ))}
          </div>
        )}
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

          {/* Quick 1-Click Load Full BCA Curriculum */}
          <button
            onClick={() => {
              const updated = populateBcaCurriculum();
              setSubjects(updated);
              triggerToast('All 48 BCA Curriculum subjects (Sem 1 to 6) loaded successfully!');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl text-xs font-bold hover:opacity-95 transition shadow-xs cursor-pointer"
            title="Load all 48 official BCA subjects across Sem 1 to 6 into the catalog"
          >
            <Sparkles size={14} /> Load Full BCA Curriculum (48 Subjects)
          </button>

          <button
            onClick={() => setIsAddSubjectOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#13141b] text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
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
                <th className="py-4 px-4">Subject Type</th>
                <th className="py-4 px-4">Assigned Teacher</th>
                <th className="py-4 px-4">Enrolled Students</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <BookOpen size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-sm text-slate-700">No subjects created yet</p>
                    <p className="text-xs text-slate-400 mt-1">Click &apos;Add Subject&apos; or &apos;Load Full BCA Curriculum&apos; above.</p>
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((s) => (
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
                      <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${parseInt(s.semester.replace(/\D/g, ''), 10) % 2 !== 0
                          ? 'bg-[#fdeedc] text-[#8a4816]'
                          : 'bg-[#e9f2fc] text-[#1e40af]'
                        }`}>
                        {parseInt(s.semester.replace(/\D/g, ''), 10) % 2 !== 0 ? 'Odd Sem' : 'Even Sem'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fdeedc] text-[#8a4816]">
                        {s.type || 'Core'}
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
                )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Subject */}
      {isAddSubjectOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Add New Subject</h3>
                <p className="text-[11px] text-slate-400">Select from BCA curriculum or enter custom course details</p>
              </div>
              <button onClick={() => setIsAddSubjectOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubject} className="space-y-4 mt-4 text-xs">
              {/* Semester-Wise Subject Dropdown */}
              <div className="p-3.5 rounded-2xl bg-[#fafafc] border border-slate-200">
                <label className="font-extrabold text-slate-900 block mb-1 text-xs flex items-center justify-between">
                  <span>Quick Select from BCA Curriculum</span>
                  <span className="text-[10px] text-amber-700 font-bold bg-[#fdeedc] px-2 py-0.5 rounded-md">
                    Semesters 1 to 6
                  </span>
                </label>
                <select
                  onChange={(e) => {
                    const selCode = e.target.value;
                    const found = BCA_CURRICULUM.find((s) => s.code === selCode);
                    if (found) {
                      setSubjectForm({
                        ...subjectForm,
                        code: found.code,
                        name: found.name,
                        semester: found.semester,
                        type: found.type || 'Core',
                        course: 'BCA'
                      });
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 outline-none font-semibold text-slate-900 text-xs"
                >
                  <option value="">-- Choose Subject to Auto-Fill --</option>
                  {[1, 2, 3, 4, 5, 6].map((sem) => (
                    <optgroup
                      key={sem}
                      label={`Semester ${sem} (${BCA_CURRICULUM.filter((s) => s.semesterNum === sem).length} Subjects)`}
                    >
                      {BCA_CURRICULUM.filter((s) => s.semesterNum === sem).map((sub) => (
                        <option key={sub.code} value={sub.code}>
                          {sub.code} — {sub.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Selecting a subject auto-populates Code, Title, Semester, and Type below.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subject Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BCA161-1"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subject Type</label>
                  <select
                    value={subjectForm.type}
                    onChange={(e) => setSubjectForm({ ...subjectForm, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none font-medium text-slate-900"
                  >
                    <option value="Core">Core</option>
                    <option value="Ability Enhancement">Ability Enhancement</option>
                    <option value="Skill Enhancement">Skill Enhancement</option>
                    <option value="Value Added">Value Added</option>
                    <option value="Multidisciplinary">Multidisciplinary</option>
                    <option value="Elective">Elective</option>
                    <option value="Practical">Practical</option>
                    <option value="Internship">Internship</option>
                    <option value="Project">Project</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Introduction to Web Technology"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Course / Degree</label>
                  <select
                    value={subjectForm.course}
                    onChange={(e) => setSubjectForm({ ...subjectForm, course: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none font-medium text-slate-900"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.code}>{c.code}</option>
                    ))}
                    {!courses.some(c => c.code === 'BCA') && (
                      <option value="BCA">BCA</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Semester</label>
                  <select
                    value={subjectForm.semester}
                    onChange={(e) => setSubjectForm({ ...subjectForm, semester: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none font-medium text-slate-900"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none font-medium text-slate-900"
                >
                  <option value="Department Faculty">Department Faculty (Unassigned)</option>
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
                  className="px-5 py-2 rounded-xl bg-[#13141b] text-white font-bold hover:bg-slate-800 transition"
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

      {/* Modal: Add Degree Course */}
      {isAddCourseOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Add New Degree Course</h3>
              <button onClick={() => setIsAddCourseOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCourse} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Course Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BCA, B.Tech CSE, MCA"
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Degree Program Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bachelor of Computer Applications"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duration & Sems</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3 Years (6 Sems)"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Head of Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Jane Smith"
                    value={courseForm.head}
                    onChange={(e) => setCourseForm({ ...courseForm, head: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddCourseOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#13141b] text-white font-bold hover:bg-slate-800"
                >
                  Create Degree Course
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

  const handleDeleteTeacher = (id, name) => {
    if (window.confirm(`Are you sure you want to delete teacher: ${name}?`)) {
      setTeachers((prev) => prev.filter((t) => t.id !== id));
      triggerToast(`Teacher ${name} removed.`, 'info');
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
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#13141b] text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition shadow-xs cursor-pointer"
        >
          <Plus size={16} /> Add Teacher
        </button>
      </div>

      {/* Teacher Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {teachers.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <GraduationCap size={36} className="mx-auto text-slate-300 mb-2" />
            <h4 className="font-extrabold text-sm text-slate-700">No Faculty or Teachers registered yet</h4>
            <p className="text-xs text-slate-400 mt-1">Click &apos;Add Teacher&apos; above to register faculty members from scratch.</p>
          </div>
        ) : (
          teachers.map((t, i) => (
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
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteTeacher(t.id, t.name)}
                      title="Delete Teacher"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 size={15} />
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
          )))}
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
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    usn: '',
    course: 'BCA',
    semester: 'Semester 1',
    section: 'Section A',
    cgpa: 8.0,
    midsemMarks: 40,
    endsemStatus: 'Eligible',
    status: 'Active'
  });

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

  const handleAddStudent = (e) => {
    e.preventDefault();
    const newSt = {
      id: `STU-${Math.floor(100 + Math.random() * 900)}`,
      name: newStudentForm.name,
      usn: newStudentForm.usn || `1BT26BCA${Math.floor(100 + Math.random() * 900)}`,
      course: newStudentForm.course,
      semester: newStudentForm.semester,
      section: newStudentForm.section,
      cgpa: Number(newStudentForm.cgpa),
      midsemMarks: Number(newStudentForm.midsemMarks),
      endsemStatus: newStudentForm.endsemStatus,
      status: newStudentForm.status,
      enrolledSubjects: [],
      backlogsCount: 0,
      backlogsHistory: []
    };
    setStudents((prev) => [newSt, ...prev]);
    triggerToast(`Student ${newStudentForm.name} added successfully!`);
    setIsAddStudentOpen(false);
    setNewStudentForm({
      name: '',
      usn: '',
      course: 'BCA',
      semester: 'Semester 1',
      section: 'Section A',
      cgpa: 8.0,
      midsemMarks: 40,
      endsemStatus: 'Eligible',
      status: 'Active'
    });
  };

  const handleDeleteStudent = (id, name) => {
    if (window.confirm(`Are you sure you want to delete student: ${name}?`)) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      triggerToast(`Student ${name} removed.`, 'info');
    }
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

          <button
            onClick={() => setIsAddStudentOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#13141b] text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition shadow-xs whitespace-nowrap cursor-pointer"
          >
            <Plus size={16} /> Add Student
          </button>
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <Users size={36} className="mx-auto text-slate-300 mb-2" />
            <h4 className="font-extrabold text-sm text-slate-700">No Students found</h4>
            <p className="text-xs text-slate-400 mt-1">Click &apos;Add Student&apos; above to register new student records from scratch.</p>
          </div>
        ) : (
          filteredStudents.map((st, i) => (
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
                  className="text-xs font-bold text-[#13141b] bg-[#f4e8fd] hover:bg-[#eccffc] px-3.5 py-1.5 rounded-xl transition cursor-pointer"
                >
                  Academic Details
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(st)}
                    title="Edit Student Info"
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(st.id, st.name)}
                    title="Delete Student"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          )))}
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

      {/* Modal: Add Student */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Add New Student</h3>
              <button onClick={() => setIsAddStudentOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newStudentForm.name}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">USN / Roll Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1BT26BCA001"
                    value={newStudentForm.usn}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, usn: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Program / Degree</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BCA, B.Tech"
                    value={newStudentForm.course}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, course: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Semester</label>
                  <select
                    value={newStudentForm.semester}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, semester: e.target.value })}
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
                    placeholder="Section A"
                    value={newStudentForm.section}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, section: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Initial CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={newStudentForm.cgpa}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, cgpa: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Midsem Marks (/50)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={newStudentForm.midsemMarks}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, midsemMarks: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#13141b] text-white font-bold hover:bg-slate-800"
                >
                  Create Student
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
  const [isAddBacklogOpen, setIsAddBacklogOpen] = useState(false);

  const [backlogForm, setBacklogForm] = useState({
    studentName: '',
    usn: '',
    semester: 'Semester 1',
    subjectCode: '',
    subjectName: '',
    backlogReason: 'Low Marks in End-Sem',
    originalMarks: 18,
    maxMarks: 50,
    repeatExamStatus: 'Preparing'
  });

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

  const handleAddBacklogCase = (e) => {
    e.preventDefault();
    const newRecord = {
      studentName: backlogForm.studentName,
      usn: backlogForm.usn,
      semester: backlogForm.semester,
      subjectCode: backlogForm.subjectCode,
      subjectName: backlogForm.subjectName,
      backlogReason: backlogForm.backlogReason,
      originalMarks: Number(backlogForm.originalMarks),
      maxMarks: Number(backlogForm.maxMarks),
      repeatExamStatus: backlogForm.repeatExamStatus,
      clearanceStatus: 'In Review',
      resultStatus: 'Pending',
      metTeacher: false,
      assignmentsCompleted: 'Pending',
      studentRemarks: 'Registered for backlog evaluation cycle.'
    };
    const updated = addBacklogRecord(newRecord);
    setBacklogRecords(updated);
    triggerToast(`Backlog case for ${backlogForm.studentName} (${backlogForm.subjectCode}) registered!`);
    setIsAddBacklogOpen(false);
    setBacklogForm({
      studentName: '',
      usn: '',
      semester: 'Semester 1',
      subjectCode: '',
      subjectName: '',
      backlogReason: 'Low Marks in End-Sem',
      originalMarks: 18,
      maxMarks: 50,
      repeatExamStatus: 'Preparing'
    });
  };

  const handleDeleteBacklog = (id, subjectCode) => {
    if (window.confirm(`Are you sure you want to delete backlog case ${subjectCode}?`)) {
      const updated = deleteBacklogRecord(id);
      setBacklogRecords(updated);
      triggerToast(`Backlog case ${subjectCode} removed.`, 'info');
    }
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

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search student, USN, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#f6f7fa] border border-transparent focus:border-slate-300 focus:bg-white text-xs text-slate-900 outline-none transition"
              />
            </div>
            <button
              onClick={() => setIsAddBacklogOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#13141b] text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition shadow-xs whitespace-nowrap cursor-pointer"
            >
              <Plus size={16} /> Register Backlog Case
            </button>
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
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${clearanceFilter === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <AlertCircle size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-sm text-slate-700">No Backlog Cases found</p>
                    <p className="text-xs text-slate-400 mt-1">Click &apos;Register Backlog Case&apos; above to record backlog items from scratch.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
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
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer ${expandedRowIds[item.id]
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
                          <button
                            onClick={() => handleDeleteBacklog(item.id, item.subjectCode)}
                            title="Delete Backlog Case"
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 size={14} />
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
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block ${item.backlogReason.includes('Attendance')
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
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block ${item.repeatExamStatus === 'Appeared'
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
                )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register New Backlog Case */}
      {isAddBacklogOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Register New Backlog Case</h3>
              <button onClick={() => setIsAddBacklogOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddBacklogCase} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Student Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={backlogForm.studentName}
                    onChange={(e) => setBacklogForm({ ...backlogForm, studentName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">USN / Roll Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1BT26BCA001"
                    value={backlogForm.usn}
                    onChange={(e) => setBacklogForm({ ...backlogForm, usn: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  />
                </div>
              </div>

              {/* Semester-Wise Backlog Subject Dropdown */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="font-extrabold text-slate-900 block mb-1 text-xs flex items-center justify-between">
                  <span>Select Subject from BCA Curriculum</span>
                  <span className="text-[10px] text-amber-700 font-bold bg-[#fdeedc] px-2 py-0.5 rounded-md">
                    Semesters 1 to 6
                  </span>
                </label>
                <select
                  value={backlogForm.subjectCode}
                  onChange={(e) => {
                    const selCode = e.target.value;
                    const found = BCA_CURRICULUM.find((s) => s.code === selCode);
                    if (found) {
                      setBacklogForm({
                        ...backlogForm,
                        subjectCode: found.code,
                        subjectName: found.name,
                        semester: `Semester ${found.semesterNum}`
                      });
                    } else {
                      setBacklogForm({ ...backlogForm, subjectCode: selCode });
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 outline-none font-semibold text-slate-900 text-xs"
                >
                  <option value="">-- Choose Backlog Subject --</option>
                  {[1, 2, 3, 4, 5, 6].map((sem) => (
                    <optgroup
                      key={sem}
                      label={`Semester ${sem} (${BCA_CURRICULUM.filter((s) => s.semesterNum === sem).length} Subjects)`}
                    >
                      {BCA_CURRICULUM.filter((s) => s.semesterNum === sem).map((sub) => (
                        <option key={sub.code} value={sub.code}>
                          {sub.code} — {sub.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Selecting auto-fills Code, Subject Name, and Semester below.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BCA161-1"
                    value={backlogForm.subjectCode}
                    onChange={(e) => setBacklogForm({ ...backlogForm, subjectCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Semester</label>
                  <select
                    value={backlogForm.semester}
                    onChange={(e) => setBacklogForm({ ...backlogForm, semester: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={`Semester ${n}`}>Semester {n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Introduction to Web Technology"
                  value={backlogForm.subjectName}
                  onChange={(e) => setBacklogForm({ ...backlogForm, subjectName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Backlog</label>
                <select
                  value={backlogForm.backlogReason}
                  onChange={(e) => setBacklogForm({ ...backlogForm, backlogReason: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                >
                  <option value="Low Marks in End-Sem">Low Marks in End-Sem</option>
                  <option value="Attendance Shortage">Attendance Shortage</option>
                  <option value="Missed Internal Exam">Missed Internal Exam</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Original Marks Scored</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={backlogForm.originalMarks}
                    onChange={(e) => setBacklogForm({ ...backlogForm, originalMarks: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Repeat Exam Status</label>
                  <select
                    value={backlogForm.repeatExamStatus}
                    onChange={(e) => setBacklogForm({ ...backlogForm, repeatExamStatus: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  >
                    <option value="Preparing">Preparing</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Appeared">Appeared</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddBacklogOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#13141b] text-white font-bold hover:bg-slate-800"
                >
                  Register Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

