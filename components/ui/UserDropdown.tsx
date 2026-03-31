'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StatusConfirmationModal } from './StatusConfirmationModal';
import { StatusSubmenu, StatusOption } from './StatusSubmenu';
import { UserMenu } from './UserMenu';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useGetStatusesByLineOfBusinessIdQuery } from '@/store/services/statusApi';
import { useUpdateTeamMemberStatusMutation } from '@/store/services/teamMembersApi';
import { useUpdateUserMutation } from '@/store/services/authApi';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { toastSuccess, toastError } from '@/utils/toastWithSound';
import { User } from '@/store/slices/authSlice';
import Image from 'next/image';

export interface UserDropdownProps {
	userId?: string;
	userName?: string;
	userEmail?: string;
	userAvatar?: string;
	user?: User | null;
	isOnline?: boolean;
	currentStatus?: {
		status: string;
		color?: string;
	};
	onStatusClick?: () => void;
	onEditProfileClick?: () => void;
	onLogoutClick?: () => void;
	isOpen?: boolean;
	onToggle?: (isOpen: boolean) => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({
	user,
	userId,
	userName = '',
	userEmail = '',
	userAvatar,
	isOnline = true,
	currentStatus,
	onLogoutClick,
	isOpen: externalIsOpen,
	onToggle,
}) => {
	const [internalIsOpen, setInternalIsOpen] = useState(false);

	// Use either controlled or internal state
	const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
	const setIsOpen = useCallback((value: boolean) => {
		if (onToggle) {
			onToggle(value);
		} else {
			setInternalIsOpen(value);
		}
	}, [onToggle]);
	const [isStatusOpen, setIsStatusOpen] = useState(false);
	const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
	const [pendingStatus, setPendingStatus] = useState<StatusOption | null>(null);
	const [statusReason, setStatusReason] = useState('');
	const [mounted, setMounted] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { selectedLineOfBusinessId } = useLineOfBusiness();
	const { isAdmin } = usePrivilege();

	const [updateStatus, { isLoading: isUpdatingTeamMemberStatus }] = useUpdateTeamMemberStatusMutation();
	const [updateUser, { isLoading: isUpdatingUserStatus }] = useUpdateUserMutation();

	const isUpdatingStatus = isUpdatingTeamMemberStatus || isUpdatingUserStatus;

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
	}, [setIsOpen]);

	// Close main dropdown when status submenu opens
	useEffect(() => {
		if (isStatusOpen) {
			setIsOpen(false);
		}
	}, [isStatusOpen, setIsOpen]);



	const handleStatusSelect = (status: StatusOption) => {
		setPendingStatus(status);
		setStatusReason('');
		setIsStatusConfirmOpen(true);
	};

	const confirmStatusChange = async () => {
		if (pendingStatus && userId) {
			const statusData = {
				status: pendingStatus.label,
				reason: statusReason,
				color: pendingStatus.color
			};

			try {
				// If user is admin/owner, try updateUser first (they often aren't team members)
				if (isAdmin) {
					await updateUser({
						id: userId,
						data: { status: statusData }
					}).unwrap();
				} else {
					// Otherwise try team member status update
					try {
						await updateStatus({
							id: userId,
							status: pendingStatus.label,
							reason: statusReason
						}).unwrap();
					} catch (err: unknown) {
						const errorObj = err as { status?: number; data?: { message?: string } };
						// Fallback to updateUser if team member not found (404)
						if (errorObj?.status === 404 ||
							errorObj?.data?.message?.toLowerCase().includes('not found') ||
							errorObj?.data?.message?.toLowerCase().includes('team member')) {

							await updateUser({
								id: userId,
								data: { status: statusData }
							}).unwrap();
						} else {
							throw err;
						}
					}
				}

				toastSuccess('Status updated successfully');
			} catch (error: unknown) {
				console.error('Failed to update status:', error);
				const errorObj = error as { data?: { message?: string }; message?: string };
				const errorMessage = errorObj?.data?.message || errorObj?.message || 'Failed to update status';
				toastError(errorMessage);
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
				className={`flex items-center gap-2.5 p-1.5 px-2.5 rounded-[var(--radius)] transition-all duration-200 cursor-pointer group header-dropdown-trigger`}
				title={mounted ? `${userName}${currentStatus ? ` - ${currentStatus.status}` : ''}` : ''}
				style={{
					backgroundColor: isOpen ? 'var(--bg-primary)' : 'transparent',
					border: isOpen ? '1px solid var(--light-gray)' : '1px solid transparent'
				}}
			>
				<div className="relative">
					{userAvatar ? (
						<Image
							src={userAvatar}
							alt={mounted ? userName : ''}
							width={32}
							height={32}
							className="rounded-full border-2 object-cover shrink-0"
							style={{ borderColor: 'var(--light-gray)' }}
						/>
					) : (
						<div
							className="box-border w-8 h-8 rounded-full flex items-center justify-center shrink-0"
							style={{
								backgroundColor: 'var(--bg-primary)',
								border: '1px solid var(--light-gray)'
							}}
						>
							<span
								className="font-semibold text-[12px] transition-colors duration-200 dark:group-hover:!text-white"
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
								backgroundColor: currentStatus.color || "", // Default to green if no color
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
				currentStatus={currentStatus}
				showStatus={isAdmin || !!((user as unknown as { role?: { roleName?: string } })?.role?.roleName === "supervisor" || (user as unknown as { supervisorId?: string })?.supervisorId)}
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
				userAvatar={userAvatar}
				userName={userName}
				currentStatus={currentStatus}
				userEmail={userEmail}
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