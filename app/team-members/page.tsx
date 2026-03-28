'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Search from '@/components/ui/Search';
import Dropdown from '@/components/ui/Dropdown';
import Pagination from '@/components/ui/Pagination';
import TablePaginationHeader from '@/components/ui/TablePaginationHeader';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useGetTeamMembersBySupervisorIdQuery, useGetSupervisorsByLineOfBusinessIdQuery } from '@/store/services/teamMembersApi';
import { SVGLoaderFetch, NoRecordFound } from '@/components/Options';
import { useSocket } from '@/contexts/SocketContext';
import { toastSuccess } from '@/utils/toastWithSound';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { useUserInfo } from '@/contexts/UserInfoContext';
import StatusDetailsModal from '@/components/ui/StatusDetailsModal';

interface TeamMember {
	_id: string;
	agentId: string;
	fullName: string;
	email: string;
	phone: string;
	role: 'agent' | 'supervisor' | 'qa' | 'admin';
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
	const { lineOfBusinessData } = useLineOfBusiness();
	const { user } = useUserInfo();
	const lobId = lineOfBusinessData?.lineOfBusiness?._id || lineOfBusinessData?.lineOfBusiness?.id;
	const [supervisorFilter, setSupervisorFilter] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [teamMembersData, setTeamMembersData] = useState<TeamMember[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
	const [statusModalMember, setStatusModalMember] = useState<TeamMember | null>(null);
	const [shiftFilter, setShiftFilter] = useState<string>('');

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

	const { data: supervisorsData } = useGetSupervisorsByLineOfBusinessIdQuery(
		{ companyId, lineOfBusinessId: lobId || '' },
		{
			skip: !companyId || !lobId
		}
	);
	const { socket } = useSocket();
	const { canAccess } = usePrivilege();
	const canAccessModule = canAccess('teamMembers', 'view');

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

			const handleRefresh = (payload: RefreshPayload) => {

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

				if (m.status) {
					if (typeof m.status === 'object') {
						status = m.status.status || m.loginStatus || 'Logged out';
						statusColor = m.status.color;
						reason = m.status.statusReason || m.status.reason || m.statusReason;
					} else if (typeof m.status === 'string') {
						status = m.status;
						reason = m.statusReason;
					}
				} else {
					status = m.loginStatus || 'Logged out';
					reason = m.statusReason;
				}

				return {
					_id: m._id || m.id || '',
					agentId: m.userId || 'N/A', // Prioritize userId from API response
					fullName: m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim(),
					email: m.email || '',
					phone: m.phone || '',
					role: (typeof m.role === 'object' ? (m.role?.roleName || m.role?.name) : (m.role || 'agent'))?.toLowerCase() as TeamMember['role'],
					supervisor: (typeof m.supervisor === 'object' ? m.supervisor?.name : m.supervisor) || 'Unassigned',
					status,
					statusColor,
					reason,
					team: (typeof m.team === 'object' ? m.team?.name : m.team) || 'Unassigned',
					shiftHourTitle: m.shiftHour?.title || ''
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
					// Show toast notification
					toastSuccess(`${member.fullName} is now ${newStatus}`);
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
		const lobShiftHours = lineOfBusinessData?.lineOfBusiness?.shiftHours as
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
	}, [lineOfBusinessData, teamMembersData]);

	const filteredMembers = useMemo(() => {
		return teamMembersData.filter(member => {
			const matchesShift = !shiftFilter || member.shiftHourTitle === shiftFilter;
			return matchesShift;
		});
	}, [teamMembersData, shiftFilter]);

	const totalPages = teamMembersResponse?.pagination?.totalPages || 1;
	const currentMembers = filteredMembers;

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(1);
		}
	}, [currentPage, totalPages]);

	if (!canAccessModule) {
		return null;
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1
					className="text-[18px] md:text-[20px] font-semibold dark:text-gray-100"
					style={{ color: 'var(--text-primary)' }}
				>
					Team Members
				</h1>
				<p
					className="text-[10px] md:text-[12px] mt-1 dark:text-gray-400"
					style={{ color: 'var(--text-tertiary)' }}
				>
					Monitor agent login activity and supervisor assignments.
				</p>
			</div>

			{/* Controls */}
			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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

			{/* Table */}
			<div
				className="dark:bg-gray-800 border dark:border-gray-700"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)',
				}}
			>
				<TablePaginationHeader
					totalItems={teamMembersResponse?.pagination?.total || 0}
					itemsPerPage={itemsPerPage}
					onItemsPerPageChange={(value) => {
						setItemsPerPage(value);
						setCurrentPage(1);
					}}
					label="Team Members"
				/>

				<div className="overflow-x-auto">
					<table
						className="min-w-full divide-y dark:divide-gray-700"
						style={{ borderColor: 'var(--light-gray)' }}
					>
						<thead
							className="dark:bg-gray-700"
							style={{
								backgroundColor: 'var(--bg-primary)',
								borderColor: 'var(--light-gray)',
							}}
						>
							<tr>
								{['User ID', 'Full Name', 'Email', 'Phone No', 'Role', 'Supervisor', 'Shift Hour', 'Logged In Status'].map((heading) => (
									<th
										key={heading}
										className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider dark:text-gray-300"
										style={{ color: 'var(--text-primary)' }}
									>
										{heading}
									</th>
								))}
							</tr>
						</thead>
						<tbody
							className="divide-y dark:divide-gray-700"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)',
							}}
						>
							{isLoading ? (
								<SVGLoaderFetch colSpan={8} text={''} />
							) : currentMembers?.length === 0 ? (
								<NoRecordFound colSpan={8} />
							) : (
								currentMembers?.map((member, index) => (
									<tr
										key={`${member.agentId}-${index}`}
										className="dark:hover:bg-gray-700 transition-colors"
										style={{ borderColor: 'var(--light-gray)' }}
										onMouseEnter={(e) => {
											e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.backgroundColor = 'var(--accent-white)';
										}}
									>
										<td
											className="px-6 py-4 text-[10px] md:text-[12px] dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{member?.agentId}
										</td>
										<td
											className="px-6 py-4 text-[10px] md:text-[12px] dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{member?.fullName}
										</td>
										<td
											className="px-6 py-4 text-[10px] md:text-[12px] dark:text-gray-400"
											style={{ color: 'var(--text-tertiary)' }}
										>
											{member.email}
										</td>
										<td
											className="px-6 py-4 text-[10px] md:text-[12px] dark:text-gray-400"
											style={{ color: 'var(--text-tertiary)' }}
										>
											{member.phone}
										</td>
										<td
											className="px-6 py-4 text-[10px] md:text-[12px] capitalize dark:text-gray-400"
											style={{ color: 'var(--text-tertiary)' }}
										>
											{member.role}
										</td>
										<td
											className="px-6 py-4 text-[10px] md:text-[12px] dark:text-gray-400"
											style={{ color: 'var(--text-tertiary)' }}
										>
											{member.supervisor}
										</td>
										<td
											className="px-6 py-4 text-[10px] md:text-[12px] dark:text-gray-400"
											style={{ color: 'var(--text-tertiary)' }}
										>
											{member.shiftHourTitle || 'No shift assigned'}
										</td>
										<td
											className="px-6 py-4 text-[10px] md:text-[12px] dark:text-gray-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
											style={{ color: 'var(--text-primary)' }}
											onClick={() => setStatusModalMember(member)}
										>
											<div className="flex items-center">
												{(member.statusColor || member.status === 'Logged In') && (
													<span
														className="w-2.5 h-2.5 rounded-full inline-block mr-2"
														style={{ backgroundColor: member.statusColor || '#15803D' }}
													/>
												)}
												{member.status}
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
				<div className="p-4 px-6">
					{currentMembers.length > 0 && (
						<Pagination
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={setCurrentPage}
							primaryColor={lineOfBusinessData?.primaryColor || 'var(--primary)'}
							secondaryColor={lineOfBusinessData?.secondaryColor || 'var(--primary)'}
						/>
					)}
				</div>
			</div>

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
		</div>
	);
};

export default TeamMembersPage;
