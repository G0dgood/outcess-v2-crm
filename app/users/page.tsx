'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import Icon from '@/components/ui/Icon';
import Pagination from '@/components/ui/Pagination';
import PaginationSummary from '@/components/ui/PaginationSummary';
import Checkbox from '@/components/ui/Checkbox';
import { useGetTeamMembersByLineOfBusinessIdQuery, useDeleteTeamMemberMutation } from '@/store/services/teamMembersApi';
import PageHeading from '@/components/ui/PageHeading';
import { Pencil1Icon, TrashIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import AddUserModal from '@/components/ui/AddUserModal';
import DeleteUserModal from '@/components/ui/DeleteUserModal';
import { Modal } from '@/components/ui/Modal';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { NoRecordFound, SVGLoaderFetch } from '@/components/Options';
import { toast } from 'sonner';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { useSocket } from '@/contexts/SocketContext';
import SelectedUsersDrawerContent from './SelectedUsersDrawerContent';

interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	role: string;
	userId: string;
	loginStatus: string;
	status?: {
		status: string;
		color?: string;
		reason?: string;
	};
}

interface StatusPayload {
	status: string;
	color?: string;
	reason?: string;
}

interface TeamMemberStatusUpdatePayload {
	teamMemberId: string;
	status: StatusPayload | string;
	name?: string;
	timestamp?: string;
}

interface RefreshPayload {
	message?: string;
}

interface ApiTeamMember {
	_id?: string;
	id?: string;
	userId?: string;
	name?: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	role?: string | { roleName?: string; name?: string };
	status?: string | StatusPayload;
	loginStatus?: string;
}

