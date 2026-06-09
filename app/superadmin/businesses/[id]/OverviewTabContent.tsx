import React from 'react';
import Button from '@/components/ui/Button';
import moment from 'moment';

interface BusinessData {
 businessId: string;
 businessName: string;
 status: string;
 deactivationReason?: string;
 industry: string;
 registrationDate: string;
 primaryContact: string;
 email: string;
 phone: string;
 address: string;
 userCount: number;
 lastBilling: string;
 activeModules: string[];
}

interface OverviewTabContentProps {
 businessData: BusinessData;
}

const OverviewTabContent: React.FC<OverviewTabContentProps> = ({ businessData }) => {
 const isInactive = businessData.status === 'Inactive';
 const isDeactivated = businessData.status === 'Deactivated';

 return (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
   {/* Basic Information Card */}
   <div
    className="dark:bg-gray-800 border dark:border-gray-700 p-6 rounded-[var(--radius)]"
    style={{
     backgroundColor: 'var(--accent-white)',
     borderColor: 'var(--light-gray)'
    }}
   >
    <h2
     className="text-[12px] md:text-[14px] font-semibold dark:text-gray-100 mb-4"
     style={{ color: 'var(--text-primary)' }}
    >
     Basic Information
    </h2>
    <div className="space-y-4">
     <div>
      <span
       className="text-[10px] md:text-[12px] font-medium dark:text-gray-400"
       style={{ color: 'var(--text-tertiary)' }}
      >
       Business ID:
      </span>
      <span
       className="ml-2 text-[10px] md:text-[12px] dark:text-gray-100"
       style={{ color: 'var(--text-primary)' }}
      >
       {businessData.businessId}
      </span>
     </div>
     <div>
      <span
       className="text-[10px] md:text-[12px] font-medium dark:text-gray-400"
       style={{ color: 'var(--text-tertiary)' }}
      >
       Status:
      </span>
      <span className="ml-2">
       <span
        className={`inline-flex px-2 py-1 text-[8px] md:text-[10px] font-semibold rounded-full ${
         businessData.status === 'Active'
          ? 'dark:bg-green-900/30 dark:text-green-400'
          : businessData.status === 'Inactive'
          ? 'dark:bg-yellow-900/30 dark:text-yellow-400'
          : 'dark:bg-red-900/30 dark:text-red-400'
        }`}
        style={{
         backgroundColor: 
          businessData.status === 'Active' ? 'rgba(34, 197, 94, 0.1)' : 
          businessData.status === 'Inactive' ? 'rgba(234, 179, 8, 0.1)' : 
          'rgba(239, 68, 68, 0.1)',
         color: 
          businessData.status === 'Active' ? '#16A34A' : 
          businessData.status === 'Inactive' ? '#CA8A04' : 
          '#DC2626'
        }}
       >
        {businessData.status}
       </span>
      </span>
     </div>
     {(isInactive || isDeactivated) && businessData.deactivationReason && (
      <div>
       <span
        className="text-[10px] md:text-[12px] font-medium dark:text-gray-400"
        style={{ color: 'var(--text-tertiary)' }}
       >
        Deactivation Reason:
       </span>
       <span
        className="ml-2 text-[10px] md:text-[12px] dark:text-gray-100 italic"
        style={{ color: 'var(--text-primary)' }}
       >
        {businessData.deactivationReason}
       </span>
      </div>
     )}
     <div>
      <span
       className="text-[10px] md:text-[12px] font-medium dark:text-gray-400"
       style={{ color: 'var(--text-tertiary)' }}
      >
       Industry:
      </span>
      <span
       className="ml-2 text-[10px] md:text-[12px] dark:text-gray-100"
       style={{ color: 'var(--text-primary)' }}
      >
       {businessData.industry}
      </span>
     </div>
     <div>
      <span
       className="text-[10px] md:text-[12px] font-medium dark:text-gray-400"
       style={{ color: 'var(--text-tertiary)' }}
      >
       Registration Date:
      </span>
      <span
       className="ml-2 text-[10px] md:text-[12px] dark:text-gray-100"
       style={{ color: 'var(--text-primary)' }}
      >
       {moment(businessData.registrationDate).format('DD-MM-YYYY')}
      </span>
     </div>
    </div>
   </div>

   {/* Contact Information Card */}
   <div
    className="dark:bg-gray-800 border dark:border-gray-700 p-6 rounded-[var(--radius)]"
    style={{
     backgroundColor: 'var(--accent-white)',
     borderColor: 'var(--light-gray)'
    }}
   >
    <h2
     className="text-[12px] md:text-[14px] font-semibold dark:text-gray-100 mb-4"
     style={{ color: 'var(--text-primary)' }}
    >
     Contact Information
    </h2>
    <div className="space-y-4">
     <div>
      <span
       className="text-[10px] md:text-[12px] font-medium dark:text-gray-400"
       style={{ color: 'var(--text-tertiary)' }}
      >
       Primary Contact:
      </span>
      <span
       className="ml-2 text-[10px] md:text-[12px] dark:text-gray-100"
       style={{ color: 'var(--text-primary)' }}
      >
       {businessData.primaryContact}
      </span>
     </div>
     <div>
      <span
       className="text-[10px] md:text-[12px] font-medium dark:text-gray-400"
       style={{ color: 'var(--text-tertiary)' }}
      >
       Email:
      </span>
      <span
       className="ml-2 text-[10px] md:text-[12px] dark:text-gray-100"
       style={{ color: 'var(--text-primary)' }}
      >
       {businessData.email}
      </span>
     </div>
     <div>
      <span
       className="text-[10px] md:text-[12px] font-medium dark:text-gray-400"
       style={{ color: 'var(--text-tertiary)' }}
      >
       Phone:
      </span>
      <span
       className="ml-2 text-[10px] md:text-[12px] dark:text-gray-100"
       style={{ color: 'var(--text-primary)' }}
      >
       {businessData.phone}
      </span>
     </div>
     <div>
      <span
       className="text-[10px] md:text-[12px] font-medium dark:text-gray-400"
       style={{ color: 'var(--text-tertiary)' }}
      >
       Address:
      </span>
      <span
       className="ml-2 text-[10px] md:text-[12px] dark:text-gray-100"
       style={{ color: 'var(--text-primary)' }}
      >
       {businessData.address}
      </span>
     </div>
    </div>
   </div>

   {/* Subscription Details Card */}
   <div
    className="dark:bg-gray-800 border dark:border-gray-700 p-6 rounded-[var(--radius)]"
    style={{
     backgroundColor: 'var(--accent-white)',
     borderColor: 'var(--light-gray)'
    }}
   >
    <h2
     className="text-[12px] md:text-[14px] font-semibold dark:text-gray-100 mb-4"
     style={{ color: 'var(--text-primary)' }}
    >
     Subscription Details
    </h2>
    <div className="space-y-4">
     <div>
      <span
       className="text-[10px] md:text-[12px] font-medium dark:text-gray-400"
       style={{ color: 'var(--text-tertiary)' }}
      >
       User Count:
      </span>
      <span
       className="ml-2 text-[10px] md:text-[12px] dark:text-gray-100"
       style={{ color: 'var(--text-primary)' }}
      >
       {businessData.userCount} active users
      </span>
     </div>
     <div>
      <span
       className="text-[10px] md:text-[12px] font-medium dark:text-gray-400"
       style={{ color: 'var(--text-tertiary)' }}
      >
       Last Billing:
      </span>
      <span
       className="ml-2 text-[10px] md:text-[12px] dark:text-gray-100"
       style={{ color: 'var(--text-primary)' }}
      >
       {businessData.lastBilling}
      </span>
     </div>
    </div>
   </div>

   {/* Active Module Card */}
   <div
    className="dark:bg-gray-800 border dark:border-gray-700 p-6 rounded-[var(--radius)]"
    style={{
     backgroundColor: 'var(--accent-white)',
     borderColor: 'var(--light-gray)'
    }}
   >
    <h2
     className="text-[12px] md:text-[14px] font-semibold dark:text-gray-100 mb-4"
     style={{ color: 'var(--text-primary)' }}
    >
     Active Module
    </h2>
    <div className="flex flex-wrap gap-2">
     {businessData.activeModules.map((module, index) => (
      <Button
       key={index}
       variant="ghost"
       size="sm"
       className="px-4 py-2 text-[10px] md:text-[12px] font-medium transition-colors h-auto"
       style={{
        color: 'var(--text-secondary)',
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--light-gray)'
       }}
       onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.backgroundColor = 'var(--light-gray)';
       }}
       onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
       }}
       title={`Module: ${module}`}
      >
       {module}
      </Button>
     ))}
    </div>
   </div>
  </div>
 );
};

export default OverviewTabContent;
