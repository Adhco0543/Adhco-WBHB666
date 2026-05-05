"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { SavedOutput } from "@/lib/assistantMemory";
import { getOutput, updateOutput, deleteOutput } from "@/lib/assistantMemory";

export default function DraftPage() {
  const params = useParams();
  const id = params?.id as string;

  const [draft, setDraft] = useState<SavedOutput | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");

  useEffect(() => {
    if (!id) return;

    const loaded = getOutput(id);
    if (loaded) {
      setDraft(loaded);
      setEditedContent(loaded.content);
      setEditedTitle(loaded.title);
    }
  }, [id]);

  if (!draft) {
    return (
      <main className="page">
        <div className="card">
          <Link className="back" href="/dashboard">
            ← Dashboard
          </Link>
          <h1 style={{ marginTop: "1rem" }}>Draft Not Found</h1>
          <p style={{ color: "#666", marginTop: "0.5rem" }}>
            This draft may have been deleted. Return to the dashboard to view your drafts.
          </p>
        </div>
      </main>
    );
  }

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateOutput(id, {
        title: editedTitle,
        content: editedContent
      });
      setDraft({
        ...draft,
        title: editedTitle,
        content: editedContent
      });
      setIsEditing(false);
      setIsSaving(false);
    }, 500);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedContent);
      setCopyFeedback("Copied to clipboard!");
      setTimeout(() => setCopyFeedback(""), 2000);
    } catch (err) {
      setCopyFeedback("Failed to copy");
      setTimeout(() => setCopyFeedback(""), 2000);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this draft?")) {
      deleteOutput(id);
      window.location.href = "/dashboard";
    }
  };

  const handleCancel = () => {
    setEditedContent(draft.content);
    setEditedTitle(draft.title);
    setIsEditing(false);
  };

  const typeLabel = draft.type
    .replace("_", " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const createdDate = new Date(draft.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <main className="page">
      <div className="stack">
        <Link className="back" href="/dashboard">
          ← Dashboard
        </Link>

        <section className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p className="eyebrow">{typeLabel}</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  style={{
                    fontSize: "1.875rem",
                    fontWeight: "600",
                    border: "2px solid #2563eb",
                    borderRadius: "6px",
                    padding: "0.5rem",
                    width: "100%",
                    maxWidth: "500px"
                  }}
                />
              ) : (
                <h1>{draft.title}</h1>
              )}
              <p style={{ fontSize: "0.9rem", color: "#999", marginTop: "0.5rem" }}>
                Created: {createdDate}
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "500"
                    }}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancel}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "#e5e7eb",
                      color: "#374151",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "500"
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCopy}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "500"
                    }}
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "#6366f1",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "500"
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "500"
                    }}
                  >
                    🗑️ Delete
                  </button>
                </>
              )}
            </div>
          </div>

          {copyFeedback && (
            <div
              style={{
                marginTop: "1rem",
                padding: "0.75rem 1rem",
                background: copyFeedback.includes("success") ? "#d1fae5" : "#fecaca",
                color: copyFeedback.includes("success") ? "#065f46" : "#991b1b",
                borderRadius: "6px",
                fontSize: "0.9rem"
              }}
            >
              {copyFeedback}
            </div>
          )}
        </section>

        <section className="card">
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              style={{
                width: "100%",
                minHeight: "400px",
                padding: "1rem",
                border: "2px solid #e5e7eb",
                borderRadius: "6px",
                fontFamily: "monospace",
                fontSize: "0.95rem",
                lineHeight: "1.6"
              }}
            />
          ) : (
            <div
              style={{
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
                fontFamily: "monospace",
                fontSize: "0.95rem",
                lineHeight: "1.6",
                color: "#374151",
                background: "#f9fafb",
                padding: "1rem",
                borderRadius: "6px"
              }}
            >
              {draft.content}
            </div>
          )}
        </section>

        {draft.status && (
          <section className="card">
            <p className="eyebrow">STATUS</p>
            <div
              style={{
                display: "inline-block",
                padding: "0.5rem 1rem",
                background: draft.status === "completed" ? "#d1fae5" : "#fef3c7",
                color: draft.status === "completed" ? "#065f46" : "#92400e",
                borderRadius: "6px",
                fontSize: "0.9rem",
                fontWeight: "500"
              }}
            >
              {draft.status.charAt(0).toUpperCase() + draft.status.slice(1)}
            </div>
          </section>
        )}

        <section className="card" style={{ background: "#f3f4f6" }}>
          <h3 style={{ margin: "0 0 1rem 0" }}>Quick Actions</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
            <button
              onClick={handleCopy}
              style={{
                padding: "1rem",
                background: "white",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
                transition: "all 0.2s"
              }}
            >
              📋 Copy Draft
            </button>
            <button
              onClick={() => {
                const mailtoLink = `mailto:?subject=${encodeURIComponent(draft.title)}&body=${encodeURIComponent(draft.content)}`;
                window.location.href = mailtoLink;
              }}
              style={{
                padding: "1rem",
                background: "white",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
                transition: "all 0.2s"
              }}
            >
              📧 Email Draft
            </button>
            <button
              onClick={() => {
                const element = document.createElement("a");
                element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(draft.content));
                element.setAttribute("download", `${draft.title.replace(/\s+/g, "-").toLowerCase()}.txt`);
                element.style.display = "none";
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
              style={{
                padding: "1rem",
                background: "white",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
                transition: "all 0.2s"
              }}
            >
              💾 Download
            </button>
            <Link
              href="/dashboard"
              style={{
                padding: "1rem",
                background: "white",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
                textAlign: "center",
                textDecoration: "none",
                color: "#111827",
                transition: "all 0.2s"
              }}
            >
              ← Back to Dashboard
            </Link>
          </div>
        </section>
      </div>

      <style jsx>{`
        .page {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 1rem;
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

        .eyebrow {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #9ca3af;
          margin: 0 0 0.5rem 0;
          text-transform: uppercase;
        }

        h1 {
          font-size: 1.875rem;
          margin: 0;
          line-height: 1.2;
        }

        h3 {
          font-size: 1.25rem;
          margin: 0 0 1rem 0;
        }

        .back {
          color: #6b7280;
          text-decoration: none;
          font-weight: 500;
          display: inline-block;
          transition: all 0.2s;
        }

        .back:hover {
          color: #111827;
        }
      `}</style>
    </main>
  );
}
