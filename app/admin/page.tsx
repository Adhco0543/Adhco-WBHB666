'use client';

import { Shield } from 'lucide-react';
import { AdminDashboard } from '@/components/AdminDashboard';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage users, teams, and system settings</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ErrorBoundary>
          <AdminDashboard />
        </ErrorBoundary>
      </div>
    </div>
  );
}
