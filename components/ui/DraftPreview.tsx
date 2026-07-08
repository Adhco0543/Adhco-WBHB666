"use client";

import { useState } from "react";
import Link from "next/link";
import { colors, spacing } from "@/lib/designSystem";
import { Card, Badge, Button } from "@/components/ui/Components";
import type { GeneratedDraft } from "@/lib/draftGenerator";

interface DraftPreviewProps {
  draft: GeneratedDraft;
  onSave: (draft: GeneratedDraft) => void;
  onEdit: (draft: GeneratedDraft) => void;
  onDiscard: () => void;
}

export function DraftPreview({
  draft,
  onSave,
  onEdit,
  onDiscard,
}: DraftPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(draft.content);

  const typeColors = {
    email: "default",
    quote: "default",
    bid: "default",
    invoice: "default",
    proposal: "default",
  } as const;

  const handleSave = () => {
    const updated = { ...draft, content: editedContent };
    onSave(updated);
    setEditMode(false);
  };

  return (
    <div
      style={{
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          margin: `${spacing[4]} 0`,
          backgroundColor: colors.neutral[50],
          border: `2px solid ${colors.primary[200]}`,
          borderRadius: "8px",
          overflow: "hidden",
          position: "relative",
          zIndex: 100,
        }}
      >
      {/* Header */}
      <div
        style={{
          padding: spacing[4],
          backgroundColor: colors.primary[50],
          borderBottom: `1px solid ${colors.primary[200]}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: spacing[3] }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              fontSize: "1.5rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              pointerEvents: "auto",
              transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
              transition: "transform 200ms ease",
            }}
          >
            ▼
          </button>
          <div>
            <h4
              style={{
                margin: 0,
                fontSize: "1rem",
                fontWeight: 600,
                color: colors.neutral[900],
              }}
            >
              {draft.title}
            </h4>
            <p
              style={{
                margin: `${spacing[1]} 0 0 0`,
                fontSize: "0.85rem",
                color: colors.neutral[500],
              }}
            >
              {draft.preview}
            </p>
          </div>
        </div>
        <Badge variant={typeColors[draft.type as keyof typeof typeColors] || "default"}>
          {draft.type.toUpperCase()}
        </Badge>
      </div>

      {/* Content */}
      {isExpanded && (
        <div
          style={{
            padding: spacing[4],
            borderBottom: `1px solid ${colors.neutral[200]}`,
          }}
        >
          {editMode ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              style={{
                width: "100%",
                minHeight: "300px",
                border: `1px solid ${colors.neutral[300]}`,
                borderRadius: "6px",
                padding: spacing[3],
                fontFamily: "monospace",
                fontSize: "0.9rem",
                color: colors.neutral[900],
                backgroundColor: colors.white,
              }}
            />
          ) : (
            <pre
              style={{
                margin: 0,
                padding: spacing[4],
                backgroundColor: colors.white,
                border: `1px solid ${colors.neutral[200]}`,
                borderRadius: "6px",
                overflow: "auto",
                maxHeight: "400px",
                fontFamily: "monospace",
                fontSize: "0.85rem",
                color: colors.neutral[800],
                lineHeight: 1.6,
              }}
            >
              {draft.content}
            </pre>
          )}
        </div>
      )}

      {/* Actions */}
      {isExpanded && (
        <div
          style={{
            padding: spacing[4],
            backgroundColor: colors.neutral[50],
            display: "flex",
            gap: spacing[3],
            justifyContent: "flex-end",
            flexWrap: "wrap",
            pointerEvents: "auto",
          }}
        >
          {editMode ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditMode(false);
                  setEditedContent(draft.content);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setEditMode(true)}>
                ✏️ Edit
              </Button>
              <Button variant="secondary" size="sm" onClick={onDiscard}>
                Discard
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onSave(editMode ? { ...draft, content: editedContent } : draft);
                }}
              >
                💾 Save Draft
              </Button>
            </>
          )}
        </div>
      )}
    </div>
    </div>
  );
}

export function DraftQuickActions({ draft }: { draft: GeneratedDraft }) {
  return (
    <div
      style={{
        display: "flex",
        gap: spacing[2],
        marginTop: spacing[2],
        flexWrap: "wrap",
      }}
    >
      {draft.type === "email" && (
        <Link href="/integrations">
          <Button variant="secondary" size="sm">
            📧 Send Email
          </Button>
        </Link>
      )}

      {(draft.type === "quote" || draft.type === "bid" || draft.type === "proposal") && (
        <Link href="/outputs">
          <Button variant="secondary" size="sm">
            📂 Save to Outputs
          </Button>
        </Link>
      )}

      {draft.type === "invoice" && (
        <Button variant="secondary" size="sm">
          📤 Send Invoice
        </Button>
      )}

      <Button variant="ghost" size="sm">
        📋 Copy to Clipboard
      </Button>
    </div>
  );
}

export function DraftSuggestion({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: spacing[3],
        backgroundColor: colors.primary[50],
        border: `1px solid ${colors.primary[200]}`,
        borderRadius: "6px",
        fontSize: "0.9rem",
        color: colors.neutral[700],
        marginBottom: spacing[3],
      }}
    >
      <span style={{ fontWeight: 600, color: colors.primary[700] }}>💡 Tip: </span>
      {text}
    </div>
  );
}
