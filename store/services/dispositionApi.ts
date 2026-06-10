import { DashboardReportResponse } from "@/types/dashboard";
import { baseApi } from "./baseApi";

export interface CreateDispositionRequest {
  fillDisposition: unknown[];
  customerId?: string;
  agentId?: string;
  campaignId?: string;
  timestamp: string;
  [key: string]: unknown;
}

export interface CreateDispositionResponse {
  message: string;
  disposition?: unknown;
  dispositionId?: string;
  timestamp: string;
  agentId?: string;
  campaignId?: string;
  customerId?: string;
}

export interface GetDispositionsRequest {
  campaignId: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetDispositionsByCustomerRequest {
  campaignId: string;
  customerId: string;
  page?: number;
  limit?: number;
}

export interface GetDispositionsByAgentIdRequest {
  campaignId: string;
  agentId: string;
  page?: number;
  limit?: number;
}

export interface GetDispositionsReportRequest {
  campaignId: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetDispositionsByAgentReportRequest {
  campaignId: string;
  agentId: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface GetLeaderboardRequest {
  campaignId: string;
  timeFilter?: "daily" | "weekly" | "monthly";
}

export interface LeaderboardResponse {
  leaderboard: unknown[];
  leaderboardTargets?: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  bucketTargets?: Record<
    string,
    {
      daily: number;
      weekly: number;
      monthly: number;
    }
  >;
}

export const dispositionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createDisposition: builder.mutation<
      CreateDispositionResponse,
      CreateDispositionRequest
    >({
      query: (data) => ({
        url: "api/v1/dispositions",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Disposition"],
    }),
    getDispositionsByCampaign: builder.query<unknown, GetDispositionsRequest>({
      query: ({ campaignId, page = 1, limit = 20, search = "" }) =>
        `api/v1/dispositions/${campaignId}?page=${page}&limit=${limit}&search=${search}`,
      providesTags: ["Disposition"],
    }),
    getDispositionsByCustomer: builder.query<
      unknown,
      GetDispositionsByCustomerRequest
    >({
      query: ({ campaignId, customerId, page = 1, limit = 20 }) =>
        `api/v1/dispositions/${campaignId}?search=${customerId}&page=${page}&limit=${limit}`,
      providesTags: ["Disposition"],
    }),
    getDispositionsByAgentId: builder.query<
      unknown,
      GetDispositionsByAgentIdRequest
    >({
      query: ({ campaignId, agentId, page = 1, limit = 20 }) =>
        `api/v1/dispositions/${campaignId}?search=${agentId}&page=${page}&limit=${limit}`,
      providesTags: ["Disposition"],
    }),
    getDispositionsByCampaignReport: builder.query<
      unknown,
      GetDispositionsReportRequest
    >({
      query: ({
        campaignId,
        startDate,
        endDate,
        page = 1,
        limit = 20,
        search = "",
      }) =>
        `api/v1/dispositions/${campaignId}/report?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}&search=${search}`,
      providesTags: ["Disposition"],
    }),
    getDispositionsByAgentReport: builder.query<
      unknown,
      GetDispositionsByAgentReportRequest
    >({
      query: ({
        campaignId,
        agentId,
        page = 1,
        limit = 20,
        startDate,
        endDate,
        search = "",
      }) =>
        `api/v1/dispositions/${campaignId}/agent/${agentId}/report?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}&search=${search}`,
      providesTags: ["Disposition"],
    }),
    getDashboardDispositionsByCampaignAndAgentIdReport: builder.query<
      DashboardReportResponse,
      GetDispositionsByAgentReportRequest
    >({
      query: ({ campaignId, agentId, startDate, endDate }) =>
        `api/v1/dispositions/${campaignId}/agent/${agentId}/dashboard-report?startDate=${startDate}&endDate=${endDate}`,
      providesTags: ["Disposition"],
    }),
    getAllDashboardDispositionsByCampaignReport: builder.query<
      DashboardReportResponse,
      { campaignId: string; startDate: string; endDate: string }
    >({
      query: ({ campaignId, startDate, endDate }) =>
        `api/v1/dispositions/${campaignId}/dashboard-report?startDate=${startDate}&endDate=${endDate}`,
      providesTags: ["Disposition"],
    }),
    getLeaderboard: builder.query<LeaderboardResponse, GetLeaderboardRequest>({
      query: ({ campaignId, timeFilter = "weekly" }) =>
        `api/v1/leaderboard/${campaignId}?timeFilter=${timeFilter}`,
      providesTags: ["Disposition"],
    }),
  }),
});

export const {
  useCreateDispositionMutation,
  useGetDispositionsByCampaignQuery,
  useGetDispositionsByCustomerQuery,
  useGetDispositionsByAgentIdQuery,
  useGetDispositionsByCampaignReportQuery,
  useGetDispositionsByAgentReportQuery,
  useGetDashboardDispositionsByCampaignAndAgentIdReportQuery,
  useGetAllDashboardDispositionsByCampaignReportQuery,
  useGetLeaderboardQuery,
} = dispositionApi;
