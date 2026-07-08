"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { colors, spacing } from "@/lib/designSystem";
import { Card, Widget, Badge, Button } from "@/components/ui/Components";
import { getWorkspaceProjectById, updateProjectLastAccessed } from "@/lib/workspaceActions";
import type { WorkspaceProject } from "@/lib/workspaceTypes";

interface WorkspaceViewProps {
  projectId: string;
}

export function WorkspaceView({ projectId }: WorkspaceViewProps) {
  const [project, setProject] = useState<WorkspaceProject | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "quotes" | "materials" | "tasks" | "notes" | "chat" | "activity">("overview");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loaded = getWorkspaceProjectById(projectId);
    setProject(loaded);
    updateProjectLastAccessed(projectId);
    setIsLoading(false);
  }, [projectId]);

  if (isLoading) {
    return <div style={{ padding: spacing[6] }}>Loading workspace...</div>;
  }

  if (!project) {
    return <div style={{ padding: spacing[6] }}>Project not found</div>;
  }

  const tabs = [
    { id: "overview", label: "📊 Overview" },
    { id: "quotes", label: `💰 Quotes (${project.quotes.length})` },
    { id: "materials", label: `📦 Materials (${project.materialsList.length})` },
    { id: "tasks", label: `✅ Tasks (${project.tasks.length})` },
    { id: "notes", label: `📝 Notes (${project.notes.length})` },
    { id: "chat", label: "💬 Chat" },
    { id: "activity", label: "📋 Activity" },
  ] as const;

  const statusColors: Record<string, string> = {
    planning: colors.primary[400],
    active: colors.success,
    "on-hold": colors.warning,
    completed: colors.neutral[400],
    archived: colors.neutral[300],
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: colors.neutral[50] }}>
      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          backgroundColor: colors.white,
          borderRight: `1px solid ${colors.neutral[200]}`,
          padding: spacing[6],
          overflowY: "auto",
        }}
      >
        <div style={{ marginBottom: spacing[6] }}>
          <h2 style={{ margin: 0, marginBottom: spacing[3], fontSize: "1.2rem" }}>
            {project.title}
          </h2>
          <p style={{ margin: 0, marginBottom: spacing[3], color: colors.neutral[600], fontSize: "0.9rem" }}>
            {project.clientName}
          </p>
          <div style={{
            display: "inline-block",
            padding: `${spacing[1]} ${spacing[2]}`,
            borderRadius: "999px",
            fontSize: "0.75rem",
            fontWeight: 600,
            backgroundColor: statusColors[project.status],
            color: colors.white,
          }}>
            {project.status}
          </div>
        </div>

        <div style={{ marginBottom: spacing[6] }}>
          <h4 style={{ margin: 0, marginBottom: spacing[2], fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", color: colors.neutral[500] }}>
            Resources
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: spacing[2] }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: `${spacing[2]} ${spacing[3]}`,
                  border: activeTab === tab.id ? `2px solid ${colors.primary[500]}` : "1px solid transparent",
                  backgroundColor: activeTab === tab.id ? colors.primary[50] : "transparent",
                  borderRadius: "6px",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "0.95rem",
                  color: activeTab === tab.id ? colors.primary[600] : colors.neutral[700],
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  transition: "all 200ms",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <Link href="/workspace" style={{ textDecoration: "none", display: "block" }}>
          <button style={{
            width: "100%",
            padding: `${spacing[2]} ${spacing[3]}`,
            backgroundColor: colors.neutral[100],
            color: colors.neutral[700],
            border: `1px solid ${colors.neutral[200]}`,
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}>
            ← All Projects
          </button>
        </Link>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Tabs Header */}
        <div
          style={{
            display: "flex",
            gap: spacing[2],
            padding: spacing[4],
            borderBottom: `1px solid ${colors.neutral[200]}`,
            overflowX: "auto",
            backgroundColor: colors.white,
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                border: "none",
                borderBottom: activeTab === tab.id ? `3px solid ${colors.primary[500]}` : "3px solid transparent",
                backgroundColor: "transparent",
                cursor: "pointer",
                fontSize: "0.95rem",
                color: activeTab === tab.id ? colors.primary[600] : colors.neutral[600],
                fontWeight: activeTab === tab.id ? 600 : 400,
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflow: "auto", padding: spacing[6] }}>
          {activeTab === "overview" && <OverviewTab project={project} />}
          {activeTab === "quotes" && <QuotesTab project={project} />}
          {activeTab === "materials" && <MaterialsTab project={project} />}
          {activeTab === "tasks" && <TasksTab project={project} />}
          {activeTab === "notes" && <NotesTab project={project} />}
          {activeTab === "chat" && <ChatTab project={project} />}
          {activeTab === "activity" && <ActivityTab project={project} />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ project }: { project: WorkspaceProject }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing[6] }}>
      <Card>
        <h3 style={{ marginTop: 0 }}>Project Details</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: spacing[3] }}>
          <div>
            <label style={{ fontSize: "0.85rem", color: colors.neutral[600] }}>Title</label>
            <p style={{ margin: 0, marginTop: spacing[1], fontWeight: 600 }}>{project.title}</p>
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", color: colors.neutral[600] }}>Client</label>
            <p style={{ margin: 0, marginTop: spacing[1], fontWeight: 600 }}>{project.clientName}</p>
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", color: colors.neutral[600] }}>Status</label>
            <p style={{ margin: 0, marginTop: spacing[1], fontWeight: 600 }}>{project.status}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Quick Stats</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing[4] }}>
          <Widget icon="💰" title="Quotes" value={project.quotes.length} />
          <Widget icon="✅" title="Tasks" value={project.tasks.length} />
          <Widget icon="📦" title="Materials" value={project.materialsList.length} />
          <Widget icon="📝" title="Notes" value={project.notes.length} />
        </div>
      </Card>
    </div>
  );
}

