import { useState } from "react";
import { useApp } from "../../context/AppContext";

export default function AdminProfile() {
  const { state, setState } = useApp();
  const [name, setName] = useState(state.adminProfile.name);
  const [empId, setEmpId] = useState(state.adminProfile.empId);
  const [email, setEmail] = useState(state.adminProfile.email);
  const [contact, setContact] = useState(state.adminProfile.contact);
  const [showPass, setShowPass] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setState((prev) => ({
      ...prev,
      adminProfile: { ...prev.adminProfile, name: name.trim(), empId: empId.trim(), email: email.trim(), contact: contact.trim() },
    }));
    alert("Admin profile updated successfully!");
  };

  return (
    <>
      <div className="section-header">
        <h2>Admin Profile</h2>
      </div>

      <div className="form-card profile-card">
        <div className="profile-banner">
          <div className="avatar"><i className="fa-solid fa-user-tie"></i></div>
          <div>
            <h3>{state.adminProfile.name}</h3>
            <p className="muted">Authorized Department Admin</p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Employee ID</label>
              <input type="text" value={empId} onChange={(e) => setEmpId(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Contact Number</label>
              <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} required />
            </div>
            <div className="form-group full-span">
              <label>Admin Password <small className="muted">(Configured by Super Admin — Read Only)</small></label>
              <div className="input-with-btn">
                <input type={showPass ? "text" : "password"} value={state.adminProfile.superAdminPassword} readOnly />
                <button type="button" className="btn-icon" onClick={() => setShowPass(!showPass)} title="Show/Hide Password">
                  <i className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary">Save Profile Changes</button>
        </form>
      </div>
    </>
  );
}
