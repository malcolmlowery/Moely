import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ 
        baseUrl: 'https://us-central1-moely-68eee.cloudfunctions.net/',
        prepareHeaders: async (headers) => {
            const token = await AsyncStorage.getItem('token')
            if(token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers
        }

    }),
    tagTypes: ['Main-Newsfeed', 'Follower-Newsfeed', 'Post-Details', 'Activity-History', 'Post_Comments'],
    endpoints: () => ({}),
});