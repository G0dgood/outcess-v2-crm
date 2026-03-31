'use client';

import React, { useState, useMemo } from 'react';
import { Trophy, Medal, Search, ArrowUp, ArrowDown, User } from 'lucide-react';
import PageHeading from '@/components/ui/PageHeading';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { plusJakartaStyle, NoRecordFound } from '@/components/Options';
import TablePaginationHeader from '@/components/ui/TablePaginationHeader';

interface AgentPerformance {
	id: string;
	name: string;
	avatar?: string;
	points: number;
	calls: number;
	conversions: number;
	rank: number;
	change: 'up' | 'down' | 'neutral';
	changeValue: number;
}

const MOCK_LEADERS: AgentPerformance[] = [
	{ id: '1', name: 'Sarah Jenkins', points: 2850, calls: 450, conversions: 85, rank: 1, change: 'neutral', changeValue: 0 },
	{ id: '2', name: 'Michael Chen', points: 2620, calls: 420, conversions: 78, rank: 2, change: 'up', changeValue: 1 },
	{ id: '3', name: 'Amara Okafor', points: 2480, calls: 390, conversions: 72, rank: 3, change: 'down', changeValue: 1 },
	{ id: '4', name: 'David Smith', points: 2100, calls: 350, conversions: 65, rank: 4, change: 'up', changeValue: 2 },
	{ id: '5', name: 'Elena Rodriguez', points: 1950, calls: 320, conversions: 58, rank: 5, change: 'down', changeValue: 1 },
	{ id: '6', name: 'James Wilson', points: 1800, calls: 300, conversions: 55, rank: 6, change: 'up', changeValue: 1 },
	{ id: '7', name: 'Linda Park', points: 1750, calls: 290, conversions: 52, rank: 7, change: 'neutral', changeValue: 0 },
	{ id: '8', name: 'Robert Taylor', points: 1600, calls: 270, conversions: 48, rank: 8, change: 'down', changeValue: 2 },
];

