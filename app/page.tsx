"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [showDashboard, setShowDashboard] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Load preference from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const hidden = localStorage.getItem("hide_dashboard_link");
    if (hidden === "true") {
      setShowDashboard(false);
    }
  }, []);

  const handleHideDashboard = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDashboard(false);
    localStorage.setItem("hide_dashboard_link", "true");
  };

  const handleShowDashboard = () => {
    setShowDashboard(true);
    localStorage.setItem("hide_dashboard_link", "false");
  };

  if (!mounted) return null;

  return (
    <main className="page">
      <div className="card">
        <p className="eyebrow">Business AI Assistant</p>

        <h1>Build your AI-powered business workspace</h1>

        <p>
          Configure your workspace in minutes. Answer a few questions and get a
          tailored dashboard for how your business works.
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link className="button" href="/onboarding">
            Start onboarding
          </Link>

          {showDashboard && (
            <div style={{ position: "relative", display: "inline-block" }}>
              <Link className="button ghost" href="/dashboard">
                Go to dashboard
              </Link>
              <button
                onClick={handleHideDashboard}
                style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-error, #e74c3c)",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "bold",
                  padding: 0,
                }}
                title="Remove dashboard link"
              >
                ✕
              </button>
            </div>
          )}

          {!showDashboard && (
            <button
              onClick={handleShowDashboard}
              className="button ghost"
              style={{ cursor: "pointer" }}
            >
              Show dashboard link
            </button>
          )}
        </div>
      </div>
    </main>
  );
}