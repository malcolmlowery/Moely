import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://127.0.0.1:5001/medrant-baa93/us-central1/' }),
    tagTypes: ['Post-Details'],
    endpoints: () => ({}),
});