import { baseApi } from "./baseApi";

export interface CreateCompanyRequest {
  companyName: string;
  description: string;
  userId: string;
}

export interface CreateCompanyResponse {
  message: string;
  company?: any;
}

export const companyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCompany: builder.mutation<
      CreateCompanyResponse,
      CreateCompanyRequest
    >({
      query: (companyData) => ({
        url: "api/v1/companies",
        method: "POST",
        body: companyData,
      }),
      invalidatesTags: ["Company"],
    }),
    getCompanyById: builder.query<any, string>({
      query: (id) => `api/v1/companies/${id}`,
      providesTags: ["Company"],
    }),
    updateCompany: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `api/v1/companies/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Company"],
    }),
    getAllCompanies: builder.query<
      any,
      { page?: number; limit?: number; search?: string; status?: string } | void
    >({
      query: (params) => {
        const {
          page = 1,
          limit = 10,
          search = "",
          status = "all",
        } = params || {};
        return `api/v1/super-admin/companies?page=${page}&limit=${limit}&search=${search}&status=${status}`;
      },
      providesTags: ["Company"],
    }),
    superAdminGetTeamMembersByCompanyId: builder.query<any, string>({
      query: (companyId) =>
        `api/v1/super-admin/companies/${companyId}/team-members`,
    }),
    superAdminGetActivityLogsByCompanyId: builder.query<
      any,
      { companyId: string; page?: number; limit?: number }
    >({
      query: ({ companyId, page = 1, limit = 10 }) =>
        `api/v1/super-admin/companies/${companyId}/activity-logs?page=${page}&limit=${limit}`,
    }),
    superAdminGetCompanyDetails: builder.query<any, string>({
      query: (companyId) => `api/v1/super-admin/companies/${companyId}/details`,
      providesTags: ["Company"],
    }),
    getSuperAdminDashboardStats: builder.query<any, void>({
      query: () => "api/v1/super-admin/dashboard-stats",
    }),
    getPendingReactivations: builder.query<any, void>({
      query: () => "api/v1/super-admin/pending-reactivations",
      providesTags: ["User"],
    }),
    approveReactivation: builder.mutation<any, string>({
      query: (userId) => ({
        url: `api/v1/super-admin/approve-reactivation/${userId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["User"],
    }),
    deactivateCompany: builder.mutation<
      any,
      { companyId: string; reason: string }
    >({
      query: ({ companyId, reason }) => ({
        url: `api/v1/super-admin/companies/${companyId}/deactivate`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["Company"],
    }),
    activateCompany: builder.mutation<any, string>({
      query: (companyId) => ({
        url: `api/v1/super-admin/companies/${companyId}/activate`,
        method: "PATCH",
      }),
      invalidatesTags: ["Company"],
    }),
  }),
});

export const {
  useCreateCompanyMutation,
  useGetCompanyByIdQuery,
  useUpdateCompanyMutation,
  useGetAllCompaniesQuery,
  useSuperAdminGetTeamMembersByCompanyIdQuery,
  useSuperAdminGetActivityLogsByCompanyIdQuery,
  useSuperAdminGetCompanyDetailsQuery,
  useGetSuperAdminDashboardStatsQuery,
  useGetPendingReactivationsQuery,
  useApproveReactivationMutation,
  useDeactivateCompanyMutation,
  useActivateCompanyMutation,
} = companyApi;
