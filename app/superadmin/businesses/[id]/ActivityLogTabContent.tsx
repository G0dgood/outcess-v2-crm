import React, { useState, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { NoRecordFound, SVGLoaderFetch } from '@/components/Options';
import { CalendarIcon, MixerHorizontalIcon, UploadIcon } from '@radix-ui/react-icons';

export interface ActivityLogItem {
 _id: string;
 timestamp: string;
 user: string | { name: string; email: string; role?: string | { roleName: string } };
 role: string;
 action: string;
 details: string;
}

interface ActivityLogTabContentProps {
 activityLog: ActivityLogItem[];
 isLoading: boolean;
}

// Helper function to render details with bold formatting
const renderDetails = (details: string) => {
 if (!details) return '-';
 // Replace **text** with <strong>text</strong>
 const parts = details.split(/(\*\*[^*]+\*\*)/g);
 return (
  <span
   className="text-[10px] md:text-[12px] dark:text-gray-100"
   style={{ color: 'var(--text-primary)' }}
  >
   {parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
     const text = part.slice(2, -2);
     return <strong key={index}>{text}</strong>;
    }
    return part;
   })}
  </span>
 );
};

const formatDate = (dateString: string) => {
 if (!dateString) return '-';
 return new Date(dateString).toLocaleString('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
 });
};

const getUserName = (user: ActivityLogItem['user']) => {
 if (typeof user === 'string') return user;
 return user?.name || 'Unknown User';
};

const formatValue = (key: string, value: unknown): React.ReactNode => {
 if (value === null || value === undefined) return '-';

 if (key === 'timestamp' || key === 'createdAt' || key.toLowerCase().includes('date')) {
  return formatDate(value as string);
 }

 if (key === 'details') {
  return renderDetails(value as string);
 }

 if (key === 'user') {
  return (
   <span
    className="text-[10px] md:text-[12px] font-medium dark:text-gray-100"
    style={{ color: 'var(--text-primary)' }}
   >
    {getUserName(value as ActivityLogItem['user'])}
   </span>
  );
 }

 if (key === 'role') {
  return (
   <span
    className="text-[10px] md:text-[12px] dark:text-gray-400"
    style={{ color: 'var(--text-tertiary)' }}
   >
    {value as string}
   </span>
  );
 }

 if (typeof value === 'object') {
  return JSON.stringify(value);
 }

 return (
  <span
   className="text-[10px] md:text-[12px] dark:text-gray-100"
   style={{ color: 'var(--text-primary)' }}
  >
   {String(value)}
  </span>
 );
};

const ActivityLogTabContent: React.FC<ActivityLogTabContentProps> = ({ activityLog, isLoading }) => {
 const { canAccess } = usePrivilege();
 const canView = canAccess('auditLog', 'view');

 const { lineOfBusinessData } = useLineOfBusiness();
 const [currentPage, setCurrentPage] = useState(1);
 const [itemsPerPage] = useState(10);

 const totalPages = Math.ceil(activityLog.length / itemsPerPage);
 const startIndex = (currentPage - 1) * itemsPerPage;
 const endIndex = startIndex + itemsPerPage;
 const paginatedLogs = useMemo(() => {
  return activityLog.slice(startIndex, endIndex);
 }, [activityLog, startIndex, endIndex]);

 const columns = useMemo(() => {
  if (!activityLog || activityLog.length === 0) return [];
  return Object.keys(activityLog[0]).map((key) => ({
   header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(),
   key,
   render: (item: ActivityLogItem) => formatValue(key, item[key as keyof ActivityLogItem])
  }));
 }, [activityLog]);

 if (!canView) {
  return null;
 }

 return (
  <div>
   {/* Header with Filters and Export */}
   <div className="flex items-center justify-between mb-6">
    <h2
     className="text-[12px] md:text-[14px] font-semibold dark:text-gray-100"
     style={{ color: 'var(--text-primary)' }}
    >
     Recent Activity
    </h2>
    <div className="flex items-center gap-3">
     <button
      type="button"
      className="flex items-center gap-2 px-4 py-2 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
      style={{
       borderColor: 'var(--light-gray)',
       color: 'var(--text-secondary)',
       backgroundColor: 'var(--accent-white)'
      }}
      onMouseEnter={(e) => {
       e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
      }}
      onMouseLeave={(e) => {
       e.currentTarget.style.backgroundColor = 'var(--accent-white)';
      }}
     >
      <CalendarIcon className="w-4 h-4" />
      <span>Last 7 Days</span>
     </button>
     <button
      type="button"
      className="flex items-center gap-2 px-4 py-2 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
      style={{
       borderColor: 'var(--light-gray)',
       color: 'var(--text-secondary)',
       backgroundColor: 'var(--accent-white)'
      }}
      onMouseEnter={(e) => {
       e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
      }}
      onMouseLeave={(e) => {
       e.currentTarget.style.backgroundColor = 'var(--accent-white)';
      }}
     >
      <MixerHorizontalIcon className="w-4 h-4" />
      <span>User Role</span>
     </button>
     <Button
      variant="primary"
      size="md"
      onClick={() => {
       // Implement export functionality
      }}
     >
      <UploadIcon className="w-4 h-4" />
      <span>Export Logs</span>
     </Button>
    </div>
   </div>

   {/* Activity Log Table */}
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
        borderBottomColor: 'var(--light-gray)'
       }}
      >
       <tr>
        {columns.map((column) => (
         <th
          key={column.key}
          className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-300 uppercase tracking-wider"
          style={{ color: 'var(--text-primary)' }}
         >
          {column.header}
         </th>
        ))}
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
        <SVGLoaderFetch colSpan={columns?.length || 4} text={''} />
       ) : paginatedLogs.length === 0 ? (
        <NoRecordFound colSpan={columns?.length || 4} />
       ) : (
        paginatedLogs.map((activity) => (
         <tr
          key={activity._id}
          className="dark:hover:bg-gray-700 transition-colors"
          style={{ borderColor: 'var(--light-gray)' }}
          onMouseEnter={(e) => {
           e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
          }}
          onMouseLeave={(e) => {
           e.currentTarget.style.backgroundColor = 'var(--accent-white)';
          }}
         >
          {columns.map((column) => (
           <td key={`${activity._id}-${column.key}`} className="px-6 py-4 whitespace-nowrap">
            {column.render(activity)}
           </td>
          ))}
         </tr>
        ))
       )}
      </tbody>
     </table>
    </div>
   </div>

   {/* Pagination Section */}
   <div className="flex items-center justify-between mt-6">
    <Pagination
     currentPage={currentPage}
     totalPages={totalPages}
     onPageChange={setCurrentPage}
     showEllipsis={true}
     maxVisiblePages={5}
     primaryColor={lineOfBusinessData?.primaryColor || 'var(--primary)'}
     secondaryColor={lineOfBusinessData?.secondaryColor || 'var(--primary)'}
     className="mt-0"
    />
   </div>
  </div>
 );
};

export default ActivityLogTabContent;
