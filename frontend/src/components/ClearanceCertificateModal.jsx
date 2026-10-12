import React from 'react';
import { Award, CheckCircle2, Download, Printer, X, ShieldCheck, QrCode } from 'lucide-react';

export default function ClearanceCertificateModal({ record, onClose }) {
  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  const certNumber = `BT-CERT-${record.id || 'BL-000'}-${record.usn ? record.usn.slice(-4) : '2026'}`;
  const clearanceDate = record.facultyClearedDate || record.lastUpdated || 'Current Academic Session 2026';

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[95vh] overflow-y-auto print:max-w-none print:shadow-none print:p-0 print:border-none print:rounded-none">
        
        {/* Header Action Bar (Hidden when printing) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#e7f6ee] text-[#166534] rounded-xl font-bold">
              <Award size={20} />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Official University Clearance Certificate</h3>
              <p className="text-[11px] text-slate-500 font-mono">Reference: {certNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#13141b] text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Printer size={15} /> Print Certificate
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PRINTABLE CERTIFICATE BODY */}
        <div className="relative border-8 border-double border-[#8a4816]/30 bg-gradient-to-b from-[#fdfbf7] via-white to-[#fbf8f2] p-8 sm:p-10 rounded-2xl shadow-inner text-slate-800 overflow-hidden print:border-4 print:border-black print:p-6 print:m-0">
          
          {/* Subtle Watermark Stamp in background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            <ShieldCheck size={380} />
          </div>

          {/* Top Seal & University Crest */}
          <div className="text-center space-y-2 border-b-2 border-[#8a4816]/20 pb-6 relative z-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#13141b] text-white font-black text-xl tracking-wider shadow-md mb-1">
              BT
            </div>
            <h1 className="font-serif font-black text-xl sm:text-2xl text-slate-900 tracking-wide uppercase">
              CENTRAL UNIVERSITY OF ACADEMIC EXCELLENCE
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#8a4816] font-bold">
              Office of the Controller of Academic Examinations • Autonomous Body
            </p>
            <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-[#fdeedc] text-[#8a4816] text-[10px] font-mono font-bold tracking-wider uppercase">
              Accredited NAAC Grade A++ • ISO 9001:2026 Certified
            </div>
          </div>

          {/* Certificate Title */}
          <div className="text-center my-6 space-y-1 relative z-10">
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400 font-sans">
              OFFICIAL VERIFICATION TRANSCRIPT
            </span>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#8a4816] tracking-tight underline decoration-[#fcd7b5] decoration-2 underline-offset-8">
              CERTIFICATE OF BACKLOG COURSE CLEARANCE
            </h2>
          </div>

          {/* Main Statement */}
          <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700 text-center max-w-2xl mx-auto relative z-10 font-serif">
            <p>
              This is to certify that candidate{' '}
              <strong className="text-slate-900 font-bold underline decoration-slate-400 font-sans text-base">
                {record.studentName}
              </strong>
              , registered under University Student Number{' '}
              <strong className="text-slate-900 font-mono font-bold font-sans text-base">
                {record.usn}
              </strong>
              , has successfully completed all remedial course requirements, faculty consultations, and examination mandates in:
            </p>

            {/* Course Information Box */}
            <div className="my-5 p-4 rounded-xl bg-white border border-[#8a4816]/20 shadow-xs font-sans text-left grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Course Name & Code</span>
                <span className="font-extrabold text-sm text-slate-900 block">{record.subjectName}</span>
                <span className="font-mono text-xs font-bold text-[#8a4816]">{record.subjectCode} • {record.semester}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Resolution Status</span>
                <span className="font-extrabold text-sm text-emerald-700 flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 size={16} /> CLEARED & CERTIFIED
                </span>
                <span className="text-[11px] text-slate-500 block font-mono">
                  Initial Backlog Cause: {record.backlogReason} (Remediated)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 italic">
              &quot;The student has met with the designated subject faculty, completed all prescriptive laboratory and theoretical assignment components, appeared for the university repeat examination, and satisfied the academic standing criteria for clearance.&quot;
            </p>
          </div>

          {/* Metadata & Verification Footer */}
          <div className="mt-8 pt-6 border-t-2 border-[#8a4816]/20 grid grid-cols-3 items-end gap-4 relative z-10 font-sans">
            {/* Left: Clearance Date and QR Code */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center shadow-xs">
                  {/* Clean SVG QR mockup */}
                  <svg className="w-10 h-10 text-slate-800" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14-2h4v2h-4v-2zm0 6h4v2h-4v-2zm-4-6h2v4h-2v-4zm2 4h2v2h-2v-2zm-2 2h2v2h-2v-2zm4-2h2v2h-2v-2z" />
                  </svg>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400 block">Scan to Verify</span>
                  <span className="font-mono text-[10px] text-slate-700 font-bold block">{certNumber}</span>
                  <span className="text-[10px] text-slate-500 block">Date: {clearanceDate}</span>
                </div>
              </div>
            </div>

            {/* Middle: Official University Seal */}
            <div className="text-center">
              <div className="inline-flex flex-col items-center justify-center w-20 h-20 rounded-full border-2 border-dashed border-[#8a4816]/60 bg-[#fdeedc]/40 p-2 shadow-xs">
                <ShieldCheck size={22} className="text-[#8a4816]" />
                <span className="text-[8px] font-extrabold uppercase tracking-tight text-[#8a4816] mt-0.5">SEAL OF THE</span>
                <span className="text-[7px] font-black uppercase text-[#8a4816]">REGISTRAR</span>
              </div>
            </div>

            {/* Right: Digital Signature */}
            <div className="text-right space-y-1">
              <div className="font-serif italic font-bold text-slate-900 text-sm tracking-wide border-b border-slate-400 pb-1 inline-block">
                Dr. Ramesh Sharma
              </div>
              <span className="text-[10px] font-bold text-slate-700 block uppercase">Professor & Head of Dept.</span>
              <span className="text-[9px] text-slate-400 block font-mono">Academic Verification Authority</span>
            </div>
          </div>
        </div>

        {/* Action Help Footer (Hidden when printing) */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 print:hidden">
          <span>This certificate is legally recognized across university departments for graduation eligibility and hall-ticket issuance.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
