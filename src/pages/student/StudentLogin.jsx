import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
// import { supabase } from "../../lib/supabase";
import "../../styles/student.css";

export default function StudentLogin() {
  const { state, setAuth } = useApp();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);

  // Login state
  const [roll, setRoll] = useState("");
  const [password, setPassword] = useState("");

  // Sign-up state
  const [regRoll, setRegRoll] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regSession, setRegSession] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const cleanRoll = roll.trim();

    if (!/^[0-9]+$/.test(cleanRoll)) {
      setError("Roll number must contain numbers only.");
      return;
    }

    setLoading(true);
    const { data, error: dbError } = await supabase
      .from("students")
      .select("*")
      .eq("roll", cleanRoll)
      .eq("password", password)
      .maybeSingle();

    setLoading(false);

    if (dbError || !data) {
      setError("Invalid roll number or password.");
      return;
    }

    setAuth({ role: "student", user: data });
    navigate("/student/dashboard");
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    const cleanRoll = regRoll.trim();
    const cleanEmail = regEmail.trim().toLowerCase();

    if (!/^[0-9]+$/.test(cleanRoll)) {
      setError("Roll number must contain numbers only.");
      return;
    }

    setLoading(true);

    const { data: existing } = await supabase
      .from("students")
      .select("id")
      .or(`roll.eq.${cleanRoll},email.eq.${cleanEmail}`)
      .maybeSingle();

    if (existing) {
      setLoading(false);
      setError("A student with this roll number or email already exists.");
      return;
    }

    const { data: created, error: insertError } = await supabase
      .from("students")
      .insert([
        {
          roll: cleanRoll,
          name: regName.trim(),
          email: cleanEmail,
          department: state.selectedDept,
          session: regSession.trim() || state.context.session,
          password: regPassword,
        },
      ])
      .select()
      .single();

    setLoading(false);

    if (insertError) {
      setError(insertError.message || "Could not register student.");
      return;
    }

    setAuth({ role: "student", user: created });
    navigate("/student/dashboard");
  };

  return (
    <section className="stu-login">
      <div className="art">
        <div className="stu-logo">
          <i>SA</i>
          Smart Attendance System
        </div>

        <div>
          <h1>Check your attendance before the semester decides it for you.</h1>
          <p>
            Create an account or sign in with your roll number and password to
            view course-wise attendance, teacher comments, and alerts.
          </p>
        </div>

        <small style={{ color: "#bbf7d0" }}>
          KUET Student Portal · {state.selectedDept}
        </small>
      </div>

      <div className="stu-login-form-wrap">
        {!isSignUp ? (
          <form onSubmit={handleLogin}>
            <h2>Student sign in</h2>
            <p className="stu-sub">Use your registered roll number and password.</p>

            <label htmlFor="roll">Roll number</label>
            <input
              id="roll"
              type="text"
              inputMode="numeric"
              value={roll}
              onChange={(e) => setRoll(e.target.value)}
              placeholder="Enter your roll number"
              required
            />

            <label htmlFor="pw">Password</label>
            <input
              id="pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            {error && <div className="stu-err">{error}</div>}

            <button
              className="stu-btn"
              type="submit"
              disabled={loading}
              style={{ width: "100%", marginTop: "22px" }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <button
              type="button"
              onClick={() => {
                setError("");
                setIsSignUp(true);
              }}
              style={{
                display: "block",
                margin: "16px auto 0",
                background: "none",
                border: "none",
                color: "#22c55e",
                fontWeight: 600,
                fontSize: "13.5px",
                cursor: "pointer",
              }}
            >
              First time here? Create Student Account
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              style={{
                display: "block",
                margin: "10px auto 0",
                background: "none",
                border: "none",
                color: "#86a898",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              ← Back to Main Portal
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp}>
            <h2>Student sign up</h2>
            <p className="stu-sub">Register with your roll number and set a password.</p>

            <label htmlFor="regRoll">Roll number</label>
            <input
              id="regRoll"
              type="text"
              inputMode="numeric"
              value={regRoll}
              onChange={(e) => setRegRoll(e.target.value)}
              placeholder="e.g., 2507001"
              required
            />

            <label htmlFor="regName">Full name</label>
            <input
              id="regName"
              type="text"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              placeholder="Enter your full name"
              required
            />

            <label htmlFor="regEmail">Email</label>
            <input
              id="regEmail"
              type="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              placeholder="your.email@stud.kuet.ac.bd"
              required
            />

            <label htmlFor="regSession">Session</label>
            <input
              id="regSession"
              type="text"
              value={regSession}
              onChange={(e) => setRegSession(e.target.value)}
              placeholder={`e.g., ${state.context.session}`}
            />

            <label htmlFor="regPassword">Create password</label>
            <input
              id="regPassword"
              type="password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              placeholder="At least 6 characters"
              minLength={6}
              required
            />

            {error && <div className="stu-err">{error}</div>}

            <button
              className="stu-btn"
              type="submit"
              disabled={loading}
              style={{ width: "100%", marginTop: "22px" }}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <button
              type="button"
              onClick={() => {
                setError("");
                setIsSignUp(false);
              }}
              style={{
                display: "block",
                margin: "16px auto 0",
                background: "none",
                border: "none",
                color: "#22c55e",
                fontWeight: 600,
                fontSize: "13.5px",
                cursor: "pointer",
              }}
            >
              Already registered? Sign In
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              style={{
                display: "block",
                margin: "10px auto 0",
                background: "none",
                border: "none",
                color: "#86a898",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              ← Back to Main Portal
            </button>
          </form>
        )}
      </div>
    </section>
  );
}