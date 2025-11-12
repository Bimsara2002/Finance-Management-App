import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AddExpenses.css";

export default function AddExpenses() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const paymentMethods = ["Cash", "Credit Card", "Bank Transfer", "Digital Wallet"];

  const [formData, setFormData] = useState({
    user_id: user?.user_id || "",
    month: "",
    category: "",
    amount: "",
    date_spent: "",
    payment_method: "",
    notes: "",
  });

  const [expensesList, setExpensesList] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const today = new Date();
    const currentMonth = months[today.getMonth()] + " " + today.getFullYear();
    setFormData(prev => ({
      ...prev,
      month: currentMonth,
      date_spent: today.toISOString().split("T")[0],
    }));
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch (`http://localhost:5000/api/expenses/${user.user_id}`);
      const data = await res.json();
      setExpensesList(data);
    } catch {
      setMessage("⚠ Could not fetch expenses. Try again later.");
    }
  };

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const payload = { ...formData, user_id: user?.user_id };
    const url = editingId
      ? `http://localhost:5000/api/expenses/${editingId}`
      : "http://localhost:5000/api/expenses";
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
        fetchExpenses();
        setFormData(prev => ({
          ...prev,
          category: "",
          amount: "",
          payment_method: "",
          notes: "",
        }));
        setEditingId(null);
      }
    } catch {
      setMessage("⚠ Server not responding. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = exp => {
    setFormData({
      user_id: exp.user_id,
      month: exp.month,
      category: exp.category,
      amount: exp.amount,
      date_spent: exp.date_spent,
      payment_method: exp.payment_method,
      notes: exp.notes || "",
    });
    setEditingId(exp.expense_id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async id => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/expenses/${id}`, { method: "DELETE" });
      const result = await res.json();
      setMessage(result.message || "Deleted");
      fetchExpenses();
    } catch {
      setMessage("⚠ Server not responding. Try again later.");
    }
  };

  return (
    <div className="expense-modern-container">
      <button className="btn back-btn mb-3" onClick={() => navigate("/dashboard")}>
        ⬅ Back
      </button>
      <div className="expense-modern-row">
        <div className="expense-modern-col form-col">
          <div className="expense-modern-card">
            <h2 className="text-center mb-4">
              {editingId ? "✏ Edit Expense" : "💸 Add New Expense"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-2">
                <label>Month</label>
                <select name="month" value={formData.month} onChange={handleChange} className="form-control" required>
                  {months.map((m, i) => (
                    <option key={i} value={`${m} ${new Date().getFullYear()}`}>
                      {m} {new Date().getFullYear()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group mb-2">
                <label>Amount (Rs.)</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="form-control" placeholder="Enter amount" required/>
              </div>
              <div className="form-group mb-2">
                <label>Category</label>
                <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Food, Transport, Bills..." className="form-control" required/>
              </div>
              <div className="form-group mb-2">
                <label>Payment Method</label>
                <select name="payment_method" value={formData.payment_method} onChange={handleChange} className="form-control" required>
                  <option value="">Select Method</option>
                  {paymentMethods.map((m,i)=><option key={i} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group mb-2">
                <label>Date Spent</label>
                <input type="date" name="date_spent" value={formData.date_spent} onChange={handleChange} className="form-control" required/>
              </div>
              <div className="form-group mb-2">
                <label>Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} className="form-control" placeholder="Optional note"/>
              </div>
              <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
                {loading ? "Saving..." : editingId ? "Update Expense" : "Add Expense"}
              </button>
              {message && <p className="alert alert-info mt-3 text-center">{message}</p>}
            </form>
          </div>
        </div>

        <div className="expense-modern-col table-col">
          <h3>Your Expenses</h3>
          <div className="table-responsive">
            <table className="table table-hover table-modern">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Payment Method</th>
                  <th>Date</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expensesList.length===0 ? (
                  <tr><td colSpan="7" className="text-center text-muted">No expenses added yet</td></tr>
                ) : (
                  expensesList.map(exp => (
                    <tr key={exp.expense_id}>
                      <td>{exp.month}</td>
                      <td>Rs. {exp.amount}</td>
                      <td>{exp.category}</td>
                      <td>{exp.payment_method}</td>
                      <td>{exp.date_spent}</td>
                      <td>{exp.notes || "-"}</td>
                      <td>
                        <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(exp)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(exp.expense_id)}>Delete</button>
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