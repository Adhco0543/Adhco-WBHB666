"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProfile, saveProfile } from "@/lib/assistantActions";
import type { OnboardingProfile } from "@/lib/assistantTypes";

export default function AssistantSettingsPage() {
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<OnboardingProfile | null>(null);
  const [feedback, setFeedback] = useState("");
  const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loaded = getProfile();
    setProfile(loaded);
    setEditedProfile(loaded);
  }, []);

  const handleFieldChange = (field: keyof OnboardingProfile, value: any) => {
    if (!editedProfile) return;

    const updated = { ...editedProfile, [field]: value };
    setEditedProfile(updated);

    // Auto-save after 1 second of inactivity
    if (saveTimer) clearTimeout(saveTimer);
    setSaveTimer(
      setTimeout(() => {
        saveProfile(updated);
        setFeedback("✅ Saved");
        setTimeout(() => setFeedback(""), 2000);
      }, 1000)
    );
  };

  const handleArrayFieldChange = (field: keyof OnboardingProfile, index: number, value: string) => {
    if (!editedProfile) return;

    const arr = (editedProfile[field] as string[]) || [];
    const updated = [...arr];
    updated[index] = value;

    handleFieldChange(field, updated);
  };

  const handleAddArrayItem = (field: keyof OnboardingProfile) => {
    if (!editedProfile) return;

    const arr = (editedProfile[field] as string[]) || [];
    handleFieldChange(field, [...arr, ""]);
  };

  const handleRemoveArrayItem = (field: keyof OnboardingProfile, index: number) => {
    if (!editedProfile) return;

    const arr = (editedProfile[field] as string[]) || [];
    const updated = arr.filter((_, i) => i !== index);
    handleFieldChange(field, updated);
  };

  if (!profile || !editedProfile) {
    return (
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem" }}>
        <Link href="/dashboard">← Dashboard</Link>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <Link href="/dashboard" style={{ color: "#6b7280", textDecoration: "none", fontWeight: "500" }}>
          ← Dashboard
        </Link>
        <h1 style={{ margin: 0, fontSize: "1.875rem" }}>🤖 Assistant Settings</h1>
        <div />
      </div>

      {feedback && (
        <div style={{ padding: "0.75rem 1rem", background: "#d1fae5", color: "#065f46", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.9rem" }}>
          {feedback}
        </div>
      )}

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        {isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(false)}
              style={{
                padding: "0.5rem 1rem",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Done Editing
            </button>
            <button
              onClick={() => {
                setEditedProfile(profile);
                setIsEditing(false);
              }}
              style={{
                padding: "0.5rem 1rem",
                background: "#e5e7eb",
                color: "#374151",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Discard Changes
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: "0.5rem 1rem",
              background: "#6366f1",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            ✏️ Edit Settings
          </button>
        )}
      </div>

      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.5rem" }}>
        {/* Business Info */}
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem", borderBottom: "2px solid #e5e7eb", paddingBottom: "0.5rem" }}>
            💼 Business Information
          </h2>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#374151" }}>
              Business Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.businessName || ""}
                onChange={(e) => handleFieldChange("businessName", e.target.value)}
                style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "1rem" }}
              />
            ) : (
              <p style={{ margin: 0, color: "#6b7280" }}>{profile.businessName || "-"}</p>
            )}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#374151" }}>
              Your Role
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.role || ""}
                onChange={(e) => handleFieldChange("role", e.target.value)}
                style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "1rem" }}
              />
            ) : (
              <p style={{ margin: 0, color: "#6b7280" }}>{profile.role || "-"}</p>
            )}
          </div>
        </section>

        {/* Industry Focus */}
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem", borderBottom: "2px solid #e5e7eb", paddingBottom: "0.5rem" }}>
            🎯 Industry Focus
          </h2>

          {isEditing ? (
            <div>
              {(editedProfile.industryFocus || []).map((focus, idx) => (
                <div key={idx} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <input
                    type="text"
                    value={focus}
                    onChange={(e) => handleArrayFieldChange("industryFocus", idx, e.target.value)}
                    style={{ flex: 1, padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px" }}
                  />
                  <button
                    onClick={() => handleRemoveArrayItem("industryFocus", idx)}
                    style={{
                      padding: "0.5rem 0.75rem",
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleAddArrayItem("industryFocus")}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#e5e7eb",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginTop: "0.5rem",
                }}
              >
                + Add Focus Area
              </button>
            </div>
          ) : (
            <p style={{ margin: 0, color: "#6b7280" }}>
              {(profile.industryFocus && profile.industryFocus.length > 0) ? profile.industryFocus.join(", ") : "-"}
            </p>
          )}
        </section>

        {/* Assistant Preferences */}
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem", borderBottom: "2px solid #e5e7eb", paddingBottom: "0.5rem" }}>
            ⚙️ Assistant Preferences
          </h2>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#374151" }}>
              Response Style
            </label>
            {isEditing ? (
              <select
                value={editedProfile.responseStyle || "professional"}
                onChange={(e) => handleFieldChange("responseStyle", e.target.value)}
                style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "1rem" }}
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="brief">Brief & Direct</option>
              </select>
            ) : (
              <p style={{ margin: 0, color: "#6b7280", textTransform: "capitalize" }}>{profile.responseStyle || "professional"}</p>
            )}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#374151" }}>
              Default Language
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.defaultLanguage || "English"}
                onChange={(e) => handleFieldChange("defaultLanguage", e.target.value)}
                style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "1rem" }}
              />
            ) : (
              <p style={{ margin: 0, color: "#6b7280" }}>{profile.defaultLanguage || "English"}</p>
            )}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "flex", alignItems: "center", fontSize: "0.875rem", fontWeight: "600", color: "#374151", cursor: isEditing ? "pointer" : "default" }}>
              <input
                type="checkbox"
                checked={editedProfile.enableVoiceInput || false}
                onChange={(e) => handleFieldChange("enableVoiceInput", e.target.checked)}
                disabled={!isEditing}
                style={{ marginRight: "0.5rem", cursor: "pointer" }}
              />
              Enable Voice Input
            </label>
          </div>
        </section>

        {/* Key Services */}
        <section>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem", borderBottom: "2px solid #e5e7eb", paddingBottom: "0.5rem" }}>
            📋 Key Services/Products
          </h2>

          {isEditing ? (
            <div>
              {(editedProfile.keyServices || []).map((service, idx) => (
                <div key={idx} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <input
                    type="text"
                    value={service}
                    onChange={(e) => handleArrayFieldChange("keyServices", idx, e.target.value)}
                    placeholder="e.g., Web Design, Consulting"
                    style={{ flex: 1, padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px" }}
                  />
                  <button
                    onClick={() => handleRemoveArrayItem("keyServices", idx)}
                    style={{
                      padding: "0.5rem 0.75rem",
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleAddArrayItem("keyServices")}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#e5e7eb",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginTop: "0.5rem",
                }}
              >
                + Add Service
              </button>
            </div>
          ) : (
            <p style={{ margin: 0, color: "#6b7280" }}>
              {(profile.keyServices && profile.keyServices.length > 0) ? profile.keyServices.join(", ") : "-"}
            </p>
          )}
        </section>
      </div>

      <style jsx>{`
        main {
          min-height: 100vh;
          background: #ffffff;
        }
      `}</style>
    </main>
  );
}
