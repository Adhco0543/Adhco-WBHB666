import { initializeApp, getApps } from "firebase/app";
import { firebaseConfig } from "./firebaseConfig";

class FirebaseBackend {
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    if (!getApps().length) {
      initializeApp(firebaseConfig);
    }

    this.initialized = true;
    console.log("Firebase initialized");
  }

  isAvailable() {
    return this.initialized;
  }

  getCurrentUser() {
    return null; // placeholder for now
  }
}

export const firebaseBackend = new FirebaseBackend();