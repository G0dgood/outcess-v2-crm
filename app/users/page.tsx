'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import Pagination from '@/components/ui/Pagination';
import TablePaginationHeader from '@/components/ui/TablePaginationHeader';
import Checkbox from '@/components/ui/Checkbox';
import { useGetTeamMembersByCampaignIdQuery, useDeleteTeamMemberMutation } from '@/store/services/teamMembersApi';
import PageHeading from '@/components/ui/PageHeading';
import { Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import AddUserModal from '@/components/features/user/AddUserModal';
import DeleteUserModal from '@/components/features/user/DeleteUserModal';
import BulkUploadModal from '@/components/features/user/BulkUploadModal';
import { useCampaign } from '@/contexts/CampaignContext';
import { NoRecordFound, SVGLoaderFetch } from '@/components/Options';
import { toast } from 'sonner';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { useSocket } from '@/contexts/SocketContext';
import SelectedUsersDrawerContent from './SelectedUsersDrawerContent';
import StatusDetailsModal from '@/components/ui/StatusDetailsModal';
import LoginStatusInfoBanner from '@/components/ui/LoginStatusInfoBanner';
import SampleCsvDownloader from '@/components/ui/SampleCsvDownloader';
import { Bucket, AssignedMember } from '@/contexts/SetupContext';

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
	shiftHour?: {
		shiftHourId?: string;
		title?: string;
	};
	supervisor?: string;
}

interface StatusPayload {
	status: string;
	color?: string;
	reason?: string;
	statusReason?: string;
}

interface TeamMemberStatusUpdatePayload {
	teamMemberId: string;
	status: StatusPayload | string;
	name?: string;
	timestamp?: string;
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
	statusReason?: string;
	shiftHour?: {
		shiftHourId?: string;
		title?: string;
	};
	loginStatus?: string;
	supervisor?: string | { name?: string };
	supervisorId?: string;
}

