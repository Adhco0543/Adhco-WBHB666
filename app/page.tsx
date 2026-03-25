import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page">
      <div className="card">
        <h1>Adaptive Business Setup</h1>
        <p>
          Configure your workspace in minutes. Answer a few questions and get a tailored dashboard
          for how your business works.
        </p>
        <Link className="button" href="/onboarding">
          Start onboarding
        </Link>
      </div>
    </main>
  );
}
