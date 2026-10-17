// Shared Backlog, Student, Faculty, Subject & User Store with localStorage synchronization
const STORAGE_KEY = 'backtrack_backlog_records';
const STORAGE_KEY_STUDENTS = 'backtrack_students';
const STORAGE_KEY_TEACHERS = 'backtrack_teachers';
const STORAGE_KEY_SUBJECTS = 'backtrack_subjects';
const STORAGE_KEY_COURSES = 'backtrack_courses';
const STORAGE_KEY_USERS = 'backtrack_users';
const STORAGE_KEY_REQUESTS = 'backtrack_requests';
const STORAGE_KEY_NOTIFICATIONS = 'backtrack_notifications';

// Clean slate flag to automatically purge any stale mock demo records in user browser
const DEMO_CLEARED_FLAG = 'backtrack_clean_scratch_v3';
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem(DEMO_CLEARED_FLAG) !== 'true') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY_STUDENTS);
      localStorage.removeItem(STORAGE_KEY_TEACHERS);
      localStorage.removeItem(STORAGE_KEY_SUBJECTS);
      localStorage.removeItem(STORAGE_KEY_COURSES);
      localStorage.removeItem(STORAGE_KEY_USERS);
      localStorage.removeItem(STORAGE_KEY_REQUESTS);
      localStorage.removeItem(STORAGE_KEY_NOTIFICATIONS);
      localStorage.removeItem('currentUser');
      localStorage.setItem(DEMO_CLEARED_FLAG, 'true');
    }

    // Auto-sanitize session if admin had student credentials or student session has faculty email
    const rawSession = localStorage.getItem('currentUser');
    if (rawSession) {
      const parsedSession = JSON.parse(rawSession);
      if (
        (parsedSession.role === 'admin' || parsedSession.role === 'Administrator') &&
        (parsedSession.id === '24215107' ||
          parsedSession.name?.toLowerCase().includes('anirudh') ||
          parsedSession.email?.toLowerCase().includes('anirudh'))
      ) {
        localStorage.setItem(
          'currentUser',
          JSON.stringify({
            username: 'admin',
            name: 'Exam Controller',
            id: 'ADM-001',
            role: 'admin',
            email: 'admin@univ.edu',
            department: 'Office of Academic Affairs & Examination Cell',
            designation: 'Chief Academic Controller & Administrator',
            phone: '+91 98765 00001',
            loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
        );
      } else if (
        parsedSession.role === 'student' &&
        (parsedSession.email?.toLowerCase().includes('kochoushinobu0069') ||
          parsedSession.username?.toLowerCase().includes('kochoushinobu0069') ||
          parsedSession.email?.toLowerCase().includes('faculty') ||
          parsedSession.id?.toLowerCase().includes('kochoushinobu0069'))
      ) {
        // Purge contaminated student session where faculty credentials were used
        localStorage.removeItem('currentUser');
      }

      // Ensure no fake auto-assigned marks exist on student profiles - marks must be entered by students
      const MARKS_SANITIZED_FLAG = 'backtrack_zero_marks_v3';
      if (localStorage.getItem(MARKS_SANITIZED_FLAG) !== 'true') {
        if (parsedSession.role === 'student') {
          parsedSession.cgpa = 0.0;
          parsedSession.midsemAverage = 0;
          if (Array.isArray(parsedSession.enrolledSubjects)) {
            parsedSession.enrolledSubjects = parsedSession.enrolledSubjects.map((s) => ({
              ...s,
              midsemMarks: null,
              endsemMarks: null,
              midsemStatus: 'Not Entered',
              endsemStatus: 'Pending'
            }));
          }
          localStorage.setItem('currentUser', JSON.stringify(parsedSession));
        }

        const rawStudents = localStorage.getItem(STORAGE_KEY_STUDENTS);
        if (rawStudents) {
          try {
            const stus = JSON.parse(rawStudents);
            if (Array.isArray(stus)) {
              const updated = stus.map((s) => ({
                ...s,
                cgpa: 0.0,
                midsemAverage: 0,
                enrolledSubjects: Array.isArray(s.enrolledSubjects)
                  ? s.enrolledSubjects.map((sub) => ({
                      ...sub,
                      midsemMarks: null,
                      endsemMarks: null,
                      midsemStatus: 'Not Entered',
                      endsemStatus: 'Pending'
                    }))
                  : []
              }));
              localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(updated));
            }
          } catch {}
        }
        localStorage.setItem(MARKS_SANITIZED_FLAG, 'true');
      }
    }
  } catch (e) {
    console.warn('LocalStorage reset error:', e);
  }
}

// All initial datasets start 100% EMPTY so the user can build everything from scratch
export const INITIAL_BACKLOG_RECORDS = [];
export const DEMO_STUDENTS = [];

// ==========================================
// BACKLOG RECORDS CRUD
// ==========================================
export function getBacklogRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let records = [];
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        records = parsed;
      }
    }

    // Auto-sync any backlog papers from students' enrolled subjects
    const rawStudents = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (rawStudents) {
      const allStudents = JSON.parse(rawStudents);
      if (Array.isArray(allStudents)) {
        let added = false;
        allStudents.forEach((st) => {
          if (Array.isArray(st.enrolledSubjects)) {
            st.enrolledSubjects.forEach((sub) => {
              const isBacklog =
                sub.isBacklog ||
                sub.isRepeat ||
                sub.enrollmentType?.includes('Backlog') ||
                sub.enrollmentType?.includes('Repeat') ||
                sub.status?.includes('Backlog') ||
                sub.endsemStatus?.includes('Backlog') ||
                sub.midsemStatus?.includes('Backlog') ||
                (sub.endsemMarks !== null && sub.endsemMarks !== undefined && Number(sub.endsemMarks) < 40 && sub.examType !== 'Mid-Sem') ||
                (sub.midsemMarks !== null && sub.midsemMarks !== undefined && Number(sub.midsemMarks) < 18 && sub.examType === 'Mid-Sem');

              if (isBacklog) {
                const exists = records.some(
                  (r) =>
                    (r.usn === st.usn || r.studentName === st.name) &&
                    (r.subjectCode === sub.code || r.subjectName === sub.name)
                );
                if (!exists) {
                  records.push({
                    id: `BL-${st.usn || 'ST'}-${(sub.code || 'SUB').replace(/[^a-zA-Z0-9]/g, '')}`,
                    studentName: st.name,
                    usn: st.usn || st.id,
                    course: st.course || 'Bachelor of Computer Applications (BCA)',
                    semester: sub.semester || st.semester || 'Semester 1',
                    subjectCode: sub.code,
                    subjectName: sub.name,
                    facultyInCharge: sub.faculty || 'Department Professor',
                    reason: sub.endsemStatus?.includes('Backlog')
                      ? 'Scored below cutoff in End-Semester Exam'
                      : 'Continuous Evaluation Shortfall',
                    clearanceStatus: 'Pending Clearance',
                    metTeacher: false,
                    assignmentsCompleted: 'Pending',
                    teacherConsultation: 'Pending Guidance',
                    repeatExamStatus: 'Preparing',
                    resultStatus: 'Awaiting result',
                    lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  });
                  added = true;
                }
              }
            });
          }
        });
        if (added) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
        }
      }
    }

    return records;
  } catch (e) {
    console.warn('Error reading backlog records from localStorage', e);
  }
  return [];
}

export function saveBacklogRecords(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('backtrack_backlog_updated', { detail: records }));
    }
  } catch (e) {
    console.warn('Error saving backlog records to localStorage', e);
  }
}

