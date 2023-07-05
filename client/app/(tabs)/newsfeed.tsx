import styled from 'styled-components/native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import Lottie from 'lottie-react-native';
import { Alert } from 'react-native';

// Types
import { CardI } from '../../types/card.interface';

// Components
import Card from '../../components/Card';
import CreatePostButton from '../../components/CreatePostButton';

// RTK Query
import { 
    useGetNewsfeedPostsQuery, 
    useCreatePostMutation, 
    useGetMoreNewsfeedPostsMutation, 
    useLikePostMutation, 
    useUpdatePostMutation,
    useDeletPostMutation,
    useHidePostMutation,
    useReportPostMutation,
 } from '../../services/endpoints/post';import BottomSheet from '../../components/BottomSheet';
;

const Newsfeed = () => {
    const router = useRouter();

    const [createPostViewActive, setCreatePostViewActive] = useState(false);

    const [createPostQuery, { isLoading: isCreatingPost, error: errorCreatingPost, reset: resetCreatePostQuery }] = useCreatePostMutation();
    const [updatePostQuery, { isLoading: isUpdatingPost, error: errorUpdatingPost }] = useUpdatePostMutation();
    const [deletPostQuery, { isLoading: isDeletingPost, error: errorDeletingPost }] = useDeletPostMutation();
    const [hidePostQuery, { isLoading: isHidingPost, error: errorHidingPost }] = useHidePostMutation();
    const [reportPostQuery, { isLoading: isReportingPost, error: errorReportingPost }] = useReportPostMutation();
    const [likePostQuery, { isLoading: likePostQueryActive }] = useLikePostMutation();

    const { data: newsfeed_data, isLoading: isLoadingNewsfeedData, isFetching: isFetchingNewsfeedData, refetch: refetchNewsfeedData } = useGetNewsfeedPostsQuery();
    const [getMoreNewsfeedPosts, { isLoading: isLoadingMoreNewsfeedData }] = useGetMoreNewsfeedPostsMutation();
    
    if( 
        errorCreatingPost ||
        errorUpdatingPost ||
        errorDeletingPost ||
        errorHidingPost ||
        errorReportingPost
    ) {
        Alert.alert(
            'Error ⚠️',
            'There was an issue performing your request. Please try again.',
            [
                { 
                    text: 'Okay', 
                    style: 'cancel', 
                    onPress: () => resetCreatePostQuery()
                },
            ],
        )
    };
    
    return (
        <>
            <KeyboardAwareFlatList 
                style={{ paddingTop: 3 }}
                keyboardShouldPersistTaps='always'
                extraScrollHeight={30}
                onRefresh={() => refetchNewsfeedData()}
                refreshing={isFetchingNewsfeedData}
                onEndReached={() => {
                    if(!isLoadingNewsfeedData && newsfeed_data?.last_post_id !== 'end_of_list') {
                        getMoreNewsfeedPosts({ last_post_id: newsfeed_data?.last_post_id })
                    };
                }}
                ListFooterComponent={() => {
                    return(
                        <FooterContainer>
                            { newsfeed_data?.last_post_id === 'end_of_list' && !isLoadingNewsfeedData &&
                                <Text>You have reached the end 📄</Text>
                            }
                            { 
                                newsfeed_data?.last_post_id !== 'end_of_list' && 
                                isLoadingNewsfeedData || 
                                isLoadingMoreNewsfeedData && 
                                    <Lottie autoPlay style={{ height: 45, width: 45 }} source={require('../../assets/animations/loading_anime_black_01.json')} />
                            }
                        </FooterContainer>
                    );
                }}
                data={newsfeed_data?.posts}
                keyExtractor={item => item.post_id}
                renderItem={({ item }) => {
                    
                    const {
                        post_id,
                        is_post_owner,
                        owner,
                        timestamp,
                        text,
                        post_liked,
                        total_likes,
                        total_comments,
                    }: Partial<CardI> = item;
                    
                    return(
                        <Card
                            post_id={post_id}
                            is_post_owner={is_post_owner}
                            username={owner.username}
                            profileImage={owner.profileImage}
                            occupation={owner.occupation}
                            timestamp={timestamp}
                            text={text}
                            post_liked={post_liked}
                            total_likes={total_likes}
                            total_comments={total_comments}
                            navigate_to_post={() => router.push({ 
                                pathname: `home/post/${post_id}`, 
                                params: { post_id },
                            })}
                            navigate_to_profile={() => router.push({
                                pathname: `home/profile/${owner.uid}`,
                                params: { other_user_uid: owner.uid }
                            })}
                            query_update_post={(updatedText) => !isUpdatingPost && updatePostQuery({ post_id, text: updatedText })}
                            query_like_post={(value) => !likePostQueryActive && likePostQuery({ post_id, post_liked: value })}
                            query_delete_post={() => !isDeletingPost && deletPostQuery({ post_id })}
                            query_report_post={() => !isReportingPost && reportPostQuery({ post_id })}
                            query_hide_post={() => isHidingPost && hidePostQuery({ post_id })}
                        />
                    )
                }}
            />

            <CreatePostButton onPress={() => setCreatePostViewActive(true)} />
            
            <BottomSheet
                dismissBottomSheet={() => setCreatePostViewActive(false)}
                createPostViewActive={createPostViewActive}
                isCreatingPost={isCreatingPost} 
                query_create_post={(text) => {
                    createPostQuery(text).then(({ error }: any) => {
                        if(!error) setCreatePostViewActive(false)
                    })
                }} 
            />
        </>
    );
};

export default Newsfeed;

const FooterContainer = styled.View`
    align-items: center;
    margin: 30px 0;
    margin-bottom: 35px;
`;

const Text = styled.Text`
    color: #a5a5a5;
    font-size: 13px;
`;