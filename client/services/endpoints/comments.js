import { api } from './api';
import { postSlice } from './post';
import { userProfileSlice } from './user-profile';

const commentSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        // Create Comment Query
        createComment: builder.mutation({
            query: ({ post_id, text,  }) => ({
                url: 'api-createComment',
                method: 'POST',
                body: { post_id, text },
            }),
            async onQueryStarted({ post_id, user_profile_uid }, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(
                        commentSlice.util.updateQueryData('getComments', ({ post_id }), (draft) => {
                            const updatedCommentsData = {...draft, comments: [data.comment].concat(draft.comments)};
                            return updatedCommentsData;
                        })
                    );

                    dispatch(
                        postSlice.util.updateQueryData('getPost', ({ post_id }), (draft) => {
                            if(draft.post_id === post_id) {
                                return { 
                                    ...draft, 
                                    total_comments:  draft.total_comments + 1,
                                };
                            } else {
                                return post;
                            };
                        })
                    );
    
                    dispatch(
                        postSlice.util.updateQueryData('getNewsfeedPosts', undefined, (draft) => {
                            const updatedNewsfeedData = draft.posts.map(post => {
                                if(post.post_id === post_id) {
                                    return { ...post, total_comments: post.total_comments + 1 };
                                } else {
                                    return post;
                                }
                            });
                            return { ...draft, posts: updatedNewsfeedData };
                        })
                    );

                    dispatch(
                        userProfileSlice.util.updateQueryData('getUserProfileNewfeedPosts', ({ user_profile_uid }), (draft) => {
                            const updatedNewsfeedData = draft.posts.map(post => {
                                if(post.post_id === post_id) {
                                    return { ...post, total_comments: post.total_comments + 1 };
                                } else {
                                    return post;
                                }
                            });
                            return { ...draft, posts: updatedNewsfeedData };
                        })
                    );
                } catch {}
            },
        }),

        // Update Comment Query
        updateComment: builder.mutation({
            query: ({ post_id, comment_id, text }) => ({
                url: 'api-updateComment',
                method: 'PUT',
                body: { post_id, comment_id, text },
            }),
            async onQueryStarted({ post_id, comment_id, text }, { queryFulfilled, dispatch }) {
                const commentsPatchResult = dispatch(
                    commentSlice.util.updateQueryData('getComments', ({ post_id }), (draft) => {
                        const updateCommentsData = draft.comments.map(comment => {
                            if(comment.comment_id === comment_id) {
                                return { ...comment, text };
                            } else {
                                return comment;
                            };
                        });
                        return { ...draft, comments: updateCommentsData };
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    commentsPatchResult.undo();
                };
            },
        }),

        // Delete Comment Query
        deleteComment: builder.mutation({
            query: ({ post_id, comment_id }) => ({
                url: 'api-deleteComment',
                method: 'DELETE',
                body: { post_id, comment_id },
            }),
            async onQueryStarted({ post_id, comment_id }, { queryFulfilled, dispatch }) {
                const postPatchResult = dispatch(
                    postSlice.util.updateQueryData('getPost', ({ post_id }), (draft) => {
                        if(draft.post_id === post_id) {
                            return { 
                                ...draft, 
                                total_comments:  draft.total_comments - 1,
                            };
                        } else {
                            return post;
                        };
                    })
                );

                const commentsPatchResult = dispatch(
                    commentSlice.util.updateQueryData('getComments', ({ post_id }), (draft) => {
                        const updateCommentsData = draft.comments.filter(comment => comment.comment_id !== comment_id);
                        return { ...draft, comments: updateCommentsData };
                    })
                );

                const newsfeedPostsPatchResult = dispatch(
                    postSlice.util.updateQueryData('getNewsfeedPosts', undefined, (draft) => {
                        const updatedNewsfeedData = draft.posts.map(post => {
                            if(post.post_id === post_id) {
                                return { ...post, total_comments: post.total_comments - 1 };
                            } else {
                                return post;
                            }
                        });
                        return { ...draft, posts: updatedNewsfeedData };
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    postPatchResult.undo();
                    commentsPatchResult.undo();
                    newsfeedPostsPatchResult.undo();
                };
            },
        }),

        // Like Comment Query
        likeComment: builder.mutation({
            query: ({ post_id, comment_id, comment_liked }) => ({
                url: 'api-likeComment',
                method: 'POST',
                body: { post_id, comment_id, comment_liked }
            }),
            async onQueryStarted({ post_id, comment_id }, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(
                        commentSlice.util.updateQueryData('getComments', ({ post_id }), (draft) => {
                            const updatedCommentsData = draft.comments.map(comment => {
                                if(comment.comment_id === comment_id) {
                                    return ({ 
                                        ...comment, 
                                        comment_liked: data.comment_liked, 
                                        total_likes:  data.comment_liked ? comment.total_likes + 1 : comment.total_likes - 1
                                    });
                                } else {
                                    return comment;
                                };
                            });
                            return { ...draft, comments: updatedCommentsData };
                        })
                    );
                } catch {};
            },
        }),

        // Hide Comment Query
        hideComment: builder.mutation({
            query: ({ post_id, comment_id }) => ({
                url: 'api-hideComment',
                method: 'POST',
                body: { post_id, comment_id },
            }),
            async onQueryStarted({ post_id, comment_id }, { queryFulfilled, dispatch }) {
                const commentsPatchResult = dispatch(
                    commentSlice.util.updateQueryData('getComments', ({ post_id }), (draft) => {
                        const updateCommentsData = draft.comments.filter(comment => comment.comment_id !== comment_id);
                        return { ...draft, comments: updateCommentsData };
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    commentsPatchResult.undo();
                };
            },
        }),

         // Report Comment Query
         reportComment: builder.mutation({
            query: ({ post_id, comment_id }) => ({
                url: 'api-reportComment',
                method: 'POST',
                body: { post_id, comment_id },
            }),
            async onQueryStarted({ post_id, comment_id }, { queryFulfilled, dispatch }) {
                const commentsPatchResult = dispatch(
                    commentSlice.util.updateQueryData('getComments', ({ post_id }), (draft) => {
                        const updateCommentsData = draft.comments.filter(comment => comment.comment_id !== comment_id);
                        return { ...draft, comments: updateCommentsData };
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    commentsPatchResult.undo();
                };
            },
        }),

        // Get Comments Query
        getComments: builder.query({
            query: ({ post_id, last_comment_id }) => ({
                url: 'api-getPostComments',
                method: 'GET',
                params: { post_id, last_comment_id },
            }),
            providesTags: ['Post-Details']
        }),

        // Post Comments Queries - Pagination
        getMoreComments: builder.mutation({
            query: ({ post_id, last_comment_id }) => ({
                url: 'api-getPostComments',
                method: 'GET',
                params: { post_id, last_comment_id },
            }),
            providesTags: ['Post-Details'],
            async onQueryStarted({ post_id }, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(
                        commentSlice.util.updateQueryData('getComments', ({ post_id }), (draft) => {
                            const updatedCommentsData = {
                                ...draft,
                                last_comment_id: data.last_comment_id,
                                comments: draft.comments.concat(data.comments)
                            };
                            return updatedCommentsData;
                        })
                    );
                } catch {};
            },
        })

    })
});

export const {
    useCreateCommentMutation,
    useUpdateCommentMutation,
    useDeleteCommentMutation,
    useLikeCommentMutation,
    useHideCommentMutation,
    useReportCommentMutation,
    useGetCommentsQuery,
    useGetMoreCommentsMutation,
} = commentSlice;