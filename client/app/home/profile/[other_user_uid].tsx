import styled from 'styled-components/native';
import { Stack, usePathname, useRouter, useSearchParams, useSegments } from 'expo-router';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import { useEffect, useState } from 'react';import moment from 'moment';
import Lottie from 'lottie-react-native';

// Types
import { CardI } from '../../../types/card.interface';

// Components
import Card from '../../../components/Card';

// RTK Query
import { getAuth } from '../../../services/firebase';
import { 
    useGetUserProfileNewfeedPostsQuery,
    useGetUserProfileInfoQuery, 
    useGetMoreUserProfileNewsfeedPostsMutation,
    useBlockUserMutation, 
} from '../../../services/endpoints/user-profile';

import { 
    useCreatePostMutation, 
    useDeletPostMutation, 
    useHidePostMutation, 
    useLikePostMutation, 
    useReportPostMutation,
    useUpdatePostMutation,
} from '../../../services/endpoints/post';
import CreatePostButton from '../../../components/CreatePostButton';
import BottomSheet from '../../../components/BottomSheet';
import { useCreateCommentMutation } from '../../../services/endpoints/comments';
import { useFollowUserMutation } from '../../../services/endpoints/follow-interactions';
import SkeletonLoader from '../../../components/Skeleton-Loader';


