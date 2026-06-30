'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useCampaign } from '@/contexts/CampaignContext';
import { useAuth } from '@/contexts/AuthContext';
import { toastInfo } from '@/utils/toastWithSound';
import { useGetRolesByCampaignIdQuery } from '@/store/services/roleApi';

// Permission/Module types
export type ModuleId =
	| 'dashboard'
	| 'customerBook'
	| 'userManagement'
	| 'setupBook'
	| 'customerSMS'
	| 'report'
	| 'systemSetting'
	| 'auditLog'
	| 'status'
	| 'roles'
	| 'permission'
	| 'teamMembers'
	| 'campaignPlan'
	| 'support'
	| 'teamMemberSupport'
	| 'allSupport'
	| 'leaderboard'
	| 'buckets';

export type PermissionAction =
	| 'view'
	| 'create'
	| 'edit'
	| 'delete';

export interface RoleModulePermission {
	id: string;
	moduleName: string;
	access: boolean;
	permissions: {
		view: boolean;
		edit: boolean;
		delete: boolean;
		create: boolean;
	};
}

export interface UserRole {
	roleName: string;
	permissions: RoleModulePermission[];
	id?: string;
	description?: string;
}

export interface UserPrivileges {
	userId: string;
	roleId: string;
	role: UserRole | null;
}

interface PrivilegeContextType {
	// Current user privileges
	userPrivileges: UserPrivileges | null;
	isLoading: boolean;

	// Permission check methods
	hasPermission: (moduleId: ModuleId) => boolean;
	hasAnyPermission: (moduleIds: ModuleId[]) => boolean;
	hasAllPermissions: (moduleIds: ModuleId[]) => boolean;
	canAccess: (moduleId: ModuleId, action?: PermissionAction) => boolean;

	// Privilege management
	setUserPrivileges: (privileges: UserPrivileges) => void;
	clearPrivileges: () => void;
	isAdmin: boolean;
	isSuperAdmin: boolean;
}

import { useSelector, useDispatch } from 'react-redux';
import {
	selectUserPrivileges,
	selectIsPrivilegeLoading,
	selectIsAdmin,
	selectIsSuperAdmin,
	setPrivileges as setReduxPrivileges,
	clearPrivileges as clearReduxPrivileges,
	setLoading as setReduxLoading
} from '@/store/slices/privilegeSlice';

const PrivilegeContext = createContext<PrivilegeContextType | undefined>(undefined);

interface PrivilegeProviderProps {
	children: React.ReactNode;
	initialPrivileges?: UserPrivileges;
}

