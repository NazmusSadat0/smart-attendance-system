import { useState } from "react";
import "./App.css";

const DEPARTMENTS = [
  "Computer Science and Engineering (CSE)",
  "Electrical and Electronic Engineering (EEE)",
  "Mechanical Engineering (ME)",
  "Civil Engineering (CE)",
  "Electronics and Communication Engineering (ECE)",
  "Biomedical Engineering (BME)",
  "Materials Science and Engineering (MSE)",
  "Industrial Engineering and Management (IEM)",
  "Leather Engineering (LE)",
  "Textile Engineering (TE)",
  "Chemical Engineering (ChE)",
  "Building Engineering and Construction Management (BECM)",
  "Urban and Regional Planning (URP)",
  "Architecture (Arch)",
];

export default function App() {
  const [selectedDept, setSelectedDept] = useState("");
  const [step, setStep] = useState("department"); // "department" | "role"

  const handleDeptSubmit = (e) => {
    e.preventDefault();
    if (!selectedDept) return;
    setStep("role");
  };

  const handleRoleSelect = (role) => {
    alert(`Proceeding to ${role} Login for ${selectedDept}`);
    // Next step: route to /login/${role.toLowerCase()}
  };

  return (
    <div className="page-wrapper">
      <div className="card">
        <div className="header">
          <span className="badge">KUET Portal</span>
          <h1>Welcome to Smart Attendance System</h1>
        </div>

        {step === "department" ? (
          <form onSubmit={handleDeptSubmit} className="dept-form">
            <label htmlFor="dept-select">Select Your Department</label>
            <select
              id="dept-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              required
            >
              <option value="" disabled>
                -- Choose a department --
              </option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <button type="submit" className="btn-primary">
              Continue
            </button>
          </form>
        ) : (
          <div className="role-section">
            <p className="selected-dept">{selectedDept}</p>
            <p className="subtitle">Choose your login portal</p>

            <div className="role-grid">
              <button
                className="role-btn"
                onClick={() => handleRoleSelect("Student")}
              >
                Student Login
              </button>
              <button
                className="role-btn"
                onClick={() => handleRoleSelect("Teacher")}
              >
                Teacher Login
              </button>
              <button
                className="role-btn"
                onClick={() => handleRoleSelect("Admin")}
              >
                Admin Login
              </button>
            </div>

            <button
              className="btn-back"
              onClick={() => setStep("department")}
            >
              ← Change Department
            </button>
          </div>
        )}
      </div>
    </div>
  );
}