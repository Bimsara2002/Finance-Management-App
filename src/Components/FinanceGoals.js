import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./FinanceGoals.css"; 

export default function FinancialGoals() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    user_id: user?.user_id || "",
    goal_name: "",
    target_amount: "",
    current_amount: "",
    target_date: "",
    notes: "",
  });

  const [goals, setGoals] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  // Fetch all goals for current user
  const fetchGoals = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/goals/${user.user_id}`);
      const data = await res.json();
      const sorted = data.sort((a, b) => new Date(b.target_date) - new Date(a.target_date));
      setGoals(sorted);
    } catch {
      setMessage("⚠ Could not fetch financial goals. Try again later.");
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Add or Update Goal
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const payload = { ...formData, user_id: user?.user_id };
    const url = editingId
      ? `http://localhost:5000/api/goals/${editingId}`
      : "http://localhost:5000/api/goals";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      setMessage(result.message || "✅ Success!");
      if (res.ok) {
        fetchGoals();
        setFormData({
          user_id: user?.user_id || "",
          goal_name: "",
          target_amount: "",
          current_amount: "",
          target_date: "",
          notes: "",
        });
        setEditingId(null);
      }
    } catch {
      setMessage("⚠ Server not responding. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Edit Goal
  const handleEdit = (g) => {
    setFormData({
      user_id: g.user_id,
      goal_name: g.goal_name,
      target_amount: g.target_amount,
      current_amount: g.current_amount || "",
      target_date: g.target_date,
      notes: g.notes || "",
    });
    setEditingId(g.goal_id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete Goal
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/goals/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      setMessage(result.message || "Deleted");
      fetchGoals();
    } catch {
      setMessage("⚠ Server not responding. Try again later.");
    }
  };

  return (
    <div className="budget-modern-container">
      <button className="btn back-btn mb-3" onClick={() => navigate("/dashboard")}>
        ⬅ Back
      </button>

      <div className="budget-modern-row">
        {/* LEFT: Form */}
        <div className="budget-modern-col form-col">
          <div className="budget-modern-card">
            <h2 className="text-center mb-4">
              {editingId ? "✏ Edit Financial Goal" : "🎯 Add New Financial Goal"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group mb-2">
                <label>Goal Name</label>
                <input
                  type="text"
                  name="goal_name"
                  value={formData.goal_name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="E.g. Buy a Car"
                  required
                />
              </div>

              <div className="form-group mb-2">
                <label>Target Amount (Rs.)</label>
                <input
                  type="number"
                  name="target_amount"
                  value={formData.target_amount}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group mb-2">
                <label>Current Amount (Rs.)</label>
                <input
                  type="number"
                  name="current_amount"
                  value={formData.current_amount}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group mb-2">
                <label>Target Date</label>
                <input
                  type="date"
                  name="target_date"
                  value={formData.target_date}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group mb-2">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Optional note"
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 mt-3"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update Goal"
                  : "Add Goal"}
              </button>

              {message && (
                <p className="alert alert-info mt-3 text-center">{message}</p>
              )}
            </form>
          </div>
        </div>

        {/* RIGHT: Table */}
        <div className="budget-modern-col table-col">
          <h3>Your Financial Goals</h3>
          <div className="table-responsive">
            <table className="table table-hover table-modern">
              <thead>
                <tr>
                  <th>Goal</th>
                  <th>Target</th>
                  <th>Current</th>
                  <th>Target Date</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {goals.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No goals added yet
                    </td>
                  </tr>
                ) : (
                  goals.map((g) => (
                    <tr key={g.goal_id}>
                      <td>{g.goal_name}</td>
                      <td>Rs. {g.target_amount}</td>
                      <td>Rs. {g.current_amount || "-"}</td>
                      <td>{g.target_date}</td>
                      <td>{g.notes || "-"}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(g)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(g.goal_id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}