export function addBacklogRecord(newRecord) {
  const current = getBacklogRecords();
  const recordWithId = {
    id: newRecord.id || `BL-${Date.now().toString().slice(-4)}`,
    clearanceStatus: newRecord.clearanceStatus || 'Pending Clearance',
    metTeacher: newRecord.metTeacher || false,
    assignmentsCompleted: newRecord.assignmentsCompleted || 'Pending',
    teacherConsultation: newRecord.teacherConsultation || 'Pending Guidance',
    repeatExamStatus: newRecord.repeatExamStatus || 'Preparing',
    resultStatus: newRecord.resultStatus || 'Awaiting result',
    lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
      new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    studentRemarks: newRecord.studentRemarks || '',
    facultyNotes: newRecord.facultyNotes || '',
    facultyClearedDate: null,
    ...newRecord
  };
  const updated = [recordWithId, ...current];
  saveBacklogRecords(updated);
  return updated;
}

export function deleteBacklogRecord(recordId) {
  const current = getBacklogRecords();
  const updated = current.filter(r => r.id !== recordId);
  saveBacklogRecords(updated);
  return updated;
}

export function updateStudentBacklogProgress(recordId, updatePayload) {
  const current = getBacklogRecords();
  const now = new Date();
  const timeString = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
    now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const updated = current.map((item) => {
    if (item.id === recordId) {
      return {
        ...item,
        ...updatePayload,
        lastUpdated: timeString
      };
    }
    return item;
  });

  saveBacklogRecords(updated);
  return updated;
}

export function confirmClearance(recordId, facultyNotes = '') {
  const current = getBacklogRecords();
  const now = new Date();
  const dateString = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const updated = current.map((item) => {
    if (item.id === recordId) {
      return {
        ...item,
        clearanceStatus: 'Cleared',
        resultStatus: 'Cleared',
        facultyClearedDate: dateString,
        facultyNotes: facultyNotes || 'Cleared and verified by Subject Faculty.'
      };
    }
    return item;
  });

  saveBacklogRecords(updated);
  return updated;
}

export function toggleTeacherMeetingStatus(recordId, newMetStatus) {
  const current = getBacklogRecords();
  const now = new Date();
  const timeString = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
    now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const updated = current.map((item) => {
    if (item.id === recordId) {
      return {
        ...item,
        metTeacher: newMetStatus,
        teacherConsultation: newMetStatus ? 'Completed' : 'Pending Guidance',
        lastUpdated: timeString
      };
    }
    return item;
  });

  saveBacklogRecords(updated);
  return updated;
}

export function addFacultyAdvice(recordId, adviceText, facultyAuthor = 'Faculty Advisor') {
  const current = getBacklogRecords();
  const now = new Date();
  const timeString = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
    now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const updated = current.map((item) => {
    if (item.id === recordId) {
      return {
        ...item,
        facultyNotes: adviceText,
        facultyAuthor: facultyAuthor,
        facultyNotesDate: timeString,
        lastUpdated: timeString
      };
    }
    return item;
  });

  saveBacklogRecords(updated);
  return updated;
}

export const DEFAULT_STUDENTS = [
  {
    id: 'STU-24215107',
    name: 'Anirudh John',
    usn: '24215107',
    username: 'anirudh',
    password: 'student123',
    course: 'Bachelor of Computer Applications (BCA)',
    academicYear: '1st Year',
    semester: 'Semester 1',
    semesterType: 'Odd',
    section: 'Section A',
    email: 'anirudh.john@student.univ.edu',
    cgpa: 0.0,
    midsemMarks: null,
    midsemAverage: null,
    endsemMarks: null,
    endsemStatus: 'Eligible',
    backlogsCount: 0,
    status: 'Active',
    enrolledSubjects: [],
    backlogsHistory: []
  }
];

export const DEFAULT_TEACHERS = [
  {
    id: 'TCH-001',
    name: 'Dr. Rajesh Sharma',
    empId: 'FAC-101',
    username: 'rsharma',
    password: 'faculty101',
    email: 'rajesh.sharma@univ.edu',
    department: 'Department of Computer Applications',
    designation: 'Professor & Head of Department',
    cabin: 'Cabin 101, Main Block',
    subjects: ['Database Management Systems', 'Advanced Database Systems'],
    sections: ['Section A', 'Section B'],
    hoursPerWeek: 16,
    experience: '18 Years'
  },
  {
    id: 'TCH-002',
    name: 'Prof. Priya Nambiar',
    empId: 'FAC-102',
    username: 'pnambiar',
    password: 'faculty102',
    email: 'priya.nambiar@univ.edu',
    department: 'Department of Computer Applications',
    designation: 'Associate Professor',
    cabin: 'Cabin 104, Main Block',
    subjects: ['Data Structures & Algorithms', 'C/C++ Programming'],
    sections: ['Section A', 'Section C'],
    hoursPerWeek: 16,
    experience: '12 Years'
  },
  {
    id: 'TCH-003',
    name: 'Dr. Arvind Kulkarni',
    empId: 'FAC-103',
    username: 'akulkarni',
    password: 'faculty103',
    email: 'arvind.kulkarni@univ.edu',
    department: 'Department of Computer Applications',
    designation: 'Professor & Senior Academic Mentor',
    cabin: 'Cabin 108, Main Block',
    subjects: ['Computer Networks', 'Operating Systems'],
    sections: ['Section B'],
    hoursPerWeek: 14,
    experience: '15 Years'
  },
  {
    id: 'TCH-004',
    name: 'Prof. Meera Subramanian',
    empId: 'FAC-104',
    username: 'msubramanian',
    password: 'faculty104',
    email: 'meera.s@univ.edu',
    department: 'Department of Computer Applications',
    designation: 'Associate Professor',
    cabin: 'Cabin 202, IT Block',
    subjects: ['Introduction to Web Technology', 'Python Programming'],
    sections: ['Section A', 'Section B'],
    hoursPerWeek: 15,
    experience: '10 Years'
  }
];

// ==========================================
// STUDENTS CRUD
// ==========================================
export function getStudents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let hasChanges = false;
        const healed = parsed.map(s => {
          let updated = { ...s };
          if (!s.password) {
            hasChanges = true;
            updated.password = 'student123';
          }
          if (!Array.isArray(s.enrolledSubjects)) {
            hasChanges = true;
            updated.enrolledSubjects = [];
          }

          // Dynamic synchronization of marks from enrolled subjects:
          // A student's marks should ONLY exist if the student entered them in the Student Portal!
          const subs = updated.enrolledSubjects;
          const enteredMidSubs = subs.filter(
            (sub) => sub.midsemMarks !== null && sub.midsemMarks !== undefined && sub.midsemMarks !== ''
          );

          if (enteredMidSubs.length === 0) {
            // Student has not entered midsem marks yet - MUST be null
            if (updated.midsemMarks !== null) {
              updated.midsemMarks = null;
              hasChanges = true;
            }
            if (updated.midsemAverage !== null && updated.midsemAverage !== undefined) {
              updated.midsemAverage = null;
              hasChanges = true;
            }
          } else {
            // Student has entered marks, calculate average out of 50
            const calculatedMid = Math.round(
              (enteredMidSubs.reduce((acc, sub) => acc + (Number(sub.midsemMarks) / (Number(sub.midsemMax) || 50)), 0) /
                enteredMidSubs.length) * 50
            );
            if (updated.midsemMarks !== calculatedMid) {
              updated.midsemMarks = calculatedMid;
              hasChanges = true;
            }
            const calculatedAvgPercent = Number(
              ((enteredMidSubs.reduce((acc, sub) => acc + (Number(sub.midsemMarks) / (Number(sub.midsemMax) || 50)), 0) /
                enteredMidSubs.length) * 100).toFixed(1)
            );
            if (updated.midsemAverage !== calculatedAvgPercent) {
              updated.midsemAverage = calculatedAvgPercent;
              hasChanges = true;
            }
          }

          const enteredEndSubs = subs.filter(
            (sub) => sub.endsemMarks !== null && sub.endsemMarks !== undefined && sub.endsemMarks !== ''
          );

          if (enteredEndSubs.length === 0) {
            if (updated.endsemMarks !== null) {
              updated.endsemMarks = null;
              hasChanges = true;
            }
            // If student has no endsem marks entered and had a dummy 8.5 CGPA, reset to 0.0
            if (updated.cgpa === 8.5) {
              updated.cgpa = 0.0;
              hasChanges = true;
            }
          } else {
            const calculatedEnd = Math.round(
              (enteredEndSubs.reduce((acc, sub) => acc + (Number(sub.endsemMarks) / (Number(sub.endsemMax) || 100)), 0) /
                enteredEndSubs.length) * 100
            );
            if (updated.endsemMarks !== calculatedEnd) {
              updated.endsemMarks = calculatedEnd;
              hasChanges = true;
            }
            const calculatedCgpa = Number(
              ((enteredEndSubs.reduce((acc, sub) => acc + (Number(sub.endsemMarks) / (Number(sub.endsemMax) || 100)), 0) /
                enteredEndSubs.length) * 10).toFixed(1)
            );
            if (updated.cgpa !== calculatedCgpa) {
              updated.cgpa = calculatedCgpa;
              hasChanges = true;
            }
          }

          return updated;
        });
        if (hasChanges) {
          saveStudents(healed);
        }
        return healed;
      }
    }
  } catch (e) {
    console.warn('Error reading students', e);
  }
  return DEFAULT_STUDENTS;
}

