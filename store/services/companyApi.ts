import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface CreateCompanyRequest {
    companyName: string;
    description: string;
    userId: string;
}

export interface CreateCompanyResponse {
    message: string;
    company?: any;
}

export const companyApi = createApi({
    reducerPath: 'companyApi',
    baseQuery: fetchBaseQuery({ baseUrl: process.env.base_url }),
    endpoints: (builder) => ({
        createCompany: builder.mutation<CreateCompanyResponse, CreateCompanyRequest>({
            query: (companyData) => ({
                url: 'api/v1/companies',
                method: 'POST',
                body: companyData,
            }),
        }),
        getCompanyById: builder.query<any, string>({
            query: (id) => `api/v1/companies/${id}`,
        }),
        updateCompany: builder.mutation<any, { id: string; data: any }>({
            query: ({ id, data }) => ({
                url: `api/v1/companies/${id}`,
                method: 'PATCH',
                body: data,
            }),
        }),
    }),
});

export const { useCreateCompanyMutation, useGetCompanyByIdQuery, useUpdateCompanyMutation } = companyApi;
