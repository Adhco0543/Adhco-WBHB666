'use client';

import { useEffect } from 'react';
import { Suspense } from 'react';
import ModernDashboard from './modern';
import { OnboardingQuestionnaire } from '@/components/OnboardingQuestionnaire';
import { usePreferences } from '@/lib/hooks/usePreferences';
import { UserPreferences } from '@/lib/dashboardPreferences';

function DashboardContent() {
  const {
    preferences,
    hasCompletedQuestionnaire,
    isLoading,
    setPreferences,
    loadPreferences,
  } = usePreferences();

  useEffect(() => {
    loadPreferences();
  }, []);

  const handleQuestionnaireComplete = async (prefs: UserPreferences) => {
    try {
      await setPreferences(prefs);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  // Show questionnaire if not completed
  if (!hasCompletedQuestionnaire) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: '2rem',
          backgroundColor: '#f5f5f5',
        }}
      >
        <OnboardingQuestionnaire onComplete={handleQuestionnaireComplete} />
      </div>
    );
  }

  // Show personalized dashboard
  return <ModernDashboard preferences={preferences} />;
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <div>Loading...</div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
