import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  GraduationCap,
  ArrowLeft,
  User,
  Hash,
  BookOpen,
  Briefcase,
  Building,
  ShieldCheck,
  Mail,
  Lock
} from 'lucide-react';
import {
  addUser,
  addStudent,
  addTeacher,
  isStudentIdentifier,
  isFacultyIdentifier,
  getCurriculumSubjectsForYearAndSem,
  UNIVERSITY_DEPARTMENTS,
  ADMIN_DIVISIONS
} from '../utils/backlogStore';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState('student');
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [customDeptValue, setCustomDeptValue] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    idNumber: '', // USN for student, EmpID for faculty, StaffID for admin
    departmentCourse: 'Bachelor of Computer Applications (BCA)',
    academicYear: '1st Year',
    levelDesignation: 'Semester 1',
    email: '',
    username: '',
    password: ''
  });

  const [toast, setToast] = useState(null);

  // Extract role from URL query param if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam && ['student', 'faculty', 'admin'].includes(roleParam)) {
      setRole(roleParam);
      // Set sensible defaults for each role
      if (roleParam === 'student') {
        setIsCustomDept(false);
        setFormData((prev) => ({
          ...prev,
          departmentCourse: 'Bachelor of Computer Applications (BCA)',
          academicYear: '1st Year',
          levelDesignation: 'Semester 1'
        }));
      } else if (roleParam === 'faculty') {
        setIsCustomDept(false);
        setFormData((prev) => ({
          ...prev,
          departmentCourse: 'School of Sciences',
          levelDesignation: 'Assistant Professor'
        }));
      } else if (roleParam === 'admin') {
        setIsCustomDept(false);
        setFormData((prev) => ({
          ...prev,
          departmentCourse: 'Examinations & Evaluation Branch',
          levelDesignation: 'Exam Coordinator'
        }));
      }
    }
  }, [location]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setIsCustomDept(false);
    if (newRole === 'student') {
      setFormData((prev) => ({
        ...prev,
        departmentCourse: 'Bachelor of Computer Applications (BCA)',
        academicYear: '1st Year',
        levelDesignation: 'Semester 1'
      }));
    } else if (newRole === 'faculty') {
      setFormData((prev) => ({
        ...prev,
        departmentCourse: 'School of Sciences',
        levelDesignation: 'Assistant Professor'
      }));
    } else if (newRole === 'admin') {
      setFormData((prev) => ({
        ...prev,
        departmentCourse: 'Examinations & Evaluation Branch',
        levelDesignation: 'Exam Coordinator'
      }));
    }
  };

  const handleYearChange = (year) => {
    let defaultSem = 'Semester 1';
    if (year === '2nd Year') defaultSem = 'Semester 3';
    else if (year === '3rd Year') defaultSem = 'Semester 5';
    else if (year === '4th Year') defaultSem = 'Semester 7';

    // If current semester already belongs to this year, preserve it
    const sem = formData.levelDesignation;
    let keepSem = false;
    if (year === '1st Year' && (sem === 'Semester 1' || sem === 'Semester 2')) keepSem = true;
    if (year === '2nd Year' && (sem === 'Semester 3' || sem === 'Semester 4')) keepSem = true;
    if (year === '3rd Year' && (sem === 'Semester 5' || sem === 'Semester 6')) keepSem = true;
    if (year === '4th Year' && (sem === 'Semester 7' || sem === 'Semester 8')) keepSem = true;

    setFormData((prev) => ({
      ...prev,
      academicYear: year,
      levelDesignation: keepSem ? sem : defaultSem
    }));
  };

  const handleSemesterChange = (sem) => {
    let derivedYear = '1st Year';
    if (sem === 'Semester 3' || sem === 'Semester 4') derivedYear = '2nd Year';
    else if (sem === 'Semester 5' || sem === 'Semester 6') derivedYear = '3rd Year';
    else if (sem === 'Semester 7' || sem === 'Semester 8') derivedYear = '4th Year';

    setFormData((prev) => ({
      ...prev,
      academicYear: derivedYear,
      levelDesignation: sem
    }));
  };


  const handleRegister = (e) => {
    e.preventDefault();

    const cleanName = formData.name.trim();
    const cleanId = formData.idNumber.trim();
    const cleanEmail = formData.email.trim() || `${formData.username.trim() || cleanId.toLowerCase()}@${role === 'student' ? 'student.' : ''}univ.edu`;
    const cleanUsername = formData.username.trim() || cleanId;
    const cleanPassword = (formData.password || '').trim();

    if (!cleanName || !cleanId || !cleanUsername || !cleanPassword) {
      setToast('Please fill in all required fields including password.');
      return;
    }

    if (role !== 'student' && isStudentIdentifier(cleanId)) {
      setToast('Access Denied: Student ID cannot be registered for Faculty or Administrator role.');
      return;
    }

    if (role === 'student' && (isFacultyIdentifier(cleanId) || isFacultyIdentifier(cleanEmail) || isFacultyIdentifier(cleanUsername))) {
      setToast('Access Denied: This ID or email is registered to a Faculty account. Please use unique student credentials.');
      return;
    }

    // Do not auto-assign subjects: student chooses their own subjects from their dashboard space
    const enrolledSubjects = [];

    const newSession = {
      username: cleanUsername,
      name: cleanName,
      id: cleanId,
      usn: cleanId,
      empId: cleanId,
      role: role,
      email: cleanEmail,
      course: role === 'student' ? formData.departmentCourse : undefined,
      academicYear: role === 'student' ? formData.academicYear : undefined,
      semester: role === 'student' ? formData.levelDesignation : undefined,
      enrolledSubjects: [],
      department: role !== 'student' ? formData.departmentCourse : undefined,
      designation: role !== 'student' ? formData.levelDesignation : undefined,
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      localStorage.setItem('currentUser', JSON.stringify(newSession));
    } catch {}

    // Add to global users store
    addUser({
      id: cleanId,
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      password: cleanPassword,
      role: role.charAt(0).toUpperCase() + role.slice(1),
      department: formData.departmentCourse,
      status: 'Active'
    });

    // If student, add to students store with empty subjects so student can select their own
    if (role === 'student') {
      addStudent({
        id: `STU-${cleanId}`,
        name: cleanName,
        usn: cleanId,
        username: cleanUsername,
        password: cleanPassword,
        course: formData.departmentCourse,
        academicYear: formData.academicYear,
        semester: formData.levelDesignation,
        semesterType: [1, 3, 5, 7].some((n) => formData.levelDesignation.includes(String(n))) ? 'Odd' : 'Even',
        section: 'Section A',
        email: cleanEmail,
        cgpa: 0.0,
        midsemMarks: null,
        midsemAverage: null,
        endsemMarks: null,
        endsemStatus: 'Pending',
        backlogsCount: 0,
        status: 'Active',
        enrolledSubjects: [],
        backlogsHistory: []
      });
    }

    // If faculty, add to teachers store with password
    if (role === 'faculty') {
      addTeacher({
        id: `TCH-${cleanId}`,
        name: cleanName,
        empId: cleanId,
        username: cleanUsername,
        password: cleanPassword,
        email: cleanEmail,
        department: formData.departmentCourse,
        designation: formData.levelDesignation,
        subjects: [],
        sections: [],
        hoursPerWeek: 14,
        experience: 'New Faculty'
      });
    }

    setToast(`Account created successfully for ${cleanName}! Redirecting to ${role} portal...`);

    setTimeout(() => {
      if (role === 'student') navigate('/student');
      else if (role === 'faculty') navigate('/faculty');
      else if (role === 'admin') navigate('/admin');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#f4f9fd] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-[#03045e] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#0077b6]/40 animate-bounce">
          <Sparkles size={18} className="text-[#00b4d8]" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#90e0ef] rounded-full mix-blend-multiply filter blur-3xl opacity-35"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-[#caf0f8] rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
      <div className="absolute top-[40%] left-[5%] w-80 h-80 bg-[#00b4d8]/15 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex justify-center items-center gap-2 mb-6 text-slate-500 hover:text-[#0077b6] transition">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="flex justify-center">
          <div className={`p-3 rounded-2xl shadow-xl shadow-[#0077b6]/25 ${
            role === 'student' ? 'bg-[#0077b6]' : role === 'faculty' ? 'bg-[#0077b6]' : 'bg-[#03045e]'
          }`}>
            {role === 'student' ? (
              <GraduationCap className="h-10 w-10 text-white" />
            ) : role === 'faculty' ? (
              <Briefcase className="h-10 w-10 text-white" />
            ) : (
              <ShieldCheck className="h-10 w-10 text-white" />
            )}
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#03045e] tracking-tight capitalize">
          {role === 'student' && 'Student Registration'}
          {role === 'faculty' && 'Faculty Member Registration'}
          {role === 'admin' && 'Administrator Registration'}
        </h2>

        <p className="mt-2 text-center text-sm text-slate-600">
          {role === 'student' && 'Create an account to manage your academic progress, backlogs, and updates'}
          {role === 'faculty' && 'Register your academic staff profile to evaluate student updates and manage backlogs'}
          {role === 'admin' && 'Create an administrative profile for university examinations and department supervision'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl md:max-w-2xl relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl shadow-[#03045e]/5 sm:rounded-3xl sm:px-10 border border-[#caf0f8]">
          
          {/* Role selector */}
          <div className="flex p-1 bg-[#caf0f8]/50 rounded-2xl mb-8">
            {['student', 'faculty', 'admin'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleChange(r)}
                className={`flex-1 py-2 text-sm font-semibold capitalize rounded-xl transition-all cursor-pointer ${
                  role === r
                    ? 'bg-[#0077b6] text-white shadow-md shadow-[#0077b6]/20'
                    : 'text-slate-500 hover:text-[#03045e]'
                }`}
              >
                {r === 'student' && 'Student'}
                {r === 'faculty' && 'Faculty'}
                {r === 'admin' && 'Admin'}
              </button>
            ))}
          </div>

          <form className="space-y-5" onSubmit={handleRegister}>
            {/* Row 1: Full Name & ID Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                    placeholder={role === 'student' ? 'e.g. John Doe' : role === 'faculty' ? 'e.g. Dr. Jane Smith' : 'e.g. Exam Controller'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  {role === 'student' && 'University USN / Enrollment No.'}
                  {role === 'faculty' && 'Faculty Employee ID'}
                  {role === 'admin' && 'Admin Staff ID'}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 font-mono"
                    placeholder={role === 'student' ? 'e.g. 1BT24BCA001' : role === 'faculty' ? 'e.g. FAC-2001' : 'e.g. ADM-101'}
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Course/Dept & Year/Semester/Designation */}
            {role === 'student' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Course Selection */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 leading-snug h-10 flex items-end pb-1.5">
                    Course / Degree Program
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BookOpen className="h-5 w-5 text-slate-400" />
                    </div>
                    <select
                      value={formData.departmentCourse}
                      onChange={(e) => setFormData({ ...formData, departmentCourse: e.target.value })}
                      className="block w-full h-11 pl-10 pr-6 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 text-xs font-bold truncate cursor-pointer"
                    >
                      <option value="Bachelor of Computer Applications (BCA)">Bachelor of Computer Applications (BCA)</option>
                      <option value="B.Tech Computer Science & Engineering">B.Tech Computer Science & Engineering</option>
                      <option value="B.Sc Information Technology">B.Sc Information Technology</option>
                    </select>
                  </div>
                </div>

                {/* Academic Year Selection */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 leading-snug h-10 flex items-end pb-1.5">
                    Academic Year *
                  </label>
                  <select
                    value={formData.academicYear}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className="block w-full h-11 px-3 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 text-xs font-bold cursor-pointer"
                  >
                    <option value="1st Year">1st Year (First Year)</option>
                    <option value="2nd Year">2nd Year (Second Year)</option>
                    <option value="3rd Year">3rd Year (Third Year)</option>
                    <option value="4th Year">4th Year (Final Year)</option>
                  </select>
                </div>

                {/* Semester Dropdown */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 leading-snug h-10 flex items-end pb-1.5">
                    Semester *
                  </label>
                  <select
                    value={formData.levelDesignation}
                    onChange={(e) => handleSemesterChange(e.target.value)}
                    className="block w-full h-11 px-3 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 text-xs font-bold cursor-pointer"
                  >
                    <option value="" disabled>Select Semester</option>
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 6">Semester 6</option>
                    <option value="Semester 7">Semester 7</option>
                    <option value="Semester 8">Semester 8</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    {role === 'faculty' ? 'Academic Department / School' : 'Administrative Department / Division'} *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-slate-400" />
                    </div>
                    {role === 'faculty' ? (
                      <select
                        value={isCustomDept ? 'OTHER_CUSTOM' : formData.departmentCourse}
                        onChange={(e) => {
                          if (e.target.value === 'OTHER_CUSTOM') {
                            setIsCustomDept(true);
                            setFormData({ ...formData, departmentCourse: customDeptValue || '' });
                          } else {
                            setIsCustomDept(false);
                            setFormData({ ...formData, departmentCourse: e.target.value });
                          }
                        }}
                        className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-[#0077b6] focus:border-[#0077b6] bg-slate-50 text-xs sm:text-sm font-semibold text-slate-800 cursor-pointer"
                      >
                        {UNIVERSITY_DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                        <option value="OTHER_CUSTOM">+ Other / Custom Department...</option>
                      </select>
                    ) : (
                      <select
                        value={isCustomDept ? 'OTHER_CUSTOM' : formData.departmentCourse}
                        onChange={(e) => {
                          if (e.target.value === 'OTHER_CUSTOM') {
                            setIsCustomDept(true);
                            setFormData({ ...formData, departmentCourse: customDeptValue || '' });
                          } else {
                            setIsCustomDept(false);
                            setFormData({ ...formData, departmentCourse: e.target.value });
                          }
                        }}
                        className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-[#0077b6] focus:border-[#0077b6] bg-slate-50 text-xs sm:text-sm font-semibold text-slate-800 cursor-pointer"
                      >
                        {ADMIN_DIVISIONS.map((div) => (
                          <option key={div} value={div}>
                            {div}
                          </option>
                        ))}
                        <option value="OTHER_CUSTOM">+ Other / Custom Division...</option>
                      </select>
                    )}
                  </div>

                  {/* Conditional input when Other / Custom is selected */}
                  {isCustomDept && (
                    <div className="mt-2.5 animate-in fade-in slide-in-from-top-1">
                      <input
                        type="text"
                        required
                        placeholder={role === 'faculty' ? 'Type custom department name (e.g. Psychology, Linguistics)...' : 'Type custom administrative division...'}
                        value={customDeptValue}
                        onChange={(e) => {
                          setCustomDeptValue(e.target.value);
                          setFormData({ ...formData, departmentCourse: e.target.value });
                        }}
                        className="block w-full px-3.5 py-2.5 border border-[#0077b6]/50 rounded-xl focus:ring-[#0077b6] focus:border-[#0077b6] bg-white text-xs font-semibold text-slate-900 shadow-xs"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Designation / Administrative Title</label>
                  {role === 'faculty' ? (
                    <select
                      value={formData.levelDesignation}
                      onChange={(e) => setFormData({ ...formData, levelDesignation: e.target.value })}
                      className="mt-1 block w-full pl-3 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-[#0077b6] focus:border-[#0077b6] bg-slate-50 text-xs sm:text-sm font-semibold text-slate-800 cursor-pointer"
                    >
                      <option value="Professor & HOD">Professor & HOD</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Senior Lecturer">Senior Lecturer</option>
                      <option value="Guest Faculty">Guest Faculty</option>
                    </select>
                  ) : (
                    <select
                      value={formData.levelDesignation}
                      onChange={(e) => setFormData({ ...formData, levelDesignation: e.target.value })}
                      className="mt-1 block w-full pl-3 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-[#0077b6] focus:border-[#0077b6] bg-slate-50 text-xs sm:text-sm font-semibold text-slate-800 cursor-pointer"
                    >
                      <option value="Controller of Examinations">Controller of Examinations</option>
                      <option value="Dean of Academic Affairs">Dean of Academic Affairs</option>
                      <option value="Academic Registrar">Academic Registrar</option>
                      <option value="System Administrator">System Administrator</option>
                    </select>
                  )}
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Official University Email</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                  placeholder={role === 'student' ? 'student.name@student.univ.edu' : role === 'faculty' ? 'faculty.name@univ.edu' : 'admin@univ.edu'}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100"></div>

            {/* Username & Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700">Choose Username</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                    placeholder="e.g. your_username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Choose Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white transition-all cursor-pointer ${
                  role === 'student'
                    ? 'bg-[#0077b6] hover:bg-[#03045e] focus:ring-[#0077b6] shadow-[#0077b6]/25'
                    : role === 'faculty'
                    ? 'bg-[#0077b6] hover:bg-[#03045e] focus:ring-[#0077b6] shadow-[#0077b6]/25'
                    : 'bg-[#03045e] hover:bg-[#0077b6] focus:ring-[#03045e]'
                }`}
              >
                Register {role === 'student' ? 'Student' : role === 'faculty' ? 'Faculty' : 'Administrator'} Account
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to={`/login?role=${role}`} className="font-semibold text-[#0077b6] hover:text-[#03045e]">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
