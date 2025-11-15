'use client';

import React, { useState } from 'react';
import Button from './Button';
import CreateStatusModal from './CreateStatusModal';
import DeleteStatusModal from './DeleteStatusModal';
import { TrashIcon, Pencil1Icon } from '@radix-ui/react-icons';
import SubPageHeading from './SubPageHeading';
import PageHeading from './PageHeading';

interface StatusItem {
	id: string;
	name: string;
	description: string;
	role: string;
	roleSelection?: 'all' | 'selected';
	selectedRoles?: string[];
	icon?: string;
	color: string;
}

interface StatusFormData {
	name: string;
	description: string;
	roleSelection: 'all' | 'selected';
	selectedRoles: string[];
	color: string;
}

interface StatusProps {
	className?: string;
}

const roleLabels: { [key: string]: string } = {
	'agents': 'Agents',
	'supervisors': 'Supervisors',
	'admin': 'Admin',
};

const Status: React.FC<StatusProps> = ({ className = '' }) => {
	const [statuses, setStatuses] = useState<StatusItem[]>([
		{
			id: '1',
			name: 'Available/Ready',
			description: 'The user is logged In and ready to receive calls.',
			role: 'All users',
			roleSelection: 'all',
			color: '#10B981',
		},
		{
			id: '2',
			name: 'Busy',
			description: 'The user is currently engaged in a call or activity and cannot receive new calls',
			role: 'All users',
			roleSelection: 'all',
			color: '#EF4444',
		},
		{
			id: '3',
			name: 'On Call',
			description: 'The user is actively on a call.',
			role: 'Agents',
			roleSelection: 'selected',
			selectedRoles: ['agents'],
			color: '#3B82F6',
		},
		{
			id: '4',
			name: 'After Call Work (ACW)',
			description: 'The user is completing tasks related to a call after It has ended.',
			role: 'Agents, Supervisors',
			roleSelection: 'selected',
			selectedRoles: ['agents', 'supervisors'],
			color: '#F59E0B',
		},
		{
			id: '5',
			name: 'Away',
			description: 'The user is temporarily unavailable but still logged In (restroom break).',
			role: 'All users',
			roleSelection: 'all',
			color: '#A855F7',
		},
		{
			id: '6',
			name: 'On Break',
			description: 'The user is taking a scheduled break.',
			role: 'All users',
			roleSelection: 'all',
			color: '#6366F1',
		},
		{
			id: '7',
			name: 'In a Meeting',
			description: 'The user is engaged In a meeting and unavailable for calls.',
			role: 'Supervisors',
			roleSelection: 'selected',
			selectedRoles: ['supervisors'],
			color: '#14B8A6',
		},
	]);

	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [editingStatus, setEditingStatus] = useState<StatusItem | null>(null);
	const [deletingStatus, setDeletingStatus] = useState<StatusItem | null>(null);

	const formatRoleDisplay = (status: StatusItem): string => {
		if (status.roleSelection === 'all' || !status.roleSelection) {
			return 'All users';
		}
		if (status.selectedRoles && status.selectedRoles.length > 0) {
			return status.selectedRoles.map(roleId => roleLabels[roleId] || roleId).join(', ');
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

	const handleCreate = (data: StatusFormData) => {
		const roleDisplay = data.roleSelection === 'all'
			? 'All users'
			: data.selectedRoles.map(roleId => roleLabels[roleId] || roleId).join(', ');

		if (editingStatus) {
			// Update existing status
			setStatuses(prev => prev.map(status =>
				status.id === editingStatus.id
					? { ...status, ...data, role: roleDisplay }
					: status
			));
		} else {
			// Create new status
			const newStatus: StatusItem = {
				id: Date.now().toString(),
				name: data.name,
				description: data.description,
				role: roleDisplay,
				roleSelection: data.roleSelection,
				selectedRoles: data.selectedRoles,
				color: data.color || '#6C8B7D',
			};
			setStatuses(prev => [...prev, newStatus]);
		}
		setIsCreateModalOpen(false);
		setEditingStatus(null);
	};

	const handleConfirmDelete = () => {
		if (deletingStatus) {
			setStatuses(prev => prev.filter(status => status.id !== deletingStatus.id));
			setIsDeleteModalOpen(false);
			setDeletingStatus(null);
		}
	};

	return (
		<div className={`w-full h-full ${className}`}>
			{/* Header Section */}
			<div className="mb-6 flex items-start justify-between">
				<div className="flex-1">
					<PageHeading
						text="Status"
					/>
					<SubPageHeading
						text="Add fields to capture more details about customer interactions. You can arrange these fields in call forms for agents and customers to enhance data collection and improve service quality."
					/>
				</div>
				<Button
					variant="primary"
					size="md"
					onClick={handleCreateStatus}
				>
					Create Status
				</Button>
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
									className="px-6 py-3 text-left text-xs font-medium dark:text-gray-100 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Statuses
								</th>
								<th
									className="px-6 py-3 text-left text-xs font-medium dark:text-gray-100 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Description
								</th>
								<th
									className="px-6 py-3 text-left text-xs font-medium dark:text-gray-100 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Role
								</th>
								<th
									className="px-6 py-3 text-left text-xs font-medium dark:text-gray-100 uppercase tracking-wider"
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
								<tr>
									<td
										colSpan={4}
										className="px-6 py-12 text-center dark:text-gray-400"
										style={{ color: 'var(--text-tertiary)' }}
									>
										No statuses configured yet.
									</td>
								</tr>
							) : (
								statuses.map((status) => (
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
												className="text-sm dark:text-gray-400"
												style={{ color: 'var(--text-tertiary)' }}
											>
												{status.description}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className="text-sm dark:text-gray-400"
												style={{ color: 'var(--text-tertiary)' }}
											>
												{formatRoleDisplay(status)}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center gap-3">
												<button
													onClick={() => handleEdit(status.id)}
													className="p-2 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
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
												</button>
												<button
													onClick={() => handleDelete(status.id)}
													className="p-2 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-gray-700 transition-colors"
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
												</button>
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
				onCreate={handleCreate}
				initialData={editingStatus ? {
					name: editingStatus.name,
					description: editingStatus.description,
					roleSelection: editingStatus.roleSelection || 'all',
					selectedRoles: editingStatus.selectedRoles || [],
					color: editingStatus.color,
				} : null}
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

