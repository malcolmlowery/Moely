import { api } from './api';

export const userActivityHistorySlice = api.injectEndpoints({
    endpoints: (builder) => ({
        getUserActivityHistory: builder.query({
            query: () => ({
                url: 'api-getUserActivityHistory',
                method: 'GET',
            }),
        }),
        getMoreUserActivityHistory: builder.mutation({
            query: (last_activity_id) => ({
                url: 'api-getUserActivityHistory',
                method: 'GET',
                params: last_activity_id
            }),
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(
                        userActivityHistorySlice.util.updateQueryData('getUserActivityHistory', undefined, (draft) => {
                            const updatedUserActivityHistoryData = {
                                ...draft,
                                last_activity_id: data.last_activity_id,
                                user_activities: draft.user_activities.concat(data.user_activities)
                            };
                            return updatedUserActivityHistoryData;
                        })
                    );
                } catch {};
            },
        }),
    }),
});

export const { 
    useGetUserActivityHistoryQuery,
    useGetMoreUserActivityHistoryMutation,
 } = userActivityHistorySlice;