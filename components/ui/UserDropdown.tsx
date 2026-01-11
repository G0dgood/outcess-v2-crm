'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { Modal } from './Modal';
import { Button } from './Button';
import { Textarea } from './Textarea';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useGetStatusesByLineOfBusinessIdQuery } from '@/store/services/statusApi';
import { useUpdateTeamMemberStatusMutation } from '@/store/services/teamMembersApi';
import { toastSuccess, toastError } from '@/utils/toastWithSound';
import Image from 'next/image';

export interface UserDropdownProps {
	userId?: string;
	userName?: string;
	userEmail?: string;
	userAvatar?: string;
	isOnline?: boolean;
	currentStatus?: {
		status: string;
		color?: string;
	};
	onStatusClick?: () => void;
	onEditProfileClick?: () => void;
	onLogoutClick?: () => void;
}

interface StatusOption {
	value: string;
	label: string;
	color?: string;
}

const UserDropdown: React.FC<UserDropdownProps> = ({
	userId,
	userName = '',
	userEmail = '',
	userAvatar,
	isOnline = true,
	currentStatus,
	onLogoutClick,
}) => {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [isStatusOpen, setIsStatusOpen] = useState(false);
	const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
	const [pendingStatus, setPendingStatus] = useState<StatusOption | null>(null);
	const [statusReason, setStatusReason] = useState('');
	const [mounted, setMounted] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { selectedLineOfBusinessId } = useLineOfBusiness();

	const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateTeamMemberStatusMutation();

	const { data: fetchedStatuses, isLoading } = useGetStatusesByLineOfBusinessIdQuery(selectedLineOfBusinessId || '', {
		skip: !selectedLineOfBusinessId
	});

	const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);

	useEffect(() => {
		if (fetchedStatuses) {
			const rawStatuses = (Array.isArray(fetchedStatuses) ? fetchedStatuses :
				(Array.isArray((fetchedStatuses as unknown as { data?: unknown[] }).data) ? (fetchedStatuses as unknown as { data?: unknown[] }).data :
					(Array.isArray((fetchedStatuses as unknown as { statuses?: unknown[] }).statuses) ? (fetchedStatuses as unknown as { statuses?: unknown[] }).statuses :
						(Array.isArray((fetchedStatuses as unknown as { docs?: unknown[] }).docs) ? (fetchedStatuses as unknown as { docs?: unknown[] }).docs :
							[])))) || [];

			const mappedStatuses = (rawStatuses as { id?: string; _id?: string; name: string; color?: string }[]).map((status) => ({
				value: status.id || status._id || '',
				label: status.name,
				color: status.color || '#6C8B7D'
			}));

			if (mappedStatuses.length > 0) {
				setStatusOptions(mappedStatuses);
			} else {
				// Fallback to default options if no dynamic statuses found
				setStatusOptions([]);
			}
		} else if (!isLoading && !selectedLineOfBusinessId) {
			// Fallback if no LOB selected
			setStatusOptions([]);
		}
	}, [fetchedStatuses, isLoading, selectedLineOfBusinessId]);

	useEffect(() => {
		setMounted(true);
	}, []);

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



	const handleStatusSelect = (status: StatusOption) => {
		setPendingStatus(status);
		setStatusReason('');
		setIsStatusConfirmOpen(true);
	};

	const confirmStatusChange = async () => {
		if (pendingStatus && userId) {
			try {
				await updateStatus({
					id: userId,
					status: pendingStatus.label,
					reason: statusReason
				}).unwrap();

				toastSuccess('Status updated successfully');
			} catch (error) {
				console.error('Failed to update status:', error);
				toastError('Failed to update status');
			}
		} else if (!userId) {
			console.error('Cannot update status: User ID is missing');
			toastError('User ID is missing');
		}

		setIsStatusConfirmOpen(false);
		setPendingStatus(null);
		setStatusReason('');
		setIsStatusOpen(false);
		setIsOpen(false);
	};

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="p-1 rounded-full transition-colors cursor-pointer"
				title={mounted ? `${userName}${currentStatus ? ` - ${currentStatus.status}` : ''}` : ''}
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
						<Image
							src={userAvatar}
							alt={mounted ? userName : ''}
							width={32}
							height={32}
							className="rounded-full border-2 object-cover"
							style={{ borderColor: 'var(--light-gray)' }}
						/>
					) : (
						<div
							className="box-border w-10 h-10 rounded-full flex items-center justify-center"
							style={{
								backgroundColor: 'var(--bg-primary)',
								border: '1px solid var(--light-gray)'
							}}
						>
							<span
								className="font-semibold text-sm"
								style={{ color: 'var(--text-primary)' }}
							>
								{mounted ? userName.charAt(0).toUpperCase() : ''}
							</span>
						</div>
					)}
					{/* Status Indicator */}
					{mounted && currentStatus ? (
						<div
							className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 rounded-full"
							style={{
								backgroundColor: currentStatus.color || '#22C55E', // Default to green if no color
								borderColor: 'var(--accent-white)'
							}}
							title={currentStatus.status}
						></div>
					) : isOnline && (
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
					className="absolute right-0 top-full mt-2 w-48 dark:bg-gray-800 border dark:border-gray-700 shadow-lg z-50 overflow-hidden min-w-[250px] "
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
						{statusOptions?.map((option) => (
							<button
								key={option.value}
								onClick={() => handleStatusSelect(option)}
								className="w-full px-4 py-2 text-left cursor-pointer font-lato font-medium text-[16px] leading-[150%] transition-colors flex items-center gap-2 whitespace-nowrap"
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
								{option.color && (
									<span
										className="w-3 h-3 rounded-full"
										style={{ backgroundColor: option.color }}
									/>
								)}
								{option.label.length > 25 ? `${option.label.substring(0, 25)}...` : option.label}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Status Confirmation Modal */}
			<Modal
				isOpen={isStatusConfirmOpen}
				onClose={() => setIsStatusConfirmOpen(false)}
				title="Change Status"
				size="sm"
			>
				<div className="p-6">
					<p className="mb-4 text-gray-600 dark:text-gray-300" style={{ color: 'var(--text-secondary)' }}>
						Are you sure you want to change your status to{' '}
						<span className="font-semibold inline-flex items-center gap-1.5 align-middle text-gray-900 dark:text-gray-100">
							{pendingStatus?.color && (
								<span
									className="w-2.5 h-2.5 rounded-full inline-block"
									style={{ backgroundColor: pendingStatus.color }}
								/>
							)}
							{pendingStatus?.label}
						</span>
						?
					</p>

					<div className="mb-6">
						<Textarea
							label="Reason (Optional)"
							value={statusReason}
							onChange={setStatusReason}
							placeholder="Enter reason for status change..."
							rows={3}
						/>
					</div>

					<div className="flex justify-end gap-3">
						<Button
							variant="outline"
							onClick={() => setIsStatusConfirmOpen(false)}
						>
							No
						</Button>
						<Button
							variant="primary"
							onClick={confirmStatusChange}
							loading={isUpdatingStatus}
						>
							Yes
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default UserDropdown;
