import styled from 'styled-components/native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { db, onSnapshot, query, collection, getAuth, orderBy } from '../../services/firebase';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import * as Notification from 'expo-notifications';

const Notifications = () => {
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);

    const getNotifications = async (notification_type, content_id_ref) => {
        const present_notifications = await Notification.getPresentedNotificationsAsync();

        const identifier = present_notifications.map((notification) => {
            let { params, url } = notification.request.content.data;
            const shortened_url = url.split("/").splice(2)[0];
        
            if(notification_type === params.notification_action && content_id_ref === shortened_url) {
                return notification.request.identifier;
            };
        });

        return await Notification.dismissNotificationAsync(identifier[0]);
    };
    
    useEffect(() => {
            const query_docs = query(collection(db, `notifications/${getAuth().currentUser.uid}/notification`), orderBy('timestamp', 'asc'));
            const notifications_subscription = onSnapshot(query_docs, (querySnapshot) => {
                querySnapshot.docChanges().forEach((change) => {
                    if(change.type === 'added') {
                        setNotifications(prevState => [change.doc.data()].concat(...prevState));
                    };
                    if(change.type === 'modified') {
                        setNotifications(prevState => prevState.map(item => {
                            if(
                                item.notification_type === change.doc.data().notification_type &&
                                item.content.ref_id === change.doc.data().content.ref_id
                            ) {
                                return change.doc.data();
                            } else {
                                return item;
                            }
                        }));
                    };
                    if(change.type === 'removed') {
                        setNotifications(prevState => prevState.filter(item => item.timestamp !== change.doc.data().timestamp));
                    };
                });
            });
    
            return () => notifications_subscription();
    }, []);

    const decrement_badge_count = async () => {
        const badge_count = await Notification.getBadgeCountAsync();
        if(badge_count > 0) {
            await Notification.setBadgeCountAsync(badge_count - 1);
        };
        return;
    };

    return(
        <>  
            <FlatList
                data={notifications}
                keyExtractor={() => Math.random().toString()}
                renderItem={({ item }) => {
                    const timestamp = moment.unix(item.timestamp).fromNow();
                    const text = item?.content.text && item?.content.text.length > 90 ? `${item.content.text.slice(0, 90)}... ` : item.content.text + ' ';
                    
                    const {
                        notification_type,
                        content,
                        user_activity_info,
                        has_new_activity,
                    } = item;

                    const newest_user_activtiy_info = [...user_activity_info].sort((a,b): any => {
                        return a.user_activity_createdAt > b.user_activity_createdAt
                    })

                    return(
                        <>
                            { notification_type === 'post_liked' &&   
                                <ActivityItem onPress={() => {
                                    if(has_new_activity === true) {
                                        getNotifications(notification_type, content.ref_id)
                                        decrement_badge_count()
                                    };
                                    router.push({ 
                                        pathname: `home/post/${content.ref_id}`, 
                                        params: { post_id: content.ref_id, notification_action: 'post_liked' },
                                    });
                                }} style={{  backgroundColor: has_new_activity === true ? '#e5eafb' : '#ffffff' }}>
                                    <Ionicons name='heart-circle' color='#ef4a4a' size={32} />
                                    <ActivityDetails>
                                        { user_activity_info.length <= 1 &&
                                            <Username>
                                                {user_activity_info[0].username} liked your post:
                                                <Text style={{ color: '#969696', fontWeight: '400' }}> {text}</Text>
                                            </Username>
                                        }
                                        { user_activity_info.length >= 2 &&
                                            <Username>
                                                {newest_user_activtiy_info[1].username} and {newest_user_activtiy_info[0].username} like your post:
                                                <Text style={{ color: '#969696', fontWeight: '400' }}> {text}</Text>
                                            </Username>
                                        }
                                        <Timestamp>{timestamp}</Timestamp>
                                    </ActivityDetails>
                                </ActivityItem>
                            }

                            { notification_type === 'new_comment' &&
                                <ActivityItem onPress={() => {
                                    if(has_new_activity === true) {
                                        getNotifications(notification_type, content.ref_id)
                                        decrement_badge_count()
                                    };
                                    router.push({ pathname: `home/post/${content.ref_id}`, params: { comment_id: undefined, notification_action: 'new_comment' } })
                                }}
                                style={{ backgroundColor: has_new_activity === true ? '#e5eafb' : '#ffffff' }}>
                                    <Ionicons name='chatbubbles' color='#ff9500' size={32} />
                                    <ActivityDetails>
                                        { user_activity_info.length <= 1 &&
                                            <Username>
                                                {user_activity_info[0].username} commented on your post:
                                                <Text style={{ color: '#969696', fontWeight: '400' }}> {text}</Text>
                                            </Username>
                                        }
                                        { user_activity_info.length >= 2 &&
                                            <Username>
                                                {newest_user_activtiy_info[1].username} and {newest_user_activtiy_info[0].username} commented on your post:
                                                <Text style={{ color: '#969696', fontWeight: '400' }}> {text}</Text>
                                            </Username>
                                        }
                                        <Timestamp>{timestamp}</Timestamp>
                                    </ActivityDetails>
                                </ActivityItem>
                            }

                            { notification_type === 'comment_liked' &&
                                <ActivityItem onPress={() => {
                                    if(has_new_activity === true) {
                                        getNotifications(notification_type, content.ref_id)
                                        decrement_badge_count()
                                    };
                                    router.push({ pathname: `home/post/${content.ref_id}`, params: { comment_id: undefined, post_ref_id: content.post_ref_id, notification_action: 'comment_liked' } })
                                }}
                                style={{ backgroundColor: has_new_activity === true ? '#e5eafb' : '#ffffff' }}>
                                    <Ionicons name='heart-circle' color='#ef4aa5' size={32} />
                                    <ActivityDetails>
                                        { user_activity_info.length <= 1 &&
                                            <Username>
                                                {user_activity_info[0].username} liked your comment:
                                                <Text style={{ color: '#969696', fontWeight: '400' }}> {text}</Text>
                                            </Username>
                                        }
                                        { user_activity_info.length >= 2 &&
                                            <Username>
                                                {newest_user_activtiy_info[1].username} and {newest_user_activtiy_info[0].username} like your comment:
                                                <Text style={{ color: '#969696', fontWeight: '400' }}> {text}</Text>
                                            </Username>
                                        }
                                        <Timestamp>{timestamp}</Timestamp>
                                    </ActivityDetails>
                                </ActivityItem>
                            }

                            { notification_type === 'new_follower' &&
                               <ActivityItem onPress={() => {
                                    if(has_new_activity === true) {
                                        getNotifications(notification_type, content.ref_id)
                                        decrement_badge_count()
                                    };
                                    router.push({
                                        pathname: `home/profile/${user_activity_info[0].username}`,
                                        params: { user_profile_uid: user_activity_info[0].uid, notification_action: 'new_follower' }
                                    });
                                }} style={{ backgroundColor: has_new_activity === true ? '#e5eafb' : '#ffffff' }}>
                                    <Ionicons name='people-circle' color='#4f8fee' size={32} />
                                    <ActivityDetails>
                                        <Username>
                                            {user_activity_info[0].username} is now following you!
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

export default Notifications;

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