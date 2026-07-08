'use client';

import { useState } from 'react';
import { Badge, StatusBadge } from '@/components/Badge';
import { Progress, CircularProgress, StepsProgress } from '@/components/Progress';
import { Tabs, VerticalTabs } from '@/components/Tabs';
import { Modal, ConfirmDialog, AlertDialog, Sheet } from '@/components/Modal';
import { Card, CardHeader, CardBody, CardFooter, StatCard, ImageCard } from '@/components/Card';
import { HeroSection } from '@/components/HeroSection';
import { GlassCard } from '@/components/GlassCard';
import { Breadcrumb } from '@/components/Breadcrumb';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Plus, DollarSign, Users, TrendingUp } from 'lucide-react';

export default function ComponentShowcase() {
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showSheet, setShowSheet] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Components' },
            ]}
          />
          <ThemeToggle />
        </div>
      </div>

      {/* Hero */}
      <HeroSection
        title="Component Showcase"
        description="All modern design components in one place"
        height="md"
        overlay
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Badges */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Badges</h2>
          <GlassCard className="p-6">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Variants</p>
                <div className="flex flex-wrap gap-3">
                  <Badge label="Success" variant="success" />
                  <Badge label="Warning" variant="warning" />
                  <Badge label="Danger" variant="danger" />
                  <Badge label="Info" variant="info" />
                  <Badge label="Neutral" variant="neutral" />
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Sizes</p>
                <div className="flex flex-wrap gap-3 items-center">
                  <Badge label="Small" size="sm" />
                  <Badge label="Medium" size="md" />
                  <Badge label="Large" size="lg" />
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Status Badges</p>
                <div className="flex flex-wrap gap-3">
                  <StatusBadge status="active" />
                  <StatusBadge status="pending" />
                  <StatusBadge status="completed" />
                  <StatusBadge status="overdue" />
                </div>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Progress */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Progress Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Linear Progress</p>
              <Progress value={65} label="Invoice Payment" showPercent />
            </GlassCard>

            <GlassCard className="p-6 flex items-center justify-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">Circular Progress</p>
                <CircularProgress value={45} color="blue" size={120} />
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <StepsProgress
                steps={[
                  { label: 'Quotation', status: 'completed' },
                  { label: 'Accepted', status: 'current' },
                  { label: 'In Progress', status: 'upcoming' },
                ]}
              />
            </GlassCard>
          </div>
        </section>

        {/* Tabs */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Tabs</h2>
          <GlassCard className="p-6">
            <Tabs
              tabs={[
                {
                  id: 'overview',
                  label: 'Overview',
                  content: <p className="text-gray-700 dark:text-gray-300">Overview content here</p>,
                },
                {
                  id: 'details',
                  label: 'Details',
                  content: <p className="text-gray-700 dark:text-gray-300">Details content here</p>,
                },
                {
                  id: 'activity',
                  label: 'Activity',
                  content: <p className="text-gray-700 dark:text-gray-300">Activity content here</p>,
                },
              ]}
            />
          </GlassCard>
        </section>

        {/* Cards */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              label="Revenue"
              value="$45.2K"
              icon={<DollarSign size={24} />}
              color="green"
              trend={{ value: 12.5, direction: 'up' }}
            />
            <StatCard
              label="Clients"
              value="24"
              icon={<Users size={24} />}
              color="blue"
              trend={{ value: 3, direction: 'up' }}
            />
            <StatCard
              label="Projects"
              value="12"
              icon={<TrendingUp size={24} />}
              color="purple"
              trend={{ value: 2, direction: 'up' }}
            />
            <StatCard
              label="Invoices"
              value="127"
              icon={<DollarSign size={24} />}
              color="orange"
              trend={{ value: 5, direction: 'down' }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="elevated">
              <CardHeader title="Project Summary" subtitle="Q4 2024" />
              <CardBody>Your project details appear here</CardBody>
              <CardFooter>
                <button className="text-blue-600 dark:text-blue-400 font-medium">View Details</button>
              </CardFooter>
            </Card>

            <Card variant="outlined">
              <CardHeader title="Invoice Information" />
              <CardBody>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300">Invoice #INV-001</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Amount: $5,000</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Due: Dec 31, 2024</p>
                </div>
              </CardBody>
              <CardFooter>
                <StatusBadge status="pending" />
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Modals */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Modals & Dialogs</h2>
          <GlassCard className="p-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Open Modal
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              >
                Confirmation
              </button>
              <button
                onClick={() => setShowAlert(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
              >
                Alert
              </button>
              <button
                onClick={() => setShowSheet(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
              >
                Sheet
              </button>
            </div>
          </GlassCard>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ready to use?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            All components are production-ready and fully documented
          </p>
          <a
            href="/MODERN_DESIGN_GUIDE.md"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            View Documentation
          </a>
        </section>
      </div>

      {/* Modals */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Modal Example">
        <p className="text-gray-700 dark:text-gray-300">This is a modal dialog component</p>
      </Modal>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Confirm Action"
        message="Are you sure you want to proceed?"
        onConfirm={() => setShowConfirm(false)}
        onCancel={() => setShowConfirm(false)}
        variant="danger"
      />

      <AlertDialog
        isOpen={showAlert}
        title="Success"
        message="Action completed successfully!"
        onClose={() => setShowAlert(false)}
        variant="success"
      />

      <Sheet isOpen={showSheet} onClose={() => setShowSheet(false)} title="Sheet Example" position="right">
        <p className="text-gray-700 dark:text-gray-300">This is a sheet that slides from the right</p>
      </Sheet>

      {/* FAB */}
      <FloatingActionButton
        icon={<Plus size={24} />}
        label="New"
        onClick={() => alert('Create new')}
        position="bottom-right"
        color="blue"
        size="lg"
      />
    </div>
  );
}
