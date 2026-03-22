"use client";

import React, { useEffect, useRef } from 'react';
import { PersonIcon } from '@radix-ui/react-icons';
import { usePathname } from 'next/navigation';
import { playNotificationSound } from '@/utils/soundEffects';
import { setNavigating } from '@/utils/navigationState';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { Notification, NotificationUser } from '@/store/services/notificationApi';

interface NotificationDropdownProps {
	isOpen: boolean;
	onClose: () => void;
	notifications: Notification[];
	className?: string;
	onShowMore?: () => void;
	onMarkAsRead?: (id: string) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
	isOpen,
	onClose,
	notifications,
	className = '',
	onShowMore,
	onMarkAsRead
}) => {
	const { lineOfBusinessData, isLoading: isLobLoading } = useLineOfBusiness();
	const pathname = usePathname();
	const primaryColor = lineOfBusinessData?.primaryColor || '#050711';
	const hasPlayedOpenSound = useRef(false);
	const playedNotificationIds = useRef<Set<string>>(new Set());
	const previousPathname = useRef(pathname);
	const isNavigating = useRef(false);
	const { selectedLineOfBusinessId } = useLineOfBusiness();
	const previousLobId = useRef(selectedLineOfBusinessId);
	const isInitialOpen = useRef(true);

	// Track navigation to prevent sounds during page switches
	useEffect(() => {
		if (previousPathname.current !== pathname) {
			isNavigating.current = true;
			previousPathname.current = pathname;
			// Set global navigation state
			setNavigating(true);
			// Reset navigation flag after a short delay
			setTimeout(() => {
				isNavigating.current = false;
			}, 1000);
		}
	}, [pathname]);

	// Map notification type to sound type
	const getSoundTypeForNotification = (type: Notification['type']): 'follow' | 'like' | 'join_request' | 'group_activity' | 'comment' | 'welcome' | 'notification' => {
		switch (type) {
			case 'status_created':
			case 'role_updated':
			case 'custom_alert':
				return 'notification';
			default:
				return type;
		}
	};

	// Play sound when notification panel opens (but not during navigation)
	useEffect(() => {
		// Don't play sound if we're navigating between pages
		if (isNavigating.current) {
			if (!isOpen) {
				hasPlayedOpenSound.current = false;
			}
			return;
		}

		if (isOpen && !hasPlayedOpenSound.current) {
			hasPlayedOpenSound.current = true;
			playNotificationSound('panel_open', 'panelOpen');
		}

		if (!isOpen) {
			hasPlayedOpenSound.current = false;
		}
	}, [isOpen, pathname]);

	// Play sounds for new unread notifications (but not during navigation or LOB switch)
	useEffect(() => {
		if (!isOpen || isNavigating.current || isLobLoading) {
			if (!isOpen) isInitialOpen.current = true;
			return;
		}

		// If this is the first time the effect runs after opening,
		// mark all current unread notifications as "played" to silence the backlog
		if (isInitialOpen.current) {
			notifications.forEach(n => {
				if (!n.isRead) playedNotificationIds.current.add(n.id);
			});
			isInitialOpen.current = false;
			return;
		}

		// If LOB has changed, mark all current unread notifications as "played" to skip sounds
		if (previousLobId.current !== selectedLineOfBusinessId) {
			previousLobId.current = selectedLineOfBusinessId;
			notifications.forEach(n => {
				if (!n.isRead) playedNotificationIds.current.add(n.id);
			});
			// Also reset the navigation flag to be safe
			isNavigating.current = true;
			setTimeout(() => {
				isNavigating.current = false;
			}, 2000);
			return;
		}

		notifications.forEach((notification) => {
			// Only play sound for unread notifications that haven't been played yet
			if (!notification.isRead && !playedNotificationIds.current.has(notification.id)) {
				playedNotificationIds.current.add(notification.id);
				// Small delay to avoid overlapping sounds
				setTimeout(() => {
					// Double-check we're still not navigating before playing
					if (!isNavigating.current) {
						const soundType = getSoundTypeForNotification(notification.type);
						playNotificationSound(soundType, 'notifications');
					}
				}, 100 * playedNotificationIds.current.size);
			}
		});
	}, [notifications, isOpen, pathname, selectedLineOfBusinessId]);

	// Clean up played notification IDs when panel closes
	useEffect(() => {
		if (!isOpen) {
			// Keep track of read notifications to avoid replaying
			notifications.forEach((notification) => {
				if (notification.isRead) {
					playedNotificationIds.current.add(notification.id);
				}
			});
		}
	}, [isOpen, notifications]);

	if (!isOpen) return null;

	return (
		<>
			{/* Dropdown */}
			{isOpen && (
				<div
					className={`absolute top-full right-0 mt-2 w-90 dark:bg-gray-800 border dark:border-gray-700 shadow-xl z-50 overflow-hidden ${className}`}
					style={{
						backgroundColor: 'var(--accent-white)',
						borderColor: 'var(--light-gray)'
					}}
				>
					{/* Header */}
					<div
						className="flex items-center justify-between p-4 dark:bg-gray-800 border-b dark:border-gray-700 shadow-[0px_6px_27px_rgba(19,25,19,0.07)] dark:shadow-none"
						style={{
							backgroundColor: 'var(--accent-white)',
							borderColor: 'var(--light-gray)'
						}}
					>
						<h3
							className="text-[12px] md:text-[14px] dark:text-gray-100 font-inter font-medium text-[12px] md:text-[14px] leading-[120%] flex items-center tracking-[-0.02em]"
							style={{ color: 'var(--text-primary)' }}
						>
							Notification ({notifications.filter(n => !n.isRead).length})
						</h3>
						<button
							onClick={onClose}
							className="dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
							style={{ color: 'var(--text-primary)' }}
							onMouseEnter={(e) => {
								e.currentTarget.style.color = 'var(--text-primary)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.color = 'var(--text-primary)';
							}}
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					{/* Notifications List */}
					<div className="max-h-96 overflow-y-auto">
						{notifications.map((notification) => (
							<div
								key={notification.id}
								onClick={() => {
									if (!notification.isRead && onMarkAsRead) {
										onMarkAsRead(notification.id);
									}
								}}
								className={`p-4 border-b dark:border-gray-700 dark:hover:bg-gray-700 transition-colors cursor-pointer ${!notification.isRead ? 'dark:bg-green-900/20' : 'dark:bg-gray-800'
									}`}
								style={{
									borderColor: 'var(--light-gray)',
									backgroundColor: notification.isRead ? 'var(--accent-white)' : 'var(--pale-mint-green)'
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
									const textElements = e.currentTarget.querySelectorAll('p, span');
									textElements.forEach(el => (el as HTMLElement).style.color = 'var(--text-primary)');
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = notification.isRead ? 'var(--accent-white)' : 'var(--pale-mint-green)';
									const textElements = e.currentTarget.querySelectorAll('p, span');
									textElements.forEach(el => (el as HTMLElement).style.color = '');
								}}
							>
								<div className="flex items-start space-x-3">
									{/* User Avatar or Icon */}
									<div className="shrink-0">
										<PersonIcon
											className="w-5 h-5 dark:text-gray-300"
											style={{ color: primaryColor }}
										/>
									</div>

									{/* Notification Content */}
									<div className="flex-1 min-w-0">
										<div className="flex items-start justify-between">
											<div className="">
												<p
													className="text-[10px] md:text-[12px] dark:text-gray-300 leading-relaxed"
													style={{ color: 'var(--text-tertiary)' }}
												>
													<span
														className="font-inter not-italic font-medium text-[10px] md:text-[12px] leading-[145%] dark:text-gray-100 font-features"
														style={{ color: 'var(--text-primary)' }}
													>
														{notification.user.name}
													</span> {notification.message}
													<span
														className="text-[8px] md:text-[10px] dark:text-gray-400 mt-1"
														style={{ color: 'var(--text-tertiary)' }}
													>
														-{notification.timestamp}
													</span>
												</p>

											</div>

											{/* Action Menu */}
											<button
												className="dark:text-gray-500 dark:hover:text-gray-300 transition-colors ml-2"
												style={{ color: 'var(--text-tertiary)' }}
												onMouseEnter={(e) => {
													e.currentTarget.style.color = 'var(--text-secondary)';
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.color = 'var(--text-tertiary)';
												}}
											>
												<svg className="cursor-pointer w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
													<path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
												</svg>
											</button>
										</div>
									</div>


								</div>
							</div>
						))}
					</div>

					{/* Footer */}
					<div
						className="p-4 dark:bg-gray-800 border-t dark:border-gray-700 text-center shadow-[0px_6px_27px_rgba(19,25,19,0.07)] dark:shadow-none"
						style={{
							backgroundColor: 'var(--accent-white)',
							borderColor: 'var(--light-gray)'
						}}
					>
						<button
							onClick={() => {
								if (onShowMore) {
									onShowMore();
								} else {
									onClose();
								}
							}}
							className="text-[10px] md:text-[12px] dark:text-gray-300 dark:hover:text-gray-100 font-medium transition-colors font-inter not-italic leading-[145%] font-features cursor-pointer"
							style={{ color: 'var(--text-primary)' }}
							onMouseEnter={(e) => {
								e.currentTarget.style.color = 'var(--text-primary)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.color = 'var(--text-primary)';
							}}
						>
							Show more
						</button>
					</div>

				</div>
			)}
		</>
	);
};

export default NotificationDropdown;
export type { Notification, NotificationUser };
