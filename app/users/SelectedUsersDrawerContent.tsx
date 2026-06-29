import React, { useState, useMemo } from 'react';
import { PersonIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';
import {
  useDeleteManyTeamMembersMutation,
  useGetSupervisorsByCampaignIdQuery,
  useGetTeamMembersByCampaignIdQuery,
  useAssignSupervisorToTeamMembersMutation,
  ApiTeamMember
} from '@/store/services/teamMembersApi';
import { useAuth } from '@/contexts/AuthContext';
import { useCampaign } from '@/contexts/CampaignContext';
import { Dropdown } from '@/components/ui/Dropdown';

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
  onBulkDeleteSuccess?: () => void;
  onBulkAssignSupervisorSuccess?: () => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

const SelectedUsersDrawerContent: React.FC<SelectedUsersDrawerContentProps> = ({
  selectedUsers,
  users,
  onClose,
  onBulkDeleteSuccess,
  onBulkAssignSupervisorSuccess,
  onEdit,
  onDelete,
}) => {
  const [deleteManyTeamMembers, { isLoading: isDeletingMany }] = useDeleteManyTeamMembersMutation();
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const { user } = useAuth();
  const { campaignData } = useCampaign();
  const companyId = user?.companyId || '';
  const campaignId = campaignData?._id || '';

  const { data: supervisorsResponse, isLoading: isSupervisorsLoading } = useGetSupervisorsByCampaignIdQuery(
    { companyId, campaignId },
    { skip: !companyId || !campaignId }
  );

  const { data: teamMembersData } = useGetTeamMembersByCampaignIdQuery(
    { campaignId, limit: 1000 },
    { skip: !campaignId }
  );

  const [assignSupervisor, { isLoading: isAssigningSupervisor }] = useAssignSupervisorToTeamMembersMutation();
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>('');

  const supervisorOptions = useMemo(() => {
    if (!teamMembersData) return [];
    const rawMembers = teamMembersData.teamMembers || (Array.isArray(teamMembersData) ? teamMembersData : []);

    const supervisorRoleIds = new Set<string>();
    if (supervisorsResponse && Array.isArray(supervisorsResponse.roles)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      supervisorsResponse.roles.forEach((r: any) => {
        if (r._id) supervisorRoleIds.add(r._id.toString());
        if (r.id) supervisorRoleIds.add(r.id.toString());
      });
    }

    return rawMembers
      .filter((m: ApiTeamMember) => {
        const roleId = typeof m.role === 'object' ? m.role?._id || m.role?.id : m.role;
        const roleName = typeof m.role === 'object' ? m.role?.roleName || m.role?.name : '';

        const isSupervisorRole = (roleId && supervisorRoleIds.has(roleId.toString())) ||
          (roleName && roleName.toLowerCase().includes('supervisor'));

        const isSelected = selectedUsers.has(m._id || m.id || '');

        return isSupervisorRole && !isSelected;
      })
      .map((m: ApiTeamMember) => {
        const fullName = m.firstName && m.lastName
          ? `${m.firstName} ${m.lastName}`
          : m.name || (m as { fullName?: string }).fullName || 'Unknown Member';
        const roleName = typeof m.role === 'object' ? m.role?.roleName || m.role?.name : 'Supervisor';
        return {
          value: m._id || m.id || '',
          label: `${fullName} (${roleName})`
        };
      });
  }, [teamMembersData, supervisorsResponse, selectedUsers]);

  const handleAssignSupervisor = async () => {
    try {
      const idsToAssign = Array.from(selectedUsers);
      await assignSupervisor({
        supervisorId: selectedSupervisorId || null,
        teamMemberIds: idsToAssign,
      }).unwrap();
      toast.success('Supervisor assigned successfully');
      setSelectedSupervisorId('');
      if (onBulkAssignSupervisorSuccess) {
        onBulkAssignSupervisorSuccess();
      }
    } catch {
      toast.error('Failed to assign supervisor');
    }
  };

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
    } catch {
      toast.error('Failed to delete selected users');
    }
  };

  return (
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
            className="font-inter text-[12px] md:text-[14px] font-semibold dark:text-gray-100"
            style={{ color: 'var(--text-primary)' }}
          >
            Selected Users ({selectedUsers.size})
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {selectedUsers.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkDeleteConfirm(true)}
              disabled={isDeletingMany}
              className="flex items-center gap-2 px-3 py-1.5 text-[8px] md:text-[10px] font-medium text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Delete Selected"
            >
              <TrashIcon className="w-3.5 h-3.5" />
              Delete
            </Button> 
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-auto transition-colors cursor-pointer"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
            title="Close"
          >
            <Icon name="Close_round_light" size="lg" />
          </Button>
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
              className="text-[10px] md:text-[12px] dark:text-gray-400"
              style={{ color: 'var(--text-tertiary)' }}
            >
              No users selected
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Bulk Supervisor Assignment Card */}
            <div
              className="p-4 border rounded-lg space-y-3 mb-6 transition-all"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--light-gray)'
              }}
            >
              <div className="flex items-center gap-2">
                <PersonIcon className="w-4 h-4 text-blue-500" />
                <h3
                  className="text-[12px] font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Assign to Supervisor
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                <Dropdown
                  label="Select Supervisor"
                  placeholder={isSupervisorsLoading ? "Loading supervisors..." : "Choose a supervisor"}
                  options={supervisorOptions}
                  value={selectedSupervisorId}
                  onChange={(val) => setSelectedSupervisorId(val as string)}
                  disabled={isSupervisorsLoading || isAssigningSupervisor}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAssignSupervisor}
                  disabled={!selectedSupervisorId || isAssigningSupervisor}
                  loading={isAssigningSupervisor}
                  className="w-full mt-1 py-2 text-[10px] md:text-[12px] font-medium"
                >
                  Assign Selected Users
                </Button>
              </div>
            </div>

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
                            className="inline-flex items-center px-2 py-0.5  text-[8px] md:text-[10px] font-medium"
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
                          className="text-[10px] md:text-[12px] font-medium dark:text-gray-100 mb-1"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {user.firstName} {user.lastName}
                        </p>
                        <p
                          className="text-[8px] md:text-[10px] dark:text-gray-400"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          {user.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(user)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-700 rounded-md transition-colors"
                            title="Edit User"
                          >
                            <Pencil1Icon className="w-4 h-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(user)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-gray-700 rounded-md transition-colors"
                            title="Delete User"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* User Details */}
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-[8px] md:text-[10px]">
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
                      <div className="flex items-center justify-between text-[8px] md:text-[10px]">
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
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 p-6  shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-[12px] md:text-[14px] font-semibold mb-2 dark:text-gray-100">Confirm Deletion</h3>
            <p className="text-[10px] md:text-[12px] text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete {selectedUsers.size} selected users? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-4 py-2 font-medium"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleBulkDelete}
                loading={isDeletingMany}
                className="px-4 py-2 font-medium"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SelectedUsersDrawerContent;
