import React from 'react';
import Image from 'next/image';
import { useRouter } from '@bprogress/next/app';
import Icon from './Icon';

interface UserMenuProps {
 isOpen: boolean;
 userAvatar?: string;
 userName: string;
 userEmail: string;
 onStatusClick: () => void;
 onClose: () => void;
 onLogoutClick?: () => void;
 currentStatus?: {
  status: string;
  color?: string;
 };
 showStatus?: boolean;
}

export const UserMenu: React.FC<UserMenuProps> = ({
 isOpen,
 userAvatar,
 userName,
 userEmail,
 onStatusClick,
 onClose,
 onLogoutClick,
 currentStatus,
 showStatus
}) => {
 const router = useRouter();

 if (!isOpen) return null;

 return (
  <div
   className="absolute right-0 top-full mt-2 w-80 dark:bg-gray-800 border dark:border-gray-700 shadow-lg z-50 overflow-hidden"
   style={{
    backgroundColor: 'var(--accent-white)',
    borderColor: 'var(--light-gray)'
   }}
  >
   {/* User Info Section */}
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
         className="text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider shrink-0"
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

   {/* Menu Items */}
   <div style={{ backgroundColor: 'var(--accent-white)' }} className="dark:bg-gray-800">
    {/* Status */}
    {showStatus && (
     <div className="relative">
      <button
       onClick={(e) => {
        e.stopPropagation();
        onStatusClick();
       }}
       className="w-full px-4 py-2 text-left flex items-center justify-between transition-colors"
       style={{
        color: 'var(--text-secondary)',
        backgroundColor: 'transparent'
       }}
       onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
       }}
       onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
       }}
      >
       <div className="flex items-center gap-2">
        <span>Status</span>
        {currentStatus && (
         <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: currentStatus.color }}
         />
        )}
       </div>
       <div className="flex items-center gap-1">
        {currentStatus && (
         <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
          {currentStatus.status}
         </span>
        )}
        <Icon name="Expand_right_light" size="md" />
       </div>
      </button>
     </div>
    )}

    {/* Settings */}
    <button
     onClick={() => {
      router.push('/usersettings');
      onClose();
     }}
     className="w-full px-4 py-2 text-left cursor-pointer transition-colors"
     style={{
      color: 'var(--text-secondary)',
      backgroundColor: 'transparent'
     }}
     onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
     }}
     onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'transparent';
     }}
    >
     Settings
    </button>

    {/* Separator */}
    <div
     className="border-t my-2 dark:border-gray-700"
     style={{ borderColor: 'var(--light-gray)' }}
    ></div>

    {/* Logout */}
    <button
     onClick={() => {
      onLogoutClick?.();
      onClose();
     }}
     className="w-full px-4 py-2 text-left flex items-center gap-2 cursor-pointer transition-colors"
     style={{
      color: 'var(--status-error)',
      backgroundColor: 'transparent'
     }}
     onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
     }}
     onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'transparent';
     }}
    >
     <Icon name="Sign_out_squre_light" size="lg" color="red" className="dark:invert-0! dark:opacity-100!" />
     Log out
    </button>
   </div>
  </div>
 );
};
