import { baseApi } from './baseApi';

export interface StickyNoteData {
    id?: string;
    _id?: string;
    title: string;
    content: string;
    color: string;
    todos: Array<{ id: string; text: string; completed: boolean }>;
    position: { x: number; y: number };
    rotation: number;
    isHidden: boolean;
    reminder?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface StickyNoteResponse {
    message: string;
    stickyNote?: StickyNoteData;
    stickyNotes?: StickyNoteData[];
}

export const stickyNoteApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getStickyNotes: builder.query<StickyNoteResponse, string>({
            query: (userId) => `api/v1/sticky-notes?userId=${userId}`,
            providesTags: (result) =>
                result?.stickyNotes
                    ? [
                          ...result.stickyNotes.map(({ _id }) => ({ type: 'StickyNote' as const, id: _id })),
                          { type: 'StickyNote', id: 'LIST' },
                      ]
                    : [{ type: 'StickyNote', id: 'LIST' }],
        }),
        createStickyNote: builder.mutation<StickyNoteResponse, Partial<StickyNoteData> & { userId: string }>({
            query: (body) => ({
                url: 'api/v1/sticky-notes',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'StickyNote', id: 'LIST' }],
        }),
        updateStickyNote: builder.mutation<StickyNoteResponse, Partial<StickyNoteData> & { id: string; userId: string }>({
            query: ({ id, ...body }) => ({
                url: `api/v1/sticky-notes/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'StickyNote', id },
                { type: 'StickyNote', id: 'LIST' },
            ],
        }),
        deleteStickyNote: builder.mutation<StickyNoteResponse, { id: string; userId: string }>({
            query: ({ id, userId }) => ({
                url: `api/v1/sticky-notes/${id}?userId=${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'StickyNote', id },
                { type: 'StickyNote', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetStickyNotesQuery,
    useCreateStickyNoteMutation,
    useUpdateStickyNoteMutation,
    useDeleteStickyNoteMutation,
} = stickyNoteApi;
