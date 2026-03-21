import { baseApi } from './baseApi';
import { updateUser as updateUserAction } from '../slices/authSlice';

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    role: string;
    phone: string;
    agreeToTerms: boolean;
    status?: {
        status: string;
        reason?: string;
        color?: string;
    };
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

export const authApi = baseApi.injectEndpoints({
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
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['User'],
            async onQueryStarted({ data }, { dispatch, queryFulfilled }) {
                try {
                    const { data: responseData } = await queryFulfilled;
                    if (data.status) {
                        dispatch(updateUserAction({ status: data.status }));
                    } else if (responseData?.user?.status) {
                        dispatch(updateUserAction({ status: responseData.user.status }));
                    }
                } catch {}
            },
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
