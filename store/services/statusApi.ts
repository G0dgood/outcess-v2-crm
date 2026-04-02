import { baseApi } from './baseApi';

export interface Status {
    id: string;
    name: string;
    description: string;
    roleSelection: 'all' | 'selected';
    selectedRoles: string[];
    color: string;
    isHibernate?: boolean;
    duration?: number;
    companyId: string;
    campaignId?: string;
}

export interface CreateStatusRequest {
    name: string;
    description: string;
    roleSelection: 'all' | 'selected';
    selectedRoles: string[];
    color: string;
    isHibernate?: boolean;
    duration?: number;
    companyId: string;
    campaignId?: string;
}

export interface CreateStatusResponse {
    message: string;
    status?: Status;
}

export const statusApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createStatus: builder.mutation<CreateStatusResponse, CreateStatusRequest>({
            query: (statusData) => ({
                url: 'api/v1/statuses',
                method: 'POST',
                body: statusData,
            }),
            invalidatesTags: ['Statuses'],
        }),
        getStatuses: builder.query<Status[], void>({
            query: () => 'api/v1/statuses',
            providesTags: ['Statuses'],
        }),
        getStatusesByCompanyId: builder.query<Status[], string>({
             query: (companyId) => `api/v1/statuses/company/${companyId}`,
             providesTags: ['Statuses'],
        }),
        getStatusesByCampaignId: builder.query<Status[], string>({
            query: (campaignId) => `api/v1/statuses/campaign/${campaignId}`,
            providesTags: ['Statuses'],
        }),
        updateStatus: builder.mutation<any, { id: string; statusData: Partial<CreateStatusRequest> }>({
            query: ({ id, statusData }) => ({
                url: `api/v1/statuses/${id}`,
                method: 'PATCH',
                body: statusData,
            }),
            invalidatesTags: ['Statuses'],
        }),
        deleteStatus: builder.mutation<any, string>({
            query: (id) => ({
                url: `api/v1/statuses/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Statuses'],
        }),
    }),
});

export const { 
    useCreateStatusMutation, 
    useGetStatusesQuery, 
    useGetStatusesByCompanyIdQuery, 
    useGetStatusesByCampaignIdQuery,
    useUpdateStatusMutation, 
    useDeleteStatusMutation 
} = statusApi;
