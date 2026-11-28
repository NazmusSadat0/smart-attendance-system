import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import "../../styles/admin.css";

export default function AdminSetup() {
  const { state, setState } = useApp();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState(["21-22", "22-23", "23-24", "24-25", "25-26"]);
  const [terms, setTerms] = useState(["1.1", "1.2", "2.1", "2.2", "3.1", "3.2", "4.1", "4.2"]);
  const [sections, setSections] = useState(["A", "B"]);

  const [session, setSession] = useState(state.context.session);
  const [term, setTerm] = useState(state.context.term);
  const [section, setSection] = useState(state.context.section);

  const handleAddCustom = (list, setList, setValue, label) => {
    const val = prompt(`Enter custom ${label}:`);
    if (!val || !val.trim()) return;
    const clean = val.trim();
    if (!list.some((item) => item.toLowerCase() === clean.toLowerCase())) {
      setList([...list, clean]);
    }
    setValue(clean);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setState((prev) => ({
      ...prev,
      context: { session, term, section },
    }));
    navigate("/admin/courses");
  };

  return (
    <section className="context-wrapper">
      <div className="context-card">
        <div className="brand-header">
          <i className="fa-solid fa-user-shield"></i>
          <h2>Admin Control Setup</h2>
          <p>{state.selectedDept}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Academic Session</label>
            <div className="input-with-btn">
              <select value={session} onChange={(e) => setSession(e.target.value)} required>
                {sessions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button type="button" className="btn-icon" onClick={() => handleAddCustom(sessions, setSessions, setSession, "Session (e.g., 26-27)")}>
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Academic Term / Semester</label>
            <div className="input-with-btn">
              <select value={term} onChange={(e) => setTerm(e.target.value)} required>
                {terms.map((t) => <option key={t} value={t}>Term {t}</option>)}
              </select>
              <button type="button" className="btn-icon" onClick={() => handleAddCustom(terms, setTerms, setTerm, "Term (e.g., 5.1)")}>
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Section</label>
            <div className="input-with-btn">
              <select value={section} onChange={(e) => setSection(e.target.value)} required>
                {sections.map((sec) => <option key={sec} value={sec}>Section {sec}</option>)}
              </select>
              <button type="button" className="btn-icon" onClick={() => handleAddCustom(sections, setSections, setSection, "Section (e.g., C)")}>
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary full-width">
            Enter Admin Menu <i className="fa-solid fa-arrow-right"></i>
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{ marginTop: "12px", width: "100%", background: "none", border: "none", color: "#5c7065", cursor: "pointer", fontSize: "13px" }}
          >
            ← Back to Main Portal
          </button>
        </form>
      </div>
    </section>
  );
}