import { api } from './api';

export const userProfileSlice = api.injectEndpoints({
    endpoints: (builder) => ({

        // Get User Profile Info
        getUserProfileInfo: builder.query({
            query: ({ user_profile_uid, notification_action }) => ({
                url: 'api-getUserProfile',
                method: 'GET',
                params: { user_profile_uid, notification_action },
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

        getBlockedUsers: builder.query({
            query: () => 'api-getBlockedUsers',
        }),

        blockUser: builder.mutation({
            query: (user_profile_uid) => ({
                url: 'api-blockUser',
                method: 'POST',
                body: { user_profile_uid },
            }),
            invalidatesTags: ['Main-Newsfeed', 'Follower-Newsfeed', 'Activity-History', 'Post_Comments'],
        }),

        unblockUser: builder.mutation({
            query: (blocked_uid) => ({
                url: 'api-unblockUser',
                method: 'POST',
                body: { blocked_uid },
            }),
            async onQueryStarted(blocked_uid, { queryFulfilled, dispatch }) {
                const patchBlockedUsers = dispatch(
                    userProfileSlice.util.updateQueryData('getBlockedUsers', undefined, (draft) => {
                        console.log(blocked_uid)
                        const updatedBlockedUsersArray = draft.filter(user => user.uid !== blocked_uid);
                        return  [...updatedBlockedUsersArray];
                    }),
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchBlockedUsers.undo();
                }
            },
        }),

        deleteUser: builder.mutation({
            query: (uid) => ({
                url: 'api-deleteUserAccount',
                method: 'POST',
                body: { uid },
            }),
        }),

    }),
});

export const {
    useGetUserProfileInfoQuery,
    useGetUserProfileNewfeedPostsQuery,
    useGetMoreUserProfileNewsfeedPostsMutation,
    useGetBlockedUsersQuery,
    useBlockUserMutation,
    useUnblockUserMutation,
    useDeleteUserMutation,
} = userProfileSlice;