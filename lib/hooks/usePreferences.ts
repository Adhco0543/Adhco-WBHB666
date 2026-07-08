import { create } from 'zustand';
import { UserPreferences } from '@/lib/dashboardPreferences';

interface PreferencesStore {
  preferences: UserPreferences | null;
  hasCompletedQuestionnaire: boolean;
  isLoading: boolean;
  error: string | null;
  setPreferences: (prefs: UserPreferences) => Promise<void>;
  loadPreferences: () => Promise<void>;
  resetPreferences: () => void;
}

export const usePreferencesStore = create<PreferencesStore>((set, get) => ({
  preferences: null,
  hasCompletedQuestionnaire: false,
  isLoading: true,
  error: null,

  setPreferences: async (prefs: UserPreferences) => {
    try {
      set({ isLoading: true, error: null });

      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });

      if (!response.ok) throw new Error('Failed to save preferences');

      const data = await response.json();
      set({
        preferences: data.preferences,
        hasCompletedQuestionnaire: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
      throw error;
    }
  },

  loadPreferences: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await fetch('/api/preferences');

      if (!response.ok) {
        if (response.status === 404) {
          set({ hasCompletedQuestionnaire: false, isLoading: false });
          return;
        }
        throw new Error('Failed to load preferences');
      }

      const data = await response.json();
      set({
        preferences: data.preferences,
        hasCompletedQuestionnaire: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  },

  resetPreferences: () => {
    set({
      preferences: null,
      hasCompletedQuestionnaire: false,
      error: null,
    });
  },
}));

// Hook to use preferences in components
export function usePreferences() {
  const store = usePreferencesStore();

  return {
    preferences: store.preferences,
    hasCompletedQuestionnaire: store.hasCompletedQuestionnaire,
    isLoading: store.isLoading,
    error: store.error,
    setPreferences: store.setPreferences,
    loadPreferences: store.loadPreferences,
    resetPreferences: store.resetPreferences,
  };
}
