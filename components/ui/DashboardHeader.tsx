'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from '@bprogress/next/app';
import Button from './Button';
import Icon from './Icon';
import Dropdown from './Dropdown';
import UserDropdown from './UserDropdown';
import StatusBadge from './StatusBadge';
import LogoutConfirmationModal from './LogoutConfirmationModal';
import { HamburgerMenuIcon, Cross1Icon } from '@radix-ui/react-icons';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import { useSocket } from '@/contexts/SocketContext';
import { playNotificationSound } from '@/utils/soundEffects';
import { toastSuccess } from '@/utils/toastWithSound';
import { setNavigating } from '@/utils/navigationState';
import { useCampaign } from '@/contexts/CampaignContext';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { useGetCampaignByCompanyIdForheaderQuery } from '@/store/services/campaignApi';
import { useLogoutMutation, useTeamMemberLogoutMutation, useUpdateUserMutation } from '@/store/services/authApi';
import { useUpdateTeamMemberStatusMutation } from '@/store/services/teamMembersApi';
import { useSelector, useDispatch } from 'react-redux';
import { logout as logoutAction, User } from '@/store/slices/authSlice';
import { statusApi } from '@/store/services/statusApi';
import { useGetNotificationsByCampaignIdQuery, useMarkNotificationAsReadMutation } from '@/store/services/notificationApi';
import { useGetStickyNotesQuery } from '@/store/services/stickyNoteApi';
import { useAuth } from '@/contexts/AuthContext';
import HibernateOverlay from './HibernateOverlay';

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

	const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
	const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const { isOffline, isOnline, status: socketStatus, disconnect: disconnectSocket, socket } = useSocket();
	const [logoutApi] = useLogoutMutation();
	const [teamMemberLogoutApi] = useTeamMemberLogoutMutation();
	const [updateTeamMemberStatus] = useUpdateTeamMemberStatusMutation();
	const [updateUser] = useUpdateUserMutation();
	const { isAdmin, canAccess } = usePrivilege();
	const { logout: contextLogout } = useAuth();

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
	const { setSelectedCampaignId, isLoading: isLobLoading, campaignData: selectedLOBData, selectedCampaignId } = useCampaign();
	const previousLobId = useRef(selectedCampaignId);
	const companyId = selectedLOBData?.companyId || displayUser?.companyId || (reduxUser?.company as { _id?: string })?._id || '';

	const { data: campaignData } = useGetCampaignByCompanyIdForheaderQuery({ companyId }, {
		skip: !companyId
	});

	// Notifications integration
	const { data: notificationsData, refetch: refetchNotifications } = useGetNotificationsByCampaignIdQuery(selectedCampaignId || '', {
		skip: !selectedCampaignId,
		// pollingInterval: 30000 // Poll every 30 seconds as fallback
	});

	const [markAsRead] = useMarkNotificationAsReadMutation();
	const notifications = React.useMemo(() => notificationsData?.notifications || [], [notificationsData]);
	const unreadCount = React.useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

	const [lobOptions, setLobOptions] = useState<{ value: string; label: string; status?: string }[]>([]);
	const safeUserName = String(displayUser?.name ?? '');



	useEffect(() => {
		const data = campaignData as { campaigns?: { _id: string; campaignName: string; status?: string }[] } | undefined;
		if (data && Array.isArray(data.campaigns)) {
			const options = data?.campaigns?.map((lob) => ({
				value: lob?._id,
				label: lob?.campaignName,
				status: lob?.status,
			}));
			setLobOptions(options);

			// Auto-select first LOB if none selected
			if (options.length > 0 && !selectedCampaignId) {
				setSelectedCampaignId(options[0].value);
			}
		}
	}, [campaignData, selectedCampaignId, setSelectedCampaignId]);

	// Socket integration for Campaign updates
	useEffect(() => {
		if (!socket || !selectedCampaignId) return;

		// Join the Campaign room
		socket.emit("joinCampaign", selectedCampaignId);


		// Listen for status list updates
		const handleStatusListUpdate = () => {

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
	}, [socket, selectedCampaignId, dispatch, refetchNotifications]);

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
		if (previousLobId.current !== selectedCampaignId) {
			previousLobId.current = selectedCampaignId;
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
	}, [pathname, notifications, selectedCampaignId, isLobLoading]);

	const handleNotificationToggle = (isOpen: boolean) => {
		if (isOpen) setIsUserDropdownOpen(false);
		onNotificationsClick?.();
	};

	// Trigger logout modal
	const handleLogout = () => {
		setIsUserDropdownOpen(false);
		setIsLogoutModalOpen(true);
	};

	// Perform actual logout after confirmation
	const handleConfirmLogout = async () => {
		setIsLoggingOut(true);
		try {
			// Explicitly update status to "Logged out" FIRST before calling logout API
			if (reduxUser?.id) {
				const statusData = {
					status: "Logged out",
					color: "#FF0000",
					reason: "User confirmed logout"
				};

				try {
					if (isAdmin) {
						// Use direct user update for admins
						await updateUser({
							id: reduxUser.id,
							data: { status: statusData }
						}).unwrap();
					} else {
						// Otherwise try team member status update
						try {
							await updateTeamMemberStatus({
								id: reduxUser.id,
								status: "Logged out",
								reason: "User confirmed logout"
							}).unwrap();
						} catch (err: unknown) {
							const errorObj = err as { status?: number; data?: { message?: string } };
							// Fallback to updateUser if team member not found (404)
							if (errorObj?.status === 404 ||
								errorObj?.data?.message?.toLowerCase().includes('not found') ||
								errorObj?.data?.message?.toLowerCase().includes('team member')) {

								await updateUser({
									id: reduxUser.id,
									data: { status: statusData }
								}).unwrap();
							} else {
								throw err;
							}
						}
					}
					console.log('Status updated to Logged out before session termination');

					// Emit socket update for real-time tracking
					if (socket && socket.connected) {
						socket.emit('teamMemberStatusUpdate', {
							teamMemberId: reduxUser.id,
							name: displayUser?.name,
							status: statusData,
							timestamp: new Date().toISOString()
						});
					}
				} catch (statusError) {
					console.warn('Failed to update status explicitly, proceeding with logout sequence:', statusError);
				}
			}

			// Call API to invalidate session on server
			if (reduxUser?.id) {
				if (reduxUser.isTeamMember) {
					await teamMemberLogoutApi({ userId: reduxUser.id }).unwrap();
				} else {
					await logoutApi({ userId: reduxUser.id }).unwrap();
				}
			} else {
				console.warn('No user ID found for logout API call');
			}

			// Disconnect socket connection
			disconnectSocket();
			// Logout from Redux
			dispatch(logoutAction());
			// Logout from Context
			contextLogout();

			// Show success message
			toastSuccess('Logged out successfully');

			// Close modal
			setIsLogoutModalOpen(false);

			// Redirect to login page
			setTimeout(() => {
				router.push('/');
			}, 500);
		} catch (error) {
			console.warn('Logout API failed, proceeding with local logout:', error);

			// Still perform client-side cleanup even if API fails
			disconnectSocket();
			dispatch(logoutAction());
			contextLogout();

			// Close modal
			setIsLogoutModalOpen(false);

			// Even if there's an error, redirect to login
			router.push('/');
		} finally {
			setIsLoggingOut(false);
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
				<Button
					variant="ghost"
					size="sm"
					onClick={onMobileMenuToggle}
					className="md:hidden p-2 text-black dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer rounded-[var(--radius)]"
					title="Menu"
				>
					<div className={`transition-all duration-300 ease-in-out transform ${isMobileMenuOpen ? 'rotate-90 scale-110' : 'rotate-0 scale-100'}`}>
						{isMobileMenuOpen ? (
							<Cross1Icon className="w-6 h-6" />
						) : (
							<HamburgerMenuIcon className="w-6 h-6 " />
						)}
					</div>
				</Button>
				<div>
					{(isAdmin || canAccess('dashboard', 'edit')) && (
						<Dropdown
							label=""
							value={selectedLOBData?._id || ''}
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
								setSelectedCampaignId(stringValue);
								// Reset navigation flag after a delay
								setTimeout(() => {
									isNavigating.current = false;
								}, 2000);
							}}
							options={lobOptions}
							placeholder={isLobLoading ? "Loading..." : "Select Campaign"}
							className="min-w-[200px]"
							renderOptionRight={(option) => (
								<StatusBadge status={option.status || 'In Review'} />
							)}
						/>
					)}

				</div>
				{/* Right side - Icons */}
				<div className="flex items-center justify-center gap-5">
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

					{/* LOB Dropdown - Only for Administrator or users with Dashboard Edit permission */}

					{/* Dark/Light Mode Toggle */}
					<ThemeToggle />



					{/* Sticky Notes Icon - Only show if notes exist */}
					{hasStickyNotes && (
						<button
							onClick={handleNoteIconClick}
							className="hidden md:inline-flex p-2 dark:text-gray-300 dark:hover:text-gray-100 transition-colors cursor-pointer relative rounded-[var(--radius)] "
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
					<NotificationBell
						notifications={notifications}
						unreadCount={unreadCount}
						onMarkAsRead={(id) => markAsRead(id)}
						onToggle={handleNotificationToggle}
						isNavigating={isNavigating.current}
					/>

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
						}}
					/>
				</div>
			</div>

			<LogoutConfirmationModal
				isOpen={isLogoutModalOpen}
				onClose={() => setIsLogoutModalOpen(false)}
				onConfirm={handleConfirmLogout}
				isLoading={isLoggingOut}
				initials={displayUser?.name?.charAt(0).toUpperCase() || 'U'}
				status={reduxUser?.status?.status || (isOnline ? 'Online' : 'Offline')}
				statusColor={reduxUser?.status?.color || (isOnline ? '#22C55E' : '#94A3B8')}
			/>

			{/* Hibernate Overlay Enforcement */}
			{reduxUser?.status?.isHibernate && (
				<HibernateOverlay
					userId={reduxUser.id}
					userName={safeUserName}
					statusName={reduxUser.status.status || 'Hibernate'}
					statusColor={reduxUser.status.color || '#6366f1'}
					duration={reduxUser.status.duration}
					statusUpdatedAt={reduxUser.status.statusUpdatedAt?.toString()}
				/>
			)}
		</header>
	);
};

export default DashboardHeader;

