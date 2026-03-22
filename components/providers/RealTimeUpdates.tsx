'use client';

import React, { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { updateUser as updateReduxUser } from '@/store/slices/authSlice';

export const RealTimeUpdates: React.FC = () => {
  const { socket, isConnected, emit, on, off } = useSocket();
  const { user, updateUser } = useAuth();
  const { selectedLineOfBusinessId } = useLineOfBusiness();
  const dispatch = useDispatch();

  useEffect(() => {
    // Step 1: Connect and Join the 'Room'
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

  useEffect(() => {
    if (!socket) return;

    // Step 2: Listen for the roleUpdated Event
    const handleRoleUpdated = (data: { id?: string; _id?: string; roleId?: string }) => {
      // If it's a role-specific refresh signal
      if (data.roleId) {
        toast.info('Your role permissions have been updated. Refreshing...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        return;
      }

      // Check if the update is for the current user
      if (data.id === user?.id || data._id === user?.id) {
        // Update AuthContext state
        updateUser(data);

        // Update Redux state
        dispatch(updateReduxUser(data));

        toast.info('Your permissions have been updated.');
      }
    };

    // Step 3: Listen for the Notification (Optional)
    const handleNotification = (data: unknown) => {
      const notification = data as { message?: string };
      toast(notification.message || 'New notification received');
    };

    on('roleUpdated', handleRoleUpdated);
    on('notification', handleNotification);

    return () => {
      off('roleUpdated', handleRoleUpdated);
      off('notification', handleNotification);
    };
  }, [socket, on, off, updateUser, dispatch, user?.id]);

  return null;
};
