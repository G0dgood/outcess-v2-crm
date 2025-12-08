'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import AddUserModal from '@/components/ui/AddUserModal';
import EditUserModal from '@/components/ui/EditUserModal';
import { useSetup } from '@/contexts/SetupContext';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { useGetRolesByCompanyIdQuery } from '@/store/services/roleApi';
import { useCreateTeamMemberMutation, useGetTeamMembersByCompanyIdQuery } from '@/store/services/teamMembersApi';
import Icon from '@/components/ui/Icon';
import { toast } from 'sonner';

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
	const { setupData, updateUserManagementSettings, updateSetupData } = useSetup();
	const { user } = useUserInfo();
	const { userManagementSettings } = setupData;
	const router = useRouter();

	const companyId = setupData?.companyId || user?.companyId || user?.company?._id || '';

	const { data: rolesDataResponse } = useGetRolesByCompanyIdQuery(companyId, {
		skip: !companyId
	});

	console.log('setupData-----', setupData)

	const { data: teamMembersResponse, isLoading: isTeamMembersLoading } = useGetTeamMembersByCompanyIdQuery(companyId, {
		skip: !companyId
	});

	const [createTeamMember] = useCreateTeamMemberMutation();
	const [isLoading, setIsLoading] = useState(false);

	const [isAddingUser, setIsAddingUser] = useState(false);
	const [editingUser, setEditingUser] = useState<string | null>(null);
	const [editingUserData, setEditingUserData] = useState<{
		name: string;
		email: string;
		phone: string;
		role: string;
	} | null>(null);

	const teamMembers = useMemo(() => {
		if (!teamMembersResponse) return [];
		const rawMembers = teamMembersResponse.data || teamMembersResponse.teamMembers || teamMembersResponse || [];
		const membersList = Array.isArray(rawMembers) ? rawMembers : (rawMembers.docs || []);

		return membersList.map((member: any) => ({
			id: member._id,
			name: member.name,
			email: member.email,
			phone: member.phone,
			role: member.role?.roleName || member.role,
			status: member.status,
			lastLogin: member.lastLogin,
			userId: member.userId
		}));
	}, [teamMembersResponse]);

	const roleOptions = useMemo(() => {
		if (!rolesDataResponse) return [];

		const rawRoles = rolesDataResponse.data || rolesDataResponse.roles || rolesDataResponse || [];
		const rolesList = Array.isArray(rawRoles) ? rawRoles : (rawRoles.docs || []);

		if (rolesList.length === 0) return [];

		return rolesList.map((role: any) => ({
			value: role._id || role.id,
			label: role.roleName
		}));
	}, [rolesDataResponse]);

	const statusOptions = [
		{ value: 'active', label: 'Active' },
		{ value: 'inactive', label: 'Inactive' },
		{ value: 'pending', label: 'Pending' }
	];

	const handleAddUser = async (userData: {
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
		role: string;
		userId: string;
		status: string;
	}) => {
		setIsLoading(true);
		try {
			const payload = {
				name: `${userData.firstName} ${userData.lastName}`,
				email: userData.email,
				phone: userData.phone,
				role: userData.role,
				companyId: companyId,
				status: userData.status,
				userId: userData.userId,
			};

			await createTeamMember(payload as any).unwrap();

			const user: User = {
				id: userData.userId || Date.now().toString(),
				name: payload.name,
				email: payload.email,
				phone: payload.phone,
				role: payload.role,
				status: 'inactive',
				lastLogin: undefined
			};

			updateUserManagementSettings({
				users: [...userManagementSettings.users, user]
			});

			toast.success('Team member created successfully');
			setIsAddingUser(false);
		} catch (error: any) {
			console.error('Failed to create team member:', error);
			const errorMessage = error?.data?.error || error?.data?.message || 'Failed to create team member';
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteUser = (userId: string) => {
		updateUserManagementSettings({
			users: userManagementSettings.users.filter(user => user.id !== userId)
		});
	};

	const handleStatusChange = (userId: string, newStatus: string) => {
		updateUserManagementSettings({
			users: userManagementSettings.users.map(user =>
				user.id === userId ? { ...user, status: newStatus as User['status'] } : user
			)
		});
	};

	const handleEditUser = (userId: string) => {
		const user = userManagementSettings.users.find(u => u.id === userId);
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
			updateUserManagementSettings({
				users: userManagementSettings.users.map(user =>
					user.id === editingUser
						? {
							...user,
							name: `${userData.firstName} ${userData.lastName}`,
							email: userData.email,
							phone: userData.phone,
							role: userData.role
						}
						: user
				)
			});
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
				<h1
					className="font-lato not-italic font-semibold text-[20px] sm:text-[24px] leading-[150%] dark:text-gray-100"
					style={{ color: 'var(--text-secondary)' }}
				>
					User Management
				</h1>
				<p
					className="font-lato not-italic font-normal text-[14px] sm:text-[16px] leading-[150%] dark:text-gray-400"
					style={{ color: 'var(--text-tertiary)' }}
				>
					Manage user accounts, roles, and permissions for your CRM system
				</p>
			</div>

			<div
				className="flex flex-col sm:flex-row gap-6 mb-8 dark:bg-gray-800 border dark:border-gray-700 p-6"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<div className="flex flex-col sm:flex-row gap-6 mb-8 w-full">
					{/* Define User Roles Card */}
					<div
						className="dark:bg-gray-800 border dark:border-gray-700 p-6"
						style={{
							backgroundColor: 'var(--accent-white)',
							borderColor: 'var(--light-gray)'
						}}
					>
						<div className="flex flex-col w-full sm:w-[300px]">
							<div
								className="w-12 h-12 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4"
								style={{ backgroundColor: 'var(--bg-primary)' }}
							>
								<Icon name="Group_light" size="xl" />
							</div>
							<h3
								className="font-inter text-lg font-semibold dark:text-gray-100 mb-2"
								style={{ color: 'var(--text-primary)' }}
							>
								Define User Roles
							</h3>
							<p
								className="font-lato text-sm dark:text-gray-400 mb-4"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Set up different roles and their associated permissions within your CRM system.
							</p>
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
					<div
						className="dark:bg-gray-800 border dark:border-gray-700 p-6"
						style={{
							backgroundColor: 'var(--accent-white)',
							borderColor: 'var(--light-gray)'
						}}
					>
						<div className="flex flex-col w-full sm:w-[300px]">
							<div
								className="w-12 h-12 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4"
								style={{ backgroundColor: 'var(--bg-primary)' }}
							>
								<Icon name="Chield_light" size="xl" />
							</div>
							<h3
								className="font-inter text-lg font-semibold dark:text-gray-100 mb-2"
								style={{ color: 'var(--text-primary)' }}
							>
								Access Controls
							</h3>
							<p
								className="font-lato text-sm dark:text-gray-400 mb-4"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Define detailed permissions and access levels for each role.
							</p>
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


			<div
				className="dark:bg-gray-800 border dark:border-gray-700 w-full h-full"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<div
					className="box-border w-full border-b dark:border-gray-700 p-6"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<div className="flex justify-between items-center">
						<div>
							<h2
								className="font-inter text-xl font-semibold dark:text-gray-100 mb-2"
								style={{ color: 'var(--text-primary)' }}
							>
								Team Members
							</h2>
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
						<table className="min-w-full divide-y dark:divide-gray-700">
							<thead
								className="dark:bg-gray-700"
								style={{ backgroundColor: 'var(--bg-primary)' }}
							>
								<tr
									style={{
										borderBottom: '1px solid',
										borderBottomColor: 'var(--light-gray)'
									}}
								>
									<th
										scope="col"
										className="py-3 px-6 text-left text-xs font-medium dark:text-gray-400 uppercase tracking-wider"
										style={{ color: 'var(--text-primary)' }}
									>
										Name
									</th>
									<th
										scope="col"
										className="py-3 px-6 text-left text-xs font-medium dark:text-gray-400 uppercase tracking-wider"
										style={{ color: 'var(--text-primary)' }}
									>
										Email
									</th>
									<th
										scope="col"
										className="py-3 px-6 text-left text-xs font-medium dark:text-gray-400 uppercase tracking-wider"
										style={{ color: 'var(--text-primary)' }}
									>
										Phone
									</th>
									<th
										scope="col"
										className="py-3 px-6 text-left text-xs font-medium dark:text-gray-400 uppercase tracking-wider"
										style={{ color: 'var(--text-primary)' }}
									>
										Role
									</th>
									<th
										scope="col"
										className="py-3 px-6 text-left text-xs font-medium dark:text-gray-400 uppercase tracking-wider"
										style={{ color: 'var(--text-primary)' }}
									>
										Status
									</th>
									<th
										scope="col"
										className="py-3 px-6 text-left text-xs font-medium dark:text-gray-400 uppercase tracking-wider"
										style={{ color: 'var(--text-primary)' }}
									>
										Last Login
									</th>
									<th
										scope="col"
										className="py-3 px-6 text-left text-xs font-medium dark:text-gray-400 uppercase tracking-wider"
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
								{teamMembers.length === 0 ? (
									<tr>
										<td colSpan={7} className="py-12 px-6">
											<div className="flex flex-col items-center justify-center text-center">
												<img
													src="/illustrations/Avatar-Neutral-Add-2--Streamline-Ux.png"
													alt="No users added"
													className="w-32 h-32 mb-4 opacity-60"
												/>
												<h3
													className="font-inter text-base font-medium dark:text-gray-100 mb-2"
													style={{ color: 'var(--text-primary)' }}
												>
													No Team Members Yet
												</h3>
												<p
													className="font-lato text-sm dark:text-gray-400 mb-4"
													style={{ color: 'var(--text-tertiary)' }}
												>
													Add your first team member to get started
												</p>

											</div>
										</td>
									</tr>
								) : (
									teamMembers.map((user: any, index: number) => (
										<tr
											key={user.id}
											className={index !== teamMembers.length - 1 ? 'dark:border-gray-700' : ''}
											style={index !== teamMembers.length - 1 ? { borderBottom: '1px solid', borderBottomColor: 'var(--light-gray)' } : {}}
										>
											<td
												className="py-4 px-6 font-inter text-sm dark:text-gray-100"
												style={{ color: 'var(--text-primary)' }}
											>
												{user.name}
											</td>
											<td
												className="py-4 px-6 font-inter text-sm dark:text-gray-400"
												style={{ color: 'var(--text-tertiary)' }}
											>
												{user.email}
											</td>
											<td
												className="py-4 px-6 font-inter text-sm dark:text-gray-400"
												style={{ color: 'var(--text-tertiary)' }}
											>
												{user.phone}
											</td>
											<td
												className="py-4 px-6 font-inter text-sm dark:text-gray-400"
												style={{ color: 'var(--text-tertiary)' }}
											>
												{user.role}
											</td>
											<td className="py-4 px-6">
												<Dropdown
													label=""
													value={user.status}
													onChange={(value) => handleStatusChange(user.id, value as string)}
													options={statusOptions}
													className="min-w-[120px]"
												/>
											</td>
											<td
												className="py-4 px-6 font-inter text-sm dark:text-gray-400"
												style={{ color: 'var(--text-tertiary)' }}
											>
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
									))
								)}
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
				roleOptions={roleOptions}
				isLoading={isLoading}
			/>

			{/* Edit User Modal */}
			{editingUserData && (
				<EditUserModal
					isOpen={!!editingUser}
					onClose={handleCancelEdit}
					onSave={handleSaveEdit}
					userData={editingUserData}
					roleOptions={roleOptions}
				/>
			)}
		</div>
	);
}

{/* <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path d="M8 1V15M1 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
</svg> */}
