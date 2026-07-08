'use client';

import { BarChart3, TrendingUp, AlertCircle, Clock, Users, DollarSign } from 'lucide-react';
import { useTour, TOUR_GUIDES } from '@/lib/hooks/useTour';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { PWAInstallModal } from '@/components/PWAInstallModal';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { startTour } = useTour();
  const { addNotification } = useNotifications();
  const [showTourGuide, setShowTourGuide] = useState(false);

  // Start tour on first visit
  useEffect(() => {
    const hasSeenDashboardTour = localStorage.getItem('tour_dashboard_seen');
    if (!hasSeenDashboardTour) {
      setShowTourGuide(true);
      localStorage.setItem('tour_dashboard_seen', 'true');
    }
  }, []);

  const handleStartTour = () => {
    startTour(TOUR_GUIDES.ONBOARDING);
    setShowTourGuide(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* PWA Install Modal */}
      <PWAInstallModal />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's your business overview.</p>
            </div>

            {showTourGuide && (
              <button
                onClick={handleStartTour}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Take Tour
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" data-tour="stats">
          <StatCard
            icon={<DollarSign className="text-green-600" />}
            label="Revenue (30d)"
            value="$45,230"
            change="+12.5%"
            trend="up"
          />
          <StatCard
            icon={<AlertCircle className="text-orange-600" />}
            label="Overdue Invoices"
            value="5"
            change="2 new"
            trend="down"
          />
          <StatCard
            icon={<Users className="text-blue-600" />}
            label="Active Clients"
            value="24"
            change="+3 this month"
            trend="up"
          />
          <StatCard
            icon={<TrendingUp className="text-purple-600" />}
            label="Avg Invoice Value"
            value="$8,450"
            change="+2.3%"
            trend="up"
          />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart Placeholder */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6" data-tour="charts">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Revenue Trend</h2>
                <p className="text-sm text-gray-600">Last 12 months</p>
              </div>
              <BarChart3 className="text-gray-400" size={24} />
            </div>

            <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Chart placeholder - Connect to real data</p>
            </div>

            <div className="mt-4 flex justify-between text-sm text-gray-600">
              <span>Jan</span>
              <span>Jun</span>
              <span>Dec</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4" data-tour="actions">
            <h3 className="font-semibold text-gray-900 px-2">Quick Actions</h3>
            <QuickActionButton label="Create Invoice" icon="📄" />
            <QuickActionButton label="New Project" icon="📋" />
            <QuickActionButton label="Send Reminder" icon="🔔" />
            <QuickActionButton label="View Reports" icon="📊" />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Invoices */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6" data-tour="invoices">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Invoices</h2>
            <div className="space-y-3">
              {[
                { id: 'INV-001', client: 'Acme Corp', amount: '$5,000', status: 'overdue' },
                { id: 'INV-002', client: 'BuildCo', amount: '$8,500', status: 'unpaid' },
                { id: 'INV-003', client: 'ConstructPro', amount: '$12,000', status: 'paid' },
              ].map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div>
                    <p className="font-medium text-gray-900">{invoice.id}</p>
                    <p className="text-sm text-gray-600">{invoice.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{invoice.amount}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'overdue'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6" data-tour="status">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
            <div className="space-y-3">
              <StatusItem label="API Status" status="healthy" />
              <StatusItem label="Database" status="healthy" />
              <StatusItem label="Email Service" status="healthy" />
              <StatusItem label="File Storage" status="healthy" />
              <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
                Last checked: 2 minutes ago
              </div>
            </div>
          </div>
        </div>

        {/* Feature Showcase Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4" data-tour="features">
          <FeatureCard
            title="✨ New: Bulk Actions"
            description="Select multiple invoices to delete, export, or update at once"
            action="Try it now"
            href="/invoices/integrated"
          />
          <FeatureCard
            title="💾 Saved Views"
            description="Create custom filter combinations and save them as views"
            action="Create a view"
            href="/invoices/integrated"
          />
          <FeatureCard
            title="💬 Team Collaboration"
            description="Add comments and @mentions to discuss invoices and projects"
            action="Enable comments"
            href="/invoices/integrated"
          />
          <FeatureCard
            title="📊 Admin Dashboard"
            description="Manage users, teams, and monitor system metrics"
            action="Go to admin"
            href="/admin"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({
  icon,
  label,
  value,
  change,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 bg-gray-100 rounded">{icon}</div>
        <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      </div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

/**
 * Quick Action Button
 */
function QuickActionButton({ label, icon }: { label: string; icon: string }) {
  return (
    <button className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left">
      <span className="text-2xl mr-3">{icon}</span>
      <span className="text-sm font-medium text-gray-900">{label}</span>
    </button>
  );
}

/**
 * Status Item
 */
function StatusItem({ label, status }: { label: string; status: 'healthy' | 'warning' | 'critical' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            status === 'healthy'
              ? 'bg-green-500'
              : status === 'warning'
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
        />
        <span
          className={`text-xs font-medium ${
            status === 'healthy'
              ? 'text-green-600'
              : status === 'warning'
              ? 'text-yellow-600'
              : 'text-red-600'
          }`}
        >
          {status === 'healthy' && 'Healthy'}
          {status === 'warning' && 'Warning'}
          {status === 'critical' && 'Critical'}
        </span>
      </div>
    </div>
  );
}

/**
 * Feature Card
 */
function FeatureCard({
  title,
  description,
  action,
  href,
}: {
  title: string;
  description: string;
  action: string;
  href: string;
}) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <a
        href={href}
        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
      >
        {action} →
      </a>
    </div>
  );
}
