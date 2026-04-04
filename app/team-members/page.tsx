'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Search from '@/components/ui/Search';
import Dropdown from '@/components/ui/Dropdown';
import Pagination from '@/components/ui/Pagination';
import { useCampaign } from '@/contexts/CampaignContext';
import { useGetTeamMembersBySupervisorIdQuery, useGetSupervisorsByCampaignIdQuery } from '@/store/services/teamMembersApi';
import { useSocket } from '@/contexts/SocketContext';
import TeamMembersTable from '@/components/features/team-members/TeamMembersTable';
import { toastSuccess } from '@/utils/toastWithSound';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { useUserInfo } from '@/contexts/UserInfoContext';
import StatusDetailsModal from '@/components/ui/StatusDetailsModal';
import TeamMemberCard from '@/components/TeamMemberCard';
import {
	useCreateTeamMemberMutation,
	useUpdateTeamMemberMutation,
	useDeleteTeamMemberMutation
} from '@/store/services/teamMembersApi';
import { useGetRolesByCampaignIdQuery } from '@/store/services/roleApi';
import Icon from '@/components/ui/Icon';
import TeamMembersCards from '@/components/features/team-members/TeamMembersCards';
import { toastError } from '@/utils/toastWithSound';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import ViewToggle from '@/components/ui/ViewToggle';
import AddTeamMemberModal from '@/components/AddTeamMemberModal';
import { PersonIcon, IdCardIcon } from '@radix-ui/react-icons';
import ManageMembersModal from '@/components/features/team-members/ManageMembersModal';

interface TeamMember {
	_id: string;
	agentId: string;
	fullName: string;
	email: string;
	phone: string;
	role: string | { roleName?: string; name?: string };
	supervisor: string;
	status: string;
	statusColor?: string;
	reason?: string;
	team: string;
	shiftHourTitle?: string;
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
	supervisor?: string | { name?: string };
	status?: string | StatusPayload;
	loginStatus?: string;
	team?: string | { name?: string };
	statusReason?: string;
	shiftHour?: {
		shiftHourId?: string;
		title?: string;
	};
}

interface SupervisorOption {
	label: string;
	value: string;
}

