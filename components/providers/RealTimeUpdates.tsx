'use client';

import React, { useEffect, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { updateUser as updateReduxUser } from '@/store/slices/authSlice';
import { usePathname } from 'next/navigation';

export const RealTimeUpdates: React.FC = () => {
  const pathname = usePathname();
  const { socket, isConnected, emit, on, off } = useSocket();
  const { user, updateUser } = useAuth();
  const { selectedLineOfBusinessId } = useLineOfBusiness();
  const dispatch = useDispatch();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
    }
  }, []);

  // Socket Connection and Room Joining
  useEffect(() => {
    if (isConnected && user) {
      // Join User Room 
      const userId = user.id || user._id;
      if (userId) {
        emit('join', userId);
      }

      // Join Company Room
      const userCompany = user.company as Record<string, unknown>;
      const companyId = user.companyId || userCompany?._id || userCompany?.id;
      if (companyId) {
        emit('joinCompany', companyId);
      }

      // Join LineOfBusiness Room
      const lobId = selectedLineOfBusinessId || user.lineOfBusinessId;
      if (lobId) {
        emit('joinLineOfBusiness', lobId);
      }

      // Join Role Room
      const roleId = (user.role as unknown as Record<string, unknown>)?._id || (user.role as unknown as Record<string, unknown>)?.id || user.roleId;
      if (roleId && typeof roleId === 'string') {
        emit('joinRole', roleId);
      }
    }
  }, [isConnected, user, selectedLineOfBusinessId, emit]);

  // Handle Real-time Events
  useEffect(() => {
    if (!socket) return;

    // Handle Role Updates
    const handleRoleUpdated = (data: { id?: string; _id?: string; roleId?: string }) => {
      if (data.roleId) {
        toast.info('Your role permissions have been updated. Refreshing...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        return;
      }

      if (data.id === user?.id || data._id === user?.id) {
        updateUser(data);
        dispatch(updateReduxUser(data));
      }
    };

    // Handle Global Message Notifications
    const handleGlobalMessage = (message: any) => {
      // Don't notify if it's from me
      const senderId = typeof message.senderId === 'object' ? (message.senderId?._id || message.senderId?.id) : message.senderId;
      const currentUserId = user?.id || user?._id;
      
      if (senderId && currentUserId && senderId.toString() === currentUserId.toString()) return;

      // Don't notify if we are already on that specific ticket page
      const isOnTicketPage = pathname?.includes(`/support/${message.ticketId || ''}`);
      if (isOnTicketPage) return;

      // Play sound and show toast
      if (audioRef.current) {
        audioRef.current.play().catch(err => console.log('Audio playback failed:', err));
      }

      toast.info(`New message on ticket #${message.ticketDisplayId || 'Support'}`, {
        description: message.message?.substring(0, 50) + (message.message?.length > 50 ? '...' : ''),
        action: {
          label: 'View',
          onClick: () => window.location.href = `/support/${message.ticketId}`
        }
      });
    };

    on('roleUpdated', handleRoleUpdated);
    on('newTicketMessage', handleGlobalMessage);

    return () => {
      off('roleUpdated', handleRoleUpdated);
      off('newTicketMessage', handleGlobalMessage);
    };
  }, [socket, on, off, updateUser, dispatch, user?.id, user?._id, pathname]);

  return null;
};

export default RealTimeUpdates;
