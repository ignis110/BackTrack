import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, User, Hash, BookOpen } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    // Simulate registration
    alert("Registration simulated! Redirecting to login...");
    navigate('/login?role=student');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex justify-center items-center gap-2 mb-6 text-slate-500 hover:text-indigo-600 transition">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <div className="flex justify-center">
          <div className="bg-slate-900 p-3 rounded-2xl shadow-lg">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Student Registration
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Create an account to manage your academic progress
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          <form className="space-y-5" onSubmit={handleRegister}>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="text" required className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50" placeholder="John Doe" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700">Enrollment Number</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="text" required className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50" placeholder="23BCA101" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700">Course</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="text" required className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50" placeholder="BCA" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700">Semester Cycle</label>
                <select className="mt-1 block w-full pl-3 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50">
                  {[1,2,3,4,5,6,7,8].map(s => (
                    <option key={s} value={s}>
                      Semester {s} ({s % 2 !== 0 ? 'Odd Sem' : 'Even Sem'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100"></div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Choose Username</label>
              <input type="text" required className="mt-1 block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50" placeholder="johndoe123" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Choose Password</label>
              <input type="password" required className="mt-1 block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50" placeholder="••••••••" />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors"
              >
                Register Account
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login?role=student" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
