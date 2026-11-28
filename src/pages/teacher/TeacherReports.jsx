import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import "../../styles/teacher.css";

export default function TeacherReports() {
  const { code } = useParams();
  const decodedCode = decodeURIComponent(code || "");
  const { state, auth } = useApp();
  const navigate = useNavigate();

  const [rollSearch, setRollSearch] = useState("");
  const [searchedStudent, setSearchedStudent] = useState(null);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    if (auth.role !== "teacher") navigate("/teacher/login");
  }, [auth, navigate]);

  const course = state.courses.find((c) => c.code === decodedCode);
  if (!course) return null;

  const enrolledStudents = state.students.filter((s) => s.enrolledCourses.includes(decodedCode));
  const totalClasses = course.totalClasses;

  const studentReports = enrolledStudents
    .map((stu) => {
      const attended = stu.attendance[decodedCode] || 0;
      const absent = Math.max(0, totalClasses - attended);
      const percentage = totalClasses > 0 ? (attended / totalClasses) * 100 : 0;
      return {
        name: stu.name,
        roll: stu.roll,
        totalClasses,
        classesAttended: attended,
        classesAbsent: absent,
        percentage,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  const avgAttendance =
    studentReports.length > 0
      ? studentReports.reduce((sum, s) => sum + s.percentage, 0) / studentReports.length
      : 0;

  const handleSearch = (e) => {
    e.preventDefault();
    const clean = rollSearch.trim();
    setSearchedStudent(null);
    setSearchError("");

    if (!clean) {
      setSearchError("Please enter a student roll number.");
      return;
    }
    const match = studentReports.find((s) => s.roll.toLowerCase() === clean.toLowerCase());
    if (!match) {
      setSearchError("No enrolled student found with this roll number.");
      return;
    }
    setSearchedStudent(match);
  };

  return (
    <div className="teacher-shell">
      <div className="reports-container">
        <header className="reports-header">
          <div>
            <h1>Attendance Reports</h1>
            <p>{course.code}</p>
            <h2>{course.title}</h2>
          </div>
          <button
            className="secondary-btn"
            onClick={() => navigate(`/teacher/course/${encodeURIComponent(course.code)}`)}
          >
            Back to Course
          </button>
        </header>

        <section className="report-summary">
          <div className="summary-card">
            <h3>Enrolled Students</h3>
            <p>{enrolledStudents.length}</p>
          </div>
          <div className="summary-card">
            <h3>Total Classes Held</h3>
            <p>{totalClasses}</p>
          </div>
          <div className="summary-card">
            <h3>Average Attendance</h3>
            <p>{avgAttendance.toFixed(1)}%</p>
          </div>
        </section>

        <section className="report-section">
          <h2>Individual Student Report</h2>
          <p>Enter a student's roll number to view their attendance details.</p>

          <form onSubmit={handleSearch} className="student-search">
            <input
              type="text"
              value={rollSearch}
              onChange={(e) => setRollSearch(e.target.value)}
              placeholder="Enter student roll number (e.g., 2307001)"
            />
            <button type="submit" className="primary-btn">Search</button>
          </form>

          {searchError && <p style={{ marginTop: "14px", color: "#dc2626", fontSize: "14px" }}>{searchError}</p>}

          {searchedStudent && (
            <div className="individual-report">
              <h3>{searchedStudent.name}</h3>
              <p>Roll: {searchedStudent.roll}</p>
              <div className="individual-details">
                <div>
                  <span>Total Classes</span>
                  <strong>{searchedStudent.totalClasses}</strong>
                </div>
                <div>
                  <span>Classes Attended</span>
                  <strong>{searchedStudent.classesAttended}</strong>
                </div>
                <div>
                  <span>Classes Absent</span>
                  <strong>{searchedStudent.classesAbsent}</strong>
                </div>
                <div>
                  <span>Attendance Percentage</span>
                  <strong>{searchedStudent.percentage.toFixed(1)}%</strong>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="report-section">
          <h2>Course Attendance Report</h2>
          <p>Students are arranged from highest to lowest attendance percentage.</p>

          <div style={{ overflowX: "auto" }}>
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student Name</th>
                  <th>Roll Number</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {studentReports.length === 0 ? (
                  <tr><td colSpan="6" style={{ color: "#526b5e" }}>No students enrolled in this course yet.</td></tr>
                ) : (
                  studentReports.map((stu, idx) => (
                    <tr key={stu.roll}>
                      <td><strong>#{idx + 1}</strong></td>
                      <td>{stu.name}</td>
                      <td>{stu.roll}</td>
                      <td>{stu.classesAttended}</td>
                      <td>{stu.classesAbsent}</td>
                      <td><strong>{stu.percentage.toFixed(1)}%</strong></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}