export function saveStudents(students) {
  try {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('backtrack_students_updated', { detail: students }));
    }
  } catch (e) {
    console.warn('Error saving students', e);
  }
}

export function addStudent(student) {
  const current = getStudents();
  // Do not assign subjects to student - student will select their own subjects
  const assignedSubjects = Array.isArray(student.enrolledSubjects) ? student.enrolledSubjects : [];

  const cleanUsn = student.usn || student.id || `STU-${Date.now().toString().slice(-4)}`;
  const cleanUsername = student.username || cleanUsn;
  const cleanPassword = student.password || 'student123';

  // Check if student has valid entered midsem marks in subjects
  const validSubs = assignedSubjects;
  const validMid = validSubs.filter(
    (s) => s.midsemMarks !== null && s.midsemMarks !== undefined && s.midsemMarks !== ''
  );
  const midsemMarks = validMid.length > 0
    ? Math.round(
        (validMid.reduce((acc, s) => acc + (Number(s.midsemMarks) / (Number(s.midsemMax) || 50)), 0) /
          validMid.length) * 50
      )
    : (student.midsemMarks !== undefined && student.midsemMarks !== null && student.midsemMarks !== '' && Number(student.midsemMarks) > 0)
    ? Number(student.midsemMarks)
    : null;

  const validEnd = validSubs.filter(
    (s) => s.endsemMarks !== null && s.endsemMarks !== undefined && s.endsemMarks !== ''
  );
  const endsemMarks = validEnd.length > 0
    ? Math.round(
        (validEnd.reduce((acc, s) => acc + (Number(s.endsemMarks) / (Number(s.endsemMax) || 100)), 0) /
          validEnd.length) * 100
      )
    : (student.endsemMarks !== undefined && student.endsemMarks !== null && student.endsemMarks !== '' && Number(student.endsemMarks) > 0)
    ? Number(student.endsemMarks)
    : null;

  const cgpa = validEnd.length > 0
    ? Number(
        ((validEnd.reduce((acc, s) => acc + Number(s.endsemMarks) / (Number(s.endsemMax) || 100), 0) /
          validEnd.length) * 10).toFixed(1)
      )
    : (student.cgpa !== undefined && student.cgpa !== null && student.cgpa !== '')
    ? Number(student.cgpa)
    : 0.0;

  const newStudent = {
    ...student,
    id: student.id || `STU-${cleanUsn}`,
    name: student.name || 'Student',
    usn: cleanUsn,
    username: cleanUsername,
    password: cleanPassword,
    status: student.status || 'Active',
    enrolledSubjects: assignedSubjects,
    backlogsHistory: student.backlogsHistory || [],
    backlogsCount: Number(student.backlogsCount || 0),
    cgpa: cgpa,
    midsemMarks: midsemMarks,
    midsemAverage: validMid.length > 0 ? Number(((validMid.reduce((acc, s) => acc + Number(s.midsemMarks) / (Number(s.midsemMax) || 50), 0) / validMid.length) * 100).toFixed(1)) : null,
    endsemMarks: endsemMarks,
    endsemStatus: student.endsemStatus || 'Eligible',
    usn: cleanUsn,
    username: cleanUsername,
    password: cleanPassword,
    enrolledSubjects: assignedSubjects
  };
  const updated = [newStudent, ...current.filter(s => s.usn !== cleanUsn && s.id !== newStudent.id)];
  saveStudents(updated);
  return updated;
}

export function updateStudent(id, updatedFields) {
  const current = getStudents();
  const updated = current.map(s => s.id === id ? { ...s, ...updatedFields } : s);
  saveStudents(updated);
  return updated;
}

export function deleteStudent(id) {
  const current = getStudents();
  const updated = current.filter(s => s.id !== id);
  saveStudents(updated);
  return updated;
}

// ==========================================
// TEACHERS / FACULTY CRUD
// ==========================================
export function getTeachers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEACHERS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure all default teachers exist, while preserving all custom added faculty
        const missingDefaults = DEFAULT_TEACHERS.filter(
          (d) => !parsed.some((p) => p.empId === d.empId || p.username === d.username)
        );
        if (missingDefaults.length > 0) {
          const merged = [...parsed, ...missingDefaults];
          localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading teachers', e);
  }
  try {
    localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(DEFAULT_TEACHERS));
  } catch {}
  return DEFAULT_TEACHERS;
}

export function saveTeachers(teachers) {
  try {
    localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(teachers));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('backtrack_teachers_updated', { detail: teachers }));
    }
  } catch (e) {
    console.warn('Error saving teachers', e);
  }
}

export function addTeacher(teacher) {
  const current = getTeachers();
  const cleanEmpId = teacher.empId || teacher.id || `TCH-${Date.now().toString().slice(-4)}`;
  const cleanUsername = teacher.username || cleanEmpId;
  const cleanPassword = teacher.password || 'faculty123';

  const newTeacher = {
    id: teacher.id || `TCH-${cleanEmpId}`,
    name: teacher.name || 'Faculty Member',
    empId: cleanEmpId,
    username: cleanUsername,
    password: cleanPassword,
    subjects: teacher.subjects || [],
    sections: teacher.sections || [],
    hoursPerWeek: Number(teacher.hoursPerWeek || 14),
    ...teacher,
    empId: cleanEmpId,
    username: cleanUsername,
    password: cleanPassword
  };
  const updated = [newTeacher, ...current.filter(t => t.empId !== cleanEmpId && t.id !== newTeacher.id)];
  saveTeachers(updated);
  return updated;
}

export function updateTeacher(id, updatedFields) {
  const current = getTeachers();
  const updated = current.map(t => t.id === id ? { ...t, ...updatedFields } : t);
  saveTeachers(updated);
  return updated;
}

export function deleteTeacher(id) {
  const current = getTeachers();
  const updated = current.filter(t => t.id !== id);
  saveTeachers(updated);
  return updated;
}

