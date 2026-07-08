'use client';

import { create } from 'zustand';
import { useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft, X, SkipForward } from 'lucide-react';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    onClick: () => void;
  };
  skip?: boolean;
}

interface TourState {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  startTour: (steps: TourStep[]) => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  skipStep: () => void;
}

export const useTourStore = create<TourState>((set, get) => ({
  isActive: false,
  currentStep: 0,
  steps: [],

  startTour: (steps: TourStep[]) => {
    set({ isActive: true, steps, currentStep: 0 });
  },

  endTour: () => {
    set({ isActive: false, steps: [], currentStep: 0 });
  },

  nextStep: () => {
    const { currentStep, steps } = get();
    if (currentStep < steps.length - 1) {
      set({ currentStep: currentStep + 1 });
    } else {
      get().endTour();
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  goToStep: (index: number) => {
    const { steps } = get();
    if (index >= 0 && index < steps.length) {
      set({ currentStep: index });
    }
  },

  skipStep: () => {
    const { steps } = get();
    const nextSkippable = steps
      .slice(get().currentStep + 1)
      .findIndex(step => !step.skip);
    if (nextSkippable >= 0) {
      get().goToStep(get().currentStep + nextSkippable + 1);
    } else {
      get().endTour();
    }
  },
}));

export function TourOverlay() {
  const { isActive, currentStep, steps, endTour, nextStep, prevStep, skipStep } = useTourStore();
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isActive || steps.length === 0) return;

    const step = steps[currentStep];
    const element = document.querySelector(step.target);

    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightRect(rect);

      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isActive, currentStep, steps]);

  if (!isActive || steps.length === 0) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={endTour} />

      {/* Highlight */}
      {highlightRect && (
        <div
          className="fixed border-2 border-blue-500 shadow-lg z-40 pointer-events-none"
          style={{
            top: highlightRect.top - 4,
            left: highlightRect.left - 4,
            width: highlightRect.width + 8,
            height: highlightRect.height + 8,
            borderRadius: '8px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3)',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed bg-white rounded-lg shadow-2xl p-6 max-w-sm z-50 border border-gray-200"
        style={{
          top: step.position === 'top' && highlightRect ? highlightRect.top - 220 : 
               step.position === 'bottom' && highlightRect ? highlightRect.bottom + 20 :
               '50%',
          left: step.position === 'left' && highlightRect ? highlightRect.left - 420 :
                step.position === 'right' && highlightRect ? highlightRect.right + 20 :
                '50%',
          transform: step.position === 'center' ? 'translate(-50%, -50%)' : 
                     step.position === 'left' || step.position === 'right' ? 'translateY(-50%)' :
                     'none',
        }}
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
          <button
            onClick={endTour}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-700 mb-4">{step.description}</p>

        {step.action && (
          <button
            onClick={step.action.onClick}
            className="w-full bg-blue-600 text-white py-2 rounded mb-4 hover:bg-blue-700 transition font-medium"
          >
            {step.action.label}
          </button>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </div>

          <div className="flex gap-2">
            {step.skip && (
              <button
                onClick={skipStep}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
              >
                <SkipForward size={16} />
              </button>
            )}

            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 transition"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={nextStep}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-1"
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex gap-1 mt-4 justify-center">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => useTourStore.setState({ currentStep: index })}
              className={`w-2 h-2 rounded-full transition ${
                index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/**
 * Pre-built tour guides for common workflows
 */
export const TOUR_GUIDES = {
  ONBOARDING: [
    {
      id: 'welcome',
      title: 'Welcome to ADHCO!',
      description: 'Let\'s take a quick tour to get you started with your construction management platform.',
      target: 'body',
      position: 'center',
      skip: true,
    },
    {
      id: 'dashboard',
      title: 'Your Dashboard',
      description: 'Here\'s your personalized dashboard showing key metrics and recent activity.',
      target: '[data-tour="dashboard"]',
      position: 'bottom',
    },
    {
      id: 'invoices',
      title: 'Create Invoices',
      description: 'Manage all your project invoices in one place.',
      target: '[data-tour="invoices-menu"]',
      position: 'right',
      action: {
        label: 'Create Invoice',
        onClick: () => window.location.href = '/invoices',
      },
    },
    {
      id: 'projects',
      title: 'Track Projects',
      description: 'Monitor project progress, timelines, and profitability.',
      target: '[data-tour="projects-menu"]',
      position: 'right',
    },
    {
      id: 'time-tracking',
      title: 'Log Time',
      description: 'Track billable and non-billable hours for your team.',
      target: '[data-tour="time-menu"]',
      position: 'right',
    },
    {
      id: 'expenses',
      title: 'Record Expenses',
      description: 'Capture project costs and mark them as billable if needed.',
      target: '[data-tour="expenses-menu"]',
      position: 'right',
    },
    {
      id: 'settings',
      title: 'Customize Your Workspace',
      description: 'Update your preferences and team settings.',
      target: '[data-tour="settings-menu"]',
      position: 'left',
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Start by creating your first project or invoice.',
      target: 'body',
      position: 'center',
    },
  ] as TourStep[],

  INVOICE_WORKFLOW: [
    {
      id: 'invoice-list',
      title: 'Invoice Manager',
      description: 'View all your invoices with status and payment tracking.',
      target: '[data-tour="invoice-list"]',
      position: 'bottom',
    },
    {
      id: 'new-invoice',
      title: 'Create Invoice',
      description: 'Click here to create a new invoice for your project.',
      target: '[data-tour="new-invoice-btn"]',
      position: 'bottom',
      action: {
        label: 'Create New',
        onClick: () => window.location.href = '/invoices/new',
      },
    },
    {
      id: 'invoice-form',
      title: 'Invoice Details',
      description: 'Fill in project details, line items, and terms.',
      target: '[data-tour="invoice-form"]',
      position: 'top',
    },
    {
      id: 'line-items',
      title: 'Add Line Items',
      description: 'Add materials, labor, and other charges.',
      target: '[data-tour="line-items"]',
      position: 'bottom',
    },
    {
      id: 'send-invoice',
      title: 'Send Invoice',
      description: 'Email your invoice directly to the client.',
      target: '[data-tour="send-btn"]',
      position: 'top',
    },
  ] as TourStep[],

  PROJECT_WORKFLOW: [
    {
      id: 'project-list',
      title: 'Projects',
      description: 'View all active and completed projects.',
      target: '[data-tour="project-list"]',
      position: 'bottom',
    },
    {
      id: 'project-details',
      title: 'Project Overview',
      description: 'See budget, progress, and key metrics.',
      target: '[data-tour="project-header"]',
      position: 'bottom',
    },
    {
      id: 'team-members',
      title: 'Team Members',
      description: 'View and manage your project team.',
      target: '[data-tour="team-section"]',
      position: 'left',
    },
    {
      id: 'budget-tracker',
      title: 'Budget Tracking',
      description: 'Monitor spending vs. budget in real-time.',
      target: '[data-tour="budget-chart"]',
      position: 'top',
    },
  ] as TourStep[],
};

/**
 * Hook to manage tour
 */
export function useTour() {
  const store = useTourStore();

  return {
    isActive: store.isActive,
    currentStep: store.currentStep,
    totalSteps: store.steps.length,
    startTour: store.startTour,
    endTour: store.endTour,
    nextStep: store.nextStep,
    prevStep: store.prevStep,
    skipStep: store.skipStep,
  };
}
