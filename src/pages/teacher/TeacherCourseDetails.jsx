import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import "../../styles/teacher.css";

export default function TeacherCourseDetails() {
  const { code } = useParams();
  const decodedCode = decodeURIComponent(code || "");
  const { state, auth } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.role !== "teacher") navigate("/teacher/login");
  }, [auth, navigate]);

  const course = state.courses.find((c) => c.code === decodedCode);
  const enrolledCount = state.students.filter((s) => s.enrolledCourses.includes(decodedCode)).length;

  if (!course) {
    return (
      <div className="teacher-shell">
        <main className="course-details-page">
          <h2>Course not found</h2>
          <button className="details-back-btn" onClick={() => navigate("/teacher/dashboard")}>← Dashboard</button>
        </main>
      </div>
    );
  }

  return (
    <div className="teacher-shell">
      <main className="course-details-page">
        <header className="details-header">
          <div>
            <span className="teacher-badge">KUET | {state.selectedDept}</span>
            <h1>Course Details</h1>
            <p className="dashboard-subtitle">Manage your selected course.</p>
          </div>
          <button className="details-back-btn" onClick={() => navigate("/teacher/dashboard")}>
            ← Dashboard
          </button>
        </header>

        <section className="selected-course-card">
          <div className="selected-course-icon">📚</div>
          <p className="selected-course-label">SELECTED COURSE</p>
          <h2>{course.title}</h2>

          <div className="course-info">
            <div className="course-info-item">
              <span>Course Code</span>
              <strong>{course.code}</strong>
            </div>
            <div className="course-info-item">
              <span>Enrolled Students</span>
              <strong>{enrolledCount} Students</strong>
            </div>
            <div className="course-info-item">
              <span>Total Classes Held</span>
              <strong>{course.totalClasses} Classes</strong>
            </div>
          </div>
        </section>

        <section className="course-actions-section">
          <h2>What would you like to do?</h2>
          <p className="actions-subtitle">Choose an action for this course.</p>

          <div className="course-actions-grid">
            <div className="action-card">
              <div className="action-icon attendance-icon">✓</div>
              <h3>Take Attendance</h3>
              <p>Mark enrolled students as Present or Absent and manage your attendance sessions.</p>
              <button
                type="button"
                className="action-btn"
                onClick={() => navigate(`/teacher/course/${encodeURIComponent(course.code)}/attendance`)}
              >
                Take Attendance →
              </button>
            </div>

            <div className="action-card">
              <div className="action-icon reports-icon">▤</div>
              <h3>View Reports</h3>
              <p>Check individual student attendance and overall course attendance records.</p>
              <button
                type="button"
                className="action-btn reports-btn"
                onClick={() => navigate(`/teacher/course/${encodeURIComponent(course.code)}/reports`)}
              >
                View Reports →
              </button>
            </div>
          </div>
        </section>

        <footer className="dashboard-footer">KUET Smart Attendance System | Teacher Portal</footer>
      </main>
    </div>
  );
}