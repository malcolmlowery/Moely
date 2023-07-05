import styled from 'styled-components/native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import HeaderBackButton from '../../components/HeaderBackBtn';

const activity_data = [
    {
        comment_id: 'Bzqhu2kUVUT9mY1cLJc9',
        content_owner_uid: 'kUSuHr8CP0hOPhhNxRbF',
        post_id_ref: 'EMbzUEPgF2Or8gv0XMUb',
        text: 'Hello, I love this app!',
        type: 'comment',
        username: 'Devin Steeleman',
    },
    {
        comment_id: 'Bzqhu2kUVUT9mY1cLJc9',
        content_owner_uid: 'eixm39-0r3-mfe2-3233',
        post_id_ref: 'sdknasn',
        text: 'Hello, I love this app!',
        type: 'comment_like',
        username: 'Devin Steeleman',
    },
    {
        content_owner_uid: 'content_owner_uid-0r3-mfe2-3233',
        post_id_ref: 'EMbzUEPgF2Or8gv0XMUb',
        text: 'I ended up going watching that show about how to get away with a ticket.',
        type: 'like',
        username: 'Devin Steeleman',
    },
    {
        uid: 'r7W8lwDBUr94VSAxDsZp',
        timestamp: 1688308080,
        type: 'following',
        username: 'Devin Steeleman',
    },
];

const UserActivityHistory = () => {
    const router = useRouter();

    return(
        <>
            <Stack.Screen 
                options={{ 
                    headerLeft: () => <HeaderBackButton navigateBack={() => router.back()} title='Activity History' />
                }} 
            />
            
            <FlatList 
                data={activity_data}
                renderItem={({ item }) => {
                    const {
                        comment_id,
                        content_owner_uid,
                        post_id_ref,
                        text,
                        type,
                        username,
                    } = item;

                    const other_user_uid = item.uid;

                    return(
                        <>
                            { type === 'like' &&
                                <ActivityItem onPress={() => router.push({ pathname: `home/post/${post_id_ref}` })}>
                                    <Ionicons name='heart-circle' color='#ef4a4a' size={32} />
                                    <ActivityDetails>
                                        <Username>
                                            You liked {username}'s post:
                                            <Text style={{ color: '#969696', fontWeight: '400' }}> {text}</Text>
                                        </Username>
                                        <Timestamp>29 mins ago</Timestamp>
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
                                        <Timestamp>14 mins ago</Timestamp>
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
                                        <Timestamp>21 mins ago</Timestamp>
                                    </ActivityDetails>
                                </ActivityItem>
                            }
                            { type === 'following' &&
                                <ActivityItem onPress={() => router.push({ pathname: `home/profile/${other_user_uid}` })}>
                                    <Ionicons name='people-circle' color='#4f8fee' size={32} />
                                    <ActivityDetails>
                                        <Username>
                                            You started following {username}
                                        </Username>
                                        <Timestamp>2 hrs ago</Timestamp>
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
    line-height: 19px;
`;

const Timestamp = styled.Text`
    color: #6C65F6;
    font-size: 13px;
    font-weight: 500;
    line-height: 19px;
`;