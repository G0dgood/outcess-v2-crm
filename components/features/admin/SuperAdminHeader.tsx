'use client';

import React from 'react';
import { HamburgerMenuIcon, Cross1Icon } from '@radix-ui/react-icons';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';
import NotificationBell from '@/components/ui/NotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useRouter } from '@bprogress/next/app';
import { toastSuccess } from '@/utils/toastWithSound';
import { useDispatch } from 'react-redux';
import { useLogoutMutation, useTeamMemberLogoutMutation } from '@/store/services/authApi';
import { logout as logoutAction } from '@/store/slices/authSlice';
import { useGetNotificationsByRoleQuery, useMarkNotificationAsReadMutation } from '@/store/services/notificationApi';
import SuperAdminUserDropdown from './SuperAdminUserDropdown';

interface SuperAdminHeaderProps {
	userName?: string;
	userEmail?: string;
	userAvatar?: string;
	isOnline?: boolean;
	onEditProfileClick?: () => void;
	onLogoutClick?: () => void;
	onMobileMenuToggle?: () => void;
	isMobileMenuOpen?: boolean;
}

const SuperAdminHeader: React.FC<SuperAdminHeaderProps> = ({
	userName,
	userEmail,
	userAvatar,
	isOnline = true,
	onEditProfileClick,
	onLogoutClick,
	onMobileMenuToggle,
	isMobileMenuOpen = false,
}) => {
	const router = useRouter();
	const dispatch = useDispatch();
	const { user: authUser, logout: contextLogout } = useAuth();
	const { disconnect: disconnectSocket, socket } = useSocket();
	const [logoutApi] = useLogoutMutation();
	const [teamMemberLogoutApi] = useTeamMemberLogoutMutation();

	// Notifications integration
	const { data: notificationsData, refetch: refetchNotifications } = useGetNotificationsByRoleQuery('super admin', {
		skip: !['super admin', 'superadmin'].includes(authUser?.role?.toString().toLowerCase() || ''),
	});

	const [markAsRead] = useMarkNotificationAsReadMutation();
	const notifications = React.useMemo(() => notificationsData?.notifications || [], [notificationsData]);
	const unreadCount = React.useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

	// Join superadmin role room
	React.useEffect(() => {
		const userRole = authUser?.role?.toString().toLowerCase();
		if (!socket || !['super admin', 'superadmin'].includes(userRole || '')) return;

		socket.emit("joinRole", "super admin");

		const handleNotification = () => {
			refetchNotifications();
		};

		socket.on("notification", handleNotification);

		return () => {
			socket.off("notification", handleNotification);
		};
	}, [socket, authUser?.role, refetchNotifications]);

	// Handle logout
	const handleLogout = async () => {
		try {
			// Call API to invalidate session on server
			if (authUser?.id) {
				if (authUser.isTeamMember) {
					await teamMemberLogoutApi({ userId: authUser.id }).unwrap();
				} else {
					await logoutApi({ userId: authUser.id }).unwrap();
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

			// Redirect to login page
			setTimeout(() => {
				router.push('/');
			}, 500);
		} catch (error) {
			console.error('Logout failed:', error);
			// Still perform client-side cleanup
			disconnectSocket();
			dispatch(logoutAction());
			contextLogout();

			// Even if there's an error, redirect to login
			router.push('/');
		}
	};

	return (
		<header id="header" style={{ backgroundColor: 'var(--accent-white)', borderBottom: '1px solid var(--light-gray)' }}>
			<div className="flex items-center justify-end h-full px-6">
				{/* Hamburger Menu - Mobile Only */}
				<Button
					variant="ghost"
					size="sm"
					onClick={onMobileMenuToggle}
					className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer mr-auto h-auto"
					title="Menu"
				>
					<div className={`transition-all duration-300 ease-in-out transform ${isMobileMenuOpen ? 'rotate-90 scale-110' : 'rotate-0 scale-100'}`}>
						{isMobileMenuOpen ? (
							<Cross1Icon className="w-6 h-6" />
						) : (
							<HamburgerMenuIcon className="w-6 h-6" />
						)}
					</div>
				</Button>

				{/* Right side - Icons */}
				<div className="flex items-center justify-center gap-4">
					{/* Dark Mode Toggle */}
					<ThemeToggle />

					{/* Notifications Bell */}
					<NotificationBell
						notifications={notifications}
						unreadCount={unreadCount}
						onMarkAsRead={(id) => markAsRead(id)}
					/>

					{/* User Dropdown */}
					<SuperAdminUserDropdown
						userName={authUser?.name || userName}
						userEmail={authUser?.email || userEmail}
						userAvatar={authUser?.avatar || userAvatar}
						isOnline={isOnline}
						onEditProfileClick={onEditProfileClick}
						onLogoutClick={onLogoutClick || handleLogout}
					/>
				</div>
			</div>
		</header>
	);
};

export default SuperAdminHeader;