// ==========================================
// SUBJECTS CRUD
// ==========================================
export function getSubjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUBJECTS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading subjects', e);
  }
  return [];
}

export function saveSubjects(subjects) {
  try {
    localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(subjects));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('backtrack_subjects_updated', { detail: subjects }));
    }
  } catch (e) {
    console.warn('Error saving subjects', e);
  }
}

export function addSubject(subject) {
  const current = getSubjects();
  const newSubject = {
    id: subject.id || `SUB-${Date.now().toString().slice(-4)}`,
    credits: Number(subject.credits || 4),
    enrolled: Number(subject.enrolled || 0),
    ...subject
  };
  const updated = [...current, newSubject];
  saveSubjects(updated);
  return updated;
}

export function deleteSubject(id) {
  const current = getSubjects();
  const updated = current.filter(s => s.id !== id);
  saveSubjects(updated);
  return updated;
}

// ==========================================
// COURSES CRUD
// ==========================================
export function getCourses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COURSES);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading courses', e);
  }
  return [];
}

export function saveCourses(courses) {
  try {
    localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(courses));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('backtrack_courses_updated', { detail: courses }));
    }
  } catch (e) {
    console.warn('Error saving courses', e);
  }
}

export function addCourse(course) {
  const current = getCourses();
  const newCourse = {
    id: course.id || `CRS-${Date.now().toString().slice(-4)}`,
    totalSubjects: Number(course.totalSubjects || 0),
    ...course
  };
  const updated = [...current, newCourse];
  saveCourses(updated);
  return updated;
}

export function deleteCourse(id) {
  const current = getCourses();
  const updated = current.filter(c => c.id !== id);
  saveCourses(updated);
  return updated;
}

// ==========================================
// USERS CRUD
// ==========================================
export function getUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading users', e);
  }
  return [];
}

export function saveUsers(users) {
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('backtrack_users_updated', { detail: users }));
    }
  } catch (e) {
    console.warn('Error saving users', e);
  }
}

export function addUser(user) {
  const current = getUsers();
  const newUser = {
    id: user.id || `USR-${Date.now().toString().slice(-4)}`,
    status: user.status || 'Active',
    lastLogin: 'Never',
    ...user
  };
  const updated = [newUser, ...current];
  saveUsers(updated);
  return updated;
}

export function deleteUser(id) {
  const current = getUsers();
  const updated = current.filter(u => u.id !== id);
  saveUsers(updated);
  return updated;
}

// ==========================================
// PURGE ALL DATA SYSTEM RESET
// ==========================================
export function clearAllSystemData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY_STUDENTS);
    localStorage.removeItem(STORAGE_KEY_TEACHERS);
    localStorage.removeItem(STORAGE_KEY_SUBJECTS);
    localStorage.removeItem(STORAGE_KEY_COURSES);
    localStorage.removeItem(STORAGE_KEY_USERS);
    localStorage.removeItem(STORAGE_KEY_REQUESTS);
    localStorage.removeItem(STORAGE_KEY_NOTIFICATIONS);
    localStorage.removeItem('currentUser');
    localStorage.setItem(DEMO_CLEARED_FLAG, 'true');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('backtrack_backlog_updated', { detail: [] }));
      window.dispatchEvent(new CustomEvent('backtrack_students_updated', { detail: [] }));
      window.dispatchEvent(new CustomEvent('backtrack_teachers_updated', { detail: [] }));
      window.dispatchEvent(new CustomEvent('backtrack_subjects_updated', { detail: [] }));
      window.dispatchEvent(new CustomEvent('backtrack_courses_updated', { detail: [] }));
      window.dispatchEvent(new CustomEvent('backtrack_users_updated', { detail: [] }));
      window.dispatchEvent(new CustomEvent('backtrack_requests_updated', { detail: [] }));
      window.dispatchEvent(new CustomEvent('backtrack_notifications_updated', { detail: [] }));
    }
  } catch (e) {
    console.warn('Error purging all data', e);
  }
}

// ==========================================
// REQUESTS & TEACHER MEETINGS CRUD
// ==========================================
export function getRequests() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REQUESTS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading requests', e);
  }
  return [];
}

export function saveRequests(requests) {
  try {
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('backtrack_requests_updated', { detail: requests }));
    }
  } catch (e) {
    console.warn('Error saving requests', e);
  }
}

export function addMeetingRequest(req) {
  const current = getRequests();
  const cleanReq = {
    id: req.id || `MEET-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`,
    studentName: req.studentName || 'Student',
    usn: req.usn || 'USN',
    studentEmail: req.studentEmail || '',
    course: req.course || 'Bachelor of Computer Applications (BCA)',
    semester: req.semester || 'Semester 1',
    teacher: req.teacher || '',
    teacherName: req.teacherName || '',
    teacherEmpId: req.teacherEmpId || '',
    teacherUsername: req.teacherUsername || '',
    subject: req.subject || 'General Consultation / Not Specified',
    type: req.type || 'Backlog Doubt Clearance & Subject Guidance',
    slot: req.slot || 'Faculty Cabin (Morning Slot: 10:30 AM - 11:30 AM)',
    reason: req.reason || '',
    date: req.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    timestamp: req.timestamp || Date.now(),
    status: req.status || 'Pending',
    facultyResponse: req.facultyResponse || '',
    remarks: req.remarks || ''
  };
  const updated = [cleanReq, ...current.filter((r) => r.id !== cleanReq.id)];
  saveRequests(updated);
  return updated;
}

export function updateMeetingRequest(id, patch) {
  const current = getRequests();
  const updated = current.map((r) => (r.id === id ? { ...r, ...patch } : r));
  saveRequests(updated);
  return updated;
}

// ==========================================
// NOTIFICATIONS CRUD
// ==========================================
export function getNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading notifications', e);
  }
  return [];
}

export function saveNotifications(notifications) {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('backtrack_notifications_updated', { detail: notifications }));
    }
  } catch (e) {
    console.warn('Error saving notifications', e);
  }
}

export function addNotification(notif) {
  const current = getNotifications();
  const cleanNotif = {
    id: notif.id || `NOTIF-${Date.now()}-${Math.floor(10 + Math.random() * 90)}`,
    title: notif.title || 'Notification',
    category: notif.category || 'Announcements',
    body: notif.body || '',
    time: notif.time || 'Just now',
    timestamp: notif.timestamp || Date.now(),
    read: notif.read || false,
    targetRole: notif.targetRole || 'all', // 'faculty', 'student', 'all'
    targetEmpId: notif.targetEmpId || '',
    targetTeacherName: notif.targetTeacherName || '',
    targetTeacherUsername: notif.targetTeacherUsername || '',
    targetUsn: notif.targetUsn || '',
    studentName: notif.studentName || '',
    usn: notif.usn || '',
    requestId: notif.requestId || ''
  };
  const updated = [cleanNotif, ...current.filter((n) => n.id !== cleanNotif.id)];
  saveNotifications(updated);
  return updated;
}

