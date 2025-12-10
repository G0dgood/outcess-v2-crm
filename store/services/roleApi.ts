import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Role {
    _id: string;
    id?: string;
    roleName: string;
    description: string;
    companyId: string;
    lineOfBusinessId?: string;
    permissions: Record<string, boolean>;
    userCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateRoleRequest {
    roleName: string;
    description: string;
    companyId: string;
    lineOfBusinessId?: string;
    permissions: Record<string, boolean>;
}

export interface CreateRoleResponse {
    message: string;
    role?: any;
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
    tagTypes: ['Roles'],
    endpoints: (builder) => ({
        createRole: builder.mutation<CreateRoleResponse, CreateRoleRequest>({
            query: (roleData) => ({
                url: 'api/v1/roles',
                method: 'POST',
                body: roleData,
            }),
            invalidatesTags: ['Roles'],
        }),
        getRolesByCompanyId: builder.query<Role[], string>({
             query: (companyId) => `api/v1/roles/company/${companyId}`,
             providesTags: ['Roles'],
        }),
        getRolesByLineOfBusinessId: builder.query<Role[], string>({
             query: (lineOfBusinessId) => `api/v1/roles/line-of-business/${lineOfBusinessId}`,
             providesTags: ['Roles'],
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
    }),
});

export const { useCreateRoleMutation, useGetRolesByCompanyIdQuery, useGetRolesByLineOfBusinessIdQuery, useUpdateRoleMutation, useDeleteRoleMutation } = roleApi;
