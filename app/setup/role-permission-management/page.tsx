'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import Toggle from '@/components/ui/Toggle';
import CreateRoleModal from '@/components/ui/CreateRoleModal';
import Icon from '@/components/ui/Icon';
import { useSetup } from '@/contexts/SetupContext';
import { useGetRolesByCompanyIdQuery, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation, Role, RolePermission } from '@/store/services/roleApi';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { toast } from 'sonner';

interface ApiError {
	data?: {
		message?: string;
	};
	message?: string;
}

export default function RolePermissionManagementPage() {
	const router = useRouter();
	const { setupData } = useSetup();
	const { user } = useUserInfo();
	const { roleManagementSettings } = setupData;
	const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);

	const companyId = user?.company?._id || user?.companyId || '';

	const { data: rolesData, isLoading, refetch } = useGetRolesByCompanyIdQuery(companyId, {
		skip: !companyId,
	});

	const [createRole] = useCreateRoleMutation();
	const [updateRole] = useUpdateRoleMutation();
	const [deleteRole] = useDeleteRoleMutation();

	// Transform API roles to local format or use API roles directly
	const rawRoles: Role[] = (Array.isArray(rolesData) ? rolesData :
		(Array.isArray((rolesData as any)?.data) ? (rolesData as any).data :
			(Array.isArray((rolesData as any)?.roles) ? (rolesData as any).roles :
				(Array.isArray((rolesData as any)?.docs) ? (rolesData as any).docs :
					[])))) as Role[];

	// If roles array is empty but we have data in rolesData that looks like a single role or object of roles
	// Try to extract from object values if it's an object of roles
	const extractedRoles: Role[] = rawRoles.length > 0 ? rawRoles :
		(rolesData && typeof rolesData === 'object' && !Array.isArray(rolesData) ?
			Object.values(rolesData as any).filter((item): item is Role =>
				typeof item === 'object' && item !== null && '_id' in item && 'roleName' in item
			) : []);

	// Deduplicate roles to prevent key collisions
	const roles = React.useMemo(() => {
		return Array.from(new Map(extractedRoles.map(role => [role._id, role])).values());
	}, [extractedRoles]);

	useEffect(() => {
		const ensureAdminRole = async () => {
			if (!isLoading && rolesData && companyId) {
				const hasAdmin = roles.some((role) => role.roleName.toLowerCase() === 'administrator');
				if (!hasAdmin) {
					try {
						const adminPermissions: RolePermission[] = roleManagementSettings.modules.map(module => ({
							id: '',
							moduleName: module.name,
							access: true,
							permissions: {
								view: true,
								edit: true,
								delete: true,
								create: true
							}
						}));

						await createRole({
							roleName: 'administrator',
							description: 'Full access to all system features',
							companyId: companyId,
							permissions: adminPermissions
						}).unwrap();
						refetch();
					} catch (error) {
						console.error('Failed to create default administrator role:', error);
					}
				}
			}
		};

		ensureAdminRole();
	}, [rolesData, companyId, createRole, refetch, roleManagementSettings.modules]);

	const handlePermissionChange = async (roleId: string, moduleId: string, enabled: boolean) => {
		const roleToUpdate = roles.find((r: Role) => r._id === roleId);
		if (roleToUpdate) {
			const moduleName = roleManagementSettings.modules.find(m => m.id === moduleId)?.name;
			if (!moduleName) return;

			const currentPermissions = roleToUpdate.permissions || [];
			const updatedPermissions = currentPermissions.map(p => ({
				...p,
				permissions: { ...p.permissions }
			}));

			const permissionIndex = updatedPermissions.findIndex(p => p.moduleName === moduleName);

			if (permissionIndex >= 0) {
				updatedPermissions[permissionIndex] = {
					...updatedPermissions[permissionIndex],
					access: enabled
				};
			} else {
				updatedPermissions.push({
					id: '',
					moduleName: moduleName,
					access: enabled,
					permissions: {
						view: false,
						edit: false,
						delete: false,
						create: false
					}
				});
			}

			// Construct full payload to ensure validation passes
			// Some APIs require all fields even for updates, or validate presence of required fields
			const payload = {
				roleName: roleToUpdate.roleName,
				description: roleToUpdate.description,
				companyId: companyId,
				permissions: updatedPermissions
			};

			try {
				await updateRole({
					id: roleId,
					roleData: payload as any // Cast to any to bypass strict permission type check since we construct it dynamically
				}).unwrap();
				toast.success('Permission updated successfully');
			} catch (error) {
				const apiError = error as ApiError;
				console.error('Failed to update permission:', error);
				const errorMessage = apiError?.data?.message || apiError?.message || 'Failed to update permission';
				toast.error(errorMessage);
			}
		}
	};

	const handleDeleteRole = async (roleId: string) => {
		if (window.confirm('Are you sure you want to delete this role?')) {
			try {
				await deleteRole(roleId).unwrap();
				toast.success('Role deleted successfully');
			} catch (error) {
				const apiError = error as ApiError;
				console.error('Failed to delete role:', error);
				const errorMessage = apiError?.data?.message || apiError?.message || 'Failed to delete role';
				toast.error(errorMessage);
			}
		}
	};

	const handleSaveChanges = () => {
		// TODO: Implement save functionality
		console.log('Save changes');
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
				{roles.map((role: Role) => (
					<div
						key={role._id}
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
							{role.roleName.toLowerCase() !== 'administrator' && (
								<button
									onClick={() => handleDeleteRole(role._id)}
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
							{role.roleName}
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
								{roles.map((role: Role) => (
									<th
										key={role._id}
										className="py-4 px-6 text-left text-xs sm:text-sm font-medium dark:text-gray-400 uppercase tracking-wider"
										style={{ color: 'var(--text-primary)' }}
									>
										{role.roleName}
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
									{roles.map((role: Role) => (
										<td key={`${role._id}-${module.id}`} className="py-4 px-6 text-center">
											<Toggle
												checked={role.permissions?.find((p: RolePermission) => p.moduleName === module.name)?.access || false}
												onChange={(enabled) => handlePermissionChange(role._id, module.id, enabled)}
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
				onSuccess={() => {
					// Optionally refresh roles list or show success message
					console.log('Role created successfully');
				}}
			/>
		</div>
	);
}
