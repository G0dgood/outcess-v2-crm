import React from 'react';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import Button from './Button';

export interface StatusOption {
 value: string;
 label: string;
 color?: string;
}

interface StatusSubmenuProps {
 isOpen: boolean;
 onBack: () => void;
 statusOptions: StatusOption[];
 onSelect: (option: StatusOption) => void;
 userName?: string;
 userAvatar?: string;
 currentStatus?: {
  status: string;
  color?: string;
 };
 userEmail?: string;
}

export const StatusSubmenu: React.FC<StatusSubmenuProps> = ({
 isOpen,
 onBack,
 statusOptions,
 onSelect,
 userName = '',
 userAvatar,
 currentStatus,
 userEmail = '',
}) => {
 if (!isOpen) return null;

 return (
  <div
   className="absolute right-0 top-full mt-2 w-80 dark:bg-gray-800 border dark:border-gray-700 shadow-lg z-50 overflow-hidden rounded-[var(--radius)]"
   style={{
    backgroundColor: 'var(--accent-white)',
    borderColor: 'var(--light-gray)'
   }}
  >
   {/* Profile Header (Persistent) */}
   <div
    className="p-4 border-b dark:border-gray-700"
    style={{
     borderColor: 'var(--light-gray)',
     backgroundColor: 'var(--bg-primary)'
    }}
   >
    <div className="flex items-center gap-3">
     <div className="relative">
      {userAvatar ? (
       <Image
        src={userAvatar}
        alt={userName}
        width={48}
        height={48}
        className="rounded-full border-2 border-white dark:border-gray-700 shadow-sm object-cover"
       />
      ) : (
       <div className="w-12 h-12 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center shadow-sm">
        <span
         className="font-bold text-sm dark:text-gray-100"
         style={{ color: 'var(--text-primary)' }}
        >
         {userName.charAt(0).toUpperCase()}
        </span>
       </div>
      )}
      {/* Status Dot */}
      {currentStatus && (
       <div
        className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
        style={{ backgroundColor: currentStatus.color || '#22C55E' }}
       />
      )}
     </div>

     <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-0.5">
       <h3
        className="font-bold text-base dark:text-gray-100 truncate"
        style={{ color: 'var(--text-primary)' }}
       >
        {userName}
       </h3>
       {currentStatus && (
        <span
         className="text-[9px] px-1.5 py-0.5 rounded-[var(--radius)] font-bold uppercase tracking-wider shrink-0"
         style={{
          backgroundColor: `${(currentStatus.color && currentStatus.color.startsWith('#')) ? currentStatus.color : '#22C55E'}15`,
          color: (currentStatus.color && currentStatus.color.startsWith('#')) ? currentStatus.color : '#22C55E',
          border: `1px solid ${(currentStatus.color && currentStatus.color.startsWith('#')) ? currentStatus.color : '#22C55E'}30`
         }}
        >
         {currentStatus.status || 'Active'}
        </span>
       )}
      </div>
      <p
       className="text-[11px] dark:text-gray-400 truncate"
       style={{ color: 'var(--text-tertiary)' }}
      >
       {userEmail}
      </p>
     </div>
    </div>
   </div>

   {/* Back Button Header */}
   <div
    className="px-4 py-2 border-b dark:border-gray-700"
    style={{ borderColor: 'var(--light-gray)' }}
   >
    <Button
     variant="ghost"
     size="sm"
     onClick={onBack}
     className="flex items-center gap-2 transition-colors cursor-pointer !bg-transparent h-auto p-0"
     style={{
      color: 'var(--text-secondary)',
     }}
     onMouseEnter={(e) => {
      e.currentTarget.style.color = 'var(--text-primary)';
     }}
     onMouseLeave={(e) => {
      e.currentTarget.style.color = 'var(--text-secondary)';
     }}
    >
     <ArrowLeftIcon className="w-4 h-4" />
     <span className="text-[10px] md:text-[12px] font-medium">Back</span>
    </Button>
   </div>
   <div style={{ backgroundColor: 'var(--accent-white)' }} className="dark:bg-gray-800">
    {statusOptions?.map((option) => (
     <Button
      variant="ghost"
      size="sm"
      key={option.value}
      fullWidth
      onClick={() => onSelect(option)}
      className="w-full px-4 py-2 text-left cursor-pointer font-lato font-medium text-[12px] md:text-[14px] leading-[150%] transition-colors flex items-center gap-2 whitespace-nowrap rounded-[var(--radius)] justify-start h-auto"
      style={{
       color: 'var(--text-primary)',
      }}
      onMouseEnter={(e) => {
       e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
       e.currentTarget.style.color = 'var(--text-primary)';
      }}
      onMouseLeave={(e) => {
       e.currentTarget.style.backgroundColor = 'transparent';
       e.currentTarget.style.color = 'var(--text-primary)';
      }}
     >
      {option.color && (
       <span
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: option.color }}
       />
      )}
      {option.label.length > 25 ? `${option.label.substring(0, 25)}...` : option.label}
     </Button>
    ))}
   </div>
  </div>
 );
};
