import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

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

export default function Landing() {
  const { state, setState } = useApp();
  const [selectedDept, setSelectedDept] = useState(state.selectedDept || "");
  const [step, setStep] = useState("department");
  const navigate = useNavigate();

  const handleDeptSubmit = (e) => {
    e.preventDefault();
    if (!selectedDept) return;
    setState((prev) => ({ ...prev, selectedDept }));
    setStep("role");
  };

  const handleRoleSelect = (role) => {
    if (role === "Admin") navigate("/admin/setup");
    if (role === "Teacher") navigate("/teacher/login");
    if (role === "Student") navigate("/student/login");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#fff", border: "1px solid #bbf7d0", borderRadius: "14px", padding: "36px 32px", width: "100%", maxWidth: "460px", boxShadow: "0 10px 25px rgba(22, 163, 74, 0.08)", textAlign: "center" }}>
        <span style={{ display: "inline-block", background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "999px", marginBottom: "12px" }}>
          KUET Portal
        </span>
        <h1 style={{ color: "#111827", fontSize: "24px", marginBottom: "24px" }}>
          Welcome to Smart Attendance System
        </h1>

        {step === "department" ? (
          <form onSubmit={handleDeptSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px", textAlign: "left" }}>
            <label htmlFor="dept-select" style={{ fontSize: "14px", fontWeight: 600, color: "#4b5563" }}>
              Select Your Department
            </label>
            <select
              id="dept-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              required
              style={{ padding: "12px", border: "1.5px solid #bbf7d0", borderRadius: "8px", fontSize: "14px", color: "#111827", background: "#fff" }}
            >
              <option value="" disabled>-- Choose a department --</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <button type="submit" style={{ marginTop: "8px", padding: "12px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
              Continue
            </button>
          </form>
        ) : (
          <div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#15803d", background: "#f0fdf4", padding: "8px 12px", borderRadius: "6px", marginBottom: "12px" }}>
              {selectedDept}
            </p>
            <p style={{ fontSize: "14px", color: "#4b5563", marginBottom: "18px" }}>Choose your login portal</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {["Student", "Teacher", "Admin"].map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  style={{ padding: "14px", background: "#fff", color: "#15803d", border: "1.5px solid #16a34a", borderRadius: "8px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
                  onMouseOver={(e) => { e.currentTarget.style.background = "#16a34a"; e.currentTarget.style.color = "#fff"; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#15803d"; }}
                >
                  {role} Login
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep("department")}
              style={{ marginTop: "20px", background: "none", border: "none", color: "#4b5563", fontSize: "13px", cursor: "pointer", textDecoration: "underline" }}
            >
              ← Change Department
            </button>
          </div>
        )}
      </div>
    </div>
  );
}