export const PrivilegeProvider: React.FC<PrivilegeProviderProps> = ({
	children,
	initialPrivileges,
}) => {
	const dispatch = useDispatch();
	const userPrivileges = useSelector(selectUserPrivileges);
	const isLoading = useSelector(selectIsPrivilegeLoading);
	const isAdmin = useSelector(selectIsAdmin);
	const isSuperAdmin = useSelector(selectIsSuperAdmin);

	const { socket } = useSocket();
	const { selectedCampaignId } = useCampaign();
	const { user, updateUser } = useAuth();

	// Add reactive query for roles in this Campaign
	const { data: rolesData } = useGetRolesByCampaignIdQuery(selectedCampaignId || '', {
		skip: !selectedCampaignId
	});

	console.log('rolesData--->', rolesData)
	console.log('selectedCampaignId--->', selectedCampaignId)

	// Reactively update user privileges when roles data changes
	useEffect(() => {
		if (!rolesData?.roles || !userPrivileges?.role) return;

		const currentRoleId = userPrivileges.roleId || userPrivileges.role.id || (userPrivileges.role as { _id?: string })._id;
		const matchingRole = rolesData.roles.find((r: { _id?: string; id?: string }) =>
			(r._id || r.id) === currentRoleId
		);

		if (matchingRole && JSON.stringify(matchingRole.permissions) !== JSON.stringify(userPrivileges.role.permissions)) {
			const updatedUserPrivileges = {
				...userPrivileges,
				role: {
					...userPrivileges.role,
					permissions: matchingRole.permissions
				}
			};

			dispatch(setReduxPrivileges(updatedUserPrivileges));

			if (user) {
				const currentRole = typeof user.role === 'object' ? user.role : { roleName: '', permissions: [] };
				const matchingRoleData = matchingRole as { roleName?: string; name?: string; permissions: RoleModulePermission[] };
				updateUser({
					...user,
					role: {
						...currentRole,
						roleName: currentRole.roleName || matchingRoleData.roleName || matchingRoleData.name || '',
						permissions: matchingRole.permissions
					}
				});
			}

		}
	}, [rolesData, userPrivileges, user, updateUser, dispatch]);

	// Initialize from localStorage or initial props
	useEffect(() => {
		dispatch(setReduxLoading(true));

		// Try to load from localStorage first
		try {
			const stored = localStorage.getItem('userPrivileges');
			if (stored) {
				const parsed = JSON.parse(stored);
				dispatch(setReduxPrivileges(parsed));
			} else if (initialPrivileges) {
				dispatch(setReduxPrivileges(initialPrivileges));
			}
		} catch (error) {
			console.error('Error loading privileges from localStorage:', error);
			if (initialPrivileges) {
				dispatch(setReduxPrivileges(initialPrivileges));
			}
		} finally {
			dispatch(setReduxLoading(false));
		}
	}, [initialPrivileges, dispatch]);

	// Socket integration for real-time role updates
	useEffect(() => {
		if (!socket || !selectedCampaignId) return;

		socket.emit("joinCampaign", selectedCampaignId);

		const handleUpdateRole = (data: { role: { _id?: string; id?: string; roleName: string; permissions: RoleModulePermission[] } }) => {
			if (!userPrivileges || !userPrivileges.role) return;

			const currentRoleId = userPrivileges.roleId || userPrivileges.role.id || (userPrivileges.role as { _id?: string })._id;
			const updatedRoleId = data.role._id || data.role.id;

			if (userPrivileges.role.roleName === data.role.roleName || (currentRoleId && updatedRoleId && currentRoleId === updatedRoleId)) {

				const updatedUserPrivileges = {
					...userPrivileges,
					role: {
						...userPrivileges.role,
						permissions: data.role.permissions
					}
				};

				dispatch(setReduxPrivileges(updatedUserPrivileges));

				if (user) {
					updateUser({
						...user,
						role: {
							...(user.role as { roleName: string; permissions: RoleModulePermission[] }),
							permissions: data.role.permissions
						}
					});
				}

				toastInfo("Your permissions have been updated.");
			}
		};

		socket.on("updateRole", handleUpdateRole);

		return () => {
			socket.off("updateRole", handleUpdateRole);
		};
	}, [socket, selectedCampaignId, userPrivileges, user, updateUser, dispatch]);

	const findModulePermission = (moduleId: string): RoleModulePermission | undefined => {
		if (!userPrivileges?.role?.permissions) return undefined;
		const normalize = (str?: string) => (str ?? '').replace(/\s+/g, '').toLowerCase();
		const target = normalize(moduleId);
		return userPrivileges.role.permissions.find(p => normalize(p.moduleName) === target);
	};

	const hasPermission = (moduleId: ModuleId): boolean => {
		if (!userPrivileges) return false;
		if (isAdmin) return true;
		const modulePermission = findModulePermission(moduleId);
		return modulePermission ? modulePermission.access : false;
	};

	const hasAnyPermission = (moduleIds: ModuleId[]): boolean => {
		return moduleIds.some(moduleId => hasPermission(moduleId));
	};

	const hasAllPermissions = (moduleIds: ModuleId[]): boolean => {
		return moduleIds.every(moduleId => hasPermission(moduleId));
	};

	const canAccess = (moduleId: ModuleId, action?: PermissionAction): boolean => {
		if (!userPrivileges) {
			console.log(`[canAccess] No userPrivileges — denying ${moduleId}`);
			return false;
		}
		if (isAdmin) return true;
		const modulePermission = findModulePermission(moduleId);
		console.log(`[canAccess] moduleId="${moduleId}" action="${action}" found=`, modulePermission ? { moduleName: modulePermission.moduleName, access: modulePermission.access, view: modulePermission.permissions?.view } : 'NOT FOUND',
			'allModuleNames=', userPrivileges.role?.permissions?.map(p => p.moduleName));
		if (modulePermission) {
			if (!modulePermission.access) return false;
			if (!action) return true;
			return modulePermission.permissions[action];
		}
		return false;
	};

	const setUserPrivileges = (privileges: UserPrivileges) => {
		dispatch(setReduxPrivileges(privileges));
	};

	const clearPrivileges = () => {
		dispatch(clearReduxPrivileges());
	};

	const contextValue: PrivilegeContextType = {
		userPrivileges,
		isLoading,
		hasPermission,
		hasAnyPermission,
		hasAllPermissions,
		canAccess,
		setUserPrivileges,
		clearPrivileges,
		isAdmin,
		isSuperAdmin,
	};

	return (
		<PrivilegeContext.Provider value={contextValue}>
			{children}
		</PrivilegeContext.Provider>
	);
};

export const usePrivilege = () => {
	const context = useContext(PrivilegeContext);
	if (context === undefined) {
		throw new Error('usePrivilege must be used within a PrivilegeProvider');
	}
	return context;
};

export default PrivilegeContext;
