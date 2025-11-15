'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Search from '@/components/ui/Search';
import Dropdown from '@/components/ui/Dropdown';
import Pagination from '@/components/ui/Pagination';
import PaginationSummary from '@/components/ui/PaginationSummary';
import { useSetup } from '@/contexts/SetupContext';

interface TeamMember {
	agentId: string;
	fullName: string;
	email: string;
	phone: string;
	role: 'agent' | 'supervisor' | 'qa' | 'admin';
	supervisor: string;
	status: 'Logged In' | 'Logged Out';
	team: string;
}

const teamMembersData: TeamMember[] = [
	{ agentId: 'agent.10167', fullName: 'Chinwe Felicia, Ugwumba', email: 'chinwe@outcess.com', phone: '0809', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged In', team: 'QA' },
	{ agentId: 'agent.10234', fullName: 'George Atuk Atuk , George', email: 'george.atck@outcess.com', phone: 'admin.01', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged In', team: 'QA' },
	{ agentId: '10398', fullName: 'Emmanuel , Omonigho', email: 'emmanuelomonigho@outcess.com', phone: 'admin.01', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged Out', team: 'Sales' },
	{ agentId: '10399', fullName: 'Ugochuwu , Asuzu', email: 'ugochuwuasuzu@outcess.com', phone: 'admin.01', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged Out', team: 'Sales' },
	{ agentId: 'agent.10398', fullName: 'Emmanuel , Omonigho', email: 'emmanuelo@outcess.com', phone: 'admin.01', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged In', team: 'Support' },
	{ agentId: 'agent.10541', fullName: 'Amarachi , Okoro', email: 'amarachi.okoro@outcess.com', phone: 'admin.01', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged In', team: 'Support' },
	{ agentId: 'agent.10542', fullName: 'Victoria , Falade', email: 'jadesola.ayeni@outcess.com', phone: 'admin.01', role: 'qa', supervisor: 'Motunrayo Adelanwaa', status: 'Logged In', team: 'QA' },
	{ agentId: 'agent.10572', fullName: 'Mariam Opeyemi, Balogun', email: 'mariambalogun@outcess.com', phone: 'admin.01', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged Out', team: 'Support' },
	{ agentId: 'agent.10573', fullName: 'Elizabeth Fikayo, Babalola', email: 'elizabethbabalola@outcess.com', phone: 'admin.01', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged In', team: 'Support' },
	{ agentId: 'agent10399', fullName: 'Ugochukwu , Asuzuu', email: 'ugochukwu.asuzuu@outcess.com', phone: 'admin.01', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged In', team: 'Sales' },
	// Additional sample members to simulate a larger dataset
	{ agentId: 'agent.10574', fullName: 'Samuel Adeola, Ajayi', email: 'samuelajayi@outcess.com', phone: '0802', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged In', team: 'QA' },
	{ agentId: 'agent.10575', fullName: 'Omotola , Adeyemi', email: 'omotolaadeyemi@outcess.com', phone: '0803', role: 'qa', supervisor: 'Motunrayo Adelanwaa', status: 'Logged Out', team: 'QA' },
	{ agentId: 'agent.10576', fullName: 'John , Akintola', email: 'johnakintola@outcess.com', phone: '0804', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged In', team: 'Support' },
	{ agentId: 'agent.10577', fullName: 'Helen , Daniels', email: 'helendaniels@outcess.com', phone: '0805', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged Out', team: 'Sales' },
	{ agentId: 'agent.10578', fullName: 'Chidera , Eze', email: 'chideraeze@outcess.com', phone: '0806', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged In', team: 'QA' },
	{ agentId: 'agent.10579', fullName: 'Tolulope , Lawal', email: 'tolulope.lawal@outcess.com', phone: '0807', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged Out', team: 'QA' },
	{ agentId: 'agent.10580', fullName: 'Biola , Martins', email: 'biolamartins@outcess.com', phone: '0808', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged In', team: 'Support' },
	{ agentId: 'agent.10581', fullName: 'Adaobi , Nwosu', email: 'adaobinwosu@outcess.com', phone: '0809', role: 'qa', supervisor: 'Motunrayo Adelanwaa', status: 'Logged In', team: 'QA' },
	{ agentId: 'agent.10582', fullName: 'Olumide , Ogundipe', email: 'olumideogundipe@outcess.com', phone: '0810', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged Out', team: 'Support' },
	{ agentId: 'agent.10583', fullName: 'Blessing , Onuoha', email: 'blessingonuoha@outcess.com', phone: '0811', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged In', team: 'Sales' },
	{ agentId: 'agent.10584', fullName: 'Funke , Ojo', email: 'funkeojo@outcess.com', phone: '0812', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged In', team: 'QA' },
	{ agentId: 'agent.10585', fullName: 'Victor , Okafor', email: 'victorokafor@outcess.com', phone: '0813', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged Out', team: 'Sales' },
	{ agentId: 'agent.10586', fullName: 'Ifeoma , Obi', email: 'ifeomaobi@outcess.com', phone: '0814', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged In', team: 'Support' },
	{ agentId: 'agent.10587', fullName: 'Feyi , Oyinlola', email: 'feyioyinlola@outcess.com', phone: '0815', role: 'qa', supervisor: 'Motunrayo Adelanwaa', status: 'Logged Out', team: 'QA' },
	{ agentId: 'agent.10588', fullName: 'Joseph , Peters', email: 'josephpeters@outcess.com', phone: '0816', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged In', team: 'Sales' },
	{ agentId: 'agent.10589', fullName: 'Ngozi , Simon', email: 'ngozisimon@outcess.com', phone: '0817', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged Out', team: 'Support' },
	{ agentId: 'agent.10590', fullName: 'Hadiza , Sule', email: 'hadizasule@outcess.com', phone: '0818', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged In', team: 'Support' },
	{ agentId: 'agent.10591', fullName: 'Opeyemi , Taiwo', email: 'opeyemitaiwo@outcess.com', phone: '0819', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged Out', team: 'QA' },
	{ agentId: 'agent.10592', fullName: 'Obinna , Uche', email: 'obinnauche@outcess.com', phone: '0820', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged In', team: 'Support' },
	{ agentId: 'agent.10593', fullName: 'Kemi , Williams', email: 'kemiwilliams@outcess.com', phone: '0821', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged Out', team: 'Sales' },
	{ agentId: 'agent.10594', fullName: 'Ibrahim , Yakubu', email: 'ibrahimyakubu@outcess.com', phone: '0822', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged In', team: 'QA' },
	{ agentId: 'agent.10595', fullName: 'Yewande , Yusuf', email: 'yewandeyusuf@outcess.com', phone: '0823', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged Out', team: 'Support' },
	{ agentId: 'agent.10596', fullName: 'Bolu , Adebayo', email: 'boluadebayo@outcess.com', phone: '0824', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged In', team: 'Support' },
	{ agentId: 'agent.10597', fullName: 'Shade , Adekunle', email: 'shadeadekunle@outcess.com', phone: '0825', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged Out', team: 'QA' },
	{ agentId: 'agent.10598', fullName: 'Oladimeji , Akin', email: 'oladimejiakin@outcess.com', phone: '0826', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged In', team: 'Sales' },
	{ agentId: 'agent.10599', fullName: 'Halima , Bello', email: 'halimabello@outcess.com', phone: '0827', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged Out', team: 'QA' },
	{ agentId: 'agent.10600', fullName: 'Temi , Fakeye', email: 'temifakeye@outcess.com', phone: '0828', role: 'agent', supervisor: 'Motunrayo Adelanwaa', status: 'Logged In', team: 'Support' },
];

const TeamMembersPage: React.FC = () => {
	const { setupData } = useSetup();
	const [searchTerm, setSearchTerm] = useState('');
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [currentPage, setCurrentPage] = useState(1);
	const [supervisorFilter, setSupervisorFilter] = useState('all');
	const [teamFilter, setTeamFilter] = useState('all');

	const supervisors = useMemo(() => {
		const unique = new Set(teamMembersData.map(member => member.supervisor));
		return ['all', ...Array.from(unique)];
	}, []);

	const teams = useMemo(() => {
		const unique = new Set(teamMembersData.map(member => member.team));
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
			const matchesTeam = teamFilter === 'all' || member.team === teamFilter;

			return matchesSearch && matchesSupervisor && matchesTeam;
		});
	}, [searchTerm, supervisorFilter, teamFilter]);

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
						onChange={setSupervisorFilter}
						inputClassName="h-10 whitespace-nowrap"
					/>
					<Dropdown
						label="Team"
						options={teams.map(value => ({
							value,
							label: value === 'all' ? 'All Teams' : value,
						}))}
						value={teamFilter}
						onChange={setTeamFilter}
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
								{['Agent ID', 'Full Name', 'Email', 'Phone No', 'Role', 'Supervisor', 'Logged In Status'].map((heading) => (
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
							{currentMembers.length === 0 ? (
								<tr>
									<td
										colSpan={7}
										className="px-6 py-12 text-center text-sm dark:text-gray-400"
										style={{ color: 'var(--text-tertiary)' }}
									>
										No team members match your filters.
									</td>
								</tr>
							) : (
								currentMembers.map((member, index) => (
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
											className="px-6 py-4 text-sm font-medium dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{member.agentId}
										</td>
										<td
											className="px-6 py-4 text-sm dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{member.fullName}
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
												// className="inline-flex items-center  text-xs font-semibold rounded-full"
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
						primaryColor={setupData.primaryColor}
						secondaryColor={setupData.secondaryColor}
					/>
				</div>
			</div>
		</div>
	);
};

export default TeamMembersPage;