// ==========================================
// OFFICIAL BCA CURRICULUM (SEMESTERS 1 TO 6)
// ==========================================
export const BCA_CURRICULUM = [
  // Semester 1
  { semester: 'Sem 1', semesterNum: 1, semesterName: 'Semester 1', code: 'BCA161-1', name: 'Introduction to Web Technology', type: 'Core' },
  { semester: 'Sem 1', semesterNum: 1, semesterName: 'Semester 1', code: 'HED181-1', name: 'Holistic Education and Development', type: 'Ability Enhancement' },
  { semester: 'Sem 1', semesterNum: 1, semesterName: 'Semester 1', code: 'GSC101-1', name: 'Gender and Sexuality: Social and Cultural Perspectives', type: 'Multidisciplinary' },
  { semester: 'Sem 1', semesterNum: 1, semesterName: 'Semester 1', code: 'VIUP111N', name: 'Artificial Intelligence', type: 'Skill Enhancement' },
  { semester: 'Sem 1', semesterNum: 1, semesterName: 'Semester 1', code: 'BCA101-1', name: 'Foundational Mathematics', type: 'Core' },
  { semester: 'Sem 1', semesterNum: 1, semesterName: 'Semester 1', code: 'EVS181-1', name: 'Environmental Studies', type: 'Value Added' },
  { semester: 'Sem 1', semesterNum: 1, semesterName: 'Semester 1', code: 'BCA102-1', name: 'Object Oriented Programming Using C++', type: 'Core' },
  { semester: 'Sem 1', semesterNum: 1, semesterName: 'Semester 1', code: 'BCA103-1', name: 'Principles of Software Development - I', type: 'Core' },
  { semester: 'Sem 1', semesterNum: 1, semesterName: 'Semester 1', code: 'BCA181-1', name: 'Academic Writing', type: 'Ability Enhancement' },

  // Semester 2
  { semester: 'Sem 2', semesterNum: 2, semesterName: 'Semester 2', code: 'BCA101-2', name: 'Discrete Mathematics', type: 'Core' },
  { semester: 'Sem 2', semesterNum: 2, semesterName: 'Semester 2', code: 'BCA201-2', name: 'Data Structures Using C++', type: 'Core' },
  { semester: 'Sem 2', semesterNum: 2, semesterName: 'Semester 2', code: 'HED181-2', name: 'Holistic Education and Development', type: 'Ability Enhancement' },
  { semester: 'Sem 2', semesterNum: 2, semesterName: 'Semester 2', code: 'BCA181-2', name: 'Professional English', type: 'Ability Enhancement' },
  { semester: 'Sem 2', semesterNum: 2, semesterName: 'Semester 2', code: 'BCA202-2', name: 'Java Programming', type: 'Core' },
  { semester: 'Sem 2', semesterNum: 2, semesterName: 'Semester 2', code: 'BCA261-2', name: 'Full Stack Development', type: 'Core' },
  { semester: 'Sem 2', semesterNum: 2, semesterName: 'Semester 2', code: 'UOI181-2', name: 'Understanding of India', type: 'Value Added' },
  { semester: 'Sem 2', semesterNum: 2, semesterName: 'Semester 2', code: 'VIUP111N-2', name: 'Artificial Intelligence', type: 'Skill Enhancement' },
  { semester: 'Sem 2', semesterNum: 2, semesterName: 'Semester 2', code: 'CPCG101', name: 'Professional Skill Development Level 1', type: 'Skill Enhancement' },
  { semester: 'Sem 2', semesterNum: 2, semesterName: 'Semester 2', code: 'ECO141CN', name: 'Globalisation', type: 'Multidisciplinary' },
  { semester: 'Sem 2', semesterNum: 2, semesterName: 'Semester 2', code: 'CPCG103', name: 'Communication Skill Development Level 1', type: 'Skill Enhancement' },

  // Semester 3
  { semester: 'Sem 3', semesterNum: 3, semesterName: 'Semester 3', code: 'BCA201-3', name: 'Computer Networks', type: 'Core' },
  { semester: 'Sem 3', semesterNum: 3, semesterName: 'Semester 3', code: 'HED-NEP181-3', name: 'Holistic Education Development-II', type: 'Ability Enhancement' },
  { semester: 'Sem 3', semesterNum: 3, semesterName: 'Semester 3', code: 'BCA202-3', name: 'Operating System', type: 'Core' },
  { semester: 'Sem 3', semesterNum: 3, semesterName: 'Semester 3', code: 'BCA263-3', name: 'Introduction to Python', type: 'Core' },
  { semester: 'Sem 3', semesterNum: 3, semesterName: 'Semester 3', code: 'BCA101-3', name: 'Financial Accounting', type: 'Multidisciplinary' },
  { semester: 'Sem 3', semesterNum: 3, semesterName: 'Semester 3', code: 'BCA301-3', name: 'Mobile Applications', type: 'Core' },
  { semester: 'Sem 3', semesterNum: 3, semesterName: 'Semester 3', code: 'BCA281-3', name: 'Summer Internship', type: 'Practical' },
  { semester: 'Sem 3', semesterNum: 3, semesterName: 'Semester 3', code: 'GER181-3', name: 'German - I', type: 'Value Added' },
  { semester: 'Sem 3', semesterNum: 3, semesterName: 'Semester 3', code: 'NOC25-HS109', name: 'Mental Health and Wellbeing', type: 'Value Added' },

  // Semester 4
  { semester: 'Sem 4', semesterNum: 4, semesterName: 'Semester 4', code: 'CPCG191', name: 'Communication Skill Development Level 2', type: 'Skill Enhancement' },
  { semester: 'Sem 4', semesterNum: 4, semesterName: 'Semester 4', code: 'BCA202-4', name: 'Robotic Process Automation', type: 'Core' },
  { semester: 'Sem 4', semesterNum: 4, semesterName: 'Semester 4', code: 'HED-NEP181-4', name: 'Holistic Education Development-II', type: 'Ability Enhancement' },
  { semester: 'Sem 4', semesterNum: 4, semesterName: 'Semester 4', code: 'BCA201-4', name: 'Graph Theory', type: 'Core' },
  { semester: 'Sem 4', semesterNum: 4, semesterName: 'Semester 4', code: 'BCA301-4', name: 'Dot Net', type: 'Core' },
  { semester: 'Sem 4', semesterNum: 4, semesterName: 'Semester 4', code: 'GER181-4', name: 'German - II', type: 'Value Added' },
  { semester: 'Sem 4', semesterNum: 4, semesterName: 'Semester 4', code: 'BCA302-4', name: 'Principles of Software Development - II', type: 'Core' },
  { semester: 'Sem 4', semesterNum: 4, semesterName: 'Semester 4', code: 'BCA304-4', name: 'Advanced Java', type: 'Core' },
  { semester: 'Sem 4', semesterNum: 4, semesterName: 'Semester 4', code: 'BCA303-4', name: 'Internet of Things', type: 'Core' },
  { semester: 'Sem 4', semesterNum: 4, semesterName: 'Semester 4', code: 'VIUP122', name: 'Generative AI', type: 'Skill Enhancement' },

  // Semester 5
  { semester: 'Sem 5', semesterNum: 5, semesterName: 'Semester 5', code: 'BCA301-5', name: 'Artificial Intelligence', type: 'Core' },
  { semester: 'Sem 5', semesterNum: 5, semesterName: 'Semester 5', code: 'BCA302-5', name: 'Applied Cloud Computing and Architecture', type: 'Core' },
  { semester: 'Sem 5', semesterNum: 5, semesterName: 'Semester 5', code: 'BCA306-5', name: 'Advanced Python', type: 'Core' },
  { semester: 'Sem 5', semesterNum: 5, semesterName: 'Semester 5', code: 'BCA304-5', name: 'Data Engineering', type: 'Core' },
  { semester: 'Sem 5', semesterNum: 5, semesterName: 'Semester 5', code: 'BCA482-5', name: 'Specialization Project', type: 'Project' },
  { semester: 'Sem 5', semesterNum: 5, semesterName: 'Semester 5', code: 'BCA305B-5', name: 'Natural Language Processing', type: 'Elective' },

  // Semester 6
  { semester: 'Sem 6', semesterNum: 6, semesterName: 'Semester 6', code: 'BCA201-6', name: 'Cyber Security', type: 'Core' },
  { semester: 'Sem 6', semesterNum: 6, semesterName: 'Semester 6', code: 'BCA481-6', name: 'Industry Internship', type: 'Internship' },
  { semester: 'Sem 6', semesterNum: 6, semesterName: 'Semester 6', code: 'BCA202-6', name: 'Design and Analysis of Algorithm', type: 'Core' },

  // Semester 7 (4th Year)
  { semester: 'Sem 7', semesterNum: 7, semesterName: 'Semester 7', code: 'CSE401-7', name: 'Cloud Native & Microservices Architecture', type: 'Core' },
  { semester: 'Sem 7', semesterNum: 7, semesterName: 'Semester 7', code: 'CSE402-7', name: 'Deep Learning & Neural Networks', type: 'Core' },
  { semester: 'Sem 7', semesterNum: 7, semesterName: 'Semester 7', code: 'CSE403-7', name: 'DevOps & Site Reliability Engineering', type: 'Core' },
  { semester: 'Sem 7', semesterNum: 7, semesterName: 'Semester 7', code: 'CSE404-7', name: 'Big Data Analytics & Distributed Computing', type: 'Core' },
  { semester: 'Sem 7', semesterNum: 7, semesterName: 'Semester 7', code: 'CSE481-7', name: 'Major Capstone Project Phase - I', type: 'Project' },
  { semester: 'Sem 7', semesterNum: 7, semesterName: 'Semester 7', code: 'CSE405-7', name: 'Blockchain & Decentralized Applications', type: 'Elective' },

  // Semester 8 (4th Year)
  { semester: 'Sem 8', semesterNum: 8, semesterName: 'Semester 8', code: 'CSE401-8', name: 'Industrial Practicum & Corporate Internship', type: 'Internship' },
  { semester: 'Sem 8', semesterNum: 8, semesterName: 'Semester 8', code: 'CSE402-8', name: 'Major Capstone Project Phase - II & Defense', type: 'Project' },
  { semester: 'Sem 8', semesterNum: 8, semesterName: 'Semester 8', code: 'CSE403-8', name: 'Cyber Laws, Digital Ethics & Patent IPR', type: 'Core' },
  { semester: 'Sem 8', semesterNum: 8, semesterName: 'Semester 8', code: 'CSE404-8', name: 'Autonomous Robotics & Embedded Systems', type: 'Elective' },
];

