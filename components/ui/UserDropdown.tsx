'use client';

import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';

interface UserDropdownProps {
	userName: string;
	userEmail: string;
	userAvatar?: string;
	isOnline?: boolean;
	onStatusClick?: () => void;
	onEditProfileClick?: () => void;
	onLogoutClick?: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({
	userName,
	userEmail,
	userAvatar,
	isOnline = true,
	onStatusClick,
	onEditProfileClick,
	onLogoutClick,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isStatusOpen, setIsStatusOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
				setIsStatusOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	// Close main dropdown when status submenu opens
	useEffect(() => {
		if (isStatusOpen) {
			setIsOpen(false);
		}
	}, [isStatusOpen]);

	const statusOptions = [
		{ value: 'online', label: 'Online' },
		{ value: 'lunch', label: 'Lunch Break' },
		{ value: 'restroom', label: 'Restroom Break' },
		{ value: 'offline', label: 'Offline' },
	];

	const handleStatusSelect = (status: string) => {
		console.log('Status selected:', status);
		setIsStatusOpen(false);
		setIsOpen(false);
	};

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
				title={userName}
			>
				<div className="relative">
					{userAvatar ? (
						<img
							src={userAvatar}
							alt={userName}
							className="w-8 h-8 rounded-full border-2 border-gray-200"
						/>
					) : (
						<div className="box-border w-[40px] h-[40px] bg-[#F2F4F7] border border-[#E5E7EB] rounded-[200px] flex items-center justify-center">
							<span className="text-gray-600 font-semibold text-sm">
								{userName.charAt(0).toUpperCase()}
							</span>
						</div>
					)}
					{/* Online Status Indicator */}
					{isOnline && (
						<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
					)}
				</div>
			</button>

			{/* User Dropdown */}
			{isOpen && !isStatusOpen && (
				<div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 shadow-lg z-50">
					{/* User Info Section */}
					<div className="p-4 border-b border-gray-200">
						<div className="flex items-center gap-3">
							{userAvatar ? (
								<img
									src={userAvatar}
									alt={userName}
									className="w-12 h-12 rounded-full border-2 border-gray-200"
								/>
							) : (
								<div className="w-12 h-12 bg-[#F2F4F7] border border-[#E5E7EB] rounded-full flex items-center justify-center">
									<span className="text-gray-600 font-semibold text-lg">
										{userName.charAt(0).toUpperCase()}
									</span>
								</div>
							)}
							<div className="flex-1">
								<h3 className="font-semibold text-gray-900 text-base">{userName}</h3>
								<p className="text-sm text-gray-500">{userEmail}</p>
							</div>
						</div>
					</div>

					{/* Menu Items */}
					<div className="py-2">
						{/* Status */}
						<div className="relative">
							<button
								onClick={(e) => {
									e.stopPropagation();
									setIsStatusOpen(!isStatusOpen);
								}}
								className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center justify-between"
							>
								<span>Status</span>
								<Icon name="Expand_right_light" size="lg" />
							</button>


						</div>

						{/* Edit Profile */}
						<button
							onClick={() => {
								onEditProfileClick?.();
								setIsOpen(false);
							}}
							className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 cursor-pointer"
						>
							Settings
						</button>



						{/* Separator */}
						<div className="border-t border-gray-200 my-2"></div>

						{/* Logout */}
						<button
							onClick={() => {
								onLogoutClick?.();
								setIsOpen(false);
							}}
							className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
						>
							<Icon name="Sign_out_squre_light" size="lg" />
							Log out
						</button>
					</div>
				</div>
			)}

			{/* Status Submenu */}
			{isStatusOpen && (
				<div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200   shadow-lg z-50">
					<div className="">
						{statusOptions.map((option) => (
							<button
								key={option.value}
								onClick={() => handleStatusSelect(option.value)}
								className="w-full px-4 py-2 text-left hover:bg-gray-50 cursor-pointer font-lato font-medium text-[16px] leading-[150%] text-[#3A4050]"
							>
								{option.label}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default UserDropdown;
