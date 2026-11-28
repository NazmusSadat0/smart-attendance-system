
// ========================================
// SMART ATTENDANCE SYSTEM - REPORTS
// ========================================

// 1. Check teacher login
if (sessionStorage.getItem("teacherLoggedIn") !== "true") {
    window.location.href = "./teacher-login.html";
}

// 2. Get selected course information
const selectedCourse = sessionStorage.getItem("selectedCourse");
const selectedCourseName = sessionStorage.getItem("selectedCourseName");

if (!selectedCourse) {
    alert("Please select a course first.");
    window.location.href = "./teacher-dashboard.html";
}

// Display course information
document.getElementById("reportCourseCode").textContent =
    selectedCourse || "";

document.getElementById("reportCourseName").textContent =
    selectedCourseName || "";

// 3. Get HTML elements
const totalStudentsElement = document.getElementById("totalStudents");
const totalSessionsElement = document.getElementById("totalSessions");
const averageAttendanceElement = document.getElementById("averageAttendance");

const rollSearch = document.getElementById("rollSearch");
const searchStudentBtn = document.getElementById("searchStudentBtn");

const individualReport = document.getElementById("individualReport");
const individualStudentName = document.getElementById("individualStudentName");
const individualStudentRoll = document.getElementById("individualStudentRoll");

const individualTotalClasses = document.getElementById("individualTotalClasses");
const individualClassesAttended = document.getElementById("individualClassesAttended");
const individualClassesAbsent = document.getElementById("individualClassesAbsent");
const individualPercentage = document.getElementById("individualPercentage");

const searchMessage = document.getElementById("searchMessage");
const reportTableBody = document.getElementById("reportTableBody");
const emptyReportMessage = document.getElementById("emptyReportMessage");

const backToCourseBtn = document.getElementById("backToCourseBtn");

// 4. Read saved attendance data
const STORAGE_KEY = "kuetTeacherAttendance";

let attendanceData = {};

try {
    attendanceData = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}"
    );
} catch (error) {
    attendanceData = {};
}

// Get sessions belonging to the selected course
const courseData = attendanceData[selectedCourse] || {
    sessions: []
};

const allSessions = courseData.sessions || [];

// Only completed sessions are included in reports
const completedSessions = allSessions.filter(
    session => session.completed === true
);

// 5. Create a list of all unique students
const studentMap = new Map();

allSessions.forEach(session => {
    (session.students || []).forEach(student => {
        studentMap.set(student.roll, student);
    });
});

const students = Array.from(studentMap.values());

// 6. Calculate attendance for each student
const studentReports = students.map(student => {

    let totalClasses = 0;
    let classesAttended = 0;
    let classesAbsent = 0;

    completedSessions.forEach(session => {

        // Check whether this student belongs to this session
        const studentInSession = (session.students || []).some(
            item => item.roll === student.roll
        );

        if (!studentInSession) return;

        totalClasses++;

        const status = session.statuses
            ? session.statuses[student.roll]
            : null;

        if (status === "Present") {
            classesAttended++;
        } else if (status === "Absent") {
            classesAbsent++;
        }
    });

    const percentage = totalClasses > 0
        ? (classesAttended / totalClasses) * 100
        : 0;

    return {
        name: student.name,
        roll: student.roll,
        totalClasses,
        classesAttended,
        classesAbsent,
        percentage
    };
});

// 7. Update summary cards
const totalPresentRecords = studentReports.reduce(
    (sum, student) => sum + student.classesAttended,
    0
);

const totalAttendanceRecords = studentReports.reduce(
    (sum, student) => sum + student.totalClasses,
    0
);

const averageAttendance = totalAttendanceRecords > 0
    ? (totalPresentRecords / totalAttendanceRecords) * 100
    : 0;

totalStudentsElement.textContent = students.length;
totalSessionsElement.textContent = completedSessions.length;
averageAttendanceElement.textContent =
    averageAttendance.toFixed(1) + "%";

// 8. Sort students by attendance percentage
studentReports.sort((a, b) => {
    return b.percentage - a.percentage;
});

// 9. Display course-wide attendance report
function displayCourseReport() {

    reportTableBody.innerHTML = "";

    if (completedSessions.length === 0) {
        emptyReportMessage.textContent =
            "No completed attendance sessions are available for this course yet.";
        return;
    }

    emptyReportMessage.textContent = "";

    studentReports.forEach((student, index) => {

        const row = document.createElement("tr");

        const values = [
            index + 1,
            student.name,
            student.roll,
            student.classesAttended,
            student.classesAbsent,
            student.percentage.toFixed(1) + "%"
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        reportTableBody.appendChild(row);
    });
}

// 10. Search for an individual student
function searchStudent() {

    const roll = rollSearch.value.trim();

    individualReport.hidden = true;
    searchMessage.textContent = "";

    if (roll === "") {
        searchMessage.textContent =
            "Please enter a student roll number.";
        return;
    }

    const student = studentReports.find(
        item => item.roll === roll
    );

    if (!student) {
        searchMessage.textContent =
            "No student found with this roll number.";
        return;
    }

    if (student.totalClasses === 0) {
        searchMessage.textContent =
            "No completed attendance records found for this student.";
        return;
    }

    // Display individual student details
    individualStudentName.textContent = student.name;
    individualStudentRoll.textContent = "Roll: " + student.roll;

    individualTotalClasses.textContent = student.totalClasses;
    individualClassesAttended.textContent = student.classesAttended;
    individualClassesAbsent.textContent = student.classesAbsent;

    individualPercentage.textContent =
        student.percentage.toFixed(1) + "%";

    individualReport.hidden = false;
}

// 11. Button event listeners
searchStudentBtn.addEventListener("click", searchStudent);

rollSearch.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        searchStudent();
    }
});

backToCourseBtn.addEventListener("click", function() {
    window.location.href = "./course-details.html";
});

// 12. Load the report
displayCourseReport();
