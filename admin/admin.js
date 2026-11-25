// =========================================================
// SHARED APPLICATION STATE (Replace with API/DB calls later)
// =========================================================
const AppState = {
  context: {
    session: '24-25',
    term: '3.1',
    section: 'A'
  },
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
      attendance: { 'CSE-3101': 26, 'CSE-3103': 27, 'CSE-3105': 20 }
    },
    {
      roll: '2107002',
      name: 'Ayesha Siddiqua',
      email: '2107002@student.univ.edu',
      password: 'stu002@pass',
      attendance: { 'CSE-3101': 21, 'CSE-3103': 24, 'CSE-3105': 19 }
    },
    {
      roll: '2107003',
      name: 'Tanvir Ahmed',
      email: '2107003@student.univ.edu',
      password: 'stu003@pass',
      attendance: { 'CSE-3101': 15, 'CSE-3103': 18, 'CSE-3105': 12 }
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

// =========================================================
// STEP 1: CONTEXT CUSTOMIZATION & ENTRY
// =========================================================
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

document.getElementById('context-form').addEventListener('submit', (e) => {
  e.preventDefault();
  AppState.context.session = document.getElementById('session-select').value;
  AppState.context.term = document.getElementById('term-select').value;
  AppState.context.section = document.getElementById('section-select').value;

  document.getElementById('display-session').textContent = AppState.context.session;
  document.getElementById('display-term').textContent = AppState.context.term;
  document.getElementById('display-section').textContent = AppState.context.section;
  document.getElementById('topbar-admin-name').textContent = AppState.adminProfile.name;

  document.getElementById('context-screen').classList.add('hidden');
  document.getElementById('admin-dashboard').classList.remove('hidden');

  // Load default module (courses.html)
  loadModule('courses.html', 'initCoursesModule');
});

document.getElementById('change-context-btn').addEventListener('click', () => {
  document.getElementById('admin-dashboard').classList.add('hidden');
  document.getElementById('context-screen').classList.remove('hidden');
});

// =========================================================
// DYNAMIC MODULE LOADER & SUB-TAB SWITCHER
// =========================================================
async function loadModule(pageUrl, initFnName) {
  const container = document.getElementById('module-container');
  try {
    const response = await fetch(pageUrl);
    if (!response.ok) throw new Error(`Failed to load ${pageUrl}`);
    container.innerHTML = await response.text();

    if (typeof window[initFnName] === 'function') {
      window[initFnName]();
    }
  } catch (err) {
    container.innerHTML = `
      <div class="form-card">
        <h3>Error Loading Module</h3>
        <p class="muted">Could not load <strong>${pageUrl}</strong>. Make sure you are running the project via a local web server (e.g., Live Server).</p>
      </div>
    `;
    console.error(err);
  }
}

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const page = btn.getAttribute('data-page');
    const initFn = btn.getAttribute('data-init');
    loadModule(page, initFn);
  });
});

function switchSubTab(event, targetSubViewId) {
  const container = document.getElementById('module-container');
  container.querySelectorAll('.sub-tab').forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');

  container.querySelectorAll('.sub-view').forEach(view => view.classList.add('hidden'));
  document.getElementById(targetSubViewId).classList.remove('hidden');
}

// =========================================================
// MODULE 1: COURSES (courses.html)
// =========================================================
function initCoursesModule() {
  renderCoursesTable();

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
    AppState.students.forEach(s => { s.attendance[code] = 0; });

    e.target.reset();
    alert(`Course ${code} added successfully!`);
    renderCoursesTable();
  });
}

