import styled from 'styled-components/native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Lottie from 'lottie-react-native';
import moment from 'moment';

// Components
import HeaderBackButton from '../../components/HeaderBackBtn';

// RTK Query
import { useGetMoreUserActivityHistoryMutation, useGetUserActivityHistoryQuery } from '../../services/endpoints/user_activity_history';


const UserActivityHistory = () => {
    const router = useRouter();

    const { data: activity_history_data, isLoading: isLoadingUserActivityHistory, isFetching: isFetchingMoreUserActivities, isError: errorLoadingUserActivities, refetch: refetchUserActivities } = useGetUserActivityHistoryQuery();
    const [getMoreUserActivities, { isLoading: isLoadingMoreUserActivities, isError: errorLoadingMoreUserActivities }] = useGetMoreUserActivityHistoryMutation();

    return(
        <>
            <Stack.Screen 
                options={{ 
                    headerLeft: () => <HeaderBackButton navigateBack={() => router.back()} title='Activity History' />
                }} 
            />
            
            <FlatList
                 onRefresh={() => refetchUserActivities()}
                 refreshing={isFetchingMoreUserActivities}
                 onEndReached={() => {
                     if(!isLoadingUserActivityHistory && activity_history_data?.last_activity_id !== 'end_of_list') {
                         if(!isLoadingMoreUserActivities && !errorLoadingUserActivities && activity_history_data.user_activities > 0) {
                            getMoreUserActivities({ last_activity_id: activity_history_data?.last_activity_id });
                         };
                     };
                 }}
                 ListFooterComponent={() => {
                    return(
                        <FooterContainer>
                            { activity_history_data?.last_activity_id === 'end_of_list' && !isLoadingUserActivityHistory &&
                                <Text style={{ color: '#a5a5a5', fontSize: 13 }}>You have reached the end 📄</Text>
                            }
                            { 
                                activity_history_data?.last_activity_id !== 'end_of_list' && 
                                isLoadingUserActivityHistory  || 
                                isLoadingMoreUserActivities && 
                                    <Lottie autoPlay style={{ height: 45, width: 45 }} source={require('../../assets/animations/loading_anime_black_01.json')} />
                            }
                        </FooterContainer>
                    );
                }}
                keyExtractor={() => Math.random().toString()}
                data={activity_history_data?.user_activities}
                renderItem={({ item }) => {
                    const timestamp = moment.unix(item.timestamp).fromNow();
                    const text = item?.text && item.text.length > 120 ? `${item.text.slice(0, 120)}... ` : item.text + ' ';

                    const {
                        comment_id,
                        content_owner_uid,
                        uid,
                        post_id_ref,
                        type,
                        username,
                    } = item;

                    return(
                        <>
                            { type === 'like' &&
                                <ActivityItem onPress={() => router.push({ 
                                    pathname: `home/post/${post_id_ref}`, 
                                    params: { post_id: post_id_ref, other_user_uid: content_owner_uid },
                                })}>
                                    <Ionicons name='heart-circle' color='#ef4a4a' size={32} />
                                    <ActivityDetails>
                                        <Username>
                                            You liked {username}'s post:
                                            <Text style={{ color: '#969696', fontWeight: '400' }}> {text}</Text>
                                        </Username>
                                        <Timestamp>{timestamp}</Timestamp>
                                    </ActivityDetails>
                                </ActivityItem>
                            }
                            { type === 'comment' &&
                                <ActivityItem onPress={() => router.push({ pathname: `home/post/${post_id_ref}`, params: { comment_id } })}>
                                    <Ionicons name='chatbubbles' color='#ff9500' size={32} />
                                    <ActivityDetails>
                                        <Username>
                                            You commented on {username}'s post:
                                            <Text style={{ color: '#969696', fontWeight: '400' }}> {text}</Text>
                                        </Username>
                                        <Timestamp>{timestamp}</Timestamp>
                                    </ActivityDetails>
                                </ActivityItem>
                            }
                            { type === 'comment_like' &&
                                <ActivityItem onPress={() => router.push({ pathname: `home/post/${post_id_ref}`, params: { comment_id } })}>
                                    <Ionicons name='heart-circle' color='#ef4aa5' size={32} />
                                    <ActivityDetails>
                                        <Username>
                                            You liked {username}'s comment:
                                            <Text style={{ color: '#969696', fontWeight: '400' }}> {text}</Text>
                                        </Username>
                                        <Timestamp>{timestamp}</Timestamp>
                                    </ActivityDetails>
                                </ActivityItem>
                            }
                            { type === 'following' &&
                                <ActivityItem onPress={() => router.push({
                                    pathname: `home/profile/${uid}`,
                                    params: { other_user_uid: uid }
                                })}>
                                    <Ionicons name='people-circle' color='#4f8fee' size={32} />
                                    <ActivityDetails>
                                        <Username>
                                            You started following {username}
                                        </Username>
                                        <Timestamp>{timestamp}</Timestamp>
                                    </ActivityDetails>
                                </ActivityItem>
                            }
                        </>
                    )
                }}
            />
        </>
    );
};

export default UserActivityHistory;

const FlatList = styled.FlatList`
    flex: 1;
`;

const Text = styled.Text``;

const ActivityItem = styled.TouchableOpacity`
    align-items: center;
    background-color: #fff;
    flex-direction: row;
    margin-top: 2px;
    padding: 16px 12px;
`;

const ActivityDetails = styled.View`
    flex-direction: column;
    margin-left: 10px;
    max-width: 90%;
`;

const Username = styled.Text`
    font-weight: 500;
    line-height: 20px;
`;

const Timestamp = styled.Text`
    color: #6C65F6;
    font-size: 13px;
    font-weight: 500;
    line-height: 19px;
`;

const FooterContainer = styled.View`
    align-items: center;
    margin: 30px 0;
    margin-bottom: 35px;
`;