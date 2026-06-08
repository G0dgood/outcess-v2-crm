import { baseApi } from "./baseApi";

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SMSConfig {
  _id?: string;
  name: string;
  provider: string;
  senderId: string;
  accountSid?: string;
  apiKey?: string;
  assignType: 'campaign' | 'bucket';
  assignedId: string;
  assignedName: string;
  companyId: string;
  createdAt?: string;
}

export interface SMSLog {
  _id?: string;
  phoneNumber: string;
  message: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  direction: 'inbound' | 'outbound';
  contactName?: string;
  configId?: string;
  campaignId?: string;
  createdAt: string;
}

export const smsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSMSConfigs: builder.query<{ message: string; configs: SMSConfig[] }, string>({
      query: (companyId) => `api/v1/sms/config/company/${companyId}`,
      providesTags: ["SMS"],
    }),
    createSMSConfig: builder.mutation<{ message: string; config: SMSConfig }, Partial<SMSConfig>>({
      query: (data) => ({
        url: "api/v1/sms/config",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SMS"],
    }),
    updateSMSConfig: builder.mutation<{ message: string; config: SMSConfig }, { id: string; data: Partial<SMSConfig> }>({
      query: ({ id, data }) => ({
        url: `api/v1/sms/config/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["SMS"],
    }),
    deleteSMSConfig: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `api/v1/sms/config/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SMS"],
    }),
    getSMSLogs: builder.query<{ message: string; logs: SMSLog[]; pagination: Pagination }, { companyId: string; page?: number; limit?: number; search?: string }>({
      query: ({ companyId, page = 1, limit = 10, search = "" }) => 
        `api/v1/sms/log/company/${companyId}?page=${page}&limit=${limit}&search=${search}`,
      providesTags: ["SMS"],
    }),
    createSMSLog: builder.mutation<{ message: string; log: SMSLog }, Partial<SMSLog> & { companyId: string }>({
      query: (data) => ({
        url: "api/v1/sms/log",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SMS"],
    }),
  }),
});

export const {
  useGetSMSConfigsQuery,
  useCreateSMSConfigMutation,
  useUpdateSMSConfigMutation,
  useDeleteSMSConfigMutation,
  useGetSMSLogsQuery,
  useCreateSMSLogMutation,
} = smsApi;
