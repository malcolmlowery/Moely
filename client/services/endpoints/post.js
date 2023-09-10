import { api } from './api';
import { userProfileSlice } from './user-profile';

export const postSlice = api.injectEndpoints({
    endpoints: (builder) => ({

        // Create Post Query
        createPost: builder.mutation({
            query: (post_data) => ({
                url: 'api-createPost',
                method: 'POST',
                body: { post_data },
            }),
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(
                        postSlice.util.updateQueryData('getNewsfeedPosts', undefined, (draft) => {
                            const updatedNewsfeedData = {...draft, posts: [data.post].concat(draft.posts)};
                            return updatedNewsfeedData;
                        })
                    );
                    
                    dispatch(
                        userProfileSlice.util.updateQueryData('getUserProfileNewfeedPosts', ({ user_profile_uid: data.post.owner.uid }), (draft) => {
                            const updatedNewsfeedData = {...draft, posts: [data.post].concat(draft.posts)};
                            return updatedNewsfeedData;
                        })
                    );
                } catch {};
            },
        }),

        // Update Post Query
        updatePost: builder.mutation({
            query: (post_data) => ({
                url: 'api-updatePost',
                method: 'PUT',
                body: { post_data },
            }),
            async onQueryStarted({ post_id, user_profile_uid }, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(
                        postSlice.util.updateQueryData('getNewsfeedPosts', undefined, (draft) => {
                            const updatedPostData = draft.posts.map(post => {
                                if(post.post_id === post_id) {
                                    return ({ ...post, text: data.text, url_link: data.url_link, has_url_link: data.url_link ? true : false });
                                } else {
                                    return post;
                                };
                            });
                            return { ...draft, posts: updatedPostData };
                        })
                    );

                    dispatch(
                        postSlice.util.updateQueryData('getPost', ({ post_id }), (draft) => {
                            if(draft.post_id === post_id) {
                                console.log(data.text)
                                return ({ ...draft, text: data.text, url_link: data.url_link, has_url_link: data.url_link ? true : false });
                            } else {
                                return post;
                            };
                        })
                    );

                    dispatch(
                        userProfileSlice.util.updateQueryData('getUserProfileNewfeedPosts', ({ user_profile_uid: data.uid }), (draft) => {
                            const updatedPostData = draft.posts.map(post => {
                                if(post.post_id === post_id) {
                                    return ({ ...post, text: data.text, url_link: data.url_link, has_url_link: data.url_link ? true : false });
                                } else {
                                    return post;
                                };
                            });
                            return { ...draft, posts: updatedPostData };
                        })
                    );
                } catch {};
            },
        }),

        // Delete Post Query
        deletPost: builder.mutation({
            query: ({ post_id }) => ({
                url: 'api-deletePost',
                method: 'DELETE',
                body: { post_id },
            }),
            async onQueryStarted({ post_id, user_profile_uid }, { queryFulfilled, dispatch }) {
                
                    const patchResult = dispatch(
                        postSlice.util.updateQueryData('getNewsfeedPosts', undefined, (draft) => {
                            const updatedPostData = draft.posts.filter(post => post.post_id !== post_id);
                            return { ...draft, posts: updatedPostData };
                        })
                    );

                    const userProfileNewsfeedResult = dispatch(
                        userProfileSlice.util.updateQueryData('getUserProfileNewfeedPosts', ({ user_profile_uid }), (draft) => {
                            const updatedPostData = draft.posts.filter(post => post.post_id !== post_id);
                            return { ...draft, posts: updatedPostData };
                        })
                    );

                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                    userProfileNewsfeedResult.undo()
                };
            },
        }),

        // Like Post Query
        likePost: builder.mutation({
            query: ({ post_id, post_liked }) => ({
                url: 'api-likePost',
                method: 'POST',
                body: { post_id, post_liked }
            }),
            async onQueryStarted({ post_id, user_profile_uid, post_liked }, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(
                        postSlice.util.updateQueryData('getNewsfeedPosts', undefined, (draft) => {
                            const updatedPostData = draft.posts.map(post => {
                                if(post.post_id === post_id) {
                                    return ({ 
                                        ...post, 
                                        post_liked: data.post_liked, 
                                        total_likes:  data.post_liked ? post.total_likes + 1 : post.total_likes - 1
                                    });
                                } else {
                                    return post;
                                };
                            });
                            return { ...draft, posts: updatedPostData };
                        }),
                        
                        postSlice.util.updateQueryData('getFollowerPosts', undefined, (draft) => {
                            const updatedPostData = draft.posts.map(post => {
                                if(post.post_id === post_id) {
                                    return ({ 
                                        ...post, 
                                        post_liked: data.post_liked, 
                                        total_likes:  data.post_liked ? post.total_likes + 1 : post.total_likes - 1
                                    });
                                } else {
                                    return post;
                                };
                            });
                            return { ...draft, posts: updatedPostData };
                        })
                    );
                    
                    dispatch(
                        postSlice.util.updateQueryData('getPost', ({ post_id }), (draft) => {
                            if(draft.post_id === post_id) {
                                return { 
                                    ...draft, 
                                    post_liked: data.post_liked, 
                                    total_likes:  data.post_liked ? draft.total_likes + 1 : draft.total_likes - 1
                                };
                            } else {
                                return post;
                            };
                        })
                    );

                    dispatch(
                        userProfileSlice.util.updateQueryData('getUserProfileNewfeedPosts', ({ user_profile_uid }), (draft) => {
                            const updatedPostData = draft.posts.map(post => {
                                    if(post.post_id === post_id) {
                                        return ({ 
                                            ...post, 
                                            post_liked: data.post_liked, 
                                            total_likes:  data.post_liked ? post.total_likes + 1 : post.total_likes - 1
                                        });
                                    } else {
                                        return post;
                                    };
                            });
                            return { ...draft, posts: updatedPostData };
                        })
                    );
                } catch {};
            },
        }),

        // Hide Post Query
        hidePost: builder.mutation({
            query: ({ post_id }) => ({
                url: 'api-hidePost',
                method: 'POST',
                body: { post_id },
            }),
            async onQueryStarted({ post_id, user_profile_uid }, { queryFulfilled, dispatch }) {
                const patchResult = dispatch(
                    postSlice.util.updateQueryData('getNewsfeedPosts', undefined, (draft) => {
                        const updatedPostData = draft.posts.filter(post => post.post_id !== post_id);
                        return { ...draft, posts: updatedPostData };
                    })
                );

                const userFollowerNewsfeedResult = dispatch(
                    postSlice.util.updateQueryData('getFollowerPosts', undefined, (draft) => {
                        const updatedPostData = draft.posts.filter(post => post.post_id !== post_id);
                        return { ...draft, posts: updatedPostData };
                    })
                );

                const userProfileNewsfeedResult = dispatch(
                    userProfileSlice.util.updateQueryData('getUserProfileNewfeedPosts', ({ user_profile_uid }), (draft) => {
                        const updatedPostData = draft.posts.filter(post => post.post_id !== post_id);
                        return { ...draft, posts: updatedPostData };
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                    userProfileNewsfeedResult.undo();
                    userFollowerNewsfeedResult.undo();
                    
                };
            },
        }),

        // Report Post Query
        reportPost: builder.mutation({
            query: ({ post_id }) => ({
                url: 'api-reportPost',
                method: 'POST',
                body: { post_id },
            }),
            async onQueryStarted({ post_id, user_profile_uid }, { queryFulfilled, dispatch }) {
                const patchResult = dispatch(
                    postSlice.util.updateQueryData('getNewsfeedPosts', undefined, (draft) => {
                        const updatedPostData = draft.posts.filter(post => post.post_id !== post_id);
                        return { ...draft, posts: updatedPostData };
                    })
                );

                const userFollowerNewsfeedResult = dispatch(
                    postSlice.util.updateQueryData('getFollowerPosts', undefined, (draft) => {
                        const updatedPostData = draft.posts.filter(post => post.post_id !== post_id);
                        return { ...draft, posts: updatedPostData };
                    })
                );

                const userProfileNewsfeedResult = dispatch(
                    userProfileSlice.util.updateQueryData('getUserProfileNewfeedPosts', ({ user_profile_uid }), (draft) => {
                        const updatedPostData = draft.posts.filter(post => post.post_id !== post_id);
                        return { ...draft, posts: updatedPostData };
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                    userProfileNewsfeedResult.undo();
                    userFollowerNewsfeedResult.undo();
                };
            },
        }),

        // Query a Single Post
        getPost: builder.query({
            query: ({ post_id, notification_action }) => ({
                url: 'api-getPost',
                method: 'GET',
                params: { post_id, notification_action }
            }),
            providesTags: ['Post-Details'],
            // keepUnusedDataFor: 3,
        }),

        // Newsfeed Posts Queries
        getNewsfeedPosts: builder.query({
            query: () => 'api-getNewsfeedPosts',
            providesTags: ['Main-Newsfeed'],
        }),

        // Newsfeed Posts Queries - Pagination
        getMoreNewsfeedPosts: builder.mutation({
            query: (last_post_id) => ({
                url: 'api-getNewsfeedPosts',
                method: 'GET',
                params: last_post_id,
            }),
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(
                        postSlice.util.updateQueryData('getNewsfeedPosts', undefined, (draft) => {
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

        // Follower Posts Queries
        getFollowerPosts: builder.query({
            query: () => 'api-getFollowerPosts',
            providesTags: ['Follower-Newsfeed'],
        }),

        // Follower Posts Queries - Pagination
        getMoreFollowerPosts: builder.mutation({
            query: (last_post_id) => ({
                url: 'api-getFollowerPosts',
                method: 'GET',
                params: last_post_id,
            }),
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(
                        postSlice.util.updateQueryData('getFollowerPosts', undefined, (draft) => {
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
    useCreatePostMutation,
    useUpdatePostMutation,
    useDeletPostMutation,
    useLikePostMutation,
    useHidePostMutation,
    useReportPostMutation,
    useGetPostQuery,
    useGetNewsfeedPostsQuery,
    useGetMoreNewsfeedPostsMutation,
    useGetFollowerPostsQuery,
    useGetMoreFollowerPostsMutation,
} = postSlice;