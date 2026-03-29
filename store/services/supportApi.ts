 import { baseApi } from './baseApi';

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
    status: 'Open' | 'Pending' | 'In Progress' | 'Completed' | 'In Review' | 'Accepted' | 'Rejected' | 'Closed';
    priority: 'Low' | 'Medium' | 'High';
    creatorId: string | PopulatedMember;
    creatorType: 'User' | 'TeamMember';
    assignedToIds?: (string | PopulatedMember)[];
    assignedToType?: string | PopulatedRole;
    companyId: string;
    lineOfBusinessId: string;
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
    senderType: 'User' | 'TeamMember';
    senderName?: string;
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
        getTicketsBySupervisorId: builder.query<{ tickets: SupportTicket[]; total: number; totalPages: number }, { supervisorId: string; status?: string; priority?: string; page?: number; limit?: number; search?: string; startDate?: string; endDate?: string }>({
            query: ({ supervisorId, ...params }) => ({
                url: `api/v1/support-tickets/supervisor/${supervisorId}`,
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
        addMessage: builder.mutation<void, { id: string; data: { senderId: string; senderType: string; senderName: string; message: string; attachments?: string[] } }>({
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
    useGetTicketsBySupervisorIdQuery,
    useGetTicketByIdQuery,
    useCreateTicketMutation,
    useUpdateTicketMutation,
    useEscalateTicketMutation,
    useAddMessageMutation,
    useDeleteTicketMutation,
} = supportApi;