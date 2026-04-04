'use client';

import React, { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { toast } from 'sonner';
import { useUserInfo } from '@/contexts/UserInfoContext';

const BucketNotificationHandler: React.FC = () => {
	const { socket } = useSocket();
	const { user } = useUserInfo();

	useEffect(() => {
		if (socket) {
			// 1. Listen for personal bucket timer expiration
			const handleTimerElapsed = (data: { bucketId: string, bucketName: string, message: string }) => {
				toast.info(data.message, {
					duration: 10000,
					description: 'Please transition to your next assigned task.',
					action: {
						label: 'View Buckets',
						onClick: () => window.location.href = '/buckets'
					}
				});
			};

			// 2. Listen for member expiration (if user is a supervisor/admin)
			const handleMemberExpired = (data: { memberId: string, memberName: string, bucketId: string, bucketName: string, message: string }) => {
				toast.warning(data.message, {
					duration: 10000,
					description: `Time expired for ${data.memberName}.`,
					action: {
						label: 'Manage Team',
						onClick: () => window.location.href = '/team-members'
					}
				});
			};

			socket.on('bucket_timer_elapsed', handleTimerElapsed);
			socket.on('bucket_member_expired', handleMemberExpired);

			return () => {
				socket.off('bucket_timer_elapsed', handleTimerElapsed);
				socket.off('bucket_member_expired', handleMemberExpired);
			};
		}
	}, [socket, user]);

	return null; // This component stays invisible
};

export default BucketNotificationHandler;
