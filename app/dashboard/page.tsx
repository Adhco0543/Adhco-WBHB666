"use client";

import { Suspense } from "react";
import AdvancedDashboardPage from "./advanced";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="page"><div className="card"><p>Loading dashboard...</p></div></div>}>
      <AdvancedDashboardPage />
    </Suspense>
  );
}
