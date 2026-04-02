import { baseApi } from './baseApi';

export interface CreateDispositionRequest {
    fillDisposition: any[];
    customerId?: string;
    agentId?: string;
    campaignId?: string;
    timestamp: string;
    [key: string]: any;
}

export interface CreateDispositionResponse {
    message: string;
    disposition?: any;
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

export const dispositionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createDisposition: builder.mutation<CreateDispositionResponse, CreateDispositionRequest>({
            query: (data) => ({
                url: 'api/v1/dispositions',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Disposition'],
        }),
        getDispositionsByCampaign: builder.query<any, GetDispositionsRequest>({
            query: ({ campaignId, page = 1, limit = 20, search = "" }) => 
                `api/v1/dispositions/${campaignId}?page=${page}&limit=${limit}&search=${search}`,
            providesTags: ['Disposition'],
        }),
        getDispositionsByCustomer: builder.query<any, GetDispositionsByCustomerRequest>({
            query: ({ campaignId, customerId, page = 1, limit = 20 }) => 
                `api/v1/dispositions/${campaignId}?search=${customerId}&page=${page}&limit=${limit}`,
            providesTags: ['Disposition'],
        }),
        getDispositionsByAgentId: builder.query<any, GetDispositionsByAgentIdRequest>({
            query: ({ campaignId, agentId, page = 1, limit = 20 }) => 
                `api/v1/dispositions/${campaignId}?search=${agentId}&page=${page}&limit=${limit}`,
            providesTags: ['Disposition'],
        }),
        getDispositionsByCampaignReport: builder.query<any, GetDispositionsReportRequest>({
            query: ({ campaignId, startDate, endDate, page = 1, limit = 20, search = "" }) => 
                `api/v1/dispositions/${campaignId}/report?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}&search=${search}`,
            providesTags: ['Disposition'],
        }),
        getDispositionsByAgentReport: builder.query<any, GetDispositionsByAgentReportRequest>({
            query: ({ campaignId, agentId, page = 1, limit = 20, startDate , endDate, search = ""  }) => 
                `api/v1/dispositions/${campaignId}/agent/${agentId}/report?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}&search=${search}`,
            providesTags: ['Disposition'],
        }),
        getDashboardDispositionsByCampaignAndAgentIdReport: builder.query<any, GetDispositionsByAgentReportRequest>({
            query: ({ campaignId, agentId, startDate, endDate }) => 
                `api/v1/dispositions/${campaignId}/agent/${agentId}/dashboard-report?startDate=${startDate}&endDate=${endDate}`,
            providesTags: ['Disposition'],
        }),
        getAllDashboardDispositionsByCampaignReport: builder.query<any, { campaignId: string, startDate: string, endDate: string }>({
            query: ({ campaignId, startDate, endDate }) => 
                `api/v1/dispositions/${campaignId}/dashboard-report?startDate=${startDate}&endDate=${endDate}`,
            providesTags: ['Disposition'],
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
} = dispositionApi;
