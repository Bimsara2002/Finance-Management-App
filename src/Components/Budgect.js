import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Budgect.css"; 

export default function Budget() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const [formData, setFormData] = useState({
    user_id: user?.user_id || "",
    month: "",
    category: "",
    planned_amount: "",
    actual_amount: "",
    notes: "",
  });

  const [budgets, setBudgets] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const today = new Date();
    const currentMonth = months[today.getMonth()] + " " + today.getFullYear();
    setFormData(prev => ({
      ...prev,
      month: currentMonth
    }));
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/budget/${user.user_id}`);
      const data = await res.json();
      setBudgets(data);
    } catch {
      setMessage("⚠ Could not fetch budgets. Try again later.");
    }
  };

  const handleChange = e => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const payload = { ...formData, user_id: user?.user_id };
    const url = editingId
      ? `http://localhost:5000/api/budget/${editingId}`
      : "http://localhost:5000/api/budget";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      setMessage(result.message || "✅ Success!");
      if (res.ok) {
        fetchBudgets();
        setFormData(prev => ({
          ...prev,
          category: "",
          planned_amount: "",
          actual_amount: "",
          notes: ""
        }));
        setEditingId(null);
      }
    } catch {
      setMessage("⚠ Server not responding. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = b => {
    setFormData({
      user_id: b.user_id,
      month: b.month,
      category: b.category,
      planned_amount: b.planned_amount,
      actual_amount: b.actual_amount || "",
      notes: b.notes || ""
    });
    setEditingId(b.budget_id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async id => {
    if (!window.confirm("Are you sure you want to delete this budget?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/budget/${id}`, { method: "DELETE" });
      const result = await res.json();
      setMessage(result.message || "Deleted");
      fetchBudgets();
    } catch {
      setMessage("⚠ Server not responding. Try again later.");
    }
  };

  return (
    <div className="budget-modern-container">
      <button className="btn back-btn mb-3" onClick={() => navigate("/dashboard")}>⬅ Back</button>
      <div className="budget-modern-row">
        <div className="budget-modern-col form-col">
          <div className="budget-modern-card">
            <h2 className="text-center mb-4">{editingId ? "✏ Edit Budget" : "💰 Add New Budget"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-2">
                <label>Month</label>
                <select name="month" value={formData.month} onChange={handleChange} className="form-control" required>
                  {months.map((m, i) => (
                    <option key={i} value={`${m} ${new Date().getFullYear()}`}>{m} {new Date().getFullYear()}</option>
                  ))}
                </select>
              </div>
              <div className="form-group mb-2">
                <label>Category</label>
                <input type="text" name="category" value={formData.category} onChange={handleChange} className="form-control" placeholder="Food, Bills, etc." required/>
              </div>
              <div className="form-group mb-2">
                <label>Planned Amount (Rs.)</label>
                <input type="number" name="planned_amount" value={formData.planned_amount} onChange={handleChange} className="form-control" required/>
              </div>
              <div className="form-group mb-2">
                <label>Actual Amount (Rs.)</label>
                <input type="number" name="actual_amount" value={formData.actual_amount} onChange={handleChange} className="form-control"/>
              </div>
              <div className="form-group mb-2">
                <label>Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} className="form-control" placeholder="Optional note"></textarea>
              </div>
              <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
                {loading ? "Saving..." : editingId ? "Update Budget" : "Add Budget"}
              </button>
              {message && <p className="alert alert-info mt-3 text-center">{message}</p>}
            </form>
          </div>
        </div>

        <div className="budget-modern-col table-col">
          <h3>Your Budgets</h3>
          <div className="table-responsive">
            <table className="table table-hover table-modern">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Category</th>
                  <th>Planned</th>
                  <th>Actual</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {budgets.length===0 ? (
                  <tr><td colSpan="6" className="text-center text-muted">No budgets added yet</td></tr>
                ) : (
                  budgets.map(b => (
                    <tr key={b.budget_id}>
                      <td>{b.month}</td>
                      <td>{b.category}</td>
                      <td>Rs. {b.planned_amount}</td>
                      <td>Rs. {b.actual_amount || "-"}</td>
                      <td>{b.notes || "-"}</td>
                      <td>
                        <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(b)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b.budget_id)}>Delete</button>
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