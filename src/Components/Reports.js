import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Reports.css"; 

export default function MonthlyReport() {
  const navigate = useNavigate(); 
  const [selectedMonth, setSelectedMonth] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || { user_id: 1 };
  const currentYear = new Date().getFullYear();

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const fetchReport = async () => {
    if (!selectedMonth) {
      alert("Please select a month!");
      return;
    }

    const yearMonth = `${currentYear}-${selectedMonth}`;

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/reports/${user.user_id}/${yearMonth}`
      );
      if (!response.ok) throw new Error("Failed to fetch report");

      const data = await response.json();
      setReport(data);
    } catch (error) {
      alert(
        "⚠️ Unable to fetch report. Please make sure the backend is running on port 5000."
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const input = document.getElementById("report-content");

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Financial_Report_${currentYear}-${selectedMonth}.pdf`);
    });
  };

  return (
    <div className="report-container text-center mt-5">
      <button
        className="btn btn-secondary mb-3"
        onClick={() => navigate("/dashboard")}
      >
        ⬅ Back
      </button>

      <h2 className="mb-4 text-gradient">📊 Monthly Financial Report</h2>

      <div className="controls mb-3 d-flex justify-content-center">
        <select
          className="form-select mx-1"
          value={selectedMonth}
          onChange={handleMonthChange}
        >
          <option value="">Select Month</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <button className="btn btn-primary mx-2" onClick={fetchReport}>
          View Report
        </button>

        {report && (
          <button className="btn btn-success" onClick={downloadPDF}>
            🖨️ Download PDF
          </button>
        )}
      </div>

      {loading && <p className="text-muted">Loading report...</p>}

      {report && (
        <div
          id="report-content"
          className="card report-card mt-4 p-4 shadow-lg"
        >
          <h4 className="text-primary mb-3">
            Report for {months.find((m) => m.value === selectedMonth)?.label} {currentYear}
          </h4>

          <div className="report-summary">
            <div className="summary-item income">
              💰 <b>Income:</b> Rs. {report.total_income}
            </div>
            <div className="summary-item expenses">
              🧾 <b>Expenses:</b> Rs. {report.total_expenses}
            </div>
            <div className="summary-item savings">
              🏦 <b>Savings:</b> Rs. {report.total_savings}
            </div>
            <div className="summary-item balance">
              📈 <b>Balance:</b> Rs. {report.balance}
            </div>
          </div>

          <hr />
          <p className="text-muted small">
            Generated on {new Date().toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
