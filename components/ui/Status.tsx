'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import CreateStatusModal from './CreateStatusModal';
import DeleteStatusModal from './DeleteStatusModal';
import { TrashIcon, Pencil1Icon } from '@radix-ui/react-icons';
import SubPageHeading from './SubPageHeading';
import PageHeading from './PageHeading';
import { useSocket } from '@/contexts/SocketContext';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import {
	useGetStatusesByLineOfBusinessIdQuery,
	useDeleteStatusMutation
} from '@/store/services/statusApi';
import { useGetRolesByLineOfBusinessIdQuery, Role } from '@/store/services/roleApi';
import { NoRecordFound } from '../Options';
import StatusSkeleton from '@/components/skeletons/StatusSkeleton';
import { usePrivilege } from '@/contexts/PrivilegeContext';

interface RawStatus {
	id?: string;
	_id?: string;
	name: string;
	description: string;
	roleSelection?: 'all' | 'selected';
	selectedRoles?: (string | Role)[];
	color?: string;
	isHibernate?: boolean;
	duration?: number;
}

interface StatusItem {
	id: string;
	name: string;
	description: string;
	role: string;
	roleSelection?: 'all' | 'selected';
	selectedRoles?: string[];
	icon?: string;
	color: string;
	isHibernate?: boolean;
	duration?: number;
}

interface StatusProps {
	className?: string;
}

// Removed static roleLabels

