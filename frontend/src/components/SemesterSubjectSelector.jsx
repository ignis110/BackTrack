import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Check,
  CheckCircle2,
  Trash2,
  Edit3,
  Sparkles,
  AlertCircle,
  RotateCcw,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  GraduationCap,
  Layers,
  ArrowRight,
  X
} from 'lucide-react';
import { BCA_CURRICULUM } from '../utils/backlogStore';

export default function SemesterSubjectSelector({
  enrolledSubjects = [],
  currentSemester = 'Semester 1',
  studentCourse = 'Bachelor of Computer Applications (BCA)',
  onEnrollSubject,
  onEnrollAsBacklog,
  onEnrollAllForSemester,
  onRemoveSubject,
  onEditSubject,
  onOpenCustomModal,
  onClearAllSubjects
}) {
  // Allow student to select any semester from 1 to 8
  const [selectedSemester, setSelectedSemester] = useState(() => currentSemester || 'Semester 1');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewFilter, setViewFilter] = useState('all'); // 'all', 'backlogs_only', 'enrolled_only', 'unenrolled_only'

  // Modal state for "Add subjects" with reason dropdown
  const [isAddBacklogModalOpen, setIsAddBacklogModalOpen] = useState(false);
  const [backlogModalSubject, setBacklogModalSubject] = useState({
    code: '',
    name: '',
    isCustom: false,
    reason: 'Repeat due to Marks',
    otherReasonText: '',
    repeatExamStatus: 'Preparing',
    midsemMarks: '',
    endsemMarks: ''
  });

  // Extract semester number (1 to 8)
  const selectedSemNum = useMemo(() => {
    const match = selectedSemester.match(/([1-8])/);
    return match ? parseInt(match[1], 10) : 1;
  }, [selectedSemester]);

  // Extract current registered semester number
  const currentSemNum = useMemo(() => {
    const match = currentSemester.match(/([1-8])/);
    return match ? parseInt(match[1], 10) : 1;
  }, [currentSemester]);

  const isPriorSemester = selectedSemNum < currentSemNum;

  // Curriculum subjects for the chosen semester
  const semesterCurriculum = useMemo(() => {
    return BCA_CURRICULUM.filter((s) => s.semesterNum === selectedSemNum);
  }, [selectedSemNum]);

  // Enrolled subjects that belong to this chosen semester
  const enrolledInThisSemester = useMemo(() => {
    return enrolledSubjects.filter((s) => {
      const match = s.semester?.match(/([1-8])/);
      const semNum = match ? parseInt(match[1], 10) : s.semesterNum || 1;
      return semNum === selectedSemNum || s.semester === selectedSemester;
    });
  }, [enrolledSubjects, selectedSemNum, selectedSemester]);

  // Total backlogs across the entire student profile
  const totalBacklogsCount = useMemo(() => {
    return enrolledSubjects.filter(
      (s) =>
        s.isBacklog ||
        s.isRepeat ||
        s.enrollmentType?.includes('Backlog') ||
        s.enrollmentType?.includes('Repeat') ||
        s.endsemStatus?.includes('Backlog') ||
        s.endsemStatus?.includes('Failed')
    ).length;
  }, [enrolledSubjects]);

  // Filtered by search & viewFilter
  const displayedCurriculum = useMemo(() => {
    return semesterCurriculum.filter((s) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery = s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      const enrolledMatch = enrolledSubjects.find((e) => e.code === s.code);
      const isEnrolled = !!enrolledMatch;
      const isBacklog =
        enrolledMatch?.isBacklog ||
        enrolledMatch?.isRepeat ||
        enrolledMatch?.enrollmentType?.includes('Backlog') ||
        enrolledMatch?.endsemStatus?.includes('Backlog');

      if (viewFilter === 'backlogs_only') return isEnrolled && isBacklog;
      if (viewFilter === 'enrolled_only') return isEnrolled;
      if (viewFilter === 'unenrolled_only') return !isEnrolled;

      return true;
    });
  }, [semesterCurriculum, searchQuery, viewFilter, enrolledSubjects]);

  const semestersList = [
    { name: 'Semester 1', num: 1, label: 'Sem 1', year: '1st Year' },
    { name: 'Semester 2', num: 2, label: 'Sem 2', year: '1st Year' },
    { name: 'Semester 3', num: 3, label: 'Sem 3', year: '2nd Year' },
    { name: 'Semester 4', num: 4, label: 'Sem 4', year: '2nd Year' },
    { name: 'Semester 5', num: 5, label: 'Sem 5', year: '3rd Year' },
    { name: 'Semester 6', num: 6, label: 'Sem 6', year: '3rd Year' },
    { name: 'Semester 7', num: 7, label: 'Sem 7', year: '4th Year' },
    { name: 'Semester 8', num: 8, label: 'Sem 8', year: '4th Year' }
  ];

  // Quick enroll a curriculum subject as regular course (0 marks default)
  const handleQuickEnroll = (sub) => {
    const yearNum = Math.ceil(sub.semesterNum / 2);
    const newSub = {
      id: `SUB-${sub.code.replace(/[^a-zA-Z0-9]/g, '')}`,
      code: sub.code,
      name: sub.name,
      course: studentCourse,
      academicYear: `${yearNum === 1 ? '1st' : yearNum === 2 ? '2nd' : yearNum === 3 ? '3rd' : '4th'} Year`,
      semester: sub.semesterName || `Semester ${sub.semesterNum}`,
      semesterNum: sub.semesterNum,
      semesterType: sub.semesterNum % 2 !== 0 ? 'Odd' : 'Even',
      type: sub.type || 'Core',
      faculty: 'Department Professor',
      enrollmentType: 'Regular',
      isRepeat: false,
      isBacklog: false,
      repeatExamStatus: 'Not Applicable',
      examType: 'Both',
      midsemMarks: null,
      midsemMax: 50,
      midsemStatus: 'Pending Result',
      endsemMarks: null,
      endsemMax: 100,
      endsemStatus: 'Eligible',
      status: 'Currently Enrolled (Active)',
      isCurrentSemester: sub.semesterName === currentSemester || `Semester ${sub.semesterNum}` === currentSemester
    };
    onEnrollSubject(newSub);
  };

  // Open "Add subjects" modal with preselected subject or first available
  const handleOpenAddBacklogModal = (sub = null) => {
    if (sub) {
      setBacklogModalSubject({
        code: sub.code,
        name: sub.name,
        isCustom: false,
        reason: 'Repeat due to Marks',
        otherReasonText: '',
        repeatExamStatus: 'Preparing',
        midsemMarks: sub.midsemMarks !== null && sub.midsemMarks !== undefined ? sub.midsemMarks : '',
        endsemMarks: sub.endsemMarks !== null && sub.endsemMarks !== undefined ? sub.endsemMarks : ''
      });
    } else {
      // Find the first unenrolled subject in this semester, or first curriculum subject
      const notEnrolled = semesterCurriculum.find(
        (s) => !enrolledSubjects.some((e) => e.code === s.code)
      );
      const chosen = notEnrolled || semesterCurriculum[0] || { code: '', name: '' };
      setBacklogModalSubject({
        code: chosen.code,
        name: chosen.name,
        isCustom: false,
        reason: 'Repeat due to Marks',
        otherReasonText: '',
        repeatExamStatus: 'Preparing',
        midsemMarks: '',
        endsemMarks: ''
      });
    }
    setIsAddBacklogModalOpen(true);
  };

  // Save the Backlog Subject from the Modal
  const handleSaveBacklogSubject = (e) => {
    e.preventDefault();
    if (!backlogModalSubject.code.trim() || !backlogModalSubject.name.trim()) return;

    if (
      backlogModalSubject.reason === 'Repeat due to Other Reasons' &&
      !backlogModalSubject.otherReasonText.trim()
    ) {
      alert('Please specify the reason in the text box for "Repeat due to Other Reasons".');
      return;
    }

    const finalReason =
      backlogModalSubject.reason === 'Repeat due to Other Reasons'
        ? (backlogModalSubject.otherReasonText.trim()
            ? `Other: ${backlogModalSubject.otherReasonText.trim()}`
            : 'Repeat due to Other Reasons')
        : backlogModalSubject.reason;

    const yearNum = Math.ceil(selectedSemNum / 2);
    const subToEnroll = {
      id: `SUB-${backlogModalSubject.code.replace(/[^a-zA-Z0-9]/g, '')}`,
      code: backlogModalSubject.code.trim(),
      name: backlogModalSubject.name.trim(),
      course: studentCourse,
      academicYear: `${yearNum === 1 ? '1st' : yearNum === 2 ? '2nd' : yearNum === 3 ? '3rd' : '4th'} Year`,
      semester: selectedSemester,
      semesterNum: selectedSemNum,
      semesterType: selectedSemNum % 2 !== 0 ? 'Odd' : 'Even',
      type: 'Core',
      faculty: 'Department Professor',
      enrollmentType: 'Active Backlog Paper',
      isRepeat: true,
      isBacklog: true,
      backlogReason: finalReason,
      reasonCategory: backlogModalSubject.reason,
      otherReason: backlogModalSubject.otherReasonText.trim(),
      repeatExamStatus: backlogModalSubject.repeatExamStatus || 'Preparing',
      examType: 'Both',
      midsemMarks: backlogModalSubject.midsemMarks !== '' ? Number(backlogModalSubject.midsemMarks) : null,
      midsemMax: 50,
      midsemStatus: backlogModalSubject.reason.includes('Attendance')
        ? 'Attendance Shortage'
        : 'Backlog Internal',
      endsemMarks: backlogModalSubject.endsemMarks !== '' ? Number(backlogModalSubject.endsemMarks) : null,
      endsemMax: 100,
      endsemStatus: 'Backlog / Failed (<40)',
      status: `Active Backlog Paper (${selectedSemester})`,
      isCurrentSemester: selectedSemester === currentSemester
    };

    if (onEnrollAsBacklog) {
      onEnrollAsBacklog(subToEnroll);
    } else {
      onEnrollSubject(subToEnroll);
    }

    // Switch view to backlogs_only so the user sees the newly added paper immediately
    setViewFilter('backlogs_only');
    setIsAddBacklogModalOpen(false);
  };

  const handleSelectAllForThisSem = () => {
    const notEnrolled = semesterCurriculum.filter(
      (curr) => !enrolledSubjects.some((e) => e.code === curr.code)
    );
    if (notEnrolled.length === 0) return;

    const newItems = notEnrolled.map((sub) => {
      const yearNum = Math.ceil(sub.semesterNum / 2);
      return {
        id: `SUB-${sub.code.replace(/[^a-zA-Z0-9]/g, '')}`,
        code: sub.code,
        name: sub.name,
        course: studentCourse,
        academicYear: `${yearNum === 1 ? '1st' : yearNum === 2 ? '2nd' : yearNum === 3 ? '3rd' : '4th'} Year`,
        semester: sub.semesterName || `Semester ${sub.semesterNum}`,
        semesterNum: sub.semesterNum,
        semesterType: sub.semesterNum % 2 !== 0 ? 'Odd' : 'Even',
        type: sub.type || 'Core',
        faculty: 'Department Professor',
        enrollmentType: 'Regular',
        isRepeat: false,
        isBacklog: false,
        repeatExamStatus: 'Not Applicable',
        examType: 'Both',
        midsemMarks: null,
        midsemMax: 50,
        midsemStatus: 'Pending Result',
        endsemMarks: null,
        endsemMax: 100,
        endsemStatus: 'Eligible',
        status: 'Currently Enrolled (Active)',
        isCurrentSemester: sub.semesterName === currentSemester || `Semester ${sub.semesterNum}` === currentSemester
      };
    });

    onEnrollAllForSemester(newItems);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-6">
      {/* Header and Quick Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#13141b] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
            <BookOpen size={19} className="text-[#f5caa0]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                Academic Subjects & Backlog Selection
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
                  {enrolledSubjects.length} Enrolled
                </span>
                {totalBacklogsCount > 0 && (
                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-rose-500 text-white flex items-center gap-1 shadow-2xs animate-pulse">
                    <AlertCircle size={11} /> {totalBacklogsCount} Backlog{totalBacklogsCount > 1 ? 's' : ''} Active
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Select curriculum courses, record examination marks, or register backlogs by semester.
            </p>
          </div>
        </div>

        {/* Global Controls - Strictly on one single row, no awkward wrapping */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => handleOpenAddBacklogModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs whitespace-nowrap"
            title="Register a course as an active backlog with specific reason"
          >
            <AlertCircle size={14} /> Add Backlog Subject
          </button>

          <button
            onClick={() => onOpenCustomModal()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap"
            title="Enter a custom off-curriculum subject"
          >
            <Plus size={14} /> Custom Subject
          </button>

          {enrolledSubjects.length > 0 && (
            <button
              onClick={onClearAllSubjects}
              className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl transition cursor-pointer"
              title="Clear all courses to re-select from scratch"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Semester Navigation Tabs Bar (Semesters 1 to 8) */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <GraduationCap size={16} className="text-[#8a4816]" />
            Choose Semester to Navigate & Pick Backlog Papers:
          </label>
          <span className="text-[11px] text-slate-400 font-medium">
            Your current registered semester is <strong className="text-slate-800 font-bold">{currentSemester}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {semestersList.map((sem) => {
            const isSelected = selectedSemester === sem.name;
            const isStudentCurrent = currentSemester === sem.name;
            const isPrior = sem.num < currentSemNum;

            const enrolledInSem = enrolledSubjects.filter((s) => {
              const match = s.semester?.match(/([1-8])/);
              const num = match ? parseInt(match[1], 10) : s.semesterNum || 1;
              return num === sem.num || s.semester === sem.name;
            });

            const backlogCountForSem = enrolledInSem.filter(
              (s) =>
                s.isBacklog ||
                s.isRepeat ||
                s.enrollmentType?.includes('Backlog') ||
                s.endsemStatus?.includes('Backlog') ||
                s.endsemStatus?.includes('Failed')
            ).length;

            return (
              <button
                key={sem.name}
                type="button"
                onClick={() => setSelectedSemester(sem.name)}
                className={`p-2.5 rounded-2xl flex flex-col items-center justify-center transition cursor-pointer border text-center relative ${
                  isSelected
                    ? 'bg-[#13141b] text-white border-[#13141b] shadow-lg ring-2 ring-[#13141b]/15 scale-[1.02]'
                    : 'bg-[#fbfbfd] text-slate-700 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span className="text-xs font-black">{sem.label}</span>
                <span className={`text-[10px] mt-0.5 font-medium ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  {sem.year}
                </span>

                {/* Backlog Alert Badge on Semester Pill */}
                {backlogCountForSem > 0 ? (
                  <span
                    className={`mt-1 text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                      isSelected ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700 font-bold'
                    }`}
                  >
                    <AlertCircle size={9} />
                    {backlogCountForSem} Backlog{backlogCountForSem > 1 ? 's' : ''}
                  </span>
                ) : enrolledInSem.length > 0 ? (
                  <span
                    className={`mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {enrolledInSem.length} Enrolled
                  </span>
                ) : (
                  <span className={`mt-1 text-[9px] font-medium ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                    {isPrior ? 'Select Backlog' : '0 chosen'}
                  </span>
                )}

                {/* Current Enrolled Semester Pin */}
                {isStudentCurrent && (
                  <span
                    className={`absolute -top-1.5 right-1 text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter ${
                      isSelected ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-[#8a4816] border border-amber-300'
                    }`}
                  >
                    Current
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Context Banner based on Selected Semester */}
      {isPriorSemester ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#fdeedc] to-amber-50 border border-amber-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shrink-0 shadow-xs">
              <AlertCircle size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs sm:text-sm text-amber-950">
                  {selectedSemester} Backlog Selection (Prior Semester)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                  Prior Semester
                </span>
              </div>
              <p className="text-xs text-amber-900/80 mt-0.5">
                Have an uncleared paper from {selectedSemester}? Click <strong className="text-amber-950">+ Add as Backlog Paper</strong> or filter by <strong className="text-rose-700">Backlog only</strong> to add subjects with their specific reason (attendance, marks, or other reasons).
              </p>
            </div>
          </div>
        </div>
      ) : selectedSemNum === currentSemNum ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#caf0f8]/50 via-[#90e0ef]/20 to-white border border-[#90e0ef] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#03045e] text-white flex items-center justify-center font-black shrink-0">
              <GraduationCap size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs sm:text-sm text-[#03045e]">
                  {selectedSemester} Curriculum (Your Current Enrolled Semester)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#caf0f8] text-[#0077b6]">
                  Current Sem
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose your regular courses or add repeat/backlog papers for this semester. All marks default to 0 so you can record your exact scores.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
            {selectedSemNum}
          </div>
          <div>
            <span className="font-extrabold text-xs text-slate-800">{selectedSemester} Courses</span>
            <p className="text-xs text-slate-500">Upcoming curriculum modules for academic advancement.</p>
          </div>
        </div>
      )}

      {/* Action Strip with Filter Pills & "Add subjects" Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#f4f9fd] border border-[#caf0f8]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-black text-xs text-[#03045e] mr-1">
            {selectedSemester}:
          </span>
          <button
            onClick={() => setViewFilter('all')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewFilter === 'all'
                ? 'bg-[#03045e] text-white'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            All Courses ({semesterCurriculum.length})
          </button>

          {/* BACKLOG ONLY BUTTON */}
          <button
            onClick={() => setViewFilter('backlogs_only')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              viewFilter === 'backlogs_only'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            <AlertCircle size={12} /> Backlog only
          </button>

          {/* ADD SUBJECTS BUTTON (Appears when in 'Backlog only' view as requested) */}
          {viewFilter === 'backlogs_only' && (
            <button
              onClick={() => handleOpenAddBacklogModal()}
              className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs animate-pulse"
              title="Add a subject with reason for backlog"
            >
              <Plus size={13} /> Add subjects
            </button>
          )}

          <button
            onClick={() => setViewFilter('enrolled_only')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewFilter === 'enrolled_only'
                ? 'bg-[#0077b6] text-white'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            My Chosen ({enrolledInThisSemester.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {semesterCurriculum.length > 0 && enrolledInThisSemester.length < semesterCurriculum.length && (
            <button
              onClick={handleSelectAllForThisSem}
              className="px-3.5 py-1.5 rounded-xl bg-[#caf0f8] hover:bg-[#90e0ef]/60 text-[#0077b6] text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-[#90e0ef] whitespace-nowrap shadow-2xs"
            >
              <Check size={13} /> Select All Courses
            </button>
          )}

          <input
            type="text"
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs outline-none focus:border-slate-400 w-36 sm:w-44"
          />
        </div>
      </div>

      {/* Grid of Subjects for the chosen semester */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {displayedCurriculum.length === 0 ? (
          viewFilter === 'backlogs_only' ? (
            /* Dedicated Empty State for "Backlog only" with explicit "Add subjects" button */
            <div className="col-span-full p-8 text-center bg-rose-50/40 rounded-3xl border border-rose-200/80 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold mx-auto shadow-xs">
                <AlertCircle size={24} />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">
                No Backlog Subjects in {selectedSemester} Yet
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You haven't recorded any backlog papers for {selectedSemester}. Click <strong>Add subjects</strong> below to choose a course and select the reason (attendance, marks, or other reasons).
              </p>
              <button
                onClick={() => handleOpenAddBacklogModal()}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer inline-flex items-center gap-2 shadow-md hover:scale-[1.02]"
              >
                <Plus size={16} /> Add subjects
              </button>
            </div>
          ) : (
            <div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-400">No subjects matching your selection for {selectedSemester}.</p>
            </div>
          )
        ) : (
          displayedCurriculum.map((sub) => {
            const enrolledMatch = enrolledSubjects.find((e) => e.code === sub.code);
            const isEnrolled = !!enrolledMatch;

            const hasMid = enrolledMatch && enrolledMatch.midsemMarks !== null && enrolledMatch.midsemMarks !== undefined;
            const hasEnd = enrolledMatch && enrolledMatch.endsemMarks !== null && enrolledMatch.endsemMarks !== undefined;
            const isRepeat = enrolledMatch?.isRepeat || enrolledMatch?.enrollmentType?.includes('Repeat');
            const isBacklog =
              enrolledMatch?.isBacklog ||
              enrolledMatch?.enrollmentType?.includes('Backlog') ||
              enrolledMatch?.endsemStatus?.includes('Backlog') ||
              enrolledMatch?.endsemStatus?.includes('Failed');

            const reasonText = enrolledMatch?.backlogReason || (isBacklog ? 'Repeat due to Marks' : null);

            return (
              <div
                key={sub.code}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isEnrolled
                    ? isBacklog || isRepeat
                      ? 'bg-[#fffcf5] border-amber-300 shadow-sm ring-1 ring-amber-300/50'
                      : 'bg-[#f4faf6] border-emerald-300 shadow-2xs'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono font-black text-xs text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                      {sub.code}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {sub.type || 'Core'}
                      </span>
                      {isEnrolled && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isBacklog
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : isRepeat
                              ? 'bg-amber-100 text-[#8a4816] border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          <CheckCircle2 size={11} />
                          {isBacklog ? 'Active Backlog Paper' : isRepeat ? 'Repeat Exam' : 'Enrolled'}
                        </span>
                      )}
                    </div>
                  </div>

                  <h5 className="font-bold text-xs text-slate-900 mt-2 line-clamp-2 leading-snug">
                    {sub.name}
                  </h5>

                  {/* If enrolled as backlog: prominent reason badge */}
                  {isEnrolled && reasonText && (
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200/70">
                      <AlertCircle size={11} className="text-rose-600 shrink-0" />
                      <span className="truncate">Reason: {reasonText}</span>
                    </div>
                  )}

                  {/* If enrolled, show marks overview & repeat progress */}
                  {isEnrolled && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-white/90 p-1.5 rounded-xl border border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">Mid-Sem Marks</span>
                          <span className="font-extrabold text-slate-800">
                            {hasMid ? `${enrolledMatch.midsemMarks} / ${enrolledMatch.midsemMax || 50}` : '0 / 50 (Not entered)'}
                          </span>
                        </div>
                        <div className="bg-white/90 p-1.5 rounded-xl border border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">End-Sem Marks</span>
                          <span className={`font-extrabold ${isBacklog ? 'text-rose-700' : 'text-[#1e40af]'}`}>
                            {hasEnd ? `${enrolledMatch.endsemMarks} / ${enrolledMatch.endsemMax || 100}` : (isBacklog ? '0 / 100 (Backlog)' : '0 / 100 (Pending)')}
                          </span>
                        </div>
                      </div>

                      {(isBacklog || isRepeat) && (
                        <div className="flex items-center justify-between text-[10px] bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200 text-amber-900">
                          <span className="font-bold">Repeat Exam Status:</span>
                          <span className="font-black px-1.5 py-0.2 rounded-md bg-white border border-amber-300">
                            {enrolledMatch.repeatExamStatus || 'Preparing'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-2.5 border-t border-slate-100 flex flex-col gap-2">
                  {isEnrolled ? (
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => onEditSubject(enrolledMatch)}
                        className="flex-1 py-1.5 px-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Edit3 size={12} className="text-[#8a4816]" />
                        Enter / Edit Marks
                      </button>
                      <button
                        onClick={() => onRemoveSubject(sub.code)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Remove subject"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {/* Prominent Backlog Option -> Opens Add Backlog Modal with reason dropdown */}
                      <button
                        onClick={() => handleOpenAddBacklogModal(sub)}
                        className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        title="Add this subject as an active backlog and select reason"
                      >
                        <AlertCircle size={13} />
                        + Add as Backlog Paper
                      </button>

                      {/* Secondary Options: Regular Course / Enter Specific Marks */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleQuickEnroll(sub)}
                          className="flex-1 py-1 px-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus size={12} /> Regular Course
                        </button>
                        <button
                          onClick={() =>
                            onEditSubject({
                              ...sub,
                              semester: sub.semesterName || `Semester ${sub.semesterNum}`,
                              enrollmentType: isPriorSemester ? 'Active Backlog Paper' : 'Regular'
                            })
                          }
                          className="py-1 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 text-[10px] font-bold transition cursor-pointer"
                          title="Choose and enter exact marks directly"
                        >
                          + Custom Marks
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: ADD BACKLOG SUBJECT WITH REASON DROPDOWN & OTHER */}
      {/* ======================================================== */}
      {isAddBacklogModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto custom-scrollbar space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold shadow-xs">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">Add Backlog Subject</h4>
                  <p className="text-xs text-slate-500">
                    Register a backlog course for <strong>{selectedSemester}</strong> with its specific reason
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddBacklogModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBacklogSubject} className="space-y-4 text-xs">
              {/* Subject Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Select Subject <span className="text-rose-500">*</span>
                </label>
                <select
                  value={backlogModalSubject.isCustom ? 'CUSTOM' : backlogModalSubject.code}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'CUSTOM') {
                      setBacklogModalSubject({
                        ...backlogModalSubject,
                        code: '',
                        name: '',
                        isCustom: true
                      });
                    } else {
                      const found = semesterCurriculum.find((s) => s.code === val);
                      if (found) {
                        setBacklogModalSubject({
                          ...backlogModalSubject,
                          code: found.code,
                          name: found.name,
                          isCustom: false
                        });
                      }
                    }
                  }}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-xs font-bold text-slate-800"
                >
                  <optgroup label={`${selectedSemester} Curriculum Subjects`}>
                    {semesterCurriculum.map((sub) => (
                      <option key={sub.code} value={sub.code}>
                        {sub.code} — {sub.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Other">
                    <option value="CUSTOM">+ Enter Custom Subject Code & Title</option>
                  </optgroup>
                </select>
              </div>

              {/* Custom Code and Name Inputs if Custom Selected */}
              {backlogModalSubject.isCustom && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Subject Code</label>
                    <input
                      type="text"
                      required
                      value={backlogModalSubject.code}
                      onChange={(e) => setBacklogModalSubject({ ...backlogModalSubject, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. BCA201"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-mono font-bold text-xs outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Subject Full Name</label>
                    <input
                      type="text"
                      required
                      value={backlogModalSubject.name}
                      onChange={(e) => setBacklogModalSubject({ ...backlogModalSubject, name: e.target.value })}
                      placeholder="e.g. Discrete Mathematics"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-bold text-xs outline-none"
                    />
                  </div>
                </div>
              )}

              {/* REASON DROPDOWN (As specifically requested by user) */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                <div>
                  <label className="font-extrabold text-slate-800 block mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-amber-950 font-bold">
                      <AlertCircle size={15} className="text-amber-600" />
                      Reason for Backlog (Select Reason) <span className="text-rose-500">*</span>
                    </span>
                    <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                      Required
                    </span>
                  </label>
                  <select
                    value={backlogModalSubject.reason}
                    onChange={(e) => setBacklogModalSubject({ ...backlogModalSubject, reason: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white border border-amber-300 font-bold text-xs text-slate-800 outline-none shadow-2xs"
                  >
                    <option value="Repeat due to Attendance">Repeat due to Attendance</option>
                    <option value="Repeat due to Marks">Repeat due to Marks</option>
                    <option value="Repeat due to Other Reasons">Repeat due to Other Reasons</option>
                  </select>
                </div>

                {/* CONDITIONAL BOX: If Other Selected (As specifically requested by user) */}
                {backlogModalSubject.reason === 'Repeat due to Other Reasons' && (
                  <div className="space-y-1 pt-1.5 animate-in fade-in">
                    <label className="font-bold text-slate-800 block mb-1 text-[11px]">
                      Specify Reason for Backlog (Other) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={backlogModalSubject.otherReasonText}
                      onChange={(e) => setBacklogModalSubject({ ...backlogModalSubject, otherReasonText: e.target.value })}
                      placeholder="Write reason of giving backlog in others (e.g. medical leave during exams, timetable clash, missed practical submission)..."
                      className="w-full p-3 rounded-xl bg-white border border-amber-400 text-xs text-slate-900 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* Repeat Exam Progress */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Repeat Examination Status</label>
                <select
                  value={backlogModalSubject.repeatExamStatus}
                  onChange={(e) => setBacklogModalSubject({ ...backlogModalSubject, repeatExamStatus: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-xs text-slate-800 outline-none"
                >
                  <option value="Preparing">Preparing for Repeat Exam</option>
                  <option value="Scheduled">Repeat Exam Scheduled / Hall Ticket Issued</option>
                  <option value="Appeared">Appeared for Exam (Awaiting Evaluation)</option>
                  <option value="Cleared">Cleared via Repeat Exam</option>
                </select>
              </div>

              {/* Optional Marks Inputs (defaults to 0 / blank) */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Mid-Sem Score <span className="text-[10px] text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    placeholder="e.g. 0 (or blank)"
                    value={backlogModalSubject.midsemMarks}
                    onChange={(e) => setBacklogModalSubject({ ...backlogModalSubject, midsemMarks: e.target.value })}
                    className="w-full p-2 rounded-xl bg-white border border-slate-200 font-black text-xs text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    End-Sem Score <span className="text-[10px] text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 0 (or blank)"
                    value={backlogModalSubject.endsemMarks}
                    onChange={(e) => setBacklogModalSubject({ ...backlogModalSubject, endsemMarks: e.target.value })}
                    className="w-full p-2 rounded-xl bg-white border border-slate-200 font-black text-xs text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddBacklogModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Check size={14} /> Add Backlog Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
