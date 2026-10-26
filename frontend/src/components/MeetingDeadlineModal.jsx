import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Send,
  X,
  Sparkles,
  CheckCircle2,
  Trash2,
  Bell
} from 'lucide-react';
import { setMeetingDeadlineRequirement, clearMeetingDeadlineRequirement } from '../utils/backlogStore';

export default function MeetingDeadlineModal({
  record,
  facultyName = 'Dr. Rajesh Sharma',
  onClose,
  onSave,
  onClear
}) {
  if (!record) return null;

  // Compute a default deadline date (3 days from today in YYYY-MM-DD format)
  const defaultDateStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  };

  const [deadlineDate, setDeadlineDate] = useState(
    record.meetingDeadline && record.meetingDeadline.includes('-')
      ? record.meetingDeadline
      : defaultDateStr()
  );
  const [deadlineTime, setDeadlineTime] = useState(
    record.meetingDeadlineTime || '11:00 AM - 01:00 PM'
  );
  const [cabinLocation, setCabinLocation] = useState(
    record.meetingCabinLocation || 'Faculty Cabin 204, Computer Applications'
  );
  const [urgency, setUrgency] = useState(
    record.meetingUrgency || 'Urgent Warning (Meeting Overdue)'
  );
  const [warningMessage, setWarningMessage] = useState(
    record.meetingWarningMessage ||
      'You have missed previous consultation appointments. You are strictly required to report to my cabin before this deadline to avoid repeat exam hall-ticket detention.'
  );
  const [submitting, setSubmitting] = useState(false);

  const URGENCY_LEVELS = [
    {
      id: 'urgent',
      label: '🔴 Urgent Warning (Missed Consultations)',
      color: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    {
      id: 'mandatory',
      label: '🟠 Mandatory Review (Assignment Check)',
      color: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      id: 'routine',
      label: '🔵 Pre-Exam Ordinance Clearance',
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    }
  ];

  const PRESET_WARNINGS = [
    'You have missed scheduled meetings for multiple days. You must report before this deadline or clearance will be withheld.',
    'Urgent: In-person verification of your backlog remedial coursework & assignments required before exam date.',
    'Final cabin consultation notice: Meet immediately to review syllabus coverage and secure repeat exam eligibility.',
    'Attendance shortage & exam ordinance advisory: Strict in-person discussion needed with faculty advisor.'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!deadlineDate) return;

    setSubmitting(true);
    const deadlineData = {
      deadlineDate: deadlineDate,
      deadlineTime: deadlineTime,
      cabinLocation: cabinLocation,
      urgency: urgency,
      warningMessage: warningMessage.trim()
    };

    setMeetingDeadlineRequirement(record.id, deadlineData, facultyName);
    setSubmitting(false);

    if (onSave) {
      onSave({
        ...record,
        meetingRequired: true,
        ...deadlineData
      });
    }
    onClose();
  };

  const handleClear = () => {
    if (window.confirm('Remove this meeting requirement and warning from the student record?')) {
      clearMeetingDeadlineRequirement(record.id);
      if (onClear) {
        onClear(record.id);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
              <AlertTriangle size={20} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Require Meeting & Set Deadline
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Student: {record.studentName} ({record.usn})
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

        {/* Subject Context Banner */}
        <div className="p-3 bg-[#fdfaf6] rounded-2xl border border-[#fdeedc] flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Backlog Subject</span>
            <span className="font-extrabold text-slate-900">{record.subjectName}</span>
            <span className="text-[11px] font-mono text-[#8a4816] font-bold block">
              {record.subjectCode} • {record.semester}
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#fdeedc] text-[#8a4816]">
            {record.metTeacher ? 'Meeting: Completed' : 'Meeting: Pending'}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Urgency Level */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
              Warning Severity / Urgency Type
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {URGENCY_LEVELS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUrgency(u.label)}
                  className={`p-2 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    urgency === u.label
                      ? `${u.color} ring-2 ring-slate-300`
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{u.label}</span>
                  {urgency === u.label && <CheckCircle2 size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time Slot Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <Calendar size={13} className="text-slate-400" /> Deadline Date
              </label>
              <input
                type="date"
                required
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 transition"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <Clock size={13} className="text-slate-400" /> Time / Available Slot
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 11:00 AM - 01:00 PM"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-slate-400 transition"
              />
            </div>
          </div>

          {/* Location / Cabin */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1">
              <MapPin size={13} className="text-slate-400" /> Venue / Faculty Cabin
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Faculty Cabin 204, Computer Applications Block"
              value={cabinLocation}
              onChange={(e) => setCabinLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-slate-400 transition"
            />
          </div>

          {/* Preset Quick Warnings */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1.5 flex items-center gap-1">
              <Sparkles size={12} className="text-amber-600" /> Quick Preset Warning Messages:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_WARNINGS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setWarningMessage(preset)}
                  className="text-[10px] px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 font-medium transition text-left cursor-pointer truncate max-w-full"
                >
                  + {preset.slice(0, 48)}...
                </button>
              ))}
            </div>
          </div>

          {/* Warning Message Box */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Warning / Alert Message for Student
            </label>
            <textarea
              required
              rows={3}
              value={warningMessage}
              onChange={(e) => setWarningMessage(e.target.value)}
              placeholder="Describe the urgency, reason for meeting, and consequences of missing the deadline..."
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:bg-white text-xs leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              This alert will be delivered instantly to the student portal and displayed on their backlog record.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {record.meetingRequired ? (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                <Trash2 size={13} /> Dismiss Requirement
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !warningMessage.trim()}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-[#8a4816] text-white hover:bg-[#6c370f] disabled:opacity-50 rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Bell size={14} /> Send Meeting Alert & Deadline
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
