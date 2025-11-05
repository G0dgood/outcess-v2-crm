'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';
import { ArrowLeftIcon } from '@radix-ui/react-icons';

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
	const router = useRouter();
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
				className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors cursor-pointer"
				title={userName}
			>
				<div className="relative">
					{userAvatar ? (
						<img
							src={userAvatar}
							alt={userName}
							className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-600"
						/>
					) : (
						<div className="box-border w-[40px] h-[40px] bg-[#F2F4F7] dark:bg-gray-700 border border-[#E5E7EB] dark:border-gray-600 rounded-[200px] flex items-center justify-center">
							<span className="text-gray-600 dark:text-gray-300 font-semibold text-sm">
								{userName.charAt(0).toUpperCase()}
							</span>
						</div>
					)}
					{/* Online Status Indicator */}
					{isOnline && (
						<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
					)}
				</div>
			</button>

			{/* User Dropdown */}
			{isOpen && !isStatusOpen && (
				<div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50   overflow-hidden">
					{/* User Info Section */}
					<div className="p-4 border-b border-gray-200 dark:border-gray-700">
						<div className="flex items-center gap-3">
							{userAvatar ? (
								<img
									src={userAvatar}
									alt={userName}
									className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-600"
								/>
							) : (
								<div className="w-12 h-12 bg-[#F2F4F7] dark:bg-gray-700 border border-[#E5E7EB] dark:border-gray-600 rounded-full flex items-center justify-center">
									<span className="text-gray-600 dark:text-gray-300 font-semibold text-lg">
										{userName.charAt(0).toUpperCase()}
									</span>
								</div>
							)}
							<div className="flex-1">
								<h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">{userName}</h3>
								<p className="text-sm text-gray-500 dark:text-gray-400">{userEmail}</p>
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
								className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between transition-colors"
							>
								<span>Status</span>
								<Icon name="Expand_right_light" size="lg" />
							</button>


						</div>

						{/* Settings */}
						<button
							onClick={() => {
								router.push('/usersettings');
								setIsOpen(false);
							}}
							className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
						>
							Settings
						</button>



						{/* Separator */}
						<div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

						{/* Logout */}
						<button
							onClick={() => {
								onLogoutClick?.();
								setIsOpen(false);
							}}
							className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 cursor-pointer transition-colors"
						>
							<Icon name="Sign_out_squre_light" size="lg" color="red" className="dark:invert-0! dark:opacity-100!" />
							Log out
						</button>
					</div>
				</div>
			)}

			{/* Status Submenu */}
			{isStatusOpen && (
				<div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50 overflow-hidden">
					{/* Back Button Header */}
					<div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
						<button
							onClick={() => {
								setIsStatusOpen(false);
								setIsOpen(true);
							}}
							className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer"
						>
							<ArrowLeftIcon className="w-4 h-4" />
							<span className="text-sm font-medium">Back</span>
						</button>
					</div>
					<div className="">
						{statusOptions.map((option) => (
							<button
								key={option.value}
								onClick={() => handleStatusSelect(option.value)}
								className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer font-lato font-medium text-[16px] leading-[150%] text-[#3A4050] dark:text-gray-300 transition-colors"
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
