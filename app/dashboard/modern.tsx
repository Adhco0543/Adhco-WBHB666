"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import type { OnboardingData } from "@/lib/onboarding";
import { generateSmartSuggestions, generateDailyBrief, type DashboardSuggestion, type DailyBrief } from "@/lib/dashboardSuggestions";
import { loadOnboardingProfile, initFirebaseOnStartup } from "@/lib/firebase";
import { getDashboardSummary, getStats, getFollowUpSuggestions, getSmartSuggestions, markTaskComplete } from "@/lib/assistantActions";
import type { SavedOutput, Task, ActivityFeedItem } from "@/lib/assistantTypes";
import { Sidebar, TopBar, MainLayout } from "@/components/ui/Layout";
import { Card, Widget, Button, ActivityItem, Badge } from "@/components/ui/Components";
import { Grid, Section, TwoPanelLayout, Stat, EmptyState, CompactCard } from "@/components/ui/Layouts";
import { colors, spacing } from "@/lib/designSystem";

interface SidebarItem {
  href: string;
  label: string;
  icon: string;
  active?: boolean;
}

export default function ModernDashboard() {
  const [profile, setProfile] = useState<OnboardingData | null>(null);
  const [suggestions, setSuggestions] = useState<DashboardSuggestion[]>([]);
  const [dailyBrief, setDailyBrief] = useState<DailyBrief | null>(null);
  const [recentOutputs, setRecentOutputs] = useState<SavedOutput[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    initFirebaseOnStartup();

    loadOnboardingProfile()
      .then((result) => {
        if (result.profile) {
          setProfile(result.profile);
          setSuggestions(generateSmartSuggestions(result.profile));
          setDailyBrief(generateDailyBrief(result.profile));

          const summary = getDashboardSummary();
          setRecentOutputs(summary.recentOutputs);
          setPendingTasks(summary.pendingTasks);
          setActivityFeed(summary.activityFeed);

          setStats(getStats());
        } else if (result.error) {
          setLoadError(result.error);
        }
      })
      .catch((error) => {
        setLoadError(error instanceof Error ? error.message : "Failed to load profile");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const sidebarItems: SidebarItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: "📊", active: true },
    { href: "/chat", label: "Chat", icon: "💬" },
    { href: "/outputs", label: "Outputs", icon: "📂" },
    { href: "/quotes", label: "Quotes", icon: "💰" },
    { href: "/tasks", label: "Tasks", icon: "✓" },
    { href: "/materials", label: "Materials", icon: "📦" },
    { href: "/integrations", label: "Integrations", icon: "🔗" },
  ];

  const topBarActions = (
    <div style={{ display: "flex", gap: spacing[3] }}>
      <Button variant="secondary" size="sm">
        🔔
      </Button>
      <Button variant="secondary" size="sm">
        👤
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: spacing[4] }}>⏳</div>
          <h2 style={{ color: colors.neutral[600] }}>Loading your dashboard...</h2>
        </div>
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Card variant="elevated">
          <h2 style={{ color: colors.error }}>Unable to Load Dashboard</h2>
          <p style={{ color: colors.neutral[600], marginTop: spacing[2] }}>
            {loadError || "No profile found. Please complete onboarding."}
          </p>
          <Link href="/onboarding" style={{ marginTop: spacing[4], display: "inline-block" }}>
            <Button>Start Onboarding</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const highPrioritySuggestions = suggestions.filter(s => s.priority === "high").slice(0, 3);

  return (
    <MainLayout
      sidebar={<Sidebar items={sidebarItems} userRole={profile.role} />}
      header={<TopBar title="Dashboard" subtitle={`Welcome back, ${profile.businessName}!`} actions={topBarActions} />}
    >
      {/* Daily Brief */}
      {dailyBrief && (
        <div
          style={{
            background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.accent.purple} 100%)`,
            borderRadius: "12px",
            padding: spacing[6],
            color: colors.white,
            marginBottom: spacing[8],
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: 0, right: 0, fontSize: "6rem", opacity: 0.1 }}>🤖</div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.9, textTransform: "uppercase", fontWeight: 600 }}>
              Daily Brief
            </p>
            <h1 style={{ margin: `${spacing[2]} 0 0 0`, fontSize: "2rem", fontWeight: 700 }}>
              {dailyBrief.greeting}
            </h1>
            <p style={{ margin: `${spacing[2]} 0 0 0`, fontSize: "1.1rem", opacity: 0.95 }}>
              {dailyBrief.focusArea}
            </p>

            <div style={{ marginTop: spacing[4], display: "flex", gap: spacing[8], flexWrap: "wrap" }}>
              <div>
                <p style={{ margin: 0, opacity: 0.8, fontSize: "0.9rem" }}>💡 Today's Tip</p>
                <p style={{ margin: `${spacing[1]} 0 0 0`, fontWeight: 600 }}>{dailyBrief.todaysTip}</p>
              </div>
              {dailyBrief.upcomingItems.length > 0 && (
                <div>
                  <p style={{ margin: 0, opacity: 0.8, fontSize: "0.9rem" }}>📋 Quick Focus</p>
                  <ul style={{ margin: `${spacing[1]} 0 0 0`, paddingLeft: spacing[4], fontSize: "0.95rem" }}>
                    {dailyBrief.upcomingItems.slice(0, 2).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Two Column Layout */}
      <TwoPanelLayout
        left={
          <>
            {/* Quick Stats */}
            <Section title="Quick Overview">
              <Grid columns={3}>
                <CompactCard icon="📂" label="Total Outputs" value={recentOutputs.length} />
                <CompactCard icon="✓" label="Pending Tasks" value={pendingTasks.filter(t => t.status !== "completed").length} />
                <CompactCard icon="🔥" label="Streak" value="7 days" />
              </Grid>
            </Section>

            {/* Recent Outputs */}
            <Section
              title="Recent Outputs"
              subtitle="Your latest saved materials"
              action={<Link href="/outputs"><Button variant="ghost" size="sm">View All</Button></Link>}
            >
              {recentOutputs.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: spacing[3] }}>
                  {recentOutputs.slice(0, 3).map((output, idx) => (
                    <Link key={idx} href={`/outputs/${output.id}`} style={{ textDecoration: "none" }}>
                      <Card hover variant="default">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                          <div>
                            <h4 style={{ margin: 0, color: colors.neutral[900], marginBottom: spacing[1] }}>
                              {output.title}
                            </h4>
                            <p style={{ margin: 0, fontSize: "0.85rem", color: colors.neutral[500] }}>
                              {output.content?.slice(0, 80)}...
                            </p>
                          </div>
                          <Badge variant="default">{output.type}</Badge>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState icon="📭" title="No outputs yet" description="Your saved materials will appear here" />
              )}
            </Section>

            {/* Pending Tasks */}
            <Section
              title="Pending Tasks"
              subtitle="What needs your attention"
              action={<Link href="/tasks"><Button variant="ghost" size="sm">View All</Button></Link>}
            >
              {pendingTasks.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: spacing[2] }}>
                  {pendingTasks.slice(0, 4).map((task, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: spacing[4],
                        backgroundColor: colors.white,
                        border: `1px solid ${colors.neutral[200]}`,
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: spacing[3],
                        transition: "all 150ms ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.neutral[50];
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = colors.white;
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={task.status === "completed"}
                        onChange={() => markTaskComplete(task.id)}
                        style={{ cursor: "pointer", width: "20px", height: "20px" }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 600, color: colors.neutral[900] }}>
                          {task.title}
                        </p>
                        <p style={{ margin: `${spacing[1]} 0 0 0`, fontSize: "0.85rem", color: colors.neutral[500] }}>
                          {task.description}
                        </p>
                      </div>
                      <Badge variant={task.priority === "high" ? "error" : "default"}>
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon="✨" title="All caught up!" description="No pending tasks" />
              )}
            </Section>
          </>
        }
        right={
          <>
            {/* AI Assistant Panel */}
            <Section title="Assistant">
              <Card variant="elevated">
                <div style={{ textAlign: "center", padding: spacing[4] }}>
                  <div style={{ fontSize: "3rem", marginBottom: spacing[2] }}>🤖</div>
                  <h3 style={{ margin: 0, color: colors.neutral[900] }}>JobSite Assistant</h3>
                  <p style={{ margin: `${spacing[2]} 0 0 0`, color: colors.neutral[500], fontSize: "0.9rem" }}>
                    Ready to help with quotes, scheduling, and more
                  </p>
                  <div style={{ marginTop: spacing[4], display: "flex", justifyContent: "center" }}>
                    <Link href="/chat">
                      <Button variant="primary" size="md">
                        Start Conversation
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>

              {/* AI Suggestions */}
              {highPrioritySuggestions.length > 0 && (
                <div style={{ marginTop: spacing[4] }}>
                  <h4 style={{ margin: 0, marginBottom: spacing[3], color: colors.neutral[900] }}>
                    AI Suggestions
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: spacing[2] }}>
                    {highPrioritySuggestions.map((suggestion, idx) => (
                      <Card key={idx} hover variant="outlined">
                        <div style={{ display: "flex", gap: spacing[2] }}>
                          <span style={{ fontSize: "1.25rem" }}>💡</span>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: 600, color: colors.neutral[900], fontSize: "0.9rem" }}>
                              {suggestion.title}
                            </p>
                            <p style={{ margin: `${spacing[1]} 0 0 0`, fontSize: "0.85rem", color: colors.neutral[600] }}>
                              {suggestion.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </Section>
            {/* Activity Feed */}
            <div style={{ marginTop: spacing[8] }}>
              <Section title="Recent Activity">
              <Card variant="default">
                <div style={{ maxHeight: "400px", overflow: "auto" }}>
                  {activityFeed.length > 0 ? (
                    activityFeed.slice(0, 5).map((item, idx) => {
                      const iconMap: Record<string, string> = {
                        chat: "💬",
                        draft_created: "📝",
                        task_created: "✓",
                        quote_sent: "📧",
                        materials_ordered: "📦",
                        email_sent: "✉️",
                        task_completed: "✅",
                      };
                      return (
                        <ActivityItem
                          key={idx}
                          timestamp={item.timestamp}
                          title={item.title}
                          description={item.description || ""}
                          icon={iconMap[item.type] || "📌"}
                          status="success"
                        />
                      );
                    })
                  ) : (
                    <div style={{ textAlign: "center", padding: spacing[6], color: colors.neutral[500] }}>
                      <p>No recent activity yet</p>
                    </div>
                  )}
                </div>
              </Card>
            </Section>
            </div>
          </>
        }
      />
    </MainLayout>
  );
}
