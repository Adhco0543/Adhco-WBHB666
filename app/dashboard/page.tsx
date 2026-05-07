"use client";

import { Suspense } from "react";
import ModernDashboard from "./modern";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <div>Loading...</div>
        </div>
      }
    >
      <ModernDashboard />
    </Suspense>
  );
}
