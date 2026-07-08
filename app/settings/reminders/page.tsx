'use client';

import { Bell } from 'lucide-react';
import { RemindersSettings } from '@/components/RemindersSettings';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useEffect, useState } from 'react';

export default function RemindersPage() {
  const [userId, setUserId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Get current user ID from auth
    // This would be fetched from your auth system
    const user = localStorage.getItem('user_id');
    if (user) setUserId(user);
  }, []);

  const handleSave = async (settings: any) => {
    try {
      // Save to backend
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminders: settings }),
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving reminders:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
          </div>
          <p className="text-gray-600">Manage your reminders and notification preferences</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            ✓ Preferences saved successfully!
          </div>
        )}

        <ErrorBoundary>
          <RemindersSettings userId={userId} onSave={handleSave} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
