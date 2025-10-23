'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import Icon from '@/components/ui/Icon';
import Pagination from '@/components/ui/Pagination';
import { useSetup } from '@/contexts/SetupContext';

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
	const { setupData } = useSetup();
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [users] = useState<User[]>([
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
		console.log('Add User clicked');
		// Implement add user logic
	};

	const handleImportUser = () => {
		console.log('Import User clicked');
		// Implement import user logic
	};

	return (
		<div>
			{/* Title and Action Buttons */}
			<div className="flex items-center justify-between mb-6">
				<h1 className="font-lato font-medium text-[16px] leading-[150%] text-[#3A4050]">Users</h1>
				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						size="md"
						onClick={handleImportUser}
						className="bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
					>
						Import User
					</Button>
					<Button
						variant="outline"
						size="md"
						onClick={handleAddUser}
						className="bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
					>
						Add User
					</Button>
				</div>
			</div>

			{/* Description */}
			<div className="mb-6">
				<p className="font-lato font-normal text-[14px] leading-[150%] text-[#6D7280]">
					Find and manage team members, from agents to admins.
				</p>
			</div>

			{/* Search Bar */}
			<div className="mb-6">
				<Search
					placeholder="Search"
					value={searchTerm}
					onChange={setSearchTerm}
					className="max-w-md"
					onSearch={(value) => console.log('Search triggered:', value)}
					onClear={() => console.log('Search cleared')}
					showClearButton={true}
				/>
			</div>

			{/* Users Table */}
			<div className="bg-white border border-gray-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									<input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out" />
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									ID
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									First Name
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Last Name
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Email
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Phone
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Role
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									<div className="flex items-center gap-1">
										Login Status
										<Icon name="Question_mark_light" size="sm" className="text-gray-400" />
									</div>
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Add
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{currentUsers.map((user) => (
								<tr key={user.id} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap">
										<input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out" />
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
										{user.id}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										<div className="flex items-center gap-1">
											{user.firstName}
											<Icon name="Ellipsis_vertical_light" size="sm" className="text-gray-400" />
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{user.lastName}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{user.email}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{user.phone}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{user.role}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{user.loginStatus}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{/* Empty cell for Add column */}
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
		</div>
	);
};

export default UsersPage;
