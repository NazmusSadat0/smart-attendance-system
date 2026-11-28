
const loginForm = document.getElementById("teacherLoginForm");
const loginMessage = document.getElementById("loginMessage");

// Demo teacher credentials
const DEMO_TEACHER_ID = "T001";
const DEMO_TEACHER_PASSWORD = "teacher123";

// Display the department
const departmentName = document.getElementById("departmentName");

if (departmentName) {
  departmentName.textContent =
    "Computer Science and Engineering (CSE)";
}

// Handle login
loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const teacherId = document.getElementById("teacherId").value.trim();
  const password = document.getElementById("teacherPassword").value;

  loginMessage.textContent = "";
  loginMessage.classList.remove("success");

  if (
    teacherId === DEMO_TEACHER_ID &&
    password === DEMO_TEACHER_PASSWORD
  ) {
    sessionStorage.setItem("teacherLoggedIn", "true");
    sessionStorage.setItem("teacherId", teacherId);
    sessionStorage.setItem(
      "teacherDepartment",
      "Computer Science and Engineering (CSE)"
    );

    window.location.href = "./teacher-dashboard.html";
  } else {
    loginMessage.textContent =
      "Invalid Teacher ID or password. Please try again.";
  }
});
