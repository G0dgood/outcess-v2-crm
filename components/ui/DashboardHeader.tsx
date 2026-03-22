'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from '@bprogress/next/app';
import Icon from './Icon';
import Dropdown from './Dropdown';
import UserDropdown from './UserDropdown';
import StatusBadge from './StatusBadge';
import { HamburgerMenuIcon, Cross1Icon } from '@radix-ui/react-icons';
import NotificationDropdown from './NotificationDropdown';
import NotificationsModal from './NotificationsModal';
import ThemeToggle from './ThemeToggle';
import { useSocket } from '@/contexts/SocketContext';
import { playNotificationSound } from '@/utils/soundEffects';
import { toastSuccess } from '@/utils/toastWithSound';
import { setNavigating } from '@/utils/navigationState';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { useGetLineOfBusinessByCompanyIdForheaderQuery } from '@/store/services/lineOfBusinessApi';
import { useLogoutMutation, useTeamMemberLogoutMutation } from '@/store/services/authApi';
import { useSelector, useDispatch } from 'react-redux';
import { logout as logoutAction, User } from '@/store/slices/authSlice';
import { statusApi } from '@/store/services/statusApi';
import { useGetNotificationsByLineOfBusinessIdQuery, useMarkNotificationAsReadMutation } from '@/store/services/notificationApi';
import { useGetStickyNotesQuery } from '@/store/services/stickyNoteApi';

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
	isMobileMenuOpen?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
	userIsOnline = true,
	onNotificationsClick,
	onStatusClick,
	onEditProfileClick,
	onLogoutClick,
	onMobileMenuToggle,
	isMobileMenuOpen = false,
}) => {
	const router = useRouter();
	const dispatch = useDispatch();
	const pathname = usePathname();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
	const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
	const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
	const { isOffline, isOnline, status: socketStatus, disconnect: disconnectSocket, socket } = useSocket();
	const [logoutApi] = useLogoutMutation();
	const [teamMemberLogoutApi] = useTeamMemberLogoutMutation();
	const { isAdmin, canAccess } = usePrivilege();

	// Get user from Redux store
	const reduxUser = useSelector((state: { auth: { user: User | null } }) => state.auth.user);

	// Determine the effective user to display
	const displayUser =
		mounted && reduxUser
			? {
				name:
					String(
						reduxUser.name ||
						`${reduxUser.firstName || ''} 
						${reduxUser.lastName ||
							''}`.trim() ||
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
	const previousLobId = useRef(selectedLineOfBusinessId);
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
	const unreadCount = React.useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

	const [lobOptions, setLobOptions] = useState<{ value: string; label: string; status?: string }[]>([]);
	const safeUserName = String(displayUser?.name ?? '');

	const currentLOB = selectedLOBData?.lineOfBusiness || selectedLOBData;

	useEffect(() => {
		const data = lineOfBusinessData as { lineOfBusinesses?: { _id: string; lineOfBusinessName: string; status?: string }[] } | undefined;
		if (data && Array.isArray(data.lineOfBusinesses)) {
			const options = data.lineOfBusinesses.map((lob) => ({
				value: lob?._id,
				label: lob?.lineOfBusinessName,
				status: lob?.status,
			}));
			setLobOptions(options);

			// Auto-select first LOB if none selected
			if (options.length > 0 && !selectedLineOfBusinessId) {
				setSelectedLineOfBusinessId(options[0].value);
			}
		}
	}, [lineOfBusinessData, selectedLineOfBusinessId, setSelectedLineOfBusinessId]);

	const currentStatus = (currentLOB as { status?: string } | undefined)?.status || '';

	// Socket integration for Line of Business updates
	useEffect(() => {
		if (!socket || !selectedLineOfBusinessId) return;

		// Join the Line of Business room
		socket.emit("joinLineOfBusiness", selectedLineOfBusinessId);


		// Listen for status list updates
		const handleStatusListUpdate = (_data: unknown) => {
			console.log("Status list updated:", _data);
			// Invalidate RTK Query cache for statuses
			dispatch(statusApi.util.invalidateTags(['Statuses']));
		};

		// Listen for notification updates
		const handleNotificationUpdate = () => {
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
	// But don't play sounds during navigation or LOB switch
	useEffect(() => {
		// Don't play sounds if we're navigating between pages
		// or if the data is still loading
		if (isNavigating.current || isLobLoading) {
			// Update the count but don't play sounds
			const unreadNotifications = notifications.filter(n => !n.isRead);
			previousUnreadCount.current = unreadNotifications.length;
			return;
		}

		// Don't play sounds if the LOB has just changed
		if (previousLobId.current !== selectedLineOfBusinessId) {
			previousLobId.current = selectedLineOfBusinessId;
			const unreadNotifications = notifications.filter(n => !n.isRead);
			previousUnreadCount.current = unreadNotifications.length;
			// Also reset the navigation flag to be safe
			isNavigating.current = true;
			setTimeout(() => {
				isNavigating.current = false;
			}, 2000);
			return;
		}

		const unreadNotifications = notifications.filter(n => !n.isRead);
		const unreadCount = unreadNotifications.length;

		// Play sound when new unread notifications arrive (count increases)
		// Only if we already had a count (avoid sound on first load/hydration)
		if (unreadCount > previousUnreadCount.current && previousUnreadCount.current > 0) {
			// Play sound for each new notification
			const newNotifications = unreadNotifications.slice(previousUnreadCount.current);
			newNotifications.forEach((notification, index) => {
				setTimeout(() => {
					// Final check before playing
					if (!isNavigating.current) {
						playNotificationSound('new_notification', 'notifications');
					}
				}, index * 150); // Stagger sounds if multiple notifications arrive
			});
		}

		previousUnreadCount.current = unreadCount;
	}, [pathname, notifications, selectedLineOfBusinessId, isLobLoading]);

	const handleNotificationClick = () => {
		// Don't play sound if we're navigating - NotificationDropdown will handle it
		if (isNavigating.current) {
			setIsNotificationPanelOpen(!isNotificationPanelOpen);
			if (!isNotificationPanelOpen) setIsUserDropdownOpen(false);
			onNotificationsClick?.();
			return;
		}

		const newState = !isNotificationPanelOpen;
		setIsNotificationPanelOpen(newState);
		if (newState) setIsUserDropdownOpen(false);
		onNotificationsClick?.();
		// Note: Sound is now handled by NotificationDropdown component to avoid duplicate sounds
		// Close profile dropdown if open
		// setShowDropdown(false);
	};

	// Handle logout
	const handleLogout = async () => {
		try {
			// Call API to invalidate session on server
			if (reduxUser?.id) {
				if (reduxUser.isTeamMember) {
					await teamMemberLogoutApi({ userId: reduxUser.id }).unwrap();
				} else {
					await logoutApi({ userId: reduxUser.id }).unwrap();
				}
			} else {
				// If no user ID, just call without or skip API call? 
				// The API now requires userId. If we don't have it, we probably can't call the API effectively.
				// But let's try to call it with empty string if really needed, or just skip.
				// Given the requirement, I should probably only call it if I have an ID.
				// But to be safe and clear state, maybe I should just proceed to local logout if ID is missing.
				console.warn('No user ID found for logout API call');
			}

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

	// Check if sticky notes exist via API
	const { data: stickyNotesData } = useGetStickyNotesQuery(reduxUser?.id || '', {
		skip: !reduxUser?.id
	});
	const hasStickyNotes = (stickyNotesData?.stickyNotes?.length || 0) > 0;

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
					<div className={`transition-all duration-300 ease-in-out transform ${isMobileMenuOpen ? 'rotate-90 scale-110' : 'rotate-0 scale-100'}`}>
						{isMobileMenuOpen ? (
							<Cross1Icon className="w-6 h-6" />
						) : (
							<HamburgerMenuIcon className="w-6 h-6 " />
						)}
					</div>
				</button>

				<div />
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
							<Icon name="cloud-off" size="sm" color="white" />
							<span className="text-[8px] md:text-[10px] font-medium hidden sm:inline">Offline</span>
						</div>
					)}

					{/* Dark/Light Mode Toggle */}
					<ThemeToggle />

					{/* LOB Dropdown - Only for Administrator or users with Dashboard Edit permission */}
					{(isAdmin || canAccess('dashboard', 'edit')) && (
						<Dropdown
							label=""
							value={selectedLOBData?.lineOfBusiness?._id || selectedLOBData?._id || ''}
							onChange={(value) => {
								const stringValue = Array.isArray(value) ? value[0] : value;
								if (!stringValue) return;
								const target = lobOptions.find(o => o.value === stringValue);
								const targetStatus = target?.status?.toLowerCase() || '';
								if (targetStatus === 'in review') {
									return;
								}
								// Set navigating state to suppress sounds during LOB switch
								isNavigating.current = true;
								setNavigating(true);
								setSelectedLineOfBusinessId(stringValue);
								// Reset navigation flag after a delay
								setTimeout(() => {
									isNavigating.current = false;
								}, 2000);
							}}
							options={lobOptions}
							placeholder={isLobLoading ? "Loading..." : "Select Business"}
							className="min-w-[200px]"
							renderOptionRight={(option) => (
								<StatusBadge status={option.status || 'In Review'} />
							)}
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
								e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
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
							className="p-1 w-7 h-7 flex justify-center items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer relative"
							title="Notifications"
						>
							<Icon name="Bell_light" size="3xl" />
							{unreadCount > 0 && (
								<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-1 ring-white dark:ring-gray-800">
									{unreadCount > 99 ? '99+' : unreadCount}
								</span>
							)}
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
						user={reduxUser}
						userId={reduxUser?.id}
						userName={safeUserName}
						userEmail={displayUser?.email || ""}
						userAvatar={displayUser?.avatar || ""}
						isOnline={userIsOnline && isOnline && !isOffline && socketStatus !== 'offline'}
						currentStatus={reduxUser?.status ? (
							typeof reduxUser.status === 'string'
								? { status: reduxUser.status }
								: {
									status: reduxUser.status.status || (reduxUser.status as unknown as { name?: string }).name || (reduxUser.status as unknown as { label?: string }).label || 'Active',
									color: reduxUser.status.color
								}
						) : undefined}
						onStatusClick={onStatusClick}
						onEditProfileClick={onEditProfileClick}
						onLogoutClick={onLogoutClick || handleLogout}
						isOpen={isUserDropdownOpen}
						onToggle={(open) => {
							setIsUserDropdownOpen(open);
							if (open) setIsNotificationPanelOpen(false);
						}}
					/>
				</div>
			</div>
		</header>
	);
};

export default DashboardHeader;
