'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Icon from './Icon';
import Dropdown from './Dropdown';
import UserDropdown from './UserDropdown';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import NotificationDropdown from './NotificationDropdown';
import NotificationsModal from './NotificationsModal';
import ThemeToggle from './ThemeToggle';
import { plusJakartaStyle } from '../Options';
import { useSocket } from '@/contexts/SocketContext';
import { playNotificationSound } from '@/utils/soundEffects';
import { toastSuccess } from '@/utils/toastWithSound';
import { setNavigating } from '@/utils/navigationState';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { useGetLineOfBusinessByCompanyIdForheaderQuery } from '@/store/services/lineOfBusinessApi';
import { useLogoutMutation } from '@/store/services/authApi';
import { useSelector, useDispatch } from 'react-redux';
import { logout as logoutAction, User } from '@/store/slices/authSlice';
import { statusApi } from '@/store/services/statusApi';
import { useGetNotificationsByLineOfBusinessIdQuery, useMarkNotificationAsReadMutation } from '@/store/services/notificationApi';

interface DashboardHeaderProps {
	name?: string;
	companyName?: string;
	userName?: string;
	userEmail?: string;
	userAvatar?: string;
	userIsOnline?: boolean;
	onCompanyChange?: (company: string) => void;
	onNotificationsClick?: () => void;
	onSettingsClick?: () => void;
	onStatusClick?: () => void;
	onEditProfileClick?: () => void;
	onLogoutClick?: () => void;
	companyOptions?: Array<{ value: string; label: string; }>;
	onMobileMenuToggle?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
	userIsOnline = true,
	onNotificationsClick,
	onStatusClick,
	onEditProfileClick,
	onLogoutClick,
	onMobileMenuToggle,
}) => {
	const router = useRouter();
	const dispatch = useDispatch();
	const pathname = usePathname();
	const [mounted, setMounted] = useState(false);
	const [hasStickyNotes, setHasStickyNotes] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
	const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
	const { isOffline, isOnline, status: socketStatus, disconnect: disconnectSocket, socket } = useSocket();
	const [logoutApi] = useLogoutMutation();
	const { isAdmin } = usePrivilege();

	// Get user from Redux store
	const reduxUser = useSelector((state: { auth: { user: User | null } }) => state.auth.user);

	// Determine the effective user to display
	const displayUser =
		mounted && reduxUser
			? {
				name:
					String(
						reduxUser.name ||
						`${reduxUser.firstName || ''} ${reduxUser.lastName || ''}`.trim() ||
						'User'
					),
				email: reduxUser.email,
				avatar: reduxUser.avatar,
				companyId: reduxUser.companyId || reduxUser.company?._id,
			}
			: null;

	const previousUnreadCount = useRef(0);
	const previousPathname = useRef(pathname);
	const isNavigating = useRef(false);
	const { setSelectedLineOfBusinessId, isLoading: isLobLoading, lineOfBusinessData: selectedLOBData, selectedLineOfBusinessId } = useLineOfBusiness();
	const companyId = selectedLOBData?.companyId || displayUser?.companyId || (reduxUser?.company as { _id?: string })?._id || '';

	const { data: lineOfBusinessData } = useGetLineOfBusinessByCompanyIdForheaderQuery(companyId, {
		skip: !companyId
	});

	// Notifications integration
	const { data: notificationsData, refetch: refetchNotifications } = useGetNotificationsByLineOfBusinessIdQuery(selectedLineOfBusinessId || '', {
		skip: !selectedLineOfBusinessId,
		// pollingInterval: 30000 // Poll every 30 seconds as fallback
	});

	const [markAsRead] = useMarkNotificationAsReadMutation();
	const notifications = React.useMemo(() => notificationsData?.notifications || [], [notificationsData]);

	const [lobOptions, setLobOptions] = useState<{ value: string; label: string; }[]>([]);
	const safeUserName = String(displayUser?.name ?? '');

	useEffect(() => {
		if (lineOfBusinessData && lineOfBusinessData.lineOfBusinesses) {
			const options = lineOfBusinessData.lineOfBusinesses.map((lob: { _id: string; lineOfBusinessName: string }) => ({
				value: lob?._id,
				label: lob?.lineOfBusinessName
			}));
			setLobOptions(options);

			// Auto-select first LOB if none selected
			if (options.length > 0 && !selectedLineOfBusinessId) {
				setSelectedLineOfBusinessId(options[0].value);
			}
		}
	}, [lineOfBusinessData, selectedLineOfBusinessId, setSelectedLineOfBusinessId]);

	// Socket integration for Line of Business updates
	useEffect(() => {
		if (!socket || !selectedLineOfBusinessId) return;

		// Join the Line of Business room
		socket.emit("joinLineOfBusiness", selectedLineOfBusinessId);
		console.log(`Socket: Joined Line of Business room ${selectedLineOfBusinessId}`);

		// Listen for status list updates
		const handleStatusListUpdate = (data: unknown) => {
			console.log("Socket: Status list updated", data);
			// Invalidate RTK Query cache for statuses
			dispatch(statusApi.util.invalidateTags(['Statuses']));
		};

		// Listen for notification updates
		const handleNotificationUpdate = () => {
			console.log("Socket: Notification updated");
			refetchNotifications();
		};

		socket.on("statusListUpdated", handleStatusListUpdate);
		socket.on("notificationUpdated", handleNotificationUpdate);

		return () => {
			socket.off("statusListUpdated", handleStatusListUpdate);
			socket.off("notificationUpdated", handleNotificationUpdate);
		};
	}, [socket, selectedLineOfBusinessId, dispatch, refetchNotifications]);

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

	// Detect new unread notifications and play sound (works even when panel is closed)
	// But don't play sounds during navigation
	useEffect(() => {
		// Don't play sounds if we're navigating between pages
		if (isNavigating.current) {
			// Update the count but don't play sounds
			const unreadNotifications = notifications.filter(n => !n.isRead);
			previousUnreadCount.current = unreadNotifications.length;
			return;
		}

		const unreadNotifications = notifications.filter(n => !n.isRead);
		const unreadCount = unreadNotifications.length;

		// Play sound when new unread notifications arrive (count increases)
		if (unreadCount > previousUnreadCount.current) {
			// Play sound for each new notification
			const newNotifications = unreadNotifications.slice(previousUnreadCount.current);
			newNotifications.forEach((notification, index) => {
				setTimeout(() => {
					playNotificationSound('new_notification', 'notifications');
				}, index * 150); // Stagger sounds if multiple notifications arrive
			});
		}

		previousUnreadCount.current = unreadCount;
	}, [pathname, notifications]);

	const handleNotificationClick = () => {
		// Don't play sound if we're navigating - NotificationDropdown will handle it
		if (isNavigating.current) {
			setIsNotificationPanelOpen(!isNotificationPanelOpen);
			onNotificationsClick?.();
			return;
		}

		setIsNotificationPanelOpen(!isNotificationPanelOpen);
		onNotificationsClick?.();
		// Note: Sound is now handled by NotificationDropdown component to avoid duplicate sounds
		// Close profile dropdown if open
		// setShowDropdown(false);
	};

	// Handle logout
	const handleLogout = async () => {
		try {
			// Call API to invalidate session on server
			await logoutApi().unwrap();

			// Disconnect socket connection
			disconnectSocket();
			// Logout from Redux
			dispatch(logoutAction());

			// Show success message
			toastSuccess('Logged out successfully');

			// Redirect to login page
			setTimeout(() => {
				router.push('/login');
			}, 500);
		} catch (error) {
			console.warn('Logout API failed, proceeding with local logout:', error);

			// Still perform client-side cleanup even if API fails
			disconnectSocket();
			dispatch(logoutAction());

			// Even if there's an error, redirect to login
			router.push('/login');
		}
	};

	// Check if sticky notes exist in localStorage
	useEffect(() => {
		const checkStickyNotes = () => {
			try {
				const savedNotes = localStorage.getItem('stickyNotes');
				if (savedNotes) {
					const parsed = JSON.parse(savedNotes);
					setHasStickyNotes(Array.isArray(parsed) && parsed.length > 0);
				} else {
					setHasStickyNotes(false);
				}
			} catch {
				setHasStickyNotes(false);
			}
		};

		checkStickyNotes();

		// Check periodically for changes (in case notes are added/removed in another tab)
		const interval = setInterval(checkStickyNotes, 1000);

		// Listen for storage events from other tabs
		const handleStorageChange = () => {
			checkStickyNotes();
		};

		// Check when window gains focus (user returns to page)
		const handleFocus = () => {
			checkStickyNotes();
		};

		window.addEventListener('storage', handleStorageChange);
		window.addEventListener('focus', handleFocus);

		return () => {
			clearInterval(interval);
			window.removeEventListener('storage', handleStorageChange);
			window.removeEventListener('focus', handleFocus);
		};
	}, []);

	const handleNoteIconClick = () => {
		// Store that user wants to see notes on current page
		localStorage.setItem('showStickyNotes', 'true');

		if (pathname !== '/dashboard') {
			// Navigate to dashboard, or trigger a custom event to show notes on current page
			window.dispatchEvent(new CustomEvent('showStickyNotes'));
			// router.push('/dashboard');
		} else {
			// Already on dashboard, just ensure notes are visible
			window.dispatchEvent(new CustomEvent('showStickyNotes'));
		}
	};

	return (
		<header id="header" >
			<div className="flex items-center justify-between py-2.5">
				{/* Menu Toggle - Mobile Only */}
				<button
					onClick={onMobileMenuToggle}
					className="md:hidden p-2 text-black dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
					title="Menu"
				>
					<HamburgerMenuIcon className="w-6 h-6 " />
				</button>

				<div className="flex-1 md:flex-none">
					<div className="hidden md:flex items-center gap-2">
						<Icon name="peoplelyHalf" size="xl" color="black" className="dark:hidden" />
						<Icon name="peoplelyHalf" size="xl" className="hidden dark:inline-block" />
						<span className="font-semibold text-[25px] leading-[28px] flex items-center text-[#050711]"
							style={{ color: 'var(--text-primary)', ...plusJakartaStyle }}>Peoplely</span>
					</div>
				</div>



				{/* Right side - Icons */}
				<div className="flex items-center justify-center gap-4">
					{/* Offline Indicator */}
					{(isOffline || socketStatus === 'offline') && (
						<div
							className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
							style={{
								backgroundColor: 'var(--status-error)',
								color: 'var(--text-inverse)',
							}}
							title="Offline - Messages will be queued"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
								/>
							</svg>
							<span className="text-xs font-medium hidden sm:inline">Offline</span>
						</div>
					)}

					{/* Dark/Light Mode Toggle */}
					<ThemeToggle />

					{/* LOB Dropdown - Only for Administrator */}
					{isAdmin && (
						<Dropdown
							label=""
							value={selectedLOBData?.lineOfBusiness?._id || selectedLOBData?._id || ''}
							onChange={(value) => {
								const stringValue = Array.isArray(value) ? value[0] : value;
								if (stringValue) {
									setSelectedLineOfBusinessId(stringValue);
								}
							}}
							options={lobOptions}
							placeholder={isLobLoading ? "Loading..." : "Select Business"}
							className="min-w-[150px]"
						/>
					)}

					{/* Sticky Notes Icon - Only show if notes exist */}
					{hasStickyNotes && (
						<button
							onClick={handleNoteIconClick}
							className="hidden md:inline-flex p-2 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer relative"
							style={{
								color: 'var(--text-tertiary)',
								backgroundColor: 'transparent'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.color = 'var(--text-primary)';
								e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.color = 'var(--text-tertiary)';
								e.currentTarget.style.backgroundColor = 'transparent';
							}}
							title="View Sticky Notes"
						>
							<Icon name="Edit_duotone_line" size="lg" />
							{/* Indicator dot */}
							<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
						</button>
					)}

					{/* Notifications Bell */}
					<div className="relative">
						<button
							onClick={handleNotificationClick}
							className="p-1 w-7 h-7 flex justify-center items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
							title="Notifications"
						>
							<Icon name="Bell_light" size="3xl" />
						</button>

						<NotificationDropdown
							isOpen={isNotificationPanelOpen}
							onClose={() => setIsNotificationPanelOpen(false)}
							notifications={notifications}
							onShowMore={() => {
								setIsNotificationPanelOpen(false);
								setIsNotificationsModalOpen(true);
							}}
							onMarkAsRead={(id) => markAsRead(id)}
						/>
					</div>

					{/* Notifications Modal - Render at header level so it persists */}
					{isNotificationsModalOpen && (
						<NotificationsModal
							isOpen={isNotificationsModalOpen}
							onClose={() => setIsNotificationsModalOpen(false)}
							notifications={notifications}
							onMarkAsRead={(id) => markAsRead(id)}
						/>
					)}

					{/* User Dropdown */}
					<UserDropdown
						userName={safeUserName}
						userEmail={displayUser?.email || ""}
						userAvatar={displayUser?.avatar || ""}
						isOnline={userIsOnline && isOnline && !isOffline && socketStatus !== 'offline'}
						onStatusClick={onStatusClick}
						onEditProfileClick={onEditProfileClick}
						onLogoutClick={onLogoutClick || handleLogout}
					/>
				</div>
			</div>
		</header>
	);
};

export default DashboardHeader;
