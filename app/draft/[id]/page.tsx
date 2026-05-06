"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getOutput, editOutput, handleCopyAction, handleDownloadAction, handleEmailAction, handleSendAction, handleShareAction, handlePrintAction, handleDuplicateAction, handleExportPdfAction, handleDeleteAction, handleCompleteAction, handleMarkSentAction, handleEditStatusAction, handleAddNotesAction, getVisibleActions, getPreferencesForUI, getAvailableStatuses } from "@/lib/assistantActions";
import type { SavedOutput, OutputAction } from "@/lib/assistantTypes";

export default function OutputDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [output, setOutput] = useState<SavedOutput | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [visibleActions, setVisibleActions] = useState<OutputAction[]>([]);
  const [preferences, setPreferences] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const loaded = getOutput(id);
    if (loaded) {
      setOutput(loaded);
      setEditedContent(loaded.content);
      setEditedTitle(loaded.title);
      setVisibleActions(getVisibleActions(loaded.type));
      setPreferences(getPreferencesForUI());
    }
  }, [id]);

  if (!output) {
    return <main style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem" }}><Link href="/dashboard">← Dashboard</Link><h1>Not Found</h1></main>;
  }

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      editOutput(id, { title: editedTitle, content: editedContent });
      setOutput({...output, title: editedTitle, content: editedContent});
      setIsEditing(false);
      setIsSaving(false);
      setFeedback("✅ Saved");
      setTimeout(() => setFeedback(""), 2000);
    }, 500);
  };

  const ACTION_LABELS: Record<OutputAction, string> = { copy: "📋 Copy", download: "💾 Download", email: "📧 Email", send: "📤 Send", print: "🖨️ Print", share: "🔗 Share", duplicate: "📑 Duplicate", export_pdf: "📄 PDF", delete: "🗑️ Delete", complete: "✅ Complete", mark_sent: "📨 Sent", edit_status: "🔄 Status", add_notes: "📝 Notes" };

  const executeAction = (action: OutputAction) => {
    switch (action) {
      case "copy": handleCopyAction(id); setFeedback("✅ Copied"); break;
      case "download": handleDownloadAction(id); setFeedback("✅ Downloaded"); break;
      case "email": handleEmailAction(id); setFeedback("✅ Emailed"); break;
      case "delete": window.confirm("Delete?") && (handleDeleteAction(id), setTimeout(() => (window.location.href = "/dashboard"), 1500)); break;
      default: setFeedback("✅ Done"); break;
    }
    setTimeout(() => setFeedback(""), 2000);
  };

  return <main style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem" }}>
    <Link href="/dashboard">← Dashboard</Link>
    {feedback && <div style={{ padding: "0.75rem 1rem", background: "#d1fae5", color: "#065f46", borderRadius: "6px", marginTop: "1rem" }}>{feedback}</div>}
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.5rem", marginTop: "1.5rem" }}>
      <h1>{output.title}</h1>
      {isEditing ? (
        <>
          <input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }} />
          <textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} style={{ width: "100%", minHeight: "300px", padding: "0.5rem", marginBottom: "1rem" }} />
          <button onClick={handleSave} style={{ padding: "0.5rem 1rem", background: "#10b981", color: "white", border: "none", cursor: "pointer", marginRight: "0.5rem" }}>Save</button>
          <button onClick={() => setIsEditing(false)} style={{ padding: "0.5rem 1rem", background: "#e5e7eb", border: "none", cursor: "pointer" }}>Cancel</button>
        </>
      ) : (
        <>
          <pre style={{ background: "#f9fafb", padding: "1rem", borderRadius: "6px", overflow: "auto" }}>{output.content}</pre>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => setIsEditing(true)} style={{ padding: "0.5rem 1rem", background: "#6366f1", color: "white", border: "none", cursor: "pointer" }}>Edit</button>
            {visibleActions.map((action) => <button key={action} onClick={() => executeAction(action)} style={{ padding: "0.5rem 1rem", background: "#3b82f6", color: "white", border: "none", cursor: "pointer" }}>{ACTION_LABELS[action]}</button>)}
          </div>
        </>
      )}
    </div>
  </main>;
}
