'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import Image from 'next/image';
import Button from '@/components/ui/Button';

interface AdminUserDropdownProps {
	userName?: string;
	userEmail?: string;
	userAvatar?: string;
	isOnline?: boolean;
	onEditProfileClick?: () => void;
	onLogoutClick?: () => void;
}

const AdminUserDropdown: React.FC<AdminUserDropdownProps> = ({
	userName = '',
	userEmail = '',
	userAvatar,
	isOnline = true,
	onLogoutClick,
}) => {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	return (
		<div className="relative" ref={dropdownRef}>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => setIsOpen(!isOpen)}
				className="p-1 rounded-full transition-colors cursor-pointer h-auto"
				title={mounted ? userName : ''}
				style={{
					color: 'var(--text-tertiary)',
					backgroundColor: 'transparent'
				}}
				onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
					e.currentTarget.style.color = 'var(--text-primary)';
					e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
				}}
				onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
					e.currentTarget.style.color = 'var(--text-tertiary)';
					e.currentTarget.style.backgroundColor = 'transparent';
				}}
			>
				<div className="relative">
					{userAvatar ? (
						<Image
							src={userAvatar}
							alt={mounted ? userName : ''}
							width={32}
							height={32}
							className="rounded-full border-2"
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
								className="font-semibold text-[10px] md:text-[12px]"
								style={{ color: 'var(--text-primary)' }}
							>
								{mounted ? userName.charAt(0).toUpperCase() : ''}
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
			</Button>

			{/* User Dropdown */}
			{isOpen && (
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
								<Image
									src={userAvatar}
									alt={userName}
									width={48}
									height={48}
									className="rounded-full border-2 border-gray-200 dark:border-gray-600"
								/>
							) : (
								<div className="w-12 h-12 bg-[#F2F4F7] dark:bg-gray-700 border border-[#E5E7EB] dark:border-gray-600 rounded-full flex items-center justify-center">
									<span
										className="font-semibold text-[12px] md:text-[14px] dark:text-gray-300"
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
									className="text-[10px] md:text-[12px] dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									{userEmail}
								</p>
							</div>
						</div>
					</div>

					{/* Menu Items */}
					<div style={{ backgroundColor: 'var(--accent-white)' }} className="dark:bg-gray-800">
						{/* Settings */}
						<Button
							variant="ghost"
							size="md"
							fullWidth
							onClick={() => {
								router.push('/superadmin/settings');
								setIsOpen(false);
							}}
							className="px-4 py-2 text-left cursor-pointer transition-colors !justify-start !rounded-none"
							style={{
								color: 'var(--text-secondary)',
								backgroundColor: 'transparent'
							}}
							onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
								e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
							}}
							onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
								e.currentTarget.style.backgroundColor = 'transparent';
							}}
							title="Account Settings"
						>
							Settings
						</Button>

						{/* Separator */}
						<div
							className="border-t my-2 dark:border-gray-700"
							style={{ borderColor: 'var(--light-gray)' }}
						></div>

						{/* Logout */}
						<Button
							variant="ghost"
							size="md"
							fullWidth
							onClick={() => {
								onLogoutClick?.();
								setIsOpen(false);
							}}
							className="px-4 py-2 text-left flex items-center gap-2 cursor-pointer transition-colors !justify-start !rounded-none"
							style={{
								color: 'var(--status-error)',
								backgroundColor: 'transparent'
							}}
							onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
								e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
							}}
							onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
								e.currentTarget.style.backgroundColor = 'transparent';
							}}
							title="Log out of application"
						>
							<Icon name="Sign_out_squre_light" size="lg" color="red" className="dark:invert-0! dark:opacity-100!" />
							Log out
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminUserDropdown;
