import { baseApi } from './baseApi';

export interface SetupBook {
    id: string;
    [key: string]: any;
}

export interface CreateSetupBookRequest {
    companyId: string;
    campaignId: string;
    file: File;
}

export interface UpdateSetupBookRequest {
    id: string;
    data: {
        [key: string]: any;
    };
}

export interface SetupBookResponse {
    message: string;
    data: SetupBook[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface UpdateSetupBookRecordsRequest {
    campaignId: string;
    data: any;
}


export interface DeleteSetupBookRecordsRequest {
    campaignId: string;
    id: string;
}

export interface DeleteManySetupBookRecordsRequest {
    campaignId: string;
    ids: string[];
}

export const setupBookApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSetupBooks: builder.query<SetupBook[], { page?: number; limit?: number; search?: string } | void>({
            query: (params) => {
                if (params) {
                    const { page, limit, search } = params;
                    let queryString = 'api/v1/setup-books?';
                    if (page) queryString += `page=${page}&`;
                    if (limit) queryString += `limit=${limit}&`;
                    if (search) queryString += `search=${search}&`;
                    return queryString;
                }
                return 'api/v1/setup-books';
            },
            providesTags: ['SetupBook'],
        }),
        getSetupBookById: builder.query<SetupBook, string>({
            query: (id) => `api/v1/setup-books/${id}`,
            providesTags: (result, error, id) => [{ type: 'SetupBook', id }],
        }),
        getSetupBookByCampaignId: builder.query<SetupBookResponse, { id: string; page?: number; limit?: number; search?: string; bucketId?: string; bucketIds?: string }>({
            query: ({ id, page, limit, search, bucketId, bucketIds }) => {
                const params = new URLSearchParams();
                if (page) params.append('page', page.toString());
                if (limit) params.append('limit', limit.toString());
                if (search) params.append('search', search);
                if (bucketIds) params.append('bucketIds', bucketIds);
                else if (bucketId) params.append('bucketId', bucketId);
                
                const queryString = params.toString();
                return `api/v1/setup-books/${id}${queryString ? `?${queryString}` : ''}`;
            },
            providesTags: ['SetupBook'],
        }),
        getSetupBookBySearchId: builder.query<SetupBookResponse, { campaignId: string; searchId: string; page?: number; limit?: number; search?: string; bucketId?: string; bucketIds?: string }>({
            query: ({ campaignId, searchId, page, limit, search, bucketId, bucketIds }) => {
                const params = new URLSearchParams();
                if (page) params.append('page', page.toString());
                if (limit) params.append('limit', limit.toString());
                if (search) params.append('search', search);
                if (bucketIds) params.append('bucketIds', bucketIds);
                else if (bucketId) params.append('bucketId', bucketId);
                
                const queryString = params.toString();
                return `api/v1/setup-books/${campaignId}/record/${searchId}${queryString ? `?${queryString}` : ''}`;
            },
            providesTags: ['SetupBook'],
        }),
        createSetupBook: builder.mutation<SetupBook, FormData>({
            query: (data) => ({
                url: 'api/v1/setup-books',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['SetupBook'],
        }),
        updateSetupBook: builder.mutation<SetupBook, UpdateSetupBookRequest>({
            query: ({ id, data }) => ({
                url: `api/v1/setup-books/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'SetupBook', id }, 'SetupBook'],
        }),
        updateSetupBookRecords: builder.mutation<any, UpdateSetupBookRecordsRequest>({
            query: ({ campaignId, data }) => ({
                url: `api/v1/setup-books/${campaignId}/records`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['SetupBook'],
        }),
        deleteSetupBookRecords: builder.mutation<any, DeleteSetupBookRecordsRequest>({
            query: ({ campaignId, id }) => ({
                url: `api/v1/setup-books/${campaignId}/records`,
                method: 'DELETE',
                body: { id },
            }),
            invalidatesTags: ['SetupBook'],
        }),
        deleteManySetupBookRecords: builder.mutation<any, DeleteManySetupBookRecordsRequest>({
            query: ({ campaignId, ids }) => ({
                url: `api/v1/setup-books/${campaignId}/records/many`,
                method: 'DELETE',
                body: { ids },
            }),
            invalidatesTags: ['SetupBook'],
        }),
        deleteSetupBook: builder.mutation<{ success: boolean; id: string }, string>({
            query: (id) => ({
                url: `api/v1/setup-books/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['SetupBook'],
        }),
    }),
});

export const {
    useGetSetupBooksQuery,
    useGetSetupBookByIdQuery,
    useGetSetupBookByCampaignIdQuery,
    useGetSetupBookBySearchIdQuery,
    useCreateSetupBookMutation,
    useUpdateSetupBookMutation,
    useUpdateSetupBookRecordsMutation,
    useDeleteSetupBookRecordsMutation,
    useDeleteManySetupBookRecordsMutation,
    useDeleteSetupBookMutation,
} = setupBookApi;
