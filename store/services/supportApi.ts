import { baseApi } from "./baseApi";

export interface PopulatedMember {
  _id: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  avatar?: string;
  role?: string | PopulatedRole;
}

export interface PopulatedRole {
  _id: string;
  id?: string;
  roleName: string;
  name?: string;
}

export interface SupportTicket {
  _id: string;
  ticketId: string;
  title: string;
  description: string;
  status:
    | "Open"
    | "Pending"
    | "In Progress"
    | "Completed"
    | "In Review"
    | "Accepted"
    | "Rejected"
    | "Closed";
  priority: "Low" | "Medium" | "High";
  creatorId: string | PopulatedMember;
  creatorType: "User" | "TeamMember";
  assignedToIds?: (string | PopulatedMember)[];
  assignedToType?: string | PopulatedRole;
  companyId: string;
  campaignId: string;
  creatorName?: string;
  supervisorId?: string;
  escalationLevel?: string | PopulatedRole;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  _id: string;
  ticketId: string;
  ticketDisplayId?: string;
  senderId: string | PopulatedMember;
  senderType: "User" | "TeamMember";
  senderName?: string;
  message: string;
  attachments: string[];
  createdAt: string;
}

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query<
      { tickets: SupportTicket[]; total: number; totalPages: number },
      {
        status?: string;
        priority?: string;
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
        [key: string]: unknown;
      } | void
    >({
      query: (params) => ({
        url: "api/v1/support-tickets",
        params: params || {},
      }),
      providesTags: ["SupportTicket"],
    }),
    getTicketsByCampaignId: builder.query<
      { tickets: SupportTicket[]; total: number; totalPages: number },
      {
        campaignId: string;
        status?: string;
        priority?: string;
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
      }
    >({
      query: ({ campaignId, ...params }) => ({
        url: `api/v1/support-tickets/campaign/${campaignId}`,
        params,
      }),
      providesTags: ["SupportTicket"],
    }),
    getTicketsBySupervisorId: builder.query<
      { tickets: SupportTicket[]; total: number; totalPages: number },
      {
        supervisorId: string;
        status?: string;
        priority?: string;
        page?: number;
        limit?: number;
        search?: string;
        startDate?: string;
        endDate?: string;
      }
    >({
      query: ({ supervisorId, ...params }) => ({
        url: `api/v1/support-tickets/supervisor/${supervisorId}`,
        params,
      }),
      providesTags: ["SupportTicket"],
    }),
    getTicketById: builder.query<
      { ticket: SupportTicket; messages: TicketMessage[] },
      string
    >({
      query: (id) => `api/v1/support-tickets/${id}`,
      providesTags: (result, error, id) => [{ type: "SupportTicket", id }],
    }),
    createTicket: builder.mutation<unknown, unknown>({
      query: (data) => ({
        url: "api/v1/support-tickets",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SupportTicket"],
    }),
    updateTicket: builder.mutation<unknown, { id: string; data: unknown }>({
      query: ({ id, data }) => ({
        url: `api/v1/support-tickets/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SupportTicket", id },
        "SupportTicket",
      ],
    }),
    escalateTicket: builder.mutation<unknown, { id: string; data: unknown }>({
      query: ({ id, data }) => ({
        url: `api/v1/support-tickets/${id}/escalate`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "SupportTicket", id },
        "SupportTicket",
      ],
    }),
    addTicketMessage: builder.mutation<
      unknown,
      { ticketId: string; message: string; attachments?: string[] }
    >({
      query: ({ ticketId, ...data }) => ({
        url: `api/v1/support-tickets/${ticketId}/messages`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { ticketId }) => [
        { type: "SupportTicket", id: ticketId },
      ],
    }),
    deleteTicket: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `api/v1/support-tickets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SupportTicket"],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetTicketsByCampaignIdQuery,
  useGetTicketsBySupervisorIdQuery,
  useGetTicketByIdQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useEscalateTicketMutation,
  useAddTicketMessageMutation,
  useDeleteTicketMutation,
} = supportApi;
