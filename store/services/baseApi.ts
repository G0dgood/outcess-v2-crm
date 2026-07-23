import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

const baseQuery = fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '',
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth?.tokens?.accessToken || (typeof window !== 'undefined' ? localStorage.getItem('outcess-token') : null);
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
    const result = await baseQuery(args, api, extraOptions);
    if (result.error && result.error.status === 401) {
        if (typeof window !== 'undefined') {
            if (!(window as any).__tokenExpiredModalShowing) {
                (window as any).__tokenExpiredModalShowing = true;
                window.dispatchEvent(new CustomEvent('token-expired'));
            }
        }
    }
    return result;
};

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
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
        'SupportTicket',
        'Email',
        'SMS'
    ],
    endpoints: () => ({}),
});
