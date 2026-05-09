"use client";

import { useState } from "react";
import { colors, spacing } from "@/lib/designSystem";
import { Button } from "@/components/ui/Components";
import type { AttachmentPrompt } from "@/lib/workspaceTypes";

interface ProjectAttachmentModalProps {
  prompt: AttachmentPrompt;
  existingProjects: Array<{ id: string; title: string }>;
  onAttach: (projectId: string) => void;
  onCreate: (projectTitle: string) => void;
  onSkip: () => void;
}

export function ProjectAttachmentModal({
  prompt,
  existingProjects,
  onAttach,
  onCreate,
  onSkip,
}: ProjectAttachmentModalProps) {
  const [mode, setMode] = useState<"select" | "create">("select");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [newProjectName, setNewProjectName] = useState("");

  const handleAttach = () => {
    if (mode === "select" && selectedProjectId) {
      onAttach(selectedProjectId);
    } else if (mode === "create" && newProjectName) {
      onCreate(newProjectName);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onSkip();
      }}
    >
      <div
        className="modal-card"
        style={{
          backgroundColor: colors.white,
          borderRadius: "12px",
          padding: spacing[6],
          maxWidth: "500px",
          width: "90%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ margin: `0 0 ${spacing[4]} 0`, color: colors.neutral[900] }}>
          📎 Attach to Project
        </h2>

        <p style={{ color: colors.neutral[600], marginBottom: spacing[6] }}>
          {prompt.type.charAt(0).toUpperCase() + prompt.type.slice(1)}: <strong>{prompt.title}</strong>
        </p>

        {mode === "select" ? (
          <>
            <div style={{ marginBottom: spacing[6] }}>
              <label style={{ display: "block", marginBottom: spacing[3], fontWeight: 600 }}>
                Select Project:
              </label>
              {existingProjects.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: spacing[2] }}>
                  {existingProjects.map((proj) => (
                    <button
                      key={proj.id}
                      onClick={() => setSelectedProjectId(proj.id)}
                      style={{
                        padding: spacing[3],
                        border: selectedProjectId === proj.id 
                          ? `2px solid ${colors.primary[500]}`
                          : `1px solid ${colors.neutral[200]}`,
                        borderRadius: "8px",
                        backgroundColor: selectedProjectId === proj.id 
                          ? colors.primary[50]
                          : colors.neutral[50],
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 200ms",
                      }}
                    >
                      {proj.title}
                    </button>
                  ))}
                </div>
              ) : (
                <p style={{ color: colors.neutral[500] }}>No projects yet</p>
              )}
            </div>

            <button
              onClick={() => setMode("create")}
              style={{
                textAlign: "center",
                width: "100%",
                padding: spacing[3],
                border: `2px dashed ${colors.primary[300]}`,
                backgroundColor: "transparent",
                borderRadius: "8px",
                cursor: "pointer",
                color: colors.primary[600],
                fontWeight: 600,
                marginBottom: spacing[6],
              }}
            >
              + Create New Project
            </button>
          </>
        ) : (
          <div style={{ marginBottom: spacing[6] }}>
            <label style={{ display: "block", marginBottom: spacing[2], fontWeight: 600 }}>
              Project Name:
            </label>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="E.g., Kitchen Renovation"
              style={{
                width: "100%",
                padding: spacing[3],
                border: `1px solid ${colors.neutral[300]}`,
                borderRadius: "8px",
                fontFamily: "inherit",
                fontSize: "1rem",
              }}
            />
            <button
              onClick={() => setMode("select")}
              style={{
                marginTop: spacing[3],
                textAlign: "center",
                width: "100%",
                padding: spacing[2],
                border: "none",
                backgroundColor: "transparent",
                color: colors.primary[600],
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              ← Back to Selection
            </button>
          </div>
        )}

        <div className="modal-actions" style={{ display: "flex", gap: spacing[3], justifyContent: "flex-end" }}>
          <Button variant="secondary" size="md" onClick={onSkip}>
            Not Now
          </Button>
          <button
            onClick={handleAttach}
            disabled={mode === "select" ? !selectedProjectId : !newProjectName}
            style={{
              padding: `${spacing[3]} ${spacing[4]}`,
              borderRadius: "8px",
              border: "none",
              backgroundColor:
                mode === "select" ? (!selectedProjectId ? colors.neutral[300] : colors.primary[500]) : (!newProjectName ? colors.neutral[300] : colors.primary[500]),
              color: colors.white,
              cursor: mode === "select" ? (!selectedProjectId ? "not-allowed" : "pointer") : (!newProjectName ? "not-allowed" : "pointer"),
              fontWeight: 600,
              fontSize: "0.95rem",
            }}
          >
            {mode === "select" ? "Attach to Project" : "Create & Attach"}
          </button>
        </div>
      </div>
    </div>
  );
}
