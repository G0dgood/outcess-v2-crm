'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { PersonIcon, Cross2Icon } from '@radix-ui/react-icons';
import { Notification } from '@/store/services/notificationApi';
import Pagination from './Pagination';
import Search from './Search';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';

interface NotificationsModalProps {
	isOpen: boolean;
	onClose: () => void;
	notifications: Notification[];
	onMarkAsRead?: (id: string) => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({
	isOpen,
	onClose,
	notifications,
	onMarkAsRead
}) => {
	const { lineOfBusinessData } = useLineOfBusiness();
	const primaryColor = lineOfBusinessData?.primaryColor || '#050711';
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
	const [isAnimating, setIsAnimating] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);
	const itemsPerPage = 10;

	// Handle opening/closing animation
	useEffect(() => {
		if (isOpen) {
			setShouldRender(true);
			document.body.style.overflow = 'hidden';
			// Trigger animation on next frame
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setIsAnimating(true);
				});
			});
		} else {
			// Start closing animation
			setIsAnimating(false);
			// Remove from DOM after animation completes
			const timer = setTimeout(() => {
				setShouldRender(false);
				document.body.style.overflow = 'unset';
			}, 300); // Match transition duration
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	// Close modal when pressing Escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
		}

		return () => {
			if (!isOpen) {
				document.body.style.overflow = 'unset';
			}
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isOpen, onClose]);

	// Filter and search notifications
	const filteredNotifications = useMemo(() => {
		let filtered = notifications;

		// Apply read/unread filter
		if (filter === 'unread') {
			filtered = filtered.filter(n => !n.isRead);
		} else if (filter === 'read') {
			filtered = filtered.filter(n => n.isRead);
		}

		// Apply search filter
		if (searchTerm) {
			const searchLower = searchTerm.toLowerCase();
			filtered = filtered.filter(n =>
				n.user.name.toLowerCase().includes(searchLower) ||
				n.message.toLowerCase().includes(searchLower)
			);
		}

		return filtered;
	}, [filter, searchTerm]);

	// Paginate notifications
	const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + itemsPerPage);

	// Update current page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [filter, searchTerm, notifications]);

	const unreadCount = notifications.filter(n => !n.isRead).length;

	if (!shouldRender) return null;

	return (
		<div className={`fixed inset-0 z-[60] overflow-hidden transition-opacity duration-300 ease-in-out ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out"
				onClick={onClose}
			/>

			{/* Modal Content */}
			<div
				className={`dark:bg-gray-900 w-full h-full flex flex-col transition-all duration-300 ease-in-out ${isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
				style={{ backgroundColor: 'var(--bg-primary)' }}
			>
				{/* Header */}
				<div
					className="dark:bg-gray-800 border-b dark:border-gray-700 px-8 py-5"
					style={{
						backgroundColor: 'var(--accent-white)',
						borderColor: 'var(--light-gray)'
					}}
				>
					<div className="flex justify-between items-center">
						<div>
							<h2
								className="text-2xl font-semibold dark:text-gray-100"
								style={{ color: 'var(--text-primary)' }}
							>
								Notifications
							</h2>
							<p
								className="text-sm dark:text-gray-400 mt-1"
								style={{ color: 'var(--text-tertiary)' }}
							>
								{filteredNotifications.length} {filteredNotifications.length === 1 ? 'notification' : 'notifications'}
								{unreadCount > 0 && ` • ${unreadCount} unread`}
							</p>
						</div>
						<button
							onClick={onClose}
							className="p-2 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
							style={{ color: 'var(--text-tertiary)' }}
							onMouseEnter={(e) => {
								e.currentTarget.style.color = 'var(--text-secondary)';
								e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.color = 'var(--text-tertiary)';
								e.currentTarget.style.backgroundColor = 'transparent';
							}}
							aria-label="Close"
						>
							<Cross2Icon className="w-5 h-5" />
						</button>
					</div>
				</div>

				{/* Search and Filters */}
				<div
					className="dark:bg-gray-800 border-b dark:border-gray-700 px-8 py-5"
					style={{
						backgroundColor: 'var(--accent-white)',
						borderColor: 'var(--light-gray)'
					}}
				>
					<div className="flex items-center gap-4">
						<Search
							placeholder="Search notifications..."
							value={searchTerm}
							onChange={setSearchTerm}
							className="flex-1 max-w-md"
							onSearch={(value) => console.log('Search triggered:', value)}
							onClear={() => setSearchTerm('')}
							showClearButton={true}
						/>
						<div className="flex items-center gap-2">
							<button
								onClick={() => setFilter('all')}
								className={`px-4 py-2 text-sm font-medium transition-colors ${filter === 'all'
									? 'dark:bg-gray-700 dark:text-gray-100'
									: 'dark:text-gray-400 dark:hover:text-gray-200'
									}`}
								style={{
									backgroundColor: filter === 'all' ? 'var(--bg-primary)' : 'transparent',
									color: filter === 'all' ? 'var(--text-primary)' : 'var(--text-tertiary)',
								}}
								onMouseEnter={(e) => {
									if (filter !== 'all') {
										e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
										e.currentTarget.style.color = 'var(--text-secondary)';
									}
								}}
								onMouseLeave={(e) => {
									if (filter !== 'all') {
										e.currentTarget.style.backgroundColor = 'transparent';
										e.currentTarget.style.color = 'var(--text-tertiary)';
									}
								}}
							>
								All
							</button>
							<button
								onClick={() => setFilter('unread')}
								className={`px-4 py-2 text-sm font-medium transition-colors ${filter === 'unread'
									? 'dark:bg-gray-700 dark:text-gray-100'
									: 'dark:text-gray-400 dark:hover:text-gray-200'
									}`}
								style={{
									backgroundColor: filter === 'unread' ? 'var(--bg-primary)' : 'transparent',
									color: filter === 'unread' ? 'var(--text-primary)' : 'var(--text-tertiary)',
								}}
								onMouseEnter={(e) => {
									if (filter !== 'unread') {
										e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
										e.currentTarget.style.color = 'var(--text-secondary)';
									}
								}}
								onMouseLeave={(e) => {
									if (filter !== 'unread') {
										e.currentTarget.style.backgroundColor = 'transparent';
										e.currentTarget.style.color = 'var(--text-tertiary)';
									}
								}}
							>
								Unread
							</button>
							<button
								onClick={() => setFilter('read')}
								className={`px-4 py-2 text-sm font-medium transition-colors ${filter === 'read'
									? 'dark:bg-gray-700 dark:text-gray-100'
									: 'dark:text-gray-400 dark:hover:text-gray-200'
									}`}
								style={{
									backgroundColor: filter === 'read' ? 'var(--bg-primary)' : 'transparent',
									color: filter === 'read' ? 'var(--text-primary)' : 'var(--text-tertiary)',
								}}
								onMouseEnter={(e) => {
									if (filter !== 'read') {
										e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
										e.currentTarget.style.color = 'var(--text-secondary)';
									}
								}}
								onMouseLeave={(e) => {
									if (filter !== 'read') {
										e.currentTarget.style.backgroundColor = 'transparent';
										e.currentTarget.style.color = 'var(--text-tertiary)';
									}
								}}
							>
								Read
							</button>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-8">
					{/* Notifications List */}
					<div
						className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden"
						style={{
							backgroundColor: 'var(--accent-white)',
							borderColor: 'var(--light-gray)'
						}}
					>
						{paginatedNotifications.length > 0 ? (
							<div>
								{paginatedNotifications.map((notification) => (
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
											e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.backgroundColor = notification.isRead ? 'var(--accent-white)' : 'var(--pale-mint-green)';
										}}
									>
										<div className="flex items-start space-x-3">
											{/* User Avatar or Icon */}
											<div className="shrink-0">
												{notification.user.avatar ? (
													<img
														src={notification.user.avatar}
														alt={notification.user.name}
														className="w-10 h-10 rounded-full border-2"
														style={{ borderColor: primaryColor }}
													/>
												) : (
													<PersonIcon
														className="w-5 h-5 dark:text-gray-300"
														style={{ color: primaryColor }}
													/>
												)}
											</div>

											{/* Notification Content */}
											<div className="flex-1 min-w-0">
												<div className="flex items-start justify-between">
													<div className="flex-1">
														<p
															className="text-sm dark:text-gray-300 leading-relaxed"
															style={{ color: 'var(--text-tertiary)' }}
														>
															<span
																className="font-inter not-italic font-medium text-sm leading-[145%] dark:text-gray-100 font-features"
																style={{ color: 'var(--text-primary)' }}
															>
																{notification.user.name}
															</span>{' '}
															{notification.message}
															<span
																className="text-xs dark:text-gray-400 mt-1 block"
																style={{ color: 'var(--text-tertiary)' }}
															>
																{notification.timestamp}
															</span>
														</p>
													</div>

													{/* Unread Indicator */}
													{!notification.isRead && (
														<div
															className="w-2 h-2 rounded-full shrink-0 ml-2 mt-1"
															style={{ backgroundColor: primaryColor }}
														/>
													)}
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="p-12 text-center">
								<p
									className="text-sm dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									No notifications found
								</p>
							</div>
						)}
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="mt-6 flex justify-center">
							<Pagination
								currentPage={currentPage}
								totalPages={totalPages}
								onPageChange={setCurrentPage}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default NotificationsModal;

