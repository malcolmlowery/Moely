import styled from 'styled-components/native';
import { useState } from 'react';
import { Stack, useRouter, useSearchParams } from 'expo-router';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import moment from 'moment';
import Lottie from 'lottie-react-native';

// Components
import Card from '../../../components/Card';
import Comment from '../../../components/Comment';

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
    const { post_id, comment_id, other_user_uid }: any = useSearchParams();
    console.log(other_user_uid)
    const { data: post, isLoading: isLoadingPost, isError: errorLoadingPost, refetch: refetchPostData } = useGetPostQuery({ post_id });
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

    return(
        <>
            <Stack.Screen 
                options={{ 
                    title: '', 
                    headerLeft: null,
                    headerRight: () => <Logo_01 source={Moely_Logo_01} />
                }} 
            />
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
                        if(!isLoadingMoreCommentsData && comments_data.comments > 0) {
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
                ListHeaderComponent={() => {
                    const timestamp = moment.unix(post?.created_at).fromNow();
                    return(
                        <>
                            {!isLoadingPost &&
                                <Card 
                                    post_id={post.post_id}
                                    is_post_owner={post.is_post_owner}
                                    username={post.owner.username}
                                    profileImage={post.owner.profile_image}
                                    occupation={post.owner.occupation}
                                    created_at={timestamp}
                                    text={post.text}
                                    post_liked={post.post_liked}
                                    total_likes={post.total_likes}
                                    total_comments={post.total_comments}
                                    navigate_to_profile={() => router.push({
                                        pathname: `home/profile/${post.owner.uid}`,
                                        params: { other_user_uid: post.owner.uid }
                                    })}
                                    navigate_to_post={() => {}}
                                    navigatingTo='post'
                                    toggle_create_comment_active={() => setCommentOnPostActive(!commentOnPostActive)}
                                    create_comment_active={commentOnPostActive}
                                    query_create_comment={(text) => !isCreatingComment && createCommentQuery({ post_id: post.post_id, text, user_profile_uid: other_user_uid })}
                                    query_update_post={(updatedText) => !isUpdatingPost && updatePostQuery({ post_id, text: updatedText })}
                                    query_like_post={(value) => !likePostQueryActive && likePostQuery({ post_id, post_liked: value, user_profile_uid: other_user_uid })}
                                    query_delete_post={() => {
                                        if(!isDeletingPost) {
                                            deletPostQuery({ post_id, user_profile_uid: other_user_uid });
                                            router.back(); 
                                        };
                                    }}
                                    query_report_post={() => {
                                        if(!isReportingPost) {
                                            reportPostQuery({ post_id });
                                            router.back(); 
                                        };
                                    }}
                                    query_hide_post={() => {
                                        if(!isHidingPost) {
                                            hidePostQuery({ post_id });
                                            router.back();
                                        };
                                    }}
                                />
                            }
                        </>
                    )
                }}
                keyExtractor={item => item.comment_id}
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
                            {!isLoadingCommentsData &&
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
                                        params: { other_user_uid: owner.uid }
                                    })}
                                    query_update_comment={(text) => !isUpdatingComment && updateCommentQuery({ post_id: post_id_ref, comment_id, text })}
                                    query_delete_comment={() => !isDeletingComment && deleteCommentQuery({ post_id: post_id_ref, comment_id })}
                                    query_like_comment={(value) => !likeCommentQueryActive && likeCommentQuery({ post_id: post_id_ref, comment_id, comment_liked: value })}
                                    query_hide_comment={() => !isHidingComment && hideCommentQuery({ post_id: post_id_ref, comment_id })}
                                    query_report_comment={() => !isReportingComment && reportCommentQuery({ post_id: post_id_ref, comment_id })}
                                />
                            }
                        </>
                    )
                }}
            />
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