// =========================================================
// DEFAULT DATA & LOCALSTORAGE PERSISTENCE ACROSS PAGES
// =========================================================
const DEFAULT_DATA = {
  context: { session: '24-25', term: '3.1', section: 'A' },
  courses: [
    { code: 'CSE-3101', title: 'Software Engineering', teacherId: 'T-101', totalClasses: 28, password: 'se3101@pass' },
    { code: 'CSE-3103', title: 'Database Management Systems', teacherId: 'T-102', totalClasses: 30, password: 'dbms@2026' },
    { code: 'CSE-3105', title: 'Computer Networks', teacherId: null, totalClasses: 24, password: 'net3105#pass' }
  ],
  teachers: [
    { id: 'T-101', name: 'Dr. Mahmudul Hasan', email: 'mahmud@univ.edu', password: 'tPass101' },
    { id: 'T-102', name: 'Prof. Farhana Yasmin', email: 'farhana@univ.edu', password: 'tPass102' }
  ],
  students: [
    {
      roll: '2107001',
      name: 'Nazmus Sadat',
      email: '2107001@student.univ.edu',
      password: 'stu001@pass',
      enrolledCourses: ['CSE-3101', 'CSE-3103', 'CSE-3105'],
      attendance: { 'CSE-3101': 26, 'CSE-3103': 27, 'CSE-3105': 20 }
    },
    {
      roll: '2107002',
      name: 'Ayesha Siddiqua',
      email: '2107002@student.univ.edu',
      password: 'stu002@pass',
      enrolledCourses: ['CSE-3101', 'CSE-3103'],
      attendance: { 'CSE-3101': 21, 'CSE-3103': 24 }
    },
    {
      roll: '2107003',
      name: 'Tanvir Ahmed',
      email: '2107003@student.univ.edu',
      password: 'stu003@pass',
      enrolledCourses: ['CSE-3101', 'CSE-3105'],
      attendance: { 'CSE-3101': 15, 'CSE-3105': 12 }
    }
  ],
  adminProfile: {
    name: 'Md. Tariqul Islam',
    empId: 'EMP-2026-009',
    email: 'admin.cse@university.edu',
    contact: '+880 1711-000000',
    superAdminPassword: 'SuperAdmin@2026'
  }
};

function loadState() {
  const saved = localStorage.getItem('smartAttendAdminState');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.students) {
        parsed.students.forEach(s => {
          if (!Array.isArray(s.enrolledCourses)) {
            s.enrolledCourses = Object.keys(s.attendance || {});
          }
        });
      }
      return parsed;
    } catch (e) {}
  }
  localStorage.setItem('smartAttendAdminState', JSON.stringify(DEFAULT_DATA));
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function saveState() {
  localStorage.setItem('smartAttendAdminState', JSON.stringify(AppState));
}

let AppState = loadState();

// =========================================================
// SHARED HELPERS (TOPBAR BADGES & SUB-TABS)
// =========================================================
function populateTopbar() {
  const sEl = document.getElementById('display-session');
  const tEl = document.getElementById('display-term');
  const secEl = document.getElementById('display-section');
  const nameEl = document.getElementById('topbar-admin-name');

  if (sEl) sEl.textContent = AppState.context.session;
  if (tEl) tEl.textContent = AppState.context.term;
  if (secEl) secEl.textContent = AppState.context.section;
  if (nameEl) nameEl.textContent = AppState.adminProfile.name;
}

function switchSubTab(event, targetSubViewId) {
  document.querySelectorAll('.sub-tab').forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');

  document.querySelectorAll('.sub-view').forEach(view => view.classList.add('hidden'));
  document.getElementById(targetSubViewId).classList.remove('hidden');
}

function addCustomOption(selectId, labelName) {
  const newVal = prompt(`Enter custom ${labelName}:`);
  if (!newVal || !newVal.trim()) return;

  const cleanVal = newVal.trim();
  const selectEl = document.getElementById(selectId);
  const exists = Array.from(selectEl.options).some(opt => opt.value.toLowerCase() === cleanVal.toLowerCase());
  if (!exists) {
    const option = document.createElement('option');
    option.value = cleanVal;
    option.textContent = cleanVal;
    selectEl.appendChild(option);
  }
  selectEl.value = cleanVal;
}

