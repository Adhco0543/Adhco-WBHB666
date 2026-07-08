'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function FeaturesPage() {
  const features = [
    {
      id: 1,
      name: 'Document Management',
      description: 'Upload, organize, and search blueprints, contracts, and specifications',
      icon: '📄',
      color: 'from-blue-500 to-blue-600',
      items: ['Upload documents', 'Version control', 'OCR search', 'Expiration tracking']
    },
    {
      id: 2,
      name: 'Time Tracking',
      description: 'Track crew hours, billable time, and labor costs',
      icon: '⏱️',
      color: 'from-green-500 to-green-600',
      items: ['Clock in/out', 'Billable tracking', 'Labor cost analysis', 'Crew reports']
    },
    {
      id: 3,
      name: 'Expense Tracking',
      description: 'Record and categorize on-site expenses with receipt scanning',
      icon: '💰',
      color: 'from-yellow-500 to-yellow-600',
      items: ['Receipt OCR', 'Categorization', 'Budget comparison', 'Reports']
    },
    {
      id: 4,
      name: 'Photo Gallery',
      description: 'Before/after photos with location tagging and timeline',
      icon: '📸',
      color: 'from-purple-500 to-purple-600',
      items: ['Phase tagging', 'Before/after comparison', 'Geolocation', 'Share galleries']
    },
    {
      id: 5,
      name: 'Client Portal',
      description: 'Self-serve access for clients to view projects and documents',
      icon: '🌐',
      color: 'from-indigo-500 to-indigo-600',
      items: ['Client login', 'Project visibility', 'Document access', 'Payment portal']
    },
    {
      id: 6,
      name: 'Project Approvals',
      description: 'Multi-level approval workflows for quotes, change orders, and invoices',
      icon: '✅',
      color: 'from-teal-500 to-teal-600',
      items: ['Approval routing', 'Sign-off tracking', 'Conditional approvals', 'Audit trail']
    },
    {
      id: 7,
      name: 'Change Orders',
      description: 'Track scope changes, costs, and timeline impacts',
      icon: '📝',
      color: 'from-cyan-500 to-cyan-600',
      items: ['Cost impact', 'Timeline tracking', 'Client approval', 'Auto-invoice']
    },
    {
      id: 8,
      name: 'Subcontractor Management',
      description: 'Vendor directory, quote requests, and payment tracking',
      icon: '👥',
      color: 'from-orange-500 to-orange-600',
      items: ['Vendor directory', 'Bid comparison', 'Payment scheduling', 'Insurance tracking']
    },
    {
      id: 9,
      name: 'Equipment Tracking',
      description: 'Inventory, maintenance schedules, and depreciation tracking',
      icon: '🔧',
      color: 'from-red-500 to-red-600',
      items: ['Equipment inventory', 'Maintenance logs', 'Rental vs. own', 'Depreciation']
    },
    {
      id: 10,
      name: 'Material Inventory',
      description: 'Stock levels, reorder automation, and supplier comparison',
      icon: '📦',
      color: 'from-emerald-500 to-emerald-600',
      items: ['Stock tracking', 'Reorder points', 'Supplier management', 'Waste tracking']
    },
    {
      id: 11,
      name: 'Project Profitability',
      description: 'Real-time P&L by project with margin tracking',
      icon: '📊',
      color: 'from-pink-500 to-pink-600',
      items: ['Real-time P&L', 'Margin tracking', 'Cost overruns', 'Profitability trends']
    },
    {
      id: 12,
      name: 'Automated Workflows',
      description: 'If-this-then-that automations and email sequences',
      icon: '🤖',
      color: 'from-violet-500 to-violet-600',
      items: ['Event triggers', 'Email sequences', 'Auto-invoicing', 'Webhooks']
    },
    {
      id: 13,
      name: 'Compliance & Safety',
      description: 'OSHA checklists, incident tracking, and permit alerts',
      icon: '🛡️',
      color: 'from-sky-500 to-sky-600',
      items: ['Safety checklists', 'Incident logging', 'Permit tracking', 'Compliance alerts']
    },
    {
      id: 14,
      name: 'Warranty Tracking',
      description: 'Warranty periods, renewal reminders, and claim management',
      icon: '🎖️',
      color: 'from-fuchsia-500 to-fuchsia-600',
      items: ['Warranty periods', 'Renewal reminders', 'Claim tracking', 'Documentation']
    },
    {
      id: 15,
      name: 'Client Communications',
      description: 'In-app messaging and request management hub',
      icon: '💬',
      color: 'from-rose-500 to-rose-600',
      items: ['In-app messaging', 'Request tracking', 'Change requests', 'Notifications']
    },
    {
      id: 16,
      name: 'Predictive Analytics',
      description: 'Estimate accuracy, timeline risk, and productivity trends',
      icon: '🔮',
      color: 'from-amber-500 to-amber-600',
      items: ['Estimate accuracy', 'Risk scoring', 'Productivity trends', 'Forecasting']
    },
    {
      id: 17,
      name: 'Mobile App',
      description: 'React Native iOS/Android app with offline mode',
      icon: '📱',
      color: 'from-lime-500 to-lime-600',
      items: ['Native iOS/Android', 'Offline mode', 'Push notifications', 'GPS tracking']
    },
    {
      id: 18,
      name: 'Integrations',
      description: 'QuickBooks, Google Calendar, Slack, Twilio, Zapier',
      icon: '🔗',
      color: 'from-slate-500 to-slate-600',
      items: ['QuickBooks sync', 'Calendar sync', 'Slack alerts', 'SMS notifications']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">18 Advanced Features</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Complete construction management platform with everything you need to scale
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="group relative overflow-hidden rounded-xl bg-gray-800 border border-gray-700 hover:border-gray-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              />

              {/* Content */}
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{feature.icon}</span>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-700 px-2 py-1 rounded">
                    Feature {feature.id}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{feature.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{feature.description}</p>

                {/* Feature items */}
                <div className="space-y-2 mb-6">
                  {feature.items.map((item, idx) => (
                    <div key={idx} className="flex items-center text-gray-300 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 mr-2" />
                      {item}
                    </div>
                  ))}
                </div>

                {/* Button */}
                <button
                  className={`w-full py-2 px-4 rounded-lg font-semibold text-white transition-all duration-300
                    bg-gradient-to-r ${feature.color} hover:shadow-lg hover:scale-105`}
                >
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { label: 'Features', value: '18+' },
            { label: 'API Endpoints', value: '50+' },
            { label: 'Database Tables', value: '30+' },
            { label: 'UI Components', value: '100+' }
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">Ready to get started?</p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