function QuotesTab({ project }: { project: WorkspaceProject }) {
  return (
    <div>
      <h3>Quotes ({project.quotes.length})</h3>
      {project.quotes.length === 0 ? (
        <p style={{ color: colors.neutral[500] }}>No quotes yet. Ask the assistant to create one!</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: spacing[3] }}>
          {project.quotes.map((quote) => (
            <Card key={quote.id}>
              <h4 style={{ marginTop: 0 }}>{quote.title}</h4>
              <p style={{ color: colors.neutral[600], fontSize: "0.95rem" }}>{quote.content.substring(0, 150)}...</p>
              <Badge variant="default">{quote.status}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function MaterialsTab({ project }: { project: WorkspaceProject }) {
  return (
    <div>
      <h3>Materials ({project.materialsList.length})</h3>
      {project.materialsList.length === 0 ? (
        <p style={{ color: colors.neutral[500] }}>No materials yet. Ask the assistant to create a materials list!</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${colors.neutral[200]}` }}>
              <th style={{ textAlign: "left", padding: spacing[3], fontWeight: 600 }}>Item</th>
              <th style={{ textAlign: "left", padding: spacing[3], fontWeight: 600 }}>Qty</th>
              <th style={{ textAlign: "left", padding: spacing[3], fontWeight: 600 }}>Unit</th>
              <th style={{ textAlign: "left", padding: spacing[3], fontWeight: 600 }}>Est. Cost</th>
            </tr>
          </thead>
          <tbody>
            {project.materialsList.flatMap((m) =>
              m.items.map((item) => (
                <tr key={`${m.id}-${item.id}`} style={{ borderBottom: `1px solid ${colors.neutral[200]}` }}>
                  <td style={{ padding: spacing[3] }}>{item.name}</td>
                  <td style={{ padding: spacing[3] }}>{item.quantity}</td>
                  <td style={{ padding: spacing[3] }}>{item.unit}</td>
                  <td style={{ padding: spacing[3] }}>
                    {item.estimatedCost ? `$${item.estimatedCost.toFixed(2)}` : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

function TasksTab({ project }: { project: WorkspaceProject }) {
  return (
    <div>
      <h3>Tasks ({project.tasks.length})</h3>
      {project.tasks.length === 0 ? (
        <p style={{ color: colors.neutral[500] }}>No tasks yet. Ask the assistant to create one!</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: spacing[3] }}>
          {project.tasks.map((task) => (
            <Card key={task.id}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h4 style={{ margin: 0 }}>{task.title}</h4>
                <Badge variant="default">{task.status}</Badge>
              </div>
              {task.dueDate && <p style={{ margin: `${spacing[2]} 0 0 0`, fontSize: "0.9rem", color: colors.neutral[600] }}>Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function NotesTab({ project }: { project: WorkspaceProject }) {
  return (
    <div>
      <h3>Notes ({project.notes.length})</h3>
      {project.notes.length === 0 ? (
        <p style={{ color: colors.neutral[500] }}>No notes yet. Ask the assistant to create one!</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: spacing[3] }}>
          {project.notes.map((note) => (
            <Card key={note.id}>
              <h4 style={{ marginTop: 0 }}>{note.title}</h4>
              <p style={{ margin: 0, color: colors.neutral[700] }}>{note.content.substring(0, 200)}...</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ChatTab({ project }: { project: WorkspaceProject }) {
  return (
    <div>
      <h3>Project Chat Memory</h3>
      <p style={{ color: colors.neutral[600] }}>
        {project.chatMemory.length} messages in this project's chat history
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: spacing[2], maxHeight: "400px", overflowY: "auto" }}>
        {project.chatMemory.slice(-20).map((msg, idx) => (
          <div key={idx} style={{ padding: spacing[3], backgroundColor: msg.role === "user" ? colors.primary[50] : colors.neutral[50], borderRadius: "8px" }}>
            <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: colors.neutral[600] }}>
              {msg.role === "user" ? "👤 You" : "🤖 Assistant"}
            </p>
            <p style={{ margin: `${spacing[2]} 0 0 0` }}>{msg.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityTab({ project }: { project: WorkspaceProject }) {
  return (
    <div>
      <h3>Activity Feed</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: spacing[3] }}>
        {project.activityFeed.slice().reverse().map((activity) => (
          <div key={activity.id} style={{ padding: spacing[3], borderLeft: `4px solid ${colors.primary[500]}`, backgroundColor: colors.neutral[50], borderRadius: "0 8px 8px 0" }}>
            <h4 style={{ margin: 0 }}>{activity.title}</h4>
            {activity.description && <p style={{ margin: `${spacing[1]} 0 0 0`, color: colors.neutral[600] }}>{activity.description}</p>}
            <p style={{ margin: `${spacing[2]} 0 0 0`, fontSize: "0.85rem", color: colors.neutral[500] }}>
              {new Date(activity.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
