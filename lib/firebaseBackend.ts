// Firebase integration is not yet active.
// Replace this stub with real Firebase calls when the firebase package is added.

class FirebaseBackend {
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    this.initialized = true;
    console.log("Firebase initialized (stub)");
  }

  isAvailable() {
    return this.initialized;
  }

  getCurrentUser() {
    return null; // placeholder for now
  }
}

export const firebaseBackend = new FirebaseBackend();