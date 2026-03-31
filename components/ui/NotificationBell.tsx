import React, { useState } from 'react';
import Icon from './Icon';
import NotificationDropdown from './NotificationDropdown';
import NotificationsModal from './NotificationsModal';
import { Notification as AppNotification } from '@/store/services/notificationApi';

interface NotificationBellProps {
	notifications: AppNotification[];
	unreadCount: number;
	onMarkAsRead: (id: string) => void;
	onToggle?: (isOpen: boolean) => void;
	isNavigating?: boolean;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
	notifications,
	unreadCount,
	onMarkAsRead,
	onToggle,
	isNavigating = false
}) => {
	const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
	const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);

	const handleNotificationClick = () => {
		// Suppress interaction during navigation if needed
		if (isNavigating) return;

		const newState = !isNotificationPanelOpen;
		setIsNotificationPanelOpen(newState);
		onToggle?.(newState);
	};

	const handleShowMore = () => {
		setIsNotificationPanelOpen(false);
		setIsNotificationsModalOpen(true);
	};

	return (
		<>
			<div className="relative">
				<button
					onClick={handleNotificationClick}
					className="p-1 w-8 h-8 flex justify-center items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors cursor-pointer relative rounded-[var(--radius)] hover:bg-gray-100"
					title="Notifications"
				>
					<Icon name="Bell_light" size="3xl" />
					{unreadCount > 0 && (
						<span className="absolute -top-1 -right-1 flex h-4 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-1 ring-white dark:ring-gray-800">
							{unreadCount > 99 ? '99+' : unreadCount}
						</span>
					)}
				</button>

				<NotificationDropdown
					isOpen={isNotificationPanelOpen}
					onClose={() => setIsNotificationPanelOpen(false)}
					notifications={notifications}
					onShowMore={handleShowMore}
					onMarkAsRead={onMarkAsRead}
				/>
			</div>

			{/* Notifications Modal */}
			{isNotificationsModalOpen && (
				<NotificationsModal
					isOpen={isNotificationsModalOpen}
					onClose={() => setIsNotificationsModalOpen(false)}
					notifications={notifications}
					onMarkAsRead={onMarkAsRead}
				/>
			)}
		</>
	);
};

export default NotificationBell;
