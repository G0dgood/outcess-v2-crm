'use client';

import React, { useState } from 'react';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { useGetSupervisorsByLineOfBusinessIdQuery } from '@/store/services/teamMembersApi';
import { useDeleteRoleMutation } from '@/store/services/roleApi';
import RolesSkeleton from '@/components/skeletons/RolesSkeleton';
import PageHeading from './PageHeading';
import SubPageHeading from './SubPageHeading';
import Button from './Button';
import DeleteRoleModal from '@/components/features/role/DeleteRoleModal';
import { ExclamationTriangleIcon, TrashIcon, CopyIcon } from '@radix-ui/react-icons';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { toast } from 'sonner';
import CreateSupervisorRoleModal from './CreateSupervisorRoleModal';

interface SupervisorRole {
  _id?: string;
  id?: string;
  roleName?: string;
  description?: string;
  supervisorTitle?: string;
}

interface SupervisorsProps {
  className?: string;
}

const Supervisors: React.FC<SupervisorsProps> = ({ className = '' }) => {
  const { selectedLineOfBusinessId } = useLineOfBusiness();
  const { user } = useUserInfo();
  const { canAccess } = usePrivilege();

  const lineOfBusinessId = selectedLineOfBusinessId || '';
  const companyId =
    (user?.company as { _id?: string; id?: string } | undefined)?._id ||
    (user?.company as { _id?: string; id?: string } | undefined)?.id ||
    user?.companyId ||
    '';

  const {
    data: supervisorsResponse,
    isLoading,
    refetch,
  } = useGetSupervisorsByLineOfBusinessIdQuery(
    { companyId, lineOfBusinessId },
    {
      skip: !companyId || !lineOfBusinessId,
    }
  );

  const roles: SupervisorRole[] = supervisorsResponse?.roles
    ? (supervisorsResponse.roles as SupervisorRole[])
    : [];

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleteRole] = useDeleteRoleMutation();

  const canCreateSupervisorRole = canAccess('userManagement', 'create');
  const canDeleteSupervisorRole = canAccess('userManagement', 'delete');

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleDeleteRoleClick = (roleId: string, roleName: string) => {
    setRoleToDelete({ id: roleId, name: roleName });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;

    try {
      await deleteRole(roleToDelete.id).unwrap();
      toast.success('Supervisor role deleted successfully');
      setDeleteModalOpen(false);
      setRoleToDelete(null);
      refetch();
    } catch {
      toast.error('Failed to delete supervisor role');
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('Supervisor ID copied to clipboard');
  };

  if (isLoading) {
    return <RolesSkeleton className={className} />;
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <PageHeading text="Supervisors" />
          <SubPageHeading text="Supervisors for this line of business." />
        </div>
        {canCreateSupervisorRole && (
          <div className="flex flex-wrap items-center justify-end sm:justify-start gap-2 sm:gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={handleOpenCreateModal}
              className="px-2 py-2 sm:px-4 sm:py-2 text-[10px] md:text-[12px]"
            >
              Create Supervisor Role
            </Button>
          </div>
        )}
      </div>

      {roles?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => {
            const roleId = role._id || role.id || '';
            return (
              <div
                key={roleId || role.roleName}
                className="dark:bg-gray-800 border dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-lg transition-shadow group rounded-[var(--radius)]"
                style={{
                  backgroundColor: 'var(--accent-white)',
                  borderColor: 'var(--light-gray)',
                  boxShadow:
                    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3
                      className="text-[12px] md:text-[14px] font-semibold dark:text-gray-100"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {role.supervisorTitle || 'Supervisor Role'}
                    </h3>
                    <p
                      className="text-[10px] md:text-[12px] dark:text-gray-400"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {role.description || ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 -mr-2 -mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyId(roleId);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-gray-700 h-auto"
                      title="Copy Supervisor ID"
                    >
                      <CopyIcon className="w-4 h-4 text-blue-500" />
                    </Button>
                    {canDeleteSupervisorRole && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRoleClick(roleId, role.roleName || '');
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-gray-700 h-auto"
                        title="Delete Supervisor Role"
                      >
                        <TrashIcon className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <span className="text-[9px] text-gray-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    ID: {roleId.substring(0, 8)}...
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center h-64 border dark:border-gray-700 rounded-[var(--radius)]"
          style={{ borderColor: 'var(--light-gray)' }}
        >
          <ExclamationTriangleIcon
            className="w-16 h-16 mb-4"
            style={{ color: 'var(--text-tertiary)' }}
          />
          <p
            className="text-[12px] md:text-[14px] font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            No supervisors found
          </p>
          <p
            className="text-[10px] md:text-[12px] mt-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Create a supervisor role to get started
          </p>
        </div>
      )}

      <CreateSupervisorRoleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        lineOfBusinessId={lineOfBusinessId}
      />

      <DeleteRoleModal
        isOpen={deleteModalOpen}
        roleName={roleToDelete?.name || ''}
        onClose={() => {
          setDeleteModalOpen(false);
          setRoleToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Supervisors;