function renderCoursesTable() {
  const tbody = document.getElementById('courses-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  AppState.courses.forEach(course => {
    const teacher = AppState.teachers.find(t => t.id === course.teacherId);
    const teacherName = teacher ? `${teacher.name} (${teacher.id})` : '<span class="muted">Unassigned</span>';

    tbody.innerHTML += `
      <tr>
        <td><strong>${course.code}</strong></td>
        <td>${course.title}</td>
        <td>${teacherName}</td>
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

function removeCourse(code) {
  if (!confirm(`Are you sure you want to remove course ${code}?`)) return;
  AppState.courses = AppState.courses.filter(c => c.code !== code);
  AppState.students.forEach(s => delete s.attendance[code]);
  renderCoursesTable();
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

  AppState.students.forEach(stu => {
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

  document.getElementById('course-modal').classList.remove('hidden');
}

function closeCourseModal() {
  document.getElementById('course-modal').classList.add('hidden');
}

// =========================================================
// MODULE 2: TEACHERS (teachers.html)
// =========================================================
function initTeachersModule() {
  renderTeachersView();

  document.getElementById('assign-course-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const teacherId = document.getElementById('assign-teacher-select').value;
    const courseCode = document.getElementById('assign-course-select').value;

    const course = AppState.courses.find(c => c.code === courseCode);
    if (course) {
      course.teacherId = teacherId;
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
    renderTeachersView();
  }
}

// =========================================================
// MODULE 3: STUDENTS (students.html)
// =========================================================
function initStudentsModule() {
  populateStudentDropdowns();
  renderStudentsTable();
  renderAttendanceRecords();

  document.getElementById('roll-search-input').addEventListener('input', renderStudentsTable);
  document.getElementById('att-roll-search-input').addEventListener('input', renderAttendanceRecords);
  document.getElementById('attendance-course-filter').addEventListener('change', renderAttendanceRecords);

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

    const initialAttendance = {};
    AppState.courses.forEach(c => { initialAttendance[c.code] = 0; });

    AppState.students.push({ roll, name, email, password, attendance: initialAttendance });
    e.target.reset();
    alert(`Student ${name} (Roll: ${roll}) registered!`);
    populateStudentDropdowns();
    renderStudentsTable();
    renderAttendanceRecords();
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
    e.target.reset();
    alert(`Student ${roll} removed successfully.`);
    populateStudentDropdowns();
    renderStudentsTable();
    renderAttendanceRecords();
  });
}

function populateStudentDropdowns() {
  const attCourseSelect = document.getElementById('attendance-course-filter');
  const removeStudentSelect = document.getElementById('remove-student-select');

  attCourseSelect.innerHTML = '<option value="ALL">All Courses (Breakdown)</option>';
  AppState.courses.forEach(c => {
    attCourseSelect.innerHTML += `<option value="${c.code}">${c.code} - ${c.title}</option>`;
  });

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

function renderAttendanceRecords() {
  const tbody = document.getElementById('attendance-records-body');
  if (!tbody) return;
  const rollQuery = document.getElementById('att-roll-search-input').value.trim().toLowerCase();
  const selectedCourse = document.getElementById('attendance-course-filter').value;

  tbody.innerHTML = '';
  const filteredStudents = AppState.students.filter(s => s.roll.toLowerCase().includes(rollQuery));
  const targetCourses = selectedCourse === 'ALL'
    ? AppState.courses
    : AppState.courses.filter(c => c.code === selectedCourse);

  filteredStudents.forEach(stu => {
    targetCourses.forEach(course => {
      const attended = stu.attendance[course.code] || 0;
      const total = course.totalClasses;
      const pct = total > 0 ? Math.round((attended / total) * 100) : 0;
      const statusText = pct >= 75 ? 'Eligible' : pct >= 60 ? 'Warning' : 'Shortage';
      const pillClass = pct >= 75 ? 'pill-good' : pct >= 60 ? 'pill-warn' : 'pill-low';

      tbody.innerHTML += `
        <tr>
          <td><strong>${stu.roll}</strong></td>
          <td>${stu.name}</td>
          <td><strong>${course.code}</strong> - ${course.title}</td>
          <td>${attended} / ${total}</td>
          <td><strong>${pct}%</strong></td>
          <td><span class="pill ${pillClass}">${statusText}</span></td>
        </tr>
      `;
    });
  });
}

// =========================================================
// MODULE 4: ADMIN PROFILE (profile.html)
// =========================================================
function initProfileModule() {
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

    document.getElementById('profile-display-name').textContent = p.name;
    document.getElementById('topbar-admin-name').textContent = p.name;
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