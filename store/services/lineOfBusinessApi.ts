import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface CreateLineOfBusinessRequest {
  name: string;
  description?: string;
  userId?: string;
  timeZone?: string;
  industry?: string;
  businessSize?: string;
  [key: string]: unknown;
}

export interface CreateLineOfBusinessResponse {
  message: string;
  lineOfBusiness?: unknown;
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

export const lineOfBusinessApi = createApi({
  reducerPath: "lineOfBusinessApi",
  tagTypes: ["LineOfBusiness"],
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.base_url,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as {
        auth?: {
          tokens?: {
            accessToken?: string;
          };
        };
      };
      const token =
        state.auth?.tokens?.accessToken || localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    createLineOfBusiness: builder.mutation<
      CreateLineOfBusinessResponse,
      CreateLineOfBusinessRequest
    >({
      query: (data) => ({
        url: "api/v1/line-of-business",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["LineOfBusiness"],
    }),
    getLineOfBusiness: builder.query<unknown, string>({
      query: (id) => `api/v1/line-of-business/${id}`,
      providesTags: ["LineOfBusiness"],
    }),
    getLineOfBusinessByCompanyId: builder.query<unknown, string>({
      query: (companyId) => `api/v1/line-of-business/company/${companyId}`,
      providesTags: ["LineOfBusiness"],
    }),
    getLineOfBusinessByCompanyIdForheader: builder.query<unknown, string>({
      query: (companyId) =>
        `api/v1/line-of-business/company/${companyId}/header`,
      providesTags: ["LineOfBusiness"],
    }),
    updateLineOfBusiness: builder.mutation<
      unknown,
      { id: string; data: unknown }
    >({
      query: ({ id, data }) => ({
        url: `api/v1/line-of-business/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["LineOfBusiness"],
    }),
    updateBusinessHours: builder.mutation<
      unknown,
      { id: string; data: BusinessHourPayload | BusinessHourPayload[] }
    >({
      query: ({ id, data }) => ({
        url: `api/v1/line-of-business/${id}/business-hours`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["LineOfBusiness"],
    }),
    upsertShiftHour: builder.mutation<
      {
        message: string;
        shiftHours: {
          id: string;
          shiftName: string;
          shiftDaysKey: string;
          shiftStartTime: string;
          shiftEndTime: string;
          noOfUsers: number;
          _id?: string;
        }[];
      },
      { id: string; data: ShiftHourPayload }
    >({
      query: ({ id, data }) => ({
        url: `api/v1/line-of-business/${id}/shift-hours`,
        method: "POST",
        body: data,
      }),
    }),
    deleteLineOfBusiness: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `api/v1/line-of-business/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LineOfBusiness"],
    }),
  }),
});

export const {
  useCreateLineOfBusinessMutation,
  useGetLineOfBusinessQuery,
  useUpdateLineOfBusinessMutation,
  useUpdateBusinessHoursMutation,
  useUpsertShiftHourMutation,
  useDeleteLineOfBusinessMutation,
  useGetLineOfBusinessByCompanyIdQuery,
  useLazyGetLineOfBusinessByCompanyIdQuery,
  useGetLineOfBusinessByCompanyIdForheaderQuery,
} = lineOfBusinessApi;
