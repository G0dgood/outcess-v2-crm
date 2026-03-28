import { baseApi } from './baseApi';

export interface CreateDispositionRequest {
    fillDisposition: any[];
    customerId?: string;
    agentId?: string;
    lineOfBusinessId?: string;
    timestamp: string;
    [key: string]: any;
}

export interface CreateDispositionResponse {
    message: string;
    disposition?: any;
    dispositionId?: string;
    timestamp: string;
    agentId?: string;
    lineOfBusinessId?: string;
    customerId?: string;
}

export interface GetDispositionsRequest {
    lineOfBusinessId: string;
    page?: number;
    limit?: number;
    search?: string;
}

export interface GetDispositionsByCustomerRequest {
    lineOfBusinessId: string;
    customerId: string;
    page?: number;
    limit?: number;
}

export interface GetDispositionsByAgentIdRequest {
    lineOfBusinessId: string;
    agentId: string;
    page?: number;
    limit?: number;
}

export interface GetDispositionsReportRequest {
    lineOfBusinessId: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    search?: string;
}

export interface GetDispositionsByAgentReportRequest {
    lineOfBusinessId: string;
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
        getDispositionsByLineOfBusiness: builder.query<any, GetDispositionsRequest>({
            query: ({ lineOfBusinessId, page = 1, limit = 20, search = "" }) => 
                `api/v1/dispositions/${lineOfBusinessId}?page=${page}&limit=${limit}&search=${search}`,
            providesTags: ['Disposition'],
        }),
        getDispositionsByCustomer: builder.query<any, GetDispositionsByCustomerRequest>({
            query: ({ lineOfBusinessId, customerId, page = 1, limit = 20 }) => 
                `api/v1/dispositions/${lineOfBusinessId}?search=${customerId}&page=${page}&limit=${limit}`,
            providesTags: ['Disposition'],
        }),
        getDispositionsByAgentId: builder.query<any, GetDispositionsByAgentIdRequest>({
            query: ({ lineOfBusinessId, agentId, page = 1, limit = 20 }) => 
                `api/v1/dispositions/${lineOfBusinessId}?search=${agentId}&page=${page}&limit=${limit}`,
            providesTags: ['Disposition'],
        }),
        getDispositionsByLineOfBusinessReport: builder.query<any, GetDispositionsReportRequest>({
            query: ({ lineOfBusinessId, startDate, endDate, page = 1, limit = 20, search = "" }) => 
                `api/v1/dispositions/${lineOfBusinessId}/report?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}&search=${search}`,
            providesTags: ['Disposition'],
        }),
        getDispositionsByAgentReport: builder.query<any, GetDispositionsByAgentReportRequest>({
            query: ({ lineOfBusinessId, agentId, page = 1, limit = 20, startDate , endDate, search = ""  }) => 
                `api/v1/dispositions/${lineOfBusinessId}/agent/${agentId}/report?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}&search=${search}`,
            providesTags: ['Disposition'],
        }),
        getDashboardDispositionsByLineOfBusinessAndAgentIdReport: builder.query<any, GetDispositionsByAgentReportRequest>({
            query: ({ lineOfBusinessId, agentId, startDate, endDate }) => 
                `api/v1/dispositions/${lineOfBusinessId}/agent/${agentId}/dashboard-report?startDate=${startDate}&endDate=${endDate}`,
            providesTags: ['Disposition'],
        }),
        getAllDashboardDispositionsByLineOfBusinessReport: builder.query<any, { lineOfBusinessId: string, startDate: string, endDate: string }>({
            query: ({ lineOfBusinessId, startDate, endDate }) => 
                `api/v1/dispositions/${lineOfBusinessId}/dashboard-report?startDate=${startDate}&endDate=${endDate}`,
            providesTags: ['Disposition'],
        }),
    }),
});

export const {
    useCreateDispositionMutation,
    useGetDispositionsByLineOfBusinessQuery,
    useGetDispositionsByCustomerQuery,
    useGetDispositionsByAgentIdQuery,
    useGetDispositionsByLineOfBusinessReportQuery,
    useGetDispositionsByAgentReportQuery,
    useGetDashboardDispositionsByLineOfBusinessAndAgentIdReportQuery,
    useGetAllDashboardDispositionsByLineOfBusinessReportQuery,
} = dispositionApi;