// =========================================================
// PAGE-SPECIFIC INITIALIZATION ON LOAD
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  const contextForm = document.getElementById('context-form');
  if (contextForm) {
    contextForm.addEventListener('submit', (e) => {
      e.preventDefault();
      AppState.context.session = document.getElementById('session-select').value;
      AppState.context.term = document.getElementById('term-select').value;
      AppState.context.section = document.getElementById('section-select').value;
      saveState();
      window.location.href = 'courses.html';
    });
    return;
  }

  populateTopbar();
  const page = document.body.getAttribute('data-page');
  if (page === 'courses') initCoursesPage();
  if (page === 'teachers') initTeachersPage();
  if (page === 'students') initStudentsPage();
  if (page === 'profile') initProfilePage();
});

// =========================================================
// 1. COURSES PAGE LOGIC (DASHBOARD, STUDENT ENROLLMENT, ADD)
// =========================================================
function initCoursesPage() {
  renderCoursesTable();
  renderStudentEnrollmentView();

  document.getElementById('add-course-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const code = document.getElementById('course-code').value.trim().toUpperCase();
    const title = document.getElementById('course-title').value.trim();
    const totalClasses = parseInt(document.getElementById('course-classes').value, 10);
    const password = document.getElementById('course-password').value.trim();

    if (AppState.courses.some(c => c.code === code)) {
      alert('Course code already exists!');
      return;
    }

    AppState.courses.push({ code, title, teacherId: null, totalClasses, password });
    saveState();

    e.target.reset();
    alert(`Course ${code} added successfully!`);
    renderCoursesTable();
    renderStudentEnrollmentView();
  });

  document.getElementById('assign-student-course-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const rollVal = document.getElementById('enroll-student-select').value;
    const courseCode = document.getElementById('enroll-course-select').value;
    if (!rollVal || !courseCode) return;

    const targetStudents = rollVal === 'ALL_STUDENTS'
      ? AppState.students
      : AppState.students.filter(s => s.roll === rollVal);

    targetStudents.forEach(stu => {
      if (!stu.enrolledCourses.includes(courseCode)) {
        stu.enrolledCourses.push(courseCode);
        if (stu.attendance[courseCode] === undefined) {
          stu.attendance[courseCode] = 0;
        }
      }
    });

    saveState();
    renderCoursesTable();
    renderStudentEnrollmentView();
  });
}

function renderCoursesTable() {
  const tbody = document.getElementById('courses-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  AppState.courses.forEach(course => {
    const teacher = AppState.teachers.find(t => t.id === course.teacherId);
    const teacherName = teacher ? `${teacher.name} (${teacher.id})` : '<span class="muted">Unassigned</span>';
    const enrolledCount = AppState.students.filter(s => s.enrolledCourses.includes(course.code)).length;

    tbody.innerHTML += `
      <tr>
        <td><strong>${course.code}</strong></td>
        <td>${course.title}</td>
        <td>${teacherName}</td>
        <td>${enrolledCount} Student(s)</td>
        <td>${course.totalClasses}</td>
        <td><span class="pass-code">${course.password}</span></td>
        <td>
          <button class="btn-sm btn-info" onclick="openCourseModal('${course.code}')">
            <i class="fa-solid fa-users"></i> Student Attendance
          </button>
          <button class="btn-sm btn-danger" onclick="removeCourse('${course.code}')">
            <i class="fa-solid fa-trash"></i> Remove Course
          </button>
        </td>
      </tr>
    `;
  });
}

function renderStudentEnrollmentView() {
  const tbody = document.getElementById('student-enrollment-body');
  const stuSelect = document.getElementById('enroll-student-select');
  const courseSelect = document.getElementById('enroll-course-select');
  if (!tbody || !stuSelect || !courseSelect) return;

  stuSelect.innerHTML = `
    <option value="">-- Select Student --</option>
    <option value="ALL_STUDENTS">All Registered Students (Bulk Assign)</option>
  `;
  AppState.students.forEach(s => {
    stuSelect.innerHTML += `<option value="${s.roll}">${s.roll} - ${s.name}</option>`;
  });

  courseSelect.innerHTML = '<option value="">-- Select Course --</option>';
  AppState.courses.forEach(c => {
    courseSelect.innerHTML += `<option value="${c.code}">${c.code} - ${c.title}</option>`;
  });

  tbody.innerHTML = '';
  AppState.students.forEach(stu => {
    const chipsHTML = stu.enrolledCourses.length
      ? stu.enrolledCourses.map(code => `
          <span class="course-chip">
            ${code}
            <button title="Unassign Course" onclick="unassignStudentCourse('${stu.roll}', '${code}')">&times;</button>
          </span>
        `).join('')
      : '<span class="muted">No courses assigned</span>';

    tbody.innerHTML += `
      <tr>
        <td><strong>${stu.roll}</strong></td>
        <td>${stu.name}</td>
        <td>${chipsHTML}</td>
      </tr>
    `;
  });
}

