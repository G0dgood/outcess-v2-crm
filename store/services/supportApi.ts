 import { baseApi } from './baseApi';

export interface SupportTicket {
    _id: string;
    ticketId: string;
    title: string;
    description: string;
    status: 'New' | 'In Progress' | 'Resolved' | 'Closed' | 'Reopened';
    priority: 'Low' | 'Medium' | 'High';
    creatorId: any;
    creatorType: 'User' | 'TeamMember';
    assignedToIds?: any[];
    assignedToType?: 'User' | 'TeamMember' | any;
    companyId: string;
    lineOfBusinessId: string;
    escalationLevel: 'Supervisor' | 'Admin' | 'SuperAdmin' | any;
    lastMessageAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface TicketMessage {
    _id: string;
    ticketId: string;
    senderId: any;
    senderType: 'User' | 'TeamMember';
    message: string;
    attachments: string[];
    createdAt: string;
}

export const supportApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getTickets: builder.query<{ tickets: SupportTicket[]; total: number; totalPages: number }, any>({
            query: (params) => ({
                url: 'api/v1/support-tickets',
                params,
            }),
            providesTags: ['SupportTicket'],
        }),
        getTicketsByLineOfBusinessId: builder.query<{ tickets: SupportTicket[]; total: number; totalPages: number }, { lineOfBusinessId: string; status?: string; priority?: string; page?: number; limit?: number }>({
            query: ({ lineOfBusinessId, ...params }) => ({
                url: `api/v1/support-tickets/line-of-business/${lineOfBusinessId}`,
                params,
            }),
            providesTags: ['SupportTicket'],
        }),
        getTicketById: builder.query<{ ticket: SupportTicket; messages: TicketMessage[] }, string>({
            query: (id) => `api/v1/support-tickets/${id}`,
            providesTags: (result, error, id) => [{ type: 'SupportTicket', id }],
        }),
        createTicket: builder.mutation<any, any>({
            query: (data) => ({
                url: 'api/v1/support-tickets',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['SupportTicket'],
        }),
        updateTicket: builder.mutation<any, { id: string; data: any }>({
            query: ({ id, data }) => ({
                url: `api/v1/support-tickets/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'SupportTicket', id }, 'SupportTicket'],
        }),
        escalateTicket: builder.mutation<any, { id: string; data: any }>({
            query: ({ id, data }) => ({
                url: `api/v1/support-tickets/${id}/escalate`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'SupportTicket', id }, 'SupportTicket'],
        }),
        addMessage: builder.mutation<any, { id: string; data: any }>({
            query: ({ id, data }) => ({
                url: `api/v1/support-tickets/${id}/messages`,
                method: 'POST',
                body: data,
            }),
            // Manual update or socket handles real-time, but invalidating can help consistency
            invalidatesTags: (result, error, { id }) => [{ type: 'SupportTicket', id }],
        }),
        deleteTicket: builder.mutation<any, string>({
            query: (id) => ({
                url: `api/v1/support-tickets/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['SupportTicket'],
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetTicketsQuery,
    useGetTicketsByLineOfBusinessIdQuery,
    useGetTicketByIdQuery,
    useCreateTicketMutation,
    useUpdateTicketMutation,
    useEscalateTicketMutation,
    useAddMessageMutation,
    useDeleteTicketMutation,
} = supportApi;