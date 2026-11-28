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
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top right, #0f2e22 0%, #07130e 65%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#0d1f18",
          border: "1px solid #1e4234",
          borderRadius: "18px",
          padding: "40px 34px",
          width: "100%",
          maxWidth: "460px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "inline-block",
            background: "rgba(34, 197, 94, 0.15)",
            color: "#4ade80",
            border: "1px solid #1e4234",
            fontSize: "12px",
            fontWeight: 700,
            padding: "5px 14px",
            borderRadius: "999px",
            marginBottom: "14px",
          }}
        >
          KUET Portal
        </span>
        <h1 style={{ color: "#ecfdf5", fontSize: "25px", marginBottom: "24px", letterSpacing: "-0.02em" }}>
          Welcome to Smart Attendance System
        </h1>

        {step === "department" ? (
          <form onSubmit={handleDeptSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px", textAlign: "left" }}>
            <label htmlFor="dept-select" style={{ fontSize: "14px", fontWeight: 600, color: "#86a898" }}>
              Select Your Department
            </label>
            <select
              id="dept-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              required
              style={{
                padding: "12px",
                border: "1.5px solid #1e4234",
                borderRadius: "10px",
                fontSize: "14px",
                color: "#ecfdf5",
                background: "#132c22",
              }}
            >
              <option value="" disabled>-- Choose a department --</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <button
              type="submit"
              style={{
                marginTop: "8px",
                padding: "13px",
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                color: "#04120b",
                border: "none",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 6px 16px rgba(34, 197, 94, 0.25)",
              }}
            >
              Continue
            </button>
          </form>
        ) : (
          <div>
            <p
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#4ade80",
                background: "#132c22",
                border: "1px solid #1e4234",
                padding: "10px 14px",
                borderRadius: "8px",
                marginBottom: "14px",
              }}
            >
              {selectedDept}
            </p>
            <p style={{ fontSize: "14px", color: "#86a898", marginBottom: "18px" }}>Choose your login portal</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {["Student", "Teacher", "Admin"].map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  style={{
                    padding: "14px",
                    background: "#132c22",
                    color: "#4ade80",
                    border: "1.5px solid #22c55e",
                    borderRadius: "10px",
                    fontSize: "15px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "#22c55e";
                    e.currentTarget.style.color = "#04120b";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "#132c22";
                    e.currentTarget.style.color = "#4ade80";
                  }}
                >
                  {role} Login
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep("department")}
              style={{
                marginTop: "20px",
                background: "none",
                border: "none",
                color: "#86a898",
                fontSize: "13px",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              ← Change Department
            </button>
          </div>
        )}
      </div>
    </div>
  );
}