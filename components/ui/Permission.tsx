'use client';

import React, { useState, useRef, useEffect } from 'react';
import RenameModuleModal from './RenameModuleModal';
import ModulePermissionModal from './ModulePermissionModal';
import Checkbox from './Checkbox';
import Toggle from './Toggle';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';

interface PermissionItem {
	id: string;
	moduleName: string;
	sharedTo: string;
	selectedRoles?: string[];
	dateCreated?: string;
	access: boolean;
	permissions: {
		view: boolean;
		edit: boolean;
		delete: boolean;
		create: boolean;
	};
}

interface PermissionProps {
	className?: string;
}

const roleLabels: { [key: string]: string } = {
	'admin': 'Admin',
	'agent': 'Agent',
	'supervisor': 'Supervisor',
};

const Permission: React.FC<PermissionProps> = ({ className = '' }) => {
	const [permissions, setPermissions] = useState<PermissionItem[]>([
		{
			id: '1',
			moduleName: 'Dashboard',
			sharedTo: 'Admin, Agent',
			selectedRoles: ['admin', 'agent'],
			access: true,
			permissions: {
				view: true,
				edit: false,
				delete: false,
				create: false,
			},
		},
		{
			id: '2',
			moduleName: 'Customer Book',
			sharedTo: 'All roles',
			selectedRoles: ['admin', 'agent', 'supervisor'],
			access: true,
			permissions: {
				view: true,
				edit: false,
				delete: false,
				create: false,
			},
		},
		{
			id: '3',
			moduleName: 'Users',
			sharedTo: 'All roles',
			selectedRoles: ['admin', 'agent', 'supervisor'],
			access: true,
			permissions: {
				view: true,
				edit: false,
				delete: false,
				create: false,
			},
		},
		{
			id: '4',
			moduleName: 'Setup Book',
			sharedTo: 'All roles',
			selectedRoles: ['admin', 'agent', 'supervisor'],
			access: true,
			permissions: {
				view: true,
				edit: false,
				delete: false,
				create: false,
			},
		},
		{
			id: '5',
			moduleName: 'Report',
			sharedTo: 'All roles',
			selectedRoles: ['admin', 'agent', 'supervisor'],
			access: true,
			permissions: {
				view: true,
				edit: false,
				delete: false,
				create: false,
			},
		},
		{
			id: '6',
			moduleName: 'System Configuration',
			sharedTo: 'All roles',
			selectedRoles: ['admin', 'agent', 'supervisor'],
			access: true,
			permissions: {
				view: true,
				edit: false,
				delete: false,
				create: false,
			},
		},
	]);

	const [openMenuId, setOpenMenuId] = useState<string | null>(null);
	const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
	const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
	const [editingPermission, setEditingPermission] = useState<PermissionItem | null>(null);
	const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (openMenuId) {
				const clickedElement = event.target as Node;
				const menuElement = menuRefs.current[openMenuId];
				if (menuElement && !menuElement.contains(clickedElement)) {
					setOpenMenuId(null);
				}
			}
		};

		if (openMenuId) {
			// Use setTimeout to avoid closing immediately when clicking the button
			const timeoutId = setTimeout(() => {
				document.addEventListener('mousedown', handleClickOutside);
			}, 0);

			return () => {
				clearTimeout(timeoutId);
				document.removeEventListener('mousedown', handleClickOutside);
			};
		}
	}, [openMenuId]);

	const handleMenuToggle = (id: string, e?: React.MouseEvent) => {
		if (e) {
			e.stopPropagation();
		}
		setOpenMenuId(openMenuId === id ? null : id);
	};

	const handleRename = (permission: PermissionItem) => {
		setEditingPermission(permission);
		setIsRenameModalOpen(true);
		setOpenMenuId(null);
	};

	const handleModulePermission = (permission: PermissionItem) => {
		setEditingPermission(permission);
		setIsPermissionModalOpen(true);
		setOpenMenuId(null);
	};

	const handleRenameSave = (newName: string) => {
		if (editingPermission) {
			setPermissions(prev => prev.map(p =>
				p.id === editingPermission.id
					? { ...p, moduleName: newName }
					: p
			));
			setEditingPermission(null);
		}
	};

	const handlePermissionSave = (roles: string[]) => {
		if (editingPermission) {
			const sharedTo = roles.length === 3 ? 'All roles' : roles.map(roleId => roleLabels[roleId] || roleId).join(', ');
			setPermissions(prev => prev.map(p =>
				p.id === editingPermission.id
					? { ...p, selectedRoles: roles, sharedTo }
					: p
			));
			setEditingPermission(null);
		}
	};

	const handleAccessToggle = (id: string, value: boolean) => {
		setPermissions(prev => prev.map(p =>
			p.id === id
				? { ...p, access: value }
				: p
		));
	};

	const handlePermissionChange = (id: string, permissionType: 'view' | 'edit' | 'delete' | 'create', value: boolean) => {
		setPermissions(prev => prev.map(p =>
			p.id === id
				? { ...p, permissions: { ...p.permissions, [permissionType]: value } }
				: p
		));
	};

	return (
		<div className={`w-full h-full ${className}`}>
			{/* Header Section */}
			<div className="mb-6">
				<h1 className="text-2xl font-semibold text-gray-900 mb-2">Permission</h1>
				<p className="text-gray-600">
					Keep your team organized and efficient by ensuring every user has access to the right assets.
				</p>
			</div>

			{/* Permission Table */}
			<div className="bg-white border border-gray-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th>Module Name</th>
								<th>Shared To</th>
								<th>Date Created</th>
								<th>Access</th>
								<th>Permission</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{permissions.length === 0 ? (
								<tr>
									<td colSpan={6} className="px-6 py-12 text-center text-gray-500">
										No permissions configured yet.
									</td>
								</tr>
							) : (
								permissions.map((permission) => (
									<tr key={permission.id} className="hover:bg-gray-50 transition-colors">
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="font-medium text-gray-900">{permission.moduleName}</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="text-sm text-gray-600">{permission.sharedTo}</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="text-sm text-gray-600">{permission.dateCreated || ''}</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<Toggle
												checked={permission.access}
												onChange={(checked) => handleAccessToggle(permission.id, checked)}
											/>
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center gap-4">
												<label className="flex items-center gap-2 cursor-pointer">
													<Checkbox
														checked={permission.permissions.view}
														onChange={(checked) => handlePermissionChange(permission.id, 'view', checked)}
													/>
													<span className="text-sm text-gray-700">View</span>
												</label>
												<label className="flex items-center gap-2 cursor-pointer">
													<Checkbox
														checked={permission.permissions.edit}
														onChange={(checked) => handlePermissionChange(permission.id, 'edit', checked)}
													/>
													<span className="text-sm text-gray-700">Edit</span>
												</label>
												<label className="flex items-center gap-2 cursor-pointer">
													<Checkbox
														checked={permission.permissions.delete}
														onChange={(checked) => handlePermissionChange(permission.id, 'delete', checked)}
													/>
													<span className="text-sm text-gray-700">Delete</span>
												</label>
												<label className="flex items-center gap-2 cursor-pointer">
													<Checkbox
														checked={permission.permissions.create}
														onChange={(checked) => handlePermissionChange(permission.id, 'create', checked)}
													/>
													<span className="text-sm text-gray-700">Create</span>
												</label>
											</div>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<div
												className="relative"
												ref={(el) => {
													if (menuRefs && menuRefs.current) {
														menuRefs.current[permission.id] = el;
													}
												}}
											>
												{/* Action Button */}
												<button
													onClick={() => handleMenuToggle(permission.id)}
													className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
													aria-label="Actions"
													aria-expanded={openMenuId === permission.id}
												>
													<DotsHorizontalIcon className="w-4 h-4" />
												</button>

												{/* Dropdown Menu */}
												{openMenuId === permission.id && (
													<div className="absolute right-0 w-48 bg-white border border-gray-200 shadow-lg z-50">
														<div className="flex flex-col">
															<button
																onClick={() => handleRename(permission)}
																className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer"
															>
																Rename
															</button>
															<button
																onClick={() => handleModulePermission(permission)}
																className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
															>
																Module Permission
															</button>
														</div>
													</div>
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

			{/* Rename Module Modal */}
			<RenameModuleModal
				isOpen={isRenameModalOpen}
				onClose={() => {
					setIsRenameModalOpen(false);
					setEditingPermission(null);
				}}
				onSave={handleRenameSave}
				currentName={editingPermission?.moduleName || ''}
			/>

			{/* Module Permission Modal */}
			<ModulePermissionModal
				isOpen={isPermissionModalOpen}
				onClose={() => {
					setIsPermissionModalOpen(false);
					setEditingPermission(null);
				}}
				onSave={handlePermissionSave}
				selectedRoles={editingPermission?.selectedRoles || []}
			/>
		</div>
	);
};

export default Permission;

