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

    // Auto-sanitize session if admin had student credentials (anirudh / 24215107)
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
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
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

// ==========================================
// STUDENTS CRUD
// ==========================================
export function getStudents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading students', e);
  }
  return [];
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
  const newStudent = {
    id: student.id || `STU-${Date.now().toString().slice(-4)}`,
    status: student.status || 'Active',
    enrolledSubjects: student.enrolledSubjects || [],
    backlogsHistory: student.backlogsHistory || [],
    backlogsCount: Number(student.backlogsCount || 0),
    cgpa: Number(student.cgpa || 0),
    midsemMarks: Number(student.midsemMarks || 0),
    endsemStatus: student.endsemStatus || 'Eligible',
    ...student
  };
  const updated = [newStudent, ...current];
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
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading teachers', e);
  }
  return [];
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
  const newTeacher = {
    id: teacher.id || `TCH-${Date.now().toString().slice(-4)}`,
    subjects: teacher.subjects || [],
    sections: teacher.sections || [],
    hoursPerWeek: Number(teacher.hoursPerWeek || 14),
    ...teacher
  };
  const updated = [newTeacher, ...current];
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
    }
  } catch (e) {
    console.warn('Error purging all data', e);
  }
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
];

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
            s.email?.toLowerCase() === clean
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


