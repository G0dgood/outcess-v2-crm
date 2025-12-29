import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    role: string;
    phone: string;
    agreeToTerms: boolean;
}

export interface RegisterResponse {
    message: string;
    user?: any;
    token?: string;
}

export interface LoginRequest {
    email?: string;
    userId?: string;
    password: string;
}

export interface LoginResponse {
    message: string;
    user?: any;
    teamMember?: any;
    token?: string;
}

export interface UserResponse {
    user: any;
    message?: string;
}

export interface LogoutRequest {
    userId: string;
}

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: process.env.base_url,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth.tokens?.accessToken || localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['User'],
    endpoints: (builder) => ({
        register: builder.mutation<RegisterResponse, RegisterRequest>({
            query: (credentials) => ({
                url: 'api/v1/users/register',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['User'],
        }),
        login: builder.mutation<LoginResponse, LoginRequest>({
            query: (credentials) => ({
                url: 'api/v1/users/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['User'],
        }),
        teamMemberLogin: builder.mutation<LoginResponse, LoginRequest>({
            query: (credentials) => ({
                url: 'api/v1/team-members/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['User'],
        }),
        getUserById: builder.query<UserResponse, string>({
            query: (id) => `api/v1/users/user/${id}`,
            providesTags: ['User'],
        }),
        logout: builder.mutation<void, LogoutRequest>({
            query: (body) => ({
                url: 'api/v1/users/logout',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['User'],
        }),
        teamMemberLogout: builder.mutation<void, LogoutRequest>({
            query: (body) => ({
                url: 'api/v1/team-members/logout',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['User'],
        }),
        updateUser: builder.mutation<UserResponse, { id: string; data: Partial<RegisterRequest> }>({
            query: ({ id, data }) => ({
                url: `api/v1/users/user/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),
        changePassword: builder.mutation<void, { userId: string; oldPassword?: string; newPassword: string }>({
            query: (body) => ({
                url: 'api/v1/users/reset-password', // Assuming reset-password or change-password
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const { 
    useRegisterMutation, 
    useLoginMutation, 
    useTeamMemberLoginMutation, 
    useGetUserByIdQuery, 
    useLazyGetUserByIdQuery, 
    useLogoutMutation, 
    useTeamMemberLogoutMutation,
    useUpdateUserMutation,
    useChangePasswordMutation
} = authApi;
