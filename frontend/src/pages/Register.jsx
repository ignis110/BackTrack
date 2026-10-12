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

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState('student');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    idNumber: '', // USN for student, EmpID for faculty, StaffID for admin
    departmentCourse: 'Computer Applications',
    levelDesignation: 'Semester 3 (Odd Sem)',
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
          levelDesignation: 'Semester 3 (Odd Sem)'
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
        levelDesignation: 'Semester 3 (Odd Sem)'
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

  const handleRegister = (e) => {
    e.preventDefault();

    const cleanName = formData.name.trim() || (role === 'student' ? 'Demo Student' : role === 'faculty' ? 'Dr. Faculty Member' : 'System Admin');
    const cleanId = formData.idNumber.trim() || (role === 'student' ? '1BT23BCA099' : role === 'faculty' ? 'FAC-1002' : 'ADM-02');
    const cleanEmail = formData.email.trim() || `${formData.username.trim() || cleanId.toLowerCase()}@${role === 'student' ? 'student.' : ''}univ.edu`;

    const newSession = {
      username: formData.username.trim() || cleanId,
      name: cleanName,
      id: cleanId,
      usn: cleanId,
      empId: cleanId,
      role: role,
      email: cleanEmail,
      course: role === 'student' ? formData.departmentCourse : undefined,
      semester: role === 'student' ? formData.levelDesignation : undefined,
      department: role !== 'student' ? formData.departmentCourse : undefined,
      designation: role !== 'student' ? formData.levelDesignation : undefined,
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      localStorage.setItem('currentUser', JSON.stringify(newSession));
    } catch {}

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
                    placeholder={role === 'student' ? 'Aarav Patel' : role === 'faculty' ? 'Dr. Ramesh Sharma' : 'Dean / Exam Officer'}
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
                    placeholder={role === 'student' ? '1BT23BCA014' : role === 'faculty' ? 'FAC-1001' : 'ADM-01'}
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Course/Dept & Semester/Designation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  {role === 'student' ? 'Course / Degree Program' : 'Department / Branch'}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {role === 'student' ? <BookOpen className="h-5 w-5 text-slate-400" /> : <Building className="h-5 w-5 text-slate-400" />}
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.departmentCourse}
                    onChange={(e) => setFormData({ ...formData, departmentCourse: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                    placeholder={role === 'student' ? 'BCA / B.Tech Computer Science' : 'Computer Applications'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  {role === 'student' ? 'Semester Cycle' : 'Designation / Administrative Title'}
                </label>
                {role === 'student' ? (
                  <select
                    value={formData.levelDesignation}
                    onChange={(e) => setFormData({ ...formData, levelDesignation: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={`Semester ${s} (${s % 2 !== 0 ? 'Odd Sem' : 'Even Sem'})`}>
                        Semester {s} ({s % 2 !== 0 ? 'Odd Semester' : 'Even Semester'})
                      </option>
                    ))}
                  </select>
                ) : role === 'faculty' ? (
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
                    <option value="Exam Cell Coordinator">Exam Cell Coordinator</option>
                    <option value="System Administrator">System Administrator</option>
                    <option value="Academic Registrar">Academic Registrar</option>
                  </select>
                )}
              </div>
            </div>

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
                  placeholder={role === 'student' ? 'aarav101' : role === 'faculty' ? 'prof.sharma' : 'admin_exam'}
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
