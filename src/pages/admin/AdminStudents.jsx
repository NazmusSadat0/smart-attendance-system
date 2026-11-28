import { useState } from "react";
import { useApp } from "../../context/AppContext";

export default function AdminStudents() {
  const { state, setState } = useApp();
  const [subTab, setSubTab] = useState("student-list");

  const [listSearch, setListSearch] = useState("");
  const [attSearchInput, setAttSearchInput] = useState("");
  const [searchedRoll, setSearchedRoll] = useState(null);

  const [roll, setRoll] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [removeRoll, setRemoveRoll] = useState("");

  const handleRegisterStudent = (e) => {
    e.preventDefault();
    const cleanRoll = roll.trim();
    if (state.students.some((s) => s.roll === cleanRoll)) {
      alert("Student with this roll number is already registered!");
      return;
    }
    setState((prev) => ({
      ...prev,
      students: [
        ...prev.students,
        {
          roll: cleanRoll,
          name: name.trim(),
          dept: "CSE",
          session: prev.context.session,
          email: email.trim(),
          password: password.trim(),
          enrolledCourses: [],
          attendance: {},
          comments: {},
        },
      ],
    }));
    setRoll(""); setName(""); setEmail(""); setPassword("");
    alert(`Student ${name} (Roll: ${cleanRoll}) registered!`);
  };

  const handleRemoveStudent = (e) => {
    e.preventDefault();
    const stu = state.students.find((s) => s.roll === removeRoll.trim());
    if (!stu) {
      alert(`No student found with Roll Number: ${removeRoll}`);
      return;
    }
    if (!confirm(`Remove ${stu.name} (Roll: ${stu.roll})?`)) return;
    setState((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.roll !== stu.roll),
    }));
    setRemoveRoll("");
    alert(`Student ${stu.roll} removed.`);
  };

  // Individual Student Report Calculation
  const foundStudent = searchedRoll
    ? state.students.find((s) => s.roll.toLowerCase() === searchedRoll.toLowerCase())
    : null;

  const enrolledObjs = foundStudent
    ? state.courses.filter((c) => foundStudent.enrolledCourses.includes(c.code))
    : [];

  const totalAttended = enrolledObjs.reduce((sum, c) => sum + (foundStudent.attendance[c.code] || 0), 0);
  const totalHeld = enrolledObjs.reduce((sum, c) => sum + c.totalClasses, 0);
  const overallPct = totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 100) : 0;

  return (
    <>
      <div className="section-header">
        <h2>Student Management</h2>
        <div className="sub-tabs">
          <button className={`sub-tab ${subTab === "student-list" ? "active" : ""}`} onClick={() => setSubTab("student-list")}>Registered Students</button>
          <button className={`sub-tab ${subTab === "attendance-records" ? "active" : ""}`} onClick={() => setSubTab("attendance-records")}>Attendance Records</button>
          <button className={`sub-tab ${subTab === "register-student" ? "active" : ""}`} onClick={() => setSubTab("register-student")}>+ Register Student</button>
          <button className={`sub-tab ${subTab === "remove-student" ? "active" : ""}`} onClick={() => setSubTab("remove-student")}>- Remove Student</button>
        </div>
      </div>

      {subTab === "student-list" && (
        <div>
          <div className="filter-bar">
            <div className="search-box">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                placeholder="Search by Roll Number (e.g., 2107001)..."
              />
            </div>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll No.</th>
                  <th>Student Name</th>
                  <th>Student Email</th>
                  <th>Student Password</th>
                </tr>
              </thead>
              <tbody>
                {state.students
                  .filter((s) => s.roll.toLowerCase().includes(listSearch.trim().toLowerCase()))
                  .map((stu) => (
                    <tr key={stu.roll}>
                      <td><strong>{stu.roll}</strong></td>
                      <td>{stu.name}</td>
                      <td>{stu.email}</td>
                      <td><span className="pass-code">{stu.password}</span></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === "attendance-records" && (
        <div>
          <div className="form-card mb-20">
            <h3>Search Student Attendance Record</h3>
            <p className="muted mb-20">Enter a student's Roll Number to view their complete course-wise attendance report.</p>
            <form onSubmit={(e) => { e.preventDefault(); setSearchedRoll(attSearchInput.trim()); }} className="inline-form">
              <div className="search-box">
                <i className="fa-solid fa-id-badge"></i>
                <input
                  type="text"
                  value={attSearchInput}
                  onChange={(e) => setAttSearchInput(e.target.value)}
                  placeholder="Enter Student Roll Number (e.g., 2107001)..."
                  required
                />
              </div>
              <button type="submit" className="btn-primary">
                <i className="fa-solid fa-magnifying-glass"></i> View Attendance
              </button>
            </form>
          </div>

          {!searchedRoll ? (
            <div className="empty-search-state">
              <i className="fa-solid fa-clipboard-user"></i>
              <h4>No Student Selected</h4>
              <p className="muted">Type a student's roll number above and click <strong>View Attendance</strong> to inspect their course-wise attendance percentages.</p>
            </div>
          ) : !foundStudent ? (
            <div className="empty-search-state" style={{ borderColor: "#fecaca" }}>
              <i className="fa-solid fa-circle-exclamation" style={{ color: "var(--danger)" }}></i>
              <h4>Student Not Found</h4>
              <p className="muted">No registered student found with Roll Number <strong>"{searchedRoll}"</strong>.</p>
            </div>
          ) : (
            <div className="student-report-card">
              <div className="report-header">
                <div className="report-student-info">
                  <div className="report-avatar">
                    {foundStudent.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3>{foundStudent.name}</h3>
                    <p><strong>Roll No:</strong> {foundStudent.roll} &nbsp;|&nbsp; <strong>Email:</strong> {foundStudent.email}</p>
                  </div>
                </div>
                <div className="report-overall-box">
                  <span className="label">Overall Attendance</span>
                  <strong className="pct-big">{overallPct}%</strong>
                  <span className={`pill ${overallPct >= 75 ? "pill-good" : overallPct >= 60 ? "pill-warn" : "pill-low"}`}>
                    {overallPct >= 75 ? "Eligible" : overallPct >= 60 ? "Warning" : "Shortage"}
                  </span>
                </div>
              </div>

              <div className="table-responsive" style={{ border: "none", borderRadius: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Course Title</th>
                      <th>Attended / Total</th>
                      <th>Attendance Percentage</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledObjs.length === 0 ? (
                      <tr><td colSpan="5" className="muted">This student is not enrolled in any courses yet.</td></tr>
                    ) : (
                      enrolledObjs.map((course) => {
                        const att = foundStudent.attendance[course.code] || 0;
                        const pct = course.totalClasses > 0 ? Math.round((att / course.totalClasses) * 100) : 0;
                        const pillClass = pct >= 75 ? "pill-good" : pct >= 60 ? "pill-warn" : "pill-low";
                        const fillClass = pct >= 75 ? "fill-good" : pct >= 60 ? "fill-warn" : "fill-low";
                        return (
                          <tr key={course.code}>
                            <td><strong>{course.code}</strong></td>
                            <td>{course.title}</td>
                            <td>{att} / {course.totalClasses}</td>
                            <td>
                              <div className="progress-bar-bg">
                                <div className={`progress-bar-fill ${fillClass}`} style={{ width: `${pct}%` }}></div>
                              </div>
                              <strong>{pct}%</strong>
                            </td>
                            <td><span className={`pill ${pillClass}`}>{pct >= 75 ? "Eligible" : pct >= 60 ? "Warning" : "Shortage"}</span></td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {subTab === "register-student" && (
        <div className="form-card">
          <h3>Register Student for Current Session/Term/Section</h3>
          <form onSubmit={handleRegisterStudent}>
            <div className="form-grid">
              <div className="form-group">
                <label>Student Roll Number</label>
                <input type="text" value={roll} onChange={(e) => setRoll(e.target.value)} placeholder="e.g., 2107045" required />
              </div>
              <div className="form-group">
                <label>Student Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Nazmus Sadat" required />
              </div>
              <div className="form-group">
                <label>Student Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g., 2107045@stud.kuet.ac.bd" required />
              </div>
              <div className="form-group">
                <label>Set Student Login Password</label>
                <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Set password" required />
              </div>
            </div>
            <button type="submit" className="btn-primary">Register Student</button>
          </form>
        </div>
      )}

      {subTab === "remove-student" && (
        <div className="form-card">
          <h3>Remove Student</h3>
          <p className="muted mb-20">Enter the student's Roll Number or select from the list to remove them.</p>
          <form onSubmit={handleRemoveStudent}>
            <div className="form-grid">
              <div className="form-group">
                <label>Enter Roll Number</label>
                <input type="text" value={removeRoll} onChange={(e) => setRemoveRoll(e.target.value)} placeholder="e.g., 2107001" required />
              </div>
              <div className="form-group">
                <label>Or Select Registered Student</label>
                <select value={removeRoll} onChange={(e) => setRemoveRoll(e.target.value)}>
                  <option value="">-- Choose Student --</option>
                  {state.students.map((s) => <option key={s.roll} value={s.roll}>{s.roll} - {s.name}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary btn-danger-solid">
              <i className="fa-solid fa-trash"></i> Remove Student
            </button>
          </form>
        </div>
      )}
    </>
  );
}