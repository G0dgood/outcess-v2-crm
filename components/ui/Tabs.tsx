import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

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

const isHexDark = (hex: string) => {
  if (!hex || !hex.startsWith('#')) return false;
  let c = hex.substring(1);
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  if (c.length !== 6) return false;
  const rgb = parseInt(c, 16);
  if (isNaN(rgb)) return false;
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 40;
};

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  activeColor = 'var(--primary)',
  className = '',
}) => {
  const { isDarkMode } = useTheme();

  const resolvedActiveColor = isDarkMode
    ? (isHexDark(activeColor) ? '#F3F4F6' : activeColor)
    : activeColor;

  return (
    <div className={`border-b dark:border-gray-700 flex items-center gap-8 overflow-x-auto no-scrollbar relative ${className}`} style={{ borderColor: 'var(--light-gray)' }}>
      {tabs.map((tab) => {
        const tabId = typeof tab === 'string' ? tab : tab.id;
        const tabLabel = typeof tab === 'string' ? tab : tab.label;
        const tabIcon = typeof tab === 'object' ? tab.icon : null;
        const isActive = activeTab === tabId;

        return (
          <button
            key={tabId}
            onClick={() => onTabChange(tabId)}
            className={`pb-4 px-1 font-inter font-semibold text-[10px] md:text-[12px] transition-all duration-200 relative min-w-fit focus:outline-none text-[var(--text-tertiary)] hover:text-[var(--text-primary)]`}
            style={{
              color: isActive ? resolvedActiveColor : undefined
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
                style={{ backgroundColor: resolvedActiveColor }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
