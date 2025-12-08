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
    }),
});

export const { useCreateCompanyMutation } = companyApi;
