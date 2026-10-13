import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Lock, UserCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { getAdminCredentials, DEFAULT_ADMIN_CREDENTIALS, isStudentIdentifier } from '../utils/backlogStore';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Extract role from URL query param if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam && ['student', 'faculty', 'admin'].includes(roleParam)) {
      setRole(roleParam);
      setErrorMessage('');
    }
  }, [location]);

  const handleRoleChange = (r) => {
    setRole(r);
    setErrorMessage('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanInput = username.trim();
    if (!cleanInput) {
      setErrorMessage('Please enter your username.');
      return;
    }

    const inputUser = cleanInput.toLowerCase();
    const inputPass = password.trim();

    // STRICT ROLE CONTROL 1: STUDENT ID CANNOT ACCESS ADMIN PANEL
    if (role === 'admin') {
      if (isStudentIdentifier(cleanInput)) {
        setErrorMessage('Access Denied: Student account detected. Student IDs cannot access the Administrator panel. Please switch to the Student login portal.');
        return;
      }

      const adminCreds = getAdminCredentials();

      const isUserMatch =
        inputUser === (adminCreds.username || 'admin').toLowerCase() ||
        inputUser === 'admin' ||
        inputUser === (adminCreds.email || '').toLowerCase() ||
        inputUser === (adminCreds.id || '').toLowerCase();

      const isPassMatch = inputPass === (adminCreds.password || 'admin123');

      // Also check against users table if any Admin was registered
      let matchedAdminInStore = null;
      try {
        const allUsers = JSON.parse(localStorage.getItem('backtrack_users') || '[]');
        matchedAdminInStore = allUsers.find(
          (u) =>
            (u.role?.toLowerCase() === 'admin' || u.role?.toLowerCase() === 'administrator') &&
            (u.username?.toLowerCase() === inputUser ||
              u.email?.toLowerCase() === inputUser ||
              u.id?.toLowerCase() === inputUser) &&
            (!u.password || u.password === inputPass)
        );
      } catch {}

      if ((!isUserMatch || !isPassMatch) && !matchedAdminInStore) {
        setErrorMessage('Access Denied: Invalid administrator credentials. Only authorized university administrators may sign in.');
        return;
      }

      // Valid admin login!
      const adminSession = {
        username: matchedAdminInStore?.username || adminCreds.username || 'admin',
        name: matchedAdminInStore?.name || adminCreds.name || 'Exam Controller',
        id: matchedAdminInStore?.id || adminCreds.id || 'ADM-001',
        role: 'admin',
        email: matchedAdminInStore?.email || adminCreds.email || 'admin@univ.edu',
        department: matchedAdminInStore?.department || adminCreds.department || 'Office of Academic Affairs & Examination Cell',
        designation: adminCreds.designation || 'Chief Academic Controller & Administrator',
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      localStorage.setItem('currentUser', JSON.stringify(adminSession));
      navigate('/admin');
      return;
    }

    // STRICT ROLE CONTROL 2: STUDENT ID CANNOT ACCESS FACULTY PANEL
    if (role === 'faculty') {
      if (isStudentIdentifier(cleanInput)) {
        setErrorMessage('Access Denied: Student account detected. Student IDs cannot access the Faculty panel. Please switch to the Student login portal.');
        return;
      }

      if (inputUser === 'admin' || inputUser === 'adm-001') {
        setErrorMessage('Administrator credentials cannot be used to log into the Faculty portal.');
        return;
      }

      // Check registered users table: if user exists and has role 'student', block access
      try {
        const allUsers = JSON.parse(localStorage.getItem('backtrack_users') || '[]');
        const matched = allUsers.find(
          (u) =>
            u.username?.toLowerCase() === inputUser ||
            u.email?.toLowerCase() === inputUser ||
            u.id?.toLowerCase() === inputUser
        );
        if (matched && matched.role?.toLowerCase() === 'student') {
          setErrorMessage('Access Denied: Student account detected. Student IDs cannot access the Faculty panel.');
          return;
        }
      } catch {}
    }

    // STRICT ROLE CONTROL 3: ADMIN CANNOT LOG IN AS STUDENT
    if (role === 'student') {
      if (inputUser === 'admin' || inputUser === 'adm-001') {
        setErrorMessage('Administrator credentials cannot be used to log into the Student portal. Please switch to Admin login.');
        return;
      }
    }

    // Check if user exists in registered users or students/teachers store
    let matchedUser = null;
    try {
      const allUsers = JSON.parse(localStorage.getItem('backtrack_users') || '[]');
      matchedUser = allUsers.find(
        (u) =>
          u.username?.toLowerCase() === inputUser ||
          u.email?.toLowerCase() === inputUser ||
          u.id?.toLowerCase() === inputUser
      );
    } catch {}

    let matchedRoleRecord = null;
    if (role === 'student') {
      try {
        const students = JSON.parse(localStorage.getItem('backtrack_students') || '[]');
        matchedRoleRecord = students.find(
          (s) =>
            s.usn?.toLowerCase() === inputUser ||
            s.name?.toLowerCase() === inputUser ||
            s.email?.toLowerCase() === inputUser
        );
      } catch {}
    } else if (role === 'faculty') {
      try {
        const teachers = JSON.parse(localStorage.getItem('backtrack_teachers') || '[]');
        matchedRoleRecord = teachers.find(
          (t) =>
            t.empId?.toLowerCase() === inputUser ||
            t.name?.toLowerCase() === inputUser ||
            t.email?.toLowerCase() === inputUser
        );
      } catch {}
    }

    const displayName = matchedRoleRecord?.name || matchedUser?.name || cleanInput.charAt(0).toUpperCase() + cleanInput.slice(1);
    const displayId = matchedRoleRecord?.usn || matchedRoleRecord?.empId || matchedRoleRecord?.id || matchedUser?.id || cleanInput.toUpperCase();
    const cleanEmail = matchedRoleRecord?.email || matchedUser?.email || (cleanInput.includes('@') ? cleanInput.toLowerCase() : `${cleanInput.toLowerCase()}@${role === 'student' ? 'student.' : ''}univ.edu`);

    const userSession = {
      username: cleanInput,
      name: displayName,
      id: displayId,
      usn: displayId,
      empId: displayId,
      role: role,
      email: cleanEmail,
      course: matchedRoleRecord?.course,
      semester: matchedRoleRecord?.semester,
      department: matchedRoleRecord?.department,
      designation: matchedRoleRecord?.designation,
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    localStorage.setItem('currentUser', JSON.stringify(userSession));

    if (role === 'student') navigate('/student');
    else if (role === 'faculty') navigate('/faculty');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex justify-center items-center gap-2 mb-6 text-slate-500 hover:text-indigo-600 transition">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <div className="flex justify-center">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sign in to your BackTrack account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          
          {/* Role selector */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            {['student', 'faculty', 'admin'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleChange(r)}
                className={`flex-1 py-2 text-sm font-semibold capitalize rounded-lg transition-all ${
                  role === r 
                  ? 'bg-white text-indigo-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Dedicated Demo Admin Credentials Card */}
          {role === 'admin' && (
            <div className="mb-6 p-4 rounded-2xl bg-[#13141b] text-white border border-slate-700/60 shadow-lg animate-in fade-in">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#f5caa0]" />
                  <div>
                    <span className="text-xs font-bold text-white block">Official University Administrator Access</span>
                    <span className="text-[10px] text-slate-400">Office of Academic Affairs & Examination Cell</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const creds = getAdminCredentials();
                    setUsername(creds.username || 'admin');
                    setPassword(creds.password || 'admin123');
                    setErrorMessage('');
                  }}
                  className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-[#f5caa0] hover:text-white font-bold text-[11px] transition cursor-pointer border border-white/10"
                  title="Click to auto-fill official admin credentials"
                >
                  Auto-Fill
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-white/5 p-2 rounded-xl">
                  <span className="text-slate-400 block text-[9px] uppercase font-sans">Admin Username</span>
                  <span className="text-emerald-400 font-bold">{getAdminCredentials().username || 'admin'}</span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl">
                  <span className="text-slate-400 block text-[9px] uppercase font-sans">Admin Password</span>
                  <span className="text-emerald-400 font-bold">{getAdminCredentials().password || 'admin123'}</span>
                </div>
              </div>
              <p className="text-[10px] text-amber-300/90 font-medium mt-2.5 flex items-center gap-1.5 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                <AlertCircle size={13} className="shrink-0 text-amber-400" />
                <span>Strict Security: Student IDs and Student profiles are strictly forbidden from this portal.</span>
              </p>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-slate-700">Username</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCircle className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setErrorMessage(''); }}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 transition"
                  placeholder={role === 'admin' ? 'Enter admin username (e.g. admin)' : `Enter your ${role} username`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                <label className="ml-2 block text-sm text-slate-600">Remember me</label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">Forgot password?</a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Sign In
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            {role === 'student' && (
              <>
                New student?{' '}
                <Link to="/register?role=student" className="font-semibold text-indigo-600 hover:text-indigo-500">
                  Create an account
                </Link>
              </>
            )}
            {role === 'faculty' && (
              <>
                New faculty member?{' '}
                <Link to="/register?role=faculty" className="font-semibold text-indigo-600 hover:text-indigo-500">
                  Create an account
                </Link>
              </>
            )}
            {role === 'admin' && (
              <>
                New administrator?{' '}
                <Link to="/register?role=admin" className="font-semibold text-indigo-600 hover:text-indigo-500">
                  Create an account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
