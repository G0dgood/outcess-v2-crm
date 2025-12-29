'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { toastInfo } from '@/utils/toastWithSound';

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
	| 'teamMembers';

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

const PrivilegeContext = createContext<PrivilegeContextType | undefined>(undefined);

interface PrivilegeProviderProps {
	children: ReactNode;
	initialPrivileges?: UserPrivileges;
}

export const PrivilegeProvider: React.FC<PrivilegeProviderProps> = ({
	children,
	initialPrivileges,
}) => {
	const [userPrivileges, setUserPrivilegesState] = useState<UserPrivileges | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const { socket } = useSocket();
	const { selectedLineOfBusinessId } = useLineOfBusiness();
	const { user, updateUser } = useAuth();

	// Initialize from localStorage or initial props
	useEffect(() => {
		setIsLoading(true);

		// Try to load from localStorage first
		try {
			const stored = localStorage.getItem('userPrivileges');
			if (stored) {
				const parsed = JSON.parse(stored);
				setUserPrivilegesState(parsed);
			} else if (initialPrivileges) {
				setUserPrivilegesState(initialPrivileges);
			}
		} catch (error) {
			console.error('Error loading privileges from localStorage:', error);
			if (initialPrivileges) {
				setUserPrivilegesState(initialPrivileges);
			}
		} finally {
			setIsLoading(false);
		}
	}, [initialPrivileges]);

	// Save to localStorage when privileges change
	useEffect(() => {
		if (userPrivileges) {
			try {
				localStorage.setItem('userPrivileges', JSON.stringify(userPrivileges));
			} catch (error) {
				console.error('Error saving privileges to localStorage:', error);
			}
		}
	}, [userPrivileges]);

	// Socket integration for real-time role updates
	useEffect(() => {
		if (!socket || !selectedLineOfBusinessId) return;

		// Join the Line of Business room
		console.log('PrivilegeContext: Joining LineOfBusiness room:', selectedLineOfBusinessId);
		socket.emit("joinLineOfBusiness", selectedLineOfBusinessId);

		const handleUpdateRole = (data: any) => {
			console.log("PrivilegeContext: Role updated event received:", data);

			if (!userPrivileges || !userPrivileges.role) return;

			// Check if the updated role matches the logged-in user's role
			const currentRoleId = userPrivileges.roleId || userPrivileges.role.id || (userPrivileges.role as any)._id;
			const updatedRoleId = data.role._id || data.role.id;

			if (userPrivileges.role.roleName === data.role.roleName || (currentRoleId && updatedRoleId && currentRoleId === updatedRoleId)) {

				// Update the user's permissions in state immediately
				const updatedUserPrivileges = {
					...userPrivileges,
					role: {
						...userPrivileges.role,
						permissions: data.role.permissions
					}
				};

				setUserPrivilegesState(updatedUserPrivileges);

				// Update AuthContext user
				if (user) {
					updateUser({
						...user,
						role: {
							...(user.role as any),
							permissions: data.role.permissions
						} as any
					});
				}

				// Update LocalStorage
				try {
					localStorage.setItem('userPrivileges', JSON.stringify(updatedUserPrivileges));

					// Also update the main user object in localStorage
					const storedUser = localStorage.getItem('peoplely-user');
					if (storedUser) {
						const parsedUser = JSON.parse(storedUser);
						if (parsedUser.role && typeof parsedUser.role === 'object') {
							parsedUser.role.permissions = data.role.permissions;
							localStorage.setItem('peoplely-user', JSON.stringify(parsedUser));
						}
					}
				} catch (error) {
					console.error('Error saving privileges to localStorage:', error);
				}

				// Show a toast notification
				toastInfo("Your permissions have been updated.");
			}
		};

		socket.on("updateRole", handleUpdateRole);

		return () => {
			socket.off("updateRole", handleUpdateRole);
		};
	}, [socket, selectedLineOfBusinessId, userPrivileges]);

	// Helper to match moduleId with moduleName
	const findModulePermission = (moduleId: string): RoleModulePermission | undefined => {
		if (!userPrivileges?.role?.permissions) return undefined;

		const normalize = (str?: string) => (str ?? '').replace(/\s+/g, '').toLowerCase();
		const target = normalize(moduleId);

		return userPrivileges.role.permissions.find(p => normalize(p.moduleName) === target);
	};

	// Check if user has permission for a specific module
	const hasPermission = (moduleId: ModuleId): boolean => {
		if (!userPrivileges) return false;

		// Administrator always has all permissions
		if (userPrivileges.role?.roleName === 'Administrator' || userPrivileges.role?.roleName === 'admin' ||
			userPrivileges.roleId === 'administrator') {
			return true;
		}

		// Check granular permissions first
		const modulePermission = findModulePermission(moduleId);
		if (modulePermission) {
			return modulePermission.access;
		}

		return false;
	};

	// Check if user has permission for any of the provided modules
	const hasAnyPermission = (moduleIds: ModuleId[]): boolean => {
		return moduleIds.some(moduleId => hasPermission(moduleId));
	};

	// Check if user has permission for all of the provided modules
	const hasAllPermissions = (moduleIds: ModuleId[]): boolean => {
		return moduleIds.every(moduleId => hasPermission(moduleId));
	};

	// Check if user can perform a specific action on a module
	const canAccess = (moduleId: ModuleId, action?: PermissionAction): boolean => {
		if (!userPrivileges) return false;

		// Administrator can do everything
		if (userPrivileges.role?.roleName === 'Administrator' || userPrivileges.role?.roleName === 'admin' || userPrivileges.roleId === 'administrator') {
			return true;
		}

		const modulePermission = findModulePermission(moduleId);

		// If we have granular permissions, use them
		if (modulePermission) {
			if (!modulePermission.access) return false;

			if (!action) return true;

			if (action === 'view' ||
				action === 'create' ||
				action === 'edit' ||
				action === 'delete') {
				return modulePermission.permissions[action];
			}

			return false;
		}

		return false;
	};

	// Set user privileges
	const setUserPrivileges = (privileges: UserPrivileges) => {
		setUserPrivilegesState(privileges);
	};

	// Clear user privileges
	const clearPrivileges = () => {
		setUserPrivilegesState(null);
		try {
			localStorage.removeItem('userPrivileges');
		} catch (error) {
			console.error('Error clearing privileges from localStorage:', error);
		}
	};

	const isAdmin = React.useMemo(() => {
		if (!userPrivileges) return false;
		return (
			userPrivileges.role?.roleName === 'Administrator' ||
			userPrivileges.role?.roleName === 'admin' ||
			userPrivileges.roleId === 'administrator'
		);
	}, [userPrivileges]);

	const isSuperAdmin = React.useMemo(() => {
		if (!userPrivileges) return false;
		const roleName = userPrivileges.role?.roleName || '';
		return roleName.toLowerCase() === 'super admin';
	}, [userPrivileges]);

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