export default function LeaderboardPage() {
	const { lineOfBusinessData } = useLineOfBusiness();
	const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
	const [searchTerm, setSearchTerm] = useState('');
	const [itemsPerPage, setItemsPerPage] = useState(10);

	const primaryColor = lineOfBusinessData?.primaryColor || '#050711';
	const secondaryColor = lineOfBusinessData?.secondaryColor || '#6C8B7D';

	const filteredLeaders = useMemo(() => {
		return MOCK_LEADERS.filter(agent => 
			agent.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [searchTerm]);

	const topThree = filteredLeaders.slice(0, 3);
	const remainingLeaders = filteredLeaders.slice(3);

	return (
		<div className="space-y-6 pb-10">
			{/* Page Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<PageHeading text="Leaderboard" />
				<div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-1 rounded-[var(--radius)] border border-gray-100 dark:border-gray-700 shadow-sm" style={{ borderColor: 'var(--light-gray)' }}>
					{(['daily', 'weekly', 'monthly'] as const).map((filter) => (
						<button
							key={filter}
							onClick={() => setTimeFilter(filter)}
							className={`px-4 py-1.5 rounded-[calc(var(--radius)/2+2px)] text-[12px] font-medium transition-all duration-200 capitalize ${
								timeFilter === filter 
								? 'text-white shadow-md' 
								: 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
							}`}
							style={timeFilter === filter ? { backgroundColor: primaryColor } : {}}
						>
							{filter}
						</button>
					))}
				</div>
			</div>

			{/* Top 3 Podium */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8 mb-6">
				{/* 2nd Place */}
				<div className="order-2 md:order-1">
					<PodiumCard 
						agent={topThree[1]} 
						rank={2} 
						primaryColor={primaryColor} 
						secondaryColor={secondaryColor}
					/>
				</div>
				
				{/* 1st Place */}
				<div className="order-1 md:order-2 transform md:-translate-y-6 scale-105 md:scale-110 z-10">
					<PodiumCard 
						agent={topThree[0]} 
						rank={1} 
						primaryColor={primaryColor} 
						secondaryColor={secondaryColor}
						isMain
					/>
				</div>

				{/* 3rd Place */}
				<div className="order-3 md:order-3">
					<PodiumCard 
						agent={topThree[2]} 
						rank={3} 
						primaryColor={primaryColor} 
						secondaryColor={secondaryColor}
					/>
				</div>
			</div>

			{/* Custom Style Leaderboard Table */}
			<div className="my-6">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
					<h3 className="text-[14px] font-semibold text-gray-800 dark:text-gray-100" style={{ ...plusJakartaStyle }}>Agent Rankings</h3>
					<div className="relative max-w-sm w-full">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
						<input 
							type="text" 
							placeholder="Search agent name..." 
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 text-[13px] rounded-[var(--radius)] focus:ring-1 placeholder:text-gray-400 outline-none"
							style={{ caretColor: primaryColor, borderColor: 'var(--light-gray)' }}
						/>
					</div>
				</div>

				<div 
					className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden rounded-[var(--radius)]"
					style={{
						backgroundColor: 'var(--accent-white)',
						borderColor: 'var(--light-gray)'
					}}
				>
					<TablePaginationHeader
						totalItems={remainingLeaders.length}
						itemsPerPage={itemsPerPage}
						onItemsPerPageChange={setItemsPerPage}
						label="Agents"
					/>
					
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
									<th
										className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
										style={{ color: 'var(--text-primary)' }}
									>Rank</th>
									<th
										className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
										style={{ color: 'var(--text-primary)' }}
									>Agent</th>
									<th
										className="px-6 py-3 text-center text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
										style={{ color: 'var(--text-primary)' }}
									>Calls</th>
									<th
										className="px-6 py-3 text-center text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
										style={{ color: 'var(--text-primary)' }}
									>Conversions</th>
									<th
										className="px-6 py-3 text-right text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
										style={{ color: 'var(--text-primary)' }}
									>Total Points</th>
									<th
										className="px-6 py-3 text-center text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
										style={{ color: 'var(--text-primary)' }}
									>Trend</th>
								</tr>
							</thead>
							<tbody
								className="dark:bg-gray-800 divide-y dark:divide-gray-700"
								style={{
									backgroundColor: 'var(--accent-white)',
									borderColor: 'var(--light-gray)'
								}}
							>
								{remainingLeaders.length === 0 ? (
									<NoRecordFound colSpan={6} />
								) : (
									remainingLeaders.map((agent) => (
										<tr key={agent.id} 
											className="dark:hover:bg-gray-700 transition-colors"
											style={{ borderColor: 'var(--light-gray)' }}
											onMouseEnter={(e) => {
												e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.backgroundColor = 'var(--accent-white)';
											}}
										>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className="font-bold text-gray-400 dark:text-gray-500 text-[13px]">#{agent.rank}</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center gap-3">
													<div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-100" style={{ borderColor: 'var(--light-gray)' }}>
														<User className="w-4 h-4 text-gray-400" />
													</div>
													<span className="font-medium text-gray-800 dark:text-gray-200 text-[13px]">{agent.name}</span>
												</div>
											</td>
											<td className="px-6 py-4 text-center whitespace-nowrap">
												<span className="text-gray-600 dark:text-gray-400 text-[13px] font-medium">{agent.calls}</span>
											</td>
											<td className="px-6 py-4 text-center whitespace-nowrap">
												<span className="text-gray-600 dark:text-gray-400 text-[13px] font-medium">{agent.conversions}%</span>
											</td>
											<td className="px-6 py-4 text-right whitespace-nowrap">
												<span className="font-bold text-[14px]" style={{ color: primaryColor }}>{agent.points.toLocaleString()}</span>
											</td>
											<td className="px-6 py-4 text-center whitespace-nowrap">
												{agent.change === 'up' && <ArrowUp className="w-4 h-4 text-green-500 mx-auto" />}
												{agent.change === 'down' && <ArrowDown className="w-4 h-4 text-red-500 mx-auto" />}
												{agent.change === 'neutral' && <div className="w-2 h-0.5 bg-gray-300 dark:bg-gray-600 mx-auto rounded-full" />}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}

function PodiumCard({ 
	agent, 
	rank, 
	primaryColor, 
	secondaryColor, 
	isMain = false 
}: { 
	agent?: AgentPerformance; 
	rank: number; 
	primaryColor: string; 
	secondaryColor: string;
	isMain?: boolean;
}) {
	if (!agent) return null;

	const rankIcons = {
		1: <Trophy className="w-6 h-6 text-yellow-500" />,
		2: <Medal className="w-6 h-6 text-slate-400" />,
		3: <Medal className="w-6 h-6 text-amber-700" />,
	};

	const rankBorder = {
		1: 'border-yellow-200 dark:border-yellow-900/30',
		2: 'border-slate-200 dark:border-slate-900/30',
		3: 'border-amber-200 dark:border-amber-900/30',
	};

	return (
		<div className={`relative flex flex-col items-center p-8 border rounded-[var(--radius)] bg-white dark:bg-gray-900 transition-all duration-300 hover:shadow-xl ${rankBorder[rank as keyof typeof rankBorder]} ${isMain ? 'shadow-2xl' : 'shadow-lg'}`} style={{ backgroundColor: 'var(--accent-white)', borderColor: 'var(--light-gray)' }}>
			<div className={`absolute -top-5 w-10 h-10 rounded-full flex items-center justify-center shadow-lg bg-white dark:bg-gray-800 border ${rankBorder[rank as keyof typeof rankBorder]}`}>
				{rankIcons[rank as keyof typeof rankIcons]}
			</div>

			<div className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-6 border-4 shadow-inner ${rankBorder[rank as keyof typeof rankBorder]}`}>
				<div className="w-full h-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
					<User className="w-10 h-10 text-gray-300" />
				</div>
			</div>

			<h3 className="font-bold text-center mb-1 dark:text-gray-100" style={{ ...plusJakartaStyle, fontSize: isMain ? '18px' : '16px', color: 'var(--text-primary)' }}>{agent.name}</h3>
			<p className="text-[12px] text-gray-500 dark:text-gray-400 mb-4 font-medium" style={{ color: 'var(--text-tertiary)' }}>@{agent.name.split(' ')[0].toLowerCase()}</p>

			<div className="w-full grid grid-cols-2 gap-4 mt-2">
				<div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50" style={{ backgroundColor: 'var(--bg-primary)' }}>
					<p className="text-[10px] text-gray-400 uppercase font-semibold" style={{ color: 'var(--text-tertiary)' }}>Calls</p>
					<p className="text-[14px] font-bold text-gray-700 dark:text-gray-200" style={{ color: 'var(--text-primary)' }}>{agent.calls}</p>
				</div>
				<div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50" style={{ backgroundColor: 'var(--bg-primary)' }}>
					<p className="text-[10px] text-gray-400 uppercase font-semibold" style={{ color: 'var(--text-tertiary)' }}>Conversions</p>
					<p className="text-[14px] font-bold text-gray-700 dark:text-gray-200" style={{ color: 'var(--text-primary)' }}>{agent.conversions}%</p>
				</div>
			</div>

			<div className="mt-6 pt-4 border-t w-full text-center" style={{ borderColor: 'var(--light-gray)' }}>
				<p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Total Points</p>
				<p className="text-[24px] font-black" style={{ color: primaryColor }}>{agent.points.toLocaleString()}</p>
			</div>

			{agent.change !== 'neutral' && (
				<div className={`absolute top-4 right-4 flex items-center gap-1 text-[11px] font-bold ${agent.change === 'up' ? 'text-green-500' : 'text-red-500'}`}>
					{agent.change === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
					{agent.changeValue}
				</div>
			)}
		</div>
	);
}
