import { baseApi } from "./baseApi";
import type { Bucket } from "@/contexts/SetupContext";

export interface Campaign {
  _id: string;
  id?: string;
  name: string;
  campaignName?: string;
  description?: string;
  primaryColor?: string;
  secondaryColor?: string;
  logo?: string;
  industry?: string;
  businessSize?: string;
  timeZone?: string;
  companyId?: string;
  companyName?: string;
  dashboardSettings?: {
    dashboardName: string;
    dashboardVisibility: string;
    activeTab: string;
    widgets: unknown[];
    dispositions: unknown[];
    buckets: unknown[];
    callOutcomes: unknown[];
    leaderboardTargets?: {
      daily: number;
      weekly: number;
      monthly: number;
    };
    dispositionSettings: {
      timeRangeView: string;
      chartType: string;
      charts: unknown[];
    };
  };
  customerBookSettings?: {
    configuredFields: {
      bucketId: string;
      fields: {
        id: string;
        name: string;
        type: string;
        required: boolean;
        options?: string[];
      }[];
    }[];
  };
  shiftHours?: unknown;
  businessHours?: unknown;
  roleManagementSettings?: {
    modules: { name: string }[];
  };
  [key: string]: unknown;
}

export interface CreateCampaignRequest {
  name: string;
  description?: string;
  userId?: string;
  timeZone?: string;
  industry?: string;
  businessSize?: string;
  [key: string]: unknown;
}

export interface CreateCampaignResponse {
  message: string;
  campaign?: unknown;
}

export interface AssignMemberResponse {
  campaign?: {
    dashboardSettings: {
      buckets: Bucket[];
    };
  };
  existingBucket?: string;
}

export interface BusinessHourPayload {
  name?: string;
  businessHourType: "24hours-7days" | "24hours-5days" | "custom";
  businessTiming?: "same" | "different";
  sameStartTime?: string;
  sameEndTime?: string;
  differentHours?: {
    [key: string]: {
      startTime: string;
      endTime: string;
      enabled: boolean;
    };
  };
  businessDays?: string[];
}

export interface ShiftHourPayload {
  id?: string;
  shiftName: string;
  shiftDaysKey: string;
  shiftStartTime: string;
  shiftEndTime: string;
  noOfUsers: number;
}

export interface ShiftHourResponse {
  shiftHours: {
    id?: string;
    shiftName: string;
    shiftDaysKey: string;
    shiftStartTime: string;
    shiftEndTime: string;
    noOfUsers: number;
  }[];
}

export const campaignApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCampaign: builder.mutation<
      CreateCampaignResponse,
      CreateCampaignRequest | FormData
    >({
      query: (data) => ({
        url: "api/v1/campaign",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Campaign"],
    }),
    getCampaign: builder.query<Campaign, string>({
      query: (id) => `api/v1/campaign/${id}`,
      providesTags: ["Campaign"],
    }),
    getCampaignByCompanyId: builder.query<Campaign, string>({
      query: (companyId) => `api/v1/campaign/company/${companyId}`,
      providesTags: ["Campaign"],
    }),
    getCampaignByCompanyIdForheader: builder.query<
      { campaigns: Campaign[]; total: number },
      { companyId: string; page?: number; limit?: number }
    >({
      query: ({ companyId, page = 1, limit = 10 }) =>
        `api/v1/campaign/company/${companyId}/header?page=${page}&limit=${limit}`,
      providesTags: ["Campaign"],
    }),
    updateCampaign: builder.mutation<
      unknown,
      { id: string; data: unknown | FormData }
    >({
      query: ({ id, data }) => ({
        url: `api/v1/campaign/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Campaign"],
    }),
    updateBusinessHours: builder.mutation<
      unknown,
      { id: string; data: BusinessHourPayload | BusinessHourPayload[] }
    >({
      query: ({ id, data }) => ({
        url: `api/v1/campaign/${id}/business-hours`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Campaign"],
    }),
    upsertShiftHour: builder.mutation<
      ShiftHourResponse,
      { id: string; data: ShiftHourPayload }
    >({
      query: ({ id, data }) => ({
        url: `api/v1/campaign/${id}/shift-hours`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Campaign"],
    }),
    deleteCampaign: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `api/v1/campaign/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Campaign"],
    }),
    assignMemberToBucket: builder.mutation<
      AssignMemberResponse,
      {
        id: string;
        bucketId: string;
        memberId: string;
        memberName: string;
        duration?: number;
      }
    >({
      query: ({ id, bucketId, ...body }) => ({
        url: `api/v1/campaign/${id}/buckets/${bucketId}/assign`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Campaign"],
    }),
    removeMemberFromBucket: builder.mutation<
      AssignMemberResponse,
      { id: string; bucketId: string; memberId: string }
    >({
      query: ({ id, bucketId, memberId }) => ({
        url: `api/v1/campaign/${id}/buckets/${bucketId}/assign/${memberId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Campaign"],
    }),
    updateBucketCustomerFields: builder.mutation<
      unknown,
      { id: string; bucketId: string; customerFields: unknown[] }
    >({
      query: ({ id, bucketId, customerFields }) => ({
        url: `api/v1/campaign/${id}/buckets/${bucketId}/customer-fields`,
        method: "PATCH",
        body: { customerFields },
      }),
      invalidatesTags: ["Campaign"],
    }),
  }),
});

export const {
  useCreateCampaignMutation,
  useGetCampaignQuery,
  useUpdateCampaignMutation,
  useUpdateBusinessHoursMutation,
  useUpsertShiftHourMutation,
  useDeleteCampaignMutation,
  useGetCampaignByCompanyIdQuery,
  useLazyGetCampaignByCompanyIdQuery,
  useGetCampaignByCompanyIdForheaderQuery,
  useAssignMemberToBucketMutation,
  useRemoveMemberFromBucketMutation,
  useUpdateBucketCustomerFieldsMutation,
} = campaignApi;
