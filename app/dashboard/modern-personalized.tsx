'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRelevantWidgets, getPainPointWidgets, UserPreferences } from '@/lib/dashboardPreferences';

interface ModernDashboardProps {
  preferences?: UserPreferences | null;
}

export default function ModernDashboard({ preferences }: ModernDashboardProps) {
  // Get relevant widgets based on preferences
  const widgets =
    preferences && preferences.primaryFocus.length > 0
      ? getPainPointWidgets(preferences)
      : [];

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">
          {preferences
            ? `Welcome back! Your dashboard is personalized for ${preferences.primaryFocus.join(', ')}`
            : 'Your construction management dashboard'}
        </p>
      </div>

      {/* Preferences Summary */}
      {preferences && (
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-blue-600 font-medium">Business Type</p>
                <p className="text-lg font-semibold text-slate-900">
                  {preferences.businessType.replace(/_/g, ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Team Size</p>
                <p className="text-lg font-semibold text-slate-900">
                  {preferences.teamSize.replace(/_/g, ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Focus Areas</p>
                <p className="text-lg font-semibold text-slate-900">
                  {preferences.primaryFocus.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Pain Points</p>
                <p className="text-lg font-semibold text-slate-900">
                  {preferences.painPoints.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Actions Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition">
                + Create Invoice
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition">
                + Log Time Entry
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition">
                + Add Expense
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition">
                + New Project
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="pb-2 border-b">
                <p className="font-medium text-slate-900">Project Created</p>
                <p className="text-slate-500">New Office Renovation</p>
              </div>
              <div className="pb-2 border-b">
                <p className="font-medium text-slate-900">Invoice Sent</p>
                <p className="text-slate-500">INV-2024-001 to ABC Corp</p>
              </div>
              <div>
                <p className="font-medium text-slate-900">Time Entry Logged</p>
                <p className="text-slate-500">8 hours - Foundation Work</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="pb-2 border-b">
                <p className="font-medium text-slate-900">Today</p>
                <p className="text-red-600">Invoice payment due</p>
              </div>
              <div className="pb-2 border-b">
                <p className="font-medium text-slate-900">Tomorrow</p>
                <p className="text-orange-600">Project milestone review</p>
              </div>
              <div>
                <p className="font-medium text-slate-900">In 7 days</p>
                <p className="text-yellow-600">Safety inspection scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoicing Widget - Show if in focus */}
        {preferences?.primaryFocus.includes('invoicing') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoice Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Total Outstanding</p>
                  <p className="text-2xl font-bold text-slate-900">$12,450</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-600">Sent</p>
                    <p className="text-lg font-semibold text-slate-900">8</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Paid</p>
                    <p className="text-lg font-semibold text-green-600">5</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time Tracking Widget - Show if in focus */}
        {preferences?.primaryFocus.includes('time_tracking') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Hours This Week</p>
                  <p className="text-2xl font-bold text-slate-900">38.5</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-600">Billable</p>
                    <p className="text-lg font-semibold text-slate-900">35</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Non-billable</p>
                    <p className="text-lg font-semibold text-slate-500">3.5</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profitability Widget - Show if in focus */}
        {preferences?.primaryFocus.includes('profitability') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profit Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Average Margin</p>
                  <p className="text-2xl font-bold text-green-600">28.5%</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-600">Revenue</p>
                    <p className="text-lg font-semibold text-slate-900">$145K</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Costs</p>
                    <p className="text-lg font-semibold text-slate-900">$103K</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Safety Widget - Show if in focus */}
        {preferences?.primaryFocus.includes('safety') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Safety Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Incidents (30 days)</span>
                  <span className="font-semibold text-green-600">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Near Misses</span>
                  <span className="font-semibold text-yellow-600">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Compliance Alerts</span>
                  <span className="font-semibold text-orange-600">2</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Equipment Widget - Show if in focus */}
        {preferences?.primaryFocus.includes('equipment') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Equipment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Available</span>
                  <span className="font-semibold text-green-600">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">In Use</span>
                  <span className="font-semibold text-blue-600">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Maintenance</span>
                  <span className="font-semibold text-orange-600">2</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Personalization Notice */}
      {preferences && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            💡 <strong>Personalized Dashboard:</strong> This dashboard is tailored to your preferences. Visit{' '}
            <a href="/settings/customization" className="underline font-semibold">
              Settings
            </a>{' '}
            to adjust your preferences and widgets.
          </p>
        </div>
      )}
    </div>
  );
}
