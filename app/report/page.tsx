'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import moment from 'moment';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import Pagination from '@/components/ui/Pagination';
import DateFilter from '@/components/ui/DateFilter';
import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import TablePaginationHeader from '@/components/ui/TablePaginationHeader';
import PageHeading from '@/components/ui/PageHeading';
import Dropdown from '@/components/ui/Dropdown';
import ReportFilterOptionsModal from '@/components/ReportFilterOptionsModal';
import { useCampaign } from '@/contexts/CampaignContext';
import { useSetup } from '@/contexts/SetupContext';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import AccessRestricted from '@/components/ui/AccessRestricted';
import {
	useGetDispositionsByCampaignReportQuery,
	useGetDispositionsByAgentReportQuery,
	useLazyGetDispositionsByCampaignReportQuery,
	useLazyGetDispositionsByAgentReportQuery
} from '@/store/services/dispositionApi';
import { useGetCampaignByCompanyIdForheaderQuery } from '@/store/services/campaignApi';
import { useGetTeamMembersByCampaignIdQuery } from '@/store/services/teamMembersApi';
import { NoRecordFound, SVGLoaderFetch } from '@/components/Options';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import CSVDownloadButton from '@/components/ui/CSVDownloadButton';
import { BucketWithMembers, getUserAssignedBuckets } from '@/utils/bucketUtils';
import { resolveMultiDropdownLevels, getAllCampaignDispositions } from '@/utils/dispositionMultiDropdown';

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
		firstName?: string;
		lastName?: string;
		[key: string]: unknown;
	};
	customer?: {
		Name?: string;
		firstName?: string;
		lastName?: string;
		[key: string]: unknown;
	};
	customerName?: string;
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
	const { campaignData, selectedCampaignId } = useCampaign();
	const { setupData } = useSetup();
	const { user } = useUserInfo();
	const { canAccess, isAdmin, isLoading: isPrivilegeLoading, allBucketAccess, isSuperAdmin } = usePrivilege();
	const canView = canAccess('report', 'view');
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);

	const effectiveCampaignId = String(selectedCampaignId || campaignData?._id || campaignData?.id || setupData?.campaignId || user?.campaignId || '');

	const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>(() => {
		// Local start/end of today, converted to UTC instants (matches how createdAt is stored)
		const start = new Date();
		start.setHours(0, 0, 0, 0);
		const end = new Date();
		end.setHours(23, 59, 59, 999);
		return { startDate: start.toISOString(), endDate: end.toISOString() };
	});

	const userRoleName = typeof user?.role === 'object' ? (user?.role as { roleName?: string })?.roleName : user?.role;
	// Treat the isSupervisor flag as authoritative (a team lead may have any role name),
	// falling back to the role name for older records.
	const isSupervisor = user?.isSupervisor === true || userRoleName?.toLowerCase() === 'supervisor';
	const isAgent = !isAdmin && !isSupervisor;
	const [searchTerm, setSearchTerm] = useState('');
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const { setSelectedCampaignId } = useCampaign();
	const [selectedBucketId, setSelectedBucketId] = useState<string>('');
	const [selectedAgentId, setSelectedAgentId] = useState<string>('');

	// State for Option Modal
	const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);

	const companyId = String(user?.companyId || (typeof user?.company === 'object' ? (user?.company as { _id?: string; id?: string })?._id || (user?.company as { _id?: string; id?: string })?.id : user?.company) || '');
	const { data: headerCampaignsData } = useGetCampaignByCompanyIdForheaderQuery(
		companyId ? { companyId } : { companyId: '' },
		{ skip: !companyId }
	);
	const campaignsList = (headerCampaignsData as { campaigns?: Array<{ _id?: string; id?: string; name?: string; campaignName?: string }> })?.campaigns || [];

	const { data: teamMembersData } = useGetTeamMembersByCampaignIdQuery(
		effectiveCampaignId ? { campaignId: effectiveCampaignId } : { campaignId: '' },
		{ skip: !effectiveCampaignId }
	);
	const rawTeamMembers = (teamMembersData as { teamMembers?: Array<{ _id?: string; id?: string; name?: string; firstName?: string; lastName?: string; email?: string }>; data?: Array<{ _id?: string; id?: string; name?: string; firstName?: string; lastName?: string; email?: string }> })?.teamMembers || (teamMembersData as { data?: Array<{ _id?: string; id?: string; name?: string; firstName?: string; lastName?: string; email?: string }> })?.data || (Array.isArray(teamMembersData) ? teamMembersData : []);
	const teamMembersList = Array.isArray(rawTeamMembers) ? rawTeamMembers : [];

	const hasFullBucketAccess = isAdmin || isSuperAdmin || allBucketAccess;

	const allBuckets = useMemo(() => {
		return (campaignData?.dashboardSettings?.buckets || setupData?.dashboardSettings?.buckets || []) as unknown as BucketWithMembers[];
	}, [campaignData, setupData]);

	const accessibleBuckets = useMemo(() => {
		return hasFullBucketAccess ? allBuckets : getUserAssignedBuckets(user || undefined, allBuckets);
	}, [allBuckets, user, hasFullBucketAccess]);

	const { data: lobApiData, isLoading: isLobLoading } = useGetDispositionsByCampaignReportQuery(
		{
			campaignId: effectiveCampaignId,
			startDate: dateRange.startDate,
			endDate: dateRange.endDate,
			page: currentPage,
			limit: itemsPerPage,
			search: searchTerm,
			bucketId: selectedBucketId,
			agentId: selectedAgentId
		},
		{ skip: !effectiveCampaignId || isAgent || isPrivilegeLoading }
	);

	const { data: agentApiData, isLoading: isAgentLoading } = useGetDispositionsByAgentReportQuery(
		{
			campaignId: effectiveCampaignId,
			agentId: user?._id || user?.id || '',
			page: currentPage,
			limit: itemsPerPage,
			startDate: dateRange.startDate,
			endDate: dateRange.endDate,
			search: searchTerm,
			bucketId: selectedBucketId
		},
		{ skip: !effectiveCampaignId || !isAgent || !(user?._id || user?.id) || isPrivilegeLoading }
	);

	const apiData = (isAgent ? agentApiData : lobApiData) as ReportApiResponse | ReportItem[] | undefined;
	const isLoading = isPrivilegeLoading || (isAgent ? isAgentLoading : isLobLoading);
	const [triggerGetCampaignReport] = useLazyGetDispositionsByCampaignReportQuery();
	const [triggerGetAgentReport] = useLazyGetDispositionsByAgentReportQuery();

	const filterButtonRef = useRef<HTMLDivElement>(null);
	const [tooltipLength, setTooltipLength] = useState(10);
	const [filterType, setFilterType] = useState<'today' | 'yesterday' | 'last7days' | 'last30days' | 'all' | 'dateRange'>('today');
	const [customFromDate, setCustomFromDate] = useState('');
	const [customToDate, setCustomToDate] = useState('');

	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, selectedBucketId]);

	// Reset filters when switching campaigns
	useEffect(() => {
		setSelectedBucketId('');
		setCurrentPage(1);
		setSearchTerm('');
	}, [effectiveCampaignId]);

	// Reset selected bucket if it's not valid for current campaign
	useEffect(() => {
		if (accessibleBuckets.length > 0 && selectedBucketId) {
			const isAccessible = hasFullBucketAccess
				? true
				: accessibleBuckets.some(b => (b.id || b._id) === selectedBucketId);
			if (!isAccessible) {
				setSelectedBucketId('');
			}
		}
	}, [accessibleBuckets, selectedBucketId, hasFullBucketAccess]);

	useEffect(() => {
		const savedLength = localStorage.getItem('report_tooltip_length');
		if (savedLength) {
			const parsed = parseInt(savedLength, 10);
			if (!isNaN(parsed) && parsed > 0) {
				setTooltipLength(parsed);
			}
		}
	}, []);



	const configuredDispositions = useMemo(() => {
		return getAllCampaignDispositions(campaignData?.dashboardSettings);
	}, [campaignData?.dashboardSettings]);

	const reportData: ReportData[] = useMemo(() => {
		if (!apiData) return [];
		let list: ReportItem[] = [];

		if (Array.isArray(apiData)) {
			list = apiData;
		} else if ('data' in apiData && Array.isArray(apiData.data)) {
			list = apiData.data;
		}

		return list.map((item: ReportItem) => {
			const formatted = item.timestamp && moment(item.timestamp).isValid()
				? moment(item.timestamp).format('YYYY-MM-DD HH:mm')
				: '-';
			const agentName = typeof item.agent === 'object' ? item.agent?.name : item.agent;
			const customerSearchId = item.customer
				? (Object.entries(item.customer).find(([key]) => key.toLowerCase() === 'searchid')?.[1] as string)
				: undefined;

			const row: ReportData = {
				id: item._id || item.id || '',
				'Agent Name': agentName || 'Unknown',
				'Date': formatted,
				'Search ID': customerSearchId || (item.customerId as string) || '-',
			};

			// Flatten customer fields
			if (item.customer && typeof item.customer === 'object') {
				Object.entries(item.customer).forEach(([key, value]) => {
					if (!['id', '_id', 'companyId', 'campaignId', 'createdAt', 'updatedAt', '__v'].includes(key) && key.toLowerCase() !== 'searchid' && key.toLowerCase() !== 'bucketid') {
						row[key] = value;
					}
				});
			}

			// Flatten fillDisposition (expand multi-dropdown levels into distinct header columns)
			if (Array.isArray(item.fillDisposition)) {
				item.fillDisposition.forEach((field: DispositionField) => {
					if (field.fieldName && field.fieldValue !== undefined && field.fieldValue !== null) {
						const dispDef = configuredDispositions.find(d => d.name === field.fieldName);
						const levels = resolveMultiDropdownLevels(field.fieldName, String(field.fieldValue), dispDef);
						levels.forEach(lvl => {
							row[lvl.header] = lvl.value;
						});
					}
				});
			}

			return row;
		});
	}, [apiData, configuredDispositions]);

	const dynamicHeaders = useMemo(() => {
		if (reportData.length === 0) return [];
		const headers = new Set<string>();
		// Default headers that should always be present
		const priorityHeaders = ['Agent Name', 'Date'];

		// Add all keys from all items except Search ID
		reportData.forEach(item => {
			Object.keys(item).forEach(key => {
				if (key !== 'id' && key !== '_id' && key !== 'Search ID') {
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

	const fetchAllReportsToExport = async (): Promise<ReportItem[]> => {
		const queryParams = {
			campaignId: effectiveCampaignId,
			startDate: dateRange.startDate,
			endDate: dateRange.endDate,
			page: 1,
			limit: 10000,
			search: searchTerm,
			bucketId: selectedBucketId
		};

		let response: ReportApiResponse | ReportItem[] | undefined;
		if (isAgent) {
			response = (await triggerGetAgentReport({
				...queryParams,
				agentId: user?._id || user?.id || ''
			}).unwrap()) as ReportApiResponse | ReportItem[];
		} else {
			response = (await triggerGetCampaignReport(queryParams).unwrap()) as ReportApiResponse | ReportItem[];
		}

		if (Array.isArray(response)) {
			return response;
		} else if (response && 'data' in response && Array.isArray(response.data)) {
			return response.data;
		}
		return [];
	};

	const formatReportItem = (item: ReportItem) => {
		const formatted = item.timestamp && moment(item.timestamp).isValid()
			? moment(item.timestamp).format('YYYY-MM-DD HH:mm')
			: '-';
		const agentName = typeof item.agent === 'object' ? item.agent?.name : item.agent;

		const customerSearchId = item.customer
			? (Object.entries(item.customer).find(([key]) => key.toLowerCase() === 'searchid')?.[1] as string)
			: undefined;

		const row: Record<string, unknown> = {
			'Agent Name': agentName || 'Unknown',
			'Date': formatted,
			'Search ID': customerSearchId || (item.customerId as string) || '-',
		};

		// Flatten customer fields
		if (item.customer && typeof item.customer === 'object') {
			Object.entries(item.customer).forEach(([key, value]) => {
				if (!['id', '_id', 'companyId', 'campaignId', 'createdAt', 'updatedAt', '__v'].includes(key) && key.toLowerCase() !== 'searchid' && key.toLowerCase() !== 'bucketid') {
					row[key] = value;
				}
			});
		}

		if (Array.isArray(item.fillDisposition)) {
			item.fillDisposition.forEach((field: DispositionField) => {
				if (field.fieldName && field.fieldValue !== undefined && field.fieldValue !== null) {
					const dispDef = configuredDispositions.find(d => d.name === field.fieldName);
					const levels = resolveMultiDropdownLevels(field.fieldName, String(field.fieldValue), dispDef);
					levels.forEach(lvl => {
						row[lvl.header] = lvl.value;
					});
				}
			});
		}

		return row;
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
		return <AccessRestricted />;
	}

	return (
		<div>
			{/* Title and Action Buttons */}

			<PageHeading
				text="Report"
			/>

			{/* Search and Actions */}
			<div className="my-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center">
					<Search
						placeholder="Search"
						value={searchTerm}
						onChange={setSearchTerm}
						className="w-full sm:w-auto"
						maxWidth="w-full"
						showClearButton={true}
					/>
					{(() => {
						return accessibleBuckets.length > 0 ? (
							<div className="w-full sm:w-48">
								<Dropdown
									label=""
									placeholder="Select a Bucket"
									options={[
										...(hasFullBucketAccess ? [{ value: '', label: 'All Buckets' }] : []),
										...accessibleBuckets.map((b: { id?: string; _id?: string; name: string }) => ({ value: b.id || b._id || '', label: b.name }))
									]}
									value={selectedBucketId}
									onChange={(val) => {
										setSelectedBucketId(Array.isArray(val) ? val[0] || '' : val);
									}}
								/>
							</div>
						) : null;
					})()}
				</div>
				<div className="flex flex-wrap items-center justify-end sm:justify-start gap-2 sm:gap-3">
					<div ref={filterButtonRef} className="relative">
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsOptionsModalOpen(true)}
							className="dark:bg-gray-800 border dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100 focus:ring-offset-2 dark:focus:ring-offset-gray-800 dark:focus:ring-gray-400 gap-2 whitespace-nowrap"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)',
								color: 'var(--text-secondary)'
							}}
						>
							<MixerHorizontalIcon className="w-4 h-4" />
							Option Modal
						</Button>
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
					<CSVDownloadButton
						fetchData={fetchAllReportsToExport}
						formatItem={formatReportItem}
						fileName={`disposition_report_${moment().format('YYYY-MM-DD')}.csv`}
						variant="primary"
						size="md"
						className="flex items-center gap-2 px-2 py-2 sm:px-4 sm:py-2 text-[10px] md:text-[12px]"
					/>
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
						<thead>
							<tr>
								{dynamicHeaders.length > 0 ? (
									<>
										{dynamicHeaders.map(header => (
											<th
												key={header}
												className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider whitespace-nowrap"
											>
												{header}
											</th>
										))}
									</>
								) : (
									<th
										className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider whitespace-nowrap"
									>
										{isLoading ? 'Loading...' : 'No Data'}
									</th>
								)}
							</tr>
						</thead>
						<tbody
							className="divide-y dark:divide-gray-700"
							style={{
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
										style={{ borderColor: 'var(--light-gray)' }}
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
					primaryColor={campaignData?.primaryColor || 'var(--primary)'}
					secondaryColor={campaignData?.secondaryColor || 'var(--primary)'}
				/>
			)}
			{/* Report Filter Options Modal */}
			<ReportFilterOptionsModal
				isOpen={isOptionsModalOpen}
				onClose={() => setIsOptionsModalOpen(false)}
				campaignsList={campaignsList}
				accessibleBuckets={accessibleBuckets}
				teamMembersList={teamMembersList}
				currentCampaignId={effectiveCampaignId}
				currentBucketId={selectedBucketId}
				currentAgentId={selectedAgentId}
				hasFullBucketAccess={hasFullBucketAccess}
				onApply={({ campaignId, bucketId, agentId }) => {
					if (campaignId && campaignId !== selectedCampaignId) {
						setSelectedCampaignId(campaignId);
					}
					setSelectedBucketId(bucketId);
					setSelectedAgentId(agentId);
					setCurrentPage(1);
				}}
			/>
		</div>
	);
};

export default ReportPage;