function unassignStudentCourse(roll, courseCode) {
  const student = AppState.students.find(s => s.roll === roll);
  if (!student) return;
  student.enrolledCourses = student.enrolledCourses.filter(c => c !== courseCode);
  delete student.attendance[courseCode];
  saveState();
  renderCoursesTable();
  renderStudentEnrollmentView();
}

function removeCourse(code) {
  if (!confirm(`Are you sure you want to remove course ${code}?`)) return;
  AppState.courses = AppState.courses.filter(c => c.code !== code);
  AppState.students.forEach(s => {
    s.enrolledCourses = s.enrolledCourses.filter(c => c !== code);
    delete s.attendance[code];
  });
  saveState();
  renderCoursesTable();
  renderStudentEnrollmentView();
}

function openCourseModal(courseCode) {
  const course = AppState.courses.find(c => c.code === courseCode);
  if (!course) return;

  const teacher = AppState.teachers.find(t => t.id === course.teacherId);
  document.getElementById('modal-course-title').textContent = `${course.code}: ${course.title}`;
  document.getElementById('modal-course-meta').innerHTML = `
    <strong>Course Teacher:</strong> ${teacher ? teacher.name : 'Not Assigned'} &nbsp;|&nbsp;
    <strong>Total Classes Held:</strong> ${course.totalClasses} &nbsp;|&nbsp;
    <strong>Course Password:</strong> <span class="pass-code">${course.password}</span>
  `;

  const tbody = document.getElementById('modal-students-body');
  tbody.innerHTML = '';

  const enrolledStudents = AppState.students.filter(s => s.enrolledCourses.includes(course.code));
  if (enrolledStudents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="muted">No students enrolled in this course yet.</td></tr>`;
  } else {
    enrolledStudents.forEach(stu => {
      const attended = stu.attendance[course.code] || 0;
      const pct = course.totalClasses > 0 ? Math.round((attended / course.totalClasses) * 100) : 0;
      const pillClass = pct >= 75 ? 'pill-good' : pct >= 60 ? 'pill-warn' : 'pill-low';

      tbody.innerHTML += `
        <tr>
          <td>${stu.roll}</td>
          <td>${stu.name}</td>
          <td>${attended} / ${course.totalClasses}</td>
          <td><span class="pill ${pillClass}">${pct}%</span></td>
        </tr>
      `;
    });
  }

  document.getElementById('course-modal').classList.remove('hidden');
}

function closeCourseModal() {
  document.getElementById('course-modal').classList.add('hidden');
}

// =========================================================
// 2. TEACHERS PAGE LOGIC
// =========================================================
function initTeachersPage() {
  renderTeachersView();

  document.getElementById('assign-course-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const teacherId = document.getElementById('assign-teacher-select').value;
    const courseCode = document.getElementById('assign-course-select').value;

    const course = AppState.courses.find(c => c.code === courseCode);
    if (course) {
      course.teacherId = teacherId;
      saveState();
      renderTeachersView();
    }
  });

  document.getElementById('add-teacher-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('teacher-id').value.trim().toUpperCase();
    const name = document.getElementById('teacher-name').value.trim();
    const email = document.getElementById('teacher-email').value.trim();
    const password = document.getElementById('teacher-password').value.trim();

    if (AppState.teachers.some(t => t.id === id)) {
      alert('Teacher ID already exists!');
      return;
    }

    AppState.teachers.push({ id, name, email, password });
    saveState();
    e.target.reset();
    alert(`Teacher ${name} added!`);
    renderTeachersView();
  });

  document.getElementById('remove-teacher-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const teacherId = document.getElementById('remove-teacher-select').value;
    if (!teacherId) return;

    const teacher = AppState.teachers.find(t => t.id === teacherId);
    if (!confirm(`Are you sure you want to remove ${teacher.name} (${teacherId})?`)) return;

    AppState.teachers = AppState.teachers.filter(t => t.id !== teacherId);
    AppState.courses.forEach(c => {
      if (c.teacherId === teacherId) c.teacherId = null;
    });

    saveState();
    e.target.reset();
    alert(`Teacher ${teacherId} removed successfully.`);
    renderTeachersView();
  });
}

function renderTeachersView() {
  const tbody = document.getElementById('teachers-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  AppState.teachers.forEach(teacher => {
    const assignedCourses = AppState.courses.filter(c => c.teacherId === teacher.id);
    const chipsHTML = assignedCourses.length
      ? assignedCourses.map(c => `
          <span class="course-chip">
            ${c.code}
            <button title="Unassign Course" onclick="unassignCourse('${c.code}')">&times;</button>
          </span>
        `).join('')
      : '<span class="muted">No courses assigned</span>';

    tbody.innerHTML += `
      <tr>
        <td><strong>${teacher.id}</strong></td>
        <td>${teacher.name}</td>
        <td>${teacher.email}</td>
        <td><span class="pass-code">${teacher.password}</span></td>
        <td>${chipsHTML}</td>
      </tr>
    `;
  });

  const assignSelect = document.getElementById('assign-teacher-select');
  const removeSelect = document.getElementById('remove-teacher-select');
  const courseSelect = document.getElementById('assign-course-select');

  assignSelect.innerHTML = '<option value="">-- Select Teacher --</option>';
  removeSelect.innerHTML = '<option value="">-- Select Teacher to Remove --</option>';
  AppState.teachers.forEach(t => {
    const opt = `<option value="${t.id}">${t.name} (${t.id})</option>`;
    assignSelect.innerHTML += opt;
    removeSelect.innerHTML += opt;
  });

  courseSelect.innerHTML = '<option value="">-- Select Course --</option>';
  AppState.courses.forEach(c => {
    courseSelect.innerHTML += `<option value="${c.code}">${c.code} - ${c.title}</option>`;
  });
}

function unassignCourse(courseCode) {
  const course = AppState.courses.find(c => c.code === courseCode);
  if (course) {
    course.teacherId = null;
    saveState();
    renderTeachersView();
  }
}

// =========================================================
// 3. STUDENTS PAGE LOGIC (INFO, ROLL SEARCH REPORT, ADD, REMOVE)
// =========================================================
function initStudentsPage() {
  populateStudentDropdowns();
  renderStudentsTable();

  document.getElementById('roll-search-input').addEventListener('input', renderStudentsTable);

  // Individual Student Attendance Record Search
  document.getElementById('att-roll-search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const rollQuery = document.getElementById('att-roll-search-input').value.trim();
    renderSingleStudentAttendanceReport(rollQuery);
  });

  document.getElementById('remove-student-select').addEventListener('change', (e) => {
    document.getElementById('remove-student-roll-input').value = e.target.value;
  });

  document.getElementById('register-student-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const roll = document.getElementById('student-roll').value.trim();
    const name = document.getElementById('student-name').value.trim();
    const email = document.getElementById('student-email').value.trim();
    const password = document.getElementById('student-password').value.trim();

    if (AppState.students.some(s => s.roll === roll)) {
      alert('Student with this roll number is already registered!');
      return;
    }

    AppState.students.push({
      roll,
      name,
      email,
      password,
      enrolledCourses: [],
      attendance: {}
    });
    saveState();
    e.target.reset();
    alert(`Student ${name} (Roll: ${roll}) registered!`);
    populateStudentDropdowns();
    renderStudentsTable();
  });

  document.getElementById('remove-student-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const roll = document.getElementById('remove-student-roll-input').value.trim();
    const student = AppState.students.find(s => s.roll === roll);

    if (!student) {
      alert(`No student found with Roll Number: ${roll}`);
      return;
    }

    if (!confirm(`Are you sure you want to remove ${student.name} (Roll: ${roll})?`)) return;

    AppState.students = AppState.students.filter(s => s.roll !== roll);
    saveState();
    e.target.reset();
    alert(`Student ${roll} removed successfully.`);
    populateStudentDropdowns();
    renderStudentsTable();
  });
}

function populateStudentDropdowns() {
  const removeStudentSelect = document.getElementById('remove-student-select');
  if (!removeStudentSelect) return;

  removeStudentSelect.innerHTML = '<option value="">-- Choose Student --</option>';
  AppState.students.forEach(s => {
    removeStudentSelect.innerHTML += `<option value="${s.roll}">${s.roll} - ${s.name}</option>`;
  });
}

function renderStudentsTable() {
  const tbody = document.getElementById('students-table-body');
  if (!tbody) return;
  const rollQuery = document.getElementById('roll-search-input').value.trim().toLowerCase();

  tbody.innerHTML = '';
  AppState.students
    .filter(s => s.roll.toLowerCase().includes(rollQuery))
    .forEach(stu => {
      tbody.innerHTML += `
        <tr>
          <td><strong>${stu.roll}</strong></td>
          <td>${stu.name}</td>
          <td>${stu.email}</td>
          <td><span class="pass-code">${stu.password}</span></td>
        </tr>
      `;
    });
}

function renderSingleStudentAttendanceReport(rollQuery) {
  const container = document.getElementById('student-att-report-container');
  const student = AppState.students.find(s => s.roll.toLowerCase() === rollQuery.toLowerCase());

  if (!student) {
    container.innerHTML = `
      <div class="empty-search-state" style="border-color: #fecaca;">
        <i class="fa-solid fa-circle-exclamation" style="color: var(--danger);"></i>
        <h4>Student Not Found</h4>
        <p class="muted">No registered student found with Roll Number <strong>"${rollQuery}"</strong> in the current Session/Term/Section.</p>
      </div>
    `;
    return;
  }

  const enrolledCourseObjs = AppState.courses.filter(c => student.enrolledCourses.includes(c.code));

  let totalAttended = 0;
  let totalHeld = 0;
  let rowsHTML = '';

  if (enrolledCourseObjs.length === 0) {
    rowsHTML = `<tr><td colspan="5" class="muted">This student is not enrolled in any courses yet. Assign courses in Course Management.</td></tr>`;
  } else {
    enrolledCourseObjs.forEach(course => {
      const attended = student.attendance[course.code] || 0;
      const held = course.totalClasses;
      totalAttended += attended;
      totalHeld += held;

      const pct = held > 0 ? Math.round((attended / held) * 100) : 0;
      const statusText = pct >= 75 ? 'Eligible' : pct >= 60 ? 'Warning' : 'Shortage';
      const pillClass = pct >= 75 ? 'pill-good' : pct >= 60 ? 'pill-warn' : 'pill-low';
      const fillClass = pct >= 75 ? 'fill-good' : pct >= 60 ? 'fill-warn' : 'fill-low';

      rowsHTML += `
        <tr>
          <td><strong>${course.code}</strong></td>
          <td>${course.title}</td>
          <td>${attended} / ${held}</td>
          <td>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill ${fillClass}" style="width: ${pct}%;"></div>
            </div>
            <strong>${pct}%</strong>
          </td>
          <td><span class="pill ${pillClass}">${statusText}</span></td>
        </tr>
      `;
    });
  }

  const overallPct = totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 100) : 0;
  const overallStatus = overallPct >= 75 ? 'Eligible' : overallPct >= 60 ? 'Warning' : 'Shortage';
  const overallPill = overallPct >= 75 ? 'pill-good' : overallPct >= 60 ? 'pill-warn' : 'pill-low';
  const initials = student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  container.innerHTML = `
    <div class="student-report-card">
      <div class="report-header">
        <div class="report-student-info">
          <div class="report-avatar">${initials}</div>
          <div>
            <h3>${student.name}</h3>
            <p><strong>Roll No:</strong> ${student.roll} &nbsp;|&nbsp; <strong>Email:</strong> ${student.email}</p>
          </div>
        </div>
        <div class="report-overall-box">
          <span class="label">Overall Attendance</span>
          <strong class="pct-big">${overallPct}%</strong>
          <span class="pill ${overallPill}">${overallStatus}</span>
        </div>
      </div>

      <div class="table-responsive" style="border: none; border-radius: 0;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Title</th>
              <th>Attended / Total</th>
              <th>Attendance Percentage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// =========================================================
// 4. PROFILE PAGE LOGIC
// =========================================================
function initProfilePage() {
  const p = AppState.adminProfile;
  document.getElementById('admin-name').value = p.name;
  document.getElementById('admin-emp-id').value = p.empId;
  document.getElementById('admin-email').value = p.email;
  document.getElementById('admin-contact').value = p.contact;
  document.getElementById('admin-super-pass').value = p.superAdminPassword;
  document.getElementById('profile-display-name').textContent = p.name;

  document.getElementById('admin-profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    p.name = document.getElementById('admin-name').value.trim();
    p.empId = document.getElementById('admin-emp-id').value.trim();
    p.email = document.getElementById('admin-email').value.trim();
    p.contact = document.getElementById('admin-contact').value.trim();

    saveState();
    document.getElementById('profile-display-name').textContent = p.name;
    populateTopbar();
    alert('Admin profile updated successfully!');
  });
}

function toggleSuperPass() {
  const passInput = document.getElementById('admin-super-pass');
  const icon = document.getElementById('pass-eye-icon');
  if (passInput.type === 'password') {
    passInput.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    passInput.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}