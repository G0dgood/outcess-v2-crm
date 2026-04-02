import { baseApi } from "./baseApi";

export interface Integration {
  _id: string;
  name: string;
  type: string;
  description: string;
  status: "connected" | "disconnected";
  connectedAt?: string;
  config?: any;
  campaignId: string;
  companyId: string;
}

export const integrationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getIntegrationsByLobId: builder.query<
      { message: string; integrations: Integration[] },
      { campaignId: string; companyId: string }
    >({
      query: ({ campaignId, companyId }) =>
        `api/v1/integrations/campaign/${campaignId}?companyId=${companyId}`,
      providesTags: ["Integrations"],
    }),
    updateIntegration: builder.mutation<
      { message: string; integration: Integration },
      { id: string; status: "connected" | "disconnected"; config: any }
    >({
      query: ({ id, ...rest }) => ({
        url: `api/v1/integrations/${id}`,
        method: "PATCH",
        body: rest,
      }),
      invalidatesTags: ["Integrations"],
    }),
  }),
});

export const { useGetIntegrationsByLobIdQuery, useUpdateIntegrationMutation } = integrationsApi;
