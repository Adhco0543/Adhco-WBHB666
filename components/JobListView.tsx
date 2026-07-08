"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAllJobs, createJob, archiveJob, searchJobs } from "@/lib/jobActions";
import type { Job } from "@/lib/jobTypes";
import { colors, spacing } from "@/lib/designSystem";

export function JobListView() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "archived">("active");
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobClient, setNewJobClient] = useState("");

  // Load jobs
  useEffect(() => {
    loadJobs();
  }, []);

  // Filter and search
  const filtered = jobs
    .filter((j) => (filter === "all" ? true : j.status === filter))
    .filter((j) => {
      if (!search) return true;
      const lower = search.toLowerCase();
      return j.title.toLowerCase().includes(lower) || j.clientName.toLowerCase().includes(lower);
    });

  function loadJobs() {
    setJobs(getAllJobs());
  }

  function handleCreateJob() {
    if (!newJobTitle.trim() || !newJobClient.trim()) return;

    const job = createJob({
      title: newJobTitle,
      clientName: newJobClient,
      status: "active",
      startDate: new Date(),
      budget: 0,
    });

    setJobs([...jobs, job]);
    setNewJobTitle("");
    setNewJobClient("");
    setIsCreating(false);
  }

  function handleArchive(jobId: string) {
    archiveJob(jobId);
    loadJobs();
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: spacing[6],
        padding: spacing[6],
        backgroundColor: colors.neutral[50],
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 700 }}>📋 Jobs & Projects</h1>
          <p style={{ margin: `${spacing[1]} 0 0 0`, color: colors.neutral[600] }}>
            Manage all your projects and client work
          </p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          style={{
            padding: `${spacing[3]} ${spacing[4]}`,
            backgroundColor: colors.primary[500],
            color: colors.white,
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          + New Job
        </button>
      </div>

      {/* Create Job Form */}
      {isCreating && (
        <div
          style={{
            padding: spacing[4],
            backgroundColor: colors.white,
            border: `1px solid ${colors.neutral[200]}`,
            borderRadius: "8px",
            display: "flex",
            gap: spacing[3],
          }}
        >
          <input
            type="text"
            placeholder="Job title"
            value={newJobTitle}
            onChange={(e) => setNewJobTitle(e.target.value)}
            style={{
              flex: 1,
              padding: spacing[2],
              border: `1px solid ${colors.neutral[300]}`,
              borderRadius: "4px",
            }}
          />
          <input
            type="text"
            placeholder="Client name"
            value={newJobClient}
            onChange={(e) => setNewJobClient(e.target.value)}
            style={{
              flex: 1,
              padding: spacing[2],
              border: `1px solid ${colors.neutral[300]}`,
              borderRadius: "4px",
            }}
          />
          <button
            onClick={handleCreateJob}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: colors.success,
              color: colors.white,
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Create
          </button>
          <button
            onClick={() => setIsCreating(false)}
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
        </div>
      )}

      {/* Filter & Search */}
      <div
        style={{
          display: "flex",
          gap: spacing[3],
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: spacing[2],
            border: `1px solid ${colors.neutral[300]}`,
            borderRadius: "4px",
          }}
        />
        <div style={{ display: "flex", gap: spacing[2] }}>
          {(["all", "active", "completed", "archived"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: `${spacing[2]} ${spacing[3]}`,
                backgroundColor: filter === s ? colors.primary[500] : colors.white,
                color: filter === s ? colors.white : colors.neutral[600],
                border: `1px solid ${filter === s ? colors.primary[500] : colors.neutral[200]}`,
                borderRadius: "4px",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: spacing[4],
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              gridColumn: "1 / -1",
              padding: spacing[8],
              textAlign: "center",
              color: colors.neutral[500],
            }}
          >
            <p>No jobs found</p>
          </div>
        ) : (
          filtered.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <div
                style={{
                  padding: spacing[4],
                  backgroundColor: colors.white,
                  border: `1px solid ${colors.neutral[200]}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 200ms ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as any).style.boxShadow = `0 4px 12px ${colors.neutral[300]}`;
                  (e.currentTarget as any).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as any).style.boxShadow = "none";
                  (e.currentTarget as any).style.transform = "translateY(0)";
                }}
              >
                <h3 style={{ margin: `0 0 ${spacing[2]} 0`, fontSize: "1.1rem" }}>
                  {job.title}
                </h3>
                <p style={{ margin: 0, color: colors.neutral[600], fontSize: "0.9rem" }}>
                  👤 {job.clientName}
                </p>
                <div
                  style={{
                    marginTop: spacing[3],
                    paddingTop: spacing[3],
                    borderTop: `1px solid ${colors.neutral[100]}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.9rem",
                  }}
                >
                  <span
                    style={{
                      padding: `${spacing[1]} ${spacing[2]}`,
                      backgroundColor:
                        job.status === "active"
                          ? colors.info
                          : job.status === "completed"
                            ? colors.success
                            : colors.neutral[200],
                      color:
                        job.status === "archived"
                          ? colors.neutral[600]
                          : colors.white,
                      borderRadius: "4px",
                      fontSize: "0.8rem",
                      textTransform: "capitalize",
                    }}
                  >
                    {job.status}
                  </span>
                  {job.budget ? (
                    <span style={{ color: colors.neutral[600] }}>
                      Budget: ${job.budget}
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
