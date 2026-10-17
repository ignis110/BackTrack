import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Lock, UserCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import {
  authenticateStudent,
  authenticateFaculty,
  authenticateAdmin
} from '../utils/backlogStore';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    const cleanPass = password.trim();

    if (!cleanInput) {
      setErrorMessage(
        `Please enter your ${
          role === 'student'
            ? 'student USN or username'
            : role === 'faculty'
            ? 'faculty Employee ID or username'
            : 'administrator username'
        }.`
      );
      return;
    }
    if (!cleanPass) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (role === 'admin') {
      const res = authenticateAdmin(cleanInput, cleanPass);
      if (!res.success) {
        setErrorMessage(res.error);
        return;
      }
      localStorage.setItem('currentUser', JSON.stringify(res.session));
      navigate('/admin');
      return;
    }

    if (role === 'faculty') {
      const res = authenticateFaculty(cleanInput, cleanPass);
      if (!res.success) {
        setErrorMessage(res.error);
        return;
      }
      localStorage.setItem('currentUser', JSON.stringify(res.session));
      navigate('/faculty');
      return;
    }

    if (role === 'student') {
      const res = authenticateStudent(cleanInput, cleanPass);
      if (!res.success) {
        setErrorMessage(res.error);
        return;
      }
      localStorage.setItem('currentUser', JSON.stringify(res.session));
      navigate('/student');
      return;
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f9fd] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#90e0ef] rounded-full mix-blend-multiply filter blur-3xl opacity-35"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#caf0f8] rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
      <div className="absolute top-[40%] right-[10%] w-80 h-80 bg-[#00b4d8]/15 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex justify-center items-center gap-2 mb-6 text-slate-500 hover:text-[#0077b6] transition">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <div className="flex justify-center">
          <div className="bg-[#0077b6] p-3 rounded-2xl shadow-xl shadow-[#0077b6]/30">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#03045e] tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sign in to your BackTrack account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl shadow-[#03045e]/5 sm:rounded-3xl sm:px-10 border border-[#caf0f8]">
          
          {/* Role selector */}
          <div className="flex p-1 bg-[#caf0f8]/50 rounded-2xl mb-6">
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
                {r}
              </button>
            ))}
          </div>


          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {role === 'student' ? 'Student USN / Username' : role === 'faculty' ? 'Faculty Employee ID / Username' : 'Administrator Username'}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCircle className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setErrorMessage(''); }}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-[#0077b6] focus:border-[#0077b6] bg-slate-50 transition"
                  placeholder={
                    role === 'admin'
                      ? 'Enter admin username (e.g. admin)'
                      : role === 'student'
                      ? 'Enter your USN or username (e.g. 24215107 or anirudh)'
                      : 'Enter Employee ID or username (e.g. rsharma or FAC-101)'
                  }
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-[#0077b6] hover:text-[#03045e] font-medium flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMessage(''); }}
                  className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-[#0077b6] focus:border-[#0077b6] bg-slate-50 transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500 font-medium">
                {role === 'faculty' && (
                  <span>
                    Faculty Password: <strong className="text-[#0077b6] font-mono">faculty101</strong> or <strong className="text-[#0077b6] font-mono">faculty123</strong>
                  </span>
                )}
                {role === 'student' && (
                  <span>
                    Student Password: <strong className="text-[#0077b6] font-mono">student123</strong>
                  </span>
                )}
                {role === 'admin' && (
                  <span>
                    Admin Credentials: Username <strong className="text-[#0077b6] font-mono">admin</strong> & Password <strong className="text-[#0077b6] font-mono">admin123</strong>
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-[#0077b6] focus:ring-[#0077b6] border-gray-300 rounded" />
                <label className="ml-2 block text-sm text-slate-600">Remember me</label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-[#0077b6] hover:text-[#03045e]">Forgot password?</a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md shadow-[#0077b6]/25 text-sm font-semibold text-white bg-[#0077b6] hover:bg-[#03045e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0077b6] transition-all cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            {role === 'student' && (
              <>
                New student?{' '}
                <Link to="/register?role=student" className="font-semibold text-[#0077b6] hover:text-[#03045e]">
                  Create an account
                </Link>
              </>
            )}
            {role === 'faculty' && (
              <>
                New faculty member?{' '}
                <Link to="/register?role=faculty" className="font-semibold text-[#0077b6] hover:text-[#03045e]">
                  Create an account
                </Link>
              </>
            )}
            {role === 'admin' && (
              <>
                New administrator?{' '}
                <Link to="/register?role=admin" className="font-semibold text-[#0077b6] hover:text-[#03045e]">
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
