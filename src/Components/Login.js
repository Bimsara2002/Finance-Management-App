import React, { useState } from "react";
import "./Login.css"; 
import "bootstrap/dist/css/bootstrap.min.css";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(result.message);
        localStorage.setItem("user", JSON.stringify(result));
        setFormData({ email: "", password: "" });

        //  redirect to dashboard
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
      } else {
        setMessage(result.message || "Login failed!");
      }
    } catch (error) {
      setMessage("❌ Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card glass">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Log in to continue your journey</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
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
              placeholder="Enter your password"
              className="form-control modern-input"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-modern" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && <p className="message">{message}</p>}

        <div className="login-footer">
          Don’t have an account? <a href="/register">Register here</a>
        </div>
      </div>
    </div>
  );
}
