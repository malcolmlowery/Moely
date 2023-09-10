import { api } from './api';
import { userProfileSlice } from './user-profile';

export const followInteractionsSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        followUser: builder.mutation({
            query: ({ profile_uid }) => ({
                url: 'api-followUser',
                method: 'POST',
                body: { profile_uid },
            }),
            async onQueryStarted({ profile_uid }, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(
                        userProfileSlice.util.updateQueryData('getUserProfileInfo', ({ user_profile_uid: profile_uid }), (draft) => {
                            console.log(1)
                            if(data.uid && profile_uid) {
                                return ({ ...draft, following_user: data.following_user })
                            } else {
                                return draft
                            }
                        })
                    );
                } catch {}
            },
        }),
        getFollowers: builder.query({
            query: () => 'api-getFollowers',
        }),
        getFollowings: builder.query({
            query: () => 'api-getFollowing',
        }),
    }),
});

export const { 
    useGetFollowersQuery, 
    useGetFollowingsQuery,
    useFollowUserMutation,
} = followInteractionsSlice;