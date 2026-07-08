"use client";

import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem("user_preferences")
      ? JSON.parse(localStorage.getItem("user_preferences")!).theme
      : "auto";

    // Determine which theme to apply
    let themeToApply = savedTheme;
    if (savedTheme === "auto") {
      themeToApply = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    // Apply theme to html element
    const htmlElement = document.documentElement;
    if (themeToApply === "dark") {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }

    // Listen for storage changes (when preferences are updated in another tab/window)
    const handleStorageChange = () => {
      const updatedPreferences = localStorage.getItem("user_preferences");
      if (updatedPreferences) {
        const prefs = JSON.parse(updatedPreferences);
        const newTheme = prefs.theme || "auto";
        let newThemeToApply = newTheme;
        if (newTheme === "auto") {
          newThemeToApply = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        if (newThemeToApply === "dark") {
          htmlElement.classList.add("dark");
        } else {
          htmlElement.classList.remove("dark");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return <>{children}</>;
}
