"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import type { OnboardingData } from "@/lib/onboarding";
import { generateSmartSuggestions, generateDailyBrief, type DashboardSuggestion, type DailyBrief } from "@/lib/dashboardSuggestions";
import { loadOnboardingProfile, initFirebaseOnStartup } from "@/lib/firebase";
import { getRecentOutputs, getPendingTasks, getActivityFeed, type SavedOutput, type Task } from "@/lib/assistantMemory";

export default function AdvancedDashboardPage() {
  const [profile, setProfile] = useState<OnboardingData | null>(null);
  const [suggestions, setSuggestions] = useState<DashboardSuggestion[]>([]);
  const [dailyBrief, setDailyBrief] = useState<DailyBrief | null>(null);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [recentOutputs, setRecentOutputs] = useState<SavedOutput[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);

  useEffect(() => {
    // Initialize Firebase on startup
    initFirebaseOnStartup();

    // Load profile from Firebase or localStorage
    loadOnboardingProfile()
      .then((result) => {
        if (result.profile) {
          setProfile(result.profile);
          setSuggestions(generateSmartSuggestions(result.profile));
          setDailyBrief(generateDailyBrief(result.profile));
          console.log(`Profile loaded from ${result.source}`);
        } else if (result.error) {
          setLoadError(result.error);
        }

        // Load dismissed suggestions from localStorage
        const dismissed = localStorage.getItem("dismissed_suggestions");
        if (dismissed) {
          try {
            setDismissedSuggestions(new Set(JSON.parse(dismissed)));
          } catch (e) {
            console.warn("Failed to parse dismissed suggestions");
          }
        }

        // Load recent outputs and tasks
        setRecentOutputs(getRecentOutputs(5));
        setPendingTasks(getPendingTasks());
        setActivityFeed(getActivityFeed(5));
      })
      .catch((error) => {
        const errorMessage = error instanceof Error ? error.message : "Failed to load profile";
        setLoadError(errorMessage);
        console.error("Error loading profile:", errorMessage);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>(["all"]);
    suggestions.forEach(s => cats.add(s.category));
    return Array.from(cats);
  }, [suggestions]);

  const filteredSuggestions = useMemo(() => {
    return suggestions.filter(s => {
      const categoryMatch = activeCategory === "all" || s.category === activeCategory;
      const notDismissed = !dismissedSuggestions.has(s.id);
      return categoryMatch && notDismissed;
    });
  }, [suggestions, activeCategory, dismissedSuggestions]);

  const dismissSuggestion = (id: string) => {
    const updated = new Set(dismissedSuggestions);
    updated.add(id);
    setDismissedSuggestions(updated);
    localStorage.setItem("dismissed_suggestions", JSON.stringify(Array.from(updated)));
  };

  const highPrioritySuggestions = filteredSuggestions.filter(s => s.priority === "high").slice(0, 2);
  const otherSuggestions = filteredSuggestions.filter(s => s.priority !== "high");

  if (isLoading) {
    return (
      <main className="page">
        <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
          <h2>Loading dashboard...</h2>
          <p style={{ marginTop: "1rem", color: "#666" }}>Please wait while we fetch your profile.</p>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="page">
        <div className="card">
          <h2 style={{ color: "#c00" }}>Error Loading Dashboard</h2>
          <p style={{ color: "#666", marginTop: "1rem" }}>{loadError}</p>
          <p style={{ fontSize: "0.9rem", color: "#999", marginTop: "1rem" }}>
            Trying to load from local storage. If this persists, please complete onboarding again.
          </p>
          <Link className="button" href="/onboarding" style={{ marginTop: "1rem" }}>
            Start Onboarding
          </Link>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="page">
        <div className="card">
          <h1>Dashboard</h1>
          <p>No onboarding profile found. Please complete onboarding first.</p>
          <Link className="button" href="/onboarding">
            Start Onboarding
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="stack">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link className="back" href="/">
            ← Home
          </Link>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link className="button" href="/tasks">
              📋 Tasks
            </Link>
            <Link className="button ghost" href="/integrations">
              🔗 Integrations
            </Link>
          </div>
        </div>

        {/* Daily Brief */}
        {dailyBrief && (
          <section className="card briefing-card" style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none"
          }}>
            <p className="eyebrow" style={{ color: "rgba(255,255,255,0.8)" }}>DAILY BRIEFING</p>
            <h1 style={{ color: "white" }}>{dailyBrief.greeting}</h1>
            <p style={{ fontSize: "1.1rem", marginTop: "0.5rem" }}>{dailyBrief.focusArea}</p>
            
            <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.2)" }}>
              <p style={{ fontSize: "0.95rem", opacity: 0.95 }}>💡 <strong>Today's Tip:</strong> {dailyBrief.todaysTip}</p>
              
              {dailyBrief.upcomingItems.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <p style={{ fontSize: "0.9rem", opacity: 0.85, marginBottom: "0.5rem" }}>Quick focus items:</p>
                  <ul style={{ marginLeft: "1.5rem", fontSize: "0.9rem", opacity: 0.9 }}>
                    {dailyBrief.upcomingItems.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: "0.3rem" }}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Profile Overview */}
        <section className="card profile-overview">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <p className="eyebrow">{profile.role?.replaceAll("_", " ").toUpperCase()}</p>
              <h2>Welcome back, {profile.businessName} 👋</h2>
              {profile.industry && <p style={{ fontSize: "0.95rem", color: "#666" }}>Industry: {profile.industry}</p>}
            </div>
            <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "8px" }}>
              <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.5rem" }}>Focus Areas</p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {profile.painPoints.map(point => (
                  <span key={point} style={{
                    background: "#dbeafe",
                    color: "#1e40af",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "999px",
                    fontSize: "0.8rem",
                    fontWeight: "500"
                  }}>
                    {point.replaceAll("_", " ")}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* High Priority Suggestions */}
        {highPrioritySuggestions.length > 0 && (
          <section className="card">
            <p className="eyebrow" style={{ color: "#dc2626" }}>⚡ RECOMMENDED FOR YOU</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
              {highPrioritySuggestions.map(suggestion => (
                <SuggestionCard 
                  key={suggestion.id} 
                  suggestion={suggestion} 
                  onDismiss={dismissSuggestion}
                />
              ))}
            </div>
          </section>
        )}

        {/* Category Filter */}
        {categories.length > 1 && (
          <section className="card">
            <p className="eyebrow">BROWSE BY CATEGORY</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: "0.5rem 1rem",
                    border: activeCategory === cat ? "2px solid #2563eb" : "1px solid #e5e7eb",
                    background: activeCategory === cat ? "#eff6ff" : "#fff",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: activeCategory === cat ? "600" : "500",
                    color: activeCategory === cat ? "#1e40af" : "#6b7280",
                    transition: "all 0.2s"
                  }}
                >
                  {cat === "all" ? "All Suggestions" : cat.replaceAll("_", " ").charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Other Suggestions */}
        {otherSuggestions.length > 0 && (
          <section className="card">
            <p className="eyebrow">MORE WAYS TO GET AHEAD</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
              {otherSuggestions.map(suggestion => (
                <SuggestionCard 
                  key={suggestion.id} 
                  suggestion={suggestion} 
                  onDismiss={dismissSuggestion}
                  compact={true}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recent Assistant Work */}
        {recentOutputs.length > 0 && (
          <section className="card">
            <p className="eyebrow">📋 RECENT ASSISTANT WORK</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
              {recentOutputs.map(output => (
                <Link 
                  key={output.id}
                  href={`/draft/${output.id}`}
                  style={{
                    display: "block",
                    padding: "1rem",
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    textDecoration: "none",
                    color: "#111827",
                    transition: "all 0.2s",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                    e.currentTarget.style.borderColor = "#2563eb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "1.25rem" }}>
                      {output.type === "quote" && "💰"}
                      {output.type === "materials" && "📦"}
                      {output.type === "email" && "📧"}
                      {output.type === "task" && "✓"}
                      {output.type === "note" && "📝"}
                    </span>
                    <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "600" }}>{output.title}</h4>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}>
                    {new Date(output.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <section className="card">
            <p className="eyebrow">🎯 PENDING TASKS ({pendingTasks.length})</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
              {pendingTasks.slice(0, 5).map(task => (
                <div
                  key={task.id}
                  style={{
                    padding: "1rem",
                    background: "#f3f4f6",
                    border: `2px solid ${task.priority === "high" ? "#dc2626" : task.priority === "medium" ? "#f59e0b" : "#10b981"}`,
                    borderRadius: "8px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "1rem" }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "0.95rem", fontWeight: "600" }}>
                        {task.title}
                      </h4>
                      {task.dueDate && (
                        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#6b7280" }}>
                          Due: {task.dueDate}
                        </p>
                      )}
                    </div>
                    <span style={{
                      padding: "0.25rem 0.75rem",
                      background: task.priority === "high" ? "#fee2e2" : task.priority === "medium" ? "#fef3c7" : "#d1fae5",
                      color: task.priority === "high" ? "#991b1b" : task.priority === "medium" ? "#92400e" : "#065f46",
                      borderRadius: "999px",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      whiteSpace: "nowrap"
                    }}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Activity Feed */}
        {activityFeed.length > 0 && (
          <section className="card">
            <p className="eyebrow">📊 ACTIVITY FEED</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              {activityFeed.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    paddingBottom: idx !== activityFeed.length - 1 ? "1rem" : "0",
                    borderBottom: idx !== activityFeed.length - 1 ? "1px solid #e5e7eb" : "none"
                  }}
                >
                  <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.9rem", fontWeight: "500", color: "#111827" }}>
                    {item.type === "draft_created" && "📝"} 
                    {item.type === "chat" && "💬"}
                    {item.type === "task_created" && "✓"}
                    {item.type === "quote_sent" && "💼"}
                    {item.type === "materials_ordered" && "📦"}
                    {" "}{item.title}
                  </p>
                  <p style={{ margin: "0", fontSize: "0.8rem", color: "#6b7280" }}>
                    {new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {filteredSuggestions.length === 0 && (
          <section className="card" style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ fontSize: "1.1rem", color: "#6b7280" }}>No suggestions in this category right now.</p>
            <p style={{ fontSize: "0.95rem", color: "#9ca3af", marginTop: "0.5rem" }}>
              You're all caught up! Keep working on your goals. 🎯
            </p>
          </section>
        )}
      </div>

      <style jsx>{`
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

        .briefing-card {
          padding: 2rem;
        }

        .profile-overview {
          background: linear-gradient(to bottom, #f9fafb, white);
        }

        .eyebrow {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #9ca3af;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
        }

        h1, h2 {
          margin: 0;
          line-height: 1.2;
        }

        h1 {
          font-size: 1.875rem;
        }

        h2 {
          font-size: 1.25rem;
        }

        .back {
          color: #6b7280;
          text-decoration: none;
          font-weight: 500;
          display: inline-block;
        }

        .back:hover {
          color: #111827;
        }

        .button {
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          cursor: pointer;
          font-weight: 500;
          text-decoration: none;
          display: inline-block;
          font-size: 0.9rem;
        }

        .button:hover {
          background: #1d4ed8;
        }

        .button.ghost {
          background: transparent;
          color: #6b7280;
          border: 1px solid #e5e7eb;
        }

        .button.ghost:hover {
          background: #f9fafb;
          color: #111827;
        }
      `}</style>
    </main>
  );
}

function SuggestionCard({ 
  suggestion, 
  onDismiss, 
  compact = false 
}: { 
  suggestion: DashboardSuggestion; 
  onDismiss: (id: string) => void;
  compact?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        padding: "1rem",
        background: "white",
        position: "relative",
        transition: "all 0.2s",
        cursor: "pointer",
        boxShadow: isHovered ? "0 4px 12px rgba(0,0,0,0.1)" : "none"
      }}
    >
      <button
        onClick={() => onDismiss(suggestion.id)}
        style={{
          position: "absolute",
          top: "0.75rem",
          right: "0.75rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "1.25rem",
          color: "#d1d5db",
          padding: "0.25rem",
        }}
        title="Dismiss this suggestion"
      >
        ✕
      </button>

      <div style={{ marginBottom: "0.75rem" }}>
        <span style={{ fontSize: "1.75rem", display: "inline-block" }}>{suggestion.icon}</span>
      </div>

      <h3 style={{ 
        fontSize: compact ? "0.95rem" : "1.1rem", 
        fontWeight: "600", 
        margin: "0 0 0.5rem",
        color: "#111827"
      }}>
        {suggestion.title}
      </h3>

      {!compact && (
        <p style={{ 
          fontSize: "0.9rem", 
          color: "#6b7280", 
          margin: "0 0 0.75rem",
          lineHeight: "1.5"
        }}>
          {suggestion.description}
        </p>
      )}

      {suggestion.tip && !compact && (
        <p style={{ 
          fontSize: "0.85rem", 
          color: "#059669", 
          background: "#ecfdf5",
          padding: "0.5rem 0.75rem",
          borderRadius: "6px",
          margin: "0.75rem 0",
          fontStyle: "italic"
        }}>
          {suggestion.tip}
        </p>
      )}

      <Link 
        href={suggestion.action}
        style={{
          display: "inline-block",
          marginTop: "0.75rem",
          color: "#2563eb",
          textDecoration: "none",
          fontWeight: "500",
          fontSize: "0.9rem"
        }}
      >
        {suggestion.actionLabel} →
      </Link>
    </div>
  );
}
