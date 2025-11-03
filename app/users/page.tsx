'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import Icon from '@/components/ui/Icon';
import Pagination from '@/components/ui/Pagination';
import Checkbox from '@/components/ui/Checkbox';
import { useSetup } from '@/contexts/SetupContext';
import PageHeading from '@/components/ui/PageHeading';
import { Pencil1Icon, TrashIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import AddUserModal from '@/components/ui/AddUserModal';
import DeleteUserModal from '@/components/ui/DeleteUserModal';

interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	role: string;
	loginStatus: string;
}

const UsersPage: React.FC = () => {
	const router = useRouter();
	const { setupData } = useSetup();
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
	const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
	const [deleteUser, setDeleteUser] = useState<{ id: string; name: string } | null>(null);
	const [users, setUsers] = useState<User[]>([
		{
			id: 'Sup1109',
			firstName: 'Jane',
			lastName: 'Doe',
			email: 'janedoe@example.com',
			phone: '08023456789',
			role: 'Agent',
			loginStatus: 'Logged In',
		},
		{
			id: 'Sup1110',
			firstName: 'John',
			lastName: 'Smith',
			email: 'johnsmith@example.com',
			phone: '08023456790',
			role: 'Supervisor',
			loginStatus: 'Logged Out',
		},
		{
			id: 'Sup1111',
			firstName: 'Alice',
			lastName: 'Johnson',
			email: 'alicejohnson@example.com',
			phone: '08023456791',
			role: 'Agent',
			loginStatus: 'Logged In',
		},
	]);

	const filteredUsers = users.filter(user =>
		user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
		user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
		user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
		user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
		user.role.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const usersPerPage = 10;
	const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
	const currentUsers = filteredUsers.slice(
		(currentPage - 1) * usersPerPage,
		currentPage * usersPerPage
	);

	const handleAddUser = () => {
		setIsAddUserModalOpen(true);
	};

	const handleSaveUser = (userData: {
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
		role: string;
	}) => {
		console.log('Saving user:', userData);
		// Implement save user logic here
		// For now, just close the modal
		setIsAddUserModalOpen(false);
	};

	const handleAddFields = () => {
		console.log('Add Fields clicked');
		// Implement add fields logic here
	};

	const handleDeleteClick = (user: User) => {
		setDeleteUser({
			id: user.id,
			name: `${user.firstName} ${user.lastName}`,
		});
	};

	const handleConfirmDelete = () => {
		if (deleteUser) {
			setUsers(prevUsers => prevUsers.filter(user => user.id !== deleteUser.id));
			setDeleteUser(null);
		}
	};

	const roleOptions = [
		{ value: 'Agent', label: 'Agent' },
		{ value: 'Supervisor', label: 'Supervisor' },
		{ value: 'Admin', label: 'Admin' },
	];

	const handleImportUser = () => {
		console.log('Import User clicked');
		// Implement import user logic
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedUsers(new Set(currentUsers.map(user => user.id)));
		} else {
			setSelectedUsers(new Set());
		}
	};

	const handleSelectUser = (userId: string, checked: boolean) => {
		const newSelected = new Set(selectedUsers);
		if (checked) {
			newSelected.add(userId);
		} else {
			newSelected.delete(userId);
		}
		setSelectedUsers(newSelected);
	};

	const isAllSelected = currentUsers.length > 0 && currentUsers.every(user => selectedUsers.has(user.id));

	return (
		<div>
			{/* Title and Action Buttons */}
			<div className="flex items-center justify-between mb-6">
				<PageHeading
					text="Users"
				/>


				{/* Search Bar */}
			</div>
			<div className="mb-6 flex items-center justify-between">
				<Search
					placeholder="Search"
					value={searchTerm}
					onChange={setSearchTerm}
					className="max-w-md"
					onSearch={(value) => console.log('Search triggered:', value)}
					onClear={() => console.log('Search cleared')}
					showClearButton={true}
				/>
				<Button
					variant="primary"
					size="md"
					onClick={handleAddUser}
					className="flex items-center gap-2"
				>
					Add User
				</Button>
			</div>

			{/* Login Status Info Banner */}
			<div className="mb-4 p-3 bg-gray-100 rounded-lg flex items-center gap-3">
				<div className="shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center bg-white">
					<ExclamationTriangleIcon className="w-4 h-4 text-gray-700" />
				</div>
				<p className="text-sm text-gray-700">
					This is for tracking agents who are logged in or logged out
				</p>
			</div>

			{/* Users Table */}
			<div className="bg-white border border-gray-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th>
									<Checkbox
										checked={isAllSelected}
										onChange={handleSelectAll}
									/>
								</th>
								<th>
									ID
								</th>
								<th>
									First Name
								</th>
								<th>
									Last Name
								</th>
								<th>
									Email
								</th>
								<th>
									Phone
								</th>
								<th>
									Role
								</th>
								<th>
									Login Status
								</th>
								<th>
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{currentUsers.map((user) => (
								<tr key={user.id} className="hover:bg-gray-50">
									<td>
										<Checkbox
											checked={selectedUsers.has(user.id)}
											onChange={(checked) => handleSelectUser(user.id, checked)}
										/>
									</td>
									<td>
										{user.id}
									</td>
									<td>
										{user.firstName}
									</td>
									<td>
										{user.lastName}
									</td>
									<td>
										{user.email}
									</td>
									<td>
										{user.phone}
									</td>
									<td>
										{user.role}
									</td>
									<td>
										{user.loginStatus}
									</td>
									<td>
										<div className="flex items-center gap-2">
											<button
												onClick={() => router.push(`/users/${user.id}/edit`)}
												className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
												title="Edit User"
											>
												<Pencil1Icon className="w-5 h-5" />
											</button>
											<button
												onClick={() => handleDeleteClick(user)}
												className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
												title="Delete User"
											>
												<TrashIcon className="w-5 h-5" />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Pagination */}
			<div className="mt-6">
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
					showEllipsis={true}
					maxVisiblePages={5}
					primaryColor={setupData.primaryColor}
					secondaryColor={setupData.secondaryColor}
				/>
			</div>

			{/* Add User Modal */}
			<AddUserModal
				isOpen={isAddUserModalOpen}
				onClose={() => setIsAddUserModalOpen(false)}
				onSave={handleSaveUser}
				roleOptions={roleOptions}
				onAddFields={handleAddFields}
			/>

			{/* Delete User Modal */}
			<DeleteUserModal
				isOpen={!!deleteUser}
				onClose={() => setDeleteUser(null)}
				onConfirm={handleConfirmDelete}
				userName={deleteUser?.name}
			/>
		</div>
	);
};

export default UsersPage;
