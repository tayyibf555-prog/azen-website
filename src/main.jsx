// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AzenHomePage from "./AzenHomePage.jsx";
import AzenHomePagePremium from "./AzenHomePagePremium.jsx";
import Receptionist from "./pages/solutions/Receptionist.jsx";
import Automation from "./pages/solutions/Automation.jsx";
import Audit from "./pages/solutions/Audit.jsx";
import ReferralsPage from "./pages/Referrals.jsx";
import CaseStudiesPage from "./pages/CaseStudies.jsx";
import CaseStudyDetail from "./pages/CaseStudyDetail.jsx";
import "./index.css";

function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-blue-900 text-white px-8 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-semibold">Contact</h1>
        <p className="mt-4 text-white/70">
          Call us on <strong>+44 7514 763746</strong> or send the form (coming soon).
        </p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<AzenHomePage />} />
        <Route path="/premium" element={<AzenHomePagePremium />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/solutions/receptionist" element={<Receptionist />} />
        <Route path="/solutions/automation" element={<Automation />} />
        <Route path="/solutions/audit" element={<Audit />} />
        <Route path="/referrals" element={<ReferralsPage />} />
        <Route path="/cases" element={<CaseStudiesPage />} />
        <Route path="/cases/:slug" element={<CaseStudyDetail />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
