'use client';

import React, { useState } from 'react';
import Search from '@/components/ui/Search';
import Button from '@/components/ui/Button';
import { useGetTicketsQuery } from '@/store/services/supportApi';
import { useAuth } from '@/contexts/AuthContext';
import { useCampaign } from '@/contexts/CampaignContext';
import PageHeading from '@/components/ui/PageHeading';
import Pagination from '@/components/ui/Pagination';
import TablePaginationHeader from '@/components/ui/TablePaginationHeader';
import { Dropdown } from '@/components/ui/Dropdown';
import DateFilter from '@/components/ui/DateFilter';
import TicketList from '@/components/features/support/TicketList';
import NewTicketModal from '@/components/features/support/NewTicketModal';
import { useRouter } from 'next/navigation';
import SupportSkeleton from '@/components/skeletons/SupportSkeleton';
import Tabs, { TabItem } from '@/components/ui/Tabs';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { Clock, Inbox, CheckCircle2, Plus, XCircle } from 'lucide-react';
import AccessDenied from '@/components/ui/AccessDenied';

const SupportPage = () => {
	const router = useRouter();
	const { user } = useAuth();
	const { canAccess } = usePrivilege();
	const { campaignData } = useCampaign();

	const [searchQuery, setSearchQuery] = useState('');
	const [activeTab, setActiveTab] = useState<'All Tickets' | 'New' | 'In Progress' | 'Resolved' | 'Closed' | 'Done'>('All Tickets');
	const [page, setPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [priorityFilter, setPriorityFilter] = useState('');
	const [dateFilter, setDateFilter] = useState<{ filterType: string; startDate?: string; endDate?: string } | null>(null);
	const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
	const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
	const dateFilterRef = React.useRef<HTMLDivElement>(null);

	// Close date filter on outside click
	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dateFilterRef.current && !dateFilterRef.current.contains(event.target as Node)) {
				setIsDateFilterOpen(false);
			}
		};

		if (isDateFilterOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isDateFilterOpen]);

	const hasAccess = canAccess('support', 'view');
	const campaignId = (user as { campaignId?: string })?.campaignId || '';

	const { data: ticketsData, isLoading } = useGetTicketsQuery({
		status: activeTab === 'All Tickets' ? undefined : activeTab,
		companyId: (user as { companyId?: string })?.companyId || '',
		campaignId,
		userId: user?.id,
		role: user?.role,
		page,
		limit: itemsPerPage,
		priority: priorityFilter || undefined,
		startDate: dateFilter?.startDate || undefined,
		endDate: dateFilter?.endDate || undefined,
	}, { skip: !hasAccess });

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
				<PageHeading text="Support" />
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
					<div className="w-40">
						<Dropdown
							label=""
							placeholder="Select Priority"
							options={[
								{ value: 'High', label: 'High' },
								{ value: 'Medium', label: 'Medium' },
								{ value: 'Low', label: 'Low' },
								{ value: '', label: 'Clear' }
							]}
							value={priorityFilter}
							onChange={(val) => {
								setPriorityFilter(val as string);
								setPage(1);
							}}
							className="mt-0!"
						/>
					</div>

					<div className="relative" ref={dateFilterRef}>
						<Button
							variant="outline"
							size="md"
							className="flex items-center gap-2 h-10 px-4 text-[10px] md:text-[12px] bg-white dark:bg-gray-800"
							onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
						>
							{dateFilter?.filterType ? (dateFilter.filterType === 'all' ? 'All Time' : dateFilter.filterType) : "This Week"}
						</Button>
						{isDateFilterOpen && (
							<div className="absolute top-full right-0 mt-2 z-50">
								<DateFilter
									initialFilter={(dateFilter?.filterType as "dateRange" | "today" | "yesterday" | "last7days" | "last30days" | "all" | undefined) || 'last7days'}
									onApply={(filter: { filterType: string; startDate?: string; endDate?: string }) => {
										setDateFilter(filter);
										setPage(1);
										setIsDateFilterOpen(false);
									}}
									onClose={() => setIsDateFilterOpen(false)}
								/>
							</div>
						)}
					</div>
					<Button
						onClick={() => setIsNewTicketModalOpen(true)}
						variant="primary"
						size="md"
						icon={<Plus className="w-4 h-4" />}
						className="flex items-center gap-2 px-2 py-2 text-[8px] md:text-[10px] sm:px-4 sm:py-2"
					>
						New Ticket
					</Button>
				</div>
			</div>

			{/* Tabs */}
			<Tabs
				tabs={supportTabs}
				activeTab={activeTab}
				onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
				activeColor={campaignData?.primaryColor}
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
					campaignData={campaignData}
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
					primaryColor={campaignData?.primaryColor || 'var(--primary)'}
					secondaryColor={campaignData?.secondaryColor || 'var(--primary)'}
				/>
			)}

			<NewTicketModal
				isOpen={isNewTicketModalOpen}
				onClose={() => setIsNewTicketModalOpen(false)}
			/>
		</div>
	);
};

export default SupportPage;
