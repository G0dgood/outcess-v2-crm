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
			<div className="mb-6 flex items-start justify-between">
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
			<div 
				className="mb-4 p-3 dark:bg-gray-800 border dark:border-gray-700 flex items-center gap-3"
				style={{
					backgroundColor: 'var(--bg-primary)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<div className="shrink-0 w-6 h-6 flex items-center justify-center">
					<ExclamationTriangleIcon 
						className="w-4 h-4 dark:text-gray-300" 
						style={{ color: 'var(--text-secondary)' }}
					/>
				</div>
				<p 
					className="text-sm dark:text-gray-300"
					style={{ color: 'var(--text-secondary)' }}
				>
					This is for tracking agents who are logged in or logged out
				</p>
			</div>

			{/* Users Table */}
			<div 
				className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
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
								<th>
									<Checkbox
										checked={isAllSelected}
										onChange={handleSelectAll}
										size="medium"
									/>
								</th>
								<th 
									className="dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									ID
								</th>
								<th 
									className="dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									First Name
								</th>
								<th 
									className="dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									Last Name
								</th>
								<th 
									className="dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									Email
								</th>
								<th 
									className="dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									Phone
								</th>
								<th 
									className="dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									Role
								</th>
								<th 
									className="dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									Login Status
								</th>
								<th 
									className="dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									Actions
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
							{currentUsers.map((user) => (
								<tr 
									key={user.id} 
									className="dark:hover:bg-gray-700"
									style={{ borderColor: 'var(--light-gray)' }}
									onMouseEnter={(e) => {
										e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.backgroundColor = 'var(--accent-white)';
									}}
								>
									<td>
										<Checkbox
											checked={selectedUsers.has(user.id)}
											onChange={(checked) => handleSelectUser(user.id, checked)}
											size="medium"
										/>
									</td>
									<td 
										className="dark:text-gray-100"
										style={{ color: 'var(--text-primary)' }}
									>
										{user.id}
									</td>
									<td 
										className="dark:text-gray-100"
										style={{ color: 'var(--text-primary)' }}
									>
										{user.firstName}
									</td>
									<td 
										className="dark:text-gray-100"
										style={{ color: 'var(--text-primary)' }}
									>
										{user.lastName}
									</td>
									<td 
										className="dark:text-gray-100"
										style={{ color: 'var(--text-primary)' }}
									>
										{user.email}
									</td>
									<td 
										className="dark:text-gray-100"
										style={{ color: 'var(--text-primary)' }}
									>
										{user.phone}
									</td>
									<td 
										className="dark:text-gray-100"
										style={{ color: 'var(--text-primary)' }}
									>
										{user.role}
									</td>
									<td 
										className="dark:text-gray-100"
										style={{ color: 'var(--text-primary)' }}
									>
										{user.loginStatus}
									</td>
									<td>
										<div className="flex items-center gap-2">
											<button
												onClick={() => router.push(`/users/${user.id}/edit`)}
												className="p-2 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
												style={{ color: 'var(--text-secondary)' }}
												onMouseEnter={(e) => {
													e.currentTarget.style.color = '#2563EB';
													e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.color = 'var(--text-secondary)';
													e.currentTarget.style.backgroundColor = 'transparent';
												}}
												title="Edit User"
											>
												<Pencil1Icon className="w-5 h-5" />
											</button>
											<button
												onClick={() => handleDeleteClick(user)}
												className="p-2 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
												style={{ color: 'var(--text-secondary)' }}
												onMouseEnter={(e) => {
													e.currentTarget.style.color = '#DC2626';
													e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.color = 'var(--text-secondary)';
													e.currentTarget.style.backgroundColor = 'transparent';
												}}
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
			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={setCurrentPage}
				showEllipsis={true}
				maxVisiblePages={5}
				primaryColor={setupData.primaryColor}
				secondaryColor={setupData.secondaryColor}
			/>

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
