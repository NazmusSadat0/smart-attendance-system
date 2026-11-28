import { useState } from "react";
import { useApp } from "../../context/AppContext";

export default function AdminCourses() {
  const { state, setState } = useApp();
  const [subTab, setSubTab] = useState("check-courses");
  const [modalCourseCode, setModalCourseCode] = useState(null);

  // Add Course Form State
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [totalClasses, setTotalClasses] = useState(30);
  const [password, setPassword] = useState("");

  // Enrollment Form State
  const [enrollRoll, setEnrollRoll] = useState("");
  const [enrollCourse, setEnrollCourse] = useState("");

  const handleAddCourse = (e) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (state.courses.some((c) => c.code === cleanCode)) {
      alert("Course code already exists!");
      return;
    }
    setState((prev) => ({
      ...prev,
      courses: [
        ...prev.courses,
        { code: cleanCode, title: title.trim(), teacherId: null, semester: `Term ${prev.context.term}`, totalClasses: Number(totalClasses), password: password.trim() },
      ],
    }));
    setCode(""); setTitle(""); setTotalClasses(30); setPassword("");
    alert(`Course ${cleanCode} added successfully!`);
  };

  const handleRemoveCourse = (courseCode) => {
    if (!confirm(`Are you sure you want to remove course ${courseCode}?`)) return;
    setState((prev) => ({
      ...prev,
      courses: prev.courses.filter((c) => c.code !== courseCode),
      students: prev.students.map((s) => {
        const updatedAtt = { ...s.attendance };
        delete updatedAtt[courseCode];
        return {
          ...s,
          enrolledCourses: s.enrolledCourses.filter((c) => c !== courseCode),
          attendance: updatedAtt,
        };
      }),
    }));
  };

  const handleEnrollStudent = (e) => {
    e.preventDefault();
    if (!enrollRoll || !enrollCourse) return;
    setState((prev) => ({
      ...prev,
      students: prev.students.map((stu) => {
        if (enrollRoll !== "ALL_STUDENTS" && stu.roll !== enrollRoll) return stu;
        if (stu.enrolledCourses.includes(enrollCourse)) return stu;
        return {
          ...stu,
          enrolledCourses: [...stu.enrolledCourses, enrollCourse],
          attendance: { ...stu.attendance, [enrollCourse]: stu.attendance[enrollCourse] ?? 0 },
        };
      }),
    }));
  };

  const handleUnassignStudentCourse = (roll, courseCode) => {
    setState((prev) => ({
      ...prev,
      students: prev.students.map((stu) => {
        if (stu.roll !== roll) return stu;
        const updatedAtt = { ...stu.attendance };
        delete updatedAtt[courseCode];
        return {
          ...stu,
          enrolledCourses: stu.enrolledCourses.filter((c) => c !== courseCode),
          attendance: updatedAtt,
        };
      }),
    }));
  };

  const modalCourse = state.courses.find((c) => c.code === modalCourseCode);
  const modalTeacher = modalCourse ? state.teachers.find((t) => t.id === modalCourse.teacherId) : null;
  const modalStudents = modalCourse ? state.students.filter((s) => s.enrolledCourses.includes(modalCourse.code)) : [];

  return (
    <>
      <div className="section-header">
        <h2>Course Management</h2>
        <div className="sub-tabs">
          <button className={`sub-tab ${subTab === "check-courses" ? "active" : ""}`} onClick={() => setSubTab("check-courses")}>Course Dashboard</button>
          <button className={`sub-tab ${subTab === "student-enrollment" ? "active" : ""}`} onClick={() => setSubTab("student-enrollment")}>Student Enrollment</button>
          <button className={`sub-tab ${subTab === "add-course" ? "active" : ""}`} onClick={() => setSubTab("add-course")}>+ Add Course</button>
        </div>
      </div>

      {subTab === "check-courses" && (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Assigned Teacher</th>
                <th>Enrolled Students</th>
                <th>Total Classes</th>
                <th>Course Password</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.courses.map((course) => {
                const teacher = state.teachers.find((t) => t.id === course.teacherId);
                const enrolledCount = state.students.filter((s) => s.enrolledCourses.includes(course.code)).length;
                return (
                  <tr key={course.code}>
                    <td><strong>{course.code}</strong></td>
                    <td>{course.title}</td>
                    <td>{teacher ? `${teacher.name} (${teacher.id})` : <span className="muted">Unassigned</span>}</td>
                    <td>{enrolledCount} Student(s)</td>
                    <td>{course.totalClasses}</td>
                    <td><span className="pass-code">{course.password}</span></td>
                    <td style={{ display: "flex", gap: "6px" }}>
                      <button className="btn-sm btn-info" onClick={() => setModalCourseCode(course.code)}>
                        <i className="fa-solid fa-users"></i> Student Attendance
                      </button>
                      <button className="btn-sm btn-danger" onClick={() => handleRemoveCourse(course.code)}>
                        <i className="fa-solid fa-trash"></i> Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {subTab === "student-enrollment" && (
        <div>
          <div className="form-card mb-20">
            <h3>Assign Course to Student(s)</h3>
            <form onSubmit={handleEnrollStudent} className="inline-form">
              <select value={enrollRoll} onChange={(e) => setEnrollRoll(e.target.value)} required>
                <option value="">-- Select Student --</option>
                <option value="ALL_STUDENTS">All Registered Students (Bulk Assign)</option>
                {state.students.map((s) => <option key={s.roll} value={s.roll}>{s.roll} - {s.name}</option>)}
              </select>
              <select value={enrollCourse} onChange={(e) => setEnrollCourse(e.target.value)} required>
                <option value="">-- Select Course --</option>
                {state.courses.map((c) => <option key={c.code} value={c.code}>{c.code} - {c.title}</option>)}
              </select>
              <button type="submit" className="btn-primary">Assign Course</button>
            </form>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll No.</th>
                  <th>Student Name</th>
                  <th>Assigned Courses (Click × to Unassign)</th>
                </tr>
              </thead>
              <tbody>
                {state.students.map((stu) => (
                  <tr key={stu.roll}>
                    <td><strong>{stu.roll}</strong></td>
                    <td>{stu.name}</td>
                    <td>
                      {stu.enrolledCourses.length ? (
                        stu.enrolledCourses.map((cCode) => (
                          <span key={cCode} className="course-chip">
                            {cCode}
                            <button type="button" onClick={() => handleUnassignStudentCourse(stu.roll, cCode)}>&times;</button>
                          </span>
                        ))
                      ) : (
                        <span className="muted">No courses assigned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === "add-course" && (
        <div className="form-card">
          <h3>Register New Course</h3>
          <form onSubmit={handleAddCourse}>
            <div className="form-grid">
              <div className="form-group">
                <label>Course Code</label>
                <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g., CSE-3101" required />
              </div>
              <div className="form-group">
                <label>Course Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Software Engineering" required />
              </div>
              <div className="form-group">
                <label>Total Scheduled Classes</label>
                <input type="number" min="1" value={totalClasses} onChange={(e) => setTotalClasses(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Set Course Access Password</label>
                <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Set password" required />
              </div>
            </div>
            <button type="submit" className="btn-primary">Create Course</button>
          </form>
        </div>
      )}

      {modalCourse && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{modalCourse.code}: {modalCourse.title}</h3>
              <button className="close-modal" onClick={() => setModalCourseCode(null)}>&times;</button>
            </div>
            <div className="modal-meta">
              <strong>Course Teacher:</strong> {modalTeacher ? modalTeacher.name : "Not Assigned"} &nbsp;|&nbsp;
              <strong>Total Classes:</strong> {modalCourse.totalClasses} &nbsp;|&nbsp;
              <strong>Password:</strong> <span className="pass-code">{modalCourse.password}</span>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Roll No.</th>
                    <th>Student Name</th>
                    <th>Attended / Total</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {modalStudents.length === 0 ? (
                    <tr><td colSpan="4" className="muted">No students enrolled in this course yet.</td></tr>
                  ) : (
                    modalStudents.map((stu) => {
                      const attended = stu.attendance[modalCourse.code] || 0;
                      const pct = modalCourse.totalClasses > 0 ? Math.round((attended / modalCourse.totalClasses) * 100) : 0;
                      const pillClass = pct >= 75 ? "pill-good" : pct >= 60 ? "pill-warn" : "pill-low";
                      return (
                        <tr key={stu.roll}>
                          <td>{stu.roll}</td>
                          <td>{stu.name}</td>
                          <td>{attended} / {modalCourse.totalClasses}</td>
                          <td><span className={`pill ${pillClass}`}>{pct}%</span></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}