'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import { MoonIcon } from '@radix-ui/react-icons';
import { useUpdateTeamMemberStatusMutation } from '@/store/services/teamMembersApi';
import { toastSuccess, toastError } from '@/utils/toastWithSound';

interface HibernateOverlayProps {
  userName: string;
  statusName: string;
  statusColor: string;
  duration?: number;
  statusUpdatedAt?: string;
  userId: string;
}

const HibernateOverlay: React.FC<HibernateOverlayProps> = ({
  userName,
  statusName,
  statusColor,
  duration,
  statusUpdatedAt,
  userId
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [updateStatus, { isLoading: isUpdating }] = useUpdateTeamMemberStatusMutation();

  useEffect(() => {
    if (!duration || !statusUpdatedAt) return;

    const timer = setInterval(() => {
      const start = new Date(statusUpdatedAt).getTime();
      const end = start + (duration * 60 * 1000);
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('00:00');
        clearInterval(timer);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [duration, statusUpdatedAt]);

  const handleResume = async () => {
    try {
      await updateStatus({
        id: userId,
        status: 'Online',
        reason: 'Manually resumed from hibernate'
      }).unwrap();
      toastSuccess('Platform resumed successfully');
    } catch (error) {
      console.error('Failed to resume platform:', error);
      toastError('Failed to resume platform');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-900/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 select-none">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Animated Icon */}
        <div className="relative flex justify-center">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
            <div 
                className="w-24 h-24 rounded-full flex items-center justify-center relative border-4 border-white/10"
                style={{ backgroundColor: statusColor }}
            >
                <MoonIcon className="w-12 h-12 text-white animate-pulse" />
            </div>
        </div>

        <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Platform Hibernated
            </h1>
            <p className="text-gray-400 text-lg">
                Hello, <span className="text-white font-semibold">{userName}</span>. 
                You are currently in <span className="font-bold" style={{ color: statusColor }}>{statusName}</span> status.
            </p>
        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-1 gap-4 py-4">
            {duration ? (
                <div className="bg-white/5 border border-white/10 rounded-[var(--radius)] p-6">
                    <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">Time Remaining</p>
                    <p className="text-4xl font-mono font-bold text-blue-400 tabular-nums">
                        {timeLeft || '--:--'}
                    </p>
                </div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-[var(--radius)] p-6">
                   <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">Mode</p>
                   <p className="text-xl font-bold text-white">Infinite Hibernate</p>
                </div>
            )}
        </div>

        <div className="space-y-4">
            <Button
                variant="primary"
                size="lg"
                onClick={handleResume}
                loading={isUpdating}
                className="w-full rounded-[var(--radius)] py-6 text-lg font-bold shadow-2xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
                Exit Hibernate & Resume
            </Button>
            
            <p className="text-[12px] text-gray-500">
                Resuming will switch your status back to <b>Online</b>.
            </p>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
    </div>
  );
};

export default HibernateOverlay;
