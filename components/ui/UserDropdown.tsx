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
				className="p-1 rounded-full transition-colors cursor-pointer"
				title={userName}
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
			>
				<div className="relative">
					{userAvatar ? (
						<img
							src={userAvatar}
							alt={userName}
							className="w-8 h-8 rounded-full border-2"
							style={{ borderColor: 'var(--light-gray)' }}
						/>
					) : (
						<div
							className="box-border w-[40px] h-[40px] rounded-full flex items-center justify-center"
							style={{
								backgroundColor: 'var(--bg-primary)',
								border: '1px solid var(--light-gray)'
							}}
						>
							<span
								className="font-semibold text-sm"
								style={{ color: 'var(--text-primary)' }}
							>
								{userName.charAt(0).toUpperCase()}
							</span>
						</div>
					)}
					{/* Online Status Indicator */}
					{isOnline && (
						<div
							className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 rounded-full"
							style={{ borderColor: 'var(--accent-white)' }}
						></div>
					)}
				</div>
			</button>

			{/* User Dropdown */}
			{isOpen && !isStatusOpen && (
				<div
					className="absolute right-0 top-full mt-2 w-80 dark:bg-gray-800 border dark:border-gray-700 shadow-lg z-50 overflow-hidden"
					style={{
						backgroundColor: 'var(--accent-white)',
						borderColor: 'var(--light-gray)'
					}}
				>
					{/* User Info Section */}
					<div
						className="p-4 border-b dark:border-gray-700"
						style={{
							borderColor: 'var(--light-gray)'
						}}
					>
						<div className="flex items-center gap-3">
							{userAvatar ? (
								<img
									src={userAvatar}
									alt={userName}
									className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-600"
								/>
							) : (
								<div className="w-12 h-12 bg-[#F2F4F7] dark:bg-gray-700 border border-[#E5E7EB] dark:border-gray-600 rounded-full flex items-center justify-center">
									<span
										className="font-semibold text-lg dark:text-gray-300"
										style={{ color: 'var(--text-primary)' }}
									>
										{userName.charAt(0).toUpperCase()}
									</span>
								</div>
							)}
							<div className="flex-1">
								<h3
									className="font-semibold text-base dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									{userName}
								</h3>
								<p
									className="text-sm dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									{userEmail}
								</p>
							</div>
						</div>
					</div>

					{/* Menu Items */}
					<div style={{ backgroundColor: 'var(--accent-white)' }} className="dark:bg-gray-800">
						{/* Status */}
						<div className="relative">
							<button
								onClick={(e) => {
									e.stopPropagation();
									setIsStatusOpen(!isStatusOpen);
								}}
								className="w-full px-4 py-2 text-left flex items-center justify-between transition-colors"
								style={{
									color: 'var(--text-secondary)',
									backgroundColor: 'transparent'
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = 'transparent';
								}}
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
							className="w-full px-4 py-2 text-left cursor-pointer transition-colors"
							style={{
								color: 'var(--text-secondary)',
								backgroundColor: 'transparent'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = 'transparent';
							}}
						>
							Settings
						</button>

						{/* Separator */}
						<div
							className="border-t my-2 dark:border-gray-700"
							style={{ borderColor: 'var(--light-gray)' }}
						></div>

						{/* Logout */}
						<button
							onClick={() => {
								onLogoutClick?.();
								setIsOpen(false);
							}}
							className="w-full px-4 py-2 text-left flex items-center gap-2 cursor-pointer transition-colors"
							style={{
								color: 'var(--status-error)',
								backgroundColor: 'transparent'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = 'transparent';
							}}
						>
							<Icon name="Sign_out_squre_light" size="lg" color="red" className="dark:invert-0! dark:opacity-100!" />
							Log out
						</button>
					</div>
				</div>
			)}

			{/* Status Submenu */}
			{isStatusOpen && (
				<div
					className="absolute right-0 top-full mt-2 w-48 dark:bg-gray-800 border dark:border-gray-700 shadow-lg z-50 overflow-hidden"
					style={{
						backgroundColor: 'var(--accent-white)',
						borderColor: 'var(--light-gray)'
					}}
				>
					{/* Back Button Header */}
					<div
						className="px-4 py-2 border-b dark:border-gray-700"
						style={{ borderColor: 'var(--light-gray)' }}
					>
						<button
							onClick={() => {
								setIsStatusOpen(false);
								setIsOpen(true);
							}}
							className="flex items-center gap-2 transition-colors cursor-pointer"
							style={{
								color: 'var(--text-secondary)',
								backgroundColor: 'transparent'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.color = 'var(--text-primary)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.color = 'var(--text-secondary)';
							}}
						>
							<ArrowLeftIcon className="w-4 h-4" />
							<span className="text-sm font-medium">Back</span>
						</button>
					</div>
					<div style={{ backgroundColor: 'var(--accent-white)' }} className="dark:bg-gray-800">
						{statusOptions.map((option) => (
							<button
								key={option.value}
								onClick={() => handleStatusSelect(option.value)}
								className="w-full px-4 py-2 text-left cursor-pointer font-lato font-medium text-[16px] leading-[150%] transition-colors"
								style={{
									color: 'var(--text-primary)',
									backgroundColor: 'transparent'
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = 'transparent';
								}}
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
