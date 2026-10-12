// Shared Backlog Store with localStorage synchronization
const STORAGE_KEY = 'backtrack_backlog_records';

export const INITIAL_BACKLOG_RECORDS = [
  {
    id: 'BL-101',
    studentId: 'STU-02',
    studentName: 'Sneha Deshmukh',
    usn: '1BT23BCA048',
    semester: 'Sem 3 (Odd)',
    subjectCode: 'BCA202',
    subjectName: 'Discrete Mathematics',
    backlogReason: 'Low Marks in End-Sem', // 'Low Marks in End-Sem', 'Attendance Shortage', 'Missed Internal Exam'
    originalMarks: 32,
    maxMarks: 100,
    clearanceStatus: 'In Review', // 'Pending Clearance', 'In Review', 'Cleared'
    // Student update fields
    metTeacher: false, // Whether student has met the relevant teacher
    assignmentsCompleted: 'Completed', // Whether required assignments have been completed ('Completed' | 'Pending')
    teacherConsultation: 'Pending Guidance', // Whether student visited teacher for guidance ('Completed' | 'Pending Guidance')
    repeatExamStatus: 'Preparing', // 'Not started' | 'Preparing' | 'Scheduled' | 'Appeared'
    resultStatus: 'Awaiting result', // 'Awaiting result' | 'Cleared' | 'Not cleared'
    studentRemarks: 'Completed Unit 1-3 assignment questions. Scheduled to visit teacher cabin this Thursday for doubt clearance.',
    lastUpdated: 'Today, 09:30 AM',
    facultyClearedDate: null,
    facultyNotes: 'Waiting for student consultation on Graph Theory doubts.'
  },
  {
    id: 'BL-102',
    studentId: 'STU-05',
    studentName: 'Karan Johar',
    usn: '1BT23BCA055',
    semester: 'Sem 3 (Odd)',
    subjectCode: 'BCA301',
    subjectName: 'Database Management Systems',
    backlogReason: 'Low Marks in End-Sem',
    originalMarks: 28,
    maxMarks: 50,
    clearanceStatus: 'Pending Clearance',
    metTeacher: true,
    assignmentsCompleted: 'Completed',
    teacherConsultation: 'Completed',
    repeatExamStatus: 'Appeared',
    resultStatus: 'Awaiting result',
    studentRemarks: 'Submitted all 5 database normalization labs and appeared for the re-exam on Oct 08.',
    lastUpdated: 'Yesterday, 04:15 PM',
    facultyClearedDate: null,
    facultyNotes: 'Evaluation paper sent to exam cell.'
  },
  {
    id: 'BL-103',
    studentId: 'STU-03',
    studentName: 'Vikram Mehta',
    usn: '1BT23BCA089',
    semester: 'Sem 3 (Odd)',
    subjectCode: 'BCA101',
    subjectName: 'Intro to Programming in C',
    backlogReason: 'Attendance Shortage',
    originalMarks: 34,
    maxMarks: 100,
    clearanceStatus: 'In Review',
    metTeacher: true,
    assignmentsCompleted: 'Completed',
    teacherConsultation: 'Completed',
    repeatExamStatus: 'Scheduled',
    resultStatus: 'Awaiting result',
    studentRemarks: 'Completed remedial lab sessions with Prof. Sen and exam hall ticket verified for Nov 18.',
    lastUpdated: 'Oct 10, 2026, 02:45 PM',
    facultyClearedDate: null,
    facultyNotes: 'Remedial hours verified.'
  },
  {
    id: 'BL-104',
    studentId: 'STU-05',
    studentName: 'Karan Johar',
    usn: '1BT23BCA055',
    semester: 'Sem 3 (Odd)',
    subjectCode: 'BCA204',
    subjectName: 'Financial Accounting',
    backlogReason: 'Low Marks in End-Sem',
    originalMarks: 24,
    maxMarks: 100,
    clearanceStatus: 'Pending Clearance',
    metTeacher: false,
    assignmentsCompleted: 'Pending',
    teacherConsultation: 'Pending Guidance',
    repeatExamStatus: 'Preparing',
    resultStatus: 'Not cleared',
    studentRemarks: 'Working on Chapter 4 balance sheet assignments. Will meet subject teacher next Monday.',
    lastUpdated: 'Oct 09, 2026, 11:20 AM',
    facultyClearedDate: null,
    facultyNotes: null
  },
  {
    id: 'BL-105',
    studentId: 'STU-07',
    studentName: 'Rohan Gupta',
    usn: '1BT22ECE082',
    semester: 'Sem 2 (Even)',
    subjectCode: 'ECE102',
    subjectName: 'Basic Electrical Eng',
    backlogReason: 'Low Marks in End-Sem',
    originalMarks: 31,
    maxMarks: 100,
    clearanceStatus: 'Cleared',
    metTeacher: true,
    assignmentsCompleted: 'Completed',
    teacherConsultation: 'Completed',
    repeatExamStatus: 'Appeared',
    resultStatus: 'Cleared',
    studentRemarks: 'Passed repeat examination with 68/100. Verification completed.',
    lastUpdated: 'Oct 08, 2026, 05:00 PM',
    facultyClearedDate: 'Oct 09, 2026',
    facultyNotes: 'Cleared and certified by Academic Board.'
  },
  {
    id: 'BL-106',
    studentId: 'STU-01',
    studentName: 'Aarav Patel',
    usn: '1BT23BCA014',
    semester: 'Sem 3 (Odd)',
    subjectCode: 'BCA202',
    subjectName: 'Computer Organization & Architecture',
    backlogReason: 'Low Marks in End-Sem',
    originalMarks: 36,
    maxMarks: 100,
    clearanceStatus: 'In Review',
    metTeacher: true,
    assignmentsCompleted: 'Completed',
    teacherConsultation: 'Completed',
    repeatExamStatus: 'Preparing',
    resultStatus: 'Awaiting result',
    studentRemarks: 'Completed CPU pipelining and cache memory assignments. Preparing for scheduled re-exam.',
    lastUpdated: 'Today, 10:45 AM',
    facultyClearedDate: null,
    facultyNotes: 'Approved for repeat exam.'
  }
];