/**
 * Automatically assigns curriculum subjects to a student based on their course,
 * academic year (1st Year, 2nd Year, 3rd Year, 4th Year), and semester (Semester 1 to 8).
 */
export function getCurriculumSubjectsForYearAndSem(course = 'BCA', yearInput = '1st Year', semInput = 'Semester 1') {
  // Determine year number (1, 2, 3, or 4)
  let yearNum = 1;
  const yearStr = String(yearInput || '').toLowerCase();
  if (yearStr.includes('4') || yearStr.includes('fourth') || yearStr.includes('final')) {
    yearNum = 4;
  } else if (yearStr.includes('3') || yearStr.includes('third')) {
    yearNum = 3;
  } else if (yearStr.includes('2') || yearStr.includes('second')) {
    yearNum = 2;
  } else {
    yearNum = 1;
  }

  // Determine semester number (1 to 8)
  let semNum = (yearNum * 2) - 1; // default to the odd semester of that year (1, 3, 5, or 7)
  const semStr = String(semInput || '').toLowerCase();
  const match = semStr.match(/(?:semester|sem)?\s*([1-8])/i);
  if (match) {
    semNum = parseInt(match[1], 10);
    // Align year to matched semester
    yearNum = Math.ceil(semNum / 2);
  }

  // Determine semesters for this academic year:
  // Year 1: Semesters 1 and 2
  // Year 2: Semesters 3 and 4
  // Year 3: Semesters 5 and 6
  // Year 4: Semesters 7 and 8
  const yearSemesters = [yearNum * 2 - 1, yearNum * 2];

  // Pull matching subjects from BCA_CURRICULUM
  const yearSubjects = BCA_CURRICULUM.filter(sub => yearSemesters.includes(sub.semesterNum));

  return yearSubjects.map((sub, idx) => ({
    id: `SUB-${sub.code.replace(/[^a-zA-Z0-9]/g, '')}`,
    code: sub.code,
    name: sub.name,
    course: course || 'Bachelor of Computer Applications (BCA)',
    academicYear: `${yearNum === 1 ? '1st' : yearNum === 2 ? '2nd' : yearNum === 3 ? '3rd' : '4th'} Year`,
    semester: sub.semesterName || `Semester ${sub.semesterNum}`,
    semesterNum: sub.semesterNum,
    semesterType: sub.semesterNum % 2 !== 0 ? 'Odd' : 'Even',
    type: sub.type || 'Core',
    faculty: sub.type === 'Practical' || sub.type === 'Internship' || sub.type === 'Project'
      ? 'Industry & Lab Coordinator'
      : 'Department Faculty',
    midsemMarks: null,
    midsemMax: 50,
    midsemStatus: 'Not Entered',
    endsemMarks: null,
    endsemMax: 100,
    endsemStatus: 'Pending',
    status: sub.semesterNum === semNum ? 'Currently Enrolled (Active)' : 'Upcoming / Completed Module',
    isCurrentSemester: sub.semesterNum === semNum
  }));
}

export function populateBcaCurriculum() {
  // Ensure BCA degree course exists
  const currentCourses = getCourses();
  if (!currentCourses.some(c => c.code === 'BCA')) {
    const bcaCourse = {
      id: 'CRS-BCA-01',
      code: 'BCA',
      name: 'Bachelor of Computer Applications',
      duration: '3 Years (6 Sems)',
      head: 'Department of Computer Applications',
      totalSubjects: BCA_CURRICULUM.length
    };
    saveCourses([...currentCourses, bcaCourse]);
  } else {
    // update total subjects count
    saveCourses(currentCourses.map(c => c.code === 'BCA' ? { ...c, totalSubjects: BCA_CURRICULUM.length } : c));
  }

  // Add subjects that don't already exist
  const currentSubjects = getSubjects();
  const existingCodes = new Set(currentSubjects.map(s => s.code));
  const newSubjects = BCA_CURRICULUM.filter(sub => !existingCodes.has(sub.code)).map(sub => ({
    id: `SUB-${sub.code.replace(/[^a-zA-Z0-9]/g, '')}`,
    code: sub.code,
    name: sub.name,
    course: 'BCA',
    semester: sub.semester,
    type: sub.type,
    teacher: 'Department Faculty',
    enrolled: 0
  }));

  const updatedSubjects = [...currentSubjects, ...newSubjects];
  saveSubjects(updatedSubjects);
  return updatedSubjects;
}

// ==========================================
// DEMO ADMIN AUTHENTICATION & ACCESS CONTROL
// ==========================================
export const DEFAULT_ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
  name: 'Exam Controller',
  id: 'ADM-001',
  email: 'admin@univ.edu',
  department: 'Office of Academic Affairs & Examination Cell',
  role: 'admin',
  designation: 'Chief Academic Controller & Administrator',
  phone: '+91 98765 00001'
};

const STORAGE_KEY_ADMIN_AUTH = 'backtrack_admin_auth';

export function getAdminCredentials() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_AUTH);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Auto-sanitize if contaminated by student profile data
      if (
        parsed.id === '24215107' ||
        parsed.name?.toLowerCase().includes('anirudh') ||
        parsed.email?.toLowerCase().includes('anirudh') ||
        parsed.department?.toLowerCase().includes('bachelor of computer applications')
      ) {
        localStorage.setItem(STORAGE_KEY_ADMIN_AUTH, JSON.stringify(DEFAULT_ADMIN_CREDENTIALS));
        return DEFAULT_ADMIN_CREDENTIALS;
      }
      return { ...DEFAULT_ADMIN_CREDENTIALS, ...parsed };
    }
  } catch (e) {
    console.warn('Error reading admin credentials', e);
  }
  return DEFAULT_ADMIN_CREDENTIALS;
}

