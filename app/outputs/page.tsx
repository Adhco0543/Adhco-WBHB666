"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getOutputsByType, removeOutput } from "@/lib/assistantActions";
import type { SavedOutput, OutputType } from "@/lib/assistantTypes";

const TYPE_ICONS: Record<OutputType, string> = {
  quote: "💰",
  materials: "📦",
  email: "📧",
  task: "✅",
  note: "📝",
};

const TYPE_LABELS: Record<OutputType, string> = {
  quote: "Quote",
  materials: "Materials List",
  email: "Email Draft",
  task: "Task",
  note: "Note",
};

export default function OutputsPage() {
  const [allOutputs, setAllOutputs] = useState<SavedOutput[]>([]);
  const [filteredOutputs, setFilteredOutputs] = useState<SavedOutput[]>([]);
  const [filterType, setFilterType] = useState<OutputType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "sent" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");

  useEffect(() => {
    // Load all outputs
    const types: OutputType[] = ["quote", "materials", "email", "task", "note"];
    const outputs: SavedOutput[] = [];
    
    types.forEach((type) => {
      const typeOutputs = getOutputsByType(type);
      outputs.push(...typeOutputs);
    });

    // Sort by newest first
    outputs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setAllOutputs(outputs);
  }, []);

  useEffect(() => {
    let results = [...allOutputs];

    // Filter by type
    if (filterType !== "all") {
      results = results.filter((o) => o.type === filterType);
    }

    // Filter by status
    if (filterStatus !== "all") {
      results = results.filter((o) => o.status === filterStatus);
    }

    // Search
    if (searchQuery) {
      results = results.filter((o) =>
        o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    results.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    setFilteredOutputs(results);
  }, [allOutputs, filterType, filterStatus, searchQuery, sortBy]);

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this output?")) {
      removeOutput(id);
      setAllOutputs(allOutputs.filter((o) => o.id !== id));
    }
  };

  const types: OutputType[] = ["quote", "materials", "email", "task", "note"];
  const counts = useMemo(() => {
    const result: Record<OutputType | "all", number> = {
      all: allOutputs.length,
      quote: 0,
      materials: 0,
      email: 0,
      task: 0,
      note: 0,
    };
    allOutputs.forEach((o) => {
      result[o.type]++;
    });
    return result;
  }, [allOutputs]);

  return (
    <main style={{ minHeight: "100vh", background: "#ffffff" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <Link href="/dashboard" style={{ color: "#6b7280", textDecoration: "none", fontWeight: "500" }}>
            ← Dashboard
          </Link>
          <h1 style={{ margin: 0, fontSize: "1.875rem" }}>📂 All Outputs</h1>
          <div style={{ width: "100px" }} />
        </div>

        {/* Type Filter Tabs */}
        <section style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              onClick={() => setFilterType("all")}
              style={{
                padding: "0.75rem 1.25rem",
                background: filterType === "all" ? "#2563eb" : "#e5e7eb",
                color: filterType === "all" ? "white" : "#374151",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "0.9rem",
                transition: "all 0.2s",
              }}
            >
              📂 All ({counts.all})
            </button>
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  padding: "0.75rem 1.25rem",
                  background: filterType === type ? "#2563eb" : "#e5e7eb",
                  color: filterType === type ? "white" : "#374151",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "0.9rem",
                  transition: "all 0.2s",
                }}
              >
                {TYPE_ICONS[type]} {TYPE_LABELS[type]} ({counts[type]})
              </button>
            ))}
          </div>
        </section>

        {/* Controls */}
        <section style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "1rem" }}>
            <input
              type="text"
              placeholder="Search by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "1rem",
              }}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              style={{
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "1rem",
              }}
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
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
        </section>

        {/* Outputs List */}
        {filteredOutputs.length > 0 ? (
          <section style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
              {filteredOutputs.map((output) => (
                <div
                  key={output.id}
                  style={{
                    padding: "1.5rem",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    background: "#f9fafb",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                    (e.currentTarget as HTMLElement).style.borderColor = "#2563eb";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.75rem" }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span>{TYPE_ICONS[output.type]}</span>
                        {output.title}
                      </h3>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "#9ca3af" }}>
                        {TYPE_LABELS[output.type]}
                      </p>
                    </div>
                    <span
                      style={{
                        padding: "0.35rem 0.75rem",
                        background:
                          output.status === "sent"
                            ? "#d1fae5"
                            : output.status === "completed"
                              ? "#c7d2fe"
                              : "#fef3c7",
                        color:
                          output.status === "sent"
                            ? "#065f46"
                            : output.status === "completed"
                              ? "#312e81"
                              : "#92400e",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {output.status?.toUpperCase() || "DRAFT"}
                    </span>
                  </div>

                  <p style={{ margin: "0.75rem 0", fontSize: "0.9rem", color: "#6b7280", lineHeight: "1.5", maxHeight: "60px", overflow: "hidden" }}>
                    {output.content.substring(0, 120)}
                    {output.content.length > 120 ? "..." : ""}
                  </p>

                  <p style={{ margin: "0.75rem 0", fontSize: "0.8rem", color: "#9ca3af" }}>
                    {new Date(output.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>

                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                    <Link
                      href={`/outputs/${output.id}`}
                      style={{
                        flex: 1,
                        padding: "0.5rem",
                        background: "#2563eb",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "4px",
                        textAlign: "center",
                        fontSize: "0.85rem",
                        fontWeight: "500",
                        border: "none",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                    >
                      Open
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(output.id);
                      }}
                      type="button"
                      style={{
                        padding: "0.5rem 0.75rem",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "500",
                        fontSize: "0.85rem",
                        transition: "background 0.2s",
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "3rem", textAlign: "center" }}>
            <p style={{ color: "#9ca3af", margin: 0, fontSize: "1rem" }}>
              {searchQuery || filterStatus !== "all" || filterType !== "all"
                ? "No outputs match your filters"
                : "No outputs yet. Create one in the chat!"}
            </p>
          </section>
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
