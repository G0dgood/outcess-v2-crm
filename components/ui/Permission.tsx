'use client';

import React, { useState, useRef, useEffect } from 'react';
import RenameModuleModal from './RenameModuleModal';
import ModulePermissionModal from './ModulePermissionModal';
import Checkbox from './Checkbox';
import Toggle from './Toggle';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import PageHeading from './PageHeading';
import SubPageHeading from './SubPageHeading';

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
			dateCreated: 'Jan 15, 2024',
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
			dateCreated: 'Jan 10, 2024',
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
			dateCreated: 'Dec 28, 2023',
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
			dateCreated: 'Dec 15, 2023',
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
			dateCreated: 'Dec 5, 2023',
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
			dateCreated: 'Nov 20, 2023',
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
				<PageHeading
					text="Permission"
				/>
				<SubPageHeading
					text="Keep your team organized and efficient by ensuring every user has access to the right assets."
				/>
			</div>

			{/* Permission Table */}
			<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
						<thead className="bg-gray-50 dark:bg-gray-700">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">Module Name</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">Shared To</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">Date Created</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">Access</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">Permission</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">Action</th>
							</tr>
						</thead>
						<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
							{permissions.length === 0 ? (
								<tr>
									<td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
										No permissions configured yet.
									</td>
								</tr>
							) : (
								permissions.map((permission) => (
									<tr key={permission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="font-medium text-gray-900 dark:text-gray-100">{permission.moduleName}</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="text-sm text-gray-600 dark:text-gray-400">{permission.sharedTo}</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="text-sm text-gray-600 dark:text-gray-400">{permission.dateCreated || ''}</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<Toggle
												checked={permission.access}
												onChange={(checked) => handleAccessToggle(permission.id, checked)}
											/>
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center gap-4">
												<Checkbox
													checked={permission.permissions.view}
													onChange={(checked) => handlePermissionChange(permission.id, 'view', checked)}
													label="View"
													size="medium"
												/>
												<Checkbox
													checked={permission.permissions.edit}
													onChange={(checked) => handlePermissionChange(permission.id, 'edit', checked)}
													label="Edit"
													size="medium"
												/>
												<Checkbox
													checked={permission.permissions.delete}
													onChange={(checked) => handlePermissionChange(permission.id, 'delete', checked)}
													label="Delete"
													size="medium"
												/>
												<Checkbox
													checked={permission.permissions.create}
													onChange={(checked) => handlePermissionChange(permission.id, 'create', checked)}
													label="Create"
													size="medium"
												/>
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
													className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
													aria-label="Actions"
													aria-expanded={openMenuId === permission.id}
												>
													<DotsHorizontalIcon className="w-4 h-4" />
												</button>

												{/* Dropdown Menu */}
												{openMenuId === permission.id && (
													<div className="absolute right-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50">
														<div className="flex flex-col">
															<button
																onClick={() => handleRename(permission)}
																className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 cursor-pointer"
															>
																Rename
															</button>
															<button
																onClick={() => handleModulePermission(permission)}
																className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
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

