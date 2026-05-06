"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getActivityFeed } from "@/lib/assistantActions";
import type { ActivityFeedItem } from "@/lib/assistantTypes";

const TYPE_ICONS: Record<string, string> = {
  draft_created: "📝",
  draft_updated: "✏️",
  email_sent: "📧",
  quote_sent: "💰",
  task_created: "✅",
  task_completed: "🎉",
  chat: "💬",
};

export default function ActivityFeedPage() {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityFeedItem[]>([]);
  const [filterType, setFilterType] = useState<"all" | string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    const feed = getActivityFeed();
    setActivities(feed);
  }, []);

  useEffect(() => {
    let results = [...activities];

    if (filterType !== "all") {
      results = results.filter((item) => item.type === filterType);
    }

    results.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortBy === "newest" ? timeB - timeA : timeA - timeB;
    });

    setFilteredActivities(results);
  }, [activities, filterType, sortBy]);

  const types = Array.from(new Set(activities.map((item) => item.type)));

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <Link href="/dashboard" style={{ color: "#6b7280", textDecoration: "none", fontWeight: "500" }}>
          ← Dashboard
        </Link>
        <h1 style={{ margin: 0, fontSize: "1.875rem" }}>📊 Activity Feed</h1>
        <div />
      </div>

      <section style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", maxWidth: "600px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#374151" }}>
              Filter Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "1rem",
              }}
            >
              <option value="all">All Activities</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, " ").charAt(0).toUpperCase() + type.replace(/_/g, " ").slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#374151" }}>
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "1rem",
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </section>

      <section style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.5rem" }}>
        <p style={{ fontSize: "0.875rem", color: "#666", marginBottom: "1rem" }}>
          {filteredActivities.length} activit{filteredActivities.length !== 1 ? "ies" : "y"}
        </p>

        {filteredActivities.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filteredActivities.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "1rem",
                  padding: "1rem",
                  background: "#f9fafb",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div style={{ fontSize: "1.5rem" }}>
                  {TYPE_ICONS[item.type] || "📌"}
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem", fontWeight: "600" }}>
                    {item.title}
                  </h3>
                  {item.description && (
                    <p style={{ margin: "0.25rem 0", fontSize: "0.9rem", color: "#6b7280" }}>
                      {item.description.length > 100
                        ? item.description.substring(0, 100) + "..."
                        : item.description}
                    </p>
                  )}
                  <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.8rem", color: "#9ca3af" }}>
                    {formatTime(item.timestamp)}
                  </p>
                </div>

                {item.linkedOutputId && (
                  <Link
                    href={`/draft/${item.linkedOutputId}`}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "#2563eb",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      fontWeight: "500",
                      height: "fit-content",
                      whiteSpace: "nowrap",
                    }}
                  >
                    View
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
            <p>No activities yet</p>
          </div>
        )}
      </section>

      <style jsx>{`
        main {
          min-height: 100vh;
          background: #ffffff;
        }
      `}</style>
    </main>
  );
}
