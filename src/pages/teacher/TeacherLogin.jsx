import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import "../../styles/teacher.css";

export default function TeacherLogin() {
  const { state, setAuth } = useApp();
  const navigate = useNavigate();

  const [teacherId, setTeacherId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    const cleanId = teacherId.trim();
    const foundTeacher = state.teachers.find(
      (t) => t.id.toLowerCase() === cleanId.toLowerCase() && t.password === password
    );

    if (!foundTeacher) {
      setError("Invalid Teacher ID or password. Please try again.");
      return;
    }

    setError("");
    setAuth({ role: "teacher", user: foundTeacher });
    navigate("/teacher/dashboard");
  };

  return (
    <main className="teacher-page">
      <section className="teacher-card">
        <div className="teacher-badge">KUET Smart Attendance</div>
        <h1>Teacher Login</h1>
        <p className="teacher-subtitle">Sign in to manage your courses and attendance.</p>

        <div className="teacher-department">
          <span>Selected Department</span>
          <strong>{state.selectedDept}</strong>
        </div>

        <form onSubmit={handleLogin}>
          <div className="teacher-field">
            <label htmlFor="teacherId">Teacher ID</label>
            <input
              type="text"
              id="teacherId"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              placeholder="e.g., T-101 or T001"
              required
            />
          </div>

          <div className="teacher-field">
            <label htmlFor="teacherPassword">Password</label>
            <input
              type="password"
              id="teacherPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <p className="teacher-message">{error}</p>

          <button type="submit" className="teacher-primary-btn">Login</button>
        </form>

        <button type="button" className="teacher-back-btn" onClick={() => navigate("/")}>
          ← Back to Main Portal
        </button>

        <p className="teacher-demo">
          Demo logins: <strong>T-101</strong> / <strong>tPass101</strong> or <strong>T001</strong> / <strong>teacher123</strong>
        </p>
      </section>
    </main>
  );
}