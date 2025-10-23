'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import Toggle from '@/components/ui/Toggle';
import Icon from '@/components/ui/Icon';

interface Permission {
	id: string;
	name: string;
	description: string;
}

interface PermissionCategory {
	id: string;
	name: string;
	icon: string;
	permissions: Permission[];
}

interface RolePermissions {
	[roleId: string]: {
		[permissionId: string]: boolean;
	};
}

export default function PermissionAccessLevelsPage() {
	const router = useRouter();
	const [selectedRole, setSelectedRole] = useState<'admin' | 'supervisor' | 'agent'>('admin');
	const [rolePermissions, setRolePermissions] = useState<RolePermissions>({
		admin: {},
		supervisor: {},
		agent: {},
	});

	const permissionCategories: PermissionCategory[] = [
		{
			id: 'user-management',
			name: 'User Management',
			icon: 'User_alt_light',
			permissions: [
				{
					id: 'create-users',
					name: 'Create Users',
					description: 'Ability to create new user accounts'
				},
				{
					id: 'edit-users',
					name: 'Edit Users',
					description: 'Modify existing user profiles and settings'
				},
				{
					id: 'delete-users',
					name: 'Delete Users',
					description: 'Remove user accounts from the system'
				},
				{
					id: 'view-users',
					name: 'View Users',
					description: 'View user profiles and information'
				},
				{
					id: 'reset-passwords',
					name: 'Reset Passwords',
					description: 'Reset user passwords and send recovery emails'
				}
			]
		},
		{
			id: 'system-configuration',
			name: 'System Configuration',
			icon: 'Setting_line_light',
			permissions: [
				{
					id: 'system-settings',
					name: 'System Settings',
					description: 'Modify system-wide configurations'
				},
				{
					id: 'security-settings',
					name: 'Security Settings',
					description: 'Configure security parameters'
				},
				{
					id: 'log-access',
					name: 'Log Access',
					description: 'View and export system logs'
				}
			]
		},
		{
			id: 'dashboard',
			name: 'Dashboard',
			icon: 'darhboard',
			permissions: [
				{
					id: 'create-widget',
					name: 'Create Widget',
					description: 'Ability to create new widget'
				},
				{
					id: 'edit-widget',
					name: 'Edit Widget',
					description: 'Modify existing widget'
				},
				{
					id: 'delete-widget',
					name: 'Delete Widget',
					description: 'Remove widget from the system'
				},
				{
					id: 'view-widget',
					name: 'View Widget',
					description: 'View dashboard widgets'
				},
				{
					id: 'configure-dashboard',
					name: 'Configure Dashboard',
					description: 'Ability to configure dashboard'
				}
			]
		},
		{
			id: 'customer-book',
			name: 'Customer Book',
			icon: 'Group_light',
			permissions: [
				{
					id: 'view-customer-list',
					name: 'View Customer List',
					description: 'Ability to view customer list'
				},
				{
					id: 'add-new-customer',
					name: 'Add New Customer',
					description: 'Ability to add new customer'
				},
				{
					id: 'edit-customer-details',
					name: 'Edit Customer Details',
					description: 'Modify existing customer details'
				},
				{
					id: 'delete-customer',
					name: 'Delete Customer',
					description: 'Remove customer from the system'
				}
			]
		}
	];

	const roles = [
		{ id: 'admin', name: 'Admin' },
		{ id: 'supervisor', name: 'Supervisor' },
		{ id: 'agent', name: 'Agent' }
	];

	const handlePermissionChange = (permissionId: string, enabled: boolean) => {
		setRolePermissions(prev => ({
			...prev,
			[selectedRole]: {
				...prev[selectedRole],
				[permissionId]: enabled
			}
		}));
	};

	const handleSaveChanges = () => {
		console.log('Saving permission changes:', rolePermissions);
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
						size="md"
					/>
					<div>
						<h1 className="font-lato not-italic font-semibold text-[24px] leading-[150%] text-[#3A4050]">Permission Access Levels</h1>
						<p className="font-lato not-italic font-normal text-[16px] leading-[150%] text-[#6D7280]">Manage user roles permissions</p>
					</div>
				</div>

				{/* Role Tabs */}
				<div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
					{roles.map((role) => (
						<button
							key={role.id}
							onClick={() => setSelectedRole(role.id as 'admin' | 'supervisor' | 'agent')}
							className={`px-4 py-2 rounded-md   font-medium transition-colors font-lato text-base leading-[150%] text-[#3A4050] ${selectedRole === role.id
								? 'bg-[#050711] text-white'
								: 'text-gray-600 hover:text-gray-900'
								}`}
						>
							{role.name}
						</button>
					))}
				</div>
			</div>

			{/* Permission Categories */}
			<div className="space-y-6">
				{permissionCategories.map((category) => (
					<div key={category.id} className="bg-white border border-gray-200 ">
						<div className="p-6 border-b border-gray-200">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
									<Icon name={category.icon} size="md" />
								</div>
								<h2 className="font-inter text-lg font-semibold text-[#050711]">{category.name}</h2>
							</div>
						</div>

						<div className="p-6 space-y-4">
							{category.permissions.map((permission) => (
								<div key={permission.id} className="grid grid-cols-2 items-center justify-between">
									<div className="flex-1">
										<h3 className="font-inter text-sm font-medium text-[#050711] mb-1">{permission.name}</h3>
										<p className="font-lato text-xs text-gray-600 col-span-2">{permission.description}</p>
									</div>
									<div className="col-span-1">
										<Toggle
											checked={rolePermissions[selectedRole]?.[permission.id] || false}
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
			<div className="flex justify-end gap-3 mt-8 pb-8">
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
					Save Change
				</Button>
			</div>
		</div>
	);
}
