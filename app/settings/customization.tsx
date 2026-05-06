"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getVisibleActions,
  updateVisibleActions,
  getPreferencesForUI,
  updatePreferences,
  getTemplatesForType,
  createTemplate,
  deleteTemplate,
  getWorkflowForType,
  createWorkflow,
} from "@/lib/assistantActions";
import type { SavedOutput, OutputAction } from "@/lib/assistantTypes";

const OUTPUT_TYPES: Array<SavedOutput["type"]> = ["quote", "materials", "email", "task", "note"];

const ALL_ACTIONS: OutputAction[] = [
  "copy",
  "download",
  "email",
  "send",
  "print",
  "share",
  "duplicate",
  "export_pdf",
  "delete",
  "complete",
  "mark_sent",
  "edit_status",
  "add_notes",
];

const ACTION_LABELS: Record<OutputAction, string> = {
  copy: "Copy to Clipboard",
  download: "Download",
  email: "Email",
  send: "Send",
  print: "Print",
  share: "Share",
  duplicate: "Duplicate",
  export_pdf: "Export as PDF",
  delete: "Delete",
  complete: "Mark Complete",
  mark_sent: "Mark as Sent",
  edit_status: "Edit Status",
  add_notes: "Add Notes",
};

export default function CustomizationPage() {
  const [activeTab, setActiveTab] = useState<"actions" | "preferences" | "templates" | "workflows">("actions");
  const [selectedType, setSelectedType] = useState<SavedOutput["type"]>("quote");
  const [visibleActions, setVisibleActions] = useState<Record<SavedOutput["type"], OutputAction[]>>({
    quote: [],
    materials: [],
    email: [],
    task: [],
    note: [],
  });
  const [preferences, setPreferencesState] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    // Load all action visibilities
    const actions: any = {};
    OUTPUT_TYPES.forEach((type) => {
      actions[type] = getVisibleActions(type);
    });
    setVisibleActions(actions);

    // Load preferences
    setPreferencesState(getPreferencesForUI());
  }, []);

  const handleActionToggle = (action: OutputAction) => {
    const current = visibleActions[selectedType];
    const updated = current.includes(action)
      ? current.filter((a) => a !== action)
      : [...current, action];
    
    setVisibleActions({
      ...visibleActions,
      [selectedType]: updated,
    });

    updateVisibleActions(selectedType, updated);
    setSaveMessage("✓ Updated");
    setTimeout(() => setSaveMessage(""), 2000);
  };

  const handlePreferenceChange = (key: string, value: any) => {
    const updated = { ...preferences, [key]: value };
    setPreferencesState(updated);
    updatePreferences(updated);
    setSaveMessage("✓ Saved");
    setTimeout(() => setSaveMessage(""), 2000);
  };

  return (
    <main className="page">
      <div className="stack">
        <Link className="back" href="/dashboard">
          ← Dashboard
        </Link>

        <section className="card">
          <h1>Customization Settings</h1>
          <p style={{ color: "#666", marginTop: "0.5rem" }}>
            Customize actions, display preferences, templates, and workflows
          </p>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginTop: "1.5rem",
              borderBottom: "2px solid #e5e7eb",
              paddingBottom: "1rem",
            }}
          >
            {[
              { id: "actions", label: "🎬 Actions" },
              { id: "preferences", label: "⚙️ Preferences" },
              { id: "templates", label: "📋 Templates" },
              { id: "workflows", label: "🔄 Workflows" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: activeTab === tab.id ? "#2563eb" : "transparent",
                  color: activeTab === tab.id ? "white" : "#6b7280",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: activeTab === tab.id ? "600" : "500",
                  transition: "all 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {saveMessage && (
            <div
              style={{
                marginTop: "1rem",
                padding: "0.75rem 1rem",
                background: "#d1fae5",
                color: "#065f46",
                borderRadius: "6px",
                fontSize: "0.9rem",
              }}
            >
              {saveMessage}
            </div>
          )}
        </section>

        {/* Actions Tab */}
        {activeTab === "actions" && (
          <section className="card">
            <h2 style={{ marginTop: 0 }}>Customize Actions by Output Type</h2>

            {/* Type Selector */}
            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: "600", marginBottom: "0.5rem" }}>
                Select Output Type:
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {OUTPUT_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    style={{
                      padding: "0.5rem 1rem",
                      background: selectedType === type ? "#0c4a6e" : "#e0f2fe",
                      color: selectedType === type ? "white" : "#0c4a6e",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: selectedType === type ? "600" : "500",
                    }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions Checkboxes */}
            <div style={{ display: "grid", gap: "0.75rem" }}>
              <p style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: "600", marginBottom: "0.5rem" }}>
                Available Actions for {selectedType}:
              </p>
              {ALL_ACTIONS.map((action) => (
                <label
                  key={action}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem",
                    background: "#f9fafb",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={visibleActions[selectedType]?.includes(action) || false}
                    onChange={() => handleActionToggle(action)}
                    style={{ cursor: "pointer", width: "18px", height: "18px" }}
                  />
                  <span style={{ fontWeight: "500", color: "#111827" }}>
                    {ACTION_LABELS[action]}
                  </span>
                </label>
              ))}
            </div>
          </section>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && preferences && (
          <section className="card">
            <h2 style={{ marginTop: 0 }}>Display Preferences</h2>

            <div style={{ display: "grid", gap: "1.5rem", maxWidth: "500px" }}>
              {/* Theme */}
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                  Theme
                </label>
                <select
                  value={preferences.theme}
                  onChange={(e) => handlePreferenceChange("theme", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "1rem",
                  }}
                >
                  <option value="auto">Auto (System)</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              {/* Font Size */}
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                  Font Size
                </label>
                <select
                  value={preferences.fontSize}
                  onChange={(e) => handlePreferenceChange("fontSize", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "1rem",
                  }}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              {/* Compact Mode */}
              <label style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <input
                  type="checkbox"
                  checked={preferences.compactMode}
                  onChange={(e) => handlePreferenceChange("compactMode", e.target.checked)}
                  style={{ cursor: "pointer", width: "18px", height: "18px" }}
                />
                <span style={{ fontWeight: "500" }}>Compact Mode</span>
              </label>

              {/* Show Metadata */}
              <label style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <input
                  type="checkbox"
                  checked={preferences.showMetadata}
                  onChange={(e) => handlePreferenceChange("showMetadata", e.target.checked)}
                  style={{ cursor: "pointer", width: "18px", height: "18px" }}
                />
                <span style={{ fontWeight: "500" }}>Show Metadata (dates, status, etc.)</span>
              </label>

              {/* Default Sort */}
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                  Default Sort Order
                </label>
                <select
                  value={preferences.defaultSort}
                  onChange={(e) => handlePreferenceChange("defaultSort", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "1rem",
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>
            </div>
          </section>
        )}

        {/* Templates Tab */}
        {activeTab === "templates" && (
          <section className="card">
            <h2 style={{ marginTop: 0 }}>Custom Templates</h2>
            <p style={{ color: "#666", marginTop: "0.5rem" }}>
              Create templates with placeholder variables to quickly generate standardized outputs
            </p>

            <div style={{ marginTop: "2rem", padding: "1.5rem", background: "#f9fafb", borderRadius: "8px" }}>
              <p style={{ color: "#9ca3af", textAlign: "center" }}>
                ℹ️ Template management coming soon
              </p>
            </div>
          </section>
        )}

        {/* Workflows Tab */}
        {activeTab === "workflows" && (
          <section className="card">
            <h2 style={{ marginTop: 0 }}>Custom Workflows</h2>
            <p style={{ color: "#666", marginTop: "0.5rem" }}>
              Define custom status flows for quotes, materials, emails, and tasks
            </p>

            <div style={{ marginTop: "2rem", padding: "1.5rem", background: "#f9fafb", borderRadius: "8px" }}>
              <p style={{ color: "#9ca3af", textAlign: "center" }}>
                ℹ️ Workflow management coming soon
              </p>
            </div>
          </section>
        )}
      </div>

      <style jsx>{`
        .page {
          max-width: 900px;
          margin: 0 auto;
        }

        .stack {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .back {
          color: #6b7280;
          text-decoration: none;
          font-weight: 500;
        }

        .back:hover {
          color: #111827;
        }

        h1 {
          margin: 0;
          font-size: 1.875rem;
        }

        h2 {
          margin: 0 0 1rem 0;
          font-size: 1.25rem;
        }
      `}</style>
    </main>
  );
}
