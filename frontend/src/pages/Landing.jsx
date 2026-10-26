import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Clock,
  BookOpen,
  UserCheck,
  Award,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Users,
  LayoutDashboard,
  FileCheck,
  Activity,
  Layers
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#f4f9fd] font-sans text-[#03045e] selection:bg-[#90e0ef] selection:text-[#03045e] overflow-x-hidden">
      {/* Dynamic Frosted Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#caf0f8] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-[#03045e] text-white flex items-center justify-center font-black text-xl shadow-md shadow-[#03045e]/20 group-hover:scale-105 transition-transform">
              BT
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-[#03045e]">BackTrack</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#00b4d8] animate-pulse"></span>
              </div>
              <p className="text-[11px] font-semibold text-[#0077b6] tracking-wide">University Academic & Backlog Ops</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-xs font-bold text-[#03045e]">
            <a href="#portals" className="hover:text-[#0077b6] transition-colors">Portals</a>
            <a href="#funnel" className="hover:text-[#0077b6] transition-colors">Clearance Workflow</a>
            <a href="#features" className="hover:text-[#0077b6] transition-colors">Capabilities</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-bold text-[#0077b6] hover:text-[#03045e] px-4 py-2.5 rounded-xl transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white text-xs font-bold hover:shadow-lg hover:shadow-[#0077b6]/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>Get Started</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Vibrant Gradient Orbs */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        {/* Soft Decorative Palette Blobs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#90e0ef]/30 via-[#caf0f8]/50 to-[#00b4d8]/20 blur-3xl rounded-full pointer-events-none -z-0" />
        <div className="absolute top-40 right-[-100px] w-96 h-96 bg-[#caf0f8]/60 blur-3xl rounded-full pointer-events-none -z-0" />
        <div className="absolute bottom-10 left-[-100px] w-96 h-96 bg-[#90e0ef]/30 blur-3xl rounded-full pointer-events-none -z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#caf0f8] text-[#0077b6] border border-[#90e0ef] text-xs font-extrabold tracking-wide mb-8 shadow-xs">
            <Sparkles size={14} className="text-[#00b4d8]" />
            <span>Autonomous Academic Progression & Backlog Resolution</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#03045e] tracking-tight leading-[1.1] max-w-5xl mx-auto mb-6">
            Academic Progress & Backlog Clearance,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0077b6] via-[#00b4d8] to-[#03045e]">
              Simplified.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            The unified university ecosystem uniting students, faculty advisors, and the examination controller cell to monitor standing, track repeat exams, and certify clearances in real time.
          </p>

          {/* Role Access Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto mb-16">
            <Link
              to="/login?role=student"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#0077b6] text-white font-bold text-sm hover:bg-[#03045e] transition shadow-lg shadow-[#0077b6]/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <GraduationCap size={18} />
              <span>Student Portal</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/login?role=faculty"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white text-[#03045e] font-bold text-sm border-2 border-[#90e0ef] hover:border-[#0077b6] hover:bg-[#caf0f8]/30 transition shadow-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <UserCheck size={18} className="text-[#0077b6]" />
              <span>Faculty Desk</span>
            </Link>

            <Link
              to="/login?role=admin"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#03045e] text-white font-bold text-sm hover:bg-[#0077b6] transition shadow-lg shadow-[#03045e]/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <ShieldCheck size={18} className="text-[#00b4d8]" />
              <span>Admin Access</span>
            </Link>
          </div>

          {/* Live Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="p-5 rounded-3xl bg-white border border-[#caf0f8] shadow-xs text-center">
              <div className="text-3xl font-black text-[#03045e] tracking-tight">99.4%</div>
              <div className="text-xs font-bold text-[#0077b6] uppercase tracking-wide mt-1">Resolution Rate</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Automated clearance pipelines</p>
            </div>
            <div className="p-5 rounded-3xl bg-white border border-[#caf0f8] shadow-xs text-center">
              <div className="text-3xl font-black text-[#0077b6] tracking-tight">14+</div>
              <div className="text-xs font-bold text-[#0077b6] uppercase tracking-wide mt-1">Academic Programs</div>
              <p className="text-[11px] text-slate-500 mt-0.5">BCA & degree curricula pre-mapped</p>
            </div>
            <div className="p-5 rounded-3xl bg-white border border-[#caf0f8] shadow-xs text-center">
              <div className="text-3xl font-black text-[#00b4d8] tracking-tight">100%</div>
              <div className="text-xs font-bold text-[#0077b6] uppercase tracking-wide mt-1">Digital Certificates</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Official NAAC-compliant verify</p>
            </div>
            <div className="p-5 rounded-3xl bg-white border border-[#caf0f8] shadow-xs text-center">
              <div className="text-3xl font-black text-[#03045e] tracking-tight">0 min</div>
              <div className="text-xs font-bold text-[#0077b6] uppercase tracking-wide mt-1">Paperwork Lag</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Direct sync between cabin & student</p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Portals Showcase */}
      <section id="portals" className="py-20 bg-white border-y border-[#caf0f8] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#caf0f8] text-[#0077b6] text-xs font-extrabold mb-3">
              <Users size={14} /> Unified Academic Synergy
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#03045e] tracking-tight">
              Tailored Portals for Every Stakeholder
            </h2>
            <p className="text-sm text-slate-600 mt-2 font-medium">
              Every persona in your university has dedicated tools built for precision and clarity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Student Card */}
            <div className="bg-gradient-to-b from-[#f4f9fd] to-white p-8 rounded-3xl border border-[#caf0f8] shadow-xs hover:shadow-xl hover:border-[#90e0ef] transition-all flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#0077b6] text-white flex items-center justify-center font-bold text-xl mb-6 shadow-md shadow-[#0077b6]/25 group-hover:scale-110 transition-transform">
                  <GraduationCap size={28} />
                </div>
                <h3 className="text-xl font-black text-[#03045e] tracking-tight mb-2">Student Portal</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Select your semester courses, dynamically calculate SGPA/CGPA, log backlog reasons (attendance, marks, medical), and track repeat exam clearance.
                </p>
                <ul className="space-y-2.5 text-xs text-[#03045e] font-semibold mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#00b4d8] shrink-0" />
                    Semester 1–8 BCA Curriculum Selector
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#00b4d8] shrink-0" />
                    Live Dynamic CGPA Calculation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#00b4d8] shrink-0" />
                    Instant Clearance Certificate Download
                  </li>
                </ul>
              </div>
              <Link
                to="/login?role=student"
                className="w-full py-3 rounded-xl bg-[#0077b6] text-white font-bold text-xs hover:bg-[#03045e] transition flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Access Student Portal</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Faculty Card */}
            <div className="bg-gradient-to-b from-[#f4f9fd] to-white p-8 rounded-3xl border border-[#caf0f8] shadow-xs hover:shadow-xl hover:border-[#90e0ef] transition-all flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#00b4d8] text-[#03045e] flex items-center justify-center font-bold text-xl mb-6 shadow-md shadow-[#00b4d8]/25 group-hover:scale-110 transition-transform">
                  <UserCheck size={28} />
                </div>
                <h3 className="text-xl font-black text-[#03045e] tracking-tight mb-2">Faculty Academic Desk</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Supervise student cohorts, conduct cabin consultations, verify remedial coursework, and issue certified backlog clearance endorsements.
                </p>
                <ul className="space-y-2.5 text-xs text-[#03045e] font-semibold mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#00b4d8] shrink-0" />
                    Cabin Meeting Sync & Scheduling
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#00b4d8] shrink-0" />
                    Dispatched Guidance Directives
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#00b4d8] shrink-0" />
                    Official Endorsement & Clearance Sign-off
                  </li>
                </ul>
              </div>
              <Link
                to="/login?role=faculty"
                className="w-full py-3 rounded-xl bg-[#00b4d8] text-[#03045e] font-bold text-xs hover:bg-[#0077b6] hover:text-white transition flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Access Faculty Desk</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Admin Card */}
            <div className="bg-gradient-to-b from-[#f4f9fd] to-white p-8 rounded-3xl border border-[#caf0f8] shadow-xs hover:shadow-xl hover:border-[#90e0ef] transition-all flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#03045e] text-white flex items-center justify-center font-bold text-xl mb-6 shadow-md shadow-[#03045e]/25 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-xl font-black text-[#03045e] tracking-tight mb-2">Administrator & Exam Cell</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Full institutional control over university rosters, academic curriculum mapping, faculty allocation, backlog audits, and high-level KPI oversight.
                </p>
                <ul className="space-y-2.5 text-xs text-[#03045e] font-semibold mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#00b4d8] shrink-0" />
                    User & Role Security Architecture
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#00b4d8] shrink-0" />
                    Courses & Subject Credit Mapping
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#00b4d8] shrink-0" />
                    System-Wide Funnel & Clearance Analytics
                  </li>
                </ul>
              </div>
              <Link
                to="/login?role=admin"
                className="w-full py-3 rounded-xl bg-[#03045e] text-white font-bold text-xs hover:bg-[#0077b6] transition flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Access Admin Portal</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Stage Backlog Resolution Funnel Preview */}
      <section id="funnel" className="py-20 bg-[#f4f9fd] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#caf0f8] text-[#0077b6] text-xs font-extrabold mb-3">
              <Activity size={14} /> Standardized Protocol
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#03045e] tracking-tight">
              4-Stage Backlog Resolution Pipeline
            </h2>
            <p className="text-sm text-slate-600 mt-2 font-medium">
              Eliminate confusion with a linear, transparent, and auditable path from backlogged subject to verified clearance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-[#caf0f8] shadow-xs text-center relative">
              <div className="w-10 h-10 rounded-2xl bg-[#03045e] text-white flex items-center justify-center font-bold mx-auto mb-3 text-sm">
                1
              </div>
              <h4 className="font-extrabold text-xs text-[#03045e]">Logged Backlog</h4>
              <p className="text-[11px] text-slate-500 mt-1">Student registers uncleared paper with reason.</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#caf0f8] shadow-xs text-center relative">
              <div className="w-10 h-10 rounded-2xl bg-[#0077b6] text-white flex items-center justify-center font-bold mx-auto mb-3 text-sm">
                2
              </div>
              <h4 className="font-extrabold text-xs text-[#03045e]">Faculty Cabin Sync</h4>
              <p className="text-[11px] text-slate-500 mt-1">One-on-one consultation with department professor.</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#caf0f8] shadow-xs text-center relative">
              <div className="w-10 h-10 rounded-2xl bg-[#90e0ef] text-[#03045e] flex items-center justify-center font-bold mx-auto mb-3 text-sm">
                3
              </div>
              <h4 className="font-extrabold text-xs text-[#03045e]">Repeat Examination</h4>
              <p className="text-[11px] text-slate-500 mt-1">Student appears for re-exam or re-evaluation.</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#90e0ef] bg-gradient-to-b from-[#caf0f8]/40 to-white shadow-xs text-center relative">
              <div className="w-10 h-10 rounded-2xl bg-[#0077b6] text-white flex items-center justify-center font-bold mx-auto mb-3 text-sm">
                4
              </div>
              <h4 className="font-extrabold text-xs text-[#0077b6]">Certified Cleared</h4>
              <p className="text-[11px] text-slate-500 mt-1">Official NAAC-compliant certificate generated.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="features" className="py-20 bg-white border-t border-[#caf0f8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#caf0f8] text-[#0077b6] text-xs font-extrabold mb-3">
              <Sparkles size={14} /> Enterprise Academic Standard
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#03045e] tracking-tight">
              Built for Modern University Governance
            </h2>
            <p className="text-sm text-slate-600 mt-2 font-medium">
              Engineered with rock-solid security, instant client-side sync, and responsive mobile architecture.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-7 rounded-3xl bg-[#f4f9fd] border border-[#caf0f8] shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#caf0f8] text-[#0077b6] flex items-center justify-center font-bold mb-4 shadow-xs">
                <Clock size={22} />
              </div>
              <h3 className="font-extrabold text-base text-[#03045e] mb-2">Real-Time Event Bus Sync</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Changes made by faculty advisors immediately update student transcripts without needing manual page refreshes or external API polling.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#f4f9fd] border border-[#caf0f8] shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#caf0f8] text-[#0077b6] flex items-center justify-center font-bold mb-4 shadow-xs">
                <ShieldCheck size={22} />
              </div>
              <h3 className="font-extrabold text-base text-[#03045e] mb-2">Role Protection & Integrity</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Rigorous route guarding prevents unauthorized access to examination cell and administrator modules with role-based access control.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#f4f9fd] border border-[#caf0f8] shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#caf0f8] text-[#0077b6] flex items-center justify-center font-bold mb-4 shadow-xs">
                <Award size={22} />
              </div>
              <h3 className="font-extrabold text-base text-[#03045e] mb-2">Printable Verification Badges</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Each cleared paper produces a printable official transcript with unique institutional verification serial numbers and security seals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sleek Deep Navy Footer */}
      <footer className="bg-[#03045e] text-white py-14 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-10 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white text-[#03045e] flex items-center justify-center font-black text-lg shadow-sm">
                BT
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white">BackTrack</span>
                <p className="text-[11px] text-[#90e0ef]/70 font-medium">Central University Academic & Backlog Management</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-[#90e0ef]">
              <Link to="/login?role=student" className="hover:text-white transition">Student Portal</Link>
              <Link to="/login?role=faculty" className="hover:text-white transition">Faculty Desk</Link>
              <Link to="/login?role=admin" className="hover:text-white transition">Admin Portal</Link>
              <Link to="/register" className="hover:text-white transition">New Registration</Link>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2026 BackTrack Academic Systems. All institutional rights reserved.</p>
            <div className="flex items-center gap-2 text-[#00b4d8] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              All University Portals Operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
