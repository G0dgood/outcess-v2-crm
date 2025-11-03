'use client';

import React from 'react';
import { BellIcon } from '@radix-ui/react-icons';
import UserDropdown from './UserDropdown';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';

interface AdminHeaderProps {
	userName?: string;
	userEmail?: string;
	userAvatar?: string;
	isOnline?: boolean;
	onNotificationsClick?: () => void;
	onEditProfileClick?: () => void;
	onLogoutClick?: () => void;
	onMobileMenuToggle?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
	userName = 'Admin User',
	userEmail = 'admin@example.com',
	userAvatar,
	isOnline = true,
	onNotificationsClick,
	onEditProfileClick,
	onLogoutClick,
	onMobileMenuToggle,
}) => {
	return (
		<header id="header" className="fixed top-0 left-0 right-0 h-[70px] bg-white border-b border-gray-200 z-40">
			<div className="flex items-center justify-end h-full px-6">
				{/* Hamburger Menu - Mobile Only */}
				<button
					onClick={onMobileMenuToggle}
					className="md:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer mr-auto"
					title="Menu"
				>
					<HamburgerMenuIcon className="w-6 h-6" />
				</button>

				{/* Right side - Icons */}
				<div className="flex items-center justify-center gap-4">
					{/* Notifications Bell */}
					<button
						onClick={onNotificationsClick}
						className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
						title="Notifications"
					>
						<BellIcon className="w-6 h-6" />
					</button>

					{/* User Dropdown */}
					<UserDropdown
						userName={userName}
						userEmail={userEmail}
						userAvatar={userAvatar}
						isOnline={isOnline}
						onStatusClick={() => { }}
						onEditProfileClick={onEditProfileClick}
						onLogoutClick={onLogoutClick}
					/>
				</div>
			</div>
		</header>
	);
};

export default AdminHeader;

