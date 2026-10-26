import React from 'react';
import { Download, Printer, X, ShieldCheck, QrCode, FileText, GraduationCap, CheckCircle2, Clock } from 'lucide-react';

export default function StudentProfileDocumentModal({
  profile,
  subjects = [],
  requests = [],
  backlogRecords = [],
  onClose
}) {
  if (!profile) return null;

  const handlePrint = () => {
    window.print();
  };

  const documentId = `BT-DOSSIER-${profile.usn ? profile.usn.replace(/[^a-zA-Z0-9]/g, '') : 'STU'}-${new Date().getFullYear()}`;
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const myBacklogs = backlogRecords.filter(
    (b) =>
      (b.studentName && b.studentName.toLowerCase() === profile.name.toLowerCase()) ||
      (b.usn && b.usn.toLowerCase() === profile.usn.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[95vh] overflow-y-auto print:max-w-none print:shadow-none print:p-0 print:border-none print:rounded-none">
        
        {/* Header Action Bar (Hidden when printing) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 bg-[#caf0f8] text-[#0077b6] rounded-2xl font-bold">
              <FileText size={22} />
            </span>
            <div>
              <h3 className="font-extrabold text-[#03045e] text-base">Export Student Academic Profile & Dossier</h3>
              <p className="text-[11px] text-slate-500 font-mono">Official University Document ID: {documentId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0077b6] text-white hover:bg-[#03045e] rounded-xl text-xs font-bold transition shadow-md shadow-[#0077b6]/20 cursor-pointer"
            >
              <Printer size={15} /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOSSIER BODY */}
        <div className="relative border-4 border-slate-800 bg-white p-8 sm:p-10 rounded-2xl shadow-inner text-slate-900 overflow-hidden print:border-2 print:border-black print:p-6 print:m-0">
          
          {/* Subtle Watermark Stamp */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            <GraduationCap size={450} />
          </div>

          {/* Top Header & Institutional Seal */}
          <div className="border-b-2 border-slate-800 pb-5 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#03045e] text-white font-black text-xl flex items-center justify-center tracking-wider shrink-0 shadow-sm">
                BT
              </div>
              <div>
                <h1 className="font-serif font-black text-lg sm:text-xl text-[#03045e] tracking-tight uppercase">
                  CENTRAL UNIVERSITY ACADEMIC EXAMINATION CELL
                </h1>
                <p className="text-xs font-semibold text-slate-600">
                  Autonomous Academic Progression & Institutional Backlog Registry
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Affiliated with State Higher Education Commission • NAAC Grade A++ Accredited
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right shrink-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Document Control No.</span>
              <span className="font-mono font-bold text-xs text-[#03045e] block">{documentId}</span>
              <span className="text-[11px] text-slate-600 font-medium block mt-0.5">Date of Issue: {currentDate}</span>
            </div>
          </div>

          {/* Dossier Title */}
          <div className="text-center py-4 relative z-10">
            <span className="px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300 text-[11px] font-black uppercase tracking-wider">
              Comprehensive Student Academic Dossier & Standing Record
            </span>
          </div>

          {/* Candidate Profile Details Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs relative z-10 mb-5">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Student Full Name</span>
              <strong className="text-slate-900 font-extrabold text-sm block mt-0.5">{profile.name}</strong>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">University Seat No (USN)</span>
              <strong className="text-[#03045e] font-mono font-bold text-sm block mt-0.5">{profile.usn}</strong>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Degree Program</span>
              <strong className="text-slate-900 font-bold block mt-0.5 truncate">{profile.course || 'Bachelor of Computer Applications (BCA)'}</strong>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Enrolled Semester & Div</span>
              <strong className="text-slate-900 font-bold block mt-0.5">{profile.semester} • Section {profile.section}</strong>
            </div>
          </div>

          {/* Key Academic Performance Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 relative z-10">
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Cumulative CGPA</span>
              <div className="text-xl font-black text-[#03045e] mt-0.5">
                {Number(profile.cgpa) > 0 ? `${profile.cgpa} / 10.0` : 'Pending'}
              </div>
              <span className="text-[10px] font-semibold text-emerald-700">
                {Number(profile.cgpa) >= 8.5 ? 'First Class with Distinction' : Number(profile.cgpa) >= 6.0 ? 'First Class' : 'Regular Standing'}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Mid-Sem Internal Avg</span>
              <div className="text-xl font-black text-[#0077b6] mt-0.5">
                {Number(profile.midsemAverage) > 0 ? `${profile.midsemAverage}%` : '—'}
              </div>
              <span className="text-[10px] text-slate-500">Continuous Assessment</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Registered Courses</span>
              <div className="text-xl font-black text-slate-900 mt-0.5">{subjects.length} Courses</div>
              <span className="text-[10px] text-slate-500">{profile.semester} Curriculum</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Active Backlog Papers</span>
              <div className={`text-xl font-black mt-0.5 ${myBacklogs.length > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {myBacklogs.length} Papers
              </div>
              <span className={`text-[10px] font-bold ${myBacklogs.length > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {myBacklogs.length > 0 ? 'Under Repeat Resolution' : 'All Cleared ✓'}
              </span>
            </div>
          </div>

          {/* Registered Subject Coursework & Evaluation Transcript Table */}
          <div className="mb-6 relative z-10">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2 flex items-center justify-between">
              <span>1. Enrolled Semester Coursework & Evaluation Record</span>
              <span className="text-[10px] font-normal text-slate-500 font-mono">Total Subjects: {subjects.length}</span>
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-600">
                    <th className="p-2.5">Code</th>
                    <th className="p-2.5">Course Title</th>
                    <th className="p-2.5">Faculty In-Charge</th>
                    <th className="p-2.5 text-center">Mid-Sem (50)</th>
                    <th className="p-2.5 text-center">End-Sem (100)</th>
                    <th className="p-2.5 text-center">Academic Standing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjects.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400 italic">No courses currently registered for this student profile.</td>
                    </tr>
                  ) : (
                    subjects.map((sub, idx) => (
                      <tr key={sub.code || idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-mono font-bold text-slate-800">{sub.code}</td>
                        <td className="p-2.5 font-semibold text-slate-900">{sub.name}</td>
                        <td className="p-2.5 text-slate-600 text-[11px]">{sub.faculty || 'Department Faculty'}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-emerald-700">
                          {sub.midsemMarks !== null && sub.midsemMarks !== undefined ? sub.midsemMarks : '—'}
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-[#0077b6]">
                          {sub.endsemMarks !== null && sub.endsemMarks !== undefined ? sub.endsemMarks : 'Pending'}
                        </td>
                        <td className="p-2.5 text-center font-bold text-[11px]">
                          {sub.isBacklog || sub.endsemStatus?.includes('Backlog') ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">Backlog</span>
                          ) : sub.isRepeat ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">Repeat Prep</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Regular / Cleared</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Backlog Tracking & Repeat Resolution Standing */}
          <div className="mb-6 relative z-10">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2 flex items-center justify-between">
              <span>2. Backlog Tracking & Faculty Clearance Progress</span>
              <span className="text-[10px] font-normal text-slate-500 font-mono">Active Records: {myBacklogs.length}</span>
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-600">
                    <th className="p-2.5">Paper Code</th>
                    <th className="p-2.5">Subject Name</th>
                    <th className="p-2.5">Backlog Reason</th>
                    <th className="p-2.5 text-center">Teacher Consultation</th>
                    <th className="p-2.5 text-center">Repeat Exam</th>
                    <th className="p-2.5 text-center">Clearance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myBacklogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-emerald-700 font-bold bg-emerald-50/50">
                        ✓ All Clear — No active or pending backlog subjects logged for this candidate.
                      </td>
                    </tr>
                  ) : (
                    myBacklogs.map((b, idx) => (
                      <tr key={b.id || idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-mono font-bold text-slate-800">{b.subjectCode}</td>
                        <td className="p-2.5 font-semibold text-slate-900">{b.subjectName}</td>
                        <td className="p-2.5 text-slate-700 text-[11px]">{b.backlogReason || b.reason || 'Repeat Exam'}</td>
                        <td className="p-2.5 text-center font-bold text-[11px]">
                          {b.metTeacher ? (
                            <span className="text-emerald-700">Completed ✓</span>
                          ) : (
                            <span className="text-amber-700">Pending Guidance</span>
                          )}
                        </td>
                        <td className="p-2.5 text-center font-bold text-[#0077b6] text-[11px]">
                          {b.repeatExamStatus || 'Preparing'}
                        </td>
                        <td className="p-2.5 text-center font-bold text-[11px]">
                          {b.clearanceStatus === 'Cleared' ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Cleared ✓</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">In Review</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Department Faculty Meetings Record */}
          {requests.length > 0 && (
            <div className="mb-6 relative z-10">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2">
                3. Teacher Cabin Consultations & Verified Interactions
              </h4>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                {requests.slice(0, 3).map((req, idx) => (
                  <div key={req.id || idx} className="flex items-center justify-between border-b border-slate-200/60 pb-1.5 last:border-b-0 last:pb-0">
                    <div>
                      <strong className="text-slate-900">{req.subject}</strong>
                      <span className="text-slate-500 text-[11px] ml-2">({req.type})</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-slate-500">{req.date} {req.time || ''}</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold ${req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-800'}`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Endorsement & Verification Footer */}
          <div className="mt-8 pt-6 border-t-2 border-slate-800 relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                <QrCode size={40} className="text-[#03045e]" />
                <div className="text-[10px] text-slate-500 leading-tight">
                  <span className="font-bold text-slate-800 block">Digital Verification Hash:</span>
                  <span className="font-mono text-[9px] block">SHA256:{documentId.slice(-8)}98A41E</span>
                  <span>Scan to verify on university portal</span>
                </div>
              </div>
            </div>

            <div className="text-center sm:text-right space-y-1">
              <div className="h-10 flex items-end justify-center sm:justify-end">
                <span className="font-serif italic font-bold text-[#0077b6] text-sm tracking-wider">Dr. M. K. Sharma</span>
              </div>
              <div className="border-t border-slate-400 pt-1">
                <p className="text-[10px] font-bold uppercase text-slate-800">Faculty Advisor & Mentor</p>
                <p className="text-[9px] text-slate-500">Dept. of Computer Applications</p>
              </div>
            </div>

            <div className="text-center sm:text-right space-y-1">
              <div className="h-10 flex items-end justify-center sm:justify-end">
                <span className="font-serif italic font-bold text-[#03045e] text-sm tracking-wider">Prof. R. V. Ramanathan</span>
              </div>
              <div className="border-t border-slate-400 pt-1">
                <p className="text-[10px] font-bold uppercase text-[#03045e]">Controller of Examinations</p>
                <p className="text-[9px] text-slate-500">Central University Examination Cell</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[9px] text-slate-400">
            This document is computer-generated by the BackTrack Academic Information System. Any unauthorized alteration renders it null and void.
          </div>
        </div>
      </div>
    </div>
  );
}
