import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ModuleId =
	| 'dashboard'
	| 'customerBook'
	| 'userManagement'
	| 'setupBook'
	| 'customerSMS'
	| 'report'
	| 'systemSetting'
	| 'auditLog'
	| 'teamMembers'
	| 'lobPlan';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';

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

interface PrivilegeState {
	userPrivileges: UserPrivileges | null;
	isLoading: boolean;
}

const initialState: PrivilegeState = {
	userPrivileges: null,
	isLoading: false,
};

const privilegeSlice = createSlice({
	name: 'privilege',
	initialState,
	reducers: {
		setPrivileges: (state, action: PayloadAction<UserPrivileges>) => {
			state.userPrivileges = action.payload;
			state.isLoading = false;
			if (typeof window !== 'undefined') {
				localStorage.setItem('userPrivileges', JSON.stringify(action.payload));
			}
		},
		clearPrivileges: (state) => {
			state.userPrivileges = null;
			state.isLoading = false;
			if (typeof window !== 'undefined') {
				localStorage.removeItem('userPrivileges');
			}
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
	},
});

export const { setPrivileges, clearPrivileges, setLoading } = privilegeSlice.actions;
export default privilegeSlice.reducer;

// Selectors
export const selectUserPrivileges = (state: { privilege: PrivilegeState }) => state.privilege.userPrivileges;
export const selectIsPrivilegeLoading = (state: { privilege: PrivilegeState }) => state.privilege.isLoading;
export const selectIsAdmin = (state: { privilege: PrivilegeState }) => {
	const privileges = state.privilege.userPrivileges;
	if (!privileges) return false;
	return (
		privileges.role?.roleName === 'Administrator' ||
		privileges.role?.roleName === 'admin' ||
		privileges.roleId === 'administrator'
	);
};
export const selectIsSuperAdmin = (state: { privilege: PrivilegeState }) => {
	const privileges = state.privilege.userPrivileges;
	if (!privileges) return false;
	const roleName = privileges.role?.roleName || '';
	return roleName.toLowerCase() === 'super admin';
};
