"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { OnboardingData } from "@/lib/onboarding";
import { loadOnboardingProfile, initFirebaseOnStartup } from "@/lib/firebase";

type AssistantStatus = "online" | "working" | "waiting" | "idle";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<OnboardingData | null>(null);
  const [assistantStatus, setAssistantStatus] = useState<AssistantStatus>("online");
  const [activeTask, setActiveTask] = useState(
    "Watching for opportunities and ready to help."
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Firebase on startup
    initFirebaseOnStartup();

    // Load profile from Firebase or localStorage
    loadOnboardingProfile()
      .then((result) => {
        if (result.profile) {
          setProfile(result.profile);
          console.log(`Profile loaded from ${result.source}`);
        } else if (result.error) {
          setLoadError(result.error);
        }
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

  const roleGreeting = useMemo(() => {
    if (!profile?.role) return "Welcome to your AI Assistant!";
    const greetings: Record<string, string> = {
      business_owner: "Ready to scale your business with AI support?",
      contractor: "Let's optimize your workflow and maximize efficiency.",
      stay_at_home_parent: "Organize your household and save time each day.",
      freelancer: "Manage your projects and clients like a pro.",
      student: "Stay organized and ace your goals.",
      other: "Let your AI assistant handle the details."
    };
    return greetings[profile.role] || "Welcome to your AI Assistant!";
  }, [profile]);

  const roleTips = useMemo(() => {
    if (!profile?.role) return [];
    const tips: Record<string, string[]> = {
      business_owner: [
        "Use 'Create Proposal' to generate professional quotes quickly",
        "Track all client communication in one place",
        "Set up automated follow-ups for prospects"
      ],
      contractor: [
        "Generate accurate job estimates in minutes",
        "Keep material lists organized by project",
        "Track job progress and expenses"
      ],
      stay_at_home_parent: [
        "Plan weekly meal prep to save time",
        "Keep family schedules synchronized",
        "Manage household budget and expenses"
      ],
      freelancer: [
        "Invoice clients automatically and on time",
        "Track project deadlines across clients",
        "Manage portfolio and testimonials"
      ],
      student: [
        "Track assignment deadlines and exam dates",
        "Organize study materials by subject",
        "Create study schedules that actually work"
      ],
      other: [
        "Start by telling your assistant what you need",
        "Use custom tasks for your unique workflow",
        "Build a routine that saves you time daily"
      ]
    };
    return tips[profile.role] || [];
  }, [profile]);

  const suggestions = useMemo(() => {
    if (!profile) return [];

    if (profile.role === "stay_at_home_parent") {
      return [
        "Create a daily routine schedule",
        "Plan meals for the week",
        "Set reminders for appointments"
      ];
    }

    if (profile.role === "contractor") {
      return [
        "Build a quote for a job",
        "Create a materials list",
        "Track job progress"
      ];
    }

    if (profile.role === "student") {
      return [
        "Create a study plan",
        "Track assignments",
        "Set exam reminders"
      ];
    }

    return ["Start chatting with your assistant"];
  }, [profile]);

  const startAssistantTask = (taskName: string) => {
    setAssistantStatus("working");
    setActiveTask(`Opening ${taskName.toLowerCase()}...`);

    router.push(`/chat?task=custom&name=${encodeURIComponent(taskName)}`);
  };

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
        <Link className="back" href="/">
          ← Home
        </Link>

        <div style={{ display: "flex", gap: "1rem" }}>
          <Link className="button" href="/tasks">
            📋 View Tasks
          </Link>
          <Link className="button ghost" href="/integrations">
            🔗 Integrations
          </Link>
        </div>

        <section className="card">
          <p className="eyebrow">{profile.role?.replaceAll("_", " ").toUpperCase()} • AI Assistant</p>
          <h1>Welcome back, {profile.businessName} 👋</h1>
          <p>{roleGreeting}</p>
          <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.5rem" }}>
            {profile.industry && `Focused on: ${profile.industry}`}
          </p>
        </section>

        <section className="dashboard-grid">
          <div className="card">
            <h2>Assistant Status</h2>
            <p>
              <strong>Status:</strong> {assistantStatus}
            </p>
            <p>{activeTask}</p>

            <div className="actions wrap" style={{ gap: "0.5rem" }}>
              {suggestions.map((task) => (
                <button
                  key={task}
                  type="button"
                  className="button"
                  onClick={() => startAssistantTask(task)}
                >
                  {task}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h2>Your Profile</h2>
            <ul>
              <li><strong>Role:</strong> {profile.role.replaceAll("_", " ")}</li>
              <li><strong>Industry:</strong> {profile.industry}</li>
              <li><strong>Team Size:</strong> {profile.teamSize.replace("_", "-")}</li>
              <li><strong>Work Mode:</strong> {profile.workMode.replaceAll("_", " ")}</li>
            </ul>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="card">
            <h2>💡 {profile.role === "business_owner" ? "Business Tips" : "Quick Tips"}</h2>
            <ul>
              {roleTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h2>Focus Areas</h2>
            <ul>
              {profile.painPoints.length > 0 ? (
                profile.painPoints.map((point) => (
                  <li key={point}>{point.replaceAll("_", " ")}</li>
                ))
              ) : (
                <li>No specific pain points selected</li>
              )}
            </ul>
          </div>
        </section>

        <section className="card">
          <h2>Assistant Setup</h2>
          <p>
            <strong>Current Focus Areas:</strong> Your assistant is paying attention to:{" "}
            {profile.painPoints.length > 0
              ? profile.painPoints.map((p) => p.replaceAll("_", " ")).join(", ")
              : "Not specified yet"}
          </p>

          <p style={{ marginTop: "1rem" }}>
            <strong>Tools:</strong>{" "}
            {profile.tools.length
              ? profile.tools.map((tool) => tool.replaceAll("_", " ")).join(", ")
              : "No tools selected yet"}
          </p>
        </section>
      </div>

      <style jsx>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }

        .wrap {
          flex-wrap: wrap;
        }

        .actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        button.button {
          border: none;
          cursor: pointer;
        }
      `}</style>
    </main>
  );
}