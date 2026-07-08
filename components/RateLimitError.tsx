'use client';

import { AlertCircle, Clock } from 'lucide-react';
import { useState } from 'react';

interface RateLimitErrorProps {
  remaining: number;
  resetTime: number;
  limit: number;
  window: string;
  onRetry?: () => void;
}

export function RateLimitError({
  remaining,
  resetTime,
  limit,
  window,
  onRetry,
}: RateLimitErrorProps) {
  const [isVisible, setIsVisible] = useState(true);
  const secondsUntilReset = Math.ceil((resetTime - Date.now()) / 1000);
  const minutesUntilReset = Math.ceil(secondsUntilReset / 60);

  if (!isVisible) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Rate Limit Exceeded</h3>
            <p className="text-sm text-red-700 mt-1">
              You've reached the limit of {limit} requests per {window}.
              Please wait before trying again.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-red-600 hover:text-red-900 text-lg"
        >
          ×
        </button>
      </div>

      <div className="bg-red-100 rounded px-3 py-2 text-sm text-red-800 flex items-center gap-2">
        <Clock size={16} />
        <span>
          Reset available in{' '}
          <strong>
            {minutesUntilReset} minute{minutesUntilReset !== 1 ? 's' : ''}
          </strong>
        </span>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          disabled={secondsUntilReset > 0}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {secondsUntilReset > 0 ? `Retry in ${secondsUntilReset}s` : 'Retry Now'}
        </button>
      )}
    </div>
  );
}

/**
 * Modal version for more prominent display
 */
export function RateLimitModal({
  isOpen,
  remaining,
  resetTime,
  limit,
  window,
  onClose,
}: RateLimitErrorProps & { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  const secondsUntilReset = Math.ceil((resetTime - Date.now()) / 1000);
  const minutesUntilReset = Math.ceil(secondsUntilReset / 60);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-sm mx-4 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-red-600" size={28} />
          <h2 className="text-xl font-bold text-gray-900">Rate Limit Exceeded</h2>
        </div>

        <p className="text-gray-600">
          You've made too many requests in a short time. Please wait before trying again.
        </p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
          <div className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{limit}</span> requests allowed per {window}
          </div>
          <div className="text-sm text-gray-600">
            Next attempt available in{' '}
            <span className="font-bold text-red-600">
              {minutesUntilReset} minute{minutesUntilReset !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Consider reducing the number of requests or waiting a bit longer between actions.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Understood
        </button>
      </div>
    </div>
  );
}
