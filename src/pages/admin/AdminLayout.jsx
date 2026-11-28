import { NavLink, Outlet, Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import "../../styles/admin.css";

export default function AdminLayout() {
  const { state } = useApp();

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <i className="fa-solid fa-fingerprint"></i>
          <span>SmartAttend Admin</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin/courses" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <i className="fa-solid fa-book-open"></i> 1. Course Management
          </NavLink>
          <NavLink to="/admin/teachers" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <i className="fa-solid fa-chalkboard-user"></i> 2. Teacher Management
          </NavLink>
          <NavLink to="/admin/students" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <i className="fa-solid fa-user-graduate"></i> 3. Student Management
          </NavLink>
          <NavLink to="/admin/profile" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <i className="fa-solid fa-id-card"></i> 4. Admin Profile
          </NavLink>
        </nav>

        <div className="sidebar-footer" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Link to="/admin/setup" className="btn-outline full-width" style={{ display: "block", textAlign: "center" }}>
            <i className="fa-solid fa-sliders"></i> Change Session/Term
          </Link>
          <Link to="/" className="btn-outline full-width" style={{ display: "block", textAlign: "center" }}>
            <i className="fa-solid fa-arrow-left"></i> Main Portal
          </Link>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="active-context-badges">
            <span className="badge"><i className="fa-regular fa-calendar"></i> Session: <strong>{state.context.session}</strong></span>
            <span className="badge"><i className="fa-solid fa-layer-group"></i> Term: <strong>{state.context.term}</strong></span>
            <span className="badge"><i className="fa-solid fa-users-rectangle"></i> Section: <strong>{state.context.section}</strong></span>
          </div>
          <div className="admin-greeting">
            <span>Logged in as <strong>{state.adminProfile.name}</strong></span>
          </div>
        </header>

        <section className="content-section">
          <Outlet />
        </section>
      </main>
    </div>
  );
}