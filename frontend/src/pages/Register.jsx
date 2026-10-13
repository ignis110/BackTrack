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
  Lock,
  Sparkles
} from 'lucide-react';
import { addUser, addStudent, addTeacher, isStudentIdentifier, isFacultyIdentifier, getCurriculumSubjectsForYearAndSem } from '../utils/backlogStore';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState('student');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    idNumber: '', // USN for student, EmpID for faculty, StaffID for admin
    departmentCourse: 'Bachelor of Computer Applications (BCA)',
    academicYear: '1st Year',
    levelDesignation: 'Semester 1 (Odd Sem)',
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
        setFormData((prev) => ({
          ...prev,
          departmentCourse: 'Bachelor of Computer Applications (BCA)',
          academicYear: '1st Year',
          levelDesignation: 'Semester 1 (Odd Sem)'
        }));
      } else if (roleParam === 'faculty') {
        setFormData((prev) => ({
          ...prev,
          departmentCourse: 'Computer Applications',
          levelDesignation: 'Assistant Professor'
        }));
      } else if (roleParam === 'admin') {
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
    if (newRole === 'student') {
      setFormData((prev) => ({
        ...prev,
        departmentCourse: 'Bachelor of Computer Applications (BCA)',
        academicYear: '1st Year',
        levelDesignation: 'Semester 1 (Odd Sem)'
      }));
    } else if (newRole === 'faculty') {
      setFormData((prev) => ({
        ...prev,
        departmentCourse: 'Computer Applications',
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
    let defaultSem = 'Semester 1 (Odd Sem)';
    if (year === '2nd Year') defaultSem = 'Semester 3 (Odd Sem)';
    if (year === '3rd Year') defaultSem = 'Semester 5 (Odd Sem)';
    setFormData((prev) => ({
      ...prev,
      academicYear: year,
      levelDesignation: defaultSem
    }));
  };

  const handleSemesterChange = (sem) => {
    let derivedYear = '1st Year';
    if (sem.includes('3') || sem.includes('4')) derivedYear = '2nd Year';
    if (sem.includes('5') || sem.includes('6')) derivedYear = '3rd Year';
    setFormData((prev) => ({
      ...prev,
      academicYear: derivedYear,
      levelDesignation: sem
    }));
  };

  // Preview subjects assigned for the chosen year and semester
  const previewSubjects = role === 'student'
    ? getCurriculumSubjectsForYearAndSem(formData.departmentCourse, formData.academicYear, formData.levelDesignation)
    : [];

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

    // Auto-assign curriculum subjects for students based on course, year, and semester
    const enrolledSubjects = role === 'student'
      ? getCurriculumSubjectsForYearAndSem(formData.departmentCourse, formData.academicYear, formData.levelDesignation)
      : [];

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
      enrolledSubjects: enrolledSubjects,
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

    // If student, add to students store with auto-enrolled subjects and password
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
        semesterType: formData.levelDesignation.includes('Odd') ? 'Odd' : 'Even',
        section: 'Section A',
        email: cleanEmail,
        cgpa: 8.5,
        midsemMarks: 42,
        endsemStatus: 'Eligible',
        backlogsCount: 0,
        status: 'Active',
        enrolledSubjects: enrolledSubjects,
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-[#13141b] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700/60 animate-bounce">
          <Sparkles size={18} className="text-[#f5caa0]" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex justify-center items-center gap-2 mb-6 text-slate-500 hover:text-indigo-600 transition">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="flex justify-center">
          <div className={`p-3 rounded-2xl shadow-lg ${
            role === 'student' ? 'bg-indigo-600' : role === 'faculty' ? 'bg-[#8a4816]' : 'bg-slate-900'
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

        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight capitalize">
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

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          
          {/* Role selector */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
            {['student', 'faculty', 'admin'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleChange(r)}
                className={`flex-1 py-2 text-sm font-semibold capitalize rounded-lg transition-all cursor-pointer ${
                  role === r
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
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
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Course Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Course / Degree Program</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BookOpen className="h-5 w-5 text-slate-400" />
                      </div>
                      <select
                        value={formData.departmentCourse}
                        onChange={(e) => setFormData({ ...formData, departmentCourse: e.target.value })}
                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 text-xs font-bold"
                      >
                        <option value="Bachelor of Computer Applications (BCA)">Bachelor of Computer Applications (BCA)</option>
                        <option value="B.Tech Computer Science & Engineering">B.Tech Computer Science & Engineering</option>
                        <option value="B.Sc Information Technology">B.Sc Information Technology</option>
                      </select>
                    </div>
                  </div>

                  {/* Academic Year Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Academic Year *</label>
                    <select
                      value={formData.academicYear}
                      onChange={(e) => handleYearChange(e.target.value)}
                      className="mt-1 block w-full px-3 py-3 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 text-xs font-bold cursor-pointer"
                    >
                      <option value="1st Year">1st Year (First Year)</option>
                      <option value="2nd Year">2nd Year (Second Year)</option>
                      <option value="3rd Year">3rd Year (Final Year)</option>
                    </select>
                  </div>

                  {/* Semester Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Semester Cycle *</label>
                    <select
                      value={formData.levelDesignation}
                      onChange={(e) => handleSemesterChange(e.target.value)}
                      className="mt-1 block w-full px-3 py-3 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 text-xs font-bold cursor-pointer"
                    >
                      {formData.academicYear === '1st Year' && (
                        <>
                          <option value="Semester 1 (Odd Sem)">Semester 1 (Odd Semester)</option>
                          <option value="Semester 2 (Even Sem)">Semester 2 (Even Semester)</option>
                        </>
                      )}
                      {formData.academicYear === '2nd Year' && (
                        <>
                          <option value="Semester 3 (Odd Sem)">Semester 3 (Odd Semester)</option>
                          <option value="Semester 4 (Even Sem)">Semester 4 (Even Semester)</option>
                        </>
                      )}
                      {formData.academicYear === '3rd Year' && (
                        <>
                          <option value="Semester 5 (Odd Sem)">Semester 5 (Odd Semester)</option>
                          <option value="Semester 6 (Even Sem)">Semester 6 (Even Semester)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Auto-Enrolled Subjects Preview */}
                <div className="p-4 bg-indigo-50/70 border border-indigo-100/90 rounded-2xl animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-900 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={14} className="text-indigo-600 shrink-0" />
                      Auto-Enrolled Curriculum ({previewSubjects.length} Courses for {formData.academicYear}):
                    </span>
                    <span className="text-[10px] bg-indigo-200/80 text-indigo-900 px-2.5 py-0.5 rounded-full font-bold">
                      {formData.levelDesignation}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {previewSubjects.map((sub) => (
                      <span
                        key={sub.code}
                        className={`px-2 py-1 rounded-xl text-[11px] font-semibold border ${
                          sub.isCurrentSemester
                            ? 'bg-white border-indigo-300 text-indigo-900 font-bold shadow-xs'
                            : 'bg-white/60 border-slate-200 text-slate-600'
                        }`}
                        title={`${sub.name} (${sub.code}) - ${sub.semester}`}
                      >
                        {sub.name} <span className="font-mono text-[10px] text-slate-400">({sub.code})</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Department / Branch</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.departmentCourse}
                      onChange={(e) => setFormData({ ...formData, departmentCourse: e.target.value })}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                      placeholder="Computer Applications"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Designation / Administrative Title</label>
                  {role === 'faculty' ? (
                    <select
                      value={formData.levelDesignation}
                      onChange={(e) => setFormData({ ...formData, levelDesignation: e.target.value })}
                      className="mt-1 block w-full pl-3 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
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
                      className="mt-1 block w-full pl-3 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
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
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                  placeholder="e.g. your_username"
                />
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
                    ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                    : role === 'faculty'
                    ? 'bg-[#8a4816] hover:bg-[#723a10] focus:ring-[#8a4816]'
                    : 'bg-slate-900 hover:bg-slate-800 focus:ring-slate-900'
                }`}
              >
                Register {role === 'student' ? 'Student' : role === 'faculty' ? 'Faculty' : 'Administrator'} Account
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to={`/login?role=${role}`} className="font-semibold text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
