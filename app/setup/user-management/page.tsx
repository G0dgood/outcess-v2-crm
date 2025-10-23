'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Dropdown from '@/components/ui/Dropdown';
import AddUserModal from '@/components/ui/AddUserModal';
import EditUserModal from '@/components/ui/EditUserModal';
import { useSetup } from '@/contexts/SetupContext';
import Icon from '@/components/ui/Icon';

interface User {
	id: string;
	name: string;
	email: string;
	phone: string;
	role: string;
	status: 'active' | 'inactive' | 'pending';
	lastLogin?: string;
}

export default function UserManagementPage() {
	const { setupData, updateSetupData } = useSetup();
	const router = useRouter();
	const [users, setUsers] = useState<User[]>([
		{
			id: '1',
			name: 'John Doe',
			email: 'john@company.com',
			phone: '+1 (555) 123-4567',
			role: 'Administrator',
			status: 'active',
			lastLogin: '2024-01-15'
		},
		{
			id: '2',
			name: 'Jane Smith',
			email: 'jane@company.com',
			phone: '+1 (555) 234-5678',
			role: 'Manager',
			status: 'active',
			lastLogin: '2024-01-14'
		},
		{
			id: '3',
			name: 'Bob Johnson',
			email: 'bob@company.com',
			phone: '+1 (555) 345-6789',
			role: 'User',
			status: 'pending',
			lastLogin: undefined
		}
	]);

	const [isAddingUser, setIsAddingUser] = useState(false);
	const [editingUser, setEditingUser] = useState<string | null>(null);
	const [editingUserData, setEditingUserData] = useState<{
		name: string;
		email: string;
		phone: string;
		role: string;
	} | null>(null);

	const roleOptions = [
		{ value: 'administrator', label: 'Administrator' },
		{ value: 'manager', label: 'Manager' },
		{ value: 'user', label: 'User' },
		{ value: 'viewer', label: 'Viewer' }
	];

	const statusOptions = [
		{ value: 'active', label: 'Active' },
		{ value: 'inactive', label: 'Inactive' },
		{ value: 'pending', label: 'Pending' }
	];

	const handleAddUser = (userData: {
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
		role: string;
	}) => {
		const user: User = {
			id: Date.now().toString(),
			name: `${userData.firstName} ${userData.lastName}`,
			email: userData.email,
			phone: userData.phone,
			role: userData.role,
			status: 'pending',
			lastLogin: undefined
		};
		setUsers(prev => [...prev, user]);
	};

	const handleDeleteUser = (userId: string) => {
		setUsers(prev => prev.filter(user => user.id !== userId));
	};

	const handleStatusChange = (userId: string, newStatus: string) => {
		setUsers(prev => prev.map(user =>
			user.id === userId ? { ...user, status: newStatus as User['status'] } : user
		));
	};

	const handleEditUser = (userId: string) => {
		const user = users.find(u => u.id === userId);
		if (user) {
			setEditingUserData({
				name: user.name,
				email: user.email,
				phone: user.phone,
				role: user.role
			});
			setEditingUser(userId);
		}
	};

	const handleSaveEdit = (userData: {
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
		role: string;
	}) => {
		if (editingUser) {
			setUsers(prev => prev.map(user =>
				user.id === editingUser
					? {
						...user,
						name: `${userData.firstName} ${userData.lastName}`,
						email: userData.email,
						phone: userData.phone,
						role: userData.role
					}
					: user
			));
			setEditingUser(null);
			setEditingUserData(null);
		}
	};

	const handleCancelEdit = () => {
		setEditingUser(null);
		setEditingUserData(null);
	};

	return (
		<div className="w-full h-full">
			<div className="mb-8">
				<h1 className="font-lato not-italic font-semibold text-[24px] leading-[150%] text-[#3A4050]">User Management</h1>
				<p className="font-lato not-italic font-normal text-[16px] leading-[150%] text-[#6D7280]">Manage user accounts, roles, and permissions for your CRM system</p>
			</div>

			<div className="flex  md-flex-row gap-6 mb-8 bg-(--accent-white) border border-gray-200  p-6">
				{/* Feature Cards */}
				<div className="flex  md-flex-row gap-6 mb-8">
					{/* Define User Roles Card */}
					<div className="bg-white border border-gray-200 p-6">
						<div className="flex flex-col w-[300px]">
							<div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
								<Icon name="Group_light" size="xl" />
							</div>
							<h3 className="font-inter text-lg font-semibold text-[#050711] mb-2">Define User Roles</h3>
							<p className="font-lato text-sm text-gray-600 mb-4">Set up different roles and their associated permissions within your CRM system.</p>
							<Button
								variant="primary"
								size="md"
								onClick={() => router.push('/setup/role-permission-management')}
								className="w-full"
							>
								Configure Roles
							</Button>
						</div>
					</div>

					{/* Access Controls Card */}
					<div className="bg-white border border-gray-200 p-6">
						<div className="flex flex-col w-[300px]">
							<div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
								<Icon name="Chield_light" size="xl" />
							</div>
							<h3 className="font-inter text-lg font-semibold text-[#050711] mb-2">Access Controls</h3>
							<p className="font-lato text-sm text-gray-600 mb-4">Define detailed permissions and access levels for each role.</p>
							<Button
								variant="primary"
								size="md"
								onClick={() => router.push('/setup/permission-access-levels')}
								className="w-full"
							>
								Set Permissions
							</Button>
						</div>
					</div>
				</div>
			</div>


			<div className="bg-(--accent-white) border border-gray-200 w-full h-full">
				<div className="box-border w-full   border-b border-[#E5E7EB]  p-6">
					<div className="flex justify-between items-center">
						<div>
							<h2 className="font-inter text-xl font-semibold text-[#050711] mb-2">Team Members</h2>
						</div>
						<Button
							variant="primary"
							size="md"
							onClick={() => setIsAddingUser(true)}
							className="flex items-center gap-2"
						>
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M8 1V15M1 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
							</svg>
							Add New User
						</Button>
					</div>
				</div>

				<div className="p-6">
					{/* Users Table */}
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
									<th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
									<th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
									<th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
									<th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
									<th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
									<th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{users.map((user, index) => (
									<tr key={user.id} className={index !== users.length - 1 ? 'border-b border-[#E5E7EB]' : ''}>
										<td className="py-4 px-6 font-inter text-sm text-[#050711]">{user.name}</td>
										<td className="py-4 px-6 font-inter text-sm text-gray-600">{user.email}</td>
										<td className="py-4 px-6 font-inter text-sm text-gray-600">{user.phone}</td>
										<td className="py-4 px-6 font-inter text-sm text-gray-600">{user.role}</td>
										<td className="py-4 px-6">
											<Dropdown
												label=""
												value={user.status}
												onChange={(value) => handleStatusChange(user.id, value)}
												options={statusOptions}
												className="min-w-[120px]"
											/>
										</td>
										<td className="py-4 px-6 font-inter text-sm text-gray-600">
											{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
										</td>
										<td className="py-4 px-6 text-sm font-medium">
											<div className='flex flex-row gap-3'>
												<button
													onClick={() => handleEditUser(user.id)}
													className='cursor-pointer'
												>
													<Icon name="Edit_duotone_line" size={"lg"} />
												</button>
												<button
													onClick={() => handleDeleteUser(user.id)}
													className='cursor-pointer'
												>
													<Icon name="Trash_light" size={"lg"} />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* Add User Modal */}
			<AddUserModal
				isOpen={isAddingUser}
				onClose={() => setIsAddingUser(false)}
				onSave={handleAddUser}
			/>

			{/* Edit User Modal */}
			{editingUserData && (
				<EditUserModal
					isOpen={!!editingUser}
					onClose={handleCancelEdit}
					onSave={handleSaveEdit}
					userData={editingUserData}
				/>
			)}
		</div>
	);
}
