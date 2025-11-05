'use client';

import React from 'react';
import { BellIcon, MoonIcon, SunIcon } from '@radix-ui/react-icons';
import UserDropdown from './UserDropdown';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { useTheme } from '@/contexts/ThemeContext';

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
	const { isDarkMode, toggleTheme } = useTheme();
	
	return (
		<header id="header" className="fixed top-0 left-0 right-0 h-[70px] z-40" style={{ backgroundColor: 'var(--accent-white)', borderBottom: '1px solid var(--light-gray)' }}>
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
					{/* Dark Mode Toggle */}
					<button
						onClick={toggleTheme}
						className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
						title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
					>
						{isDarkMode ? (
							<SunIcon className="w-5 h-5" />
						) : (
							<MoonIcon className="w-5 h-5" />
						)}
					</button>

					{/* Notifications Bell */}
					<button
						onClick={onNotificationsClick}
						className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
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

