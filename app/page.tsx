import Link from "next/link";

export default function HomePage() {
  // Note: In a real app, you'd check localStorage on client side
  return (
    <main className="page">
      <div className="card">
        <h1>Adaptive Business Setup</h1>
        <p>
          Configure your workspace in minutes. Answer a few questions and get a tailored dashboard
          for how your business works.
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link className="button" href="/onboarding">
            Start onboarding
          </Link>
          <Link className="button ghost" href="/dashboard">
            View Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
