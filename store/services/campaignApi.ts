import { baseApi } from "./baseApi";

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
      CreateCampaignRequest
    >({
      query: (data) => ({
        url: "api/v1/campaign",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Campaign"],
    }),
    getCampaign: builder.query<unknown, string>({
      query: (id) => `api/v1/campaign/${id}`,
      providesTags: ["Campaign"],
    }),
    getCampaignByCompanyId: builder.query<unknown, string>({
      query: (companyId) => `api/v1/campaign/company/${companyId}`,
      providesTags: ["Campaign"],
    }),
    getCampaignByCompanyIdForheader: builder.query<
      unknown,
      { companyId: string; page?: number; limit?: number }
    >({
      query: ({ companyId, page = 1, limit = 10 }) =>
        `api/v1/campaign/company/${companyId}/header?page=${page}&limit=${limit}`,
      providesTags: ["Campaign"],
    }),
    updateCampaign: builder.mutation<
      unknown,
      { id: string; data: unknown }
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
} = campaignApi;
