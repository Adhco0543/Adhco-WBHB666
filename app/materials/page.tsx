"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOutputsByType, removeOutput } from "@/lib/assistantActions";
import type { SavedOutput } from "@/lib/assistantTypes";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<SavedOutput[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<SavedOutput[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "sent" | "completed">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");

  useEffect(() => {
    const allMaterials = getOutputsByType("materials");
    setMaterials(allMaterials);
  }, []);

  useEffect(() => {
    let results = [...materials];

    if (searchQuery) {
      results = results.filter(
        (m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      results = results.filter((m) => m.status === filterStatus);
    }

    results.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    setFilteredMaterials(results);
  }, [materials, searchQuery, filterStatus, sortBy]);

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this materials list?")) {
      removeOutput(id);
      setMaterials(materials.filter((m) => m.id !== id));
    }
  };

  return (
    <main className="page">
      <div className="stack">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link className="back" href="/dashboard">
            ← Dashboard
          </Link>
          <Link className="button" href="/chat?task=materials">
            + New List
          </Link>
        </div>

        <section className="card">
          <h1>📦 Materials Lists</h1>
          <p style={{ color: "#666", marginTop: "0.5rem" }}>
            {filteredMaterials.length} list{filteredMaterials.length !== 1 ? "s" : ""}
          </p>

          <div
            style={{
              marginTop: "1.5rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "1rem",
              maxWidth: "900px",
            }}
          >
            <input
              type="text"
              placeholder="Search materials..."
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

        {filteredMaterials.length > 0 ? (
          <section className="card">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {filteredMaterials.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "1.5rem",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    background: "#f9fafb",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "600", flex: 1 }}>
                      {item.title}
                    </h3>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        background: item.status === "sent" ? "#d1fae5" : item.status === "completed" ? "#c7d2fe" : "#fef3c7",
                        color: item.status === "sent" ? "#065f46" : item.status === "completed" ? "#312e81" : "#92400e",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.status?.toUpperCase() || "DRAFT"}
                    </span>
                  </div>

                  <p style={{ margin: "0 0 1rem 0", fontSize: "0.9rem", color: "#6b7280", lineHeight: "1.5" }}>
                    {item.content.substring(0, 100)}...
                  </p>

                  <p style={{ margin: "0.75rem 0", fontSize: "0.8rem", color: "#9ca3af" }}>
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>

                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                    <Link
                      href={`/draft/${item.id}`}
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
                      View
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(item.id);
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
          <section className="card" style={{ textAlign: "center" }}>
            <p style={{ color: "#9ca3af", margin: "2rem 0" }}>
              {searchQuery || filterStatus !== "all"
                ? "No materials match your search or filter"
                : "No materials lists yet. Create your first one!"}
            </p>
            <Link className="button" href="/chat?task=materials">
              Create First List
            </Link>
          </section>
        )}
      </div>

      <style jsx>{`
        .page {
          max-width: 1200px;
          margin: 0 auto;
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

        .back {
          color: #6b7280;
          text-decoration: none;
          font-weight: 500;
        }

        .back:hover {
          color: #111827;
        }

        .button {
          background: #2563eb;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          border: none;
          cursor: pointer;
        }

        .button:hover {
          background: #1d4ed8;
        }

        h1 {
          margin: 0;
          font-size: 1.875rem;
        }

        h3 {
          margin: 0;
        }
      `}</style>
    </main>
  );
}
