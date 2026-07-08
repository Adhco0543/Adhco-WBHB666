"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getJobById, updateJob, getJobActivity } from "@/lib/jobActions";
import type { Job, ActivityEntry } from "@/lib/jobTypes";
import { colors, spacing } from "@/lib/designSystem";
import { Section, TwoPanelLayout } from "@/components/ui/Layouts";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params?.id as string | undefined;
  const [isLoading, setIsLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBudget, setEditBudget] = useState(0);

  useEffect(() => {
    // Guard against undefined jobId (can happen during initial render in Turbopack)
    if (!jobId) {
      setIsLoading(true);
      return;
    }

    const j = getJobById(jobId);
    if (j) {
      setJob(j);
      setEditTitle(j.title);
      setEditBudget(j.budget || 0);
      setActivity(getJobActivity(jobId));
    }
    setIsLoading(false);
  }, [jobId]);

  if (isLoading && !job) {
    return (
      <div style={{ padding: spacing[6], textAlign: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!job)
    return (
      <div style={{ padding: spacing[6], textAlign: "center" }}>
        <p>Job not found</p>
        <Link href="/jobs">← Back to Jobs</Link>
      </div>
    );

  function handleSave() {
    if (!jobId) return;
    const updated = updateJob(jobId, {
      title: editTitle,
      budget: editBudget,
    });
    if (updated) {
      setJob(updated);
      setEditMode(false);
    }
  }

  return (
    <div style={{ padding: spacing[6], backgroundColor: colors.neutral[50], minHeight: "100vh" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: spacing[6],
        }}
      >
        <div>
          <Link href="/jobs" style={{ color: colors.primary[500], textDecoration: "none" }}>
            ← Back to Jobs
          </Link>
          {editMode ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                border: `2px solid ${colors.primary[500]}`,
                padding: spacing[2],
                borderRadius: "4px",
                marginTop: spacing[2],
              }}
            />
          ) : (
            <h1 style={{ margin: `${spacing[2]} 0 0 0`, fontSize: "2rem", fontWeight: 700 }}>
              {job.title}
            </h1>
          )}
        </div>
        <div style={{ display: "flex", gap: spacing[3] }}>
          {editMode ? (
            <>
              <button
                onClick={handleSave}
                style={{
                  padding: `${spacing[2]} ${spacing[4]}`,
                  backgroundColor: colors.success,
                  color: colors.white,
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Save
              </button>
              <button
                onClick={() => setEditMode(false)}
                style={{
                  padding: `${spacing[2]} ${spacing[4]}`,
                  backgroundColor: colors.neutral[200],
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                backgroundColor: colors.primary[500],
                color: colors.white,
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              ✏️ Edit
            </button>
          )}
        </div>
      </div>

      <TwoPanelLayout
        left={
          <div style={{ display: "flex", flexDirection: "column", gap: spacing[6] }}>
            {/* Overview */}
            <Section title="Overview" subtitle="Project details">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: spacing[4],
                }}
              >
                <div>
                  <p style={{ margin: 0, color: colors.neutral[600], fontSize: "0.9rem" }}>
                    Client
                  </p>
                  <p style={{ margin: `${spacing[1]} 0 0 0`, fontSize: "1.1rem", fontWeight: 600 }}>
                    {job.clientName}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, color: colors.neutral[600], fontSize: "0.9rem" }}>
                    Status
                  </p>
                  <p
                    style={{
                      margin: `${spacing[1]} 0 0 0`,
                      textTransform: "capitalize",
                      fontWeight: 600,
                      color:
                        job.status === "active"
                          ? colors.primary[500]
                          : job.status === "completed"
                            ? colors.success
                            : colors.neutral[600],
                    }}
                  >
                    {job.status}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, color: colors.neutral[600], fontSize: "0.9rem" }}>
                    Budget
                  </p>
                  {editMode ? (
                    <input
                      type="number"
                      value={editBudget}
                      onChange={(e) => setEditBudget(parseFloat(e.target.value))}
                      style={{
                        marginTop: spacing[1],
                        padding: spacing[1],
                        border: `1px solid ${colors.neutral[300]}`,
                        borderRadius: "4px",
                        fontSize: "1rem",
                      }}
                    />
                  ) : (
                    <p style={{ margin: `${spacing[1]} 0 0 0`, fontSize: "1.1rem", fontWeight: 600 }}>
                      ${job.budget || 0}
                    </p>
                  )}
                </div>
              </div>
            </Section>

            {/* Placeholders for Content */}
            <Section title="Quotes" subtitle="Associated quotes for this job">
              <div style={{ padding: spacing[4], backgroundColor: colors.neutral[100], borderRadius: "4px" }}>
                <p style={{ margin: 0, color: colors.neutral[600] }}>📄 No quotes yet</p>
              </div>
            </Section>

            <Section title="Tasks" subtitle="Project tasks and milestones">
              <div style={{ padding: spacing[4], backgroundColor: colors.neutral[100], borderRadius: "4px" }}>
                <p style={{ margin: 0, color: colors.neutral[600] }}>☑️ No tasks yet</p>
              </div>
            </Section>

            <Section title="Materials" subtitle="Materials and resources needed">
              <div style={{ padding: spacing[4], backgroundColor: colors.neutral[100], borderRadius: "4px" }}>
                <p style={{ margin: 0, color: colors.neutral[600] }}>📦 No materials yet</p>
              </div>
            </Section>
          </div>
        }
        right={
          <div style={{ display: "flex", flexDirection: "column", gap: spacing[6] }}>
            {/* Quick Info */}
            <Section title="Quick Info" subtitle="">
              <div style={{ display: "flex", flexDirection: "column", gap: spacing[2] }}>
                {job.clientEmail && (
                  <div>
                    <p style={{ margin: 0, color: colors.neutral[600], fontSize: "0.85rem" }}>Email</p>
                    <p style={{ margin: `${spacing[1]} 0 0 0`, fontSize: "0.95rem" }}>{job.clientEmail}</p>
                  </div>
                )}
                {job.clientPhone && (
                  <div>
                    <p style={{ margin: 0, color: colors.neutral[600], fontSize: "0.85rem" }}>Phone</p>
                    <p style={{ margin: `${spacing[1]} 0 0 0`, fontSize: "0.95rem" }}>{job.clientPhone}</p>
                  </div>
                )}
                {job.dueDate && (
                  <div>
                    <p style={{ margin: 0, color: colors.neutral[600], fontSize: "0.85rem" }}>Due Date</p>
                    <p style={{ margin: `${spacing[1]} 0 0 0`, fontSize: "0.95rem" }}>
                      {new Date(job.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </Section>

            {/* Activity Feed */}
            <Section title="Activity" subtitle={`${activity.length} events`}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: spacing[2],
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                {activity.length === 0 ? (
                  <p style={{ color: colors.neutral[500], fontSize: "0.9rem" }}>No activity yet</p>
                ) : (
                  activity.slice(0, 10).map((entry) => (
                    <div
                      key={entry.id}
                      style={{
                        padding: spacing[2],
                        backgroundColor: colors.neutral[50],
                        borderLeft: `3px solid ${colors.primary[300]}`,
                        borderRadius: "2px",
                      }}
                    >
                      <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }}>
                        {entry.title}
                      </p>
                      <p style={{ margin: `${spacing[1]} 0 0 0`, fontSize: "0.8rem", color: colors.neutral[600] }}>
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Section>
          </div>
        }
      />
    </div>
  );
}
