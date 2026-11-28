
// ========================================
// SMART ATTENDANCE SYSTEM - TAKE ATTENDANCE
// ========================================

// 1. Check teacher login
if (sessionStorage.getItem("teacherLoggedIn") !== "true") {
    window.location.href = "./teacher-login.html";
}

// 2. Get selected course information
const selectedCourse = sessionStorage.getItem("selectedCourse");
const selectedCourseName = sessionStorage.getItem("selectedCourseName");

const courseCodeElement = document.getElementById("courseCode");
const courseNameElement = document.getElementById("courseName");

if (!selectedCourse) {
    alert("Please select a course first.");
    window.location.href = "./teacher-dashboard.html";
}

// Display course information
courseCodeElement.textContent = selectedCourse || "";
courseNameElement.textContent = selectedCourseName || "";

// 3. Sample student list (synthetic data)
const students = [
    { name: "Student 01", roll: "2301001" },
    { name: "Student 02", roll: "2301002" },
    { name: "Student 03", roll: "2301003" },
    { name: "Student 04", roll: "2301004" },
    { name: "Student 05", roll: "2301005" },
    { name: "Student 06", roll: "2301006" },
    { name: "Student 07", roll: "2301007" },
    { name: "Student 08", roll: "2301008" },
    { name: "Student 09", roll: "2301009" },
    { name: "Student 10", roll: "2301010" }
];

// 4. Get HTML elements
const sessionChoice = document.getElementById("sessionChoice");
const attendanceArea = document.getElementById("attendanceArea");
const completedArea = document.getElementById("completedArea");

const continueSessionBtn = document.getElementById("continueSessionBtn");
const newSessionBtn = document.getElementById("newSessionBtn");

const studentName = document.getElementById("studentName");
const studentRoll = document.getElementById("studentRoll");

const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");

const attendanceMessage = document.getElementById("attendanceMessage");

const presentBtn = document.getElementById("presentBtn");
const absentBtn = document.getElementById("absentBtn");
const stopBtn = document.getElementById("stopBtn");

const backToCourseBtn = document.getElementById("backToCourseBtn");
const backAfterCompleteBtn = document.getElementById("backAfterCompleteBtn");

// 5. Attendance storage
const STORAGE_KEY = "kuetTeacherAttendance";

let attendanceData = {};

try {
    attendanceData = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}"
    );
} catch (error) {
    attendanceData = {};
}

let currentSession = null;
let currentStudentIndex = 0;

// Save attendance data in localStorage
function saveAttendanceData() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(attendanceData)
    );
}

// Get sessions for the selected course
function getCourseSessions() {
    if (!attendanceData[selectedCourse]) {
        attendanceData[selectedCourse] = {
            sessions: []
        };
    }

    return attendanceData[selectedCourse].sessions;
}

// 6. Find an unfinished session
function findUnfinishedSession() {
    const sessions = getCourseSessions();

    return sessions.find(session => session.completed === false);
}

// 7. Create a new attendance session
function createNewSession() {
    const sessions = getCourseSessions();

    currentSession = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        students: students.map(student => ({ ...student })),
        statuses: {},
        completed: false
    };

    sessions.push(currentSession);

    saveAttendanceData();

    sessionChoice.hidden = true;
    completedArea.hidden = true;
    attendanceArea.hidden = false;

    currentStudentIndex = 0;

    showCurrentStudent();
}

// 8. Continue an unfinished session
function continuePreviousSession() {
    currentSession = findUnfinishedSession();

    if (!currentSession) {
        createNewSession();
        return;
    }

    // Keep the original student list for this session
    if (!currentSession.students) {
        currentSession.students = students.map(student => ({ ...student }));
    }

    if (!currentSession.statuses) {
        currentSession.statuses = {};
    }

    sessionChoice.hidden = true;
    attendanceArea.hidden = false;
    completedArea.hidden = true;

    currentStudentIndex = 0;

    showCurrentStudent();
}

// 9. Display the next unmarked student
function showCurrentStudent() {
    const sessionStudents = currentSession.students;

    // Find the first student who has not been marked
    currentStudentIndex = sessionStudents.findIndex(student => {
        return !currentSession.statuses[student.roll];
    });

    const markedCount = Object.keys(currentSession.statuses).length;
    const totalStudents = sessionStudents.length;

    progressText.textContent =
        `Marked ${markedCount} of ${totalStudents} students`;

    const progress = (markedCount / totalStudents) * 100;
    progressBar.style.width = progress + "%";

    // If every student has been marked
    if (currentStudentIndex === -1) {
        currentSession.completed = true;
        currentSession.completedAt = new Date().toISOString();

        saveAttendanceData();

        attendanceArea.hidden = true;
        completedArea.hidden = false;

        return;
    }

    const student = sessionStudents[currentStudentIndex];

    studentName.textContent = student.name;
    studentRoll.textContent = "Roll: " + student.roll;

    attendanceMessage.textContent = "";
}

// 10. Mark the current student Present or Absent
function markAttendance(status) {
    if (!currentSession) return;

    const student = currentSession.students[currentStudentIndex];

    if (!student) return;

    currentSession.statuses[student.roll] = status;

    saveAttendanceData();

    showCurrentStudent();
}

// 11. Start a new session after an unfinished one
function startNewSession() {
    const previousSession = findUnfinishedSession();

    if (previousSession) {
        const previousStudents = previousSession.students || students;

        if (!previousSession.statuses) {
            previousSession.statuses = {};
        }

        // Students not marked previously become Absent
        previousStudents.forEach(student => {
            if (!previousSession.statuses[student.roll]) {
                previousSession.statuses[student.roll] = "Absent";
            }
        });

        previousSession.completed = true;
        previousSession.completedAt = new Date().toISOString();

        saveAttendanceData();
    }

    createNewSession();
}

// 12. Check whether an unfinished session exists
function initializeAttendance() {
    const unfinishedSession = findUnfinishedSession();

    if (unfinishedSession) {
        sessionChoice.hidden = false;
        attendanceArea.hidden = true;
        completedArea.hidden = true;
    } else {
        createNewSession();
    }
}

// 13. Button event listeners

presentBtn.addEventListener("click", function () {
    markAttendance("Present");
});

absentBtn.addEventListener("click", function () {
    markAttendance("Absent");
});

continueSessionBtn.addEventListener("click", function () {
    continuePreviousSession();
});

newSessionBtn.addEventListener("click", function () {
    const confirmNew = confirm(
        "Starting a new session will mark all unmarked students in the previous unfinished session as Absent. Continue?"
    );

    if (confirmNew) {
        startNewSession();
    }
});

stopBtn.addEventListener("click", function () {
    saveAttendanceData();

    alert("Attendance saved. You can continue this session later.");

    window.location.href = "./course-details.html";
});

backToCourseBtn.addEventListener("click", function () {
    window.location.href = "./course-details.html";
});

backAfterCompleteBtn.addEventListener("click", function () {
    window.location.href = "./course-details.html";
});

// 14. Start the attendance system
initializeAttendance();
