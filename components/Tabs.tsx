'use client';

import React, { useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  variant?: 'default' | 'pills' | 'underline';
  onChange?: (tabId: string) => void;
  className?: string;
}

export function Tabs({
  tabs,
  defaultTab,
  variant = 'default',
  onChange,
  className = '',
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeTabData = tabs.find((t) => t.id === activeTab);

  if (!activeTabData) return null;

  const tabStyles = {
    default:
      'border-b-2 border-transparent data-[active]:border-blue-600 data-[active]:text-blue-600 dark:data-[active]:text-blue-400',
    pills:
      'rounded-lg data-[active]:bg-blue-600 data-[active]:text-white dark:data-[active]:bg-blue-500',
    underline:
      'border-b-2 border-transparent data-[active]:border-blue-600 data-[active]:font-semibold',
  };

  return (
    <div className={className}>
      {/* Tab list */}
      <div
        className={`
          flex gap-2 overflow-x-auto pb-2
          ${variant === 'default' || variant === 'underline' ? 'border-b border-gray-200 dark:border-gray-700' : ''}
        `}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            data-active={activeTab === tab.id ? '' : undefined}
            disabled={tab.disabled}
            className={`
              flex items-center gap-2 px-4 py-2.5 font-medium text-sm
              transition-all whitespace-nowrap
              ${
                activeTab === tab.id
                  ? ''
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${tabStyles[variant]}
            `}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-4 animate-fade-in">
        {activeTabData.content}
      </div>
    </div>
  );
}

// Vertical tabs variant
interface VerticalTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export function VerticalTabs({
  tabs,
  defaultTab,
  onChange,
  className = '',
}: VerticalTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeTabData = tabs.find((t) => t.id === activeTab);

  if (!activeTabData) return null;

  return (
    <div className={`flex gap-6 ${className}`}>
      {/* Tab list */}
      <div className="flex flex-col gap-2 min-w-40">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            disabled={tab.disabled}
            className={`
              flex items-center gap-2 px-4 py-2.5 font-medium text-sm rounded-lg
              transition-all text-left
              ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white dark:bg-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 animate-fade-in">
        {activeTabData.content}
      </div>
    </div>
  );
}