const UsersPage: React.FC = () => {
	const router = useRouter();
	const { lineOfBusinessData } = useLineOfBusiness();
	const lineOfBusinessId = lineOfBusinessData?.lineOfBusiness?._id || lineOfBusinessData?._id || '';
	const { data: teamMembersResponse, isLoading, refetch } = useGetTeamMembersByLineOfBusinessIdQuery(lineOfBusinessId, { skip: !lineOfBusinessId });
	const [deleteTeamMember] = useDeleteTeamMemberMutation();
	const { canAccess } = usePrivilege();
	const { socket } = useSocket();
	const canCreate = canAccess('teamMembers', 'create');
	const canEdit = canAccess('teamMembers', 'edit');
	const canDelete = canAccess('teamMembers', 'delete');

	console.log('lineOfBusinessData---->', lineOfBusinessData);

	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
	const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
	const [deleteUser, setDeleteUser] = useState<{ id: string; name: string } | null>(null);
	const [statusModalUser, setStatusModalUser] = useState<User | null>(null);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [isDrawerAnimating, setIsDrawerAnimating] = useState(false);
	const [shouldRenderDrawer, setShouldRenderDrawer] = useState(false);
	const [showInfoBanner, setShowInfoBanner] = useState(true);
	const [users, setUsers] = useState<User[]>([]);
	const tableHeaders = ['User ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Role', 'Login Status', 'Actions'];
	const totalColumns = tableHeaders.length + 1;

	useEffect(() => {
		if (socket) {
			const handleStatusUpdate = (payload: TeamMemberStatusUpdatePayload) => {
				console.log("Status Update (Users Page):", payload);
				const newStatus = typeof payload.status === 'object' ? payload.status.status : payload.status;
				const newColor = typeof payload.status === 'object' ? payload.status.color : undefined;
				const newReason = typeof payload.status === 'object' ? payload.status.reason : undefined;

				setUsers((prevUsers) =>
					prevUsers.map((user) =>
						user.id === payload.teamMemberId
							? {
								...user,
								loginStatus: newStatus,
								status: {
									status: newStatus,
									color: newColor,
									reason: newReason,
								},
							}
							: user
					)
				);
			};

			const handleRefresh = (payload: RefreshPayload) => {
				console.log("Refresh Request (Users Page):", payload?.message);
				refetch();
			};

			socket.on('teamMemberStatusUpdate', handleStatusUpdate);
			socket.on('refreshTeamMembers', handleRefresh);

			return () => {
				socket.off('teamMemberStatusUpdate', handleStatusUpdate);
				socket.off('refreshTeamMembers', handleRefresh);
			};
		}
	}, [socket, refetch]);

	useEffect(() => {
		if (teamMembersResponse) {
			// Handle different response structures
			const rawMembers = teamMembersResponse.data || teamMembersResponse.teamMembers || teamMembersResponse || [];
			const membersList = Array.isArray(rawMembers) ? rawMembers : (rawMembers.docs || []);

			const mappedUsers = membersList.map((member: unknown) => {
				const m = member as ApiTeamMember;
				const fullName = m?.name || '';
				const [firstName, ...lastNameParts] = fullName.split(' ');
				const lastName = lastNameParts.join(' ');

				let loginStatus = 'Logged Out';
				let statusObj = undefined;

				if (m.status) {
					if (typeof m.status === 'object') {
						loginStatus = m.status.status || m.loginStatus || 'Logged Out';
						statusObj = {
							status: m.status.status,
							color: m.status.color,
							reason: m.status.reason
						};
					} else if (typeof m.status === 'string') {
						loginStatus = m.status;
						statusObj = {
							status: m.status,
							color: undefined,
							reason: undefined
						};
					}
				} else {
					loginStatus = m.loginStatus || 'Logged Out';
				}

				return {
					id: m._id || m.id || '',
					userId: m?.userId || '',
					firstName: m?.firstName || firstName || '',
					lastName: m?.lastName || lastName || '',
					email: m?.email || '',
					phone: m?.phone || '',
					role: typeof m.role === 'object' ? (m?.role?.roleName || m.role?.name || '') : (m.role || 'Agent'),
					loginStatus: loginStatus,
					status: statusObj,
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

	const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
	const currentUsers = filteredUsers.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
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

	const handleConfirmDelete = async () => {
		if (deleteUser) {
			try {
				await deleteTeamMember(deleteUser.id).unwrap();
				toast.success('User deleted successfully');
				setDeleteUser(null);
			} catch (error) {
				console.error('Failed to delete user:', error);
				toast.error('Failed to delete user');
			}
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
					{canCreate && (
						<Button
							variant="primary"
							size="md"
							onClick={handleAddUser}
							className="flex items-center gap-2 px-2 py-2 sm:px-4 sm:py-2 text-[10px] md:text-[12px]"
						>
							Add User
						</Button>
					)}
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
						className="text-[10px] md:text-[12px] dark:text-gray-300 flex-1"
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
				{filteredUsers.length > 0 && (
					<div className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<PaginationSummary
							totalItems={filteredUsers.length}
							itemsPerPage={itemsPerPage}
							onItemsPerPageChange={(value) => {
								setItemsPerPage(value);
								setCurrentPage(1);
							}}
							className="text-gray-600"
						/>
						<span
							className="text-[10px] md:text-[12px] dark:text-gray-400"
							style={{ color: 'var(--text-tertiary)' }}
						>
							Total of {filteredUsers.length} Users
						</span>
					</div>
				)}
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
								{tableHeaders.map((label) => (
									<th
										key={label}
										className="dark:text-gray-100"
										style={{ color: 'var(--text-primary)' }}
									>
										{label}
									</th>
								))}
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
								<SVGLoaderFetch colSpan={totalColumns} text={''} />
							) : currentUsers.length === 0 ? (
								<NoRecordFound colSpan={totalColumns} />
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
										{user?.userId}
									</td>
									<td
										className="dark:text-gray-100"
										style={{ color: 'var(--text-primary)' }}
									>
										{user?.firstName}
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
										className="dark:text-gray-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
										style={{ color: 'var(--text-primary)' }}
										onClick={() => setStatusModalUser(user)}
										title="Click to view status details"
									>
										<div className="flex items-center">
											{(user.status?.color || user.loginStatus === 'Logged In') && (
												<span
													className="w-2.5 h-2.5 rounded-full inline-block mr-2"
													style={{ backgroundColor: user.status?.color || '#22C55E' }}
												/>
											)}
											{user.loginStatus}
										</div>
									</td>
									<td>
										<div className="flex items-center gap-2">
											{canEdit && (
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
											)}
											{canDelete && (
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
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Pagination */}
			{filteredUsers.length > 0 && (
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
					showEllipsis={true}
					maxVisiblePages={5}
					primaryColor={lineOfBusinessData?.primaryColor || '#000000'}
					secondaryColor={lineOfBusinessData?.secondaryColor || '#000000'}
				/>
			)}

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
					<SelectedUsersDrawerContent
						selectedUsers={selectedUsers}
						users={users}
						onClose={() => setIsDrawerOpen(false)}
						onEdit={(user) => router.push(`/users/${user.id}/edit`)}
						onDelete={(user) => {
							handleDeleteClick(user);
							setIsDrawerOpen(false);
						}}
						onBulkDeleteSuccess={() => {
							setSelectedUsers(new Set());
							setIsDrawerOpen(false);
						}}
					/>
				</div>
			)}

			<Modal
				isOpen={!!statusModalUser}
				onClose={() => setStatusModalUser(null)}
				title="Status Details"
				size="sm"
			>
				{statusModalUser && (
					<div className="space-y-6 pt-2">
						<div
							className="flex items-center justify-between p-4 rounded-xl border dark:border-gray-700"
							style={{
								backgroundColor: 'var(--bg-primary)',
								borderColor: 'var(--light-gray)'
							}}
						>
							<span
								className="text-[10px] md:text-[12px] font-medium dark:text-gray-400"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Current Status
							</span>
							<div className="flex items-center gap-3">
								{(statusModalUser.status?.color || statusModalUser.loginStatus === 'Logged In') && (
									<span
										className="w-3 h-3 rounded-full shadow-sm ring-2 ring-offset-2 dark:ring-offset-gray-900 ring-transparent"
										style={{ backgroundColor: statusModalUser.status?.color || '#22C55E' }}
									/>
								)}
								<span
									className="font-semibold text-base dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									{statusModalUser.loginStatus}
								</span>
							</div>
						</div>

						<div className="space-y-2">
							<span
								className="text-[10px] md:text-[12px] font-medium dark:text-gray-400"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Reason
							</span>
							<div
								className="p-4 rounded-xl border min-h-20 text-[10px] md:text-[12px] leading-relaxed dark:border-gray-700"
								style={{
									backgroundColor: 'var(--bg-primary)',
									borderColor: 'var(--light-gray)',
									color: 'var(--text-primary)'
								}}
							>
								{statusModalUser.status?.reason ? (
									statusModalUser.status.reason
								) : (
									<span className="italic opacity-60">No reason provided</span>
								)}
							</div>
						</div>

						<div className="flex justify-end pt-2">
							<Button
								variant="secondary"
								onClick={() => setStatusModalUser(null)}
								className="w-full sm:w-auto"
							>
								Close
							</Button>
						</div>
					</div>
				)}
			</Modal>
		</div>
	);
};

export default UsersPage;
