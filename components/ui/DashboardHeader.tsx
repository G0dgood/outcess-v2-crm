'use client';

import React from 'react';
import Icon from './Icon';
import Dropdown from './Dropdown';
import UserDropdown from './UserDropdown';

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
}) => {
	return (
		<header id="header" >
			<div className="flex items-center justify-between py-2.5">
				<div className="flex-1">
					{/* This space can be used for logo or main title */}
				</div>



				{/* Right side - Icons */}
				<div className="flex items-center justify-center gap-4">
					<Dropdown
						label=""
						value={companyName}
						onChange={(value) => onCompanyChange?.(value)}
						options={companyOptions}
						className="min-w-[140px]"
						inputClassName="h-8"
					/>
					{/* Notifications Bell */}
					<button
						onClick={onNotificationsClick}
						className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
						title="Notifications"
					>
						<Icon name="Bell_light" size="3xl" />
					</button>

					{/* Settings Gear */}
					<button
						onClick={onSettingsClick}
						className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
						title="Settings"
					>
						<Icon name="Setting_line_light" size="3xl" />
					</button>

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
