import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import "../../styles/teacher.css";

export default function TeacherDashboard() {
  const { state, auth, logout } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.role !== "teacher" || !auth.user) {
      navigate("/teacher/login");
    }
  }, [auth, navigate]);

  if (auth.role !== "teacher" || !auth.user) return null;

  // Show assigned courses (or all courses for demo T001 if none explicitly assigned)
  const assignedCourses = state.courses.filter((c) => c.teacherId === auth.user.id);
  const displayCourses =
    assignedCourses.length > 0 || auth.user.id !== "T001"
      ? assignedCourses
      : state.courses;

  const handleLogout = () => {
    logout();
    navigate("/teacher/login");
  };

  return (
    <div className="teacher-shell">
      <main className="dashboard-page">
        <header className="dashboard-header">
          <div>
            <span className="teacher-badge">KUET | {state.selectedDept}</span>
            <h1>Teacher Dashboard</h1>
            <p className="dashboard-subtitle">Smart Attendance Management System</p>
          </div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </header>

        <section className="welcome-card">
          <div>
            <p className="welcome-small">Welcome back,</p>
            <h2>{auth.user.name}</h2>
            <p>Teacher ID: {auth.user.id} · {auth.user.email}</p>
          </div>
          <div className="welcome-icon">👨‍🏫</div>
        </section>

        <section className="courses-section">
          <div className="section-heading">
            <div>
              <h2>My Assigned Courses</h2>
              <p>Select a course to manage attendance and reports.</p>
            </div>
            <span className="course-count">{displayCourses.length} Courses</span>
          </div>

          {displayCourses.length === 0 ? (
            <div className="selected-course-card" style={{ textAlign: "center" }}>
              <p style={{ color: "#526b5e" }}>No courses are currently assigned to your ID. Ask Admin to assign a course.</p>
            </div>
          ) : (
            <div className="course-grid">
              {displayCourses.map((course) => (
                <div key={course.code} className="course-card">
                  <div className="course-icon">📚</div>
                  <span className="course-code">{course.code}</span>
                  <h3>{course.title}</h3>
                  <p>{course.semester || `Term ${state.context.term}`} · {course.totalClasses} Total Classes</p>
                  <button
                    type="button"
                    className="course-open-btn"
                    onClick={() => navigate(`/teacher/course/${encodeURIComponent(course.code)}`)}
                  >
                    Select Course →
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="dashboard-footer">KUET Smart Attendance System | Teacher Portal</footer>
      </main>
    </div>
  );
}