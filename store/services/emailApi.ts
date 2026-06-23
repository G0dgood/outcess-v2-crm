import { baseApi } from "./baseApi";

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EmailConfig {
  _id?: string;
  name: string;
  provider: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  fromEmail: string;
  assignType: 'campaign' | 'bucket';
  assignedId: string;
  assignedName: string;
  companyId: string;
  secure?: boolean;
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  accessToken?: string;
  tokenExpiresAt?: string;
}

export interface EmailLog {
  _id?: string;
  recipientName?: string;
  emailAddress: string;
  subject: string;
  message: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  direction: 'inbound' | 'outbound';
  configId?: string;
  campaignId?: string;
  createdAt: string;
}

export const emailApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmailConfigs: builder.query<{ message: string; configs: EmailConfig[] }, string>({
      query: (companyId) => `api/v1/email/config/company/${companyId}`,
      providesTags: ["Email"],
    }),
    createEmailConfig: builder.mutation<{ message: string; config: EmailConfig }, Partial<EmailConfig>>({
      query: (data) => ({
        url: "api/v1/email/config",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Email"],
    }),
    updateEmailConfig: builder.mutation<{ message: string; config: EmailConfig }, { id: string; data: Partial<EmailConfig> }>({
      query: ({ id, data }) => ({
        url: `api/v1/email/config/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Email"],
    }),
    deleteEmailConfig: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `api/v1/email/config/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Email"],
    }),
    getEmailLogs: builder.query<{ message: string; logs: EmailLog[]; pagination: Pagination }, { companyId: string; page?: number; limit?: number; search?: string }>({
      query: ({ companyId, page = 1, limit = 10, search = "" }) => 
        `api/v1/email/log/company/${companyId}?page=${page}&limit=${limit}&search=${search}`,
      providesTags: ["Email"],
    }),
    createEmailLog: builder.mutation<{ message: string; log: EmailLog }, Partial<EmailLog> & { companyId: string }>({
      query: (data) => ({
        url: "api/v1/email/log",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Email"],
    }),
    exchangeOutlookCode: builder.mutation<{ message: string; config: EmailConfig }, { id: string; code: string; redirectUri: string }>({
      query: ({ id, code, redirectUri }) => ({
        url: `api/v1/email/config/${id}/oauth-exchange`,
        method: "POST",
        body: { code, redirectUri },
      }),
      invalidatesTags: ["Email"],
    }),
  }),
});

export const {
  useGetEmailConfigsQuery,
  useCreateEmailConfigMutation,
  useUpdateEmailConfigMutation,
  useDeleteEmailConfigMutation,
  useGetEmailLogsQuery,
  useCreateEmailLogMutation,
  useExchangeOutlookCodeMutation,
} = emailApi;
