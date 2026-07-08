"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  getOutput,
  editOutput,
  handleCopyAction,
  handleCompleteAction,
  handleDeleteAction,
  getVisibleActions,
  getAvailableStatuses,
  handleEditStatusAction,
} from "@/lib/assistantActions";
import type { SavedOutput, OutputAction } from "@/lib/assistantTypes";

const TYPE_ICONS: Record<string, string> = {
  quote: "💰",
  materials: "📦",
  email: "📧",
  task: "✅",
  note: "📝",
};

const TYPE_LABELS: Record<string, string> = {
  quote: "Quote",
  materials: "Materials List",
  email: "Email Draft",
  task: "Task",
  note: "Note",
};

const ACTION_LABELS: Record<OutputAction, string> = {
  copy: "📋 Copy",
  download: "💾 Download",
  email: "📧 Email",
  send: "📤 Send",
  print: "🖨️ Print",
  share: "🔗 Share",
  duplicate: "📑 Duplicate",
  export_pdf: "📄 PDF",
  delete: "🗑️ Delete",
  complete: "✅ Complete",
  mark_sent: "📨 Sent",
  edit_status: "🔄 Status",
  add_notes: "📝 Notes",
};

export default function OutputDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [output, setOutput] = useState<SavedOutput | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    const loaded = getOutput(id);
    if (loaded) {
      setOutput(loaded);
      setEditedTitle(loaded.title);
      setEditedContent(loaded.content);
      setNewStatus(loaded.status || "draft");
      setAvailableStatuses(getAvailableStatuses(loaded.type));
    }
  }, [id]);

  if (!output) {
    return (
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem", minHeight: "100vh" }}>
        <Link href="/outputs" style={{ color: "#6b7280", textDecoration: "none", fontWeight: "500" }}>
          ← Outputs
        </Link>
        <div style={{ textAlign: "center", marginTop: "3rem", color: "#9ca3af" }}>
          <p>Output not found</p>
        </div>
      </main>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    editOutput(id, {
      title: editedTitle,
      content: editedContent,
    });
    setOutput({ ...output, title: editedTitle, content: editedContent });
    setIsEditing(false);
    setIsSaving(false);
    setFeedback("✅ Saved");
    setTimeout(() => setFeedback(""), 2000);
  };

  const executeAction = (action: OutputAction) => {
    switch (action) {
      case "copy":
        handleCopyAction(id);
        setFeedback("✅ Copied to clipboard");
        break;
      case "delete":
        if (window.confirm("Delete this output?")) {
          handleDeleteAction(id);
          setFeedback("✅ Deleted");
          setTimeout(() => router.push("/outputs"), 1500);
        }
        break;
      case "complete":
        handleCompleteAction(id);
        setOutput({ ...output, status: "completed" });
        setNewStatus("completed");
        setFeedback("✅ Marked complete");
        break;
      case "mark_sent":
        setOutput({ ...output, status: "sent" });
        setNewStatus("sent");
        handleEditStatusAction(id, "sent");
        setFeedback("✅ Marked as sent");
        break;
      default:
        setFeedback("Action executed");
    }
    setTimeout(() => setFeedback(""), 2000);
  };

  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem", minHeight: "100vh" }}>
      <Link href="/outputs" style={{ color: "#6b7280", textDecoration: "none", fontWeight: "500" }}>
        ← Outputs
      </Link>

      {feedback && (
        <div
          style={{
            padding: "0.75rem 1rem",
            background: "#d1fae5",
            color: "#065f46",
            borderRadius: "6px",
            marginTop: "1rem",
            fontSize: "0.9rem",
          }}
        >
          {feedback}
        </div>
      )}

      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.5rem", marginTop: "1.5rem" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1.5rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1.5rem" }}>{TYPE_ICONS[output.type]}</span>
              <h1 style={{ margin: 0, fontSize: "1.5rem" }}>{TYPE_LABELS[output.type]}</h1>
            </div>
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.85rem", color: "#9ca3af" }}>
              Created {new Date(output.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <span
            style={{
              padding: "0.5rem 1rem",
              background: output.status === "sent" ? "#d1fae5" : output.status === "completed" ? "#c7d2fe" : "#fef3c7",
              color: output.status === "sent" ? "#065f46" : output.status === "completed" ? "#312e81" : "#92400e",
              borderRadius: "999px",
              fontSize: "0.85rem",
              fontWeight: "600",
              whiteSpace: "nowrap",
            }}
          >
            {output.status?.toUpperCase() || "DRAFT"}
          </span>
        </div>

        {/* Title & Content Edit */}
        {isEditing ? (
          <>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#374151" }}>
                Title
              </label>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "1rem",
                }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#374151" }}>
                Content
              </label>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: "300px",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedTitle(output.title);
                  setEditedContent(output.content);
                }}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "#e5e7eb",
                  color: "#374151",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                }}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.25rem", fontWeight: "600" }}>{output.title}</h2>

            <pre
              style={{
                background: "#f9fafb",
                padding: "1rem",
                borderRadius: "6px",
                overflow: "auto",
                fontSize: "0.9rem",
                lineHeight: "1.6",
                color: "#374151",
                border: "1px solid #e5e7eb",
              }}
            >
              {output.content}
            </pre>

            <button
              onClick={() => setIsEditing(true)}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                background: "#6366f1",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.9rem",
              }}
            >
              ✏️ Edit
            </button>
          </>
        )}

        {/* Status & Actions */}
        {!isEditing && (
          <>
            <hr style={{ margin: "1.5rem 0", border: "none", borderTop: "1px solid #e5e7eb" }} />

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#374151" }}>
                Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => {
                  const status = e.target.value;
                  setNewStatus(status);
                  handleEditStatusAction(id, status);
                  setOutput({ ...output, status: status as any });
                  setFeedback("✅ Status updated");
                  setTimeout(() => setFeedback(""), 2000);
                }}
                style={{
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                {availableStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                onClick={() => executeAction("copy")}
                style={{
                  padding: "0.75rem 1rem",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "0.9rem",
                  transition: "background 0.2s",
                }}
              >
                📋 Copy
              </button>
              <button
                onClick={() => executeAction("complete")}
                style={{
                  padding: "0.75rem 1rem",
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "0.9rem",
                  transition: "background 0.2s",
                }}
              >
                ✅ Complete
              </button>
              <button
                onClick={() => executeAction("mark_sent")}
                style={{
                  padding: "0.75rem 1rem",
                  background: "#7c3aed",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "0.9rem",
                  transition: "background 0.2s",
                }}
              >
                📨 Mark Sent
              </button>
              <button
                onClick={() => executeAction("delete")}
                style={{
                  padding: "0.75rem 1rem",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "0.9rem",
                  transition: "background 0.2s",
                }}
              >
                🗑️ Delete
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        main {
          background: #ffffff;
        }

        @media (prefers-color-scheme: dark) {
          main {
            background: #111827;
          }
        }
      `}</style>
    </main>
  );
}
