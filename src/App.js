import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Register from "./Components/Register";
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import AddIncome from "./Components/AddIncome";
import AddSaving from "./Components/AddSavings";
import AddExpenses from "./Components/AddExpenses";
import Budget from "./Components/Budgect";
import FinanceGoals from "./Components/FinanceGoals";
import AdvancedReport from "./Components/Reports";     
import ViewYearlyReports from "./Components/YearlyReports"; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Authentication */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Main app pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/income" element={<AddIncome />} />
        <Route path="/savings" element={<AddSaving />} />
        <Route path="/expenses" element={<AddExpenses />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/goals" element={<FinanceGoals />} />

        {/* Reports */}
        <Route path="/reports" element={<AdvancedReport />} />        {/* Monthly + Yearly Tabs */}
        <Route path="/yearlyreports" element={<ViewYearlyReports />} /> {/* Direct yearly page */}
      </Routes>
    </Router>
  );
}

export default App;
