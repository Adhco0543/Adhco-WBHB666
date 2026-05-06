"use client";

import { Suspense } from "react";
import CustomizationPage from "./customization";

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="page"><div className="card"><p>Loading settings...</p></div></div>}>
      <CustomizationPage />
    </Suspense>
  );
}
