import { baseApi } from "./baseApi";
import { updateUser as updateUserAction, User } from "../slices/authSlice";

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
  user?: User;
  token?: string;
}

export interface LoginRequest {
  email?: string;
  userId?: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user?: User;
  teamMember?: User;
  token?: string;
}

export interface UserResponse {
  user: User;
  message?: string;
}

export interface LogoutRequest {
  userId: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (credentials) => ({
        url: "api/v1/users/register",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "api/v1/users/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    teamMemberLogin: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "api/v1/team-members/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    getUserById: builder.query<UserResponse, string>({
      query: (id) => `api/v1/users/user/${id}`,
      providesTags: ["User"],
    }),
    logout: builder.mutation<void, LogoutRequest>({
      query: (body) => ({
        url: "api/v1/users/logout",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    teamMemberLogout: builder.mutation<void, LogoutRequest>({
      query: (body) => ({
        url: "api/v1/team-members/logout",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation<
      UserResponse,
      { id: string; data: Partial<RegisterRequest> }
    >({
      query: ({ id, data }) => ({
        url: `api/v1/users/user/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User"],
      async onQueryStarted({ data }, { dispatch, queryFulfilled }) {
        try {
          const { data: responseData } = await queryFulfilled;
          const user = responseData?.user as
            | {
                status?: {
                  status: string;
                  reason?: string;
                  color?: string;
                  isHibernate?: boolean;
                  duration?: number;
                  statusUpdatedAt?: string | Date;
                };
              }
            | undefined;
          if (data.status) {
            dispatch(updateUserAction({ status: data.status }));
          } else if (user?.status) {
            dispatch(updateUserAction({ status: user.status }));
          }
        } catch {}
      },
    }),
    changePassword: builder.mutation<
      void,
      { userId: string; oldPassword?: string; newPassword: string }
    >({
      query: (body) => ({
        url: "api/v1/users/reset-password", // Assuming reset-password or change-password
        method: "POST",
        body,
      }),
    }),
    requestReactivation: builder.mutation<
      { message: string },
      { email: string; reason: string }
    >({
      query: (body) => ({
        url: "api/v1/users/request-reactivation",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
  overrideExisting: true,
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
  useChangePasswordMutation,
  useRequestReactivationMutation,
} = authApi;
