import React from 'react';
import Icon from '@/components/ui/Icon';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

interface LoginStatusInfoBannerProps {
  onClose: () => void;
  className?: string;
}

const LoginStatusInfoBanner: React.FC<LoginStatusInfoBannerProps> = ({ onClose, className }) => {
  return (
    <div
      className={`mb-4 p-3 dark:bg-gray-800 border rounded-[var(--radius)] dark:border-gray-700 flex items-center gap-3 ${className || ''}`}
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--light-gray)',
      }}
    >
      <div className="shrink-0 w-6 h-6 flex items-center justify-center">
        <ExclamationTriangleIcon
          className="w-4 h-4 dark:text-gray-300"
          style={{ color: 'var(--text-secondary)' }}
        />
      </div>
      <p
        className="text-[10px] md:text-[12px] dark:text-gray-300 flex-1"
        style={{ color: 'var(--text-secondary)' }}
      >
        This is for tracking agents who are logged in or logged out
      </p>
      <button
        onClick={onClose}
        className="shrink-0 p-1 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        style={{ color: 'var(--text-tertiary)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-tertiary)';
        }}
        title="Close"
      >
        <Icon name="Close_round_light" size="sm" />
      </button>
    </div>
  );
};

export default LoginStatusInfoBanner;

