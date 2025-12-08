import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface TeamMember {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    status?: string;
    lastLogin?: string;
    companyId?: string;
}

export interface CreateTeamMemberRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    companyId: string;
    password?: string;
}

export const teamMembersApi = createApi({
    reducerPath: 'teamMembersApi',
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
    tagTypes: ['TeamMembers'],
    endpoints: (builder) => ({
        createTeamMember: builder.mutation<any, CreateTeamMemberRequest>({
            query: (data) => ({
                url: 'api/v1/team-members',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['TeamMembers'],
        }),
        getTeamMembers: builder.query<any, void>({
             query: () => 'api/v1/team-members',
             providesTags: ['TeamMembers'],
        }),
        getTeamMembersByCompanyId: builder.query<any, string>({
             query: (companyId) => `api/v1/team-members/company/${companyId}`,
             providesTags: ['TeamMembers'],
        }),
        getTeamMemberById: builder.query<any, string>({
            query: (id) => `api/v1/team-members/${id}`,
            providesTags: ['TeamMembers'],
       }),
        updateTeamMember: builder.mutation<any, { id: string; data: Partial<TeamMember> }>({
            query: ({ id, data }) => ({
                url: `api/v1/team-members/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['TeamMembers'],
        }),
        deleteTeamMember: builder.mutation<any, string>({
            query: (id) => ({
                url: `api/v1/team-members/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['TeamMembers'],
        }),
    }),
});

export const { 
    useCreateTeamMemberMutation, 
    useGetTeamMembersQuery, 
    useGetTeamMembersByCompanyIdQuery,
    useGetTeamMemberByIdQuery,
    useUpdateTeamMemberMutation, 
    useDeleteTeamMemberMutation 
} = teamMembersApi;
