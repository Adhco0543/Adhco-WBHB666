'use client';

import { Bell, Mail, MessageSquare, AlertCircle } from 'lucide-react';
import { isValidEmail, isValidPhoneNumber } from '@/lib/reminders';
import { useState } from 'react';

interface RemindersSettingsProps {
  userId: string;
  onSave?: (settings: any) => void;
}

export function RemindersSettings({ userId, onSave }: RemindersSettingsProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reminderTypes, setReminderTypes] = useState({
    invoiceOverdue: { enabled: true, channels: ['email'] },
    invoiceDueSoon: { enabled: true, channels: ['email'] },
    budgetWarning: { enabled: true, channels: ['email', 'sms'] },
    paymentReceived: { enabled: true, channels: ['email'] },
    taskAssigned: { enabled: false, channels: ['email'] },
    dailyDigest: { enabled: false, channels: ['email'] },
  });

  const reminderDescriptions: Record<string, string> = {
    invoiceOverdue: 'When an invoice is overdue',
    invoiceDueSoon: 'When an invoice is due in 3 days',
    budgetWarning: 'When project budget reaches 80%',
    paymentReceived: 'When a payment is received',
    taskAssigned: 'When a task is assigned to you',
    dailyDigest: 'Daily summary of activities',
  };

  const toggleReminder = (type: string) => {
    setReminderTypes({
      ...reminderTypes,
      [type]: {
        ...reminderTypes[type as keyof typeof reminderTypes],
        enabled: !(reminderTypes[type as keyof typeof reminderTypes]?.enabled || false),
      },
    });
  };

  const toggleChannel = (type: string, channel: 'email' | 'sms') => {
    setReminderTypes({
      ...reminderTypes,
      [type]: {
        ...reminderTypes[type as keyof typeof reminderTypes],
        channels: (reminderTypes[type as keyof typeof reminderTypes]?.channels || []).includes(channel)
          ? (reminderTypes[type as keyof typeof reminderTypes]?.channels || []).filter((c: any) => c !== channel)
          : [...(reminderTypes[type as keyof typeof reminderTypes]?.channels || []), channel],
      },
    });
  };

  const handleSave = () => {
    const errors = [];

    if (!email || !isValidEmail(email)) {
      errors.push('Valid email is required');
    }

    if (
      Object.values(reminderTypes).some((r: any) => r.channels?.includes('sms')) &&
      (!phone || !isValidPhoneNumber(phone))
    ) {
      errors.push('Valid phone number is required for SMS reminders');
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    onSave?.({
      email,
      phone,
      reminderTypes,
    });
  };

  return (
    <div className="max-w-2xl">
      {/* Contact Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail size={16} className="inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {email && !isValidEmail(email) && <p className="text-red-600 text-sm mt-1">Invalid email</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare size={16} className="inline mr-2" />
              Phone Number (for SMS)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {phone && !isValidPhoneNumber(phone) && (
              <p className="text-red-600 text-sm mt-1">Invalid phone number (10-15 digits)</p>
            )}
          </div>
        </div>
      </div>

      {/* Reminder Types */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell size={20} />
          Notification Preferences
        </h3>

        <div className="space-y-4">
          {Object.entries(reminderTypes).map(([type, settings]: any) => (
            <div key={type} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enabled}
                      onChange={() => toggleReminder(type)}
                      className="w-5 h-5 accent-blue-600"
                    />
                    <span className="font-medium text-gray-900">{reminderDescriptions[type]}</span>
                  </label>
                </div>
              </div>

              {settings.enabled && (
                <div className="ml-8 flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.channels?.includes('email')}
                      onChange={() => toggleChannel(type, 'email')}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <Mail size={16} className="text-blue-600" />
                    <span className="text-sm text-gray-700">Email</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.channels?.includes('sms')}
                      onChange={() => toggleChannel(type, 'sms')}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <MessageSquare size={16} className="text-green-600" />
                    <span className="text-sm text-gray-700">SMS</span>
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}

/**
 * Reminders Manager for invoices/projects
 */
export function ReminderScheduler({
  entityType,
  entityId,
  onSchedule,
}: {
  entityType: string;
  entityId: string;
  onSchedule?: () => void;
}) {
  const [reminderDays, setReminderDays] = useState<number[]>([3, 1]);
  const [activeReminders, setActiveReminders] = useState<{ days: number; scheduled: boolean }[]>([
    { days: 3, scheduled: true },
    { days: 1, scheduled: false },
  ]);

  const toggleReminder = (days: number) => {
    setActiveReminders(
      activeReminders.map((r) => (r.days === days ? { ...r, scheduled: !r.scheduled } : r))
    );
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <Bell size={16} />
        Automatic Reminders
      </h4>

      <div className="space-y-2 mb-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={true} disabled className="w-4 h-4" />
          <span className="text-sm text-gray-700">Send reminder 3 days before</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={false} className="w-4 h-4" onChange={() => {}} />
          <span className="text-sm text-gray-700">Send reminder 1 day before</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={false} className="w-4 h-4" onChange={() => {}} />
          <span className="text-sm text-gray-700">Send reminder on due date</span>
        </label>
      </div>

      <div className="text-xs text-gray-600 flex items-start gap-2 p-2 bg-white rounded">
        <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
        <span>Reminders will be sent based on your notification preferences</span>
      </div>
    </div>
  );
}
