"use client";

import React from 'react';
import { PersonIcon } from '@radix-ui/react-icons';
import { useSetup } from '@/contexts/SetupContext';

interface NotificationUser {
	name: string;
	avatar?: string;
	icon?: string;
}

interface Notification {
	id: string;
	type: 'follow' | 'like' | 'join_request' | 'group_activity' | 'comment' | 'welcome';
	user: NotificationUser;
	message: string;
	timestamp: string;
	isRead: boolean;
}

interface NotificationDropdownProps {
	isOpen: boolean;
	onClose: () => void;
	notifications: Notification[];
	className?: string;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
	isOpen,
	onClose,
	notifications,
	className = ''
}) => {
	const { setupData } = useSetup();
	const primaryColor = setupData.primaryColor || '#050711';

	if (!isOpen) return null;




	return (
		<div className={`absolute top-full right-0 mt-2 w-90 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-hidden ${className}`}>
			{/* Header */}
			<div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-[0px_6px_27px_rgba(19,25,19,0.07)] dark:shadow-none">
				<h3 className="text-lg text-[#050711] dark:text-gray-100 font-inter font-medium text-[16px] leading-[120%] flex items-center tracking-[-0.02em]">
					Notification ({notifications.length})
				</h3>
				<button
					onClick={onClose}
					className="text-[#050711] dark:text-gray-300 hover:text-[#050711] dark:hover:text-gray-100 transition-colors"
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
						className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!notification.isRead ? 'bg-green-50 dark:bg-green-900/20' : 'bg-white dark:bg-gray-800'
							}`}
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
										<p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
											<span className="font-inter not-italic font-medium text-sm leading-[145%] text-[#050711] dark:text-gray-100 font-features">{notification.user.name}</span> {notification.message}
											<span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
												-{notification.timestamp}
											</span>
										</p>

									</div>

									{/* Action Menu */}
									<button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-2">
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
			<div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-center shadow-[0px_6px_27px_rgba(19,25,19,0.07)] dark:shadow-none">
				<button className="text-sm text-[#050711] dark:text-gray-300 hover:text-[#050711] dark:hover:text-gray-100 font-medium transition-colors font-inter not-italic leading-[145%] font-features">
					Show more
				</button>
			</div>
		</div>
	);
};

export default NotificationDropdown;
export type { Notification, NotificationUser };
