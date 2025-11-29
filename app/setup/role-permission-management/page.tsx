'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import Toggle from '@/components/ui/Toggle';
import CreateRoleModal from '@/components/ui/CreateRoleModal';
import Icon from '@/components/ui/Icon';
import { useSetup } from '@/contexts/SetupContext';

interface Role {
	id: string;
	name: string;
	description: string;
	permissions: Record<string, boolean>;
}

interface Module {
	id: string;
	name: string;
}

export default function RolePermissionManagementPage() {
	const router = useRouter();
	const { setupData, updateRoleManagementSettings } = useSetup();
	const { roleManagementSettings } = setupData;
	const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);

	const handlePermissionChange = (roleId: string, moduleId: string, enabled: boolean) => {
		const updatedRoles = roleManagementSettings.roles.map(role =>
			role.id === roleId
				? { ...role, permissions: { ...role.permissions, [moduleId]: enabled } }
				: role
		);
		updateRoleManagementSettings({ roles: updatedRoles });
	};

	const handleCreateRole = (roleData: { name: string; description: string }) => {
		// Generate unique ID to prevent duplicates
		const baseId = roleData.name.toLowerCase().replace(/\s+/g, '-');
		let uniqueId = baseId;
		let counter = 1;

		// Check if ID already exists and make it unique
		while (roleManagementSettings.roles.some(role => role.id === uniqueId)) {
			uniqueId = `${baseId}-${counter}`;
			counter++;
		}

		// Fallback to timestamp-based ID if name-based ID generation fails
		if (counter > 100) {
			uniqueId = `role-${Date.now()}`;
		}

		const newRole: Role = {
			id: uniqueId,
			name: roleData.name,
			description: roleData.description,
			permissions: {
				dashboard: false,
				customerBook: false,
				userManagement: false,
				setupBook: false,
				customerSMS: false,
				report: false,
				systemSetting: false,
				auditLog: false,
			}
		};
		updateRoleManagementSettings({
			roles: [...roleManagementSettings.roles, newRole]
		});
	};

	const handleDeleteRole = (roleId: string) => {
		// Prevent deletion of Administrator role
		if (roleId === 'administrator') {
			return;
		}
		updateRoleManagementSettings({
			roles: roleManagementSettings.roles.filter(role => role.id !== roleId)
		});
	};

	const handleSaveChanges = () => {
		console.log('Saving role permissions:', roleManagementSettings.roles);
		// TODO: Implement save functionality
	};

	const handleCancel = () => {
		// TODO: Implement cancel functionality or navigation back
		console.log('Canceling changes');
	};

	return (
		<div className="w-full h-full">
			<div className="mb-8">
				<div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
					<div className="flex items-center gap-2">
						<BackButton
							onClick={() => router.back()}
						/>
						<div>
							<h1
								className="font-lato not-italic font-semibold text-[20px] sm:text-[24px] leading-[150%] dark:text-gray-100"
								style={{ color: 'var(--text-secondary)' }}
							>
								Role & Permission Management
							</h1>
							<p
								className="font-lato not-italic font-normal text-[14px] sm:text-[16px] leading-[150%] dark:text-gray-400"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Manage user roles and their associated permissions
							</p>
						</div>
					</div>
					<Button
						variant="primary"
						size="md"
						onClick={() => setIsCreateRoleModalOpen(true)}
						className="flex items-center gap-2 w-full sm:w-auto justify-center"
					>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M8 1V15M1 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
						</svg>
						Create New Role
					</Button>
				</div>
			</div>

			{/* Role Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				{roleManagementSettings.roles.map((role) => (
					<div
						key={role.id}
						className="dark:bg-gray-800 border dark:border-gray-700 p-6 relative group"
						style={{
							backgroundColor: 'var(--accent-white)',
							borderColor: 'var(--light-gray)'
						}}
					>
						<div className="flex items-center justify-between mb-1">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 flex items-center justify-center">
									<Icon name="darhboard" size="md" />
								</div>
							</div>
							{role.id !== 'administrator' && (
								<button
									onClick={() => handleDeleteRole(role.id)}
									className="duration-200 p-1 dark:hover:bg-red-900/20 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center"
									style={{
										backgroundColor: 'transparent'
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.backgroundColor = 'transparent';
									}}
									title="Delete role"
								>
									<Icon name="Trash_light" size="sm" />
								</button>
							)}
						</div>
						<h3
							className="font-lato font-medium text-base leading-[150%] dark:text-gray-100"
							style={{ color: 'var(--text-secondary)' }}
						>
							{role.name}
						</h3>
						<p
							className="font-lato font-normal text-[12px] leading-[150%] dark:text-gray-400"
							style={{ color: 'var(--text-tertiary)' }}
						>
							{role.description}
						</p>
					</div>
				))}
			</div>

			{/* Module Permission Overview */}
			<div
				className="dark:bg-gray-800 border dark:border-gray-700"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<div
					className="p-6 border-b dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<h2
						className="font-inter text-lg sm:text-xl font-semibold dark:text-gray-100"
						style={{ color: 'var(--text-primary)' }}
					>
						Module Permission Overview
					</h2>
				</div>

				<div className="overflow-x-auto">
					<table className="min-w-full">
						<thead
							className="dark:bg-gray-700"
							style={{ backgroundColor: 'var(--bg-primary)' }}
						>
							<tr
								style={{
									borderBottom: '1px solid',
									borderBottomColor: 'var(--light-gray)'
								}}
							>
								<th
									className="py-4 px-6 text-left text-xs sm:text-sm font-medium dark:text-gray-400 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Features/Modules
								</th>
								{roleManagementSettings.roles.map((role) => (
									<th
										key={role.id}
										className="py-4 px-6 text-left text-xs sm:text-sm font-medium dark:text-gray-400 uppercase tracking-wider"
										style={{ color: 'var(--text-primary)' }}
									>
										{role.name}
									</th>
								))}
							</tr>
						</thead>
						<tbody
							className="dark:bg-gray-800"
							style={{
								backgroundColor: 'var(--accent-white)'
							}}
						>
							{roleManagementSettings.modules.map((module, index) => (
								<tr
									key={module.id}
									className="dark:hover:bg-gray-700"
									style={{
										borderBottom: index !== roleManagementSettings.modules.length - 1 ? '1px solid' : 'none',
										borderBottomColor: index !== roleManagementSettings.modules.length - 1 ? 'var(--light-gray)' : 'transparent'
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.backgroundColor = 'var(--accent-white)';
									}}
								>
									<td
										className="py-4 px-6 text-xs sm:text-sm font-medium dark:text-gray-100"
										style={{ color: 'var(--text-primary)' }}
									>
										{module.name}
									</td>
									{roleManagementSettings.roles.map((role) => (
										<td key={`${role.id}-${module.id}`} className="py-4 px-6 text-center">
											<Toggle
												checked={role.permissions[module.id]}
												onChange={(enabled) => handlePermissionChange(role.id, module.id, enabled)}
											/>
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-6">
				<Button
					variant="outline"
					size="md"
					onClick={() => router.back()}
					className="w-full sm:w-auto"
				>
					Cancel
				</Button>
				<Button
					variant="primary"
					size="md"
					onClick={handleSaveChanges}
					className="w-full sm:w-auto"
				>
					Save Change
				</Button>
			</div>

			{/* Create Role Modal */}
			<CreateRoleModal
				isOpen={isCreateRoleModalOpen}
				onClose={() => setIsCreateRoleModalOpen(false)}
				onCreate={handleCreateRole}
			/>
		</div>
	);
}
