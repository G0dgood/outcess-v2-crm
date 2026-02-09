'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import CreateRoleModal from '@/components/ui/CreateRoleModal';
import Icon from '@/components/ui/Icon';
import Permission from '@/components/ui/Permission';
import { useSetup } from '@/contexts/SetupContext';
import { useCreateRoleMutation, useDeleteRoleMutation, Role, RolePermission, useGetRolesByLineOfBusinessIdQuery } from '@/store/services/roleApi';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { toast } from 'sonner';
import { usePrivilege } from '@/contexts/PrivilegeContext';

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
	const { canAccess } = usePrivilege();
	const canView = canAccess('userManagement', 'view');
	const canCreate = canAccess('userManagement', 'create');
	const canDelete = canAccess('userManagement', 'delete');

	const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
	const companyId = user?.company?._id || user?.companyId || '';

	const { data: rolesData, isLoading, refetch } = useGetRolesByLineOfBusinessIdQuery(setupData?.lineOfBusinessId || '', { skip: !setupData?.lineOfBusinessId });



	const [createRole] = useCreateRoleMutation();
	const [deleteRole] = useDeleteRoleMutation();

	// Deduplicate roles to prevent key collisions
	const roles = React.useMemo(() => {
		if (!rolesData) return [];

		const rawRoles: Role[] = rolesData.roles || [];
		return Array.from(new Map(rawRoles.map(role => [role._id, role])).values());
	}, [rolesData]);

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
	}, [rolesData, companyId, createRole, refetch, roleManagementSettings.modules, isLoading, roles]);

	const handleDeleteRole = async (roleId: string) => {
		if (!canDelete) return;
		if (window.confirm('Are you sure you want to delete this role?')) {
			try {
				await deleteRole(roleId).unwrap();
				toast.success('Role deleted successfully');
				refetch();
			} catch (error) {
				const apiError = error as ApiError;
				console.error('Failed to delete role:', error);
				const errorMessage = apiError?.data?.message || apiError?.message || 'Failed to delete role';
				toast.error(errorMessage);
			}
		}
	};

	if (!canView) {
		return null;
	}

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
								className="font-lato not-italic font-normal text-[10px] md:text-[12px] sm:text-[12px] md:text-[14px] leading-[150%] dark:text-gray-400"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Manage user roles and their associated permissions
							</p>
						</div>
					</div>
					{canCreate && (
						<Button
							variant="primary"
							size="md"
							onClick={() => setIsCreateRoleModalOpen(true)}
							className="flex items-center gap-2 w-full sm:w-auto justify-center"
						>
							<Icon name="plus" className="w-4 h-4" />
							Create New Role
						</Button>
					)}
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
							{role.roleName.toLowerCase() !== 'administrator' && canDelete && (
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

			{/* Permission Component */}
			<Permission lineOfBusinessId={setupData.lineOfBusinessId} className="mt-8" />

			{/* Create Role Modal */}
			<CreateRoleModal
				isOpen={isCreateRoleModalOpen}
				onClose={() => setIsCreateRoleModalOpen(false)}
			/>
		</div>
	);
}
