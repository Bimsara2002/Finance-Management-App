import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AddSaving.css";

export default function AddSaving() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const categories = ["Emergency", "Investment", "Education", "Travel", "Health", "Other"];
  const methods = ["Cash", "Bank Deposit", "Digital Wallet"];

  const generateMonths = () => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), i, 1);
      months.push(date.toLocaleString("default", { month: "long", year: "numeric" }));
    }
    return months;
  };

  const [months] = useState(generateMonths());

  const [formData, setFormData] = useState({
    saving_id: null,
    user_id: user?.user_id,
    month: months[0],
    amount: "",
    category: "",
    method: "",
    date_saved: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [savingsList, setSavingsList] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSavings();
  }, []);

  const fetchSavings = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/savings/${user.user_id}`);
      const data = await response.json();
      setSavingsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch savings:", err);
      setSavingsList([]);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const url = formData.saving_id
        ? `http://localhost:5000/api/savings/${formData.saving_id}`
        : "http://localhost:5000/api/savings";
      const method = formData.saving_id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      setMessage(result.message);
      if (response.ok) {
        fetchSavings();
        setFormData({
          saving_id: null,
          user_id: user?.user_id,
          month: months[0],
          amount: "",
          category: "",
          method: "",
          date_saved: new Date().toISOString().split("T")[0],
          notes: "",
        });
      }
    } catch {
      setMessage("⚠️ Server not responding. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this saving?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/savings/${id}`, { method: "DELETE" });
      const result = await response.json();
      setMessage(result.message);
      if (response.ok) fetchSavings();
    } catch {
      setMessage("⚠️ Server not responding. Try again later.");
    }
  };

  const handleEdit = (saving) => {
    setFormData({
      saving_id: saving.saving_id,
      user_id: saving.user_id,
      month: saving.month,
      amount: saving.amount,
      category: saving.category,
      method: saving.method,
      date_saved: saving.date_saved,
      notes: saving.notes || "",
    });
  };

  return (
    <div className="saving-modern-container">
      <button className="btn back-btn mb-3" onClick={() => navigate("/dashboard")}>⬅ Back</button>

      <div className="saving-modern-row">
        <div className="saving-modern-col form-col">
          <div className="saving-modern-card">
            <h2 className="text-center mb-4">🏦 Add / Edit Saving</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-2">
                <label>Month</label>
                <select name="month" value={formData.month} onChange={handleChange} className="form-control" required>
                  {months.map((m, idx) => <option key={idx} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group mb-2">
                <label>Amount (Rs.)</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="form-control" required />
              </div>
              <div className="form-group mb-2">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="form-control" required>
                  <option value="">Select Category</option>
                  {categories.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group mb-2">
                <label>Method</label>
                <select name="method" value={formData.method} onChange={handleChange} className="form-control" required>
                  <option value="">Select Method</option>
                  {methods.map((m, idx) => <option key={idx} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group mb-2">
                <label>Date Saved</label>
                <input type="date" name="date_saved" value={formData.date_saved} onChange={handleChange} className="form-control" required />
              </div>
              <div className="form-group mb-2">
                <label>Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} className="form-control" />
              </div>
              <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
                {loading ? "Saving..." : formData.saving_id ? "Update Saving" : "Save Saving"}
              </button>
              {message && <p className="alert alert-info mt-3 text-center">{message}</p>}
            </form>
          </div>
        </div>

        <div className="saving-modern-col table-col">
          <h3>Your Savings</h3>
          <div className="table-responsive">
            <table className="table table-hover table-modern">
              <thead className="thead-dark">
                <tr>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {savingsList.length === 0 ? (
                  <tr><td colSpan="7" className="text-center text-muted">No savings added yet</td></tr>
                ) : (
                  savingsList.map((s) => (
                    <tr key={s.saving_id}>
                      <td>{s.month}</td>
                      <td>Rs. {s.amount}</td>
                      <td>{s.category}</td>
                      <td>{s.method}</td>
                      <td>{s.date_saved}</td>
                      <td>{s.notes || "-"}</td>
                      <td>
                        <button className="btn btn-sm btn-info me-1" onClick={() => handleEdit(s)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.saving_id)}>Delete</button>
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
