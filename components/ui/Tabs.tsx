'use client';

import React from 'react';
import Button from '@/components/ui/Button';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: (string | TabItem)[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  activeColor?: string;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  activeColor = 'var(--primary)',
  className = '',
}) => {
  return (
    <div className={`border-b flex items-center gap-8 overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map((tab) => {
        const tabId = typeof tab === 'string' ? tab : tab.id;
        const tabLabel = typeof tab === 'string' ? tab : tab.label;
        const tabIcon = typeof tab === 'object' ? tab.icon : null;
        const isActive = activeTab === tabId;

        return (
          <Button
            key={tabId}
            variant="ghost"
            size="sm"
            onClick={() => onTabChange(tabId)}
            className={`pb-4 px-1 font-medium text-[10px] md:text-[12px] transition-colors relative !rounded-none ${isActive
              ? 'border-b-2'
              : 'hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            style={isActive ? {
              color: activeColor,
              borderBottomColor: activeColor
            } : {
              color: 'var(--text-tertiary)'
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }
            }}
          >
            <div className="flex items-center gap-2">
              {tabIcon}
              {tabLabel}
            </div>
          </Button>
        );
      })}
    </div>
  );
};

export default Tabs;
