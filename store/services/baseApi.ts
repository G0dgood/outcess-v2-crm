import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ 
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth?.tokens?.accessToken || (typeof window !== 'undefined' ? localStorage.getItem('outcess-token') : null);
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: [
        'User', 
        'Disposition', 
        'Campaign', 
        'Notification', 
        'Roles', 
        'PermissionTemplates', 
        'SetupBook', 
        'Statuses', 
        'TeamMembers',
        'Company',
        'StickyNote',
        'SupportTicket'
    ],
    endpoints: () => ({}),
});
