'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import Pagination from '@/components/ui/Pagination';
import DateFilter from '@/components/ui/DateFilter';
import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import TablePaginationHeader from '@/components/ui/TablePaginationHeader';
import PageHeading from '@/components/ui/PageHeading';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { useGetDispositionsByLineOfBusinessReportQuery, useGetDispositionsByAgentReportQuery } from '@/store/services/dispositionApi';
import { NoRecordFound, SVGLoaderFetch } from '@/components/Options';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';

interface ReportData {
	id: string;
	[key: string]: unknown;
}

interface DispositionField {
	fieldName: string;
	fieldValue: unknown;
	[key: string]: unknown;
}

interface ReportItem {
	_id?: string;
	id?: string;
	agent?: {
		name?: string;
	};
	timestamp?: string;
	fillDisposition?: DispositionField[];
	[key: string]: unknown;
}

interface ReportApiResponse {
	data: ReportItem[];
	totalPages?: number;
	[key: string]: unknown;
}

const ReportPage: React.FC = () => {
	const { lineOfBusinessData, selectedLineOfBusinessId } = useLineOfBusiness();
	const { user } = useUserInfo();
	const { canAccess, isAdmin, isLoading: isPrivilegeLoading } = usePrivilege();
	const canView = canAccess('report', 'view');
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);

	const formatDate = (date: Date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>(() => {
		const today = formatDate(new Date());
		return { startDate: `${today}T00:00:00.000Z`, endDate: `${today}T23:59:59.999Z` };
	});

	const isAgent = !isAdmin;
	const [searchTerm, setSearchTerm] = useState('');
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const { data: lobApiData, isLoading: isLobLoading } = useGetDispositionsByLineOfBusinessReportQuery(
		{
			lineOfBusinessId: selectedLineOfBusinessId || '',
			startDate: dateRange.startDate,
			endDate: dateRange.endDate,
			page: currentPage,
			limit: itemsPerPage,
			search: searchTerm
		},
		{ skip: !selectedLineOfBusinessId || isAgent || isPrivilegeLoading }
	);

	const { data: agentApiData, isLoading: isAgentLoading } = useGetDispositionsByAgentReportQuery(
		{
			lineOfBusinessId: selectedLineOfBusinessId || '',
			agentId: user?._id || user?.id || '',
			page: currentPage,
			limit: itemsPerPage,
			startDate: dateRange.startDate,
			endDate: dateRange.endDate,
			search: searchTerm
		},
		{ skip: !selectedLineOfBusinessId || !isAgent || !(user?._id || user?.id) || isPrivilegeLoading }
	);

	const apiData = (isAgent ? agentApiData : lobApiData) as ReportApiResponse | ReportItem[] | undefined;
	const isLoading = isPrivilegeLoading || (isAgent ? isAgentLoading : isLobLoading);

	const filterButtonRef = useRef<HTMLDivElement>(null);
	const [tooltipLength, setTooltipLength] = useState(10);
	const [filterType, setFilterType] = useState<'today' | 'yesterday' | 'last7days' | 'last30days' | 'all' | 'dateRange'>('today');
	const [customFromDate, setCustomFromDate] = useState('');
	const [customToDate, setCustomToDate] = useState('');

	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm]);

	useEffect(() => {
		const savedLength = localStorage.getItem('report_tooltip_length');
		if (savedLength) {
			const parsed = parseInt(savedLength, 10);
			if (!isNaN(parsed) && parsed > 0) {
				setTooltipLength(parsed);
			}
		}
	}, []);



	const reportData: ReportData[] = useMemo(() => {
		if (!apiData) return [];
		let list: ReportItem[] = [];

		if (Array.isArray(apiData)) {
			list = apiData;
		} else if ('data' in apiData && Array.isArray(apiData.data)) {
			list = apiData.data;
		}

		return list.map((item: ReportItem) => {
			const d = item.timestamp ? new Date(item.timestamp) : null;
			const year = d ? d.getFullYear() : '';
			const month = d ? String(d.getMonth() + 1).padStart(2, '0') : '';
			const day = d ? String(d.getDate()).padStart(2, '0') : '';
			const hour = d ? String(d.getHours()).padStart(2, '0') : '';
			const minute = d ? String(d.getMinutes()).padStart(2, '0') : '';
			const formatted = d ? `${year}-${month}-${day} ${hour}:${minute}` : '-';
			const row: ReportData = {
				id: item._id || item.id || '',
				'Agent Name': item.agent?.name || 'Unknown',
				'Date': formatted,
			};

			// Flatten fillDisposition
			if (Array.isArray(item.fillDisposition)) {
				item.fillDisposition.forEach((field: DispositionField) => {
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
		// Implement download functionality
		// This could export data as CSV, PDF, or Excel
	};

	const handleFilter = () => {
		setIsFilterOpen(!isFilterOpen);
	};

	const handleFilterApply = (filter: {
		startDate: string;
		endDate: string;
		filterType: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'all' | 'dateRange';
		fromDate?: string;
		toDate?: string;
	}) => {
		setDateRange({ startDate: filter.startDate, endDate: filter.endDate });
		setFilterType(filter.filterType);
		if (filter.fromDate) setCustomFromDate(filter.fromDate);
		if (filter.toDate) setCustomToDate(filter.toDate);
		setIsFilterOpen(false);
	};



	const totalPages = apiData && !Array.isArray(apiData) && typeof apiData.pagination === 'object'
		? (apiData.pagination as { totalPages?: number }).totalPages || 1
		: 1;

	const totalItems = apiData && !Array.isArray(apiData) && typeof apiData.pagination === 'object'
		? (apiData.pagination as { total?: number }).total || 0
		: 0;

	const paginatedReports = reportData;

	if (!canView) {
		return null;
	}

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
					// onSearch={(value) =>  }
					showClearButton={true}
				/>
				<div className="flex flex-wrap items-center justify-end sm:justify-start gap-2 sm:gap-3">
					<div ref={filterButtonRef} className="relative">
						<Button
							type="button"
							variant="outline"
							onClick={handleFilter}
							className="dark:bg-gray-800 border dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100 focus:ring-offset-2 dark:focus:ring-offset-gray-800 dark:focus:ring-gray-400 gap-2 whitespace-nowrap"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)',
								color: 'var(--text-secondary)'
							}}
						>
							<MixerHorizontalIcon className="w-4 h-4" />
							Filter Report
						</Button>
						{isFilterOpen && (
							<div className="absolute top-full right-0 mt-2 z-50">
								<DateFilter
									onApply={handleFilterApply}
									onClose={() => setIsFilterOpen(false)}
									initialFilter={filterType}
									initialFromDate={customFromDate}
									initialToDate={customToDate}
								/>
							</div>
						)}
					</div>
					<Button
						variant="primary"
						size="md"
						onClick={handleDownload}
						className="flex items-center gap-2 px-2 py-2  sm:px-4 sm:py-2 text-[10px] md:text-[12px]"
					>
						Download
					</Button>
				</div>
			</div>

			{/* Report Table */}
			<div
				className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden rounded-[var(--radius)]"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<TablePaginationHeader
					totalItems={totalItems}
					itemsPerPage={itemsPerPage}
					onItemsPerPageChange={(value) => {
						setItemsPerPage(value);
						setCurrentPage(1);
					}}
					label="Reports"
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
								{dynamicHeaders.length > 0 ? (
									dynamicHeaders.map(header => (
										<th
											key={header}
											className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider dark:text-gray-100 whitespace-nowrap"
											style={{ color: 'var(--text-primary)' }}
										>
											{header}
										</th>
									))
								) : (
									<th
										className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider dark:text-gray-100 whitespace-nowrap"
										style={{ color: 'var(--text-primary)' }}
									>
										{isLoading ? 'Loading...' : 'No Data'}
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
								<SVGLoaderFetch colSpan={dynamicHeaders.length > 0 ? dynamicHeaders.length : 1} text={'Loading report data...'} />
							) : paginatedReports.length === 0 ? (
								<NoRecordFound colSpan={dynamicHeaders.length > 0 ? dynamicHeaders.length : 1} />
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
												className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] dark:text-gray-100"
												style={{ color: 'var(--text-primary)' }}
											>
												{String(report[header] || '-').length > tooltipLength ? (
													<Tooltip>
														<TooltipTrigger asChild>
															<span className="cursor-pointer">
																{String(report[header] || '-').substring(0, tooltipLength)}...
															</span>
														</TooltipTrigger>
														<TooltipContent>
															<p>{String(report[header] || '-')}</p>
														</TooltipContent>
													</Tooltip>
												) : (
													String(report[header] || '-')
												)}
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
			{totalItems > 0 && (
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
					showEllipsis={true}
					maxVisiblePages={5}
					primaryColor={lineOfBusinessData?.primaryColor || 'var(--primary)'}
					secondaryColor={lineOfBusinessData?.secondaryColor || 'var(--primary)'}
				/>
			)}
		</div>
	);
};

export default ReportPage;
