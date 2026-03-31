import { baseApi } from "./baseApi";

export interface Integration {
  _id: string;
  name: string;
  type: string;
  description: string;
  status: "connected" | "disconnected";
  connectedAt?: string;
  config?: any;
  lineOfBusinessId: string;
  companyId: string;
}

export const integrationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getIntegrationsByLobId: builder.query<
      { message: string; integrations: Integration[] },
      { lineOfBusinessId: string; companyId: string }
    >({
      query: ({ lineOfBusinessId, companyId }) =>
        `api/v1/integrations/line-of-business/${lineOfBusinessId}?companyId=${companyId}`,
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
