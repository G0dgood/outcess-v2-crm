import { baseApi } from './baseApi';

export interface CreateCompanyRequest {
    companyName: string;
    description: string;
    userId: string;
}

export interface CreateCompanyResponse {
    message: string;
    company?: any;
}

export const companyApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createCompany: builder.mutation<CreateCompanyResponse, CreateCompanyRequest>({
            query: (companyData) => ({
                url: 'api/v1/companies',
                method: 'POST',
                body: companyData,
            }),
            invalidatesTags: ['Company'],
        }),
        getCompanyById: builder.query<any, string>({
            query: (id) => `api/v1/companies/${id}`,
            providesTags: ['Company'],
        }),
        updateCompany: builder.mutation<any, { id: string; data: any }>({
            query: ({ id, data }) => ({
                url: `api/v1/companies/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Company'],
        }),
        getAllCompanies: builder.query<any, void>({
            query: () => 'api/v1/super-admin/companies',
            providesTags: ['Company'],
        }),
        superAdminGetTeamMembersByCompanyId: builder.query<any, string>({
            query: (companyId) => `api/v1/super-admin/companies/${companyId}/team-members`,
        }),
        superAdminGetActivityLogsByCompanyId: builder.query<any, string>({
            query: (companyId) => `api/v1/super-admin/companies/${companyId}/activity-logs`,
        }),
        superAdminGetCompanyDetails: builder.query<any, string>({
            query: (companyId) => `api/v1/super-admin/companies/${companyId}/details`,
            providesTags: ['Company'],
        }),
    }),
});

export const { useCreateCompanyMutation, useGetCompanyByIdQuery, useUpdateCompanyMutation, useGetAllCompaniesQuery, useSuperAdminGetTeamMembersByCompanyIdQuery, useSuperAdminGetActivityLogsByCompanyIdQuery, useSuperAdminGetCompanyDetailsQuery } = companyApi;
