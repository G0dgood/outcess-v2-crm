import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface RolePermission {
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

export interface Role {
    _id: string;
    id?: string;
    roleName: string;
    description: string;
    companyId: string;
    lineOfBusinessId?: string;
    permissions: RolePermission[];
    userCount?: number;
    teamMemberCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateRoleRequest {
    roleName: string;
    description: string;
    companyId: string;
    lineOfBusinessId?: string;
    permissions: RolePermission[];
}

export interface CreateRoleResponse {
    message: string;
    role?: any;
}

export interface GetRolesResponse {
    message?: string;
    roles: Role[];
}

export interface PermissionTemplate {
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

export interface GetPermissionTemplatesResponse {
    message: string;
    roles: Role[];
}

export const roleApi = createApi({
    reducerPath: 'roleApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: process.env.base_url,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth?.tokens?.accessToken || localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Roles', 'PermissionTemplates'],
    endpoints: (builder) => ({
        createRole: builder.mutation<CreateRoleResponse, CreateRoleRequest>({
            query: (roleData) => ({
                url: 'api/v1/roles',
                method: 'POST',
                body: roleData,
            }),
            invalidatesTags: ['Roles'],
        }),
        getRolesByCompanyId: builder.query<GetRolesResponse, string>({
             query: (companyId) => `api/v1/roles/company/${companyId}`,
             providesTags: ['Roles'],
        }),
        getRolesByLineOfBusinessId: builder.query<GetRolesResponse, string>({
             query: (lineOfBusinessId) => `api/v1/roles/line-of-business/${lineOfBusinessId}`,
             providesTags: ['Roles'],
        }),
        getPermissionWithPrivilege: builder.query<GetPermissionTemplatesResponse, string>({
             query: (lineOfBusinessId) => `api/v1/roles/permissions/keys?lineOfBusinessId=${lineOfBusinessId}`,
             providesTags: ['PermissionTemplates'],
        }),
        updateRole: builder.mutation<Role, { id: string; roleData: Partial<CreateRoleRequest> }>({
            query: ({ id, roleData }) => ({
                url: `api/v1/roles/${id}`,
                method: 'PATCH',
                body: roleData,
            }),
            invalidatesTags: ['Roles'],
        }),
        deleteRole: builder.mutation<any, string>({
            query: (id) => ({
                url: `api/v1/roles/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Roles'],
        }),
        deleteRolesByLineOfBusiness: builder.mutation<any, string>({
            query: (id) => ({
                url: `api/v1/roles/line-of-business/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Roles'],
        }),
    }),
});

export const { 
    useCreateRoleMutation, 
    useGetRolesByCompanyIdQuery, 
    useGetRolesByLineOfBusinessIdQuery, 
    useGetPermissionWithPrivilegeQuery,
    useUpdateRoleMutation, 
    useDeleteRoleMutation,
    useDeleteRolesByLineOfBusinessMutation
} = roleApi;
