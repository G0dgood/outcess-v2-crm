import React, { useState, useMemo } from 'react';
import Pagination from '@/components/ui/Pagination';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { NoRecordFound, SVGLoaderFetch } from '@/components/Options';

export interface User {
 _id: string;
 name: string;
 email: string;
 phone: string;
 role: {
  _id: string;
  roleName: string;
 } | string;
 status: string;
 createdAt: string;
 isActive: boolean;
}

interface UsersTabContentProps {
 users: User[];
 isLoading: boolean
}

const formatDate = (dateString: string) => {
 if (!dateString) return '-';
 return new Date(dateString).toLocaleDateString('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
 });
};

const getRoleName = (role: User['role']) => {
 if (typeof role === 'string') return role;
 return role?.roleName || '-';
};

const formatValue = (key: string, value: unknown): React.ReactNode => {
 if (value === null || value === undefined) return '-';

 if (key === 'createdAt' || key === 'updatedAt' || key.toLowerCase().includes('date')) {
  return formatDate(value as string);
 }

 if (key === 'role' && typeof value === 'object') {
  return getRoleName(value as User['role']);
 }

 if (typeof value === 'boolean') {
  return (
   <span
    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${value
     ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
     : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
     }`}
   >
    {value ? 'Yes' : 'No'}
   </span>
  );
 }

 if (key === 'status') {
  return (
   <span
    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${value === 'Active'
     ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
     : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
     }`}
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
   className="text-sm dark:text-gray-400"
   style={{ color: 'var(--text-tertiary)' }}
  >
   {String(value)}
  </span>
 );
};

const UsersTabContent: React.FC<UsersTabContentProps> = ({ users, isLoading }) => {
 const { lineOfBusinessData } = useLineOfBusiness();
 const [currentPage, setCurrentPage] = useState(1);
 const [itemsPerPage] = useState(10);

 const totalPages = Math.ceil(users.length / itemsPerPage);
 const startIndex = (currentPage - 1) * itemsPerPage;
 const endIndex = startIndex + itemsPerPage;
 const paginatedUsers = useMemo(() => {
  return users.slice(startIndex, endIndex);
 }, [users, startIndex, endIndex]);


 const columns = useMemo(() => {
  if (!users || users.length === 0) return [];
  return Object.keys(users[0]).map((key) => ({
   header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(),
   key,
   render: (user: User) => formatValue(key, user[key as keyof User])
  }));
 }, [users]);

 return (
  <div>
   {/* Header */}
   <div className="mb-6">
    <h2
     className="text-lg font-semibold dark:text-gray-100"
     style={{ color: 'var(--text-primary)' }}
    >
     User Management
    </h2>
   </div>

   {/* Users Table */}
   <div
    className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden mb-6"
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
        {columns?.map((column) => (
         <th
          key={column.key}
          className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider"
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
        <SVGLoaderFetch colSpan={columns?.length} text={''} />
       ) : paginatedUsers?.length === 0 ? (
        <NoRecordFound colSpan={columns?.length} />
       ) : paginatedUsers?.map((user) => (
        <tr
         key={user._id}
         className="dark:hover:bg-gray-700 transition-colors"
         style={{ borderColor: 'var(--light-gray)' }}
         onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
         }}
         onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--accent-white)';
         }}
        >
         {columns?.map((column) => (
          <td key={`${user._id}-${column.key}`} className="px-6 py-4 whitespace-nowrap">
           {column.render(user)}
          </td>
         ))}
        </tr>
       ))}
      </tbody>
     </table>
    </div>
   </div>

   {/* Pagination Section */}
   <div className="flex items-center justify-between">
    {/* Pagination Controls */}
    <Pagination
     currentPage={currentPage}
     totalPages={totalPages}
     onPageChange={setCurrentPage}
     showEllipsis={true}
     maxVisiblePages={5}
     primaryColor={lineOfBusinessData?.primaryColor || '#050711'}
     secondaryColor={lineOfBusinessData?.secondaryColor || '#6C8B7D'}
     className="mt-0"
    />
   </div>
  </div>
 );
};

export default UsersTabContent;
