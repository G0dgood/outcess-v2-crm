import React from 'react';
import { motion } from 'framer-motion';
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
    <div className={`border-b flex items-center gap-8 overflow-x-auto no-scrollbar relative ${className}`}>
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
            className={`pb-4 px-1 font-medium text-[10px] md:text-[12px] transition-colors relative !rounded-none min-w-fit`}
            style={{
              color: isActive ? activeColor : 'var(--text-tertiary)'
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
            <div className="flex items-center gap-2 relative z-10">
              {tabIcon}
              {tabLabel}
            </div>
            {isActive && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 z-20"
                style={{ backgroundColor: activeColor }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </Button>
        );
      })}
    </div>
  );
};

export default Tabs;
