'use client';

import React, { useState, useMemo } from 'react';
import { Trophy, Medal, Search, ArrowUp, ArrowDown, User, Settings, X } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeading from '@/components/ui/PageHeading';
import { useCampaign } from '@/contexts/CampaignContext';
import { plusJakartaStyle, NoRecordFound } from '@/components/Options';
import TablePaginationHeader from '@/components/ui/TablePaginationHeader';
import { useGetLeaderboardQuery } from '@/store/services/dispositionApi';
import { useUpdateCampaignMutation } from '@/store/services/campaignApi';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import Dropdown from '@/components/ui/Dropdown';
import { toast } from 'sonner';

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
	metrics?: Record<string, number>;
}

export default function LeaderboardPage() {
	const { campaignData } = useCampaign();
	const { isAdmin } = usePrivilege();
	const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
	const [searchTerm, setSearchTerm] = useState('');
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [isTargetsModalOpen, setIsTargetsModalOpen] = useState(false);

	const [rankingMetric, setRankingMetric] = useState<string>('points');
	const [updateCampaign] = useUpdateCampaignMutation();

	const campaignId = campaignData?.campaign?._id || campaignData?.campaign?.id || campaignData?._id || '';

	const { data: leaderboardResponse, isLoading: isLeaderboardLoading } = useGetLeaderboardQuery(
		{ campaignId, timeFilter },
		{ skip: !campaignId }
	);

	// Buckets from campaign settings
	const buckets: Array<{ id: string; name: string; color?: string; leaderboardTargets?: { daily: number; weekly: number; monthly: number } }> =
		campaignData?.campaign?.dashboardSettings?.buckets || [];

	// Selected bucket for target display (default to first bucket if available)
	const [selectedBucketId, setSelectedBucketId] = useState<string>('');
	const effectiveBucketId = selectedBucketId || buckets[0]?.id || '';

	// Retrieve targets from API response or campaign data — prefer per-bucket
	const globalTargets = leaderboardResponse?.leaderboardTargets || campaignData?.campaign?.dashboardSettings?.leaderboardTargets || { daily: 50, weekly: 250, monthly: 1000 };
	const bucketTargetsMap: Record<string, { daily: number; weekly: number; monthly: number }> = leaderboardResponse?.bucketTargets || {};

	const targets = effectiveBucketId && bucketTargetsMap[effectiveBucketId]
		? bucketTargetsMap[effectiveBucketId]
		: globalTargets;

	const activeTarget = timeFilter === 'daily' ? targets.daily : timeFilter === 'weekly' ? targets.weekly : targets.monthly;
	const selectedBucket = buckets.find(b => b.id === effectiveBucketId);

	const primaryColor = campaignData?.primaryColor || '#050711';
	const secondaryColor = campaignData?.secondaryColor || '#6C8B7D';

	// Build dynamic metric options matching Add New Chart settings
	const dataSourceOptions = useMemo(() => {
		const optionsMap = new Map<string, { value: string; label: string }>();
		optionsMap.set('points', { value: 'points', label: 'Points' });
		optionsMap.set('calls', { value: 'calls', label: 'Calls' });
		optionsMap.set('conversions', { value: 'conversions', label: 'Conversions' });

		const dashboardSettings = campaignData?.campaign?.dashboardSettings;

		// Add disposition categories if available (direct and bucketed)
		const allDispositions: Array<{ name: string; color?: string }> = [...(dashboardSettings?.dispositions || [])];
		if (dashboardSettings?.buckets && Array.isArray(dashboardSettings.buckets)) {
			dashboardSettings.buckets.forEach((bucket: { dispositions?: Array<{ name: string; color?: string }> }) => {
				if (bucket && Array.isArray(bucket.dispositions)) {
					bucket.dispositions.forEach((disp: { name: string; color?: string }) => {
						if (disp && disp.name && !allDispositions.some(d => d.name === disp.name)) {
							allDispositions.push(disp);
						}
					});
				}
			});
		}

		if (allDispositions.length > 0) {
			allDispositions.forEach((disposition: { name: string }) => {
				if (disposition?.name) {
					optionsMap.set(disposition.name, { value: disposition.name, label: disposition.name });
				}
			});
		}

		// Add call outcomes if available
		if (dashboardSettings?.callOutcomes && dashboardSettings.callOutcomes.length > 0) {
			dashboardSettings.callOutcomes.forEach((outcome: { name: string }) => {
				if (outcome?.name) {
					optionsMap.set(outcome.name, { value: outcome.name, label: outcome.name });
				}
			});
		}

		return Array.from(optionsMap.values());
	}, [campaignData]);

	const rankingMetricLabel = useMemo(() => {
		return dataSourceOptions.find(opt => opt.value === rankingMetric)?.label || rankingMetric;
	}, [dataSourceOptions, rankingMetric]);

	const rankedLeaders = useMemo(() => {
		const rawLeaders = leaderboardResponse?.leaderboard || [];

		const sorted = [...rawLeaders].sort((a: any, b: any) => {
			const valA = a.metrics?.[rankingMetric] ?? a[rankingMetric] ?? 0;
			const valB = b.metrics?.[rankingMetric] ?? b[rankingMetric] ?? 0;

			if (valB !== valA) return valB - valA;

			// Tie breaker 1: Points
			const pointsA = a.metrics?.['points'] ?? a.points ?? 0;
			const pointsB = b.metrics?.['points'] ?? b.points ?? 0;
			if (pointsB !== pointsA) return pointsB - pointsA;

			// Tie breaker 2: Calls
			const callsA = a.metrics?.['calls'] ?? a.calls ?? 0;
			const callsB = b.metrics?.['calls'] ?? b.calls ?? 0;
			return callsB - callsA;
		});

		return sorted.map((p: any, index: number) => ({
			...p,
			rank: index + 1
		}));
	}, [leaderboardResponse, rankingMetric]);

	const filteredLeaders = useMemo(() => {
		return rankedLeaders.filter((agent: AgentPerformance) =>
			agent.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [rankedLeaders, searchTerm]);

	const topThree = filteredLeaders.slice(0, 3);
	const remainingLeaders = filteredLeaders.slice(3);

	if (isLeaderboardLoading) {
		return (
			<div className="space-y-6 pb-10">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<PageHeading text="Leaderboard" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8 mb-6">
					<div className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-[var(--radius)]" />
					<div className="h-72 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-[var(--radius)]" />
					<div className="h-60 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-[var(--radius)]" />
				</div>
				<div className="space-y-2">
					<div className="h-8 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-[var(--radius)]" />
					<div className="h-40 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-[var(--radius)]" />
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6 pb-10">
			{/* Page Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<PageHeading text="Leaderboard" />
					<p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
						{selectedBucket ? (
							<>
								<span
									className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
									style={{ backgroundColor: selectedBucket.color || primaryColor }}
								/>
								{selectedBucket.name} Target:
							</>
						) : 'Current Target:'}{' '}
						<span className="font-bold text-gray-800 dark:text-gray-200">{activeTarget} Calls</span> ({timeFilter} target)
					</p>
				</div>
				<div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
					{isAdmin && (
						<button
							onClick={() => setIsTargetsModalOpen(true)}
							className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-[12px] font-medium rounded-[var(--radius)] border border-gray-200 dark:border-gray-700 shadow-sm transition-all"
							style={{ borderColor: 'var(--light-gray)' }}
						>
							<Settings className="w-3.5 h-3.5" />
							Set Targets
						</button>
					)}
					{/* Bucket Selector */}
					{buckets.length > 0 && (
						<div className="w-44">
							<Dropdown
								label=""
								placeholder="All Buckets"
								options={buckets.map(b => ({ value: b.id, label: b.name }))}
								value={effectiveBucketId}
								onChange={(val) => setSelectedBucketId(val as string)}
							/>
						</div>
					)}
					<div className="w-56">
						<Dropdown
							label=""
							placeholder="Rank By"
							options={dataSourceOptions}
							value={rankingMetric}
							onChange={(value) => setRankingMetric(value as string)}
						/>
					</div>
					<div className="relative flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-[var(--radius)] border border-gray-100 dark:border-gray-700 shadow-sm" style={{ borderColor: 'var(--light-gray)' }}>
						{(['daily', 'weekly', 'monthly'] as const).map((filter) => (
							<button
								key={filter}
								onClick={() => setTimeFilter(filter)}
								className={`relative px-4 py-1.5 rounded-[calc(var(--radius)/2+2px)] text-[12px] font-medium transition-colors duration-200 capitalize z-10 ${timeFilter === filter
									? 'text-white'
									: 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
									}`}
							>
								{timeFilter === filter && (
									<motion.div
										layoutId="activeLeaderboardTimeFilter"
										className="absolute inset-0 rounded-[calc(var(--radius)/2+2px)] -z-10 shadow-sm"
										style={{ backgroundColor: primaryColor }}
										transition={{ type: "spring", stiffness: 380, damping: 30 }}
									/>
								)}
								{filter}
							</button>
						))}
					</div>
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
						rankingMetric={rankingMetric}
						rankingMetricLabel={rankingMetricLabel}
						activeTarget={activeTarget}
					/>
				</div>

				{/* 1st Place */}
				<div className="order-1 md:order-2 transform md:-translate-y-6 scale-105 md:scale-110 z-10">
					<PodiumCard
						agent={topThree[0]}
						rank={1}
						primaryColor={primaryColor}
						secondaryColor={secondaryColor}
						rankingMetric={rankingMetric}
						rankingMetricLabel={rankingMetricLabel}
						activeTarget={activeTarget}
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
						rankingMetric={rankingMetric}
						rankingMetricLabel={rankingMetricLabel}
						activeTarget={activeTarget}
					/>
				</div>
			</div>

			{/* Custom Style Leaderboard Table */}
			<div className="my-6">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
					<h3 className="text-[14px] font-semibold text-gray-800 dark:text-gray-100" style={{ ...plusJakartaStyle }}> Rankings Table</h3>
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
						totalItems={filteredLeaders.length}
						itemsPerPage={itemsPerPage}
						onItemsPerPageChange={setItemsPerPage}
						label="Agents"
					/>

					{(() => {
						const isCustomMetric = !['points', 'calls', 'conversions'].includes(rankingMetric);
						return (
							<div className="overflow-x-auto">
								<table
									className="min-w-full divide-y dark:divide-gray-700"
									style={{ borderColor: 'var(--light-gray)' }}
								>
									<thead>
										<tr>
											<th>Rank</th>
											<th>Agent</th>
											<th>Calls Target Progress</th>
											<th>Conversions</th>
											<th>Total Points</th>
											{isCustomMetric && <th>{rankingMetricLabel}</th>}
											<th>Trend</th>
										</tr>
									</thead>
									<tbody
										className="dark:bg-gray-800 divide-y dark:divide-gray-700"
										style={{
											borderColor: 'var(--light-gray)'
										}}
									>
										{filteredLeaders.length === 0 ? (
											<NoRecordFound colSpan={isCustomMetric ? 7 : 6} />
										) : (
											filteredLeaders.map((agent: AgentPerformance) => (
												<tr key={agent.id}
													className="transition-colors"
													style={{ borderColor: 'var(--light-gray)' }}
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
													<td className="px-6 py-4 text-left whitespace-nowrap">
														<div className="flex flex-col min-w-[120px]">
															<span className={`text-[13px] font-medium ${rankingMetric === 'calls' ? 'text-gray-800 dark:text-gray-100 font-bold' : 'text-gray-600 dark:text-gray-400'}`}>
																{agent.calls} <span className="text-gray-400 text-[11px] font-normal">/ {activeTarget}</span>
															</span>
															{/* Target Progress Bar */}
															<div className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-full mt-1.5 overflow-hidden">
																<div
																	className="h-full rounded-full transition-all duration-300"
																	style={{
																		width: `${Math.min(100, (agent.calls / activeTarget) * 100)}%`,
																		backgroundColor: Math.round((agent.calls / activeTarget) * 100) >= 100 ? '#10B981' : primaryColor
																	}}
																/>
															</div>
														</div>
													</td>
													<td className="px-6 py-4 text-left whitespace-nowrap">
														<span className={`text-[13px] font-medium ${rankingMetric === 'conversions' ? 'text-gray-800 dark:text-gray-100 font-bold' : 'text-gray-600 dark:text-gray-400'}`}>{agent.conversions}%</span>
													</td>
													<td className="px-6 py-4 text-left whitespace-nowrap">
														<span className="font-bold text-[14px]" style={{ color: rankingMetric === 'points' ? primaryColor : 'inherit' }}>{agent.points.toLocaleString()}</span>
													</td>
													{isCustomMetric && (
														<td className="px-6 py-4 text-left whitespace-nowrap">
															<span className="font-bold text-[14px]" style={{ color: secondaryColor }}>
																{(agent.metrics?.[rankingMetric] ?? 0).toLocaleString()}
															</span>
														</td>
													)}
													<td className="px-6 py-4 text-left whitespace-nowrap">
														<div className="flex items-center">
															{agent.change === 'up' && <ArrowUp className="w-4 h-4 text-green-500" />}
															{agent.change === 'down' && <ArrowDown className="w-4 h-4 text-red-500" />}
															{agent.change === 'neutral' && <div className="w-2 h-0.5 bg-gray-300 dark:bg-gray-600 rounded-full" />}
														</div>
													</td>
												</tr>
											))
										)}
									</tbody>
								</table>
							</div>
						);
					})()}
				</div>
			</div>

			{/* Targets Modal */}
			<TargetsModal
				isOpen={isTargetsModalOpen}
				onClose={() => setIsTargetsModalOpen(false)}
				buckets={buckets}
				initialBucketTargets={bucketTargetsMap}
				globalTargets={globalTargets}
				onSave={async (bucketId, newTargets) => {
					try {
						const updatedBuckets = buckets.map(b =>
							b.id === bucketId
								? { ...b, leaderboardTargets: newTargets }
								: b
						);
						await updateCampaign({
							id: campaignId,
							data: {
								dashboardSettings: {
									...campaignData?.campaign?.dashboardSettings,
									buckets: updatedBuckets,
								}
							}
						}).unwrap();
						toast.success('Bucket targets updated successfully');
					} catch (error: any) {
						toast.error(error?.data?.message || 'Failed to save bucket targets');
					}
				}}
				primaryColor={primaryColor}
			/>
		</div>
	);
}

function PodiumCard({
	agent,
	rank,
	primaryColor,
	secondaryColor,
	rankingMetric,
	rankingMetricLabel,
	activeTarget,
	isMain = false
}: {
	agent?: AgentPerformance;
	rank: number;
	primaryColor: string;
	secondaryColor: string;
	rankingMetric: string;
	rankingMetricLabel: string;
	activeTarget: number;
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

	const displayVal = agent.metrics?.[rankingMetric] ?? (agent as any)[rankingMetric] ?? 0;

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

			{/* Call Target Progress */}
			<div className="w-full mt-4">
				<div className="flex justify-between items-center text-[10px] mb-1 font-semibold" style={{ color: 'var(--text-tertiary)' }}>
					<span>Call Target Progress</span>
					<span>{Math.min(100, Math.round((agent.calls / activeTarget) * 100))}%</span>
				</div>
				<div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
					<div
						className="h-full rounded-full transition-all duration-500"
						style={{
							width: `${Math.min(100, (agent.calls / activeTarget) * 100)}%`,
							backgroundColor: Math.round((agent.calls / activeTarget) * 100) >= 100 ? '#10B981' : secondaryColor
						}}
					/>
				</div>
				<p className="text-[9px] text-gray-400 dark:text-gray-500 mt-1 text-right font-medium">
					{agent.calls} / {activeTarget} calls
				</p>
			</div>

			<div className="mt-6 pt-4 border-t w-full text-center" style={{ borderColor: 'var(--light-gray)' }}>
				<p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>{rankingMetricLabel}</p>
				<p className="text-[24px] font-black" style={{ color: primaryColor }}>
					{displayVal.toLocaleString()}
					{rankingMetric === 'conversions' ? '%' : ''}
				</p>
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

interface TargetsModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (bucketId: string, targets: { daily: number; weekly: number; monthly: number }) => Promise<void>;
	buckets: Array<{ id: string; name: string; color?: string }>;
	initialBucketTargets: Record<string, { daily: number; weekly: number; monthly: number }>;
	globalTargets: { daily: number; weekly: number; monthly: number };
	primaryColor: string;
}

function TargetsModal({ isOpen, onClose, onSave, buckets, initialBucketTargets, globalTargets, primaryColor }: TargetsModalProps) {
	const [selectedBucketId, setSelectedBucketId] = useState<string>(buckets[0]?.id || '');
	const [isSaving, setIsSaving] = useState(false);

	const currentBucketTargets = initialBucketTargets[selectedBucketId] || globalTargets;
	const [daily, setDaily] = useState(currentBucketTargets.daily);
	const [weekly, setWeekly] = useState(currentBucketTargets.weekly);
	const [monthly, setMonthly] = useState(currentBucketTargets.monthly);

	// When selected bucket changes, load its existing targets
	React.useEffect(() => {
		const t = initialBucketTargets[selectedBucketId] || globalTargets;
		setDaily(t.daily);
		setWeekly(t.weekly);
		setMonthly(t.monthly);
	}, [selectedBucketId, initialBucketTargets, globalTargets]);

	// Reset when modal opens
	React.useEffect(() => {
		if (isOpen) {
			const defaultBucketId = buckets[0]?.id || '';
			setSelectedBucketId(defaultBucketId);
			const t = initialBucketTargets[defaultBucketId] || globalTargets;
			setDaily(t.daily);
			setWeekly(t.weekly);
			setMonthly(t.monthly);
		}
	}, [isOpen]);

	if (!isOpen) return null;

	const selectedBucket = buckets.find(b => b.id === selectedBucketId);

	const handleSave = async () => {
		if (!selectedBucketId) return;
		setIsSaving(true);
		try {
			await onSave(selectedBucketId, { daily, weekly, monthly });
			onClose();
		} catch (error) {
			console.error(error);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div
			className="fixed inset-0 bg-[#0b0d1293]/50 dark:bg-black/50 flex items-center justify-center z-50"
			onClick={onClose}
		>
			<div
				className="dark:bg-gray-800 w-full max-w-sm mx-4 rounded-[var(--radius)] shadow-2xl border dark:border-gray-700"
				style={{ backgroundColor: 'var(--accent-white)', borderColor: 'var(--light-gray)' }}
				onClick={(e) => e.stopPropagation()}
			>
				<div
					className="flex justify-between items-center p-5 border-b dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<h3
						className="text-[14px] font-semibold dark:text-gray-100"
						style={{ color: 'var(--text-primary)', ...plusJakartaStyle }}
					>
						Set Bucket Call Targets
					</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>
				<div className="p-5 space-y-4">
					{/* Bucket Selector */}
					{buckets.length > 0 ? (
						<div>
							<label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
								Select Bucket
							</label>
							<div className="flex flex-wrap gap-2">
								{buckets.map(bucket => (
									<button
										key={bucket.id}
										onClick={() => setSelectedBucketId(bucket.id)}
										className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-[calc(var(--radius)/1.5)] font-medium border transition-all ${selectedBucketId === bucket.id
												? 'text-white border-transparent shadow-sm'
												: 'text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300'
											}`}
										style={selectedBucketId === bucket.id ? { backgroundColor: bucket.color || primaryColor, borderColor: bucket.color || primaryColor } : { borderColor: 'var(--light-gray)' }}
									>
										<span
											className="w-2 h-2 rounded-full flex-shrink-0"
											style={{ backgroundColor: selectedBucketId === bucket.id ? 'rgba(255,255,255,0.7)' : (bucket.color || primaryColor) }}
										/>
										{bucket.name}
									</button>
								))}
							</div>
						</div>
					) : (
						<p className="text-[12px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-[var(--radius)] p-3">
							No buckets configured. Create buckets in Data Sources settings first.
						</p>
					)}

					{selectedBucket && (
						<>
							<div className="pt-1 pb-0.5 border-t" style={{ borderColor: 'var(--light-gray)' }}>
								<p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">Targets for <strong className="text-gray-700 dark:text-gray-300">{selectedBucket.name}</strong></p>
							</div>
							<div>
								<label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
									Daily Target (Calls)
								</label>
								<input
									type="number"
									value={daily}
									onChange={(e) => setDaily(Math.max(0, parseInt(e.target.value) || 0))}
									className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 text-[13px] rounded-[var(--radius)] outline-none"
									style={{ borderColor: 'var(--light-gray)', caretColor: primaryColor }}
								/>
							</div>
							<div>
								<label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
									Weekly Target (Calls)
								</label>
								<input
									type="number"
									value={weekly}
									onChange={(e) => setWeekly(Math.max(0, parseInt(e.target.value) || 0))}
									className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 text-[13px] rounded-[var(--radius)] outline-none"
									style={{ borderColor: 'var(--light-gray)', caretColor: primaryColor }}
								/>
							</div>
							<div>
								<label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
									Monthly Target (Calls)
								</label>
								<input
									type="number"
									value={monthly}
									onChange={(e) => setMonthly(Math.max(0, parseInt(e.target.value) || 0))}
									className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 text-[13px] rounded-[var(--radius)] outline-none"
									style={{ borderColor: 'var(--light-gray)', caretColor: primaryColor }}
								/>
							</div>
						</>
					)}
				</div>
				<div
					className="flex justify-end gap-3 p-5 border-t dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 rounded-b-[var(--radius)]"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<button
						onClick={onClose}
						className="px-4 py-2 text-[12px] font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={handleSave}
						disabled={isSaving || !selectedBucketId}
						className="px-4 py-2 text-[12px] font-medium text-white rounded-[var(--radius)] shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
						style={{ backgroundColor: primaryColor }}
					>
						{isSaving ? 'Saving...' : 'Save Targets'}
					</button>
				</div>
			</div>
		</div>
	);
}
