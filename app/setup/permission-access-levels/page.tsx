'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import Toggle from '@/components/ui/Toggle';
import Icon from '@/components/ui/Icon';
import { useSetup } from '@/contexts/SetupContext';







export default function PermissionAccessLevelsPage() {
	const router = useRouter();
	const { setupData, updatePermissionAccessSettings } = useSetup();
	const { permissionAccessSettings, roleManagementSettings } = setupData;

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

	const handleSaveChanges = () => {
		console.log('Saving permission changes:', permissionAccessSettings.rolePermissions);
		// TODO: Implement save functionality
		router.back();
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
					{roleManagementSettings.roles.map((role) => (
						<button
							key={role.id}
							onClick={() => handleRoleChange(role.id)}
							className={`px-4 py-2 cursor-pointer font-medium transition-colors font-lato text-base leading-[150%] dark:text-gray-300 ${permissionAccessSettings.selectedRole === role.id
								? 'dark:bg-gray-100 dark:text-gray-900'
								: 'dark:text-gray-400 dark:hover:text-gray-200'
								}`}
							style={permissionAccessSettings.selectedRole === role.id ? {
								backgroundColor: 'var(--text-primary)',
								color: 'white'
							} : {
								color: 'var(--text-tertiary)'
							}}
							onMouseEnter={(e) => {
								if (permissionAccessSettings.selectedRole !== role.id) {
									e.currentTarget.style.color = 'var(--text-secondary)';
								}
							}}
							onMouseLeave={(e) => {
								if (permissionAccessSettings.selectedRole !== role.id) {
									e.currentTarget.style.color = 'var(--text-tertiary)';
								}
							}}
						>
							{role.name}
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