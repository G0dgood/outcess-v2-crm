import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface CreateLineOfBusinessRequest {
    name: string;
    description?: string;
    userId?: string;
    timeZone?: string;
    industry?: string;
    businessSize?: string;
    [key: string]: any;
}

export interface CreateLineOfBusinessResponse {
    message: string;
    lineOfBusiness?: any;
}

export const lineOfBusinessApi = createApi({
    reducerPath: 'lineOfBusinessApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: process.env.base_url,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth?.tokens?.accessToken || localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        createLineOfBusiness: builder.mutation<CreateLineOfBusinessResponse, CreateLineOfBusinessRequest>({
            query: (data) => ({
                url: 'api/v1/line-of-business',
                method: 'POST',
                body: data,
            }),
        }),
        getLineOfBusiness: builder.query<any, string>({
             query: (id) => `api/v1/line-of-business/${id}`,
        }),
    }),
});

export const { useCreateLineOfBusinessMutation, useGetLineOfBusinessQuery } = lineOfBusinessApi;
