import { api } from './api';

export const userProfileSlice = api.injectEndpoints({
    endpoints: (builder) => ({

        // Get User Profile Info
        getUserProfileInfo: builder.query({
            query: (user_profile_uid) => ({
                url: 'api-getUserProfile',
                method: 'GET',
                params: { user_profile_uid },
            }),
        }),

        // Get User Profile Posts
        getUserProfileNewfeedPosts: builder.query({
            query: ({ last_post_id, user_profile_uid }) => ({
                url: 'api-getUserProfileNewsfeed',
                method: 'GET',
                params: { last_post_id, user_profile_uid },
            }),
        }),

        // Get User Profile Posts - Pagination
        getMoreUserProfileNewsfeedPosts: builder.mutation({
            query: ({ last_post_id, user_profile_uid }) => ({
                url: 'api-getUserProfileNewsfeed',
                method: 'GET',
                params: { last_post_id, user_profile_uid },
            }),
            async onQueryStarted({ user_profile_uid }, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(
                        userProfileSlice.util.updateQueryData('getUserProfileNewfeedPosts', ({ user_profile_uid }), (draft) => {
                            const updatedNewsfeedData = {
                                ...draft,
                                last_post_id: data.last_post_id,
                                posts: draft.posts.concat(data.posts)
                            };
                            return updatedNewsfeedData;
                        })
                    );
                } catch {};
            },
        }),

    }),
});

export const {
    useGetUserProfileInfoQuery,
    useGetUserProfileNewfeedPostsQuery,
    useGetMoreUserProfileNewsfeedPostsMutation,
} = userProfileSlice;