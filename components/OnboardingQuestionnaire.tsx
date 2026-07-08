'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface UserPreferences {
  businessType: 'small_contractor' | 'mid_contractor' | 'large_contractor' | '';
  primaryFocus: string[]; // e.g., ['invoicing', 'time_tracking', 'profitability']
  teamSize: 'solo' | 'small_team' | 'medium_team' | 'large_team' | '';
  painPoints: string[];
  integrations: string[];
}

const QUESTIONS = [
  {
    id: 'businessType',
    question: 'What best describes your business?',
    options: [
      { value: 'small_contractor', label: '1-5 person operation' },
      { value: 'mid_contractor', label: '6-25 people' },
      { value: 'large_contractor', label: '25+ people' },
    ],
  },
  {
    id: 'primaryFocus',
    question: 'What are your top 3 priorities? (Select up to 3)',
    multiple: true,
    options: [
      { value: 'invoicing', label: 'Invoicing & Payments' },
      { value: 'time_tracking', label: 'Time Tracking' },
      { value: 'expense_tracking', label: 'Expense Tracking' },
      { value: 'profitability', label: 'Profitability Analysis' },
      { value: 'client_communication', label: 'Client Communication' },
      { value: 'safety', label: 'Safety & Compliance' },
      { value: 'team_management', label: 'Team Management' },
      { value: 'equipment', label: 'Equipment Tracking' },
    ],
  },
  {
    id: 'teamSize',
    question: 'How many people are on your team?',
    options: [
      { value: 'solo', label: 'Just me' },
      { value: 'small_team', label: '2-5 people' },
      { value: 'medium_team', label: '6-15 people' },
      { value: 'large_team', label: '15+ people' },
    ],
  },
  {
    id: 'painPoints',
    question: 'What are your biggest challenges? (Select all that apply)',
    multiple: true,
    options: [
      { value: 'cash_flow', label: 'Cash Flow Management' },
      { value: 'budget_overruns', label: 'Budget Overruns' },
      { value: 'team_coordination', label: 'Team Coordination' },
      { value: 'invoicing_delays', label: 'Invoicing Delays' },
      { value: 'compliance', label: 'Compliance & Safety' },
      { value: 'visibility', label: 'Project Visibility' },
    ],
  },
  {
    id: 'integrations',
    question: 'Which tools do you currently use?',
    multiple: true,
    options: [
      { value: 'quickbooks', label: 'QuickBooks' },
      { value: 'google_calendar', label: 'Google Calendar' },
      { value: 'slack', label: 'Slack' },
      { value: 'stripe', label: 'Stripe' },
      { value: 'zapier', label: 'Zapier' },
    ],
  },
];

export function OnboardingQuestionnaire({
  onComplete,
}: {
  onComplete: (preferences: UserPreferences) => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<UserPreferences>({
    businessType: '',
    primaryFocus: [],
    teamSize: '',
    painPoints: [],
    integrations: [],
  });
  const [completed, setCompleted] = useState(false);

  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  const handleSingleSelect = (value: string) => {
    const key = currentQuestion.id as keyof UserPreferences;
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleMultiSelect = (value: string) => {
    const key = currentQuestion.id as keyof UserPreferences;
    const current = preferences[key] as string[];
    
    if (current.includes(value)) {
      setPreferences(prev => ({
        ...prev,
        [key]: current.filter(v => v !== value),
      }));
    } else if (!currentQuestion.multiple || current.length < 3) {
      setPreferences(prev => ({
        ...prev,
        [key]: [...current, value],
      }));
    }
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
      onComplete(preferences);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    const key = currentQuestion.id as keyof UserPreferences;
    const value = preferences[key];
    
    if (currentQuestion.multiple) {
      return (value as string[]).length > 0;
    } else {
      return value !== '';
    }
  };

  if (completed) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-12 pb-12 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-6 text-green-600" />
          <h3 className="text-2xl font-bold mb-2">All Set!</h3>
          <p className="text-gray-600 mb-8">
            Your dashboard is now personalized just for you.
          </p>
          <div className="space-y-2 text-sm text-gray-700 max-w-md mx-auto">
            <p>
              <strong>Focus:</strong> {preferences.primaryFocus.join(', ')}
            </p>
            <p>
              <strong>Team Size:</strong> {preferences.teamSize}
            </p>
            <p>
              <strong>Business Type:</strong> {preferences.businessType}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              Question {currentStep + 1} of {QUESTIONS.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <CardTitle>{currentQuestion.question}</CardTitle>
        <CardDescription>
          {currentQuestion.multiple ? 'Select all that apply' : 'Choose one option'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-8">
          {currentQuestion.options.map(option => {
            const key = currentQuestion.id as keyof UserPreferences;
            const value = preferences[key];
            const isSelected =
              currentQuestion.multiple
                ? (value as string[]).includes(option.value)
                : value === option.value;

            return (
              <button
                key={option.value}
                onClick={() =>
                  currentQuestion.multiple
                    ? handleMultiSelect(option.value)
                    : handleSingleSelect(option.value)
                }
                className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="font-medium">{option.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button onClick={handleNext} disabled={!canProceed()}>
            {currentStep === QUESTIONS.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
