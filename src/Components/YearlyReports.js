import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Reports.css"; 

export default function YearlyReport() {
  const navigate = useNavigate(); 
  const [selectedYear, setSelectedYear] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || { user_id: 1 };

  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const fetchYearlyReport = async () => {
    if (!selectedYear) {
      alert("Please select a year!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/yearly-report/${user.user_id}/${selectedYear}`
      );
      if (!response.ok) throw new Error("Failed to fetch yearly report");
      const data = await response.json();
      setReport(data);
    } catch (error) {
      alert("⚠️ Unable to fetch yearly report. Ensure backend is running.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const input = document.getElementById("yearly-report-content");
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Yearly_Report_${selectedYear}.pdf`);
    });
  };

  return (
    <div className="report-container text-center mt-5">
      {/* ✅ Back Button */}
      <button
        className="btn btn-secondary mb-3"
        onClick={() => navigate("/dashboard")}
      >
        ⬅ Back
      </button>

      <h2 className="mb-4 text-gradient">📅 Yearly Financial Report</h2>

      <div className="controls mb-3 d-flex justify-content-center align-items-center gap-2 flex-wrap">
        {/* ✅ Dropdown for year selection */}
        <select
          className="form-select year-input"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">-- Select Year --</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <button className="btn btn-primary" onClick={fetchYearlyReport}>
          View Report
        </button>

        {report && (
          <button className="btn btn-success" onClick={downloadPDF}>
            🖨️ Download PDF
          </button>
        )}
      </div>

      {loading && <p className="text-muted">Loading yearly report...</p>}

      {report && (
        <div
          id="yearly-report-content"
          className="card report-card mt-4 p-4 shadow-lg"
        >
          <h4 className="text-primary mb-3">Report for {report.year}</h4>

          <div className="report-summary">
            <div className="summary-item income">
              💰 <b>Total Income:</b> Rs. {report.total_income}
            </div>
            <div className="summary-item expenses">
              🧾 <b>Total Expenses:</b> Rs. {report.total_expenses}
            </div>
            <div className="summary-item savings">
              🏦 <b>Total Savings:</b> Rs. {report.total_savings}
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
