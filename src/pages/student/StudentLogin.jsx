import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import "../../styles/student.css";

export default function StudentLogin() {
  const { state, setAuth } = useApp();
  const navigate = useNavigate();

  const [roll, setRoll] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    const cleanRoll = roll.trim();

    if (!/^[0-9]+$/.test(cleanRoll)) {
      setError("Roll number must contain numbers only.");
      return;
    }

    const foundStudent = state.students.find(
      (s) => s.roll === cleanRoll && s.password === password
    );

    if (!foundStudent) {
      setError("Invalid roll number or password.");
      return;
    }

    setError("");
    setAuth({ role: "student", user: foundStudent });
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
            Sign in with your registered roll number and password to see
            course-wise attendance, teacher comments, and alerts.
          </p>
        </div>

        <small style={{ color: "#bbf7d0" }}>KUET Student Portal · {state.selectedDept}</small>
      </div>

      <div className="stu-login-form-wrap">
        <form onSubmit={handleLogin}>
          <h2>Student sign in</h2>
          <p className="stu-sub">Use your registered credentials.</p>

          <label htmlFor="roll">Roll number</label>
          <input
            id="roll"
            type="text"
            inputMode="numeric"
            value={roll}
            onChange={(e) => setRoll(e.target.value)}
            placeholder="e.g., 2307001"
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

          <button className="stu-btn" type="submit" style={{ width: "100%", marginTop: "22px" }}>
            Sign in
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            style={{ display: "block", margin: "16px auto 0", background: "none", border: "none", color: "#15803d", fontWeight: 600, fontSize: "13.5px", cursor: "pointer" }}
          >
            ← Back to Main Portal
          </button>

          <p className="stu-note">
            Demo logins: <strong>2307001</strong> / <strong>12345678</strong> or{" "}
            <strong>2107001</strong> / <strong>stu001@pass</strong>
          </p>
        </form>
      </div>
    </section>
  );
}