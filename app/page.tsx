import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page">
      <div className="card">
        <p className="eyebrow">Business AI Assistant</p>

        <h1>Build your AI-powered business workspace</h1>

        <p>
          Configure your workspace in minutes. Answer a few questions and get a
          tailored dashboard for how your business works.
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link className="button" href="/onboarding">
            Start onboarding
          </Link>

          <Link className="button ghost" href="/dashboard">
            Go to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}