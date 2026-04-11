"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OnboardingData } from "@/lib/onboarding";

export default function DashboardPage() {
  const [profile, setProfile] = useState<OnboardingData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("onboarding_profile");
    if (stored) {
      setProfile(JSON.parse(stored));
    }
  }, []);

  if (!profile) {
    return (
      <main className="page">
        <div className="card">
          <h1>Dashboard</h1>
          <p>No onboarding profile found. Please complete the onboarding first.</p>
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
        <div className="card">
          <h1>Welcome, {profile.businessName}!</h1>
          <p>Here&apos;s your tailored dashboard based on your onboarding.</p>

          <section>
            <h2>Business Overview</h2>
            <ul>
              <li><strong>Industry:</strong> {profile.industry}</li>
              <li><strong>Team Size:</strong> {profile.teamSize.replace("_", "-")}</li>
              <li><strong>Revenue Model:</strong> {profile.revenueModel}</li>
              <li><strong>Work Mode:</strong> {profile.workMode.replace("_", " ")}</li>
            </ul>
          </section>

          <section>
            <h2>Pain Points</h2>
            <ul>
              {profile.painPoints.map((point) => (
                <li key={point}>{point.replaceAll("_", " ")}</li>
              ))}
            </ul>
            {profile.timeSavingFocus && (
              <p><strong>Time-saving focus:</strong> {profile.timeSavingFocus}</p>
            )}
          </section>

          <section>
            <h2>Tools</h2>
            <ul>
              {profile.tools.map((tool) => (
                <li key={tool}>{tool.replaceAll("_", " ")}</li>
              ))}
            </ul>
          </section>

          {Object.keys(profile.roleAnswers).length > 0 && (
            <section>
              <h2>Industry-Specific Answers</h2>
              <ul>
                {Object.entries(profile.roleAnswers).map(([key, value]) => (
                  <li key={key}><strong>{key}:</strong> {value}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}