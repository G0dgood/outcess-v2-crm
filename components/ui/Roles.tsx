'use client';

import React, { useState, useEffect } from 'react';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useGetRolesByLineOfBusinessIdQuery } from '@/store/services/roleApi';
import RolesSkeleton from '@/components/skeletons/RolesSkeleton';
import Button from './Button';
import CreateCustomRoleModal from './CreateCustomRoleModal';
import SubPageHeading from './SubPageHeading';
import PageHeading from './PageHeading';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

interface Role {
	id: string;
	name: string;
	userCount: number;
}

interface RolesProps {
	className?: string;
}

const Roles: React.FC<RolesProps> = ({ className = '' }) => {
	const { user } = useUserInfo();
	const { selectedLineOfBusinessId } = useLineOfBusiness();
	const { data: rolesData, isLoading } = useGetRolesByLineOfBusinessIdQuery(selectedLineOfBusinessId || '', { skip: !selectedLineOfBusinessId });

	const [roles, setRoles] = useState<Role[]>([]);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	useEffect(() => {
		if (rolesData) {
			const rawRoles = (Array.isArray(rolesData) ? rolesData :
				(Array.isArray((rolesData as any)?.data) ? (rolesData as any).data :
					(Array.isArray(rolesData?.roles) ? rolesData.roles :
						(Array.isArray((rolesData as any)?.docs) ? (rolesData as any).docs :
							[]))));

			const mappedRoles: Role[] = rawRoles?.map((role: any) => ({
				id: role?._id || role.id,
				name: role?.roleName,
				userCount: role?.userCount || 0
			}));
			setRoles(mappedRoles);
		}
	}, [rolesData]);

	const handleCreateCustomRole = () => {
		setIsCreateModalOpen(true);
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
						className="px-2 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm"
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
							className="dark:bg-gray-800 border dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-lg transition-shadow"
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
							<h3
								className="text-lg font-semibold dark:text-gray-100 mb-2"
								style={{ color: 'var(--text-primary)' }}
							>
								{role?.name}
							</h3>
							<p
								className="text-sm dark:text-gray-400"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Users: {role?.userCount}
							</p>
						</div>
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center h-64 border  dark:border-gray-700" style={{ borderColor: 'var(--light-gray)' }}>
					<ExclamationTriangleIcon className="w-16 h-16 mb-4" style={{ color: 'var(--text-tertiary)' }} />
					<p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
						No roles found
					</p>
					<p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
						Create a new role to get started
					</p>
				</div>
			)}

			{/* Create Custom Role Modal */}
			<CreateCustomRoleModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
			/>
		</div>
	);
};

export default Roles;
