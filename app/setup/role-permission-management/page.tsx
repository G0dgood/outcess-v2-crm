'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import Toggle from '@/components/ui/Toggle';
import CreateRoleModal from '@/components/ui/CreateRoleModal';
import Icon from '@/components/ui/Icon';

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
	const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
	const [roles, setRoles] = useState<Role[]>([
		{
			id: 'administrator',
			name: 'Administrator',
			description: 'Full access to the system',
			permissions: {
				dashboard: true,
				customerBook: true,
				userManagement: true,
				setupBook: true,
				customerSMS: true,
				report: true,
				systemSetting: true,
				auditLog: true,
			}
		},
		{
			id: 'supervisor',
			name: 'Supervisor',
			description: 'Team management and reporting capabilities',
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
		},
		{
			id: 'agent',
			name: 'Agent',
			description: 'Customer support and interaction',
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
		}
	]);

	const modules: Module[] = [
		{
			id: 'dashboard',
			name: 'Dashboard'
		},
		{ id: 'customerBook', name: 'Customer Book' },
		{ id: 'userManagement', name: 'User Management' },
		{ id: 'setupBook', name: 'Setup Book' },
		{ id: 'customerSMS', name: 'Customer SMS' },
		{ id: 'report', name: 'Report' },
		{ id: 'systemSetting', name: 'System Setting' },
		{ id: 'auditLog', name: 'Audit Log' },
	];

	const handlePermissionChange = (roleId: string, moduleId: string, enabled: boolean) => {
		setRoles(prev => prev.map(role =>
			role.id === roleId
				? { ...role, permissions: { ...role.permissions, [moduleId]: enabled } }
				: role
		));
	};

	const handleCreateRole = (roleData: { name: string; description: string }) => {
		// Generate unique ID to prevent duplicates
		const baseId = roleData.name.toLowerCase().replace(/\s+/g, '-');
		let uniqueId = baseId;
		let counter = 1;

		// Check if ID already exists and make it unique
		while (roles.some(role => role.id === uniqueId)) {
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
		setRoles(prev => [...prev, newRole]);
	};

	const handleDeleteRole = (roleId: string) => {
		// Prevent deletion of Administrator role
		if (roleId === 'administrator') {
			return;
		}
		setRoles(prev => prev.filter(role => role.id !== roleId));
	};

	const handleSaveChanges = () => {
		console.log('Saving role permissions:', roles);
		// TODO: Implement save functionality
	};

	const handleCancel = () => {
		// TODO: Implement cancel functionality or navigation back
		console.log('Canceling changes');
	};

	return (
		<div className="w-full h-full">
			<div className="mb-8">
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-2">
						<BackButton
							onClick={() => router.back()}
							size="md"
						/>
						<div>
							<h1 className="font-lato not-italic font-semibold text-[24px] leading-[150%] text-[#3A4050]">Role & Permission Management</h1>
							<p className="font-lato not-italic font-normal text-[16px] leading-[150%] text-[#6D7280]">Manage user roles and their associated permissions</p>
						</div>
					</div>
					<Button
						variant="primary"
						size="md"
						onClick={() => setIsCreateRoleModalOpen(true)}
						className="flex items-center gap-2"
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
				{roles.map((role) => (
					<div key={role.id} className="bg-white border border-gray-200   p-6 relative group">
						<div className="flex items-center justify-between mb-1">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8    flex items-center justify-center">
									<Icon name="darhboard" size="md" />
								</div>
							</div>
							{role.id !== 'administrator' && (
								<button
									onClick={() => handleDeleteRole(role.id)}
									className="duration-200 p-1 hover:bg-red-50 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center"
									title="Delete role"
								>
									<Icon name="Trash_light" size="sm" />
								</button>
							)}
						</div>
						<h3 className="font-lato font-medium text-base leading-[150%] text-[#3A4050]">{role.name}</h3>
						<p className="font-lato font-normal text-[12px] leading-[150%] text-[#6D7280]">{role.description}</p>
					</div>
				))}
			</div>

			{/* Module Permission Overview */}
			<div className="bg-white border border-gray-200 ">
				<div className="p-6 border-b border-gray-200">
					<h2 className="font-inter text-xl font-semibold text-[#050711]">Module Permission Overview</h2>
				</div>

				<div className="overflow-x-auto">
					<table className="min-w-full">
						<thead className="bg-gray-50">
							<tr>
								<th className="py-4 px-6 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Features/Modules</th>
								{roles.map((role) => (
									<th key={role.id} className="py-4 px-6 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
										{role.name}
									</th>
								))}
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{modules.map((module) => (
								<tr key={module.id}>
									<td className="py-4 px-6 text-sm font-medium text-[#050711]">
										{module.name}
									</td>
									{roles.map((role) => (
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
			<div className="flex justify-end gap-3 mt-6">
				<Button
					variant="outline"
					size="md"
					onClick={() => router.back()}
				>
					Cancel
				</Button>
				<Button
					variant="primary"
					size="md"
					onClick={handleSaveChanges}
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
