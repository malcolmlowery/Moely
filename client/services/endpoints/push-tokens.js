import { api } from './api';

export const pushTokenSlice = api.injectEndpoints({
    endpoints: builder => ({
        sendIOSPushTokenToBackend: builder.mutation({
            query: (token) => ({
                url: 'api-pushToken',
                method: 'POST',
                body: { push_token: token }
            }),
        }),
        deletePushToken: builder.mutation({
            query: () => ({
                url: 'api-deletePushToken',
                method: 'POST',
            }),
        }),
    }),
});

export const { 
    useSendIOSPushTokenToBackendMutation,
    useDeletePushTokenMutation,
} = pushTokenSlice;