import { useState } from "react";
import { useApp } from "../../context/AppContext";

export default function AdminTeachers() {
  const { state, setState } = useApp();
  const [subTab, setSubTab] = useState("teacher-list");

  const [assignTeacherId, setAssignTeacherId] = useState("");
  const [assignCourseCode, setAssignCourseCode] = useState("");
  const [removeTeacherId, setRemoveTeacherId] = useState("");

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAssignCourse = (e) => {
    e.preventDefault();
    setState((prev) => ({
      ...prev,
      courses: prev.courses.map((c) => (c.code === assignCourseCode ? { ...c, teacherId: assignTeacherId } : c)),
    }));
  };

  const handleUnassignCourse = (courseCode) => {
    setState((prev) => ({
      ...prev,
      courses: prev.courses.map((c) => (c.code === courseCode ? { ...c, teacherId: null } : c)),
    }));
  };

  const handleAddTeacher = (e) => {
    e.preventDefault();
    const cleanId = id.trim().toUpperCase();
    if (state.teachers.some((t) => t.id === cleanId)) {
      alert("Teacher ID already exists!");
      return;
    }
    setState((prev) => ({
      ...prev,
      teachers: [...prev.teachers, { id: cleanId, name: name.trim(), email: email.trim(), password: password.trim() }],
    }));
    setId(""); setName(""); setEmail(""); setPassword("");
    alert(`Teacher ${name} added!`);
  };

  const handleRemoveTeacher = (e) => {
    e.preventDefault();
    const teacher = state.teachers.find((t) => t.id === removeTeacherId);
    if (!teacher || !confirm(`Remove ${teacher.name} (${removeTeacherId})?`)) return;

    setState((prev) => ({
      ...prev,
      teachers: prev.teachers.filter((t) => t.id !== removeTeacherId),
      courses: prev.courses.map((c) => (c.teacherId === removeTeacherId ? { ...c, teacherId: null } : c)),
    }));
    setRemoveTeacherId("");
    alert(`Teacher ${removeTeacherId} removed.`);
  };

  return (
    <>
      <div className="section-header">
        <h2>Teacher Management</h2>
        <div className="sub-tabs">
          <button className={`sub-tab ${subTab === "teacher-list" ? "active" : ""}`} onClick={() => setSubTab("teacher-list")}>Teachers & Assignments</button>
          <button className={`sub-tab ${subTab === "add-teacher" ? "active" : ""}`} onClick={() => setSubTab("add-teacher")}>+ Add Teacher</button>
          <button className={`sub-tab ${subTab === "remove-teacher" ? "active" : ""}`} onClick={() => setSubTab("remove-teacher")}>- Remove Teacher</button>
        </div>
      </div>

      {subTab === "teacher-list" && (
        <div>
          <div className="form-card mb-20">
            <h3>Assign Course to Teacher</h3>
            <form onSubmit={handleAssignCourse} className="inline-form">
              <select value={assignTeacherId} onChange={(e) => setAssignTeacherId(e.target.value)} required>
                <option value="">-- Select Teacher --</option>
                {state.teachers.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.id})</option>)}
              </select>
              <select value={assignCourseCode} onChange={(e) => setAssignCourseCode(e.target.value)} required>
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
                  <th>Teacher ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Assigned Password</th>
                  <th>Assigned Courses (Click × to Unassign)</th>
                </tr>
              </thead>
              <tbody>
                {state.teachers.map((teacher) => {
                  const assigned = state.courses.filter((c) => c.teacherId === teacher.id);
                  return (
                    <tr key={teacher.id}>
                      <td><strong>{teacher.id}</strong></td>
                      <td>{teacher.name}</td>
                      <td>{teacher.email}</td>
                      <td><span className="pass-code">{teacher.password}</span></td>
                      <td>
                        {assigned.length ? (
                          assigned.map((c) => (
                            <span key={c.code} className="course-chip">
                              {c.code}
                              <button type="button" onClick={() => handleUnassignCourse(c.code)}>&times;</button>
                            </span>
                          ))
                        ) : (
                          <span className="muted">No courses assigned</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === "add-teacher" && (
        <div className="form-card">
          <h3>Add New Teacher</h3>
          <form onSubmit={handleAddTeacher}>
            <div className="form-grid">
              <div className="form-group">
                <label>Teacher ID</label>
                <input type="text" value={id} onChange={(e) => setId(e.target.value)} placeholder="e.g., T-104" required />
              </div>
              <div className="form-group">
                <label>Teacher Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Dr. Mahmudul Hasan" required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teacher@kuet.ac.bd" required />
              </div>
              <div className="form-group">
                <label>Set Teacher Login Password</label>
                <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Set password" required />
              </div>
            </div>
            <button type="submit" className="btn-primary">Register Teacher</button>
          </form>
        </div>
      )}

      {subTab === "remove-teacher" && (
        <div className="form-card">
          <h3>Remove Teacher</h3>
          <p className="muted mb-20">Select a teacher to remove them. Any courses assigned to them will become unassigned.</p>
          <form onSubmit={handleRemoveTeacher}>
            <div className="form-grid">
              <div className="form-group">
                <label>Select Teacher to Remove</label>
                <select value={removeTeacherId} onChange={(e) => setRemoveTeacherId(e.target.value)} required>
                  <option value="">-- Select Teacher to Remove --</option>
                  {state.teachers.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.id})</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary btn-danger-solid">
              <i className="fa-solid fa-trash"></i> Remove Teacher
            </button>
          </form>
        </div>
      )}
    </>
  );
}