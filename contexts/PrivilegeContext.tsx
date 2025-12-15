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

	// Helper to match moduleId with moduleName
	const findModulePermission = (moduleId: string): RoleModulePermission | undefined => {
		if (!userPrivileges?.role?.permissions) return undefined;

		const normalize = (str: string) => str.replace(/\s+/g, '').toLowerCase();
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

