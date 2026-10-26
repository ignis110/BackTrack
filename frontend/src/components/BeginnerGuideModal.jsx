import React, { useState } from 'react';
import { BookOpen, CheckCircle2, ChevronRight, GraduationCap, UserCheck, ShieldCheck, HelpCircle, X, Sparkles, ArrowRight } from 'lucide-react';

export default function BeginnerGuideModal({ onClose, onNavigate }) {
  const [activeRoleTab, setActiveRoleTab] = useState('student');

  const studentSteps = [
    {
      step: 1,
      title: 'Select Semester & Enrolled Subjects',
      desc: 'On your Student Dashboard or "My Subjects" tab, choose your current semester (e.g. Sem 1, Sem 3). Click "+ Choose Subject" or "Select All Available" to auto-populate your university course syllabus and enter your Mid-Sem/End-Sem scores.',
      highlight: 'Direct curriculum mapping for BCA 1st to 8th Semester'
    },
    {
      step: 2,
      title: 'Track Backlog Papers in "Backlog Tracking"',
      desc: 'If you scored below 40 marks in an End-Semester exam, or faced continuous evaluation shortfalls, your subject appears in "Backlog Tracking". You can also manually add a repeat paper using the "+ Add Backlog Subject" button.',
      highlight: 'Real-time 4-stage resolution tracking'
    },
    {
      step: 3,
      title: 'Schedule In-Person Teacher Meetings',
      desc: 'University ordinance requires meeting your subject teacher before repeat exam approval. Click "Request Teacher Meet" to book a 1-on-1 cabin consultation slot for doubt clearing or remedial review.',
      highlight: 'Cabin location, deadline notifications & advisory alerts'
    },
    {
      step: 4,
      title: 'Submit Progress & Download Clearance Certificate',
      desc: 'Use "Update Progress Report" to submit updates on your repeat exam prep. Once your teacher endorses your standing, download your official verified Certificate of Backlog Course Clearance with unique serial numbers.',
      highlight: 'Legally recognized for hall ticket issuance and degree audit'
    }
  ];

  const facultySteps = [
    {
      step: 1,
      title: 'Monitor Assigned Student Cohorts',
      desc: 'Filter students across BCA sections and semesters. View students requiring immediate academic intervention, attendance condonation, or repeat examination guidance.',
      highlight: 'Multi-criteria filters for marks, attendance & reason'
    },
    {
      step: 2,
      title: 'Conduct Cabin Consultations',
      desc: 'Receive consultation requests from students, approve meeting times, and issue cabin guidance notes and syllabus review advice directly to the student portal.',
      highlight: 'Set mandatory meeting deadlines with cabin alerts'
    },
    {
      step: 3,
      title: 'Issue Official Clearance Endorsements',
      desc: 'After verifying repeat exam performance or remedial coursework, click "Confirm Clearance" to issue university-certified clearance sign-offs.',
      highlight: 'Instant digital certificate creation'
    }
  ];

  const adminSteps = [
    {
      step: 1,
      title: 'Maintain Master University Catalog',
      desc: 'Configure degree courses, semester modules, credit allocations, and subject syllabi in the Curriculum Management desk.',
      highlight: 'Institutional curriculum mapping'
    },
    {
      step: 2,
      title: 'Manage User Accounts & Faculty Allocations',
      desc: 'Register and assign department teachers to specific sections and subjects. Manage student enrollment rosters and credentials.',
      highlight: 'Role-based access control'
    },
    {
      step: 3,
      title: 'Institution-Wide Backlog Progression Audits',
      desc: 'Track resolution funnel conversion rates, audit teacher consultations, and broadcast urgent academic notices across the university.',
      highlight: 'NAAC & UGC accreditation reporting'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[92vh] overflow-y-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0077b6] text-white flex items-center justify-center font-bold shadow-md shadow-[#0077b6]/20">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-[#03045e] text-base">Beginner’s Portal Navigation Guide</h3>
              <p className="text-xs text-slate-500">How to navigate and master the BackTrack academic portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-[#f4f9fd] border border-[#caf0f8] rounded-2xl">
          <button
            onClick={() => setActiveRoleTab('student')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeRoleTab === 'student'
                ? 'bg-[#0077b6] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#0077b6]'
            }`}
          >
            <GraduationCap size={15} /> Student Walkthrough
          </button>

          <button
            onClick={() => setActiveRoleTab('faculty')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeRoleTab === 'faculty'
                ? 'bg-[#0077b6] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#0077b6]'
            }`}
          >
            <UserCheck size={15} /> Faculty Desk
          </button>

          <button
            onClick={() => setActiveRoleTab('admin')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeRoleTab === 'admin'
                ? 'bg-[#0077b6] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#0077b6]'
            }`}
          >
            <ShieldCheck size={15} /> Exam Cell Admin
          </button>
        </div>

        {/* Walkthrough Steps Content */}
        <div className="space-y-3.5">
          {(activeRoleTab === 'student' ? studentSteps : activeRoleTab === 'faculty' ? facultySteps : adminSteps).map((s) => (
            <div key={s.step} className="p-4 rounded-2xl bg-[#fbfbfd] border border-slate-100 flex items-start gap-3.5 hover:border-[#90e0ef] transition-all">
              <div className="w-8 h-8 rounded-xl bg-[#caf0f8] text-[#0077b6] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                {s.step}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-extrabold text-sm text-slate-900">{s.title}</h4>
                  <span className="text-[10px] font-bold text-[#0077b6] bg-[#caf0f8]/60 px-2 py-0.5 rounded-md">
                    {s.highlight}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Important University Rules & FAQ Callout */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#caf0f8]/50 via-white to-[#caf0f8]/30 border border-[#90e0ef] text-xs space-y-2">
          <div className="flex items-center gap-2 font-black text-[#03045e]">
            <Sparkles size={16} className="text-[#00b4d8]" />
            <span>Essential University Backlog Ordinance Checklist</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px] text-slate-700">
            <div className="p-2.5 bg-white/80 rounded-xl border border-[#caf0f8]">
              <strong className="block text-[#03045e] mb-0.5 font-bold">1. Passing Cutoffs</strong>
              <span>Minimum 40/100 in End-Semester Exam and 18/50 in continuous internal assessments.</span>
            </div>
            <div className="p-2.5 bg-white/80 rounded-xl border border-[#caf0f8]">
              <strong className="block text-[#03045e] mb-0.5 font-bold">2. Mandatory Meetings</strong>
              <span>At least 1 cabin consultation with subject faculty is required before re-exam registration.</span>
            </div>
            <div className="p-2.5 bg-white/80 rounded-xl border border-[#caf0f8]">
              <strong className="block text-[#03045e] mb-0.5 font-bold">3. Official Clearance</strong>
              <span>Always download and keep your signed Clearance Certificate for your degree dossier.</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-slate-400">
            Need further guidance? Meet your assigned faculty advisor in person.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#03045e] hover:bg-[#0077b6] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
          >
            Got it, Let’s Start!
          </button>
        </div>
      </div>
    </div>
  );
}
