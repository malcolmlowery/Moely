import styled from 'styled-components/native';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, useWindowDimensions } from 'react-native';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import moment from 'moment';
import Lottie from 'lottie-react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

// Types
import { CardI } from '../../types/card.interface';

// Components
import Card from '../../components/Card';
import CreatePostButton from '../../components/CreatePostButton';
import SkeletonLoader from '../../components/Skeleton-Loader';

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
    useGetFollowerPostsQuery,
    useGetMoreFollowerPostsMutation,
 } from '../../services/endpoints/post';
import { useCreateCommentMutation } from '../../services/endpoints/comments';
import { useGetUserSettingsInfoQuery } from '../../services/endpoints/user_settings_info';
import { useSendIOSPushTokenToBackendMutation } from '../../services/endpoints/push-tokens';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
});

const GeneralNewsFeed = () => {
    const device_brand = Device.brand;
    const router = useRouter();

    const { data: user_settings_data, isLoading: isLoadingUserSettingsData, isFetching: isFetchingUserSettingsData, isError: errorLoadingUserSettingsData, refetch: refetchUserSettingsData } = useGetUserSettingsInfoQuery();
    const [updatePostQuery, { isLoading: isUpdatingPost, error: errorUpdatingPost }] = useUpdatePostMutation();
    const [deletPostQuery, { isLoading: isDeletingPost, error: errorDeletingPost }] = useDeletPostMutation();
    const [hidePostQuery, { isLoading: isHidingPost, error: errorHidingPost }] = useHidePostMutation();
    const [reportPostQuery, { isLoading: isReportingPost, error: errorReportingPost }] = useReportPostMutation();
    const [likePostQuery, { isLoading: likePostQueryActive }] = useLikePostMutation();
    const [pushNewTokenQuery, { isError: errorPushingToken }] = useSendIOSPushTokenToBackendMutation();

    const { data: newsfeed_data, isLoading: isLoadingNewsfeedData, isFetching: isFetchingNewsfeedData, isError: errorLoadingNewfeedPost, refetch: refetchNewsfeedData } = useGetNewsfeedPostsQuery();
    const [getMoreNewsfeedPosts, { isLoading: isLoadingMoreNewsfeedData }] = useGetMoreNewsfeedPostsMutation();
    const [createCommentQuery, {isLoading: isLoadingComment, isError: errorLoadingComment }] = useCreateCommentMutation();

    return(
        <>
            { isLoadingNewsfeedData && 
                <>
                    <SkeletonLoader type='post' />
                    <SkeletonLoader type='post' />
                    <SkeletonLoader type='post' />
                </>
            }
            { !isLoadingNewsfeedData &&
                <KeyboardAwareFlatList 
                    style={{ paddingTop: 3 }}
                    keyboardShouldPersistTaps='always'
                    extraScrollHeight={120}
                    onRefresh={() => refetchNewsfeedData()}
                    refreshing={isFetchingNewsfeedData}
                    onEndReached={() => {
                        if(!isLoadingNewsfeedData && newsfeed_data?.last_post_id !== 'end_of_list' && newsfeed_data?.posts.length >= 13) {
                            if(!isLoadingMoreNewsfeedData && !errorLoadingNewfeedPost && newsfeed_data?.posts.length > 0) {
                                getMoreNewsfeedPosts({ last_post_id: newsfeed_data?.posts.length === 13 ? newsfeed_data.posts[newsfeed_data?.posts.length - 1].post_id : newsfeed_data?.last_post_id });
                            };
                        };
                    }}
                    ListFooterComponent={() => {
                        return(
                            <FooterContainer>
                                { newsfeed_data?.last_post_id !== 'end_of_list' && newsfeed_data?.posts.length === 0 && !isLoadingNewsfeedData &&
                                    <Text>Be the first user to create a post 😁</Text>
                                }
                                { newsfeed_data?.posts.length < 13 && !isLoadingNewsfeedData && !isLoadingMoreNewsfeedData &&
                                    <Text>You have reached the end 📄</Text>
                                }
                                { newsfeed_data?.posts.length >= 13 && newsfeed_data?.last_post_id === 'end_of_list' && !isLoadingNewsfeedData && !isLoadingMoreNewsfeedData &&
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
                    keyExtractor={item => item.post_id + item.owner.uid}
                    data={newsfeed_data?.posts}
                    renderItem={({ item }) => {
                        const timestamp = moment.unix(item.created_at).fromNow();
                        const {
                            post_id,
                            is_post_owner,
                            owner,
                            text,
                            post_liked,
                            total_likes,
                            total_comments,
                            has_url_link,
                            url_link,
                        }: Partial<CardI> = item;
                        
                        return(
                            <Card
                                post_id={post_id}
                                is_post_owner={is_post_owner}
                                username={owner.username}
                                profileImage={owner.profile_image}
                                occupation={owner.occupation}
                                created_at={timestamp}
                                text={text}
                                post_liked={post_liked}
                                total_likes={total_likes}
                                total_comments={total_comments}
                                has_url_link={has_url_link}
                                url_link={url_link}
                                edit_post={() => {
                                    router.push({
                                        pathname: 'home/update-post',
                                        params: { post_id, user_profile_uid: owner.uid },
                                    })
                                }}
                                navigate_to_post={() => router.push({ 
                                    pathname: `home/post/${post_id}`, 
                                    params: { post_id, user_profile_uid: owner.uid },
                                })}
                                navigate_to_profile={() => router.push({
                                    pathname: `home/profile/${owner.uid}`,
                                    params: { user_profile_uid: owner.uid }
                                })}
                                query_update_post={(updatedText) => updatePostQuery({ post_id, text: updatedText })}
                                query_like_post={(value) => likePostQuery({ post_id, post_liked: value, user_profile_uid: owner.uid })}
                                query_delete_post={() => deletPostQuery({ post_id })}
                                query_report_post={() => reportPostQuery({ post_id })}
                                query_hide_post={() => hidePostQuery({ post_id })}
                                query_create_comment={(text) => createCommentQuery({ post_id, text })}
                            />
                        )
                    }}
                />
            }

            {/* { !isLoadingNewsfeedData && <CreatePostButton onPress={() => router.push('home/create-post')} /> } */}
        </>
    );
};

const FollowingNewsfeed = () => {
    const router = useRouter();

    const [hidePostQuery, { isLoading: isHidingPost, error: errorHidingPost }] = useHidePostMutation();
    const [reportPostQuery, { isLoading: isReportingPost, error: errorReportingPost }] = useReportPostMutation();
    const [likePostQuery, { isLoading: likePostQueryActive }] = useLikePostMutation();

    const { data: follower_newsfeed_data, isLoading: isLoadingNewsfeedData, isFetching: isFetchingNewsfeedData, isError: errorLoadingNewfeedPost, refetch: refetchNewsfeedData } = useGetFollowerPostsQuery();
    const [getMoreNewsfeedPosts, { isLoading: isLoadingMoreNewsfeedData }] = useGetMoreFollowerPostsMutation();
    const [createCommentQuery, {isLoading: isLoadingComment, isError: errorLoadingComment }] = useCreateCommentMutation();

    return(
        <>
            { isLoadingNewsfeedData && 
                <>
                    <SkeletonLoader type='post' />
                    <SkeletonLoader type='post' />
                    <SkeletonLoader type='post' />
                </>
            }
            { !isLoadingNewsfeedData &&
                <KeyboardAwareFlatList 
                    style={{ paddingTop: 3 }}
                    keyboardShouldPersistTaps='always'
                    extraScrollHeight={80}
                    onRefresh={() => refetchNewsfeedData()}
                    refreshing={isFetchingNewsfeedData}
                    onEndReached={() => {
                        if(!isLoadingNewsfeedData && follower_newsfeed_data?.last_post_id !== 'end_of_list' && follower_newsfeed_data?.posts.length >= 13) {
                            if(!isLoadingMoreNewsfeedData && !errorLoadingNewfeedPost && follower_newsfeed_data?.posts.length > 0) {
                                getMoreNewsfeedPosts({ last_post_id: follower_newsfeed_data?.posts.length === 13 ? follower_newsfeed_data.posts[follower_newsfeed_data?.posts.length - 1].post_id : follower_newsfeed_data?.last_post_id });
                            };
                        };
                    }}
                    ListFooterComponent={() => {
                        return(
                            <FooterContainer>
                                { follower_newsfeed_data?.last_post_id !== 'end_of_list' && follower_newsfeed_data?.posts === undefined || follower_newsfeed_data?.posts.length === 0 && !isLoadingNewsfeedData &&
                                    <Text>There are no post to display just yet 🙂</Text>
                                }
                                { follower_newsfeed_data?.posts.length < 13 && follower_newsfeed_data?.posts.length > 0 && !isLoadingNewsfeedData && !isLoadingMoreNewsfeedData &&
                                    <Text>You have reached the end 📄</Text>
                                }
                                { follower_newsfeed_data?.posts.length >= 13 && follower_newsfeed_data?.last_post_id === 'end_of_list' && !isLoadingNewsfeedData && !isLoadingMoreNewsfeedData &&
                                    <Text>You have reached the end 📄</Text>
                                }
                                { 
                                    follower_newsfeed_data?.last_post_id !== 'end_of_list' && 
                                    isLoadingNewsfeedData || 
                                    isLoadingMoreNewsfeedData && 
                                        <Lottie autoPlay style={{ height: 45, width: 45 }} source={require('../../assets/animations/loading_anime_black_01.json')} />
                                }
                            </FooterContainer>
                        );
                    }}
                    keyExtractor={item => item.post_id + item.owner.uid}
                    data={follower_newsfeed_data?.posts}
                    renderItem={({ item }) => {
                        const timestamp = moment.unix(item.created_at).fromNow();
                        const {
                            post_id,
                            is_post_owner,
                            owner,
                            text,
                            post_liked,
                            total_likes,
                            total_comments,
                            has_url_link,
                            url_link,
                        }: Partial<CardI> = item;
                        
                        return(
                            <Card
                                post_id={post_id}
                                is_post_owner={is_post_owner}
                                username={owner.username}
                                profileImage={owner.profile_image}
                                occupation={owner.occupation}
                                created_at={timestamp}
                                text={text}
                                post_liked={post_liked}
                                total_likes={total_likes}
                                total_comments={total_comments}
                                has_url_link={has_url_link}
                                url_link={url_link}
                                edit_post={() => {
                                    router.push({
                                        pathname: 'home/update-post',
                                        params: { post_id, user_profile_uid: owner.uid },
                                    })
                                }}
                                navigate_to_post={() => router.push({ 
                                    pathname: `home/post/${post_id}`, 
                                    params: { post_id, user_profile_uid: owner.uid },
                                })}
                                navigate_to_profile={() => router.push({
                                    pathname: `home/profile/${owner.uid}`,
                                    params: { user_profile_uid: owner.uid }
                                })}
                                query_update_post={(updatedText) => {}}
                                query_like_post={(value) => likePostQuery({ post_id, post_liked: value, user_profile_uid: owner.uid })}
                                query_delete_post={() => {}}
                                query_report_post={() => reportPostQuery({ post_id })}
                                query_hide_post={() => hidePostQuery({ post_id })}
                                query_create_comment={(text) => createCommentQuery({ post_id, text })}
                            />
                        )
                    }}
                />
            }

            {/* { !isLoadingNewsfeedData && <CreatePostButton onPress={() => router.push('home/create-post')} /> } */}
        </>
    );
};

const renderScene = SceneMap({
    generalNewsfeed: GeneralNewsFeed,
    followingNewsfeed: FollowingNewsfeed,
});

const Newsfeed = (props) => {
    const [pushNewTokenQuery, { isError: errorPushingToken }] = useSendIOSPushTokenToBackendMutation();

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => pushNewTokenQuery(token));
    }, []);

    useEffect(() => {

        let isMounted = true;

        const redirect = async (notification: Notifications.Notification) => {
            const badge_count = await Notifications.getBadgeCountAsync();
            await Notifications.setBadgeCountAsync(badge_count - 1);
            const url = notification.request.content.data?.url;
            const params = notification.request.content.data?.params;

            if(params.profile_uid) {
                router.push({
                    pathname: url,
                    params: { user_profile_uid: params.profile_uid, notification_action: params.notification_action }
                });
                return;
            };

            if(url) {
                router.push({
                    pathname: url,
                    params: { notification_action: params.notification_action }
                });
            };
        };
      
        Notifications.getLastNotificationResponseAsync()
            .then(response => {
                if (!isMounted || !response?.notification) {
                return;
                };
                redirect(response?.notification);
            });
    
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            redirect(response.notification);
        });
    
        return () => {
            isMounted = false;
            subscription.remove();
        };

    }, []);

    const router = useRouter();
    const { width: screen_width } = useWindowDimensions();
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'generalNewsfeed', title: 'Newsfeed' },
        { key: 'followingNewsfeed', title: 'Following' }
    ]);

    return (
        <TabView 
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: screen_width }}
            renderTabBar={(props) => {
                return(
                    <HeaderContainer style={{
                        shadowOffset: {
                            width: 1,
                            height: 20,
                          },
                          shadowOpacity: .1,
                          shadowRadius: 32,
                    }}>
                        <TabBar
                            {...props}
                            indicatorStyle={{ backgroundColor: '#fff' }}
                            style={{ backgroundColor: 'rgba(255,255,255,1)', elevation: 0 }}
                            renderLabel={({ route, focused }) => (
                                <TopTabBarTitle style={{ fontWeight: '500', letterSpacing: 0.3, opacity: !focused ? 0.3 : 1 }}>{route.title}</TopTabBarTitle>
                            )}
                        />
                        <CreatePostBtn onPress={() => router.push('home/create-post')}>
                            <FontAwesome name='pencil' color='#fff' size={17} />
                        </CreatePostBtn>
                    </HeaderContainer>
                )
            }}
        />
    );
};

