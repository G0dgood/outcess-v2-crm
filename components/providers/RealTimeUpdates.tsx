'use client';

import React, { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { updateUser as updateReduxUser } from '@/store/slices/authSlice';

export const RealTimeUpdates: React.FC = () => {
  const { socket, isConnected, emit, on, off } = useSocket();
  const { user, updateUser } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    // Step 1: Connect and Join the 'Room'
    if (isConnected && user?.lineOfBusinessId) {
      console.log('Joining LineOfBusiness room:', user.lineOfBusinessId);
      emit('joinLineOfBusiness', user.lineOfBusinessId);
    }
  }, [isConnected, user?.lineOfBusinessId, emit]);

  useEffect(() => {
    if (!socket) return;

    // Step 2: Listen for the roleUpdated Event
    const handleRoleUpdated = (updatedRoleData: any) => {
      console.log('Role updated event received:', updatedRoleData);

      // The payload might be the full user object or just the role changes.
      // Based on the guide: "This event will carry the updated user data (including the new role/permissions)."
      // So we expect updatedUser.

      // Check if the update is for the current user
      if (updatedRoleData.id === user?.id || updatedRoleData._id === user?.id) {
        // Update AuthContext state
        updateUser(updatedRoleData);

        // Update Redux state
        dispatch(updateReduxUser(updatedRoleData));

        toast.info('Your permissions have been updated.');
      }
    };

    // Step 3: Listen for the Notification (Optional)
    const handleNotification = (data: any) => {
      console.log('Notification received:', data);
      toast(data.message || 'New notification received');
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
