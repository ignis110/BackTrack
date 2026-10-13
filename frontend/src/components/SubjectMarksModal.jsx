import React, { useState, useMemo, useEffect } from 'react';
import { X, BookOpen, Sparkles, Check, AlertCircle } from 'lucide-react';
import { BCA_CURRICULUM } from '../utils/backlogStore';

export default function SubjectMarksModal({
  isOpen,
  onClose,
  initialSubject = null,
  onSave,
  studentCourse = 'Bachelor of Computer Applications (BCA)',
  defaultSemester = 'Semester 1'
}) {
  if (!isOpen) return null;

  const [semester, setSemester] = useState(
    initialSubject?.semester || defaultSemester || 'Semester 1'
  );
  const [selectedCurriculumCode, setSelectedCurriculumCode] = useState(
    initialSubject?.code || ''
  );
  const [code, setCode] = useState(initialSubject?.code || '');
  const [name, setName] = useState(initialSubject?.name || '');
  const [type, setType] = useState(initialSubject?.type || 'Core');
  const [faculty, setFaculty] = useState(initialSubject?.faculty || 'Department Professor');

  // Examination Type dropdown: 'Both', 'Mid-Sem', 'End-Sem'
  const [examType, setExamType] = useState(() => {
    if (initialSubject?.examType) return initialSubject.examType;
    if (initialSubject) {
      const hasMid = initialSubject.midsemMarks !== null && initialSubject.midsemMarks !== undefined;
      const hasEnd = initialSubject.endsemMarks !== null && initialSubject.endsemMarks !== undefined;
      if (hasMid && !hasEnd) return 'Mid-Sem';
      if (!hasMid && hasEnd) return 'End-Sem';
    }
    return 'Both';
  });

  // Marks inputs
  const [midsemMarks, setMidsemMarks] = useState(
    initialSubject?.midsemMarks !== null && initialSubject?.midsemMarks !== undefined
      ? initialSubject.midsemMarks
      : 40
  );
  const [midsemMax, setMidsemMax] = useState(initialSubject?.midsemMax || 50);
  const [midsemStatus, setMidsemStatus] = useState(initialSubject?.midsemStatus || 'Passed');

  const [endsemMarks, setEndsemMarks] = useState(
    initialSubject?.endsemMarks !== null && initialSubject?.endsemMarks !== undefined
      ? initialSubject.endsemMarks
      : 82
  );
  const [endsemMax, setEndsemMax] = useState(initialSubject?.endsemMax || 100);
  const [endsemStatus, setEndsemStatus] = useState(initialSubject?.endsemStatus || 'Eligible');

  const [errorMsg, setErrorMsg] = useState('');

  // Curriculum subjects matching the currently selected semester
  const semesterSubjects = useMemo(() => {
    const match = semester.match(/([1-6])/);
    const semNum = match ? parseInt(match[1], 10) : 1;
    return BCA_CURRICULUM.filter((s) => s.semesterNum === semNum);
  }, [semester]);

  // Handle changing semester
  const handleSemesterChange = (newSem) => {
    setSemester(newSem);
    const match = newSem.match(/([1-6])/);
    const semNum = match ? parseInt(match[1], 10) : 1;
    const subs = BCA_CURRICULUM.filter((s) => s.semesterNum === semNum);
    if (subs.length > 0) {
      const first = subs[0];
      setSelectedCurriculumCode(first.code);
      setCode(first.code);
      setName(first.name);
      setType(first.type || 'Core');
    } else {
      setSelectedCurriculumCode('CUSTOM');
    }
  };

  // Handle selecting subject from the curriculum dropdown
  const handleCurriculumSelect = (codeVal) => {
    setSelectedCurriculumCode(codeVal);
    if (codeVal === 'CUSTOM') {
      setCode('');
      setName('');
      setType('Elective');
    } else {
      const found = semesterSubjects.find((s) => s.code === codeVal);
      if (found) {
        setCode(found.code);
        setName(found.name);
        setType(found.type || 'Core');
      }
    }
  };

  // Initialize or align on open
  useEffect(() => {
    if (!initialSubject && semesterSubjects.length > 0 && !code) {
      const first = semesterSubjects[0];
      setSelectedCurriculumCode(first.code);
      setCode(first.code);
      setName(first.name);
      setType(first.type || 'Core');
    }
  }, [semesterSubjects, initialSubject, code]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!code.trim() || !name.trim()) {
      setErrorMsg('Please enter both a Subject Code and Subject Name.');
      return;
    }

    const midNum = Number(midsemMarks);
    const midMaxNum = Number(midsemMax) || 50;
    const endNum = Number(endsemMarks);
    const endMaxNum = Number(endsemMax) || 100;

    if (examType === 'Mid-Sem' || examType === 'Both') {
      if (midNum < 0 || midNum > midMaxNum) {
        setErrorMsg(`Mid-Semester marks must be between 0 and ${midMaxNum}.`);
        return;
      }
    }

    if (examType === 'End-Sem' || examType === 'Both') {
      if (endNum < 0 || endNum > endMaxNum) {
        setErrorMsg(`End-Semester marks must be between 0 and ${endMaxNum}.`);
        return;
      }
    }

    const match = semester.match(/([1-6])/);
    const semNum = match ? parseInt(match[1], 10) : 1;
    const yearNum = Math.ceil(semNum / 2);

    const hasMid = examType === 'Mid-Sem' || examType === 'Both';
    const hasEnd = examType === 'End-Sem' || examType === 'Both';

    const subjectData = {
      id: initialSubject?.id || `SUB-${code.replace(/[^a-zA-Z0-9]/g, '') || Date.now()}`,
      code: code.trim(),
      name: name.trim(),
      course: studentCourse,
      academicYear: `${yearNum === 1 ? '1st' : yearNum === 2 ? '2nd' : '3rd'} Year`,
      semester: semester,
      semesterNum: semNum,
      semesterType: semNum % 2 !== 0 ? 'Odd' : 'Even',
      type: type || 'Core',
      faculty: faculty || 'Department Professor',
      examType: examType,
      midsemMarks: hasMid ? midNum : null,
      midsemMax: hasMid ? midMaxNum : 50,
      midsemStatus: hasMid ? midsemStatus : 'N/A',
      endsemMarks: hasEnd ? endNum : null,
      endsemMax: hasEnd ? endMaxNum : 100,
      endsemStatus: hasEnd ? endsemStatus : 'Pending',
      status: hasEnd
        ? (endsemStatus === 'Passed'
            ? 'Completed & Passed'
            : endsemStatus === 'Backlog' || endsemStatus === 'Backlog / Failed'
            ? 'Backlog / Needs Retest'
            : 'Eligible for End-Sem Exam')
        : (midsemStatus === 'Passed' ? 'Mid-Sem Cleared' : 'Mid-Sem Evaluated'),
      isCurrentSemester: semester === defaultSemester
    };

    onSave(subjectData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fdeedc] text-[#8a4816] flex items-center justify-center font-bold shadow-xs">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                {initialSubject ? 'Edit Subject & Examination Marks' : 'Build Profile: Add Subject & Marks'}
              </h3>
              <p className="text-xs text-slate-500">
                Select your semester, choose the subject, and enter your Mid-Sem & End-Sem marks.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Step 1: Semester Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                1. Select Semester <span className="text-rose-500">*</span>
              </label>
              <select
                value={semester}
                onChange={(e) => handleSemesterChange(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white text-xs font-bold text-slate-800"
              >
                <option value="Semester 1">Semester 1 (1st Year • Odd)</option>
                <option value="Semester 2">Semester 2 (1st Year • Even)</option>
                <option value="Semester 3">Semester 3 (2nd Year • Odd)</option>
                <option value="Semester 4">Semester 4 (2nd Year • Even)</option>
                <option value="Semester 5">Semester 5 (3rd Year • Odd)</option>
                <option value="Semester 6">Semester 6 (3rd Year • Even)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                2. Select Subject for {semester} <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedCurriculumCode}
                onChange={(e) => handleCurriculumSelect(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white text-xs font-bold text-slate-800"
              >
                <optgroup label={`Official ${semester} Curriculum`}>
                  {semesterSubjects.map((sub) => (
                    <option key={sub.code} value={sub.code}>
                      {sub.code} - {sub.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Other">
                  <option value="CUSTOM">+ Enter Custom Subject Manually</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* Subject Code & Name details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Subject Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. BCA101-1"
                className="w-full p-2.5 rounded-xl bg-white border border-slate-200 outline-none font-mono font-bold text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Subject Full Title</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Data Structures Using C++"
                className="w-full p-2.5 rounded-xl bg-white border border-slate-200 outline-none font-bold text-xs"
              />
            </div>
          </div>

          {/* Step 3: Examination Selection Dropdown (explicitly requested) */}
          <div>
            <label className="font-bold text-slate-800 block mb-1 flex items-center justify-between">
              <span>3. Examination Type (Exam Dropdown) <span className="text-rose-500">*</span></span>
              <span className="text-[10px] text-slate-400 font-normal">Choose which examinations to record marks for</span>
            </label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#fbf9fe] border border-purple-200 text-purple-900 font-extrabold text-xs outline-none focus:bg-white"
            >
              <option value="Both">Both Examinations (Mid-Semester & End-Semester)</option>
              <option value="Mid-Sem">Mid-Semester Examination Only (Mid-Sem)</option>
              <option value="End-Sem">End-Semester Examination Only (End-Sem)</option>
            </select>
          </div>

          {/* Marks Input Section */}
          <div className="space-y-3 pt-1">
            {/* Mid-Semester Section */}
            {(examType === 'Mid-Sem' || examType === 'Both') && (
              <div className="p-4 rounded-2xl bg-[#e9f2fc]/60 border border-[#bedafb] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-[#1e40af] flex items-center gap-1.5 uppercase tracking-wide">
                    <Sparkles size={14} /> Mid-Semester Examination Marks
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#dce9fb] text-[#1e40af]">
                    Internal / Continuous Assessment
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Mid-Sem Score</label>
                    <input
                      type="number"
                      min="0"
                      max={midsemMax}
                      required
                      value={midsemMarks}
                      onChange={(e) => setMidsemMarks(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 outline-none font-black text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Max Total Marks</label>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={midsemMax}
                      onChange={(e) => setMidsemMax(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 outline-none font-bold text-xs text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Mid-Sem Standing</label>
                    <select
                      value={midsemStatus}
                      onChange={(e) => setMidsemStatus(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 outline-none text-xs font-bold text-slate-800"
                    >
                      <option value="Passed">Passed (Cleared)</option>
                      <option value="Distinction">Distinction (Exemplary)</option>
                      <option value="Backlog / Needs Retest">Backlog / Retest Required</option>
                      <option value="Pending Result">Pending Result</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* End-Semester Section */}
            {(examType === 'End-Sem' || examType === 'Both') && (
              <div className="p-4 rounded-2xl bg-[#f4e8fd]/60 border border-[#e8c7fb] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-[#6b21a8] flex items-center gap-1.5 uppercase tracking-wide">
                    <BookOpen size={14} /> End-Semester Examination Marks
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ecd2fc] text-[#6b21a8]">
                    Main University Exam
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">End-Sem Score</label>
                    <input
                      type="number"
                      min="0"
                      max={endsemMax}
                      required
                      value={endsemMarks}
                      onChange={(e) => setEndsemMarks(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 outline-none font-black text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Max Total Marks</label>
                    <input
                      type="number"
                      min="20"
                      max="200"
                      value={endsemMax}
                      onChange={(e) => setEndsemMax(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 outline-none font-bold text-xs text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">End-Sem Standing</label>
                    <select
                      value={endsemStatus}
                      onChange={(e) => setEndsemStatus(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 outline-none text-xs font-bold text-slate-800"
                    >
                      <option value="Eligible">Eligible for Exam</option>
                      <option value="Passed">Passed (Semester Cleared)</option>
                      <option value="Backlog / Failed">Backlog / Repeat Exam</option>
                      <option value="Pending">Pending Evaluation</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Extra Info: Faculty & Subject Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Faculty In-Charge</label>
              <input
                type="text"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="Department Professor"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Subject Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none text-xs font-bold"
              >
                <option value="Core">Core</option>
                <option value="Elective">Elective</option>
                <option value="Skill Enhancement">Skill Enhancement</option>
                <option value="Ability Enhancement">Ability Enhancement</option>
                <option value="Value Added">Value Added</option>
                <option value="Practical">Practical</option>
                <option value="Project">Project</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#13141b] text-white rounded-xl font-bold hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Check size={14} />
              Save Subject & Marks
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
