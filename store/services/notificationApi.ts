import { baseApi } from './baseApi';

export interface NotificationUser {
    name: string;
    avatar?: string;
    icon?: string;
}

export interface Notification {
    id: string;
    type: 'follow' | 'like' | 'join_request' | 'group_activity' | 'comment' | 'welcome' | 'notification' | 'status_created' | 'role_updated' | 'custom_alert' | 'business_registration' | 'user_created';
    user: NotificationUser;
    message: string;
    timestamp: string;
    isRead: boolean;
    createdAt?: string;
    data?: unknown;
}

export interface CreateNotificationRequest {
    type: string;
    message: string;
    sender: {
        name: string;
        avatar?: string;
    };
    recipient: {
        campaignId?: string;
        userId?: string;
    };
    data?: unknown;
}

export interface GetNotificationsResponse {
    message: string;
    notifications: Notification[];
}

export const notificationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getNotificationsByCampaignId: builder.query<GetNotificationsResponse, string>({
            query: (campaignId) => `api/v1/notifications?campaignId=${campaignId}`,
            providesTags: ['Notification'],
        }),
        getNotificationsByUserId: builder.query<GetNotificationsResponse, string>({
            query: (userId) => `api/v1/notifications?userId=${userId}`,
            providesTags: ['Notification'],
        }),
        getNotificationsByRole: builder.query<GetNotificationsResponse, string>({
            query: (role) => `api/v1/notifications?role=${role}`,
            providesTags: ['Notification'],
        }),
        markNotificationAsRead: builder.mutation<unknown, string>({
            query: (id) => ({
                url: `api/v1/notifications/${id}/read`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Notification'],
        }),
        markAllNotificationsAsRead: builder.mutation<unknown, void>({
            query: () => ({
                url: 'api/v1/notifications/read-all',
                method: 'PATCH',
            }),
            invalidatesTags: ['Notification'],
        }),
        createNotification: builder.mutation<unknown, CreateNotificationRequest>({
            query: (notificationData) => ({
                url: 'api/v1/notifications',
                method: 'POST',
                body: notificationData,
            }),
            invalidatesTags: ['Notification'],
        }),
        deleteNotification: builder.mutation<unknown, string>({
            query: (id) => ({
                url: `api/v1/notifications/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Notification'],
        }),
    }),
});

export const { 
    useGetNotificationsByCampaignIdQuery,
    useGetNotificationsByUserIdQuery,
    useGetNotificationsByRoleQuery,
    useMarkNotificationAsReadMutation,
    useMarkAllNotificationsAsReadMutation,
    useCreateNotificationMutation,
    useDeleteNotificationMutation
} = notificationApi;
