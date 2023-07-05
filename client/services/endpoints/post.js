import { api } from './api';

const postSlice = api.injectEndpoints({
    endpoints: (builder) => ({

        // Create Post Query
        createPost: builder.mutation({
            query: (text) => ({
                url: 'api-createPost',
                method: 'POST',
                body: { text },
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
                } catch {};
            },
        }),

        // Update Post Query
        updatePost: builder.mutation({
            query: ({ post_id, text }) => ({
                url: 'api-updatePost',
                method: 'PUT',
                body: { post_id, text },
            }),
            async onQueryStarted({ post_id }, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(
                        postSlice.util.updateQueryData('getNewsfeedPosts', undefined, (draft) => {
                            const updatedPostData = draft.posts.map(post => {
                                if(post.post_id === post_id) {
                                    return ({ ...post, text: data.text });
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
            async onQueryStarted({ post_id }, { queryFulfilled, dispatch }) {
                const { data } = await queryFulfilled;
                    const patchResult = dispatch(
                        postSlice.util.updateQueryData('getNewsfeedPosts', undefined, (draft) => {
                            const updatedPostData = draft.posts.filter(post => post.post_id !== post_id);
                            return { ...draft, posts: updatedPostData };
                        })
                    );

                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
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
            async onQueryStarted({ post_id }, { queryFulfilled, dispatch }) {
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
            async onQueryStarted({ post_id }, { queryFulfilled, dispatch }) {
                const patchResult = dispatch(
                    postSlice.util.updateQueryData('getNewsfeedPosts', undefined, (draft) => {
                        const updatedPostData = draft.posts.filter(post => post.post_id !== post_id);
                        return { ...draft, posts: updatedPostData };
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
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
            async onQueryStarted({ post_id }, { queryFulfilled, dispatch }) {
                const patchResult = dispatch(
                    postSlice.util.updateQueryData('getNewsfeedPosts', undefined, (draft) => {
                        const updatedPostData = draft.posts.filter(post => post.post_id !== post_id);
                        return { ...draft, posts: updatedPostData };
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                };
            },
        }),

        // Newsfeed Posts Queries
        getNewsfeedPosts: builder.query({
            query: () => 'api-getNewsfeedPosts'
        }),
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
        })


    }),
});

export const {
    useCreatePostMutation,
    useUpdatePostMutation,
    useDeletPostMutation,
    useLikePostMutation,
    useHidePostMutation,
    useReportPostMutation,
    useGetNewsfeedPostsQuery,
    useGetMoreNewsfeedPostsMutation,
} = postSlice;