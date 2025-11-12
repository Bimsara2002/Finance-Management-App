import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("🎉 " + result.message);
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage("⚠️ " + (result.message || "Registration failed!"));
      }
    } catch (error) {
      setMessage("❌ Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-bg">
      <div className="register-card glass">
        <h2 className="register-title">Create Your Account</h2>
        <p className="register-subtitle">
          Join us to manage your finances easily
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <input
              type="text"
              name="username"
              placeholder="Enter username"
              className="form-control modern-input"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group mb-3">
            <input
              type="email"
              name="email"
              placeholder="Enter email address"
              className="form-control modern-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group mb-4">
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              className="form-control modern-input"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-modern" disabled={loading}>
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        {message && <p className="message">{message}</p>}

        <div className="register-footer">
          Already have an account? <a href="/login">Login here</a>
        </div>
      </div>
    </div>
  );
}
