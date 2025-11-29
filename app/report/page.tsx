'use client';

import React, { useState, useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import Icon from '@/components/ui/Icon';
import Pagination from '@/components/ui/Pagination';
import DateFilter from '@/components/ui/DateFilter';
import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import { useSetup } from '@/contexts/SetupContext';
import PageHeading from '@/components/ui/PageHeading';

interface ReportData {
	id: string;
	agentName: string;
	agentId: string;
	date: string;
	[key: string]: any; // For dynamic fields
}

const ReportPage: React.FC = () => {
	const { setupData } = useSetup();
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const filterButtonRef = useRef<HTMLDivElement>(null);
	const [reportData] = useState<ReportData[]>([
		{ id: '1', agentName: 'Sarah Johnson', agentId: 'AGT-001', date: '2024-01-15' },
		{ id: '2', agentName: 'Michael Chen', agentId: 'AGT-002', date: '2024-01-16' },
		{ id: '3', agentName: 'Emily Davis', agentId: 'AGT-003', date: '2024-01-17' },
		{ id: '4', agentName: 'James Wilson', agentId: 'AGT-004', date: '2024-01-18' },
		{ id: '5', agentName: 'Lisa Martinez', agentId: 'AGT-005', date: '2024-01-19' },
		{ id: '6', agentName: 'Robert Taylor', agentId: 'AGT-006', date: '2024-01-20' },
	]);

	// Close filter dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (filterButtonRef.current && !filterButtonRef.current.contains(event.target as Node)) {
				setIsFilterOpen(false);
			}
		};

		if (isFilterOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isFilterOpen]);

	const handleDownload = () => {
		console.log('Download clicked');
		// Implement download functionality
		// This could export data as CSV, PDF, or Excel
	};

	const handleFilter = () => {
		setIsFilterOpen(!isFilterOpen);
	};

	const handleFilterApply = (filter: {
		type: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'all' | 'dateRange';
		from?: string;
		to?: string;
	}) => {
		console.log('Filter applied:', filter);
		// Implement filter logic here
		setIsFilterOpen(false);
	};

	const filteredReports = reportData.filter(report => {
		if (!searchTerm) return true;
		const searchLower = searchTerm.toLowerCase();
		return (
			report.agentName.toLowerCase().includes(searchLower) ||
			report.agentId.toLowerCase().includes(searchLower) ||
			report.date.toLowerCase().includes(searchLower)
		);
	});

	const totalPages = Math.ceil(filteredReports.length / 10);
	const startIndex = (currentPage - 1) * 10;
	const paginatedReports = filteredReports.slice(startIndex, startIndex + 10);

	return (
		<div>
			{/* Title and Action Buttons */}

			<PageHeading
				text="Report"
			/>

			{/* Search and Actions */}
			<div className="my-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
					<div ref={filterButtonRef} className="relative">
						<button
							type="button"
							onClick={handleFilter}
							className="inline-flex items-center justify-center font-inter font-semibold transition-all duration-200 px-2 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm dark:bg-gray-800 border dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 dark:focus:ring-gray-400 cursor-pointer gap-2 whitespace-nowrap"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)',
								color: 'var(--text-secondary)'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
								e.currentTarget.style.color = 'var(--text-secondary)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = 'var(--accent-white)';
								e.currentTarget.style.color = 'var(--text-secondary)';
							}}
						>
							<MixerHorizontalIcon className="w-4 h-4" />
							Filter Report
						</button>
						{isFilterOpen && (
							<div className="absolute top-full left-0 mt-2 z-50">
								<DateFilter
									onApply={handleFilterApply}
									onClose={() => setIsFilterOpen(false)}
								/>
							</div>
						)}
					</div>
					<Button
						variant="primary"
						size="md"
						onClick={handleDownload}
						className="flex items-center gap-2 px-2 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm"
					>
						Download
					</Button>
				</div>
			</div>

			{/* Report Table */}
			<div
				className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
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
									className="dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									Agent Name
								</th>
								<th
									className="dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									Agent ID
								</th>
								<th
									className="dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									Date
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
							{filteredReports.length === 0 ? (
								<tr>
									<td colSpan={3} className="px-6 py-12 text-center">
										<div className="flex flex-col items-center justify-center">
											<div className="mb-4">
												<Icon name="Bar_chart_light" size="4xl" className="text-gray-300 dark:text-gray-600" />
											</div>
											<h3
												className="text-lg font-medium dark:text-gray-100 mb-2"
												style={{ color: 'var(--text-primary)' }}
											>
												No Data Found
											</h3>
											<p
												className="dark:text-gray-400"
												style={{ color: 'var(--text-tertiary)' }}
											>
												{searchTerm ? 'No reports match your search.' : 'No report data available.'}
											</p>
										</div>
									</td>
								</tr>
							) : (
								paginatedReports.map((report) => (
									<tr
										key={report.id}
										className="dark:hover:bg-gray-700"
										style={{ borderColor: 'var(--light-gray)' }}
										onMouseEnter={(e) => {
											e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.backgroundColor = 'var(--accent-white)';
										}}
									>
										<td
											className="font-medium dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{report.agentName}
										</td>
										<td
											className="dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{report.agentId}
										</td>
										<td
											className="dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{report.date}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Pagination */}
			{filteredReports.length > 0 && (
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
					showEllipsis={true}
					maxVisiblePages={5}
					primaryColor={setupData.primaryColor}
					secondaryColor={setupData.secondaryColor}
				/>
			)}
		</div>
	);
};

export default ReportPage;
