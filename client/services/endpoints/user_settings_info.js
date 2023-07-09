import { api } from './api';
import { postSlice } from './post';
import { userProfileSlice } from './user-profile';

export const userSettingsInfoSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        getUserSettingsInfo: builder.query({
            query: () => ({
                url: 'api-getAccountInfo',
                method: 'GET',
            }),
        }),

        updateUserSettings: builder.mutation({
            query: (user_info) => ({
                url: 'api-updateUserProfile',
                method: 'POST',
                body: user_info,
            }),
            invalidatesTags: ['Post-Details'],
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                const { data: updated_user_info } = await queryFulfilled;

                const {
                    uid,
                    username, 
                    about_me, 
                    location, 
                    occupation, 
                    place_of_work, 
                    important_to_me,
                } = updated_user_info;

                try {
                    dispatch(
                        userSettingsInfoSlice.util.updateQueryData('getUserSettingsInfo', undefined, (draft) => {
                            return Object.assign(draft, updated_user_info)
                        }),
                    );

                    dispatch(
                        userProfileSlice.util.updateQueryData('getUserProfileInfo', (uid), (draft) => {
                            return ({ ...draft, ...updated_user_info })
                        }),
                    );

                    dispatch(
                        userProfileSlice.util.updateQueryData('getUserProfileNewfeedPosts', ({ user_profile_uid: uid }), (draft) => {
                            const updatedPostData = draft.posts.map(post => {
                                console.log('TEST')
                                return ({ ...post, owner: { ...post.owner, username, occupation } });
                            });
                            return { ...draft, posts: updatedPostData };
                        }),
                    );
                    
                    dispatch(
                        postSlice.util.updateQueryData('getNewsfeedPosts', undefined, (draft) => {
                            const updatedPostData = draft.posts.map(post => {
                                if(post.owner.uid === uid) {
                                    return ({ ...post, owner: { ...post.owner, username, occupation } });
                                } else {
                                    return post
                                }
                            });
                            return { ...draft, posts: updatedPostData };
                        }),
                    );
                    
                } catch {}

            },
        }),

        // Upload Profile Image
        uploadProfileImage: builder.mutation({
            query: ({ profile_image }) => ({
                url: 'api-uploadProfileImage',
                method: 'POST',
                body: profile_image
            }),
            invalidatesTags: ['Post-Details'],
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                const { data } = await queryFulfilled;

                try {
                    dispatch(
                        userSettingsInfoSlice.util.updateQueryData('getUserSettingsInfo', undefined, (draft) => {
                            return Object.assign(draft, { ...draft, profile_image: data.profile_image })
                        }),
                    );

                    dispatch(
                        userProfileSlice.util.updateQueryData('getUserProfileInfo', (data.uid), (draft) => {
                            return ({ ...draft, profile_image: data.profile_image })
                        }),
                    );

                    dispatch(
                        userProfileSlice.util.updateQueryData('getUserProfileNewfeedPosts', ({ user_profile_uid: data.uid }), (draft) => {
                            const updatedPostData = draft.posts.map(post => {
                                console.log('TEST')
                                return ({ ...post, owner: { ...post.owner, profile_image: data.profile_image  } });
                            });
                            return { ...draft, posts: updatedPostData };
                        }),
                    );
                    
                    dispatch(
                        postSlice.util.updateQueryData('getNewsfeedPosts', undefined, (draft) => {
                            const updatedPostData = draft.posts.map(post => {
                                if(post.owner.uid === data.uid) {
                                    return ({ ...post, owner: { ...post.owner, profile_image: data.profile_image  } });
                                } else {
                                    return post
                                }
                            });
                            return { ...draft, posts: updatedPostData };
                        }),
                    );
                } catch {}
            }
        }),

        // Upload Wallpaper Image
        uploadPhotoCover: builder.mutation({
            query: ({ cover_photo_image }) => ({
                url: 'api-uploadCoverPhoto',
                method: 'POST',
                body: cover_photo_image
            }),
            invalidatesTags: ['Post-Details'],
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                const { data } = await queryFulfilled;

                try {
                    dispatch(
                        userSettingsInfoSlice.util.updateQueryData('getUserSettingsInfo', undefined, (draft) => {
                            return Object.assign(draft, { ...draft, cover_photo: data.cover_photo })
                        }),
                    );

                    dispatch(
                        userProfileSlice.util.updateQueryData('getUserProfileInfo', (data.uid), (draft) => {
                            return ({ ...draft, cover_photo: data.cover_photo })
                        }),
                    );
                } catch {}
            }
        }),

    }),
});

export const { 
    useGetUserSettingsInfoQuery,
    useUpdateUserSettingsMutation,
    useUploadProfileImageMutation,
    useUploadPhotoCoverMutation,
} = userSettingsInfoSlice;