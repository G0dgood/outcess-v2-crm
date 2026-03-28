import { baseApi } from "./baseApi";
import { roleApi } from "./roleApi";
import { updateUser } from "../slices/authSlice";

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
  supervisorId?: string | null;
}

export interface CreateTeamMemberRequest {
  name: string;
  email: string;
  phone: string;
  role: string;
  companyId: string;
  lineOfBusinessId?: string;
  password?: string;
  supervisorId?: string | null;
  status?: string;
  userId?: string;
}

export interface DeleteManyTeamMembersRequest {
  ids: string[];
}

export interface AssignShiftHourRequest {
  shiftHourId: string;
  teamMemberIds: string[];
}

export interface PaginatedTeamMembersResponse {
  teamMembers: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
}

export const teamMembersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTeamMember: builder.mutation<any, CreateTeamMemberRequest>({
      query: (data) => ({
        url: "api/v1/team-members",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["TeamMembers"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(roleApi.util.invalidateTags(["Roles"]));
        } catch {}
      },
    }),
    getTeamMembers: builder.query<any, void>({
      query: () => "api/v1/team-members",
      providesTags: ["TeamMembers"],
    }),
    getTeamMembersByCompanyId: builder.query<any, string>({
      query: (companyId) => `api/v1/team-members/company/${companyId}`,
      providesTags: ["TeamMembers"],
    }),
    getTeamMembersByLineOfBusinessId: builder.query<
      PaginatedTeamMembersResponse,
      { lineOfBusinessId: string; page?: number; limit?: number; search?: string }
    >({
      query: ({ lineOfBusinessId, page = 1, limit = 10, search = "" }) =>
        `api/v1/team-members/line-of-business/${lineOfBusinessId}?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
      providesTags: ["TeamMembers"],
    }),
    getTeamMembersByLineOfBusinessIdAndRoleId: builder.query<
      any,
      { lineOfBusinessId: string; roleId: string }
    >({
      query: ({ lineOfBusinessId, roleId }) =>
        `api/v1/team-members/line-of-business/${lineOfBusinessId}/role/${roleId}`,
      providesTags: ["TeamMembers"],
    }),
    getTeamMembersBySupervisorId: builder.query<
      PaginatedTeamMembersResponse,
      { supervisorId: string; page?: number; limit?: number; search?: string }
    >({
      query: ({ supervisorId, page = 1, limit = 10, search = "" }) =>
        `api/v1/team-members/supervisor/${supervisorId}?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
      providesTags: ["TeamMembers"],
    }),
    getSupervisorsByLineOfBusinessId: builder.query<
      any,
      { companyId: string; lineOfBusinessId: string }
    >({
      query: ({ companyId, lineOfBusinessId }) =>
        `api/v1/roles/supervisors?companyId=${companyId}&lineOfBusinessId=${lineOfBusinessId}`,
      providesTags: ["TeamMembers"],
    }),
    getTeamMemberById: builder.query<any, string>({
      query: (id) => `api/v1/team-members/${id}`,
      providesTags: ["TeamMembers"],
    }),
    updateTeamMemberStatus: builder.mutation<
      any,
      { id: string; status: string; reason?: string }
    >({
      query: ({ id, status, reason }) => ({
        url: `api/v1/team-members/${id}/status`,
        method: "PATCH",
        body: { status, reason },
      }),
      invalidatesTags: ["TeamMembers"],
      async onQueryStarted({ status, reason }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Sync with auth slice if this is the current user
          if (data && data.status) {
            dispatch(updateUser({ status: data.status }));
          } else {
            // Fallback if data doesn't have status object
            dispatch(updateUser({ status: { status } }));
          }
        } catch {}
      },
    }),
    updateTeamMember: builder.mutation<
      any,
      { id: string; data: Partial<TeamMember> }
    >({
      query: ({ id, data }) => ({
        url: `api/v1/team-members/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["TeamMembers"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(roleApi.util.invalidateTags(["Roles"]));
        } catch {}
      },
    }),
    updateTeamMemberPassword: builder.mutation<
      any,
      { id: string; password: string }
    >({
      query: ({ id, password }) => ({
        url: `api/v1/team-members/${id}/password`,
        method: "PATCH",
        body: { password },
      }),
      invalidatesTags: ["TeamMembers"],
    }),
    adminResetTeamMemberPasswordById: builder.mutation<
      any,
      { id: string; password: string }
    >({
      query: ({ id, password }) => ({
        url: `api/v1/team-members/admin/reset-password/${id}`,
        method: "PATCH",
        body: { password },
      }),
      invalidatesTags: ["TeamMembers"],
    }),
    deleteTeamMember: builder.mutation<any, string>({
      query: (id) => ({
        url: `api/v1/team-members/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TeamMembers"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(roleApi.util.invalidateTags(["Roles"]));
        } catch {}
      },
    }),
    deleteManyTeamMembers: builder.mutation<any, DeleteManyTeamMembersRequest>({
      query: (body) => ({
        url: "api/v1/team-members/many",
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["TeamMembers"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(roleApi.util.invalidateTags(["Roles"]));
        } catch {}
      },
    }),
    assignShiftHour: builder.mutation<
      { message: string; modifiedCount: number },
      AssignShiftHourRequest
    >({
      query: (body) => ({
        url: "api/v1/team-members/assign-shift-hour",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TeamMembers"],
    }),
    bulkUploadTeamMembers: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "api/v1/team-members/bulk-upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["TeamMembers"],
    }),
  }),
});

export const {
  useCreateTeamMemberMutation,
  useGetTeamMembersQuery,
  useGetTeamMembersByCompanyIdQuery,
  useGetTeamMembersByLineOfBusinessIdQuery,
  useGetTeamMembersByLineOfBusinessIdAndRoleIdQuery,
  useGetTeamMembersBySupervisorIdQuery,
  useGetSupervisorsByLineOfBusinessIdQuery,
  useGetTeamMemberByIdQuery,
  useUpdateTeamMemberMutation,
  useUpdateTeamMemberStatusMutation,
  useUpdateTeamMemberPasswordMutation,
  useAdminResetTeamMemberPasswordByIdMutation,
  useDeleteTeamMemberMutation,
  useDeleteManyTeamMembersMutation,
  useAssignShiftHourMutation,
  useBulkUploadTeamMembersMutation,
} = teamMembersApi;
