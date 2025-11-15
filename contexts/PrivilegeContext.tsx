'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

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
	| 'delete'
	| 'export'
	| 'manage';

export interface Permission {
	moduleId: ModuleId;
	actions: PermissionAction[];
}

export interface UserRole {
	id: string;
	name: string;
	description: string;
	permissions: Record<ModuleId, boolean>;
}

export interface UserPrivileges {
	userId: string;
	roleId: string;
	role: UserRole | null;
	permissions: Record<ModuleId, boolean>;
	customPermissions?: Permission[];
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
	updateUserPrivileges: (updates: Partial<UserPrivileges>) => void;
	clearPrivileges: () => void;

	// Role management helpers
	getAvailableRoles: () => UserRole[];
	setAvailableRoles: (roles: UserRole[]) => void;
}

const PrivilegeContext = createContext<PrivilegeContextType | undefined>(undefined);

// Default roles (can be overridden)
const defaultRoles: UserRole[] = [
	{
		id: 'administrator',
		name: 'Administrator',
		description: 'Full access to the system',
		permissions: {
			dashboard: true,
			customerBook: true,
			userManagement: true,
			setupBook: true,
			customerSMS: true,
			report: true,
			systemSetting: true,
			auditLog: true,
			teamMembers: true,
		},
	},
	{
		id: 'supervisor',
		name: 'Supervisor',
		description: 'Manage team and view reports',
		permissions: {
			dashboard: true,
			customerBook: true,
			userManagement: false,
			setupBook: false,
			customerSMS: true,
			report: true,
			systemSetting: false,
			auditLog: true,
			teamMembers: true,
		},
	},
	{
		id: 'agent',
		name: 'Agent',
		description: 'Basic access to customer and call management',
		permissions: {
			dashboard: true,
			customerBook: true,
			userManagement: false,
			setupBook: false,
			customerSMS: true,
			report: false,
			systemSetting: false,
			auditLog: false,
			teamMembers: false,
		},
	},
];

interface PrivilegeProviderProps {
	children: ReactNode;
	initialPrivileges?: UserPrivileges;
	initialRoles?: UserRole[];
}

export const PrivilegeProvider: React.FC<PrivilegeProviderProps> = ({
	children,
	initialPrivileges,
	initialRoles
}) => {
	const [userPrivileges, setUserPrivilegesState] = useState<UserPrivileges | null>(null);
	const [availableRoles, setAvailableRolesState] = useState<UserRole[]>(initialRoles || defaultRoles);
	const [isLoading, setIsLoading] = useState(true);

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

	// Check if user has permission for a specific module
	const hasPermission = (moduleId: ModuleId): boolean => {
		if (!userPrivileges) return false;

		// Administrator always has all permissions
		if (userPrivileges.roleId === 'administrator') {
			return true;
		}

		return userPrivileges.permissions[moduleId] === true;
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
		if (userPrivileges.roleId === 'administrator') {
			return true;
		}

		// Check module access first
		if (!hasPermission(moduleId)) {
			return false;
		}

		// If no specific action required, module access is enough
		if (!action) {
			return true;
		}

		// Check custom permissions for specific actions
		if (userPrivileges.customPermissions) {
			const modulePermission = userPrivileges.customPermissions.find(
				p => p.moduleId === moduleId
			);
			if (modulePermission) {
				return modulePermission.actions.includes(action);
			}
		}

		// Default: if module access is granted, allow all actions
		// (unless custom permissions restrict it)
		return true;
	};

	// Set user privileges
	const setUserPrivileges = (privileges: UserPrivileges) => {
		// Find and attach role object if roleId is provided
		if (privileges.roleId && !privileges.role) {
			const role = availableRoles.find(r => r.id === privileges.roleId);
			if (role) {
				privileges.role = role;
				// Sync permissions from role if not explicitly provided
				if (!privileges.permissions || Object.keys(privileges.permissions).length === 0) {
					privileges.permissions = { ...role.permissions };
				}
			}
		}
		setUserPrivilegesState(privileges);
	};

	// Update user privileges partially
	const updateUserPrivileges = (updates: Partial<UserPrivileges>) => {
		if (!userPrivileges) return;

		const updated = { ...userPrivileges, ...updates };

		// If roleId changed, update role and permissions
		if (updates.roleId && updates.roleId !== userPrivileges.roleId) {
			const role = availableRoles.find(r => r.id === updates.roleId);
			if (role) {
				updated.role = role;
				updated.permissions = { ...role.permissions };
			}
		}

		setUserPrivilegesState(updated);
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

	// Get available roles
	const getAvailableRoles = (): UserRole[] => {
		return availableRoles;
	};

	// Set available roles
	const setAvailableRoles = (roles: UserRole[]) => {
		setAvailableRolesState(roles);
	};

	const contextValue: PrivilegeContextType = {
		userPrivileges,
		isLoading,
		hasPermission,
		hasAnyPermission,
		hasAllPermissions,
		canAccess,
		setUserPrivileges,
		updateUserPrivileges,
		clearPrivileges,
		getAvailableRoles,
		setAvailableRoles,
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