export function getBacklogRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading backlog records from localStorage', e);
  }
  // If not set yet, initialize and return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BACKLOG_RECORDS));
  } catch {}
  return INITIAL_BACKLOG_RECORDS;
}

export function saveBacklogRecords(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent('backtrack_backlog_updated', { detail: records }));
  } catch (e) {
    console.warn('Error saving backlog records to localStorage', e);
  }
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

export function addFacultyAdvice(recordId, adviceText, facultyAuthor = 'Dr. Ramesh Sharma') {
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

export const DEMO_STUDENTS = [
  {
    id: 'STU-01',
    name: 'Aarav Patel',
    usn: '1BT23BCA014',
    course: 'Bachelor of Computer Applications (BCA)',
    semester: 'Semester 3',
    semesterType: 'Odd Semester',
    section: 'Section A',
    email: 'aarav.p@student.univ.edu',
    phone: '+91 98765 43210',
    advisor: 'Dr. Ramesh Sharma (HOD)',
    cgpa: 8.74,
    creditsEarned: 52,
    totalCredits: 140,
    midsemAverage: 88.5
  },
  {
    id: 'STU-02',
    name: 'Sneha Deshmukh',
    usn: '1BT23BCA048',
    course: 'Bachelor of Computer Applications (BCA)',
    semester: 'Semester 3',
    semesterType: 'Odd Semester',
    section: 'Section B',
    email: 'sneha.d@student.univ.edu',
    phone: '+91 98451 22334',
    advisor: 'Prof. Ananya Sen',
    cgpa: 7.62,
    creditsEarned: 48,
    totalCredits: 140,
    midsemAverage: 76.0
  },
  {
    id: 'STU-05',
    name: 'Karan Johar',
    usn: '1BT23BCA055',
    course: 'Bachelor of Computer Applications (BCA)',
    semester: 'Semester 3',
    semesterType: 'Odd Semester',
    section: 'Section B',
    email: 'karan.j@student.univ.edu',
    phone: '+91 97412 88710',
    advisor: 'Dr. Ramesh Sharma (HOD)',
    cgpa: 6.90,
    creditsEarned: 42,
    totalCredits: 140,
    midsemAverage: 65.5
  },
  {
    id: 'STU-03',
    name: 'Vikram Mehta',
    usn: '1BT23BCA089',
    course: 'Bachelor of Computer Applications (BCA)',
    semester: 'Semester 3',
    semesterType: 'Odd Semester',
    section: 'Section A',
    email: 'vikram.m@student.univ.edu',
    phone: '+91 99160 55412',
    advisor: 'Prof. S. Ranganath',
    cgpa: 7.20,
    creditsEarned: 46,
    totalCredits: 140,
    midsemAverage: 71.0
  },
  {
    id: 'STU-07',
    name: 'Rohan Gupta',
    usn: '1BT22ECE082',
    course: 'B.Tech Electronics & Comm. Eng.',
    semester: 'Semester 2',
    semesterType: 'Even Semester',
    section: 'Section C',
    email: 'rohan.g@student.univ.edu',
    phone: '+91 98200 11982',
    advisor: 'Dr. Arvind Rao',
    cgpa: 7.85,
    creditsEarned: 44,
    totalCredits: 160,
    midsemAverage: 78.0
  }
];

