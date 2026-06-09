'use client';

import React, { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCampaign } from '@/contexts/CampaignContext';
import { toastInfo, toastSuccess } from '@/utils/toastWithSound';
import { useDispatch } from 'react-redux';
import { updateUser as updateReduxUser } from '@/store/slices/authSlice';
import { usePathname } from 'next/navigation';
import { TicketMessage } from '@/store/services/supportApi';
import { teamMembersApi, TeamMemberStatusUpdatePayload } from '@/store/services/teamMembersApi';
import { companyApi } from '@/store/services/companyApi';
import { playNotificationSound } from '@/utils/soundEffects';

export const RealTimeUpdates: React.FC = () => {
  const pathname = usePathname();
  const { socket, isConnected, emit, on, off } = useSocket();
  const { user, updateUser } = useAuth();
  const { selectedCampaignId } = useCampaign();
  const dispatch = useDispatch();

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

      // Join Campaign Room
      const campaignId = selectedCampaignId || user.campaignId;
      if (campaignId) {
        emit('joinCampaign', campaignId);
      }

      // Join Role Room
      const roleId = (user.role as unknown as Record<string, unknown>)?._id || (user.role as unknown as Record<string, unknown>)?.id || user.roleId;
      if (roleId && typeof roleId === 'string') {
        emit('joinRole', roleId);
      }
    }
  }, [isConnected, user, selectedCampaignId, emit]);

  // Handle Real-time Events
  useEffect(() => {
    if (!socket) return;

    // Handle Role Updates
    const handleRoleUpdated = (data: { id?: string; _id?: string; roleId?: string }) => {
      if (data.roleId) {
        toastInfo('Your role permissions have been updated. Refreshing...');
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

    // Handle Team Member Status Updates
    const handleTeamMemberStatusUpdate = (payload: TeamMemberStatusUpdatePayload) => {
      const newStatus = typeof payload.status === 'object' ? payload.status.status : payload.status;
      const memberName = payload.name || 'A team member';

      // Only notify if it's not the current user themselves (already handled by updateStatus mutation normally)
      const currentUserId = user?.id || user?._id;
      if (payload.teamMemberId === currentUserId) return;

      // Show global notification
      toastSuccess(`${memberName} is now ${newStatus}`);

      // Invalidate cache to refresh any active lists (including TeamMembersPage)
      dispatch(teamMembersApi.util.invalidateTags(['TeamMembers']));
    };

    // Handle Global Message Notifications
    const handleGlobalMessage = (message: TicketMessage) => {
      // Don't notify if it's from me
      const senderId = typeof message.senderId === 'object' ? (message.senderId?._id || message.senderId?.id) : message.senderId;
      const currentUserId = user?.id || user?._id;

      if (senderId && currentUserId && senderId.toString() === currentUserId.toString()) return;

      // Don't notify if we are already on that specific ticket page
      const isOnTicketPage = pathname?.includes(`/support/${message.ticketId || ''}`);
      if (isOnTicketPage) return;

      // Show toast with sound using the utility
      toastInfo(`New message on ticket #${message.ticketDisplayId || 'Support'}`, {
        description: message.message?.substring(0, 50) + (message.message?.length > 50 ? '...' : ''),
        action: {
          label: 'View',
          onClick: () => window.location.href = `/support/${message.ticketId}`
        }
      });
    };

    // Handle Status Expiration for Supervisors
    const handleStatusExpired = (data: { name: string; status: string; elapsedMinutes: number; allowedMinutes: number }) => {
      toastInfo(`${data.name} has been in ${data.status} for ${data.elapsedMinutes}m (Allowed: ${data.allowedMinutes}m)`, {
        icon: '⚠️',
      });
      playNotificationSound('error', 'notifications');
    };

    // Handle Table Refreshes
    const handleRefreshCompanies = () => {
      dispatch(companyApi.util.invalidateTags(['Company']));
    };

    const handleRefreshPendingReactivations = () => {
      dispatch(companyApi.util.invalidateTags(['Company']));
    };

    on('roleUpdated', handleRoleUpdated);
    on('teamMemberStatusUpdate', handleTeamMemberStatusUpdate);
    on('statusExpired', handleStatusExpired);
    on('newTicketMessage', handleGlobalMessage);
    on('refreshCompanies', handleRefreshCompanies);
    on('refreshPendingReactivations', handleRefreshPendingReactivations);

    return () => {
      off('roleUpdated', handleRoleUpdated);
      off('teamMemberStatusUpdate', handleTeamMemberStatusUpdate);
      off('statusExpired', handleStatusExpired);
      off('newTicketMessage', handleGlobalMessage);
      off('refreshCompanies', handleRefreshCompanies);
      off('refreshPendingReactivations', handleRefreshPendingReactivations);
    };
  }, [socket, on, off, updateUser, dispatch, user?.id, user?._id, pathname]);

  return null;
};

export default RealTimeUpdates;
