import styled from 'styled-components/native';
import { useEffect, useState } from 'react';
import { Stack, useRouter, useSearchParams } from 'expo-router';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import moment from 'moment';
import Lottie from 'lottie-react-native';

// Components
import Card from '../../../components/Card';
import Comment from '../../../components/Comment';
import SkeletonLoader from '../../../components/Skeleton-Loader';

// Assets
const Moely_Logo_01 = require('../../../assets/logos/moely_logo_01.png');

// RTK Query
import { 
    useGetPostQuery,
    useUpdatePostMutation,
    useDeletPostMutation,
    useHidePostMutation,
    useReportPostMutation,
    useLikePostMutation,
} from '../../../services/endpoints/post';

import { 
    useCreateCommentMutation,
    useDeleteCommentMutation,
    useGetCommentsQuery,
    useGetMoreCommentsMutation,
    useHideCommentMutation,
    useLikeCommentMutation,
    useReportCommentMutation,
    useUpdateCommentMutation,
} from '../../../services/endpoints/comments';

const PostDetails = () => {
    const router = useRouter();
    const { post_id, comment_id, user_profile_uid, notification_action }: any = useSearchParams();

    const { data: post_data, isLoading: isLoadingPost, isError: errorLoadingPost, refetch: refetchPostData } = useGetPostQuery({ post_id, notification_action });
    const [updatePostQuery, { isLoading: isUpdatingPost, error: errorUpdatingPost }] = useUpdatePostMutation();
    const [deletPostQuery, { isLoading: isDeletingPost, error: errorDeletingPost }] = useDeletPostMutation();
    const [hidePostQuery, { isLoading: isHidingPost, error: errorHidingPost }] = useHidePostMutation();
    const [reportPostQuery, { isLoading: isReportingPost, error: errorReportingPost }] = useReportPostMutation();
    const [likePostQuery, { isLoading: likePostQueryActive }] = useLikePostMutation();

    const { data: comments_data, isLoading: isLoadingCommentsData, isFetching: isFetchingCommentsData, refetch: refetchCommentsData } = useGetCommentsQuery({ post_id, last_comment_id: undefined });
    const [getMoreComments, { isLoading: isLoadingMoreCommentsData }] = useGetMoreCommentsMutation();
    const [createCommentQuery, {isLoading: isCreatingComment, isError: errorCreatingComment }] = useCreateCommentMutation();
    const [updateCommentQuery, {isLoading: isUpdatingComment, isError: errorUpdatingComment }] = useUpdateCommentMutation();
    const [deleteCommentQuery, {isLoading: isDeletingComment, isError: errorDeletingComment }] = useDeleteCommentMutation();
    const [likeCommentQuery, { isLoading: likeCommentQueryActive }] = useLikeCommentMutation();
    const [hideCommentQuery, { isLoading: isHidingComment, error: errorHidingComment }] = useHideCommentMutation();
    const [reportCommentQuery, { isLoading: isReportingComment, error: errorReportingComment }] = useReportCommentMutation();

    const [commentOnPostActive, setCommentOnPostActive] = useState(false);

    const [post, setPost] = useState(null);

    useEffect(() => {
        setPost(post_data)
        return () => {}
    }, [post_data])

    useEffect(() => {
        if(!isLoadingPost && !isLoadingCommentsData && notification_action) {
            refetchPostData();
            refetchCommentsData();
        };
    }, []);

    const renderHeader = () => {
        const timestamp = moment.unix(post?.created_at).fromNow();
        return(
            <>
                {isLoadingPost && <SkeletonLoader type='post' />}
                {!isLoadingPost &&
                    <Card 
                        post_id={post?.post_id}
                        is_post_owner={post?.is_post_owner}
                        username={post?.owner.username}
                        profileImage={post?.owner.profile_image}
                        occupation={post?.owner.occupation}
                        created_at={timestamp}
                        text={post?.text ? post?.text : ''}
                        post_liked={post?.post_liked}
                        total_likes={post?.total_likes}
                        total_comments={post?.total_comments}
                        has_url_link={post?.has_url_link}
                        url_link={post?.url_link}
                        edit_post={() => {
                            router.push({
                                pathname: 'home/update-post',
                                params: { post_id },
                            })
                        }}
                        navigate_to_profile={() => router.push({
                            pathname: `home/profile/${post?.owner.uid}`,
                            params: { user_profile_uid: post?.owner.uid }
                        })}
                        navigate_to_post={() => {}}
                        navigatingTo='post'
                        toggle_create_comment_active={() => setCommentOnPostActive(!commentOnPostActive)}
                        create_comment_active={commentOnPostActive}
                        query_create_comment={(text) => createCommentQuery({ post_id: post?.post_id, text, user_profile_uid: user_profile_uid })}
                        query_update_post={(updatedText) => updatePostQuery({ post_id, text: updatedText })}
                        query_like_post={(value) => likePostQuery({ post_id, post_liked: value, user_profile_uid: post?.owner.uid })}
                        query_delete_post={() => deletPostQuery({ post_id })}
                        query_report_post={() => reportPostQuery({ post_id })}
                        query_hide_post={() => hidePostQuery({ post_id })}
                    />
                }
            </>
        );
    };

    return(
        <>
            <Stack.Screen 
                options={{ 
                    title: '', 
                    headerLeft: null,
                    headerRight: () => <Logo_01 source={Moely_Logo_01} />
                }} 
            />

            {isLoadingPost &&
                <>
                    <SkeletonLoader type='post' />
                    <SkeletonLoader type='comment' />
                    <SkeletonLoader type='comment' />
                    <SkeletonLoader type='comment' />
                    <SkeletonLoader type='comment' />
                </>
            }

            {!isLoadingPost &&
                <KeyboardAwareFlatList 
                    keyboardShouldPersistTaps='always'
                    extraScrollHeight={30}
                    style={{ marginBottom: 20, overflow: 'visible' }}
                    onRefresh={() => {
                        refetchPostData();
                        refetchCommentsData();
                    }}
                    refreshing={isLoadingPost}
                    onEndReached={() => {
                        if(!isLoadingCommentsData && comments_data?.last_comment_id !== 'end_of_list') {
                            if(!isLoadingMoreCommentsData && comments_data.comments.length > 0) {
                                getMoreComments({ post_id: post.post_id, last_comment_id: comments_data?.last_comment_id });
                            };
                        };
                    }}
                    ListFooterComponent={() => {
                        return(
                            <FooterContainer>
                                { comments_data?.last_comment_id === 'end_of_list' && !isLoadingCommentsData &&
                                    <Text>You have reached the end 📄</Text>
                                }
                                { 
                                    comments_data?.last_comment_id !== 'end_of_list' && 
                                    isLoadingCommentsData || 
                                    isLoadingMoreCommentsData && 
                                        <Lottie autoPlay style={{ height: 45, width: 45 }} source={require('../../../assets/animations/loading_anime_black_01.json')} />
                                }
                            </FooterContainer>
                        );
                    }}
                    ListHeaderComponent={renderHeader()}
                    keyExtractor={item => item.comment_id + item.owner.uid}
                    data={comments_data?.comments}
                    renderItem={({ item }) => {
                        const timestamp = moment.unix(item.created_at).fromNow();
                        const {
                            comment_id,
                            post_id_ref,
                            is_comment_owner,
                            text,
                            comment_liked,
                            total_likes,
                            owner,
                        } = item;

                        return(
                            <>  
                                {!isLoadingCommentsData && !isLoadingPost &&
                                    <Comment 
                                        username={owner.username} 
                                        occupation={owner.occupation}
                                        timestamp={timestamp}
                                        profile_image={owner.profile_image}
                                        is_comment_owner={is_comment_owner}
                                        text={text}
                                        comment_liked={comment_liked}
                                        total_comment_likes={total_likes}
                                        navigate_to_profile={() => router.push({
                                            pathname: `home/profile/${owner.uid}`,
                                            params: { user_profile_uid: owner.uid }
                                        })}
                                        query_update_comment={(text) => updateCommentQuery({ post_id: post_id_ref, comment_id, text })}
                                        query_delete_comment={() => deleteCommentQuery({ post_id: post_id_ref, comment_id })}
                                        query_like_comment={(value) => likeCommentQuery({ post_id: post_id_ref, comment_id, comment_liked: value })}
                                        query_hide_comment={() => hideCommentQuery({ post_id: post_id_ref, comment_id })}
                                        query_report_comment={() => reportCommentQuery({ post_id: post_id_ref, comment_id })}
                                    />
                                }
                            </>
                        )
                    }}
                />
            }
        </>
    );
};

export default PostDetails;

const Logo_01 = styled.Image`
    border-radius: 7px;
    height: 32px;
    width: 32px;
`;

const FooterContainer = styled.View`
    align-items: center;
    margin: 30px 0;
    margin-bottom: 35px;
`;

const Text = styled.Text`
    color: #a5a5a5;
    font-size: 13px;
`;