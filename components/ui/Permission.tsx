'use client';

import React, { useState, useEffect } from 'react';
import Checkbox from './Checkbox';
import Toggle from './Toggle';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import PageHeading from './PageHeading';
import SubPageHeading from './SubPageHeading';
import Button from './Button';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useGetPermissionWithPrivilegeQuery, useUpdateRoleMutation, RolePermission, Role } from '@/store/services/roleApi';
import { toastError, toastSuccess } from '@/utils/toastWithSound';
import PermissionSkeleton from '@/components/skeletons/PermissionSkeleton';

interface PermissionItem {
	id: string;
	moduleName: string;
	dateCreated?: string;
	access: boolean;
	permissions: {
		view: boolean;
		edit: boolean;
		delete: boolean;
		create: boolean;
	};
}

// Helper to map RolePermission (API) to PermissionItem (UI)
const mapRolePermissionToItem = (p: RolePermission): PermissionItem => {
	return {
		id: p.id,
		moduleName: p.moduleName,
		access: p.access,
		permissions: p.permissions
	};
};

interface PermissionProps {
	className?: string;
	lineOfBusinessId?: string;
}

const Permission: React.FC<PermissionProps> = ({ className = '', lineOfBusinessId }) => {
	const { selectedLineOfBusinessId } = useLineOfBusiness();
	const targetId = lineOfBusinessId || selectedLineOfBusinessId;

	// Note: API returns { roles: Role[] } now
	const { data: permissionData, isLoading } = useGetPermissionWithPrivilegeQuery(targetId || '', {
		skip: !targetId
	});

	// State now holds the roles with their permissions
	const [rolesPermissions, setRolesPermissions] = useState<Role[]>([]);
	const [originalRolesPermissions, setOriginalRolesPermissions] = useState<Role[]>([]);

	useEffect(() => {
		if (permissionData && permissionData.roles) {
			setRolesPermissions(permissionData.roles);
			try {
				const cloned = JSON.parse(JSON.stringify(permissionData.roles)) as Role[];
				setOriginalRolesPermissions(cloned);
			} catch {
				setOriginalRolesPermissions(permissionData.roles);
			}
		} else if (permissionData) {
		}
	}, [permissionData]);

	const [updateRole] = useUpdateRoleMutation();
	const [updatingRoleIds, setUpdatingRoleIds] = useState<string[]>([]);

	const handleSaveRole = async (role: Role) => {
		const roleId = role._id || role.id!;
		if (updatingRoleIds.includes(roleId)) return;

		setUpdatingRoleIds(prev => [...prev, roleId]);
		try {
			const roleData = {
				roleName: role?.roleName,
				description: role?.description,
				companyId: role?.companyId,
				lineOfBusinessId: role?.lineOfBusinessId,
				permissions: role?.permissions || []
			};
			await updateRole({ id: roleId, roleData }).unwrap();
			toastSuccess('Permissions updated successfully');
			// Update original snapshot for this role to current values
			setOriginalRolesPermissions(prev => prev.map(r => {
				const currentRoleId = r._id || r.id;
				if (currentRoleId === roleId) {
					try {
						return JSON.parse(JSON.stringify(role)) as Role;
					} catch {
						return role;
					}
				}
				return r;
			}));
		} catch (error) {
			console.error('Failed to update permissions:', error);
			toastError('Failed to update permissions');
		} finally {
			setUpdatingRoleIds(prev => prev.filter(id => id !== roleId));
		}
	};

	// Dirty-check helpers
	const arePermissionsEqual = (a: RolePermission[] = [], b: RolePermission[] = []) => {
		if ((a?.length || 0) !== (b?.length || 0)) return false;
		const toMap = (arr: RolePermission[]) => {
			const m = new Map<string, RolePermission>();
			arr.forEach(p => m.set(p.id, p));
			return m;
		};
		const ma = toMap(a);
		const mb = toMap(b);
		for (const [id, pa] of ma.entries()) {
			const pb = mb.get(id);
			if (!pb) return false;
			if (pa.access !== pb.access) return false;
			const ap = pa.permissions ||
				{ view: false, edit: false, delete: false, create: false };
			const bp = pb.permissions ||
				{ view: false, edit: false, delete: false, create: false };
			if (ap.view !== bp.view ||
				ap.edit !== bp.edit ||
				ap.delete !== bp.delete ||
				ap.create !== bp.create) {
				return false;
			}
		}
		return true;
	};

	const isRoleDirty = (role: Role): boolean => {
		const roleId = role._id || role.id;
		const original = originalRolesPermissions.find(r => (r._id || r.id) === roleId);
		if (!original) return false;
		return !arePermissionsEqual(original.permissions || [], role.permissions || []);
	};

	const handleAccessToggle = (roleId: string, permissionId: string, value: boolean) => {
		setRolesPermissions(prev => prev.map(role => {
			const currentRoleId = role._id || role.id;
			if (currentRoleId === roleId) {
				return {
					...role,
					permissions: role.permissions.map(p =>
						p.id === permissionId
							? {
								...p,
								access: value,
								permissions: value
									? p.permissions
									: { view: false, edit: false, delete: false, create: false }
							}
							: p
					)
				};
			}
			return role;
		}));
	};

	const handlePermissionChange = (roleId: string, permissionId: string, type: 'view' | 'edit' | 'delete' | 'create', value: boolean) => {
		// Check access first
		const role = rolesPermissions.find(r => (r._id || r.id) === roleId);
		if (role) {
			const permission = role.permissions.find(p => p.id === permissionId);
			if (permission && !permission.access) {
				toastError('Please enable access first');
				return;
			}
		}

		setRolesPermissions(prev => prev.map(role => {
			const currentRoleId = role._id || role.id;
			if (currentRoleId === roleId) {
				return {
					...role,
					permissions: role.permissions.map(p =>
						p.id === permissionId ? {
							...p,
							permissions: { ...p.permissions, [type]: value }
						} : p
					)
				};
			}
			return role;
		}));
	};

	// Accordion State
	const [openRoleIds, setOpenRoleIds] = useState<string[]>([]);
	const toggleAccordion = (roleId: string) => {
		setOpenRoleIds(prev =>
			prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
		);
	};

	if (isLoading) {
		return <PermissionSkeleton className={className} />;
	}

	return (
		<div className={`w-full h-full ${className}`}>
			{/* Header Section */}
			<div className="mb-6 flex justify-between items-end">
				<div>
					<PageHeading
						text="Permission"
					/>
					<SubPageHeading
						text="Keep your team organized and efficient by ensuring every user has access to the right assets."
					/>
				</div>
			</div>

			{/* Content: List of Role Accordions */}
			<div className="space-y-4 pb-20">
				{!isLoading && rolesPermissions.length === 0 && (
					<div className="text-center py-10 text-gray-500">
						No roles found or permissions data is missing.
					</div>
				)}
				{rolesPermissions?.map(role => {
					const roleId = role._id || role.id || 'unknown';
					const isOpen = openRoleIds.includes(roleId);
					return (
						<div
							key={roleId}
							className="border dark:border-gray-700 overflow-hidden"
							style={{ borderColor: 'var(--light-gray)' }}
						>
							<div
								className="w-full px-6 py-4 flex justify-between items-center transition-colors"
								style={{ backgroundColor: 'var(--accent-white)' }}
							>
								<div
									className="flex-1 flex items-center cursor-pointer"
									onClick={() => toggleAccordion(roleId)}
								>
									<span
										className="font-medium text-[12px] md:text-[14px] dark:text-gray-100"
										style={{ color: 'var(--text-primary)' }}
									>
										{role.roleName}
									</span>
								</div>

								<div className="flex items-center gap-4">
									{isRoleDirty(role) && (
										<Button
											onClick={() => {
												handleSaveRole(role);
											}}
											loading={updatingRoleIds.includes(roleId)}
											size="sm"
											variant="primary"
										>
											Update
										</Button>
									)}
									<button
										onClick={() => toggleAccordion(roleId)}
										className="focus:outline-none"
									>
										{isOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
									</button>
								</div>
							</div>

							{isOpen && (
								<div
									className="border-t dark:border-gray-700"
									style={{ borderColor: 'var(--light-gray)' }}
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
														className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
														style={{ color: 'var(--text-primary)' }}
													>
														Module Name
													</th>
													<th
														className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
														style={{ color: 'var(--text-primary)' }}
													>
														Access
													</th>
													<th
														className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
														style={{ color: 'var(--text-primary)' }}
													>
														Permission
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
												{role.permissions.map(p => {
													const permissionItem = mapRolePermissionToItem(p);
													const roleId = role._id || role.id || 'unknown';
													return (
														<tr
															key={p.id}
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
																<span
																	className="font-medium dark:text-gray-100"
																	style={{ color: 'var(--text-primary)' }}
																>
																	{permissionItem.moduleName}
																</span>
															</td>
															<td className="px-6 py-4 whitespace-nowrap">
																<Toggle
																	checked={permissionItem.access}
																	onChange={(checked) => handleAccessToggle(roleId, p.id, checked)}
																/>
															</td>
															<td className="px-6 py-4">
																<div className="flex items-center gap-12">
																	<Checkbox
																		checked={p.permissions.view}
																		onChange={(checked) => handlePermissionChange(roleId, p.id, 'view', checked)}
																		label="View"
																		size="medium"
																	/>
																	<Checkbox
																		checked={p.permissions.edit}
																		onChange={(checked) => handlePermissionChange(roleId, p.id, 'edit', checked)}
																		label="Edit"
																		size="medium"
																	/>
																	<Checkbox
																		checked={p.permissions.delete}
																		onChange={(checked) => handlePermissionChange(roleId, p.id, 'delete', checked)}
																		label="Delete"
																		size="medium"
																	/>
																	<Checkbox
																		checked={p.permissions.create}
																		onChange={(checked) => handlePermissionChange(roleId, p.id, 'create', checked)}
																		label="Create"
																		size="medium"
																	/>
																</div>
															</td>
														</tr>
													);
												})}
											</tbody>
										</table>
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default Permission;