const UsersPage: React.FC = () => {
	const router = useRouter();
	const { campaignData } = useCampaign();
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const campaignId = campaignData?._id || '';
	const { data: teamMembersResponse, isLoading, refetch } = useGetTeamMembersByCampaignIdQuery(
		{ campaignId, page: currentPage, limit: itemsPerPage },
		{ skip: !campaignId }
	);
	const [deleteTeamMember] = useDeleteTeamMemberMutation();
	const { canAccess } = usePrivilege();
	const { socket } = useSocket();
	const canCreate = canAccess('teamMembers', 'create');
	const canEdit = canAccess('teamMembers', 'edit');
	const canDelete = canAccess('teamMembers', 'delete');

	const userImportFields = useMemo(() => {
		return [
			{ name: 'firstName' },
			{ name: 'lastName' },
			{ name: 'email' },
			{ name: 'phone' },
			{ name: 'role' },
			{ name: 'userId' },
			{ name: 'password' },
		];
	}, []);

	const [searchTerm, setSearchTerm] = useState('');
	const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
	const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
	const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
	const [deleteUser, setDeleteUser] = useState<{ id: string; name: string } | null>(null);
	const [statusModalUser, setStatusModalUser] = useState<User | null>(null);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [isDrawerAnimating, setIsDrawerAnimating] = useState(false);
	const [shouldRenderDrawer, setShouldRenderDrawer] = useState(false);
	const [showInfoBanner, setShowInfoBanner] = useState(true);
	const [users, setUsers] = useState<User[]>([]);
	const tableHeaders = ['User ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Role', 'Supervisor', 'Shift Hour', 'Bucket', 'Login Status', 'Actions'];
	const totalColumns = tableHeaders.length + 1;

	useEffect(() => {
		if (socket) {
			const handleStatusUpdate = (payload: TeamMemberStatusUpdatePayload) => {
				const newStatus = typeof payload.status === 'object' ? payload.status.status : payload.status;
				const newColor = typeof payload.status === 'object' ? payload.status.color : undefined;
				const newReason =
					typeof payload.status === 'object'
						? payload.status.statusReason || payload.status.reason
						: undefined;

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

			const handleRefresh = () => {
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
			const membersList = teamMembersResponse.teamMembers || [];

			const mappedUsers = membersList.map((member: ApiTeamMember) => {
				const m = member as ApiTeamMember;
				const fullName = m?.name || '';
				const [firstName, ...lastNameParts] = fullName.split(' ');
				const lastName = lastNameParts.join(' ');

				let loginStatus = 'Logged Out';
				let statusObj: { status: string; color?: string; reason?: string } | undefined;

				if (m.status) {
					if (typeof m.status === 'object') {
						const statusText = m.status.status || m.loginStatus || 'Logged Out';
						const reasonText = m.status.statusReason || m.status.reason || m.statusReason;
						loginStatus = statusText;
						statusObj = {
							status: statusText,
							color: m.status.color,
							reason: reasonText,
						};
					} else if (typeof m.status === 'string') {
						loginStatus = m.status;
						statusObj = {
							status: m.status,
							color: undefined,
							reason: m.statusReason,
						};
					}
				} else {
					loginStatus = m.loginStatus || 'Logged Out';
				}

				let supervisorName = 'Unassigned';
				if (m.supervisor) {
					if (typeof m.supervisor === 'object') {
						supervisorName = m.supervisor.name || 'Unassigned';
					} else {
						supervisorName = m.supervisor;
					}
				}

				return {
					id: m._id || m.id || '',
					userId: m?.userId || '',
					firstName: m?.firstName || firstName || '',
					lastName: m?.lastName || lastName || '',
					email: m?.email || '',
					phone: m?.phone || '',
					role:
						typeof m.role === 'object'
							? (m?.role?.roleName || m.role?.name || '')
							: (m.role || 'Agent'),
					loginStatus,
					status: statusObj,
					shiftHour: m.shiftHour
						? {
							shiftHourId: m.shiftHour.shiftHourId,
							title: m.shiftHour.title,
						}
						: undefined,
					supervisor: supervisorName,
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

	const totalPages = teamMembersResponse?.pagination?.totalPages || 1;
	// When using backend pagination, filteredUsers is already the current page of data from the API
	// However, the component also has a local search filter. 
	// To be fully backend-driven, search should also be on the backend.
	// For now, we'll keep the local mapping, but the list is already limited by the backend.
	const currentUsers = filteredUsers;

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
					<SampleCsvDownloader
						fields={userImportFields}
						fileName="sample_users.csv"
						className="flex items-center gap-2 px-2 py-2 sm:px-4 sm:py-2 text-[10px] md:text-[12px]"
					/>
					{canCreate && (
						<>
							<Button
								variant="outline"
								size="md"
								onClick={() => setIsBulkUploadModalOpen(true)}
								className="flex items-center gap-2 px-2 py-2 sm:px-4 sm:py-2 text-[10px] md:text-[12px]"
							>
								Upload
							</Button>
							<Button
								variant="primary"
								size="md"
								onClick={handleAddUser}
								className="flex items-center gap-2 px-2 py-2 sm:px-4 sm:py-2 text-[10px] md:text-[12px]"
							>
								Add User
							</Button>
						</>
					)}
				</div>
			</div>

			{showInfoBanner && (
				<LoginStatusInfoBanner onClose={() => setShowInfoBanner(false)} />
			)}

			{/* Users Table */}
			<div
				className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden rounded-[var(--radius)]"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<TablePaginationHeader
					totalItems={teamMembersResponse?.pagination?.total || 0}
					itemsPerPage={itemsPerPage}
					onItemsPerPageChange={(value) => {
						setItemsPerPage(value);
						setCurrentPage(1);
					}}
					label="Users"
				/>
				<div className="overflow-x-auto">
					<table>
						<thead>
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
									>
										{label}
									</th>
								))}
							</tr>
						</thead>
						<tbody
							className="divide-y dark:divide-gray-700"
							style={{
								borderColor: 'var(--light-gray)',
							}}
						>
							{isLoading ? (
								<SVGLoaderFetch colSpan={totalColumns} text={''} />
							) : currentUsers.length === 0 ? (
								<NoRecordFound colSpan={totalColumns} />
							) : currentUsers?.map((user) => (
								<tr
									key={user.id}
									style={{ borderColor: 'var(--light-gray)' }}
								>
									<td>
										<Checkbox
											checked={selectedUsers.has(user.id)}
											onChange={(checked) => handleSelectUser(user.id, checked)}
											size="medium"
										/>
									</td>
									<td>{user?.userId}</td>
									<td>{user?.firstName}</td>
									<td>{user.lastName}</td>
									<td>{user.email}</td>
									<td>{user.phone}</td>
									<td>{user.role}</td>
									<td>{user.supervisor || 'Unassigned'}</td>
									<td
									>
										{user.shiftHour?.title ? user.shiftHour.title : 'No shift assigned'}
									</td>
									<td
										className="px-6 py-4 text-[10px] md:text-[12px] dark:text-gray-400"
										style={{ color: 'var(--text-tertiary)' }}
									>
										<div className="flex flex-wrap gap-1">
											{(campaignData?.dashboardSettings?.buckets)
												?.filter((b: Bucket) =>
													b.assignedMembers?.some((m: AssignedMember) => {
														const mId = typeof m.memberId === 'object' && m.memberId !== null
															? (m.memberId as { _id?: string; id?: string })._id || (m.memberId as { _id?: string; id?: string }).id
															: m.memberId;
														return mId === user.id;
													})
												)
												.map((b: Bucket) => (
													<span
														key={b.id}
														className="text-[9px] px-1.5 py-0.5 rounded-full text-white font-medium shadow-sm"
														style={{ backgroundColor: b.color || '#6B7280' }}
														title={b.name}
													>
														{b.name}
													</span>
												))
											}
											{(!(campaignData?.dashboardSettings?.buckets)?.some((b: Bucket) =>
												b.assignedMembers?.some((m: AssignedMember) => {
													const mId = typeof m.memberId === 'object' && m.memberId !== null
														? (m.memberId as { _id?: string; id?: string })._id || (m.memberId as { _id?: string; id?: string }).id
														: m.memberId;
													return mId === user.id;
												})
											)) && (
													<span className="text-[10px] text-gray-300 italic font-inter font-normal">Unassigned</span>
												)}
										</div>
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
												<Button
													variant="ghost"
													size="sm"
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
												</Button>
											)}
											{canDelete && (
												<Button
													variant="ghost"
													size="sm"
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
												</Button>
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
			{currentUsers.length > 0 && (
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
					showEllipsis={true}
					maxVisiblePages={5}
					primaryColor={campaignData?.primaryColor || 'var(--primary)'}
					secondaryColor={campaignData?.secondaryColor || 'var(--primary)'}
				/>
			)}

			{/* Add User Modal */}
			<AddUserModal
				isOpen={isAddUserModalOpen}
				onClose={() => setIsAddUserModalOpen(false)}
			/>

			{/* Bulk Upload Modal */}
			<BulkUploadModal
				isOpen={isBulkUploadModalOpen}
				onClose={() => setIsBulkUploadModalOpen(false)}
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
						onBulkAssignSupervisorSuccess={() => {
							setSelectedUsers(new Set());
							setIsDrawerOpen(false);
						}}
					/>
				</div>
			)}

			<StatusDetailsModal
				isOpen={!!statusModalUser}
				onClose={() => setStatusModalUser(null)}
				loginStatus={statusModalUser?.loginStatus || ''}
				status={statusModalUser?.status}
			/>
		</div>
	);
};

export default UsersPage;
