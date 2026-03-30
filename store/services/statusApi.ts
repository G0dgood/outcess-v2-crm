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
    lineOfBusinessId?: string;
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
    lineOfBusinessId?: string;
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
        getStatusesByLineOfBusinessId: builder.query<Status[], string>({
            query: (lineOfBusinessId) => `api/v1/statuses/line-of-business/${lineOfBusinessId}`,
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
    useGetStatusesByLineOfBusinessIdQuery,
    useUpdateStatusMutation, 
    useDeleteStatusMutation 
} = statusApi;
