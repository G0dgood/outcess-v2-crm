'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Search from '@/components/ui/Search';
import Dropdown from '@/components/ui/Dropdown';
import Pagination from '@/components/ui/Pagination';
import PaginationSummary from '@/components/ui/PaginationSummary';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useGetTeamMembersBySupervisorIdQuery } from '@/store/services/teamMembersApi';
import { SVGLoaderFetch, NoRecordFound } from '@/components/Options';
import { useSocket } from '@/contexts/SocketContext';
import { toastSuccess } from '@/utils/toastWithSound';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { useGetSupervisorsByLineOfBusinessIdQuery } from '@/store/services/teamMembersApi';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

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
	supervisor?: string | { name?: string };
	status?: string | StatusPayload;
	loginStatus?: string;
	team?: string | { name?: string };
}

interface SupervisorRaw {
	_id?: string;
	id?: string;
	name?: string;
	firstName?: string;
	lastName?: string;
}

interface SupervisorOption {
	label: string;
	value: string;
}

const TeamMembersPage: React.FC = () => {
	const { lineOfBusinessData } = useLineOfBusiness();
	const lobId = lineOfBusinessData?.lineOfBusiness?._id || lineOfBusinessData?.lineOfBusiness?.id;
	const [supervisorFilter, setSupervisorFilter] = useState('');

	const { data: teamMembersResponse, isLoading, refetch } = useGetTeamMembersBySupervisorIdQuery(supervisorFilter, {
		skip: !supervisorFilter
	});

	const { data: supervisorsData } = useGetSupervisorsByLineOfBusinessIdQuery(lobId || '', {
		skip: !lobId
	});
	const { socket } = useSocket();
	const { canAccess } = usePrivilege();
	const canAccessModule = canAccess('teamMembers', 'view');

	const supervisorId = supervisorFilter;

	const [teamMembersData, setTeamMembersData] = useState<TeamMember[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [currentPage, setCurrentPage] = useState(1);
	const [statusModalMember, setStatusModalMember] = useState<TeamMember | null>(null);

	useEffect(() => {
		if (socket) {
			const handleStatusUpdate = (payload: TeamMemberStatusUpdatePayload) => {
				console.log("Status Update:", payload);
				const newStatus = typeof payload.status === 'object' ? payload.status.status : payload.status;
				const newColor = typeof payload.status === 'object' ? payload.status.color : undefined;
				const newReason = typeof payload.status === 'object' ? payload.status.reason : undefined;

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
				console.log("Refresh Request:", payload?.message);
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
			const rawMembers = teamMembersResponse?.data || teamMembersResponse?.teamMembers ||
				teamMembersResponse || [];

			const membersList = Array.isArray(rawMembers) ? rawMembers : (rawMembers.docs || []);

			const mappedMembers: TeamMember[] = membersList.map((member: unknown) => {
				const m = member as ApiTeamMember;

				let status = 'Logged Out';
				let statusColor = undefined;
				let reason = undefined;

				if (m.status) {
					if (typeof m.status === 'object') {
						status = m.status.status || m.loginStatus || 'Logged Out';
						statusColor = m.status.color;
						reason = m.status.reason;
					} else if (typeof m.status === 'string') {
						status = m.status;
					}
				} else {
					status = m.loginStatus || 'Logged Out';
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
					team: (typeof m.team === 'object' ? m.team?.name : m.team) || 'Unassigned'
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
			const newReason = typeof updateData.status === 'object' ? updateData.status.reason : undefined;

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
		if (!supervisorsData) return [];
		const rawSupervisors = supervisorsData.teamMembers || supervisorsData.data || (Array.isArray(supervisorsData) ? supervisorsData : []);

		const uniqueSupervisors = rawSupervisors.map((s: SupervisorRaw) => ({
			label: s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim(),
			value: s._id || s.id || ''
		})).filter((s: SupervisorOption) => s.label && s.value);

		const uniqueMap = new Map();
		uniqueSupervisors.forEach((s: SupervisorOption) => uniqueMap.set(s.value, s));

		return Array.from(uniqueMap.values()) as SupervisorOption[];
	}, [supervisorsData]);

	useEffect(() => {
		if (supervisors.length > 0 && !supervisorFilter) {
			setSupervisorFilter(supervisors[0].value);
		}
	}, [supervisors, supervisorFilter]);

	const filteredMembers = useMemo(() => {
		return teamMembersData.filter(member => {
			const matchesSearch =
				searchTerm.trim().length === 0 ||
				member.agentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
				member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				member.email.toLowerCase().includes(searchTerm.toLowerCase());

			return matchesSearch;
		});
	}, [searchTerm, teamMembersData]);

	const totalPages = Math.max(1, Math.ceil(filteredMembers.length / itemsPerPage));
	const currentMembers = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
				{filteredMembers.length > 0 && (
					<div className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<PaginationSummary
							totalItems={filteredMembers.length}
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
							Total of {filteredMembers.length} Team Members
						</span>
					</div>
				)}

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
								{['User ID', 'Full Name', 'Email', 'Phone No', 'Role', 'Supervisor', 'Logged In Status'].map((heading) => (
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
								<SVGLoaderFetch colSpan={7} text={''} />
							) : currentMembers?.length === 0 ? (
								<NoRecordFound colSpan={7} />
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
					{filteredMembers.length > 0 && (
						<Pagination
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={setCurrentPage}
							primaryColor={lineOfBusinessData?.primaryColor}
							secondaryColor={lineOfBusinessData?.secondaryColor}
						/>
					)}
				</div>
			</div>

			<Modal
				isOpen={!!statusModalMember}
				onClose={() => setStatusModalMember(null)}
				title="Status Details"
				size="sm"
			>
				{statusModalMember && (
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
								{(statusModalMember.statusColor || statusModalMember.status === 'Logged In') && (
									<span
										className="w-3 h-3 rounded-full shadow-sm ring-2 ring-offset-2 dark:ring-offset-gray-900 ring-transparent"
										style={{ backgroundColor: statusModalMember.statusColor || '#15803D' }}
									/>
								)}
								<span
									className="font-semibold text-base dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									{statusModalMember.status}
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
								className="p-4 rounded-xl border min-h-[5rem] text-[10px] md:text-[12px] leading-relaxed dark:border-gray-700"
								style={{
									backgroundColor: 'var(--bg-primary)',
									borderColor: 'var(--light-gray)',
									color: 'var(--text-primary)'
								}}
							>
								{statusModalMember.reason ? (
									statusModalMember.reason
								) : (
									<span className="italic opacity-60">No reason provided</span>
								)}
							</div>
						</div>

						<div className="flex justify-end pt-2">
							<Button
								variant="secondary"
								onClick={() => setStatusModalMember(null)}
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

export default TeamMembersPage;
