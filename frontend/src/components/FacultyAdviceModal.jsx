import React, { useState } from 'react';
import { MessageSquare, Send, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { addFacultyAdvice } from '../utils/backlogStore';

export default function FacultyAdviceModal({ record, facultyName = 'Faculty Advisor', onClose, onAdviceSent }) {
  if (!record) return null;

  const [adviceText, setAdviceText] = useState(record.facultyNotes || '');
  const [submitting, setSubmitting] = useState(false);

  const PRESETS = [
    'Attend cabin consultation this Wednesday at 11:00 AM with your lecture notes.',
    'Complete and submit Unit 3 & 4 question bank assignments to faculty cabin.',
    'Remedial coursework hours verified. Approved for repeat examination hall ticket.',
    'Practice previous 3 years question papers before the scheduled repeat examination.',
    'Repeat examination marks verified. Clearance ready for endorsement.'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!adviceText.trim()) return;

    setSubmitting(true);
    addFacultyAdvice(record.id, adviceText.trim(), facultyName);
    setSubmitting(false);
    if (onAdviceSent) {
      onAdviceSent(record.id, adviceText.trim());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#caf0f8] text-[#0077b6] flex items-center justify-center font-bold">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#03045e]">Faculty Academic Guidance</h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {record.studentName} ({record.usn})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Course Context Pill */}
        <div className="p-3 bg-[#f4f9fd] rounded-2xl border border-[#caf0f8] flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Subject Paper</span>
            <span className="font-extrabold text-[#03045e]">{record.subjectName}</span>
            <span className="text-[11px] font-mono text-[#0077b6] font-bold block">{record.subjectCode} • {record.semester}</span>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#caf0f8] text-[#0077b6]">
            {record.repeatExamStatus}
          </span>
        </div>

        {/* Quick Advice Recommendations */}
        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1.5 flex items-center gap-1">
            <Sparkles size={12} className="text-[#0077b6]" /> Recommended Quick Guidelines:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setAdviceText(preset)}
                className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-[#caf0f8] hover:text-[#0077b6] text-slate-700 font-medium transition text-left cursor-pointer"
              >
                + {preset.length > 40 ? preset.slice(0, 40) + '...' : preset}
              </button>
            ))}
          </div>
        </div>

        {/* Guidance Text Area */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Personalized Guidance / Directives for Student
            </label>
            <textarea
              required
              rows={4}
              value={adviceText}
              onChange={(e) => setAdviceText(e.target.value)}
              placeholder="e.g. Please bring your completed assignments to Room 304 tomorrow at 11 AM..."
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:bg-white text-xs leading-relaxed"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
              <span>This note will appear immediately on the student's backlog tracking card.</span>
              <span>{adviceText.length} chars</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !adviceText.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#0077b6] text-white hover:bg-[#03045e] disabled:opacity-50 rounded-2xl text-xs font-bold transition shadow-md shadow-[#0077b6]/20 cursor-pointer"
            >
              <Send size={14} className="text-[#00b4d8]" /> Dispatch Guidance Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