const TeamMembersPage: React.FC = () => {
	const { campaignData } = useCampaign();
	const { user } = useUserInfo();
	const campaignId = campaignData?.campaign?._id || campaignData?.campaign?.id;
	const [supervisorFilter, setSupervisorFilter] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [teamMembersData, setTeamMembersData] = useState<TeamMember[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
	const [statusModalMember, setStatusModalMember] = useState<TeamMember | null>(null);
	const [shiftFilter, setShiftFilter] = useState<string>('');
	const [viewType, setViewType] = useState<'table' | 'card'>('card');
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isManageModalOpen, setIsManageModalOpen] = useState(false);
	const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

	// Handle search debouncing
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
			setCurrentPage(1); // Reset to first page on new search
		}, 500);

		return () => clearTimeout(timer);
	}, [searchTerm]);

	const { data: teamMembersResponse, isLoading, refetch } = useGetTeamMembersBySupervisorIdQuery(
		{
			supervisorId: supervisorFilter,
			page: currentPage,
			limit: itemsPerPage,
			search: debouncedSearchTerm
		},
		{ skip: !supervisorFilter }
	);

	const companyId =
		(user?.company as { _id?: string; id?: string } | undefined)?._id ||
		(user?.company as { _id?: string; id?: string } | undefined)?.id ||
		user?.companyId ||
		'';

	const { data: supervisorsData } = useGetSupervisorsByCampaignIdQuery(
		{ companyId, campaignId: campaignId || '' },
		{
			skip: !companyId || !campaignId
		}
	);
	const { socket } = useSocket();
	const { canAccess } = usePrivilege();
	const canAccessModule = canAccess('teamMembers', 'view');

	const [createTeamMember] = useCreateTeamMemberMutation();
	const [updateTeamMember] = useUpdateTeamMemberMutation();
	const [deleteTeamMember] = useDeleteTeamMemberMutation();

	const { data: rolesData } = useGetRolesByCampaignIdQuery(campaignId || '', { skip: !campaignId });

	const supervisorId = supervisorFilter;

	useEffect(() => {
		if (socket) {
			const handleStatusUpdate = (payload: TeamMemberStatusUpdatePayload) => {
				const newStatus = typeof payload.status === 'object' ? payload.status.status : payload.status;
				const newColor = typeof payload.status === 'object' ? payload.status.color : undefined;
				const newReason =
					typeof payload.status === 'object'
						? payload.status.statusReason || payload.status.reason
						: undefined;

				setTeamMembersData((prevMembers) =>
					prevMembers.map((member) =>
						member._id === payload.teamMemberId
							? {
								...member,
								status: newStatus,
								statusColor: newColor,
								reason: newReason,
							}
							: member
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

			const mappedMembers: TeamMember[] = membersList.map((member: unknown) => {
				const m = member as ApiTeamMember;

				let status = 'Logged out';
				let statusColor = undefined;
				let reason = undefined;

				if (m?.status) {
					if (typeof m?.status === 'object') {
						status = m?.status?.status || m?.loginStatus || 'Logged out';
						statusColor = m?.status?.color;
						reason = m?.status?.statusReason || m?.status?.reason || m?.statusReason;
					} else if (typeof m?.status === 'string') {
						status = m?.status;
						reason = m?.statusReason;
					}
				} else {
					status = m?.loginStatus || 'Logged out';
					reason = m?.statusReason;
				}

				return {
					_id: m?._id || m?.id || '',
					agentId: m?.userId || 'N/A', // Prioritize userId from API response
					fullName: m?.name || `${m?.firstName || ''} ${m?.lastName || ''}`.trim(),
					email: m?.email || '',
					phone: m?.phone || '',
					role: (typeof m?.role === 'object' ? (m?.role?.roleName || m?.role?.name) : (m?.role || 'agent'))?.toLowerCase() as TeamMember['role'],
					supervisor: (typeof m?.supervisor === 'object' ? m?.supervisor?.name : m?.supervisor) || 'Unassigned',
					status,
					statusColor,
					reason,
					team: (typeof m?.team === 'object' ? m?.team?.name : m?.team) || 'Unassigned',
					shiftHourTitle: m?.shiftHour?.title || ''
				};
			});
			setTeamMembersData(mappedMembers);
		}
	}, [teamMembersResponse]);

	// Socket connection for real-time status updates
	useEffect(() => {
		if (!socket) return;

		// Join the supervisor's room
		socket.emit('join', supervisorId);

		// Listen for status updates
		const handleStatusUpdate = (data: unknown) => {
			// data: { teamMemberId, name, status, timestamp }
			const updateData = data as TeamMemberStatusUpdatePayload;

			const newStatus = typeof updateData.status === 'object' ? updateData.status.status : updateData.status;
			const newColor = typeof updateData.status === 'object' ? updateData.status.color : undefined;
			const newReason =
				typeof updateData.status === 'object'
					? updateData.status.statusReason || updateData.status.reason
					: undefined;

			setTeamMembersData(prevMembers => prevMembers.map(member => {
				if (member._id === updateData.teamMemberId || member.agentId === updateData.teamMemberId) {
					return {
						...member,
						status: newStatus,
						statusColor: newColor,
						reason: newReason,
					};
				}
				return member;
			}));
		};

		// Listen for refresh requests
		const handleRefresh = () => {
			refetch();
		};

		socket.on('teamMemberStatusUpdate', handleStatusUpdate);
		socket.on('refreshTeamMembers', handleRefresh);

		return () => {
			socket.off('teamMemberStatusUpdate', handleStatusUpdate);
			socket.off('refreshTeamMembers', handleRefresh);
		};
	}, [socket, supervisorId, refetch]);

	const supervisors = useMemo(() => {
		if (!supervisorsData || !Array.isArray(supervisorsData.roles)) return [];

		const rawRoles = supervisorsData.roles as {
			_id?: string;
			id?: string;
			roleName?: string;
			supervisorTitle?: string;
		}[];

		const options: SupervisorOption[] = rawRoles
			.map((role) => ({
				label: (role.supervisorTitle || role.roleName || '').trim(),
				value: role._id || role.id || ''
			}))
			.filter((s) => s.label && s.value);

		const uniqueMap = new Map<string, SupervisorOption>();
		options.forEach((s) => uniqueMap.set(s.value, s));

		return Array.from(uniqueMap.values());
	}, [supervisorsData]);

	useEffect(() => {
		if (supervisors.length > 0 && !supervisorFilter) {
			setSupervisorFilter(supervisors[0].value);
		}
	}, [supervisors, supervisorFilter]);

	const shiftHourOptions = useMemo(() => {
		const lobShiftHours = campaignData?.campaign?.shiftHours as
			| { title?: string; shiftName?: string }[]
			| { title?: string; shiftName?: string }
			| undefined;

		const fromLob: string[] = (() => {
			if (!lobShiftHours) return [];
			const list = Array.isArray(lobShiftHours) ? lobShiftHours : [lobShiftHours];
			return list
				.map((s) => s.title || s.shiftName || '')
				.filter((name): name is string => Boolean(name));
		})();

		const fromMembers = Array.from(
			new Set(teamMembersData.map((m) => m.shiftHourTitle).filter(Boolean))
		) as string[];

		const allTitles = Array.from(new Set([...fromLob, ...fromMembers]));

		return allTitles.map((t) => ({ label: t, value: t }));
	}, [campaignData, teamMembersData]);

	const filteredMembers = useMemo(() => {
		return teamMembersData.filter(member => {
			const matchesShift = !shiftFilter || member.shiftHourTitle === shiftFilter;
			return matchesShift;
		});
	}, [teamMembersData, shiftFilter]);

	const totalPages = teamMembersResponse?.pagination?.totalPages || 1;
	const currentMembers = filteredMembers;

	const roleOptions = useMemo(() => {
		if (!rolesData?.roles) return [];
		return rolesData.roles.map(r => ({ label: r.roleName, value: r._id || r.id || '' }));
	}, [rolesData]);

	const supervisorOptions = useMemo(() => {
		return supervisors; // Already calculated
	}, [supervisors]);

	const handleAddMember = async (data: any) => {
		try {
			const payload = {
				name: `${data.firstName} ${data.lastName}`.trim(),
				email: data.email,
				phone: data.phone,
				role: data.role,
				companyId,
				campaignId: campaignId,
				supervisorId: data.supervisorId || null,
				password: data.password || 'Peoplely@123',
			};

			if (editingMember) {
				await updateTeamMember({ id: editingMember._id, data: payload }).unwrap();
				toastSuccess('Team member updated successfully');
			} else {
				await createTeamMember(payload).unwrap();
				toastSuccess('Team member created successfully');
			}
			setIsAddModalOpen(false);
			setEditingMember(null);
		} catch (err: any) {
			toastError(err?.data?.message || 'Failed to save team member');
		}
	};

	const handleDeleteMember = async (id: string) => {
		if (window.confirm('Are you sure you want to delete this team member?')) {
			try {
				await deleteTeamMember(id).unwrap();
				toastSuccess('Team member deleted successfully');
			} catch (err: any) {
				toastError(err?.data?.message || 'Failed to delete team member');
			}
		}
	};

	const handleEditMemberClick = (member: TeamMember) => {
		setEditingMember(member);
		setIsAddModalOpen(true);
	};

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(1);
		}
	}, [currentPage, totalPages]);

	if (!canAccessModule) {
		return null;
	}

	return (
		<div>
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<PageHeader
					title="Team Members"
					description="Monitor agent login activity and supervisor assignments."
					icon={PersonIcon}
					className="mb-0"
				/>
				<div className="flex items-center gap-3">
					<ViewToggle
						view={viewType}
						onChange={setViewType}
					/>
					<Button 
						variant="outline" 
						size="md" 
						onClick={() => setIsManageModalOpen(true)}
						className="flex items-center gap-2"
					>
						<IdCardIcon className="w-4 h-4" />
						Manage Members
					</Button>
					<Button variant="primary" size="md" onClick={() => { setEditingMember(null); setIsAddModalOpen(true); }}>
						Add Team Member
					</Button>
				</div>
			</div>

			{/* Controls */}
			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-5">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<Search
						placeholder="Search Agent ID"
						value={searchTerm}
						onChange={setSearchTerm}
						showClearButton={true}
					/>
				</div>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 w-auto">
					<Dropdown
						label="Supervisor"
						options={supervisors}
						value={supervisorFilter}
						onChange={(val) => {
							if (Array.isArray(val)) return;
							setSupervisorFilter(val);
						}}
						inputClassName="h-10 whitespace-nowrap"
					/>
					<Dropdown
						label="Shift Hour"
						options={shiftHourOptions}
						value={shiftFilter}
						onChange={(val) => {
							if (Array.isArray(val)) return;
							setShiftFilter(val);
						}}
						inputClassName="h-10 whitespace-nowrap"
					/>
				</div>
			</div>

			{/* Content Area */}
			{viewType === 'table' ? (
				<TeamMembersTable
					teamMembersResponse={teamMembersResponse}
					currentMembers={currentMembers}
					itemsPerPage={itemsPerPage}
					setItemsPerPage={setItemsPerPage}
					currentPage={currentPage}
					setCurrentPage={setCurrentPage}
					totalPages={totalPages}
					isLoading={isLoading}
					campaignData={campaignData}
					setStatusModalMember={setStatusModalMember}
				/>
			) : (
				<TeamMembersCards
					isLoading={isLoading}
					filteredMembers={filteredMembers}
					currentMembers={currentMembers}
					currentPage={currentPage}
					totalPages={totalPages}
					setCurrentPage={setCurrentPage}
					campaignData={campaignData}
					handleEditMemberClick={handleEditMemberClick}
					handleDeleteMember={handleDeleteMember}
					setStatusModalMember={setStatusModalMember}
				/>
			)}

			<StatusDetailsModal
				isOpen={!!statusModalMember}
				onClose={() => setStatusModalMember(null)}
				loginStatus={statusModalMember?.status || ''}
				status={
					statusModalMember
						? {
							status: statusModalMember.status,
							color: statusModalMember.statusColor,
							reason: statusModalMember.reason,
						}
						: undefined
				}
			/>

			<AddTeamMemberModal
				isOpen={isAddModalOpen}
				onClose={() => { setIsAddModalOpen(false); setEditingMember(null); }}
				onSave={handleAddMember}
				editingMember={editingMember}
				roles={roleOptions}
				supervisors={supervisorOptions}
				shiftHours={shiftHourOptions}
			/>

			<ManageMembersModal 
				isOpen={isManageModalOpen}
				onClose={() => setIsManageModalOpen(false)}
				campaignData={campaignData}
			/>
		</div>
	);
};

export default TeamMembersPage;