export function saveAdminCredentials(creds) {
  try {
    const current = getAdminCredentials();
    const updated = { ...current, ...creds };
    localStorage.setItem(STORAGE_KEY_ADMIN_AUTH, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Error saving admin credentials', e);
  }
}

/**
 * Checks whether an identifier (USN, roll number, username, email) belongs to a student.
 * Used to strictly forbid student IDs from accessing Faculty or Administrator panels.
 */
export function isStudentIdentifier(identifier) {
  if (!identifier) return false;
  const clean = String(identifier).trim().toLowerCase();

  // Known student roll numbers or student user handles
  if (
    clean === '24215107' ||
    clean === 'anirudh' ||
    clean === 'anirudh john' ||
    clean === 'anirudh@2004' ||
    clean.startsWith('24215')
  ) {
    return true;
  }

  // Check registered students list in localStorage
  try {
    const rawStudents = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (rawStudents) {
      const students = JSON.parse(rawStudents);
      if (Array.isArray(students)) {
        const found = students.some(
          (s) =>
            s.usn?.toLowerCase() === clean ||
            s.id?.toLowerCase() === clean ||
            s.name?.toLowerCase() === clean ||
            s.email?.toLowerCase() === clean ||
            s.username?.toLowerCase() === clean
        );
        if (found) return true;
      }
    }
  } catch {}

  // Check registered users list for role 'student'
  try {
    const rawUsers = localStorage.getItem(STORAGE_KEY_USERS);
    if (rawUsers) {
      const users = JSON.parse(rawUsers);
      if (Array.isArray(users)) {
        const found = users.some(
          (u) =>
            (u.role?.toLowerCase() === 'student') &&
            (u.username?.toLowerCase() === clean ||
              u.id?.toLowerCase() === clean ||
              u.email?.toLowerCase() === clean ||
              u.name?.toLowerCase() === clean)
        );
        if (found) return true;
      }
    }
  } catch {}

  return false;
}

/**
 * Checks whether an identifier (EmpID, username, email) belongs to a faculty member.
 * Used to strictly forbid faculty accounts from entering as students.
 */
export function isFacultyIdentifier(identifier) {
  if (!identifier) return false;
  const clean = String(identifier).trim().toLowerCase();

  if (
    clean === 'faculty' ||
    clean === 'fac-2024-bca' ||
    clean === 'faculty.advisor@univ.edu' ||
    clean.includes('kochoushinobu0069')
  ) {
    return true;
  }

  // Check registered teachers in localStorage
  try {
    const rawTeachers = localStorage.getItem(STORAGE_KEY_TEACHERS);
    if (rawTeachers) {
      const teachers = JSON.parse(rawTeachers);
      if (Array.isArray(teachers)) {
        const found = teachers.some(
          (t) =>
            t.empId?.toLowerCase() === clean ||
            t.id?.toLowerCase() === clean ||
            t.name?.toLowerCase() === clean ||
            t.email?.toLowerCase() === clean ||
            t.username?.toLowerCase() === clean
        );
        if (found) return true;
      }
    }
  } catch {}

  // Check registered users in localStorage for role 'faculty'
  try {
    const rawUsers = localStorage.getItem(STORAGE_KEY_USERS);
    if (rawUsers) {
      const users = JSON.parse(rawUsers);
      if (Array.isArray(users)) {
        const found = users.some(
          (u) =>
            (u.role?.toLowerCase() === 'faculty' || u.role?.toLowerCase() === 'teacher') &&
            (u.username?.toLowerCase() === clean ||
              u.id?.toLowerCase() === clean ||
              u.email?.toLowerCase() === clean ||
              u.name?.toLowerCase() === clean)
        );
        if (found) return true;
      }
    }
  } catch {}

  return false;
}

/**
 * Checks whether an identifier belongs to an administrator.
 */
export function isAdminIdentifier(identifier) {
  if (!identifier) return false;
  const clean = String(identifier).trim().toLowerCase();
  const adminCreds = getAdminCredentials();
  return (
    clean === 'admin' ||
    clean === 'adm-001' ||
    clean === (adminCreds.username || '').toLowerCase() ||
    clean === (adminCreds.email || '').toLowerCase() ||
    clean === (adminCreds.id || '').toLowerCase()
  );
}

/**
 * Authenticates a student user.
 * Requires:
 * 1. User must NOT be admin or faculty.
 * 2. User MUST be registered in students or users database.
 * 3. Password MUST match the student's registered password.
 */
export function authenticateStudent(usernameOrIdentifier, password) {
  const cleanInput = (usernameOrIdentifier || '').trim();
  const cleanPass = (password || '').trim();

  if (!cleanInput) {
    return { success: false, error: 'Please enter your student username or USN.' };
  }
  if (!cleanPass) {
    return { success: false, error: 'Please enter your student account password.' };
  }

  const cleanUser = cleanInput.toLowerCase();

  // 1. STRICT ROLE CONTROL: ADMIN CANNOT ENTER AS STUDENT
  if (cleanUser === 'admin' || cleanUser === 'adm-001' || cleanUser === 'admin@univ.edu') {
    return {
      success: false,
      error: 'Access Denied: Administrator credentials cannot be used to log into the Student portal. Please switch to the Admin login tab.'
    };
  }

  // 2. STRICT ROLE CONTROL: FACULTY CANNOT ENTER AS STUDENT
  if (isFacultyIdentifier(cleanUser)) {
    return {
      success: false,
      error: 'Access Denied: This account is registered as a Faculty member, not a Student. Only registered students can access the Student portal. Please switch to the Faculty login tab.'
    };
  }

  // 3. FIND STUDENT RECORD
  const allStudents = getStudents();
  const allUsers = getUsers();

  const matchedStudent = allStudents.find(
    (s) =>
      s.usn?.toLowerCase() === cleanUser ||
      s.username?.toLowerCase() === cleanUser ||
      s.id?.toLowerCase() === cleanUser ||
      s.email?.toLowerCase() === cleanUser ||
      s.name?.toLowerCase() === cleanUser
  );

  const matchedUser = allUsers.find(
    (u) =>
      (u.role?.toLowerCase() === 'student') &&
      (u.username?.toLowerCase() === cleanUser ||
        u.id?.toLowerCase() === cleanUser ||
        u.email?.toLowerCase() === cleanUser ||
        u.name?.toLowerCase() === cleanUser)
  );

  if (!matchedStudent && !matchedUser) {
    return {
      success: false,
      error: `Access Denied: No student account found matching "${cleanInput}". Only registered students with correct credentials can enter. Please register first or verify your username/USN.`
    };
  }

  // 4. VERIFY PASSWORD
  const expectedPassword =
    matchedStudent?.password ||
    matchedUser?.password ||
    (cleanUser === '24215107' || cleanUser === 'anirudh' ? 'student123' : null);

  if (expectedPassword && cleanPass !== expectedPassword) {
    return {
      success: false,
      error: 'Access Denied: Incorrect password. Please enter the correct password for your student account.'
    };
  }

  // 5. SUCCESS: BUILD AUTHENTICATED SESSION
  const displayName = matchedStudent?.name || matchedUser?.name || cleanInput;
  const displayId = matchedStudent?.usn || matchedStudent?.id || matchedUser?.id || cleanInput.toUpperCase();
  const cleanEmail = matchedStudent?.email || matchedUser?.email || `${cleanUser}@student.univ.edu`;

  const userSession = {
    username: matchedUser?.username || matchedStudent?.username || cleanInput,
    name: displayName,
    id: displayId,
    usn: displayId,
    role: 'student',
    email: cleanEmail,
    course: matchedStudent?.course || 'Bachelor of Computer Applications (BCA)',
    academicYear: matchedStudent?.academicYear || '1st Year',
    semester: matchedStudent?.semester || 'Semester 1',
    enrolledSubjects: matchedStudent?.enrolledSubjects || [],
    loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  return { success: true, session: userSession };
}

/**
 * Authenticates a faculty member.
 */
export function authenticateFaculty(usernameOrIdentifier, password) {
  const cleanInput = (usernameOrIdentifier || '').trim();
  const cleanPass = (password || '').trim();

  if (!cleanInput) {
    return { success: false, error: 'Please enter your faculty username or Employee ID.' };
  }
  if (!cleanPass) {
    return { success: false, error: 'Please enter your password.' };
  }

  const cleanUser = cleanInput.toLowerCase();

  // 1. STRICT ROLE CONTROL: STUDENTS CANNOT ENTER FACULTY PANEL
  if (isStudentIdentifier(cleanUser)) {
    return {
      success: false,
      error: 'Access Denied: Student account detected. Student IDs cannot access the Faculty panel. Please switch to the Student login portal.'
    };
  }

  // 2. ADMIN CANNOT ENTER FACULTY PANEL
  if (cleanUser === 'admin' || cleanUser === 'adm-001' || cleanUser === 'admin@univ.edu') {
    return {
      success: false,
      error: 'Access Denied: Administrator credentials cannot be used to log into the Faculty portal. Please switch to Admin login.'
    };
  }

  // 3. FIND FACULTY RECORD
  const allTeachers = getTeachers();
  const allUsers = getUsers();

  const matchedTeacher = allTeachers.find(
    (t) =>
      t.empId?.toLowerCase() === cleanUser ||
      t.username?.toLowerCase() === cleanUser ||
      t.id?.toLowerCase() === cleanUser ||
      t.email?.toLowerCase() === cleanUser ||
      t.name?.toLowerCase() === cleanUser
  );

  const matchedUser = allUsers.find(
    (u) =>
      (u.role?.toLowerCase() === 'faculty' || u.role?.toLowerCase() === 'teacher') &&
      (u.username?.toLowerCase() === cleanUser ||
        u.id?.toLowerCase() === cleanUser ||
        u.email?.toLowerCase() === cleanUser ||
        u.name?.toLowerCase() === cleanUser)
  );

  const isKochou = cleanUser.includes('kochoushinobu0069');

  if (!matchedTeacher && !matchedUser && !isKochou && cleanUser !== 'faculty' && cleanUser !== 'fac-2024-bca') {
    return {
      success: false,
      error: `Access Denied: No faculty account found matching "${cleanInput}". Only authorized faculty members can log in.`
    };
  }

  // 4. VERIFY PASSWORD (Case-insensitive & permissive demo passwords)
  const lowerPass = cleanPass.toLowerCase();
  const teacherPass = (matchedTeacher?.password || '').toLowerCase();
  const userPass = (matchedUser?.password || '').toLowerCase();

  const isPassValid =
    (teacherPass && lowerPass === teacherPass) ||
    (userPass && lowerPass === userPass) ||
    lowerPass === 'faculty123' ||
    lowerPass === 'faculty101' ||
    lowerPass === 'faculty102' ||
    lowerPass === 'faculty103' ||
    lowerPass === 'faculty104' ||
    lowerPass === 'faculty' ||
    lowerPass === 'student123' ||
    lowerPass === cleanUser ||
    (matchedTeacher && lowerPass === (matchedTeacher.empId || '').toLowerCase()) ||
    (cleanUser === 'faculty' && lowerPass === 'faculty123');

  if (!isPassValid) {
    return {
      success: false,
      error: 'Access Denied: Incorrect password. Please enter "faculty101" or "faculty123".'
    };
  }

  const displayName = matchedTeacher?.name || matchedUser?.name || (isKochou ? 'Faculty Member' : cleanInput);
  const displayId = matchedTeacher?.empId || matchedTeacher?.id || matchedUser?.id || (isKochou ? 'FAC-KOCHOU' : cleanInput.toUpperCase());
  const cleanEmail = matchedTeacher?.email || matchedUser?.email || (cleanInput.includes('@') ? cleanInput : `${cleanUser}@univ.edu`);

  const userSession = {
    username: matchedTeacher?.username || matchedUser?.username || cleanInput,
    name: displayName,
    id: displayId,
    empId: displayId,
    role: 'faculty',
    email: cleanEmail,
    department: matchedTeacher?.department || matchedUser?.department || 'Department of Computer Applications',
    designation: matchedTeacher?.designation || matchedUser?.designation || 'Faculty Member',
    cabin: matchedTeacher?.cabin || 'Main Block',
    assignedSubjects: matchedTeacher?.subjects || [],
    loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  return { success: true, session: userSession };
}

/**
 * Authenticates an administrator.
 */
export function authenticateAdmin(usernameOrIdentifier, password) {
  const cleanInput = (usernameOrIdentifier || '').trim();
  const cleanPass = (password || '').trim();

  if (!cleanInput) {
    return { success: false, error: 'Please enter your administrator username.' };
  }
  if (!cleanPass) {
    return { success: false, error: 'Please enter your administrator password.' };
  }

  const cleanUser = cleanInput.toLowerCase();

  // 1. STRICT ROLE CONTROL: STUDENTS CANNOT ENTER ADMIN PANEL
  if (isStudentIdentifier(cleanUser)) {
    return {
      success: false,
      error: 'Access Denied: Student account detected. Student IDs cannot access the Administrator panel. Please switch to the Student login portal.'
    };
  }

  const adminCreds = getAdminCredentials();
  const isMatchUser =
    cleanUser === (adminCreds.username || 'admin').toLowerCase() ||
    cleanUser === (adminCreds.email || '').toLowerCase() ||
    cleanUser === (adminCreds.id || '').toLowerCase();
  const isMatchPass = cleanPass === (adminCreds.password || 'admin123');

  const allUsers = getUsers();
  const matchedAdminUser = allUsers.find(
    (u) =>
      (u.role?.toLowerCase() === 'admin' || u.role?.toLowerCase() === 'administrator') &&
      (u.username?.toLowerCase() === cleanUser ||
        u.email?.toLowerCase() === cleanUser ||
        u.id?.toLowerCase() === cleanUser)
  );

  if (!isMatchUser && !matchedAdminUser) {
    return {
      success: false,
      error: 'Access Denied: Invalid administrator credentials. Only authorized university administrators may sign in.'
    };
  }

  if (matchedAdminUser && matchedAdminUser.password) {
    if (cleanPass !== matchedAdminUser.password) {
      return { success: false, error: 'Access Denied: Incorrect administrator password.' };
    }
  } else if (!isMatchPass) {
    return { success: false, error: 'Access Denied: Incorrect administrator password.' };
  }

  const session = {
    username: matchedAdminUser?.username || adminCreds.username || 'admin',
    name: matchedAdminUser?.name || adminCreds.name || 'Exam Controller',
    id: matchedAdminUser?.id || adminCreds.id || 'ADM-001',
    role: 'admin',
    email: matchedAdminUser?.email || adminCreds.email || 'admin@univ.edu',
    department: matchedAdminUser?.department || adminCreds.department || 'Office of Academic Affairs & Examination Cell',
    designation: adminCreds.designation || 'Chief Academic Controller & Administrator',
    loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  return { success: true, session };
}


