'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import Icon from '@/components/ui/Icon';
import Pagination from '@/components/ui/Pagination';
import Checkbox from '@/components/ui/Checkbox';
import { useGetTeamMembersByLineOfBusinessIdQuery, useCreateTeamMemberMutation } from '@/store/services/teamMembersApi';
import { useGetRolesByLineOfBusinessIdQuery, Role } from '@/store/services/roleApi';
import PageHeading from '@/components/ui/PageHeading';
import { Pencil1Icon, TrashIcon, ExclamationTriangleIcon, PersonIcon } from '@radix-ui/react-icons';
import AddUserModal from '@/components/ui/AddUserModal';
import DeleteUserModal from '@/components/ui/DeleteUserModal';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { NoRecordFound, SVGLoaderFetch } from '@/components/Options';
import { toast } from 'sonner';

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
	const { lineOfBusinessData } = useLineOfBusiness();
	const lineOfBusinessId = lineOfBusinessData?.lineOfBusiness?._id || lineOfBusinessData?._id || '';
	const { data: teamMembersResponse, isLoading } = useGetTeamMembersByLineOfBusinessIdQuery(lineOfBusinessId, { skip: !lineOfBusinessId });

	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
	const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
	const [deleteUser, setDeleteUser] = useState<{ id: string; name: string } | null>(null);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [isDrawerAnimating, setIsDrawerAnimating] = useState(false);
	const [shouldRenderDrawer, setShouldRenderDrawer] = useState(false);
	const [showInfoBanner, setShowInfoBanner] = useState(true);
	const [users, setUsers] = useState<User[]>([]);

	useEffect(() => {
		if (teamMembersResponse) {
			// Handle different response structures
			const rawMembers = teamMembersResponse.data || teamMembersResponse.teamMembers || teamMembersResponse || [];
			const membersList = Array.isArray(rawMembers) ? rawMembers : (rawMembers.docs || []);

			const mappedUsers = membersList.map((member: any) => {
				const fullName = member.name || '';
				const [firstName, ...lastNameParts] = fullName.split(' ');
				const lastName = lastNameParts.join(' ');

				return {
					id: member._id || member.id,
					firstName: member.firstName || firstName || '',
					lastName: member.lastName || lastName || '',
					email: member.email || '',
					phone: member.phone || '',
					role: typeof member.role === 'object' ? (member.role.roleName || member.role.name) : (member.role || 'Agent'),
					loginStatus: member.status || member.loginStatus || 'Logged Out',
				};
			});
			setUsers(mappedUsers);
		}
	}, [teamMembersResponse]);

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


	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedUsers(new Set(currentUsers.map(user => user.id)));
			setIsDrawerOpen(true);
		} else {
			setSelectedUsers(new Set());
			setIsDrawerOpen(false);
		}
	};

	const handleSelectUser = (userId: string, checked: boolean) => {
		const newSelected = new Set(selectedUsers);
		if (checked) {
			newSelected.add(userId);
			setSelectedUsers(newSelected);
			setIsDrawerOpen(true);
		} else {
			newSelected.delete(userId);
			setSelectedUsers(newSelected);
			// Close drawer if no items are selected
			if (newSelected.size === 0) {
				setIsDrawerOpen(false);
			}
		}
	};

	const isAllSelected = currentUsers.length > 0 && currentUsers.every(user => selectedUsers.has(user.id));

	// Handle drawer animations
	useEffect(() => {
		if (isDrawerOpen) {
			setShouldRenderDrawer(true);
			// Trigger animation after a tiny delay to ensure DOM is ready
			setTimeout(() => setIsDrawerAnimating(true), 10);
		} else {
			// Start exit animation
			setIsDrawerAnimating(false);
			// Remove from DOM after animation completes (300ms)
			const timer = setTimeout(() => {
				setShouldRenderDrawer(false);
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [isDrawerOpen]);




	return (
		<div>
			{/* Title and Action Buttons */}
			<div className="mb-6 flex items-start justify-between">
				<PageHeading
					text="Users"
				/>
				{/* Search Bar */}
			</div>
			<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<Search
					placeholder="Search"
					value={searchTerm}
					onChange={setSearchTerm}
					className="w-full sm:w-auto"
					maxWidth="w-full"
					onSearch={(value) => console.log('Search triggered:', value)}
					onClear={() => console.log('Search cleared')}
					showClearButton={true}
				/>
				<div className="flex flex-wrap items-center justify-end sm:justify-start gap-2 sm:gap-3">
					<Button
						variant="primary"
						size="md"
						onClick={handleAddUser}
						className="flex items-center gap-2 px-2 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm"
					>
						Add User
					</Button>
				</div>
			</div>

			{/* Login Status Info Banner */}
			{showInfoBanner && (
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
						className="text-sm dark:text-gray-300 flex-1"
						style={{ color: 'var(--text-secondary)' }}
					>
						This is for tracking agents who are logged in or logged out
					</p>
					<button
						onClick={() => setShowInfoBanner(false)}
						className="shrink-0 p-1 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
						style={{ color: 'var(--text-tertiary)' }}
						onMouseEnter={(e) => {
							e.currentTarget.style.color = 'var(--text-secondary)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.color = 'var(--text-tertiary)';
						}}
						title="Close"
					>
						<Icon name="Close_round_light" size="sm" />
					</button>
				</div>
			)}

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
							{isLoading ? (
								<SVGLoaderFetch colSpan={8} text={''} />
							) : currentUsers.length === 0 ? (
								<NoRecordFound colSpan={8} />
							) : currentUsers?.map((user) => (
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
				primaryColor={lineOfBusinessData?.primaryColor || '#000000'}
				secondaryColor={lineOfBusinessData?.secondaryColor || '#000000'}
			/>

			{/* Add User Modal */}
			<AddUserModal
				isOpen={isAddUserModalOpen}
				onClose={() => setIsAddUserModalOpen(false)}
			/>

			{/* Delete User Modal */}
			<DeleteUserModal
				isOpen={!!deleteUser}
				onClose={() => setDeleteUser(null)}
				onConfirm={handleConfirmDelete}
				userName={deleteUser?.name}
			/>

			{/* Selected Users Drawer */}
			{shouldRenderDrawer && (
				<div
					className={`fixed top-0 right-0 h-full w-full max-w-md dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isDrawerAnimating ? 'translate-x-0' : 'translate-x-full'}`}
					style={{ backgroundColor: 'var(--accent-white)' }}
				>
					{/* Drawer Header */}
					<div
						className="flex justify-between items-center border-b dark:border-gray-700 p-6"
						style={{ borderColor: 'var(--light-gray)' }}
					>
						<div className="flex items-center gap-3">
							<PersonIcon
								className="w-5 h-5 dark:text-gray-300"
								style={{ color: 'var(--text-primary)' }}
							/>
							<h2
								className="font-inter text-lg font-semibold dark:text-gray-100"
								style={{ color: 'var(--text-primary)' }}
							>
								Selected Users ({selectedUsers.size})
							</h2>
						</div>
						<button
							onClick={() => setIsDrawerOpen(false)}
							className="dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
							style={{ color: 'var(--text-tertiary)' }}
							onMouseEnter={(e) => {
								e.currentTarget.style.color = 'var(--text-secondary)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.color = 'var(--text-tertiary)';
							}}
						>
							<Icon name="Close_round_light" size="lg" />
						</button>
					</div>

					{/* Drawer Content */}
					<div className="overflow-y-auto h-[calc(100vh-80px)] p-6">
						{selectedUsers.size === 0 ? (
							<div className="flex flex-col items-center justify-center h-full text-center">
								<PersonIcon
									className="w-12 h-12 mb-4 dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								/>
								<p
									className="text-sm dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									No users selected
								</p>
							</div>
						) : (
							<div className="space-y-4">
								{users
									.filter(user => selectedUsers.has(user.id))
									.map((user) => {
										const getLoginStatusColor = (status: string) => {
											return status === 'Logged In'
												? { bg: 'rgba(34, 197, 94, 0.1)', text: '#22C55E', border: 'rgba(34, 197, 94, 0.2)' }
												: { bg: 'rgba(156, 163, 175, 0.1)', text: '#9CA3AF', border: 'rgba(156, 163, 175, 0.2)' };
										};
										const loginStatusColors = getLoginStatusColor(user.loginStatus);
										return (
											<div
												key={user.id}
												className="p-4 dark:bg-gray-700 border dark:border-gray-600 rounded-lg"
												style={{
													backgroundColor: 'var(--bg-primary)',
													borderColor: 'var(--light-gray)'
												}}
											>
												{/* User Header */}
												<div className="flex justify-between items-start mb-3">
													<div className="flex-1">
														<div className="flex items-center gap-2 mb-2">
															<span
																className="text-xs font-medium dark:text-gray-300"
																style={{ color: 'var(--text-secondary)' }}
															>
																{user.id}
															</span>
															<span
																className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
																style={{
																	backgroundColor: loginStatusColors.bg,
																	color: loginStatusColors.text,
																	border: `1px solid ${loginStatusColors.border}`
																}}
															>
																{user.loginStatus}
															</span>
														</div>
														<p
															className="text-sm font-medium dark:text-gray-100 mb-1"
															style={{ color: 'var(--text-primary)' }}
														>
															{user.firstName} {user.lastName}
														</p>
														<p
															className="text-xs dark:text-gray-400"
															style={{ color: 'var(--text-tertiary)' }}
														>
															{user.email}
														</p>
													</div>
												</div>

												{/* User Details */}
												<div className="mt-3 space-y-2">
													<div className="flex items-center justify-between text-xs">
														<span
															className="dark:text-gray-400"
															style={{ color: 'var(--text-tertiary)' }}
														>
															Phone:
														</span>
														<span
															className="dark:text-gray-100"
															style={{ color: 'var(--text-primary)' }}
														>
															{user.phone}
														</span>
													</div>
													<div className="flex items-center justify-between text-xs">
														<span
															className="dark:text-gray-400"
															style={{ color: 'var(--text-tertiary)' }}
														>
															Role:
														</span>
														<span
															className="dark:text-gray-100"
															style={{ color: 'var(--text-primary)' }}
														>
															{user.role}
														</span>
													</div>
												</div>

												{/* Actions */}
												<div className="flex gap-2 mt-3">
													<button
														onClick={() => router.push(`/users/${user.id}/edit`)}
														className="flex-1 text-xs py-2 px-3 rounded border dark:border-gray-600 transition-colors dark:text-gray-300 dark:hover:bg-gray-600"
														style={{
															borderColor: 'var(--light-gray)',
															color: 'var(--text-secondary)',
															backgroundColor: 'transparent'
														}}
														onMouseEnter={(e) => {
															e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
														}}
														onMouseLeave={(e) => {
															e.currentTarget.style.backgroundColor = 'transparent';
														}}
													>
														Edit
													</button>
													<button
														onClick={() => {
															handleDeleteClick(user);
															setIsDrawerOpen(false);
														}}
														className="flex-1 text-xs py-2 px-3 rounded border dark:border-gray-600 transition-colors dark:text-gray-300 dark:hover:bg-gray-600"
														style={{
															borderColor: 'var(--light-gray)',
															color: '#DC2626',
															backgroundColor: 'transparent'
														}}
														onMouseEnter={(e) => {
															e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
														}}
														onMouseLeave={(e) => {
															e.currentTarget.style.backgroundColor = 'transparent';
														}}
													>
														Delete
													</button>
												</div>
											</div>
										);
									})}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default UsersPage;
