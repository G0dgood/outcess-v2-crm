'use client';

import React, { useState, useEffect } from 'react';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useGetRolesByLineOfBusinessIdQuery, useDeleteRoleMutation } from '@/store/services/roleApi';
import RolesSkeleton from '@/components/skeletons/RolesSkeleton';
import Button from '@/components/ui/Button';
import CreateCustomRoleModal from '@/components/ui/CreateCustomRoleModal';
import DeleteRoleModal from './DeleteRoleModal';
import SubPageHeading from '@/components/ui/SubPageHeading';
import PageHeading from '@/components/ui/PageHeading';
import { ExclamationTriangleIcon, TrashIcon, CopyIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';
import { usePrivilege } from '@/contexts/PrivilegeContext';

interface Role {
	id: string;
	name: string;
	userCount: number;
}

interface RolesProps {
	className?: string;
}

const Roles: React.FC<RolesProps> = ({ className = '' }) => {
	const { selectedLineOfBusinessId } = useLineOfBusiness();
	const { data: rolesData, isLoading } = useGetRolesByLineOfBusinessIdQuery(selectedLineOfBusinessId || '', { skip: !selectedLineOfBusinessId });
	const { canAccess } = usePrivilege();
	const canDelete = canAccess('userManagement', 'delete');
	const [deleteRole] = useDeleteRoleMutation();

	const [roles, setRoles] = useState<Role[]>([]);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [roleToDelete, setRoleToDelete] = useState<{ id: string; name: string } | null>(null);

	useEffect(() => {
		if (rolesData) {
			const rawRoles = (Array.isArray(rolesData) ? rolesData :
				(Array.isArray((rolesData as unknown as { data?: unknown[] }).data) ? (rolesData as unknown as { data?: unknown[] }).data :
					(Array.isArray((rolesData as unknown as { roles?: unknown[] }).roles) ? (rolesData as unknown as { roles?: unknown[] }).roles :
						(Array.isArray((rolesData as unknown as { docs?: unknown[] }).docs) ? (rolesData as unknown as { docs?: unknown[] }).docs :
							[]))));

			const mappedRoles: Role[] = ((rawRoles as { _id?: string; id?: string; roleName: string; userCount?: number; teamMemberCount?: number }[]) || []).map((role) => ({
				id: role?._id || role.id || '',
				name: role?.roleName,
				userCount: role?.teamMemberCount ?? role?.userCount ?? 0
			}));
			setRoles(mappedRoles);
		}
	}, [rolesData]);

	const handleCreateCustomRole = () => {
		setIsCreateModalOpen(true);
	};

	const handleDeleteRoleClick = (roleId: string, roleName: string) => {
		setRoleToDelete({ id: roleId, name: roleName });
		setDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!roleToDelete) return;

		try {
			await deleteRole(roleToDelete.id).unwrap();
			toast.success('Role deleted successfully');
			setDeleteModalOpen(false);
			setRoleToDelete(null);
		} catch (error) {
			console.error('Failed to delete role:', error);
			toast.error('Failed to delete role');
		}
	};

	const handleCopyName = (roleName: string) => {
		navigator.clipboard.writeText(roleName);
		toast.success('Role name copied to clipboard');
	};

	if (isLoading) {
		return <RolesSkeleton className={className} />;
	}

	return (
		<div className={`w-full h-full ${className}`}>
			<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div>
					<PageHeading
						text="Roles"
					/>
					<SubPageHeading
						text="Following are the roles available. You can also create custom roles."
					/>
				</div>
				<div className="flex flex-wrap items-center justify-end sm:justify-start gap-2 sm:gap-3">
					<Button
						variant="primary"
						size="md"
						onClick={handleCreateCustomRole}
						className="px-2 py-2  sm:px-4 sm:py-2 text-[10px] md:text-[12px]"
					>
						Create Custom Role
					</Button>
				</div>
			</div>

			{/* Roles Grid */}
			{roles?.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{roles.map((role) => (
						<div
							key={role?.id}
							className="dark:bg-gray-800 border dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-lg transition-shadow group rounded-[var(--radius)]"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)',
								boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
							}}
						>
							<div className="flex justify-between items-start mb-2">
								<h3
									className="text-[12px] md:text-[14px] font-semibold dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									{role?.name}
								</h3>
								<div className="flex items-center gap-1 -mr-2 -mt-2">
									<Button
										variant="ghost"
										size="sm"
										onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
											e.stopPropagation();
											handleCopyName(role.name);
										}}
										className="p-1.5 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-gray-700 h-auto"
										title="Copy Role Name"
									>
										<CopyIcon className="w-4 h-4 text-blue-500" />
									</Button>
									{canDelete && (
										<Button
											variant="ghost"
											size="sm"
											onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
												e.stopPropagation();
												handleDeleteRoleClick(role?.id, role?.name);
											}}
											className="p-1.5 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-gray-700 h-auto"
											title="Delete Role"
										>
											<TrashIcon className="w-4 h-4 text-red-500" />
										</Button>
									)}
								</div>
							</div>
							<div className="flex justify-between items-end">
								<p
									className="text-[10px] md:text-[12px] dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									Users: {role?.userCount}
								</p>
								<span className="text-[9px] text-gray-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
									Role Name: {role?.name}
								</span>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center h-64 border  dark:border-gray-700 rounded-[var(--radius)]" style={{ borderColor: 'var(--light-gray)' }}>
					<ExclamationTriangleIcon className="w-16 h-16 mb-4" style={{ color: 'var(--text-tertiary)' }} />
					<p className="text-[12px] md:text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
						No roles found
					</p>
					<p className="text-[10px] md:text-[12px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
						Create a new role to get started
					</p>
				</div>
			)}

			{/* Create Custom Role Modal */}
			<CreateCustomRoleModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
			/>

			{/* Delete Role Modal */}
			<DeleteRoleModal
				isOpen={deleteModalOpen}
				roleName={roleToDelete?.name || ''}
				onClose={() => {
					setDeleteModalOpen(false);
					setRoleToDelete(null);
				}}
				onConfirm={handleConfirmDelete}
			/>
		</div>
	);
};

export default Roles;
