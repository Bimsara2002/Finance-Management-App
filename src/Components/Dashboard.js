import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css"; // We'll add animation CSS here
import { Button } from "bootstrap";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [showSettings, setShowSettings] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [userData, setUserData] = useState({ username: "", email: "" });
  const [password, setPassword] = useState("");

  if (!user) {
    window.location.href = "/";
    return null;
  }

  // Fetch user data from backend
  const handleOpenEdit = async () => {
    setShowSettings(false);
    setShowEditModal(true);
    try {
      const response = await fetch(`http://127.0.0.1:5001/api/users/${user.user_id}`);
      const data = await response.json();
      setUserData({ username: data.username, email: data.email });
    } catch (err) {
      console.error(err);
      alert("❌ Error fetching user data.");
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5001/api/users/${user.user_id}/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      alert(data.message);
      setShowEditModal(false);
      setPassword("");
    } catch (err) {
      console.error(err);
      alert("❌ Error updating password.");
    }
  };

  const handleBackup = async () => {
    setShowSettings(false);
    setIsBackingUp(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert("❌ Error connecting to server.");
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* NAVBAR */}
      <nav className="navbar navbar-dark bg-primary px-4 d-flex justify-content-between align-items-center">
        <h4 className="text-white m-0">Finance Manager</h4>
        <div className="d-flex align-items-center gap-3">
          <div className="position-relative">
            <button
              className="btn btn-light btn-sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              ⚙ Settings
            </button>

            {showSettings && (
              <div className="dropdown-menu show mt-2 shadow-sm position-absolute end-0">
                <button className="dropdown-item" onClick={handleOpenEdit}>
                  🔐 Edit Password
                </button>
                <button
                  className="dropdown-item"
                  disabled={isBackingUp}
                  onClick={handleBackup}
                >
                  {isBackingUp ? "⏳ Backing up..." : "💾 Backup Data"}
                </button>
              </div>
            )}
          </div>
          

          <button
            className="btn btn-light btn-sm"
            onClick={() => {
              localStorage.removeItem("user");
              window.location.href = "/";
            }}
          >
            🚪 Logout
          </button>
        </div>
      </nav>

      {/* WELCOME */}
      <div className="welcome-section text-center mt-4">
        <h3>Welcome, {user.username} 👋</h3>
        <p>Manage your finances easily and stay on top of your goals</p>
      </div>

      {/* DASHBOARD CARDS */}
      <div className="cards-container">
        <div className="card-option" onClick={() => navigate("/income")}>
          💰 Add Income
        </div>
        <div className="card-option" onClick={() => navigate("/savings")}>
          💵 Add Savings
        </div>
        <div className="card-option" onClick={() => navigate("/expenses")}>
          🧾 Add Expenses
        </div>
        <div className="card-option" onClick={() => navigate("/budget")}>
          📋 Set Budget
        </div>
        <div className="card-option" onClick={() => navigate("/goals")}>
          🎯 Set Financial Goals
        </div>
        <div className="card-option" onClick={() => navigate("/reports")}>
          📊 View Reports
        </div>
        <div className="card-option" onClick={() => navigate("/Yearlyreports")}>
          📈 View Yearly Reports
        </div>
      </div>

      {/* MODAL */}
      {showEditModal && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()} // prevent modal close when clicking inside
          >
            <h5>Edit Password</h5>
            <div className="mb-2">
              <label>Username</label>
              <input type="text" value={userData.username} disabled className="form-control" />
            </div>
            <div className="mb-2">
              <label>Email</label>
              <input type="email" value={userData.email} disabled className="form-control" />
            </div>
            <div className="mb-2">
              <label>New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                placeholder="Enter new password"
              />
            </div>
            <div className="d-flex justify-content-end gap-2 mt-2">
              <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handlePasswordUpdate}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
