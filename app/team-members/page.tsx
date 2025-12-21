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

interface TeamMember {
	_id: string;
	agentId: string;
	fullName: string;
	email: string;
	phone: string;
	role: 'agent' | 'supervisor' | 'qa' | 'admin';
	supervisor: string;
	status: 'Logged In' | 'Logged Out';
	team: string;
}

const TeamMembersPage: React.FC = () => {
	const { lineOfBusinessData } = useLineOfBusiness();
	const supervisorId = "693d83a4412528325bdefd87";
	const { data: teamMembersResponse, isLoading } = useGetTeamMembersBySupervisorIdQuery(supervisorId);
	const { socket } = useSocket();

	const [teamMembersData, setTeamMembersData] = useState<TeamMember[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [currentPage, setCurrentPage] = useState(1);
	const [supervisorFilter, setSupervisorFilter] = useState('all');

	useEffect(() => {
		if (teamMembersResponse) {
			const rawMembers = teamMembersResponse.data || teamMembersResponse.teamMembers || teamMembersResponse || [];
			const membersList = Array.isArray(rawMembers) ? rawMembers : (rawMembers.docs || []);

			const mappedMembers: TeamMember[] = membersList.map((member: unknown) => {
				const m = member as {
					_id?: string;
					id?: string;
					agentId?: string;
					userId?: string;
					name?: string;
					firstName?: string;
					lastName?: string;
					email?: string;
					phone?: string;
					role?: string | { roleName?: string; name?: string };
					supervisor?: string | { name?: string };
					status?: string;
					loginStatus?: string;
					team?: string | { name?: string };
				};
				return {
					_id: m._id || m.id || '',
					agentId: m.userId || 'N/A', // Prioritize userId from API response
					fullName: m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim(),
					email: m.email || '',
					phone: m.phone || '',
					role: (typeof m.role === 'object' ? (m.role?.roleName || m.role?.name) : (m.role || 'agent'))?.toLowerCase() as TeamMember['role'],
					supervisor: (typeof m.supervisor === 'object' ? m.supervisor?.name : m.supervisor) || 'Unassigned',
					status: (m.status === 'Logged In' ||
						m.loginStatus === 'Logged In') ? 'Logged In' : 'Logged Out',
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
			console.log('Team Member Updated:', data);
			// data: { teamMemberId, name, status, timestamp }
			const updateData = data as { teamMemberId: string; status: TeamMember['status'] };

			setTeamMembersData(prevMembers => prevMembers.map(member => {
				if (member._id === updateData.teamMemberId || member.agentId === updateData.teamMemberId) {
					// Show toast notification
					toastSuccess(`${member.fullName} is now ${updateData.status}`);
					return {
						...member,
						status: updateData.status,
					};
				}
				return member;
			}));
		};

		socket.on('teamMemberStatusUpdate', handleStatusUpdate);

		return () => {
			socket.off('teamMemberStatusUpdate', handleStatusUpdate);
		};
	}, [socket, supervisorId]);

	const supervisors = useMemo(() => {
		const unique = new Set(teamMembersData.map(member => member.supervisor));
		return ['all', ...Array.from(unique)];
	}, []);

	const filteredMembers = useMemo(() => {
		return teamMembersData.filter(member => {
			const matchesSearch =
				searchTerm.trim().length === 0 ||
				member.agentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
				member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				member.email.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesSupervisor = supervisorFilter === 'all' || member.supervisor === supervisorFilter;

			return matchesSearch && matchesSupervisor;
		});
	}, [searchTerm, supervisorFilter, teamMembersData]);

	const totalPages = Math.max(1, Math.ceil(filteredMembers.length / itemsPerPage));
	const currentMembers = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(1);
		}
	}, [currentPage, totalPages]);

	const statusStyles = (status: TeamMember['status']) => {
		if (status === 'Logged In') {
			return {
				color: '#15803D',
			};
		}

		return {
			color: '#B91C1C',
		};
	};

	const statusStylesTable = (status: TeamMember['status']) => {
		if (status === 'Logged In') {
			return {
				backgroundColor: 'rgba(34, 197, 94, 0.12)',
				color: '#15803D',
			};
		}

		return {
			backgroundColor: 'rgba(248, 113, 113, 0.15)',
			color: '#B91C1C',
		};
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1
					className="text-2xl font-semibold dark:text-gray-100"
					style={{ color: 'var(--text-primary)' }}
				>
					Team Members
				</h1>
				<p
					className="text-sm mt-1 dark:text-gray-400"
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
						options={supervisors.map(value => ({
							value,
							label: value === 'all' ? 'All Supervisors' : value,
						}))}
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
						className="text-sm dark:text-gray-400"
						style={{ color: 'var(--text-tertiary)' }}
					>
						Total of {filteredMembers.length} Team Members
					</span>
				</div>

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
										className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-300"
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
											className="px-6 py-4 text-sm dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{member?.agentId}
										</td>
										<td
											className="px-6 py-4 text-sm dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{member?.fullName}
										</td>
										<td
											className="px-6 py-4 text-sm dark:text-gray-400"
											style={{ color: 'var(--text-tertiary)' }}
										>
											{member.email}
										</td>
										<td
											className="px-6 py-4 text-sm dark:text-gray-400"
											style={{ color: 'var(--text-tertiary)' }}
										>
											{member.phone}
										</td>
										<td
											className="px-6 py-4 text-sm capitalize dark:text-gray-400"
											style={{ color: 'var(--text-tertiary)' }}
										>
											{member.role}
										</td>
										<td
											className="px-6 py-4 text-sm dark:text-gray-400"
											style={{ color: 'var(--text-tertiary)' }}
										>
											{member.supervisor}
										</td>
										<td className="px-6 py-4" style={statusStylesTable(member.status)}>
											<span
												style={statusStyles(member.status)}
											>
												{member.status}
											</span>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
				<div className="p-4 px-6">

					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
						primaryColor={lineOfBusinessData?.primaryColor}
						secondaryColor={lineOfBusinessData?.secondaryColor}
					/>
				</div>
			</div>
		</div>
	);
};

export default TeamMembersPage;
