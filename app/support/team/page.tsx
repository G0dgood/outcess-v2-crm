'use client';

import React, { useState, useMemo } from 'react';
import Search from '@/components/ui/Search';
import Dropdown from '@/components/ui/Dropdown';
import { useGetTicketsBySupervisorIdQuery } from '@/store/services/supportApi';
import { useAuth } from '@/contexts/AuthContext';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useGetSupervisorsByLineOfBusinessIdQuery } from '@/store/services/teamMembersApi';
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
import { useUserInfo } from '@/contexts/UserInfoContext';
import { Clock, Inbox, CheckCircle2, XCircle } from 'lucide-react';
import AccessDenied from '@/components/ui/AccessDenied';

const TeamSupportPage = () => {
 const router = useRouter();
 const { user } = useAuth();
 const { user: userInfo } = useUserInfo();
 const { canAccess, isAdmin } = usePrivilege();
 const { lineOfBusinessData } = useLineOfBusiness();

 const [searchQuery, setSearchQuery] = useState('');
 const [activeTab, setActiveTab] = useState<'All Tickets' | 'New' | 'In Progress' | 'Resolved' | 'Closed' | 'Done'>('All Tickets');
 const [page, setPage] = useState(1);
 const [itemsPerPage, setItemsPerPage] = useState(10);
 const [priorityFilter, setPriorityFilter] = useState('');
 const [dateFilter, setDateFilter] = useState<{ filterType: "all" | "last7days" | "today" | "yesterday" | "last30days" | "dateRange" | undefined; startDate?: string; endDate?: string } | null>(null);
 const [supervisorFilter, setSupervisorFilter] = useState<string>(user?.id || '');

 // Permission check: only supervisors or admins should see this
 const userRole = typeof user?.role === 'object' ? (user?.role as { roleName?: string })?.roleName : user?.role;
 const isSupervisor = userRole?.toLowerCase() === 'supervisor' || userRole?.toLowerCase() === 'admin' || isAdmin;
 const hasAccess = canAccess('support', 'view') && isSupervisor;

 const companyId =
  (userInfo?.company as { _id?: string; id?: string } | undefined)?._id ||
  (userInfo?.company as { _id?: string; id?: string } | undefined)?.id ||
  userInfo?.companyId ||
  user?.companyId ||
  '';

 const lobId = lineOfBusinessData?.lineOfBusiness?._id || lineOfBusinessData?.lineOfBusiness?.id;

 const { data: supervisorsData } = useGetSupervisorsByLineOfBusinessIdQuery({
  companyId,
  lineOfBusinessId: lobId || ''
 }, { skip: !companyId || !lobId || !hasAccess });

 const supervisors = useMemo(() => {
  if (!supervisorsData || !Array.isArray(supervisorsData.roles)) return [];

  const rawRoles = supervisorsData.roles as {
   _id?: string;
   id?: string;
   roleName?: string;
   supervisorTitle?: string;
  }[];

  const options = rawRoles
   .map((role) => ({
    label: (role.supervisorTitle || role.roleName || '').trim(),
    value: role._id || role.id || ''
   }))
   .filter((s) => s.label && s.value);

  const uniqueMap = new Map<string, { label: string; value: string }>();
  options.forEach((s) => uniqueMap.set(s.value, s));

  const result = Array.from(uniqueMap.values());

  if (isAdmin) {
   result.unshift({ label: 'All Supervisors', value: '' });
  }

  return result;
 }, [supervisorsData, isAdmin]);

 const { data: ticketsData, isLoading } = useGetTicketsBySupervisorIdQuery({
  supervisorId: supervisorFilter,
  status: activeTab === 'All Tickets' ? undefined : activeTab,
  page,
  limit: itemsPerPage,
  priority: priorityFilter || undefined,
  startDate: dateFilter?.startDate || undefined,
  endDate: dateFilter?.endDate || undefined,
  search: searchQuery || undefined,
 }, { skip: !hasAccess || !supervisorFilter });


 console.log("ticketsData----->", ticketsData)


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
   <div className="flex flex-col mb-6">
    <PageHeading text="Team Member Support" />
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
     Manage support tickets created by your team members.
    </p>
   </div>

   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
    <div className="w-full max-w-md">
     <Search
      placeholder="Search for team ticket"
      value={searchQuery}
      onChange={(val) => {
       setSearchQuery(val);
       setPage(1);
      }}
     />
    </div>
    <div className="flex items-center gap-3">
     <FilterDropdown
      label={priorityFilter || "Select Priority"}
      triggerClassName="!px-2 !py-2 !text-[8px] md:!text-[10px] sm:!px-4 sm:!py-2"
     >
      {({ close }) => (
       <div className="dark:bg-gray-800 shadow-lg overflow-hidden w-40 cursor-default">
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
        initialFilter={(dateFilter?.filterType as "all" | "last7days" | "today" | "yesterday" | "last30days" | "dateRange" | undefined) || 'last7days'}
        onApply={(filter: { filterType: "all" | "last7days" | "today" | "yesterday" | "last30days" | "dateRange" | undefined; startDate?: string; endDate?: string } | null) => {
         setDateFilter(filter);
         setPage(1);
         close();
        }}
        onClose={close}
       />
      )}
     </FilterDropdown>

     <Dropdown
      label="Supervisor"
      options={supervisors}
      value={supervisorFilter}
      onChange={(val) => {
       if (Array.isArray(val)) return;
       setSupervisorFilter(val);
       setPage(1);
      }}
      inputClassName="h-10 whitespace-nowrap"
     />
    </div>
   </div>

   {/* Tabs */}
   <Tabs
    tabs={supportTabs}
    activeTab={activeTab}
    onTabChange={(tabId) => {
     setActiveTab(tabId as typeof activeTab);
     setPage(1);
    }}
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
     label="Team Tickets"
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

export default TeamSupportPage;
