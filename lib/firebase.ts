"use client";

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, collection, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig";
import type { OnboardingData } from "./onboarding";

// Initialize Firebase
let app: FirebaseApp | undefined;
let db: Firestore | undefined;

export function initializeFirebase() {
  if (typeof window === "undefined") return;
  
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  db = getFirestore(app);
  return { app, db };
}

/**
 * Get Firestore instance
 */
export function getDb() {
  if (!db && typeof window !== "undefined") {
    initializeFirebase();
  }
  return db;
}

/**
 * Generate a unique profile ID
 * For now, use localStorage device ID or generate a new one
 */
export function getProfileId(): string {
  if (typeof window === "undefined") return "";
  
  let profileId = localStorage.getItem("_profile_id");
  if (!profileId) {
    profileId = `profile_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem("_profile_id", profileId);
  }
  return profileId;
}

/**
 * Save onboarding profile to Firestore
 * Falls back to localStorage if Firestore is unavailable
 */
export async function saveOnboardingProfile(
  profile: OnboardingData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Always save to localStorage first as a fallback
    localStorage.setItem("onboarding_profile", JSON.stringify(profile));
    localStorage.setItem("onboarding_profile_timestamp", new Date().toISOString());

    // Try to save to Firestore
    try {
      const db = getDb();
      if (!db) {
        console.warn("Firestore not available, using localStorage only");
        return { success: true };
      }

      const profileId = getProfileId();
      const profilesRef = collection(db, "profiles");
      
      await setDoc(doc(profilesRef, profileId), {
        ...profile,
        updatedAt: serverTimestamp(),
        savedLocally: true
      });

      console.log("Profile saved to Firestore:", profileId);
      return { success: true };
    } catch (firestoreError) {
      console.warn("Failed to save to Firestore, but localStorage save succeeded", firestoreError);
      // Don't fail completely if Firestore is down - localStorage backup is working
      return { success: true };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to save profile";
    console.error("Error saving profile:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Load onboarding profile from Firestore or localStorage
 * Tries Firestore first, falls back to localStorage
 */
export async function loadOnboardingProfile(): Promise<{
  profile: OnboardingData | null;
  source: "firestore" | "localStorage" | "none";
  error?: string;
}> {
  try {
    const profileId = getProfileId();

    // Try Firestore first
    try {
      const db = getDb();
      if (db) {
        const profilesRef = collection(db, "profiles");
        const profileDoc = await getDoc(doc(profilesRef, profileId));

        if (profileDoc.exists()) {
          const data = profileDoc.data();
          console.log("Profile loaded from Firestore:", profileId);
          return {
            profile: data as OnboardingData,
            source: "firestore"
          };
        }
      }
    } catch (firestoreError) {
      console.warn("Failed to load from Firestore, trying localStorage", firestoreError);
    }

    // Fall back to localStorage
    const stored = localStorage.getItem("onboarding_profile");
    if (stored) {
      try {
        const profile = JSON.parse(stored);
        console.log("Profile loaded from localStorage");
        return {
          profile,
          source: "localStorage"
        };
      } catch (parseError) {
        const errorMessage = parseError instanceof Error ? parseError.message : "Failed to parse profile";
        console.error("Error parsing localStorage profile:", errorMessage);
        return {
          profile: null,
          source: "none",
          error: errorMessage
        };
      }
    }

    return {
      profile: null,
      source: "none"
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error loading profile:", errorMessage);
    return {
      profile: null,
      source: "none",
      error: errorMessage
    };
  }
}

/**
 * Check if Firebase is configured
 */
export function isFirebaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  );
}

/**
 * Initialize Firebase on app startup
 */
export function initFirebaseOnStartup() {
  if (typeof window === "undefined") return;
  if (!isFirebaseConfigured()) {
    console.warn("Firebase not configured. Set NEXT_PUBLIC_FIREBASE_* env vars");
    return;
  }
  initializeFirebase();
}
