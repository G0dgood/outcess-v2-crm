'use client';

import React, { useState } from 'react';
import Button from './Button';
import CreateCustomRoleModal from './CreateCustomRoleModal';
import SubPageHeading from './SubPageHeading';
import PageHeading from './PageHeading';

interface Role {
	id: string;
	name: string;
	userCount: number;
}

interface RolesProps {
	className?: string;
}

const Roles: React.FC<RolesProps> = ({ className = '' }) => {
	const [roles, setRoles] = useState<Role[]>([
		{ id: '1', name: 'Admin', userCount: 1 },
		{ id: '2', name: 'Supervisor', userCount: 0 },
		{ id: '3', name: 'Agent', userCount: 2 },
	]);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	const handleCreateCustomRole = () => {
		setIsCreateModalOpen(true);
	};

	const handleCreate = (data: { name: string; description: string }) => {
		console.log('Creating role:', data);
		// Add the new role to the list
		const newRole: Role = {
			id: Date.now().toString(),
			name: data.name,
			userCount: 0,
		};
		setRoles([...roles, newRole]);
		// Implement create role API call here
	};

	return (
		<div className={`w-full h-full ${className}`}>
			{/* Header Section */}
			<div className="mb-6 flex items-start justify-between">
				<div>
					<PageHeading
						text="Roles"
					/>
					<SubPageHeading
						text="Following are the roles available. You can also create custom roles."
					/>
				</div>
				<Button
					variant="primary"
					size="md"
					onClick={handleCreateCustomRole}
				>
					Create Custom Role
				</Button>
			</div>

			{/* Roles Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{roles.map((role) => (
					<div
						key={role.id}
						className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-lg transition-shadow"
					>
						<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{role.name}</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">Users: {role.userCount}</p>
					</div>
				))}
			</div>

			{/* Create Custom Role Modal */}
			<CreateCustomRoleModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				onCreate={handleCreate}
			/>
		</div>
	);
};

export default Roles;

