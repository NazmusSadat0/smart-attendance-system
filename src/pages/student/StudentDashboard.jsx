import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import "../../styles/student.css";

const MIN_PCT = 75;
const WARN_PCT = 80;

export default function StudentDashboard() {
  const { state, setState, auth, setAuth, logout } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [tab, setTab] = useState("attendance"); // "attendance" | "courses" | "course-detail" | "history" | "notifications" | "profile"
  const [selectedCourseCode, setSelectedCourseCode] = useState(null);

  // Profile Edit & Password States
  const [profileEditing, setProfileEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(() => localStorage.getItem("studentProfilePhoto") || "");
  const [pendingPhoto, setPendingPhoto] = useState("");

  const [passwordEditing, setPasswordEditing] = useState(false);
  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passErr, setPassErr] = useState("");

  useEffect(() => {
    if (auth.role !== "student" || !auth.user) {
      navigate("/student/login");
    }
  }, [auth, navigate]);

  if (auth.role !== "student" || !auth.user) return null;

  // Always read freshest student record from AppContext
  const student = state.students.find((s) => s.roll === auth.user.roll) || auth.user;

  const enrolledCourses = state.courses
    .filter((c) => student.enrolledCourses.includes(c.code))
    .map((c) => {
      const teacher = state.teachers.find((t) => t.id === c.teacherId);
      const att = student.attendance[c.code] || 0;
      const tot = c.totalClasses || 0;
      const pct = tot > 0 ? Math.round((att * 1000) / tot) / 10 : 0;
      return {
        ...c,
        teacherName: teacher ? teacher.name : "TBA",
        att,
        tot,
        pct,
        note: student.comments?.[c.code] || "",
      };
    });

  const totalAtt = enrolledCourses.reduce((sum, c) => sum + c.att, 0);
  const totalHeld = enrolledCourses.reduce((sum, c) => sum + c.tot, 0);
  const overallPct = totalHeld > 0 ? Math.round((totalAtt * 1000) / totalHeld) / 10 : 0;

  const getStatus = (p) =>
    p >= WARN_PCT
      ? { label: "Good Standing", cls: "ok", color: "var(--stu-ok)" }
      : p >= MIN_PCT
      ? { label: "Warning", cls: "warn", color: "var(--stu-warn)" }
      : { label: "Low Attendance", cls: "bad", color: "var(--stu-bad)" };

  // Dynamic notifications generated from real attendance + comments
  const notifications = [
    ...enrolledCourses
      .filter((c) => c.pct < MIN_PCT)
      .map((c) => ({
        type: "warn",
        msg: `Low attendance in ${c.code} (${c.pct}%). Minimum required is ${MIN_PCT}%.`,
        date: "Alert",
      })),
    ...enrolledCourses
      .filter((c) => c.note)
      .map((c) => ({
        type: "info",
        msg: `Teacher comment added for ${c.code}: "${c.note}"`,
        date: "Course Note",
      })),
  ];

  const handleSaveProfile = () => {
    if (!editName.trim() || !editEmail.trim()) {
      alert("Please fill in your name and email.");
      return;
    }
    setState((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.roll === student.roll ? { ...s, name: editName.trim(), email: editEmail.trim() } : s
      ),
    }));
    setAuth((prev) => ({ ...prev, user: { ...student, name: editName.trim(), email: editEmail.trim() } }));
    setProfileEditing(false);
    alert("Profile updated successfully!");
  };

  const handleSavePassword = () => {
    setPassErr("");
    if (currPass !== student.password) {
      setPassErr("Your current password is incorrect.");
      return;
    }
    if (newPass.length < 6) {
      setPassErr("New password must be at least 6 characters.");
      return;
    }
    if (newPass !== confirmPass) {
      setPassErr("The new passwords do not match.");
      return;
    }
    setState((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.roll === student.roll ? { ...s, password: newPass } : s)),
    }));
    setAuth((prev) => ({ ...prev, user: { ...student, password: newPass } }));
    setPasswordEditing(false);
    setCurrPass(""); setNewPass(""); setConfirmPass("");
    alert("Password changed successfully!");
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be 2 MB or less.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setPendingPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const activeCourse = enrolledCourses.find((c) => c.code === selectedCourseCode);

  return (
    <div className="stu-app">
      <aside className="stu-aside">
        <div className="stu-logo">
          <i>SA</i>
          <span className="t">Smart Attendance</span>
        </div>

        {[
          { id: "attendance", label: "My Attendance", icon: "✓" },
          { id: "courses", label: "My Courses", icon: "▤" },
          { id: "history", label: "Attendance History", icon: "◷" },
          { id: "notifications", label: "Notifications", icon: "●", count: notifications.length },
          { id: "profile", label: "My Profile", icon: "☺" },
        ].map((item) => (
          <button
            key={item.id}
            className={`stu-nav-btn ${tab === item.id || (tab === "course-detail" && item.id === "courses") ? "on" : ""}`}
            onClick={() => setTab(item.id)}
          >
            <span>{item.icon}</span>
            <span className="t">{item.label}</span>
            {item.count > 0 && <span className="stu-badge">{item.count}</span>}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <div className="stu-chip">
          <div className="stu-chip-avatar">
            {profilePhoto ? <img src={profilePhoto} alt="Avatar" /> : initials}
          </div>
          <div className="t">
            {student.name}
            <small>Roll {student.roll}</small>
          </div>
        </div>

        <button
          className="stu-nav-btn"
          onClick={() => {
            logout();
            navigate("/student/login");
          }}
        >
          <span>⎋</span>
          <span className="t">Logout</span>
        </button>
      </aside>

      <main className="stu-main">
        {tab === "attendance" && (
          <>
            <h2>My Attendance</h2>
            <p className="stu-sub">Course-wise record for {student.name} ({student.roll}). Click any row for details.</p>

            <div className="stu-card stu-hero">
              <svg width="104" height="104" viewBox="0 0 104 104" style={{ flexShrink: 0 }}>
                <circle cx="52" cy="52" r={radius} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="9" />
                <circle
                  cx="52"
                  cy="52"
                  r={radius}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={`${(circumference * overallPct) / 100} ${circumference}`}
                  transform="rotate(-90 52 52)"
                />
                <text x="52" y="58" textAnchor="middle" fill="#fff" fontSize="19" fontWeight="700">
                  {overallPct}%
                </text>
              </svg>
              <div>
                <h2>Overall Attendance</h2>
                <p>
                  You attended <strong>{totalAtt}</strong> of <strong>{totalHeld}</strong> classes across{" "}
                  <strong>{enrolledCourses.length}</strong> enrolled courses.
                </p>
              </div>
            </div>

            <div className="stu-card" style={{ overflowX: "auto" }}>
              <table className="stu-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Attended</th>
                    <th>Total</th>
                    <th>Attendance</th>
                    <th>Status</th>
                    <th>Teacher Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledCourses.length === 0 ? (
                    <tr><td colSpan="6" style={{ color: "var(--stu-mute)" }}>You are not enrolled in any courses yet.</td></tr>
                  ) : (
                    enrolledCourses.map((c) => {
                      const st = getStatus(c.pct);
                      return (
                        <tr
                          key={c.code}
                          onClick={() => {
                            setSelectedCourseCode(c.code);
                            setTab("course-detail");
                          }}
                        >
                          <td>
                            <b>{c.code}</b>
                            <br />
                            <span style={{ color: "var(--stu-mute)", fontSize: "13px" }}>{c.title}</span>
                          </td>
                          <td>{c.att}</td>
                          <td>{c.tot}</td>
                          <td style={{ minWidth: "150px" }}>
                            <strong>{c.pct}%</strong>
                            <div className="stu-bar">
                              <i style={{ width: `${c.pct}%`, background: st.color }} />
                            </div>
                          </td>
                          <td><span className={`stu-pill ${st.cls}`}>{st.label}</span></td>
                          <td>{c.note || <span style={{ color: "var(--stu-mute)" }}>No comment</span>}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "courses" && (
          <>
            <h2>My Courses</h2>
            <p className="stu-sub">Courses you are registered in.</p>
            <div className="stu-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
              {enrolledCourses.map((c) => {
                const st = getStatus(c.pct);
                return (
                  <div
                    key={c.code}
                    className="stu-card stu-course-card"
                    onClick={() => {
                      setSelectedCourseCode(c.code);
                      setTab("course-detail");
                    }}
                  >
                    <span className={`stu-pill ${st.cls}`}>{st.label}</span>
                    <h3 style={{ margin: "12px 0 4px", color: "#064e3b" }}>{c.code}</h3>
                    <div style={{ color: "var(--stu-mute)", marginBottom: "14px", fontSize: "14px" }}>{c.title}</div>
                    <div className="stu-bar">
                      <i style={{ width: `${c.pct}%`, background: st.color }} />
                    </div>
                    <div style={{ marginTop: "8px", fontSize: "13px", fontWeight: 600 }}>
                      {c.att} / {c.tot} classes · {c.pct}%
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === "course-detail" && activeCourse && (
          <>
            <button
              onClick={() => setTab("courses")}
              style={{ background: "none", border: 0, color: "var(--stu-brand)", fontWeight: 700, cursor: "pointer", marginBottom: "14px" }}
            >
              ← Back to courses
            </button>
            <h2>{activeCourse.code} · {activeCourse.title}</h2>
            <p className="stu-sub">Instructor: {activeCourse.teacherName}</p>

            <div className="stu-grid stu-g2">
              <div className="stu-card">
                <h3 style={{ marginBottom: "12px", color: "#064e3b" }}>Attendance Summary</h3>
                <div style={{ fontSize: "36px", fontWeight: 700, color: "#15803d" }}>{activeCourse.pct}%</div>
                <div className="stu-bar" style={{ margin: "10px 0 14px" }}>
                  <i style={{ width: `${activeCourse.pct}%`, background: getStatus(activeCourse.pct).color }} />
                </div>
                <p>
                  <span className={`stu-pill ${getStatus(activeCourse.pct).cls}`}>{getStatus(activeCourse.pct).label}</span>
                  &nbsp;&nbsp;{activeCourse.att} attended of {activeCourse.tot} classes held
                </p>
              </div>

              <div className="stu-card">
                <h3 style={{ marginBottom: "12px", color: "#064e3b" }}>Teacher Comment</h3>
                <p style={{ color: activeCourse.note ? "var(--stu-ink)" : "var(--stu-mute)" }}>
                  {activeCourse.note || "No comment from teacher yet."}
                </p>
              </div>
            </div>
          </>
        )}

        {tab === "history" && (
          <>
            <h2>Attendance History</h2>
            <p className="stu-sub">Date-wise Present and Absent log.</p>
            <div className="stu-card" style={{ textAlign: "center", padding: "40px 24px" }}>
              <span className="stu-pill warn" style={{ marginBottom: "12px" }}>Awaiting Supabase Date Logs</span>
              <p style={{ color: "var(--stu-mute)", maxWidth: "480px", margin: "0 auto" }}>
                Date-wise session logs will appear here automatically once connected to your Supabase attendance_sessions table.
              </p>
            </div>
          </>
        )}

        {tab === "notifications" && (
          <>
            <h2>Notifications</h2>
            <p className="stu-sub">Alerts and course updates for your account.</p>
            {notifications.length === 0 ? (
              <div className="stu-card" style={{ textAlign: "center", color: "var(--stu-mute)" }}>
                No alerts right now. All courses are in good standing!
              </div>
            ) : (
              notifications.map((n, idx) => (
                <div
                  key={idx}
                  className="stu-alert"
                  style={{
                    background: n.type === "warn" ? "var(--stu-warn-bg)" : "var(--stu-brand-light)",
                    color: n.type === "warn" ? "var(--stu-warn)" : "var(--stu-ink)",
                  }}
                >
                  <span>{n.type === "warn" ? "⚠" : "ℹ"}</span>
                  <span style={{ flex: 1 }}>{n.msg}</span>
                  <small>{n.date}</small>
                </div>
              ))
            )}
          </>
        )}

        {tab === "profile" && (
          <>
            <h2>My Profile</h2>
            <p className="stu-sub">View and manage your registered details.</p>

            <div className="stu-card">
              <div className="stu-profile-photo-area">
                {pendingPhoto || profilePhoto ? (
                  <img className="stu-profile-photo" src={pendingPhoto || profilePhoto} alt="Profile" />
                ) : (
                  <div className="stu-profile-placeholder">{initials}</div>
                )}
                <div>
                  <h3 style={{ marginBottom: "8px", color: "#064e3b" }}>{student.name}</h3>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button className="stu-btn-secondary" onClick={() => fileInputRef.current?.click()}>
                      Upload / Change Photo
                    </button>
                    {(profilePhoto || pendingPhoto) && (
                      <button
                        className="stu-btn-secondary"
                        onClick={() => {
                          setProfilePhoto("");
                          setPendingPhoto("");
                          localStorage.removeItem("studentProfilePhoto");
                        }}
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                  {pendingPhoto && (
                    <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
                      <button
                        className="stu-btn"
                        onClick={() => {
                          localStorage.setItem("studentProfilePhoto", pendingPhoto);
                          setProfilePhoto(pendingPhoto);
                          setPendingPhoto("");
                        }}
                      >
                        Save Photo
                      </button>
                      <button className="stu-btn-secondary" onClick={() => setPendingPhoto("")}>Cancel</button>
                    </div>
                  )}
                </div>
              </div>

              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handlePhotoSelect} />

              {profileEditing ? (
                <div className="stu-profile-form" style={{ maxWidth: "460px", display: "grid", gap: "10px" }}>
                  <label>Full Name</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <label>Email</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button className="stu-btn" onClick={handleSaveProfile}>Save Changes</button>
                    <button className="stu-btn-secondary" onClick={() => setProfileEditing(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <dl className="stu-kv">
                    <dt>Full Name</dt><dd>{student.name}</dd>
                    <dt>Roll Number</dt><dd>{student.roll}</dd>
                    <dt>Department</dt><dd>{student.dept || "CSE"}</dd>
                    <dt>Academic Session</dt><dd>{student.session || state.context.session}</dd>
                    <dt>Email</dt><dd>{student.email}</dd>
                  </dl>
                  <button
                    className="stu-btn"
                    onClick={() => {
                      setEditName(student.name);
                      setEditEmail(student.email);
                      setProfileEditing(true);
                    }}
                  >
                    Edit Profile
                  </button>
                </>
              )}

              <hr style={{ margin: "24px 0", border: 0, borderTop: "1px solid var(--stu-line)" }} />

              {passwordEditing ? (
                <div className="stu-profile-form" style={{ maxWidth: "460px", display: "grid", gap: "10px" }}>
                  <h3 style={{ color: "#064e3b" }}>Change Password</h3>
                  <label>Current Password</label>
                  <input type="password" value={currPass} onChange={(e) => setCurrPass(e.target.value)} />
                  <label>New Password</label>
                  <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
                  <label>Confirm New Password</label>
                  <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
                  {passErr && <p style={{ color: "var(--stu-bad)", fontSize: "13px" }}>{passErr}</p>}
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button className="stu-btn" onClick={handleSavePassword}>Save Password</button>
                    <button className="stu-btn-secondary" onClick={() => setPasswordEditing(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 style={{ color: "#064e3b", marginBottom: "6px" }}>Password</h3>
                  <p style={{ letterSpacing: "3px", marginBottom: "12px" }}>••••••••</p>
                  <button className="stu-btn-secondary" onClick={() => setPasswordEditing(true)}>Change Password</button>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}