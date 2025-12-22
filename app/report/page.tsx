'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import Icon from '@/components/ui/Icon';
import Pagination from '@/components/ui/Pagination';
import DateFilter from '@/components/ui/DateFilter';
import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import PageHeading from '@/components/ui/PageHeading';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useGetDispositionsByLineOfBusinessReportQuery } from '@/store/services/dispositionApi';
import { useGetSupervisorsByLineOfBusinessIdQuery } from '@/store/services/teamMembersApi';
import { NoRecordFound, SVGLoaderFetch } from '@/components/Options';

interface ReportData {
	id: string;
	[key: string]: any;
}

const ReportPage: React.FC = () => {
	const { lineOfBusinessData, selectedLineOfBusinessId } = useLineOfBusiness();
	const { data: apiData, isLoading } = useGetDispositionsByLineOfBusinessReportQuery(
		{ lineOfBusinessId: selectedLineOfBusinessId || '' },
		{ skip: !selectedLineOfBusinessId }
	);
	const { data: supervisorsData } = useGetSupervisorsByLineOfBusinessIdQuery(selectedLineOfBusinessId || '', {
		skip: !selectedLineOfBusinessId
	});
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const filterButtonRef = useRef<HTMLDivElement>(null);

	const supervisors = useMemo(() => {
		if (!supervisorsData) return [];
		return Array.isArray(supervisorsData) ? supervisorsData : supervisorsData.data || [];
	}, [supervisorsData]);

	console.log('Supervisors:', supervisors);

	const reportData: ReportData[] = useMemo(() => {
		if (!apiData) return [];
		const list = Array.isArray(apiData) ? apiData : apiData.data || [];

		return list.map((item: any) => {
			const row: any = {
				id: item._id || item.id,
				'Agent Name': item.agent?.name || 'Unknown',
				'Date': item.timestamp ? new Date(item.timestamp).toLocaleDateString() + ' ' + new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
			};

			// Flatten fillDisposition
			if (Array.isArray(item.fillDisposition)) {
				item.fillDisposition.forEach((field: any) => {
					if (field.fieldName) {
						row[field.fieldName] = field.fieldValue;
					}
				});
			}

			return row;
		});
	}, [apiData]);

	const dynamicHeaders = useMemo(() => {
		if (reportData.length === 0) return [];
		const headers = new Set<string>();
		// Default headers that should always be present
		const priorityHeaders = ['Agent Name', 'Date'];

		// Add all keys from all items
		reportData.forEach(item => {
			Object.keys(item).forEach(key => {
				if (key !== 'id' && key !== '_id') {
					headers.add(key);
				}
			});
		});

		// Convert to array and sort: priority headers first, then others alphabetically
		return Array.from(headers).sort((a, b) => {
			const indexA = priorityHeaders.indexOf(a);
			const indexB = priorityHeaders.indexOf(b);
			if (indexA !== -1 && indexB !== -1) return indexA - indexB;
			if (indexA !== -1) return -1;
			if (indexB !== -1) return 1;
			return a.localeCompare(b);
		});
	}, [reportData]);

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
		return Object.values(report).some(value =>
			String(value).toLowerCase().includes(searchLower)
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
								{dynamicHeaders.length > 0 ? (
									dynamicHeaders.map(header => (
										<th
											key={header}
											className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-100 whitespace-nowrap"
											style={{ color: 'var(--text-primary)' }}
										>
											{header}
										</th>
									))
								) : (
									<th
										className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-100 whitespace-nowrap"
										style={{ color: 'var(--text-primary)' }}
									>
										No Data
									</th>
								)}
							</tr>
						</thead>
						<tbody
							className="dark:bg-gray-800 divide-y dark:divide-gray-700"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)'
							}}
						>
							{isLoading ? (
								<SVGLoaderFetch colSpan={8} text={''} />
							) : paginatedReports.length === 0 ? (
								<NoRecordFound colSpan={8} />
							) :
								(paginatedReports?.map((report) => (
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
										{dynamicHeaders.map(header => (
											<td
												key={`${report.id}-${header}`}
												className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-100"
												style={{ color: 'var(--text-primary)' }}
											>
												{String(report[header] || '-')}
											</td>
										))}
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
					primaryColor={lineOfBusinessData?.primaryColor || '#050711'}
					secondaryColor={lineOfBusinessData?.secondaryColor || '#6C8B7D'}
				/>
			)}
		</div>
	);
};

export default ReportPage;
