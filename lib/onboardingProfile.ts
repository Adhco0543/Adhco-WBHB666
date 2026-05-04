import type { OnboardingData } from "./onboarding";

export function getOnboardingProfile(): OnboardingData | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem("onboarding_profile");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}