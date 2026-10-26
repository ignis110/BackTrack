import React, { useState } from 'react';
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
  Activity,
  Layers,
  FileText,
  Calendar,
  Bell,
  Shield,
  Rocket,
  HelpCircle,
  Download,
  AlertTriangle,
  QrCode,
  Check
} from 'lucide-react';

export default function Landing() {
  const [activeGuideTab, setActiveGuideTab] = useState('student');

  return (
    <div className="min-h-screen bg-[#f4f9fd] font-sans text-[#03045e] selection:bg-[#90e0ef] selection:text-[#03045e] overflow-x-hidden">
      {/* Dynamic Frosted Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-[#caf0f8] shadow-xs">
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

          <div className="hidden lg:flex items-center gap-7 text-xs font-bold text-[#03045e]">
            <a href="#about" className="hover:text-[#0077b6] transition-colors">About Us</a>
            <a href="#portals" className="hover:text-[#0077b6] transition-colors">Portals</a>
            <a href="#features-deepdive" className="hover:text-[#0077b6] transition-colors">Features & Export</a>
            <a href="#guide" className="hover:text-[#0077b6] transition-colors">Beginner’s Guide</a>
            <a href="#funnel" className="hover:text-[#0077b6] transition-colors">Workflow</a>
            <a href="#benefits" className="hover:text-[#0077b6] transition-colors">Benefits</a>
            <a href="#roadmap" className="hover:text-[#0077b6] transition-colors flex items-center gap-1">
              <span>Roadmap</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-100 text-emerald-800 font-extrabold">New</span>
            </a>
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
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#90e0ef]/30 via-[#caf0f8]/50 to-[#00b4d8]/20 blur-3xl rounded-full pointer-events-none -z-0" />
        <div className="absolute top-40 right-[-100px] w-96 h-96 bg-[#caf0f8]/60 blur-3xl rounded-full pointer-events-none -z-0" />
        <div className="absolute bottom-10 left-[-100px] w-96 h-96 bg-[#90e0ef]/30 blur-3xl rounded-full pointer-events-none -z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#caf0f8] text-[#0077b6] border border-[#90e0ef] text-xs font-extrabold tracking-wide mb-8 shadow-xs">
            <Sparkles size={14} className="text-[#00b4d8]" />
            <span>Autonomous Academic Progression & Backlog Resolution</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#03045e] tracking-tight leading-[1.1] max-w-5xl mx-auto mb-6">
            Academic Progress & Backlog Clearance,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0077b6] via-[#00b4d8] to-[#03045e]">
              Simplified.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            The unified university ecosystem uniting students, faculty advisors, and the examination controller cell to monitor standing, track repeat exams, export official academic dossiers, and certify clearances in real time.
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
              <div className="text-xs font-bold text-[#0077b6] uppercase tracking-wide mt-1">Digital Documents</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Printable dossiers & certificates</p>
            </div>
            <div className="p-5 rounded-3xl bg-white border border-[#caf0f8] shadow-xs text-center">
              <div className="text-3xl font-black text-[#03045e] tracking-tight">0 min</div>
              <div className="text-xs font-bold text-[#0077b6] uppercase tracking-wide mt-1">Paperwork Lag</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Direct sync between cabin & student</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: ABOUT US & INSTITUTIONAL MISSION */}
      <section id="about" className="py-20 bg-white border-y border-[#caf0f8] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#caf0f8] text-[#0077b6] text-xs font-extrabold mb-3">
              <Shield size={14} /> Institutional Transparency & Governance
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#03045e] tracking-tight">
              About BackTrack University Systems
            </h2>
            <p className="text-sm text-slate-600 mt-2 font-medium leading-relaxed">
              BackTrack was engineered to resolve the single greatest source of academic delays in universities: the opacity, paperwork friction, and disconnect between student backlog standing, faculty cabin hours, and examination cell audits.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-7 rounded-3xl bg-[#f4f9fd] border border-[#caf0f8] shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#caf0f8] text-[#0077b6] flex items-center justify-center font-bold">
                <GraduationCap size={24} />
              </div>
              <h3 className="font-extrabold text-base text-[#03045e]">Student-Centric Empowerment</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Students never have to guess their backlog status or miss examination re-registration deadlines. From dynamic SGPA/CGPA calculations to in-person teacher booking, candidates take full ownership of their academic progress.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#f4f9fd] border border-[#caf0f8] shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#caf0f8] text-[#0077b6] flex items-center justify-center font-bold">
                <UserCheck size={24} />
              </div>
              <h3 className="font-extrabold text-base text-[#03045e]">Cabin Sync & Advisory Speed</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Faculty advisors gain real-time visibility into their assigned cohorts. They can issue syllabus directives, set cabin meeting deadlines, and confirm clearance eligibility without repetitive paper slips.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#f4f9fd] border border-[#caf0f8] shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#caf0f8] text-[#0077b6] flex items-center justify-center font-bold">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-extrabold text-base text-[#03045e]">NAAC & University Compliance</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Every clearance endorsement produces an auditable verification trail with tamper-proof certificate identifiers and institutional security seals, meeting stringent UGC and NAAC Grade A++ accreditation norms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: TAILORED ROLE PORTALS */}
      <section id="portals" className="py-20 bg-[#f4f9fd] relative">
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
            <div className="bg-white p-8 rounded-3xl border border-[#caf0f8] shadow-xs hover:shadow-xl hover:border-[#90e0ef] transition-all flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#0077b6] text-white flex items-center justify-center font-bold text-xl mb-6 shadow-md shadow-[#0077b6]/25 group-hover:scale-110 transition-transform">
                  <GraduationCap size={28} />
                </div>
                <h3 className="text-xl font-black text-[#03045e] tracking-tight mb-2">Student Portal</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Select your semester courses, dynamically calculate SGPA/CGPA, export your official academic profile dossier, log backlog repeat papers, and track clearances.
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
                    1-Click Student Profile Document Export
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#00b4d8] shrink-0" />
                    Official Clearance Certificate Download
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
            <div className="bg-white p-8 rounded-3xl border border-[#caf0f8] shadow-xs hover:shadow-xl hover:border-[#90e0ef] transition-all flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#00b4d8] text-[#03045e] flex items-center justify-center font-bold text-xl mb-6 shadow-md shadow-[#00b4d8]/25 group-hover:scale-110 transition-transform">
                  <UserCheck size={28} />
                </div>
                <h3 className="text-xl font-black text-[#03045e] tracking-tight mb-2">Faculty Academic Desk</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Supervise student cohorts, schedule cabin consultations, set mandatory meeting deadlines with alerts, and issue certified backlog clearance endorsements.
                </p>
                <ul className="space-y-2.5 text-xs text-[#03045e] font-semibold mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#00b4d8] shrink-0" />
                    Cabin Meeting Sync & Scheduling
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#00b4d8] shrink-0" />
                    Mandatory Cabin Deadline Alerts
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
            <div className="bg-white p-8 rounded-3xl border border-[#caf0f8] shadow-xs hover:shadow-xl hover:border-[#90e0ef] transition-all flex flex-col justify-between group">
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
                    Expandable Student Performance Audit
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#00b4d8] shrink-0" />
                    Institutional Backlog Progression Analytics
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

      {/* SECTION 3: KEY PORTAL FEATURES & DOCUMENT EXPORT DEEP-DIVE */}
      <section id="features-deepdive" className="py-20 bg-white border-b border-[#caf0f8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#caf0f8] text-[#0077b6] text-xs font-extrabold mb-3">
              <FileText size={14} /> Built-in Platform Capabilities
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#03045e] tracking-tight">
              Powerful Features Featured Across the Platform
            </h2>
            <p className="text-sm text-slate-600 mt-2 font-medium">
              Everything available inside each portal—from official profile exports to live teacher meeting sync—now highlighted upfront.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-[#f4f9fd] border border-[#caf0f8] shadow-xs space-y-3 hover:border-[#90e0ef] transition">
              <div className="w-12 h-12 rounded-2xl bg-[#0077b6] text-white flex items-center justify-center font-bold">
                <FileText size={22} />
              </div>
              <h3 className="font-extrabold text-base text-[#03045e]">Student Profile Document Export</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Generate and print or save complete student academic dossiers in official document/PDF format—complete with USN, marks transcript, CGPA standing, and institutional attestation seals.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-[#f4f9fd] border border-[#caf0f8] shadow-xs space-y-3 hover:border-[#90e0ef] transition">
              <div className="w-12 h-12 rounded-2xl bg-[#00b4d8] text-[#03045e] flex items-center justify-center font-bold">
                <Calendar size={22} />
              </div>
              <h3 className="font-extrabold text-base text-[#03045e]">Up-to-Date Cabin Meetings</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Keep a live, up-to-date check on scheduled teacher consultations. Students book 1-on-1 slots, and teachers provide cabin guidance notes and location guidance directly to the dashboard.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-[#f4f9fd] border border-[#caf0f8] shadow-xs space-y-3 hover:border-[#90e0ef] transition">
              <div className="w-12 h-12 rounded-2xl bg-[#03045e] text-white flex items-center justify-center font-bold">
                <Bell size={22} />
              </div>
              <h3 className="font-extrabold text-base text-[#03045e]">Live Notification Alerts</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Mandatory faculty consultation alerts, meeting deadline countdowns, grade updates, and university examination cell broadcasts are instantly pushed across dashboards.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-3xl bg-[#f4f9fd] border border-[#caf0f8] shadow-xs space-y-3 hover:border-[#90e0ef] transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Award size={22} />
              </div>
              <h3 className="font-extrabold text-base text-[#03045e]">Official Verified Certificates</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Every cleared backlog course generates a high-resolution, printable certificate signed by subject faculty and the Controller of Examinations, verified with unique security hashes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: BEGINNER'S PORTAL NAVIGATION GUIDE */}
      <section id="guide" className="py-20 bg-[#f4f9fd] border-b border-[#caf0f8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#caf0f8] text-[#0077b6] text-xs font-extrabold mb-3">
              <HelpCircle size={14} /> Onboarding & Portal Walkthrough
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#03045e] tracking-tight">
              How to Navigate the Portal as a Beginner
            </h2>
            <p className="text-sm text-slate-600 mt-2 font-medium">
              New to BackTrack? Follow this step-by-step navigation path designed for first-time students, teachers, and administrators.
            </p>

            {/* Role Guide Switcher */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setActiveGuideTab('student')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeGuideTab === 'student'
                    ? 'bg-[#0077b6] text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-[#caf0f8]'
                }`}
              >
                For Students
              </button>
              <button
                onClick={() => setActiveGuideTab('faculty')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeGuideTab === 'faculty'
                    ? 'bg-[#0077b6] text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-[#caf0f8]'
                }`}
              >
                For Faculty
              </button>
              <button
                onClick={() => setActiveGuideTab('admin')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeGuideTab === 'admin'
                    ? 'bg-[#0077b6] text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-[#caf0f8]'
                }`}
              >
                For Admins
              </button>
            </div>
          </div>

          {activeGuideTab === 'student' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-3xl border border-[#caf0f8] shadow-xs space-y-2">
                <span className="w-8 h-8 rounded-xl bg-[#03045e] text-white flex items-center justify-center font-black text-xs">1</span>
                <h4 className="font-extrabold text-sm text-[#03045e]">Select Semester & Courses</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Log in to the Student Hub. Choose your semester (Sem 1 to 8) to auto-load your BCA syllabus courses and enter continuous evaluation scores.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#caf0f8] shadow-xs space-y-2">
                <span className="w-8 h-8 rounded-xl bg-[#0077b6] text-white flex items-center justify-center font-black text-xs">2</span>
                <h4 className="font-extrabold text-sm text-[#03045e]">Monitor Backlogs & Alerts</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Switch to the "Backlog Tracking" tab. Review any uncleared papers, check active meeting deadlines, or register additional repeat subjects.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#caf0f8] shadow-xs space-y-2">
                <span className="w-8 h-8 rounded-xl bg-[#00b4d8] text-[#03045e] flex items-center justify-center font-black text-xs">3</span>
                <h4 className="font-extrabold text-sm text-[#03045e]">Schedule Teacher Cabin Meet</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Click "Request Teacher Meet". Select your subject, consultation type, and proposed date. Receive cabin location details and advisory notes.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#caf0f8] shadow-xs space-y-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs">4</span>
                <h4 className="font-extrabold text-sm text-[#03045e]">Submit Progress & Get Certified</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Use "Update Progress Report" to log consultation outcomes. Once faculty confirms clearance, download your official verified certificate.
                </p>
              </div>
            </div>
          )}

          {activeGuideTab === 'faculty' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-3xl border border-[#caf0f8] shadow-xs space-y-2">
                <span className="w-8 h-8 rounded-xl bg-[#03045e] text-white flex items-center justify-center font-black text-xs">1</span>
                <h4 className="font-extrabold text-sm text-[#03045e]">Access Assigned Cohort</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Log in to the Faculty Desk. Filter students by section, semester, or backlog severity to identify students needing guidance.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#caf0f8] shadow-xs space-y-2">
                <span className="w-8 h-8 rounded-xl bg-[#0077b6] text-white flex items-center justify-center font-black text-xs">2</span>
                <h4 className="font-extrabold text-sm text-[#03045e]">Approve Cabin Appointments</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Review student consultation requests. Accept meeting slots and specify your cabin room number and preparation instructions.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#caf0f8] shadow-xs space-y-2">
                <span className="w-8 h-8 rounded-xl bg-[#00b4d8] text-[#03045e] flex items-center justify-center font-black text-xs">3</span>
                <h4 className="font-extrabold text-sm text-[#03045e]">Set Mandatory Deadlines</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  If a student misses consultation, use "Meeting Required" to issue an urgent deadline notice directly visible on their dashboard.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#caf0f8] shadow-xs space-y-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs">4</span>
                <h4 className="font-extrabold text-sm text-[#03045e]">Confirm Clearance Sign-Off</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  After evaluating repeat examination results, click "Confirm Clearance" to digitally endorse the student’s clearance certificate.
                </p>
              </div>
            </div>
          )}

          {activeGuideTab === 'admin' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-3xl border border-[#caf0f8] shadow-xs space-y-2">
                <span className="w-8 h-8 rounded-xl bg-[#03045e] text-white flex items-center justify-center font-black text-xs">1</span>
                <h4 className="font-extrabold text-sm text-[#03045e]">Curriculum & Subject Setup</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Configure degrees, semesters, credit weights, and maximum passing cutoffs in the Curriculum Management tab.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#caf0f8] shadow-xs space-y-2">
                <span className="w-8 h-8 rounded-xl bg-[#0077b6] text-white flex items-center justify-center font-black text-xs">2</span>
                <h4 className="font-extrabold text-sm text-[#03045e]">Roster & Faculty Allocation</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Register university students and assign department faculty to specific classes, courses, and mentoring cohorts.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#caf0f8] shadow-xs space-y-2">
                <span className="w-8 h-8 rounded-xl bg-[#00b4d8] text-[#03045e] flex items-center justify-center font-black text-xs">3</span>
                <h4 className="font-extrabold text-sm text-[#03045e]">Audit Backlog Progression</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Inspect expandable student tables, review pending teacher visits, and monitor backlog clearance conversion rates in real time.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#caf0f8] shadow-xs space-y-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs">4</span>
                <h4 className="font-extrabold text-sm text-[#03045e]">Broadcast Institutional Notices</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Publish campus-wide announcements regarding repeat exam fee schedules, ordinance cutoffs, and hall ticket distribution.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 5: 4-STAGE BACKLOG RESOLUTION PIPELINE */}
      <section id="funnel" className="py-20 bg-white relative">
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
            <div className="bg-[#f4f9fd] p-5 rounded-3xl border border-[#caf0f8] shadow-xs text-center relative">
              <div className="w-10 h-10 rounded-2xl bg-[#03045e] text-white flex items-center justify-center font-bold mx-auto mb-3 text-sm">
                1
              </div>
              <h4 className="font-extrabold text-xs text-[#03045e]">Logged Backlog</h4>
              <p className="text-[11px] text-slate-500 mt-1">Student registers uncleared paper with reason.</p>
            </div>

            <div className="bg-[#f4f9fd] p-5 rounded-3xl border border-[#caf0f8] shadow-xs text-center relative">
              <div className="w-10 h-10 rounded-2xl bg-[#0077b6] text-white flex items-center justify-center font-bold mx-auto mb-3 text-sm">
                2
              </div>
              <h4 className="font-extrabold text-xs text-[#03045e]">Faculty Cabin Sync</h4>
              <p className="text-[11px] text-slate-500 mt-1">One-on-one consultation with department professor.</p>
            </div>

            <div className="bg-[#f4f9fd] p-5 rounded-3xl border border-[#caf0f8] shadow-xs text-center relative">
              <div className="w-10 h-10 rounded-2xl bg-[#90e0ef] text-[#03045e] flex items-center justify-center font-bold mx-auto mb-3 text-sm">
                3
              </div>
              <h4 className="font-extrabold text-xs text-[#03045e]">Repeat Examination</h4>
              <p className="text-[11px] text-slate-500 mt-1">Student appears for re-exam or re-evaluation.</p>
            </div>

            <div className="bg-[#f4f9fd] p-5 rounded-3xl border border-[#90e0ef] bg-gradient-to-b from-[#caf0f8]/40 to-white shadow-xs text-center relative">
              <div className="w-10 h-10 rounded-2xl bg-[#0077b6] text-white flex items-center justify-center font-bold mx-auto mb-3 text-sm">
                4
              </div>
              <h4 className="font-extrabold text-xs text-[#0077b6]">Certified Cleared</h4>
              <p className="text-[11px] text-slate-500 mt-1">Official NAAC-compliant certificate generated.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: BENEFITS OF PROACTIVE BACKLOG MANAGEMENT */}
      <section id="benefits" className="py-20 bg-[#f4f9fd] border-y border-[#caf0f8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#caf0f8] text-[#0077b6] text-xs font-extrabold mb-3">
              <ShieldCheck size={14} /> Academic Protection & Career Continuity
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#03045e] tracking-tight">
              Benefits of Proactive Backlog Management
            </h2>
            <p className="text-sm text-slate-600 mt-2 font-medium">
              Why early monitoring and systematic resolution matter for your university degree standing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-[#caf0f8] shadow-xs space-y-2.5">
              <span className="w-9 h-9 rounded-2xl bg-[#caf0f8] text-[#0077b6] flex items-center justify-center font-black text-sm">1</span>
              <h3 className="font-extrabold text-sm text-[#03045e]">Year-Back Protection</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                University ordinances enforce strict maximum backlog limits to advance to next academic years. Tracking keeps you safely under the threshold.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#caf0f8] shadow-xs space-y-2.5">
              <span className="w-9 h-9 rounded-2xl bg-[#caf0f8] text-[#0077b6] flex items-center justify-center font-black text-sm">2</span>
              <h3 className="font-extrabold text-sm text-[#03045e]">Fast Remedial Approval</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Mandatory cabin guidance ensures subject professors review your prep in person, guaranteeing prompt hall ticket release.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#caf0f8] shadow-xs space-y-2.5">
              <span className="w-9 h-9 rounded-2xl bg-[#caf0f8] text-[#0077b6] flex items-center justify-center font-black text-sm">3</span>
              <h3 className="font-extrabold text-sm text-[#03045e]">Placement Eligibility</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Top recruiters and campus placement cells require zero active backlogs at time of interview. Early clearances safeguard opportunities.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#caf0f8] shadow-xs space-y-2.5">
              <span className="w-9 h-9 rounded-2xl bg-[#caf0f8] text-[#0077b6] flex items-center justify-center font-black text-sm">4</span>
              <h3 className="font-extrabold text-sm text-[#03045e]">Legally Valid Transcripts</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Official certificates generated with digital verification hashes are recognized across university departments and graduate schools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: FUTURE ASPECTS & ROADMAP (ATTENDANCE ARRIVING NEXT FEW MONTHS) */}
      <section id="roadmap" className="py-20 bg-gradient-to-br from-[#03045e] via-[#0077b6] to-[#03045e] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#90e0ef] border border-white/20 text-xs font-extrabold mb-3">
              <Rocket size={14} className="text-[#00b4d8]" /> Technology Roadmap 2026
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Future Aspects & Upcoming Modules
            </h2>
            <p className="text-sm text-[#caf0f8] mt-2 font-medium leading-relaxed">
              We are actively developing future backend connections and automated integrations to be delivered in the next few months:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1: Attendance System */}
            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 space-y-3 hover:bg-white/15 transition">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-[#03045e]">
                <Clock size={11} /> Arriving in Next Few Months
              </div>
              <h3 className="font-black text-base text-white">Automated Attendance Tracking Backend</h3>
              <p className="text-xs text-[#caf0f8] leading-relaxed font-medium">
                Direct integration with university RFID & biometric backend turnstiles. Computes live lecture percentages, warns on condonation thresholds below 75%, and auto-flags attendance-based exam shortfalls.
              </p>
            </div>

            {/* Feature 2: SMS & WhatsApp */}
            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 space-y-3 hover:bg-white/15 transition">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#90e0ef] text-[#03045e]">
                <Bell size={11} /> In Development
              </div>
              <h3 className="font-black text-base text-white">SMS & WhatsApp Cabin Dispatch</h3>
              <p className="text-xs text-[#caf0f8] leading-relaxed font-medium">
                Instant mobile SMS alerts dispatched to students when faculty advisors schedule urgent cabin visits or when examination hall tickets are endorsed.
              </p>
            </div>

            {/* Feature 3: AI CGPA Simulator */}
            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 space-y-3 hover:bg-white/15 transition">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#90e0ef] text-[#03045e]">
                <Sparkles size={11} /> Planned Beta
              </div>
              <h3 className="font-black text-base text-white">AI SGPA & Repeat Marks Predictor</h3>
              <p className="text-xs text-[#caf0f8] leading-relaxed font-medium">
                Predictive analytics model calculating the exact target marks needed in re-examinations to reach Distinction or First-Class degree classifications.
              </p>
            </div>

            {/* Feature 4: DigiLocker & NAD */}
            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 space-y-3 hover:bg-white/15 transition">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#90e0ef] text-[#03045e]">
                <ShieldCheck size={11} /> Institutional API
              </div>
              <h3 className="font-black text-base text-white">DigiLocker & NAD Credential Lockers</h3>
              <p className="text-xs text-[#caf0f8] leading-relaxed font-medium">
                Automatic synchronization pushing certified backlog clearance documents directly to students' national government academic depositories.
              </p>
            </div>
          </div>
        </div>

        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-[#00b4d8]/20 blur-3xl pointer-events-none" />
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
              <a href="#about" className="hover:text-white transition">About Us</a>
              <a href="#guide" className="hover:text-white transition">Beginner Guide</a>
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
