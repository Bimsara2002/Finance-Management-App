import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AddIncome.css";

export default function AddIncome() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const incomeSources = [
    "Salary", "Freelance", "Business", "Interest",
    "Investment", "Rental", "Gift", "Other"
  ];

  const [formData, setFormData] = useState({
    user_id: user?.user_id || "",
    month: "",
    source: "",
    amount: "",
    date_received: "",
    notes: "",
  });

  const [incomeList, setIncomeList] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const today = new Date();
    setFormData((prev) => ({
      ...prev,
      month: months[today.getMonth()] + " " + today.getFullYear(),
      date_received: today.toISOString().split("T")[0],
    }));
    fetchIncomeList();
  }, []);

  
  const fetchIncomeList = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/income/${user.user_id}`);
      const data = await res.json();

      // Avoid duplicate income entries
      const uniqueIncome = [];
      const seenIds = new Set();
      (data || []).forEach((item) => {
        if (!seenIds.has(item.income_id)) {
          uniqueIncome.push(item);
          seenIds.add(item.income_id);
        }
      });

      setIncomeList(uniqueIncome);
    } catch (err) {
      console.error("Failed to fetch income:", err);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // 🔹 Add or Update income
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    
    const payload = {
      ...formData,
      user_id: user?.user_id,
    };

    const url = editingId
      ? `http://localhost:5000/api/income/${editingId}`
      : "http://localhost:5000/api/income";

    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage(result.message);
        fetchIncomeList();
        setFormData((prev) => ({
          ...prev,
          source: "",
          amount: "",
          notes: "",
        }));
        setEditingId(null);
      } else {
        setMessage(result.message || "❌ Failed to save income");
      }
    } catch (error) {
      console.error("Error saving income:", error);
      setMessage("⚠️ Server not responding. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Edit selected income
  const handleEdit = (income) => {
    setFormData({
      user_id: user?.user_id,
      month: income.month,
      source: income.source,
      amount: income.amount,
      date_received: income.date_received,
      notes: income.notes,
    });
    setEditingId(income.income_id);
  };

  // 🔹 Delete selected income
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this income record?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/income/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (res.ok) {
        setMessage(result.message);
        fetchIncomeList();
      } else {
        setMessage(result.message || "❌ Failed to delete income");
      }
    } catch {
      setMessage("⚠️ Server not responding. Try again later.");
    }
  };

  return (
    <div className="container my-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate("/dashboard")}>
        ⬅ Back
      </button>
      <div className="row">
        {/* Add/Edit Income Form */}
        <div className="col-md-5">
          <div className="card shadow p-3 mb-4">
            <h3 className="text-center mb-3">
              {editingId ? "✏️ Edit Income" : "➕ Add Income"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-2">
                <label>Month</label>
                <select
                  name="month"
                  className="form-control"
                  value={formData.month}
                  onChange={handleChange}
                  required
                >
                  {months.map((m, idx) => (
                    <option key={idx} value={`${m} ${new Date().getFullYear()}`}>
                      {m} {new Date().getFullYear()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group mb-2">
                <label>Source</label>
                <select
                  name="source"
                  className="form-control"
                  value={formData.source}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Source</option>
                  {incomeSources.map((s, idx) => (
                    <option key={idx} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group mb-2">
                <label>Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Rs."
                  required
                />
              </div>

              <div className="form-group mb-2">
                <label>Date Received</label>
                <input
                  type="date"
                  name="date_received"
                  value={formData.date_received}
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
                />
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Saving..." : editingId ? "Update Income" : "Add Income"}
              </button>

              {message && <p className="alert alert-info mt-3 text-center">{message}</p>}
            </form>
          </div>
        </div>

        {/* Income Table */}
        <div className="col-md-7">
          <h3>Your Incomes</h3>
          <div className="table-responsive">
            <table className="table table-hover table-striped shadow-sm">
              <thead className="thead-dark">
                <tr>
                  <th>Month</th>
                  <th>Source</th>
                  <th>Amount</th>
                  <th>Date Received</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomeList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No income added yet
                    </td>
                  </tr>
                ) : (
                  incomeList.map((i) => (
                    <tr key={i.income_id}>
                      <td>{i.month}</td>
                      <td>{i.source}</td>
                      <td>Rs. {i.amount}</td>
                      <td>{i.date_received}</td>
                      <td>{i.notes || "-"}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(i)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(i.income_id)}
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
