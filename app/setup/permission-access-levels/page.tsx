'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import Toggle from '@/components/ui/Toggle';
import Icon from '@/components/ui/Icon';
import { useSetup } from '@/contexts/SetupContext';
import { useGetRolesByCompanyIdQuery, useUpdateRoleMutation, Role, RolePermission } from '@/store/services/roleApi';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { toast } from 'sonner';

interface ApiError {
	data?: {
		message?: string;
	};
	message?: string;
}

const getModuleForCategory = (categoryId: string): string => {
	switch (categoryId) {
		case 'userManagementAccess': return 'User Management';
		case 'customerManagement': return 'Customer Book';
		case 'dashboardAccess': return 'Dashboard';
		default: return '';
	}
};

const getPermissionType = (permissionId: string): keyof RolePermission['permissions'] | null => {
	if (permissionId.startsWith('create')) return 'create';
	if (permissionId.startsWith('edit') || permissionId.startsWith('customize')) return 'edit';
	if (permissionId.startsWith('delete')) return 'delete';
	if (permissionId.startsWith('view')) return 'view';
	return null;
};

export default function PermissionAccessLevelsPage() {
	const router = useRouter();
	const { setupData, updatePermissionAccessSettings } = useSetup();
	const { permissionAccessSettings } = setupData;
	const { user } = useUserInfo();

	const companyId = user?.company?._id || user?.companyId || '';

	const { data: rolesData } = useGetRolesByCompanyIdQuery(companyId, {
		skip: !companyId,
	});

	const [updateRole] = useUpdateRoleMutation();

	// Transform API roles to local format
	const roles = React.useMemo(() => {
		if (!rolesData) return [];

		const rawRoles: Role[] = (Array.isArray(rolesData) ? rolesData :
			(Array.isArray((rolesData as unknown as { data?: Role[] }).data) ? (rolesData as unknown as { data?: Role[] }).data :
				(Array.isArray((rolesData as unknown as { roles?: Role[] }).roles) ? (rolesData as unknown as { roles?: Role[] }).roles :
					(Array.isArray((rolesData as unknown as { docs?: Role[] }).docs) ? (rolesData as unknown as { docs?: Role[] }).docs :
						[])))) as Role[];

		const extractedRoles: Role[] = rawRoles.length > 0 ? rawRoles :
			(rolesData && typeof rolesData === 'object' && !Array.isArray(rolesData) ?
				Object.values(rolesData as unknown as Record<string, unknown>).filter((item): item is Role =>
					typeof item === 'object' && item !== null && '_id' in item && 'roleName' in item
				) : []);

		// Deduplicate roles to prevent key collisions
		return Array.from(new Map(extractedRoles.map(role => [role._id, role])).values());
	}, [rolesData]);

	// Sync fetched roles with context state
	useEffect(() => {
		if (roles.length > 0) {
			const newRolePermissions: Record<string, Record<string, boolean>> = {};

			// Initialize permissions for each role from API
			roles.forEach(role => {
				const rolePerms: Record<string, boolean> = {};
				const apiPermissions = role.permissions || [];

				if (Array.isArray(apiPermissions)) {
					permissionAccessSettings.permissionCategories.forEach(category => {
						const moduleName = getModuleForCategory(category.id);
						const rolePermission = apiPermissions.find(p => p.moduleName === moduleName);

						if (rolePermission) {
							category.permissions.forEach(perm => {
								const type = getPermissionType(perm.id);
								if (type) {
									rolePerms[perm.id] = rolePermission.permissions[type];
								}
							});
						}
					});
				}

				newRolePermissions[role._id] = rolePerms;
			});

			// If current selected role is not in the fetched roles, default to the first one
			const currentSelectedRoleValid = roles.some(r => r._id === permissionAccessSettings.selectedRole);
			const newSelectedRole = currentSelectedRoleValid ? permissionAccessSettings.selectedRole : roles[0]._id;

			updatePermissionAccessSettings({
				rolePermissions: {
					...permissionAccessSettings.rolePermissions,
					...newRolePermissions
				},
				selectedRole: newSelectedRole
			});
		}
	}, [rolesData]); // specific dependency on data to trigger update

	const handleRoleChange = (roleId: string) => {
		updatePermissionAccessSettings({
			selectedRole: roleId
		});
	};

	const handlePermissionChange = (permissionId: string, enabled: boolean) => {
		const currentRolePermissions = permissionAccessSettings.rolePermissions[permissionAccessSettings.selectedRole] || {};
		const updatedRolePermissions = {
			...permissionAccessSettings.rolePermissions,
			[permissionAccessSettings.selectedRole]: {
				...currentRolePermissions,
				[permissionId]: enabled
			}
		};

		updatePermissionAccessSettings({
			rolePermissions: updatedRolePermissions
		});
	};

	const handleSaveChanges = async () => {
		try {
			const roleId = permissionAccessSettings.selectedRole;
			const role = roles.find(r => r._id === roleId);

			if (!role) {
				toast.error('No role selected or role not found');
				return;
			}

			const currentPermissions = role.permissions || [];
			const modifiedPermissions = permissionAccessSettings.rolePermissions[roleId] || {};

			// Deep clone current permissions
			const updatedPermissions = currentPermissions.map(p => ({
				...p,
				permissions: { ...p.permissions }
			}));

			// Merge granular permissions into categories
			permissionAccessSettings.permissionCategories.forEach(category => {
				const moduleName = getModuleForCategory(category.id);
				if (!moduleName) return;

				let rolePermission = updatedPermissions.find(p => p.moduleName === moduleName);

				// Create if not exists
				if (!rolePermission) {
					rolePermission = {
						id: '',
						moduleName: moduleName,
						access: true,
						permissions: { view: false, edit: false, delete: false, create: false }
					};
					updatedPermissions.push(rolePermission);
				}

				category.permissions.forEach(perm => {
					const type = getPermissionType(perm.id);
					if (type && modifiedPermissions[perm.id] !== undefined) {
						rolePermission!.permissions[type] = modifiedPermissions[perm.id];
					}
				});
			});

			const payload = {
				roleName: role.roleName,
				description: role.description,
				companyId: role.companyId || companyId,
				permissions: updatedPermissions
			};

			await updateRole({
				id: roleId,
				roleData: payload
			}).unwrap();

			toast.success('Permissions saved successfully');
		} catch (error) {
			const apiError = error as ApiError;
			console.error('Failed to save permissions:', error);
			const errorMessage = apiError?.data?.message || apiError?.message || 'Failed to save permissions';
			toast.error(errorMessage);
		}
	};

	const handleCancel = () => {
		router.back();
	};

	return (
		<div className="w-full h-full ">
			<div className="mb-8">
				<div className="flex items-center gap-2 mb-4">
					<BackButton
						onClick={() => router.back()}
					/>
					<div>
						<h1
							className="font-lato not-italic font-semibold text-[24px] leading-[150%] dark:text-gray-100"
							style={{ color: 'var(--text-secondary)' }}
						>
							Permission Access Levels
						</h1>
						<p
							className="font-lato not-italic font-normal text-[16px] leading-[150%] dark:text-gray-400"
							style={{ color: 'var(--text-tertiary)' }}
						>
							Manage user roles permissions
						</p>
					</div>
				</div>

				{/* Role Tabs */}
				<div
					className="flex gap-1 dark:bg-gray-700 p-1 w-fit"
					style={{ backgroundColor: 'var(--bg-primary)' }}
				>
					{roles.map((role) => (
						<button
							key={role._id}
							onClick={() => handleRoleChange(role._id)}
							className={`px-4 py-2 cursor-pointer font-medium transition-colors font-lato text-base leading-[150%] dark:text-gray-300 ${permissionAccessSettings.selectedRole === role._id
								? 'dark:bg-gray-100 dark:text-gray-900'
								: 'dark:text-gray-400 dark:hover:text-gray-200'
								}`}
							style={permissionAccessSettings.selectedRole === role._id ? {
								backgroundColor: 'var(--text-primary)',
								color: 'white'
							} : {
								color: 'var(--text-tertiary)'
							}}
							onMouseEnter={(e) => {
								if (permissionAccessSettings.selectedRole !== role._id) {
									e.currentTarget.style.color = 'var(--text-secondary)';
								}
							}}
							onMouseLeave={(e) => {
								if (permissionAccessSettings.selectedRole !== role._id) {
									e.currentTarget.style.color = 'var(--text-tertiary)';
								}
							}}
						>
							{role.roleName}
						</button>
					))}
				</div>
			</div>

			{/* Permission Categories */}
			<div className="space-y-6">
				{permissionAccessSettings.permissionCategories.map((category) => (
					<div
						key={category.id}
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
							<div className="flex items-center gap-3">
								<div
									className="w-8 h-8 dark:bg-gray-700 rounded-full flex items-center justify-center"
									style={{ backgroundColor: 'var(--bg-primary)' }}
								>
									<Icon name={category.icon} size="md" />
								</div>
								<h2
									className="font-inter text-lg font-semibold dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									{category.name}
								</h2>
							</div>
						</div>
						<div className="p-6 space-y-4">
							{category.permissions.map((permission) => (
								<div key={permission.id} className="grid grid-cols-2 items-center justify-between">
									<div className="flex-1">
										<h3
											className="font-inter text-sm font-medium dark:text-gray-100 mb-1"
											style={{ color: 'var(--text-primary)' }}
										>
											{permission.name}
										</h3>
										<p
											className="font-lato text-xs dark:text-gray-400 col-span-2"
											style={{ color: 'var(--text-tertiary)' }}
										>
											{permission.description}
										</p>
									</div>
									<div className="col-span-1">
										<Toggle
											checked={permissionAccessSettings.rolePermissions[permissionAccessSettings.selectedRole]?.[permission.id] || false}
											onChange={(enabled) => handlePermissionChange(permission.id, enabled)}
										/>
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>

			{/* Action Buttons */}
			<div className="flex justify-end gap-3 mt-8">
				<Button
					variant="outline"
					size="md"
					onClick={handleCancel}
				>
					Cancel
				</Button>
				<Button
					variant="primary"
					size="md"
					onClick={handleSaveChanges}
				>
					Save Changes
				</Button>
			</div>
		</div>
	);
}