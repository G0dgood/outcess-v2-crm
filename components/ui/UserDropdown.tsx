'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from '@bprogress/next/app';
import { StatusConfirmationModal } from './StatusConfirmationModal';
import { StatusSubmenu, StatusOption } from './StatusSubmenu';
import { UserMenu } from './UserMenu';
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
				toastError('Failed to update status');
			}
		} else if (!userId) { 
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
							width={30}
							height={30}
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
								className="font-semibold text-[10px] md:text-[12px]"
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
			<UserMenu
				isOpen={isOpen && !isStatusOpen}
				userAvatar={userAvatar}
				userName={userName}
				userEmail={userEmail}
				onStatusClick={() => setIsStatusOpen(!isStatusOpen)}
				onClose={() => setIsOpen(false)}
				onLogoutClick={onLogoutClick}
			/>

			{/* Status Submenu */}
			<StatusSubmenu
				isOpen={isStatusOpen}
				onBack={() => {
					setIsStatusOpen(false);
					setIsOpen(true);
				}}
				statusOptions={statusOptions}
				onSelect={handleStatusSelect}
			/>

			{/* Status Confirmation Modal */}
			<StatusConfirmationModal
				isOpen={isStatusConfirmOpen}
				onClose={() => setIsStatusConfirmOpen(false)}
				pendingStatus={pendingStatus}
				statusReason={statusReason}
				onStatusReasonChange={setStatusReason}
				onConfirm={confirmStatusChange}
				isUpdating={isUpdatingStatus}
			/>
		</div>
	);
};

export default UserDropdown;
