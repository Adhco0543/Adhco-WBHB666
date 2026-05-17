'use client';

import { Plus, BarChart3, TrendingUp, AlertCircle, Users, DollarSign } from 'lucide-react';
import { HeroSection } from '@/components/HeroSection';
import { Breadcrumb } from '@/components/Breadcrumb';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { EmptyState } from '@/components/EmptyState';
import { GlassCard } from '@/components/GlassCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PatternBackground } from '@/components/PatternBackground';

export default function ModernDashboardPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header with Theme Toggle */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Dashboard' },
            ]}
          />
          <ThemeToggle />
        </div>
      </div>

      {/* Hero Section */}
      <HeroSection
        title="Welcome Back! 👋"
        description="Your construction business at a glance"
        height="md"
        overlay
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <GlassCard className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Revenue (30d)</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">$45.2K</p>
                <p className="text-xs text-green-600 mt-2">+12.5%</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overdue Invoices</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">5</p>
                <p className="text-xs text-red-600 mt-2">Action required</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Clients</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">24</p>
                <p className="text-xs text-blue-600 mt-2">+3 this month</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Invoice</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">$8.5K</p>
                <p className="text-xs text-purple-600 mt-2">+2.3%</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trend</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last 12 months</p>
                </div>
                <BarChart3 className="text-gray-400" size={24} />
              </div>

              <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Connect to real data</p>
              </div>

              <div className="mt-4 flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Jan</span>
                <span>Jun</span>
                <span>Dec</span>
              </div>
            </GlassCard>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <GlassCard className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Invoices Sent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">127</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Projects Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Team Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
            </GlassCard>
          </div>
        </div>

        {/* Recent Activity with Empty State Example */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
          <GlassCard className="p-6">
            <EmptyState
              type="messages"
              title="No Recent Activity"
              description="Your activity feed will appear here as you work with invoices and projects"
              action={{
                label: 'Create First Invoice',
                onClick: () => console.log('Navigate to create invoice'),
              }}
            />
          </GlassCard>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <GlassCard className="p-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ✨ Hero Sections
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Beautiful gradient backgrounds with overlays on every page
            </p>
            <a href="#" className="text-blue-600 dark:text-blue-400 text-sm font-medium">
              Learn more →
            </a>
          </GlassCard>

          <GlassCard className="p-6 border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🌙 Dark Mode
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Full dark mode support with system preference detection
            </p>
            <a href="#" className="text-blue-600 dark:text-blue-400 text-sm font-medium">
              Learn more →
            </a>
          </GlassCard>

          <GlassCard className="p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🎨 Glass Morphism
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Modern frosted glass effect cards throughout the UI
            </p>
            <a href="#" className="text-blue-600 dark:text-blue-400 text-sm font-medium">
              Learn more →
            </a>
          </GlassCard>

          <GlassCard className="p-6 border-l-4 border-orange-500">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ⚡ Animations
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Smooth transitions and scroll-triggered animations
            </p>
            <a href="#" className="text-blue-600 dark:text-blue-400 text-sm font-medium">
              Learn more →
            </a>
          </GlassCard>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon={<Plus size={24} />}
        label="Create Invoice"
        onClick={() => console.log('Create invoice')}
        position="bottom-right"
        color="blue"
        size="lg"
      />
    </div>
  );
}