const Profile = () => {
    const router = useRouter();
    const route_segment = useSegments();
    const { user_profile_uid, notification_action }: any = useSearchParams();

    const auth_uid = getAuth().currentUser.uid;

    const { data: user_profile_data, isLoading: isLoadingUserProfileData, isFetching: isFetchingUserProfileData, isError: errorLoadingUserProfileData, refetch: refetchUserProfileData } = useGetUserProfileInfoQuery({ user_profile_uid, notification_action });
    const { data: user_newsfeed_data, isLoading: isLoadingUserNewsfeedData, isFetching: isFetchingUserNewsfeedData, isError: errorLoadingUserNewsfeedData, refetch: refetchUserNewsfeedData } = useGetUserProfileNewfeedPostsQuery({ user_profile_uid });
    const [getMoreUserNewsfeedPosts, { isLoading: isLoadingMoreUserNewsfeedPosts, isError: errorLoadingMoreUserNewsfeedPosts }] = useGetMoreUserProfileNewsfeedPostsMutation();
    const [blockUserQuery, { isLoading: isBlockingUser, isError: errorBlockingUser }] = useBlockUserMutation();

    const [createPostQuery, { isLoading: isCreatingPost, error: errorCreatingPost, reset: resetCreatePostQuery }] = useCreatePostMutation();
    const [updatePostQuery, { isLoading: isUpdatingPost, error: errorUpdatingPost }] = useUpdatePostMutation();
    const [deletPostQuery, { isLoading: isDeletingPost, error: errorDeletingPost }] = useDeletPostMutation();
    const [hidePostQuery, { isLoading: isHidingPost, error: errorHidingPost }] = useHidePostMutation();
    const [reportPostQuery, { isLoading: isReportingPost, error: errorReportingPost }] = useReportPostMutation();
    const [likePostQuery, { isLoading: likePostQueryActive }] = useLikePostMutation();
    const [createCommentQuery, {isLoading: isLoadingComment, isError: errorLoadingComment }] = useCreateCommentMutation();
    const [followUserQuery, {isLoading: isLoadingFollowInteraction, isError: errorLoadingFollowInteraction }] = useFollowUserMutation();

    const [createPostViewActive, setCreatePostViewActive] = useState(false);
    const [showMoreText, setShowMoreText] = useState(false);

    const about_me = user_profile_data?.about_me && user_profile_data?.about_me.length > 380 && !showMoreText ? `${user_profile_data?.about_me.slice(0, 380).trim()}... ` : user_profile_data?.about_me + ' ';
    
    const handleFollowUserInteraction = () => {
        if(!isLoadingFollowInteraction) {
            followUserQuery({ profile_uid: user_profile_data.uid });
        };
    };

    const handleBlockUser = () => {
        Alert.alert(
            'Profile Actions',
            '',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Block User',
                    style: 'destructive',
                    onPress: () => {
                        blockUserQuery(user_profile_uid)
                            .then(({ error }: any) => {
                                if(!error) return router.back();
                            })
                    }
                },
            ],
        );
    };

    useEffect(() => {
        if(!isLoadingUserProfileData && !isLoadingUserNewsfeedData && notification_action) {
            refetchUserProfileData();
            refetchUserNewsfeedData();
        };
    }, []);

    const debounce = async (func, timeout = 300) => {
        let timer;
        return (...args) => {
          clearTimeout(timer);
          timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }

    return(
        <>
            <Stack.Screen 
                options={{ 
                    title: '',
                    headerBackVisible: true,
                    headerLeft: () => null, 
                    headerRight: () => {
                        return(
                            <>
                                { auth_uid !== user_profile_uid && route_segment[1] === 'profile' ?
                                    <TouchableOpacity onPress={() => handleBlockUser()}>
                                        <Ionicons name='md-alert-circle' color='#121212' size={21} />
                                    </TouchableOpacity> : 
                                    <TouchableOpacity onPress={() => router.push('home/edit-profile')}>
                                        <Text style={{ color: '#3888ff', fontSize: 15 }}>Edit Profile</Text>
                                    </TouchableOpacity> 
                                }
                            </>
                        )
                    },  
                }}
            />

            {isLoadingUserProfileData &&
                <>
                    <SkeletonLoader type='user-profile' />
                    <SkeletonLoader type='activity-history' />
                    <SkeletonLoader type='activity-history' />
                    <SkeletonLoader type='activity-history' />
                </> 
            }

            {!isLoadingUserProfileData &&
                <>
                    <KeyboardAwareFlatList 
                        keyboardShouldPersistTaps='always'
                        ListHeaderComponent={() => {
                            return(
                                <>
                                    {!isLoadingUserProfileData &&
                                        <Container>
                                            <Wallpaper source={{ uri: user_profile_data.cover_photo ? user_profile_data.cover_photo : 'https://verlag.oeaw.ac.at/assets/images/video-placeholder.jpg' }} />
                                            <Header>
                                                <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                                                    { user_profile_data.profile_image ?
                                                        <ProfileImage source={{ uri: user_profile_data.profile_image }} /> :
                                                        <ProfileImage source={require('../../../assets/images/profile_image_placeholder_01.png')} />
                                                    }
                                                    <View>
                                                        <Username>{user_profile_data.username}</Username>
                                                        {user_profile_data.occupation && <Occupation>{user_profile_data.occupation}</Occupation>}
                                                    </View>
                                                </View>
                                                
                                                { !user_profile_data.place_of_work && !user_profile_data.location && !user_profile_data.important_to_me ?
                                                    <></>
                                                :
                                                    <HorizontalScrollView directionalLockEnabled={true} showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', width: '100%', height: 45 }}>
                                                        <View style={{ flexDirection: 'row', width: '100%' }}>
                                                            { user_profile_data.place_of_work &&
                                                                <Capsule style={{ backgroundColor: '#4f8fee' }}>
                                                                    <Ionicons name='business' color='#fff' size={15} style={{ marginRight: 6 }} />
                                                                    <Text>{user_profile_data.place_of_work}</Text>
                                                                </Capsule>
                                                            }
                                                            { user_profile_data.location &&
                                                                <Capsule style={{ backgroundColor: '#6C65F6' }}>
                                                                    <Ionicons name='ios-earth' color='#fff' size={15} style={{ marginRight: 6 }} />
                                                                    <Text>{user_profile_data.location}</Text>
                                                                </Capsule>
                                                            }
                                                            { user_profile_data.important_to_me &&
                                                                <Capsule style={{ backgroundColor: '#ff9500' }}>
                                                                    <Ionicons name='heart' color='#fff' size={15} style={{ marginRight: 6 }} />
                                                                    <Text>{user_profile_data.important_to_me}</Text>
                                                                </Capsule>
                                                            }
                                                        </View>
                                                    </HorizontalScrollView>
                                                }

                                                { user_profile_data.about_me &&
                                                    <AboutMeSection>
                                                        <Bio>
                                                            {about_me}
                                                            {about_me.length > 380 &&
                                                                <TouchableOpacity onPress={() => setShowMoreText(!showMoreText)}>
                                                                    <Text style={{ color: '#5599ff', fontSize: 13, top: 1 }}>
                                                                        {showMoreText ? 'show less' : 'show more'}
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            }
                                                        </Bio>
                                                    </AboutMeSection>
                                                }
                
                                                { auth_uid !== user_profile_data.uid &&
                                                    <View style={{ flexDirection: 'row' }}>
                                                        { user_profile_data?.following_user &&
                                                            <UnfollowUser style={{ marginRight: 6 }} onPress={() => handleFollowUserInteraction()}>
                                                                <Text style={{ color: '#121212', fontSize: 13 }}>Unfollow</Text>
                                                            </UnfollowUser>
                                                        }
                                                        { !user_profile_data?.following_user &&
                                                            <FollowButton style={{ marginRight: 6 }} onPress={() => handleFollowUserInteraction()}>
                                                                <Text style={{ fontSize: 13 }}>Follow {user_profile_data.username.split(" ")[0]}</Text>
                                                            </FollowButton>
                                                        }
                                                        {/* <FollowButton style={{ marginLeft: 6, backgroundColor: '#4f8fee' }}>
                                                            <Text style={{ fontSize: 13 }}>Message</Text>
                                                            <Ionicons name='paper-plane' color='#fff' size={15} style={{ marginLeft: 5 }} />
                                                        </FollowButton> */}
                                                    </View>
                                                }
                                            </Header>
                                            <HeaderFooter>
                                                <Line />
                                                <Text style={{ color: '#a5a5a5', fontSize: 13, fontWeight: '400', marginHorizontal: 12 }}>User Post Feed</Text>
                                                <Line />
                                            </HeaderFooter>
                                        </Container>
                                    }
                                </>
                            );
                        }}
                        ListFooterComponent={() => {
                            return(
                                <FooterContainer>
                                    { user_newsfeed_data?.last_post_id === 'end_of_list' && !isLoadingUserNewsfeedData &&
                                        <Text style={{ color: '#a5a5a5', fontSize: 13, fontWeight: '400' }}>You have reached the end 📄</Text>
                                    }
                                    { 
                                        user_newsfeed_data?.last_post_id !== 'end_of_list' && 
                                        isLoadingUserNewsfeedData || 
                                        isLoadingMoreUserNewsfeedPosts && 
                                            <Lottie autoPlay style={{ height: 45, width: 45 }} source={require('../../../assets/animations/loading_anime_black_01.json')} />
                                    }
                                </FooterContainer>
                            );
                        }}
                        refreshing={isFetchingUserProfileData}
                        onRefresh={() => {
                            refetchUserProfileData()
                            refetchUserNewsfeedData()
                        }}
                        onEndReached={() => {
                            if(!isLoadingUserNewsfeedData && user_newsfeed_data?.last_post_id !== 'end_of_list' && user_newsfeed_data?.posts.length >= 10) {
                                if(!isLoadingMoreUserNewsfeedPosts && !errorLoadingMoreUserNewsfeedPosts) {
                                    getMoreUserNewsfeedPosts({ last_post_id: user_newsfeed_data?.posts.length === 10 ? user_newsfeed_data.posts[user_newsfeed_data?.posts.length - 1].post_id : user_newsfeed_data?.last_post_id, user_profile_uid });
                                };
                            };
                        }}
                        keyExtractor={item => item.post_id + item.owner.uid}
                        data={user_newsfeed_data?.posts}
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
                                <>
                                    {!isLoadingUserNewsfeedData && !isLoadingUserProfileData &&
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
                                                    params: { post_id },
                                                })
                                            }}
                                            navigate_to_post={() => router.push({ 
                                                pathname: `home/post/${post_id}`, 
                                                params: { post_id, user_profile_uid },
                                            })}
                                            navigate_to_profile={() => router.push({
                                                pathname: `home/profile/${owner.uid}`,
                                                params: { user_profile_uid: owner.uid }
                                            })}
                                            query_update_post={(updatedText) => updatePostQuery({ post_id, text: updatedText, user_profile_uid })}
                                            query_like_post={(value) => debounce(() => likePostQuery({ post_id, post_liked: value, user_profile_uid }))}
                                            query_delete_post={() => deletPostQuery({ post_id, user_profile_uid })}
                                            query_report_post={() => reportPostQuery({ post_id, user_profile_uid })}
                                            query_hide_post={() => hidePostQuery({ post_id, user_profile_uid })}
                                            query_create_comment={(text) => createCommentQuery({ post_id, text, user_profile_uid })}
                                        />
                                    }
                                </>
                            )
                        }}
                    />

                    
                    { user_profile_uid === auth_uid &&  !isLoadingUserNewsfeedData && <CreatePostButton onPress={() => router.push('home/create-post')} /> }
                </>
            }
            

        </>
    );
};

