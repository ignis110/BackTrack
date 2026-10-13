import React from 'react';
import { CheckCircle2, Clock, Check, AlertCircle, ArrowRight, ShieldCheck, UserCheck, BookOpen, FileCheck, Award } from 'lucide-react';

/**
 * 5-Stage Visual Resolution Stepper for an individual backlog paper.
 */
export function RecordFunnelStepper({ record }) {
  if (!record) return null;

  const isMetTeacher = Boolean(record.metTeacher);
  const isAssignmentsDone = record.assignmentsCompleted === 'Completed';
  const isExamAppeared = record.repeatExamStatus === 'Appeared';
  const isExamScheduled = record.repeatExamStatus === 'Scheduled';
  const isCleared = record.clearanceStatus === 'Cleared' || record.resultStatus === 'Cleared';

  const steps = [
    {
      id: 1,
      label: 'Backlog Logged',
      detail: record.semester,
      status: 'completed',
      icon: <BookOpen size={13} />
    },
    {
      id: 2,
      label: 'Met Teacher',
      detail: isMetTeacher ? 'Consulted' : 'Pending',
      status: isMetTeacher ? 'completed' : 'current',
      icon: <UserCheck size={13} />
    },
    {
      id: 3,
      label: 'Assignments',
      detail: isAssignmentsDone ? 'Completed' : 'Pending',
      status: isAssignmentsDone ? 'completed' : (isMetTeacher ? 'current' : 'upcoming'),
      icon: <FileCheck size={13} />
    },
    {
      id: 4,
      label: 'Repeat Exam',
      detail: isExamAppeared ? 'Appeared' : (isExamScheduled ? 'Scheduled' : 'Preparing'),
      status: isExamAppeared ? 'completed' : (isExamScheduled ? 'current' : (isAssignmentsDone ? 'current' : 'upcoming')),
      icon: <Clock size={13} />
    },
    {
      id: 5,
      label: 'Clearance',
      detail: isCleared ? 'Certified ✓' : 'In Review',
      status: isCleared ? 'completed' : (isExamAppeared ? 'current' : 'upcoming'),
      icon: <Award size={13} />
    }
  ];

  return (
    <div className="w-full py-2.5">
      <div className="flex items-center justify-between relative">
        {/* Connecting Line Background */}
        <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-slate-200 -z-0"></div>

        {steps.map((step, idx) => {
          const isDone = step.status === 'completed';
          const isCurrent = step.status === 'current';

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10 text-center flex-1">
              <div
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300
                  ${isDone ? 'bg-emerald-600 text-white ring-4 ring-emerald-50' : ''}
                  ${isCurrent ? 'bg-[#8a4816] text-white ring-4 ring-[#fdeedc] animate-pulse' : ''}
                  ${!isDone && !isCurrent ? 'bg-slate-100 text-slate-400 border border-slate-200' : ''}
                `}
              >
                {isDone ? <Check size={13} strokeWidth={3} /> : step.icon}
              </div>
              <span className={`text-[10px] font-extrabold mt-1.5 leading-tight ${
                isDone ? 'text-emerald-800' : isCurrent ? 'text-[#8a4816]' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
              <span className="text-[9px] text-slate-400 font-medium">{step.detail}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Visual Backlog Resolution Funnel Summary Card
 * Displays aggregate progress across all active backlogs.
 */
export function ResolutionFunnelSummary({ records = [], activeFilter = null, onFilterSelect = null }) {
  const total = records.length;
  const metTeacher = records.filter((r) => r.metTeacher).length;
  const assignmentsDone = records.filter((r) => r.assignmentsCompleted === 'Completed').length;
  const examAppeared = records.filter((r) => r.repeatExamStatus === 'Appeared').length;
  const cleared = records.filter((r) => r.clearanceStatus === 'Cleared').length;

  const funnelStages = [
    {
      id: 'all',
      name: '1. Enrolled Backlogs',
      count: total,
      pct: total === 0 ? 0 : 100,
      color: 'bg-slate-900',
      textColor: 'text-slate-900',
      bgLight: 'bg-slate-100',
      desc: 'Total active backlog papers'
    },
    {
      id: 'met',
      name: '2. Met Faculty Advisor',
      count: metTeacher,
      pct: total === 0 ? 0 : Math.round((metTeacher / total) * 100),
      color: 'bg-[#8a4816]',
      textColor: 'text-[#8a4816]',
      bgLight: 'bg-[#fdeedc]',
      desc: 'Completed one-on-one cabin consultation'
    },
    {
      id: 'assignments',
      name: '3. Assignments Verified',
      count: assignmentsDone,
      pct: total === 0 ? 0 : Math.round((assignmentsDone / total) * 100),
      color: 'bg-indigo-600',
      textColor: 'text-indigo-600',
      bgLight: 'bg-indigo-50',
      desc: 'Submitted remedial coursework'
    },
    {
      id: 'appeared',
      name: '4. Repeat Exam Appeared',
      count: examAppeared,
      pct: total === 0 ? 0 : Math.round((examAppeared / total) * 100),
      color: 'bg-blue-600',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
      desc: 'Appeared for scheduled re-exam'
    },
    {
      id: 'cleared',
      name: '5. Officially Cleared',
      count: cleared,
      pct: total === 0 ? 0 : Math.round((cleared / total) * 100),
      color: 'bg-emerald-600',
      textColor: 'text-emerald-700',
      bgLight: 'bg-[#e7f6ee]',
      desc: 'Endorsed and certified cleared'
    }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8a4816]"></span>
            <h3 className="font-extrabold text-base text-slate-900">Backlog Resolution Funnel</h3>
          </div>
          <p className="text-xs text-slate-500">
            Real-time stage-by-stage progression from backlog registration to official clearance.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-slate-400 uppercase">Clearance Conversion Rate</span>
          <div className="text-xl font-black text-emerald-700">
            {total === 0 ? '0%' : `${Math.round((cleared / total) * 100)}%`}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            {total === 0 ? '0 Active Backlogs' : `${cleared} of ${total} Cleared`}
          </span>
        </div>
      </div>

      {/* Funnel Progress Bars */}
      <div className="space-y-3">
        {funnelStages.map((stage) => {
          const isSelected = activeFilter === stage.id;
          return (
            <div
              key={stage.id}
              onClick={() => onFilterSelect && onFilterSelect(stage.id)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-slate-900 bg-slate-50 shadow-sm'
                  : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-extrabold text-slate-800 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${stage.color}`}></span>
                  {stage.name}
                </span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-slate-900">{stage.count} Students</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${stage.bgLight} ${stage.textColor}`}>
                    {stage.pct}%
                  </span>
                </div>
              </div>

              {/* Bar track */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                  style={{ width: stage.count === 0 ? '0%' : `${Math.max(stage.pct, 4)}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                <span>{stage.desc}</span>
                {isSelected && <span className="font-bold text-slate-900">Active Filter</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
