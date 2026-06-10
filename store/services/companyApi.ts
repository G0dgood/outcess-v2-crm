import { baseApi } from "./baseApi";

export interface CreateCompanyRequest {
  companyName: string;
  description: string;
  userId: string;
}

export interface CreateCompanyResponse {
  message: string;
  company?: unknown;
}

export interface CompanyDetailsResponse {
  businessData: {
    businessId: string;
    businessName: string;
    status: string;
    deactivationReason?: string;
    industry: string;
    registrationDate: string;
    primaryContact: string;
    email: string;
    phone: string;
    address: string;
    userCount: number;
    lastBilling: string;
    activeModules: string[];
    [key: string]: unknown;
  };
}

export interface PendingReactivationUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName?: string;
  reactivationReason?: string;
  updatedAt?: string;
}

export interface PendingReactivationsResponse {
  users: PendingReactivationUser[];
  pagination: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export interface ActivityLogsResponse {
  activityLogs: {
    _id: string;
    action: string;
    userId:
      | {
          name: string;
          email: string;
        }
      | string;
    details: string;
    ipAddress?: string;
    createdAt: string;
  }[];
  pagination: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export interface SuperAdminDashboardStats {
  stats: {
    totalBusinesses: number;
    totalActiveBusinesses: number;
    totalUsers: number;
    growthData: unknown;
  };
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
    getCompanyById: builder.query<unknown, string>({
      query: (id) => `api/v1/companies/${id}`,
      providesTags: ["Company"],
    }),
    updateCompany: builder.mutation<unknown, { id: string; data: unknown }>({
      query: ({ id, data }) => ({
        url: `api/v1/companies/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Company"],
    }),
    getAllCompanies: builder.query<
      unknown,
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
    superAdminGetTeamMembersByCompanyId: builder.query<unknown, string>({
      query: (companyId) =>
        `api/v1/super-admin/companies/${companyId}/team-members`,
    }),
    superAdminGetActivityLogsByCompanyId: builder.query<
      ActivityLogsResponse,
      { companyId: string; page?: number; limit?: number }
    >({
      query: ({ companyId, page = 1, limit = 10 }) =>
        `api/v1/super-admin/companies/${companyId}/activity-logs?page=${page}&limit=${limit}`,
    }),
    superAdminGetCompanyDetails: builder.query<CompanyDetailsResponse, string>({
      query: (companyId) => `api/v1/super-admin/companies/${companyId}/details`,
      providesTags: ["Company"],
    }),
    getSuperAdminDashboardStats: builder.query<SuperAdminDashboardStats, void>({
      query: () => "api/v1/super-admin/dashboard-stats",
    }),
    getPendingReactivations: builder.query<
      PendingReactivationsResponse,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, search = "" }) =>
        `api/v1/super-admin/pending-reactivations?page=${page}&limit=${limit}&search=${search}`,
      providesTags: ["User"],
    }),
    approveReactivation: builder.mutation<unknown, string>({
      query: (userId) => ({
        url: `api/v1/super-admin/approve-reactivation/${userId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["User"],
    }),
    deactivateCompany: builder.mutation<
      unknown,
      { companyId: string; reason: string }
    >({
      query: ({ companyId, reason }) => ({
        url: `api/v1/super-admin/companies/${companyId}/deactivate`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["Company"],
    }),
    activateCompany: builder.mutation<unknown, string>({
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