export default Newsfeed;

const CreatePostBtn = styled.TouchableOpacity`
    align-items: center;
    background-color: #7657F7;
    border-radius: 25px;
    height: 35px;
    justify-content: center;
    position: absolute;
    right: 8px;
    top: 6.3px;
    width: 35px;
    z-index: 1001;
`;

const HeaderContainer = styled.View`
    align-self: center;
    background-color: #fff;
    border-width: 1px;
    border-style: solid;
    border-color: #f1f1f1;
    bottom: 30px;
    border-radius: 60px;
    position: absolute;
    padding-right: 50px;
    padding-left: 20px;
    width: 300px;
    z-index: 1000;
`;

const FooterContainer = styled.View`
    align-items: center;
    margin: 30px 0;
    margin-bottom: 114px;
`;

const Text = styled.Text`
    color: #a5a5a5;
    font-size: 13px;
`;

const TopTabBarTitle = styled.Text`
    color: #1f1f1f;
    font-size: 14px;
`;

const registerForPushNotificationsAsync = async () => {
    let token;
    
    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        };

        if (finalStatus !== 'granted') {
            return;
        };

        token = (await Notifications.getExpoPushTokenAsync()).data;

      } else {
        alert('Must use physical device for Push Notifications');
    };
    
    return token;
};