const Status: React.FC<StatusProps> = ({ className = '' }) => {
	const [statuses, setStatuses] = useState<StatusItem[]>([]);
	const { selectedLineOfBusinessId } = useLineOfBusiness();
	const { canAccess } = usePrivilege();
	const canView = canAccess('systemSetting', 'view');
	const canCreate = canAccess('systemSetting', 'create');
	const canEdit = canAccess('systemSetting', 'edit');
	const canDelete = canAccess('systemSetting', 'delete');

	const { data: rolesData } = useGetRolesByLineOfBusinessIdQuery(selectedLineOfBusinessId || '', {
		skip: !selectedLineOfBusinessId
	});

	const roleLabels = React.useMemo(() => {
		const data = rolesData as unknown;
		if (!data) return {};

		const rawRoles = (Array.isArray(data) ? data :
			(Array.isArray((data as { data?: unknown[] }).data) ? (data as { data?: unknown[] }).data :
				(Array.isArray((data as { roles?: unknown[] }).roles) ? (data as { roles?: unknown[] }).roles :
					(Array.isArray((data as { docs?: unknown[] }).docs) ? (data as { docs?: unknown[] }).docs :
						[])))) as Role[];

		return rawRoles.reduce((acc: { [key: string]: string }, role: Role) => {
			const id = role?._id || role?.id;
			if (id) {
				acc[id] = role?.roleName;
			}
			return acc;
		}, {} as { [key: string]: string });
	}, [rolesData]);

	const { data: fetchedStatuses, isLoading } = useGetStatusesByLineOfBusinessIdQuery(selectedLineOfBusinessId || '', {
		skip: !selectedLineOfBusinessId
	});

	useEffect(() => {
		if (fetchedStatuses) {
			const rawStatuses = (Array.isArray(fetchedStatuses) ? fetchedStatuses :
				(Array.isArray((fetchedStatuses as unknown as { data?: unknown[] }).data) ? (fetchedStatuses as unknown as { data?: unknown[] }).data :
					(Array.isArray((fetchedStatuses as unknown as { statuses?: unknown[] }).statuses) ? (fetchedStatuses as unknown as { statuses?: unknown[] }).statuses :
						(Array.isArray((fetchedStatuses as unknown as { docs?: unknown[] }).docs) ? (fetchedStatuses as unknown as { docs?: unknown[] }).docs :
							[])))) as RawStatus[];

			const mappedStatuses = rawStatuses.map((status) => {
				const statusId = status.id || status._id || '';
				const roleDisplay = (status.roleSelection === 'all' || !status.roleSelection)
					? 'All users'
					: (status.selectedRoles || []).map((role) => {
						if (typeof role === 'string') {
							return roleLabels[role] || role;
						} else if (role && typeof role === 'object') {
							return role.roleName || roleLabels[role.id || ''] || roleLabels[role._id || ''] || '';
						}
						return '';
					}).filter(Boolean).join(', ');

				return {
					...status,
					id: statusId,
					role: roleDisplay,
					roleSelection: status.roleSelection || 'all',
					selectedRoles: (status.selectedRoles || []).map(r => typeof r === 'string' ? r : (r._id || r.id || '')),
					color: status.color || '#6C8B7D',
					isHibernate: status.isHibernate || false,
					duration: status.duration || 0,
				};
			});
			setStatuses(mappedStatuses as StatusItem[]);
		}
	}, [fetchedStatuses, roleLabels]);

	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [editingStatus, setEditingStatus] = useState<StatusItem | null>(null);
	const [deletingStatus, setDeletingStatus] = useState<StatusItem | null>(null);
	const { socket, isConnected } = useSocket();

	useEffect(() => {
		if (!socket || !isConnected) return;

		const handleStatusCreated = (newStatus: RawStatus) => {
			const statusId = newStatus.id || newStatus._id;

			setStatuses((prev) => {
				if (prev.find(s => s.id === statusId)) return prev;

				const roleDisplay = (newStatus.roleSelection === 'all' || !newStatus.roleSelection)
					? 'All users'
					: (newStatus.selectedRoles || []).map((role) => {
						if (typeof role === 'string') {
							return roleLabels[role] || role;
						} else if (role && typeof role === 'object') {
							return role.roleName || roleLabels[role.id || ''] || roleLabels[role._id || ''] || '';
						}
						return '';
					}).filter(Boolean).join(', ');

				const formattedStatus: StatusItem = {
					...newStatus,
					id: statusId || '',
					name: newStatus.name,
					description: newStatus.description,
					role: roleDisplay,
					roleSelection: newStatus.roleSelection || 'all',
					selectedRoles: (newStatus.selectedRoles || []).map(r => typeof r === 'string' ? r : (r._id || r.id || '')),
					color: newStatus.color || '#6C8B7D',
					isHibernate: newStatus.isHibernate || false,
					duration: newStatus.duration || 0,
				};
				return [...prev, formattedStatus];
			});
		};

		const handleStatusUpdated = (updatedStatus: RawStatus) => {
			const statusId = updatedStatus.id || updatedStatus._id;

			setStatuses((prev) => prev.map((status) => {
				if (status.id === statusId) {
					const roleDisplay = (updatedStatus.roleSelection === 'all' || !updatedStatus.roleSelection)
						? 'All users'
						: (updatedStatus.selectedRoles || []).map((role) => {
							if (typeof role === 'string') {
								return roleLabels[role] || role;
							} else if (role && typeof role === 'object') {
								return role.roleName || roleLabels[role.id || ''] || roleLabels[role._id || ''] || '';
							}
							return '';
						}).filter(Boolean).join(', ');

					return {
						...status,
						...updatedStatus,
						id: statusId || '',
						role: roleDisplay,
						selectedRoles: (updatedStatus.selectedRoles || []).map(r => typeof r === 'string' ? r : (r._id || r.id || '')),
						isHibernate: updatedStatus.isHibernate !== undefined ? updatedStatus.isHibernate : status.isHibernate,
						duration: updatedStatus.duration !== undefined ? updatedStatus.duration : status.duration,
					};
				}
				return status;
			}));
		};

		const handleStatusDeleted = (statusId: string) => {
			setStatuses((prev) => prev.filter((status) => status.id !== statusId));
		};

		socket.on("statusCreated", handleStatusCreated);
		socket.on("statusUpdated", handleStatusUpdated);
		socket.on("statusDeleted", handleStatusDeleted);

		return () => {
			socket.off("statusCreated", handleStatusCreated);
			socket.off("statusUpdated", handleStatusUpdated);
			socket.off("statusDeleted", handleStatusDeleted);
		};
	}, [socket, isConnected, roleLabels]);

	const formatRoleDisplay = (status: StatusItem): string => {
		if (status.roleSelection === 'all' || !status.roleSelection) {
			return 'All users';
		}
		if (status.selectedRoles && status.selectedRoles.length > 0) {
			return status.selectedRoles.map((roleId) => {
				return roleLabels[roleId] || roleId;
			}).filter(Boolean).join(', ');
		}
		return status.role;
	};

	const handleCreateStatus = () => {
		setEditingStatus(null);
		setIsCreateModalOpen(true);
	};

	const handleEdit = (id: string) => {
		const status = statuses.find(s => s.id === id);
		if (status) {
			setEditingStatus(status);
			setIsCreateModalOpen(true);
		}
	};

	const handleDelete = (id: string) => {
		const status = statuses.find(s => s.id === id);
		if (status) {
			setDeletingStatus(status);
			setIsDeleteModalOpen(true);
		}
	};

	const [deleteStatus] = useDeleteStatusMutation();

	const handleConfirmDelete = async () => {
		if (deletingStatus) {
			try {
				await deleteStatus(deletingStatus.id).unwrap();
				setIsDeleteModalOpen(false);
				setDeletingStatus(null);
			} catch (error) {
				console.error("Failed to delete status:", error);
			}
		}
	};

	if (!canView) {
		return null;
	}

	if (isLoading || !selectedLineOfBusinessId) {
		return <StatusSkeleton className={className} />;
	}

	return (
		<div className={`w-full h-full ${className}`}>
			{/* Header Section */}
			<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div className="flex-1">
					<PageHeading
						text="Status"
					/>
					<SubPageHeading
						text="Add fields to capture more details about customer interactions. You can arrange these fields in call forms for agents and customers to enhance data collection and improve service quality."
					/>
				</div>
				<div className="flex flex-wrap items-center justify-end sm:justify-start gap-2 sm:gap-3">
					{canCreate && (
						<Button
							variant="primary"
							size="md"
							onClick={handleCreateStatus}
							className="px-2 py-2 text-[10px] sm:px-4 sm:py-2 md:text-[12px]"
						>
							Create Status
						</Button>
					)}
				</div>
			</div>

			{/* Status Table */}
			<div
				className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<div className="overflow-x-auto">
					<table
						className="min-w-full divide-y dark:divide-gray-700"
						style={{ borderColor: 'var(--light-gray)' }}
					>
						<thead
							className="dark:bg-gray-700 border-b dark:border-gray-700"
							style={{
								backgroundColor: 'var(--bg-primary)',
								borderColor: 'var(--light-gray)'
							}}
						>
							<tr>
								<th
									className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Statuses
								</th>
								<th
									className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Description
								</th>
								<th
									className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Role
								</th>
								<th
									className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Action
								</th>
							</tr>
						</thead>
						<tbody
							className="dark:bg-gray-800 divide-y dark:divide-gray-700"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)'
							}}
						>
							{statuses.length === 0 ? (
								<NoRecordFound colSpan={8} />
							) :
								(statuses.map((status) => (
									<tr
										key={status.id}
										className="dark:hover:bg-gray-700 transition-colors"
										style={{ borderColor: 'var(--light-gray)' }}
										onMouseEnter={(e) => {
											e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.backgroundColor = 'var(--accent-white)';
										}}
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center gap-3">
												<div
													className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
													style={{ backgroundColor: 'var(--bg-primary)' }}
												>
													<div
														className="w-6 h-6 rounded-full"
														style={{ backgroundColor: status.color || '#9CA3AF' }}
													></div>
												</div>
												<span
													className="font-medium dark:text-gray-100"
													style={{ color: 'var(--text-primary)' }}
												>
													{status.name}
												</span>
											</div>
										</td>
										<td className="px-6 py-4">
											<span
												className="text-[10px] md:text-[12px] dark:text-gray-400"
												style={{ color: 'var(--text-tertiary)' }}
											>
												{status.description}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className="text-[10px] md:text-[12px] dark:text-gray-400"
												style={{ color: 'var(--text-tertiary)' }}
											>
												{formatRoleDisplay(status)}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center gap-3">
												{canEdit && (
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleEdit(status.id)}
														className="p-2 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors !rounded-none"
														style={{ color: 'var(--text-tertiary)' }}
														onMouseEnter={(e) => {
															e.currentTarget.style.color = 'var(--text-secondary)';
															e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
														}}
														onMouseLeave={(e) => {
															e.currentTarget.style.color = 'var(--text-tertiary)';
															e.currentTarget.style.backgroundColor = 'transparent';
														}}
														aria-label="Edit status"
													>
														<Pencil1Icon className="w-4 h-4" />
													</Button>
												)}
												{canDelete && (
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleDelete(status.id)}
														className="p-2 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-gray-700 transition-colors !rounded-none"
														style={{ color: 'var(--text-tertiary)' }}
														onMouseEnter={(e) => {
															e.currentTarget.style.color = '#DC2626';
															e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
														}}
														onMouseLeave={(e) => {
															e.currentTarget.style.color = 'var(--text-tertiary)';
															e.currentTarget.style.backgroundColor = 'transparent';
														}}
														aria-label="Delete status"
													>
														<TrashIcon className="w-4 h-4" />
													</Button>
												)}
											</div>
										</td>
									</tr>
								))
								)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Create/Edit Status Modal */}
			<CreateStatusModal
				isOpen={isCreateModalOpen}
				onClose={() => {
					setIsCreateModalOpen(false);
					setEditingStatus(null);
				}}
				initialData={editingStatus ? {
					name: editingStatus.name,
					description: editingStatus.description,
					roleSelection: editingStatus.roleSelection || 'all',
					selectedRoles: editingStatus.selectedRoles || [],
					color: editingStatus.color,
					isHibernate: editingStatus.isHibernate,
					duration: editingStatus.duration,
				} : null}
				statusId={editingStatus?.id}
			/>

			{/* Delete Status Modal */}
			<DeleteStatusModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setDeletingStatus(null);
				}}
				onConfirm={handleConfirmDelete}
				statusName={deletingStatus?.name || ''}
			/>
		</div>
	);
};

export default Status;
