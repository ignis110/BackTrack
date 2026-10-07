import { GraduationCap, ArrowRight, ShieldCheck, Clock, BookOpen, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold text-slate-800 tracking-tight">BackTrack</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-slate-600 hover:text-indigo-600 font-medium transition">Sign In</Link>
            <Link to="/register" className="bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 transition shadow-sm">
              Student Registration
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-slate-50 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Academic Progress <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Simplified.</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            The all-in-one university portal for students, faculty, and administration to seamlessly manage, track, and clear academic backlogs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/login?role=student" className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 hover:shadow-lg transition-all">
              Student Portal <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/login?role=faculty" className="flex items-center justify-center gap-2 bg-white text-indigo-600 border border-indigo-200 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-50 transition-all">
              Faculty Login
            </Link>
            <Link to="/login?role=admin" className="flex items-center justify-center gap-2 bg-slate-800 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-900 transition-all">
              Admin Access
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Why choose BackTrack?</h2>
            <p className="mt-4 text-lg text-slate-600">A unified workflow that brings transparency to your academic journey.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Clock className="h-8 w-8 text-blue-500" />}
              title="Real-Time Tracking"
              desc="Monitor your backlog applications from submission to result declaration in real-time."
            />
            <FeatureCard 
              icon={<ShieldCheck className="h-8 w-8 text-green-500" />}
              title="Automated Workflows"
              desc="No more lost paperwork. Everything is verified and processed digitally."
            />
            <FeatureCard 
              icon={<BookOpen className="h-8 w-8 text-purple-500" />}
              title="Subject Management"
              desc="Faculty can easily track enrolled students and manage subject assignments."
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
          <GraduationCap className="h-6 w-6" />
          <span className="text-xl font-bold text-white tracking-tight">BackTrack</span>
        </div>
        <p>© 2026 University Portal System. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="bg-slate-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}
