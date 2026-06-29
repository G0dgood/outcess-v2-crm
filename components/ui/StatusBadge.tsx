import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const getStatusColors = (status: string) => {
  const normalized = status.trim().toLowerCase();

  if (
    normalized === 'delivered' ||
    normalized === 'success' ||
    normalized === 'completed' ||
    normalized === 'active' ||
    normalized === 'approved' ||
    normalized === 'sent'
  ) {
    return {
      bg: 'rgba(34, 197, 94, 0.1)',
      text: '#22C55E',
      border: 'rgba(34, 197, 94, 0.2)',
    };
  }

  if (
    normalized === 'pending' ||
    normalized === 'in review' ||
    normalized === 'in_review' ||
    normalized === 'in-review' ||
    normalized === 'on hold'
  ) {
    return {
      bg: 'rgba(251, 191, 36, 0.1)',
      text: '#FBBF24',
      border: 'rgba(251, 191, 36, 0.2)',
    };
  }

  if (normalized === 'failed' || normalized === 'error') {
    return {
      bg: 'rgba(239, 68, 68, 0.1)',
      text: '#EF4444',
      border: 'rgba(239, 68, 68, 0.2)',
    };
  }

  return {
    bg: 'rgba(156, 163, 175, 0.1)',
    text: '#9CA3AF',
    border: 'rgba(156, 163, 175, 0.2)',
  };
};

const toTitleCase = (value: string) => {
  if (!value) return '';
  return value
    .toLowerCase()
    .split(' ')
    .filter((part) => part.length > 0)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colors = getStatusColors(status);
  const label = toTitleCase(status);

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[8px] md:text-[10px] font-medium"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
      {label || 'N/A'}
    </span>
  );
};

export default StatusBadge;
