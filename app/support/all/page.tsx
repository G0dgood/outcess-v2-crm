'use client';

import React, { useState } from 'react';
import Search from '@/components/ui/Search';
import { useGetTicketsByLineOfBusinessIdQuery } from '@/store/services/supportApi';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import PageHeading from '@/components/ui/PageHeading';
import Pagination from '@/components/ui/Pagination';
import TablePaginationHeader from '@/components/ui/TablePaginationHeader';
import FilterDropdown from '@/components/ui/FilterDropdown';
import DateFilter from '@/components/ui/DateFilter';
import TicketList from '@/components/features/support/TicketList';
import { useRouter } from 'next/navigation';
import SupportSkeleton from '@/components/skeletons/SupportSkeleton';
import Tabs, { TabItem } from '@/components/ui/Tabs';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import AccessDenied from '@/components/ui/AccessDenied';
import { CheckCircle2, Clock, Inbox, XCircle } from 'lucide-react';

const AllSupportPage = () => {
	const router = useRouter();
	const { canAccess } = usePrivilege();
	const { lineOfBusinessData } = useLineOfBusiness();
	const lineOfBusinessId = lineOfBusinessData?.lineOfBusiness?._id || lineOfBusinessData?.lineOfBusiness?.id;

	const [searchQuery, setSearchQuery] = useState('');
	const [activeTab, setActiveTab] = useState<'All Tickets' | 'New' | 'In Progress' | 'Resolved' | 'Closed' | 'Done'>('All Tickets');
	const [page, setPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [priorityFilter, setPriorityFilter] = useState('');
	const [dateFilter, setDateFilter] = useState<{ filterType: string; startDate?: string; endDate?: string } | null>(null);


	const hasAccess = canAccess('allSupport', 'view');


	const { data: ticketsData, isLoading } = useGetTicketsByLineOfBusinessIdQuery({
		lineOfBusinessId,
		status: activeTab === 'All Tickets' ? undefined : activeTab,
		page,
		limit: itemsPerPage,
		priority: priorityFilter || undefined,
	}, { skip: !lineOfBusinessId || !hasAccess });


	console.log("lineOfBusinessId----->", lineOfBusinessId)



	if (!hasAccess) {
		return <AccessDenied />;
	}

	if (isLoading && !ticketsData) {
		return (
			<div className="p-0">
				<SupportSkeleton />
			</div>
		);
	}

	const tickets = ticketsData?.tickets || [];

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'New': return <Inbox className="w-4 h-4" />;
			case 'In Progress': return <Clock className="w-4 h-4" />;
			case 'Resolved': return <CheckCircle2 className="w-4 h-4" />;
			case 'Closed': return <XCircle className="w-4 h-4" />;
			default: return <Inbox className="w-4 h-4" />;
		}
	};

	const supportTabs: TabItem[] = [
		{ id: 'All Tickets', label: 'All Tickets' },
		{ id: 'New', label: 'New', icon: getStatusIcon('New') },
		{ id: 'In Progress', label: 'In Progress', icon: getStatusIcon('In Progress') },
		{ id: 'Resolved', label: 'Resolved', icon: getStatusIcon('Resolved') },
		{ id: 'Closed', label: 'Closed', icon: getStatusIcon('Closed') },
		{ id: 'Done', label: 'Done', icon: <CheckCircle2 className="w-4 h-4" /> },
	];

	return (
		<div>
			{/* Header */}
			<div className="flex items-start justify-between mb-6">
				<PageHeading text="All Support Tickets" />
			</div>

			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<div className="w-full max-w-md">
					<Search
						placeholder="Search for ticket"
						value={searchQuery}
						onChange={(val) => setSearchQuery(val)}
					/>
				</div>
				<div className="flex items-center gap-3">
					<FilterDropdown
						label={priorityFilter || "Select Priority"}
						triggerClassName="!px-2 !py-2 !text-[8px] md:!text-[10px] sm:!px-4 sm:!py-2"
					>
						{({ close }) => (
							<div className="dark:bg-gray-800 shadow-lg dark:shadow-xl w-40 whitespace-nowrap rounded-[var(--radius)]">
								{['High', 'Medium', 'Low', 'Clear'].map((p) => (
									<div
										key={p}
										onClick={() => {
											setPriorityFilter(p === 'Clear' ? '' : p);
											setPage(1);
											close();
										}}
										className="px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer dark:text-gray-200"
									>
										{p}
									</div>
								))}
							</div>
						)}
					</FilterDropdown>
					<FilterDropdown
						label={dateFilter?.filterType ? (dateFilter.filterType === 'all' ? 'All Time' : dateFilter.filterType) : "This Week"}
						triggerClassName="!px-2 !py-2 !text-[8px] md:!text-[10px] sm:!px-4 sm:!py-2"
					>
						{({ close }) => (
							<DateFilter
								initialFilter={(dateFilter?.filterType as "dateRange" | "today" | "yesterday" | "last7days" | "last30days" | "all" | undefined) || 'last7days'}
								onApply={(filter: { filterType: string; startDate?: string; endDate?: string }) => {
									setDateFilter(filter);
									setPage(1);
									close();
								}}
								onClose={close}
							/>
						)}
					</FilterDropdown>
				</div>
			</div>

			{/* Tabs */}
			<Tabs
				tabs={supportTabs}
				activeTab={activeTab}
				onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
				activeColor={lineOfBusinessData?.primaryColor}
			/>

			<div className="mt-4">
				<TablePaginationHeader
					totalItems={ticketsData?.total || 0}
					itemsPerPage={itemsPerPage}
					onItemsPerPageChange={(value) => {
						setItemsPerPage(value);
						setPage(1);
					}}
					label="Tickets"
				/>
			</div>

			{/* Ticket List */}
			<div className="space-y-4 mt-4">
				<TicketList
					tickets={tickets}
					isLoading={isLoading}
					lineOfBusinessData={lineOfBusinessData}
					onOpenTicket={(id) => router.push(`/support/${id}`)}
				/>
			</div>

			{/* Pagination */}
			{tickets.length > 0 && (
				<Pagination
					currentPage={page}
					totalPages={ticketsData?.totalPages || 1}
					onPageChange={setPage}
					showEllipsis={true}
					maxVisiblePages={5}
					primaryColor={lineOfBusinessData?.primaryColor || 'var(--primary)'}
					secondaryColor={lineOfBusinessData?.secondaryColor || 'var(--primary)'}
				/>
			)}

		</div>
	);
};

export default AllSupportPage;
