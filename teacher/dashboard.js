
// Check whether the teacher is logged in
const loggedIn = sessionStorage.getItem("teacherLoggedIn");

if (loggedIn !== "true") {
  window.location.href = "./teacher-login.html";
}

// Get teacher information
const teacherId = sessionStorage.getItem("teacherId");

document.getElementById("teacherName").textContent =
  "Welcome, Teacher!";

document.getElementById("teacherInfo").textContent =
  `Teacher ID: ${teacherId}`;


// Sample assigned courses
const courses = [
  {
    code: "CSE 1102",
    name: "Structured Programming Laboratory",
    semester: "Level 1, Term 1"
  },
  {
    code: "CSE 1101",
    name: "Structured Programming",
    semester: "Level 1, Term 1"
  },
  {
    code: "CSE 1201",
    name: "Discrete Mathematics",
    semester: "Level 1, Term 2"
  },
  {
    code: "CSE 1202",
    name: "Discrete Mathematics Laboratory",
    semester: "Level 1, Term 2"
  }
];


// Display the number of courses
document.getElementById("courseCount").textContent =
  `${courses.length} Courses`;


// Display course cards
const courseGrid = document.getElementById("courseGrid");

courses.forEach((course) => {

  const courseCard = document.createElement("div");

  courseCard.className = "course-card";

  courseCard.innerHTML = `
    <div class="course-icon">📚</div>

    <span class="course-code">${course.code}</span>

    <h3>${course.name}</h3>

    <p>${course.semester}</p>

    <button class="course-open-btn" type="button">
      Select Course →
    </button>
  `;

  courseGrid.appendChild(courseCard);

  // We'll connect this button to Course Details next.
  courseCard.querySelector(".course-open-btn")
    .addEventListener("click", () => {
      sessionStorage.setItem("selectedCourse", course.code);
      sessionStorage.setItem("selectedCourseName", course.name);

      window.location.href = "./course-details.html";
    });

});


// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {

  sessionStorage.removeItem("teacherLoggedIn");
  sessionStorage.removeItem("teacherId");
  sessionStorage.removeItem("teacherDepartment");
  sessionStorage.removeItem("selectedCourse");
  sessionStorage.removeItem("selectedCourseName");

  window.location.href = "./teacher-login.html";

});
