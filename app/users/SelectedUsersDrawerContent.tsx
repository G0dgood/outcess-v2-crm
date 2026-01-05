import React, { useState } from 'react';
import { PersonIcon } from '@radix-ui/react-icons';
import Icon from '@/components/ui/Icon';
import { toast } from 'sonner';
import { useDeleteManyTeamMembersMutation } from '@/store/services/teamMembersApi';

interface User {
 id: string;
 firstName: string;
 lastName: string;
 email: string;
 phone: string;
 role: string;
 userId: string;
 loginStatus: string;
}

interface SelectedUsersDrawerContentProps {
 selectedUsers: Set<string>;
 users: User[];
 onClose: () => void;
 onEdit: (user: User) => void;
 onDelete: (user: User) => void;
 onBulkDeleteSuccess?: () => void;
}

const SelectedUsersDrawerContent: React.FC<SelectedUsersDrawerContentProps> = ({
 selectedUsers,
 users,
 onClose,
 onEdit,
 onDelete,
 onBulkDeleteSuccess,
}) => {
 const [deleteManyTeamMembers, { isLoading: isDeletingMany }] = useDeleteManyTeamMembersMutation();
 const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

 const handleBulkDelete = async () => {
  try {
   const idsToDelete = Array.from(selectedUsers);
   await deleteManyTeamMembers({ ids: idsToDelete }).unwrap();
   toast.success('Selected users deleted successfully');
   setShowBulkDeleteConfirm(false);
   if (onBulkDeleteSuccess) {
    onBulkDeleteSuccess();
   } else {
    // Fallback if no callback provided: close drawer
    onClose();
   }
  } catch (error) {
   toast.error('Failed to delete selected users');
  }
 }; return (
  <>
   {/* Drawer Header */}
   <div
    className="flex justify-between items-center border-b dark:border-gray-700 p-6"
    style={{ borderColor: 'var(--light-gray)' }}
   >
    <div className="flex items-center gap-3">
     <PersonIcon
      className="w-5 h-5 dark:text-gray-300"
      style={{ color: 'var(--text-primary)' }}
     />
     <h2
      className="font-inter text-lg font-semibold dark:text-gray-100"
      style={{ color: 'var(--text-primary)' }}
     >
      Selected Users ({selectedUsers.size})
     </h2>
    </div>
    <div className="flex items-center gap-2">
     {selectedUsers.size > 0 && (
      <button
       onClick={() => setShowBulkDeleteConfirm(true)}
       disabled={isDeletingMany}
       className="text-xs py-1 px-3  border dark:border-gray-600 transition-colors dark:text-gray-300 dark:hover:bg-gray-600 flex items-center gap-1"
       style={{
        borderColor: 'var(--light-gray)',
        color: '#DC2626',
        backgroundColor: 'transparent'
       }}
       onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
       }}
       onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
       }}
      >
       {/* <Icon name="Trash" size="sm" /> */}
       {isDeletingMany ? 'Deleting...' : 'Delete All'}
      </button>
     )}
     <button
      onClick={onClose}
      className="dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
      style={{ color: 'var(--text-tertiary)' }}
      onMouseEnter={(e) => {
       e.currentTarget.style.color = 'var(--text-secondary)';
      }}
      onMouseLeave={(e) => {
       e.currentTarget.style.color = 'var(--text-tertiary)';
      }}
     >
      <Icon name="Close_round_light" size="lg" />
     </button>
    </div>
   </div>

   {/* Drawer Content */}
   <div className="overflow-y-auto h-[calc(100vh-80px)] p-6">
    {selectedUsers.size === 0 ? (
     <div className="flex flex-col items-center justify-center h-full text-center">
      <PersonIcon
       className="w-12 h-12 mb-4 dark:text-gray-400"
       style={{ color: 'var(--text-tertiary)' }}
      />
      <p
       className="text-sm dark:text-gray-400"
       style={{ color: 'var(--text-tertiary)' }}
      >
       No users selected
      </p>
     </div>
    ) : (
     <div className="space-y-4">
      {users
       .filter(user => selectedUsers.has(user.id))
       .map((user) => {
        const getLoginStatusColor = (status: string) => {
         return status === 'Logged In'
          ? { bg: 'rgba(34, 197, 94, 0.1)', text: '#22C55E', border: 'rgba(34, 197, 94, 0.2)' }
          : { bg: 'rgba(156, 163, 175, 0.1)', text: '#9CA3AF', border: 'rgba(156, 163, 175, 0.2)' };
        };
        const loginStatusColors = getLoginStatusColor(user.loginStatus);
        return (
         <div
          key={user.id}
          className="p-4 dark:bg-gray-700 border dark:border-gray-600"
          style={{
           backgroundColor: 'var(--bg-primary)',
           borderColor: 'var(--light-gray)'
          }}
         >
          {/* User Header */}
          <div className="flex justify-between items-start mb-3">
           <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">

             <span
              className="inline-flex items-center px-2 py-0.5  text-xs font-medium"
              style={{
               backgroundColor: loginStatusColors.bg,
               color: loginStatusColors.text,
               border: `1px solid ${loginStatusColors.border}`
              }}
             >
              {user.loginStatus}
             </span>
            </div>
            <p
             className="text-sm font-medium dark:text-gray-100 mb-1"
             style={{ color: 'var(--text-primary)' }}
            >
             {user.firstName} {user.lastName}
            </p>
            <p
             className="text-xs dark:text-gray-400"
             style={{ color: 'var(--text-tertiary)' }}
            >
             {user.email}
            </p>
           </div>
          </div>

          {/* User Details */}
          <div className="mt-3 space-y-2">
           <div className="flex items-center justify-between text-xs">
            <span
             className="dark:text-gray-400"
             style={{ color: 'var(--text-tertiary)' }}
            >
             Phone:
            </span>
            <span
             className="dark:text-gray-100"
             style={{ color: 'var(--text-primary)' }}
            >
             {user.phone}
            </span>
           </div>
           <div className="flex items-center justify-between text-xs">
            <span
             className="dark:text-gray-400"
             style={{ color: 'var(--text-tertiary)' }}
            >
             Role:
            </span>
            <span
             className="dark:text-gray-100"
             style={{ color: 'var(--text-primary)' }}
            >
             {user.role}
            </span>
           </div>
          </div>


         </div>
        );
       })}
     </div>
    )}
   </div>
   {/* Confirmation Modal */}
   {showBulkDeleteConfirm && (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
     <div className="bg-white dark:bg-gray-800 p-6  shadow-xl max-w-sm w-full mx-4">
      <h3 className="text-lg font-semibold mb-2 dark:text-gray-100">Confirm Deletion</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
       Are you sure you want to delete {selectedUsers.size} selected users? This action cannot be undone.
      </p>
      <div className="flex justify-end gap-3">
       <button
        onClick={() => setShowBulkDeleteConfirm(false)}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
       >
        Cancel
       </button>
       <button
        onClick={handleBulkDelete}
        disabled={isDeletingMany}
        className="px-4 py-2 text-sm font-medium text-white bg-red-600   hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
       >
        {isDeletingMany ? 'Deleting...' : 'Delete'}
       </button>
      </div>
     </div>
    </div>
   )}
  </>
 );
};

export default SelectedUsersDrawerContent;