export default Profile;

const Container = styled.View``;

const Wallpaper = styled.Image`
    background-color: gray;
    height: 170px;
`;

const Header = styled.View`
    align-items: center;
    background-color: #fff;
    padding: 18px 16px;
`;

const ProfileImage = styled.Image`
    align-self: center;
    background-color: #121212;
    border-radius: 50px;
    height: 90px;
    margin-right: 12px;
    width: 90px;
`;

const Username = styled.Text`
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 1px;
`;

const Occupation = styled.Text`
    font-size: 16px;
    margin-top: 1px;
`;

const View = styled.View`
    flex-direction: column;
    flex: 1;
`;

const Text = styled.Text`
    color: #fff;
    font-weight: 500;
    font-size: 12px;
`;

const HorizontalScrollView = styled.ScrollView`
    overflow: visible;
`;

const Capsule = styled.View`
    align-items: center;
    background-color: #121212;
    border-radius: 20px;
    flex-direction: row;
    margin-top: 16px;
    margin-right: 12px;
    padding: 6px 12px;
    padding-right: 14px;
`;

const AboutMeSection = styled.View`
    background-color: #121212;
    border-radius: 12px;
    margin-top: 16px;
    padding: 20px 26px;
    padding-bottom: 22px;
    width: 100%;
`;

const Bio = styled.Text`
    color: #fff;
    line-height: 19px;
`;

const HeaderFooter = styled.View`
    align-items: center;
    flex-direction: row;
    margin: 18px 0;
`;

const Line = styled.View`
    background-color: #e4e4e4;
    border-radius: 3px;
    flex: 1;
    height: 2px;
`;

const TouchableOpacity = styled.TouchableOpacity``;

const FollowButton = styled.TouchableOpacity`
    align-items: center;
    background-color: #121212;
    border-radius: 12px;
    flex-direction: row;
    flex: 1;
    justify-content: center;
    margin-top: 18px;
    padding: 13px 0;
`;

const UnfollowUser = styled.TouchableOpacity`
    align-items: center;
    border-color: #121212;
    border-width: 1px;
    border-radius: 12px;
    flex-direction: row;
    flex: 1;
    justify-content: center;
    margin-top: 18px;
    padding: 12px 0;
`;

const FooterContainer = styled.View`
    align-items: center;
    margin: 30px 0;
    margin-bottom: 45px;
`;