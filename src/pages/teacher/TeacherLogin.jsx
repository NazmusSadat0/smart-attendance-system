import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
// import { supabase } from "../../lib/supabase";
import "../../styles/teacher.css";

export default function TeacherLogin() {
  const { state, setAuth } = useApp();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);

  // Login state
  const [teacherId, setTeacherId] = useState("");
  const [password, setPassword] = useState("");

  // Sign-up state
  const [regId, setRegId] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);
    setLoading(true);

    const cleanId = teacherId.trim();

    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .ilike("teacher_code", cleanId)
      .eq("password", password)
      .maybeSingle();

    setLoading(false);

    if (error || !data) {
      setMessage("Invalid Teacher ID or password.");
      return;
    }

    setAuth({ role: "teacher", user: data });
    navigate("/teacher/dashboard");
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);
    setLoading(true);

    const cleanCode = regId.trim().toUpperCase();
    const cleanEmail = regEmail.trim().toLowerCase();

    const { data: existing } = await supabase
      .from("teachers")
      .select("id")
      .or(`teacher_code.eq.${cleanCode},email.eq.${cleanEmail}`)
      .maybeSingle();

    if (existing) {
      setLoading(false);
      setMessage("A teacher account with this ID or email already exists.");
      return;
    }

    const { data: created, error } = await supabase
      .from("teachers")
      .insert([
        {
          teacher_code: cleanCode,
          name: regName.trim(),
          email: cleanEmail,
          department: state.selectedDept,
          password: regPassword,
        },
      ])
      .select()
      .single();

    setLoading(false);

    if (error) {
      setMessage(error.message || "Could not create teacher account.");
      return;
    }

    setIsSuccess(true);
    setMessage("Account created! Signing you in...");
    setAuth({ role: "teacher", user: created });
    navigate("/teacher/dashboard");
  };

  return (
    <main className="teacher-page">
      <section className="teacher-card">
        <div className="teacher-badge">KUET Smart Attendance</div>
        <h1>{isSignUp ? "Teacher Sign Up" : "Teacher Login"}</h1>
        <p className="teacher-subtitle">
          {isSignUp
            ? "Create your teacher account to manage courses and attendance."
            : "Sign in to manage your courses and attendance."}
        </p>

        <div className="teacher-department">
          <span>Selected Department</span>
          <strong>{state.selectedDept}</strong>
        </div>

        {!isSignUp ? (
          <form onSubmit={handleLogin}>
            <div className="teacher-field">
              <label htmlFor="teacherId">Teacher ID</label>
              <input
                type="text"
                id="teacherId"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                placeholder="Enter your teacher ID (e.g., T-101)"
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

            {message && (
              <p className={`teacher-message ${isSuccess ? "success" : ""}`}>{message}</p>
            )}

            <button type="submit" className="teacher-primary-btn" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp}>
            <div className="teacher-field">
              <label htmlFor="regId">Teacher ID</label>
              <input
                type="text"
                id="regId"
                value={regId}
                onChange={(e) => setRegId(e.target.value)}
                placeholder="e.g., T-105"
                required
              />
            </div>

            <div className="teacher-field">
              <label htmlFor="regName">Full Name</label>
              <input
                type="text"
                id="regName"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="teacher-field">
              <label htmlFor="regEmail">Email Address</label>
              <input
                type="email"
                id="regEmail"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="name@kuet.ac.bd"
                required
              />
            </div>

            <div className="teacher-field">
              <label htmlFor="regPassword">Create Password</label>
              <input
                type="password"
                id="regPassword"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Choose a password"
                minLength={6}
                required
              />
            </div>

            {message && (
              <p className={`teacher-message ${isSuccess ? "success" : ""}`}>{message}</p>
            )}

            <button type="submit" className="teacher-primary-btn" disabled={loading}>
              {loading ? "Creating account..." : "Create Teacher Account"}
            </button>
          </form>
        )}

        <button
          type="button"
          className="teacher-back-btn"
          onClick={() => {
            setMessage("");
            setIsSuccess(false);
            setIsSignUp(!isSignUp);
          }}
        >
          {isSignUp ? "Already have an account? Sign In" : "New teacher? Sign Up here"}
        </button>

        <button type="button" className="teacher-back-btn" onClick={() => navigate("/")}>
          ← Back to Main Portal
        </button>
      </section>
    </main>
  );
}