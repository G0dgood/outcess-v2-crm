'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Icon from './Icon';
import Dropdown from './Dropdown';
import UserDropdown from './UserDropdown';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import NotificationDropdown from './NotificationDropdown';
import { sampleNotifications } from '@/data/notifications';
import ThemeDropdown from './ThemeDropdown';

interface DashboardHeaderProps {
	companyName?: string;
	userName?: string;
	userEmail?: string;
	userAvatar?: string;
	isOnline?: boolean;
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
	companyName = 'Fairmoney',
	userName = 'John Doe',
	userEmail = 'johndoe@example.com',
	userAvatar,
	isOnline = true,
	onCompanyChange,
	onNotificationsClick,
	onSettingsClick,
	onStatusClick,
	onEditProfileClick,
	onLogoutClick,
	companyOptions = [
		{ value: 'Fairmoney', label: 'Fairmoney' },
		{ value: 'Company 2', label: 'Company 2' },
		{ value: 'Company 3', label: 'Company 3' },
	],
	onMobileMenuToggle,
}) => {
	const router = useRouter();
	const pathname = usePathname();
	const [hasStickyNotes, setHasStickyNotes] = useState(false);
	const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);


	const handleNotificationClick = () => {
		setIsNotificationPanelOpen(!isNotificationPanelOpen);
		// Close profile dropdown if open
		// setShowDropdown(false);
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
			} catch (error) {
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
				{/* Hamburger Menu - Mobile Only */}
				<button
					onClick={onMobileMenuToggle}
					className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
					title="Menu"
				>
					<HamburgerMenuIcon className="w-6 h-6" />
				</button>

				<div className="flex-1 md:flex-none">
					{/* This space can be used for logo or main title */}
				</div>



				{/* Right side - Icons */}
				<div className="flex items-center justify-center gap-4">
					{/* Dark Mode Toggle Dropdown */}
					<ThemeDropdown />

					<Dropdown
						label=""
						value={companyName}
						onChange={(value) => onCompanyChange?.(value)}
						options={companyOptions}
						className="min-w-[140px]"
						inputClassName="h-8"
					/>

					{/* Sticky Notes Icon - Only show if notes exist */}
					{hasStickyNotes && (
						<button
							onClick={handleNoteIconClick}
							className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer relative"
							title="View Sticky Notes"
						>
							<Icon name="Edit_duotone_line" size="3xl" />
							{/* Indicator dot */}
							<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
						</button>
					)}

					{/* Notifications Bell */}
					<div className="relative">
						<button
							onClick={handleNotificationClick}
							className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
							title="Notifications"
						>
							<Icon name="Bell_light" size="3xl" />
						</button>






						<NotificationDropdown
							isOpen={isNotificationPanelOpen}
							onClose={() => setIsNotificationPanelOpen(false)}
							notifications={sampleNotifications}
						/>
					</div>

					{/* User Dropdown */}
					<UserDropdown
						userName={userName}
						userEmail={userEmail}
						userAvatar={userAvatar}
						isOnline={isOnline}
						onStatusClick={onStatusClick}
						onEditProfileClick={onEditProfileClick}
						onLogoutClick={onLogoutClick}
					/>
				</div>
			</div>
		</header>
	);
};

export default DashboardHeader;
