
const loggedIn = sessionStorage.getItem("teacherLoggedIn");

// Protect the page from users who are not logged in.
if (loggedIn !== "true") {
  window.location.href = "./teacher-login.html";
}

// Retrieve the selected course.
const courseCode = sessionStorage.getItem("selectedCourse");
const courseName = sessionStorage.getItem("selectedCourseName");

// Sample course information.
const courses = {
  "CSE 1102": {
    name: "Structured Programming Laboratory",
    semester: "Level 1, Term 1"
  },

  "CSE 1101": {
    name: "Structured Programming",
    semester: "Level 1, Term 1"
  },

  "CSE 1201": {
    name: "Discrete Mathematics",
    semester: "Level 1, Term 2"
  },

  "CSE 1202": {
    name: "Discrete Mathematics Laboratory",
    semester: "Level 1, Term 2"
  }
};

const course = courses[courseCode];

// Display course information.
if (course && courseName) {
  document.getElementById("courseName").textContent = course.name;
  document.getElementById("courseCode").textContent = courseCode;
  document.getElementById("courseSemester").textContent =
    course.semester;
} else {
  document.getElementById("courseName").textContent =
    "No course selected";

  document.getElementById("courseCode").textContent = "N/A";
  document.getElementById("courseSemester").textContent = "N/A";
}

// Return to dashboard.
document.getElementById("backDashboardBtn")
  .addEventListener("click", function () {
    window.location.href = "./teacher-dashboard.html";
  });

// Take Attendance button.
document.getElementById("takeAttendanceBtn")
  .addEventListener("click", function () {
    window.location.href = "./take-attendance.html";
  });

// View Reports button.
document.getElementById("viewReportsBtn")
  .addEventListener("click", function () {
    window.location.href = "./attendance-reports.html";
  });
