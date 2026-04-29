import Link from "next/link";

export default function HomePage() {
<<<<<<< HEAD
  // Note: In a real app, you'd check localStorage on client side
=======
>>>>>>> f1ee28d4de6942316101091dbedc9f25d2af4638
  return (
    <main className="page">
      <div className="card">
        <h1>Adaptive Business Setup</h1>
        <p>
          Configure your workspace in minutes. Answer a few questions and get a tailored dashboard
          for how your business works.
        </p>
<<<<<<< HEAD
        <div style={{ display: "flex", gap: "12px" }}>
          <Link className="button" href="/onboarding">
            Start onboarding
          </Link>
          <Link className="button ghost" href="/dashboard">
            View Dashboard
          </Link>
        </div>
=======
        <Link className="button" href="/onboarding">
          Start onboarding
        </Link>
>>>>>>> f1ee28d4de6942316101091dbedc9f25d2af4638
      </div>
    </main>
  );
}
