import styled from 'styled-components/native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGetUserSettingsInfoQuery } from '../../services/endpoints/user_settings_info';

const Settings = () => {
    const router = useRouter();
    const { data: user_settings_data, isLoading: isLoadingUserSettingsData, isFetching: isFetchingUserSettingsData, isError: errorLoadingUserSettingsData, refetch: refetchUserSettingsData } = useGetUserSettingsInfoQuery();

    return(
        <>
            { !isLoadingUserSettingsData &&
                 <>
                    <Stack screenOptions={{ title: 'test' }} />
                    <ScrollView>
                        <UserInfo>
                            { user_settings_data.profile_image ?
                                <ProfileImage source={{ uri: user_settings_data.profile_image }} /> :
                                <ProfileImage source={require('../../assets/images/profile_image_placeholder_01.png')} />
                            }
                            <View>
                                <Username>{user_settings_data.username}</Username>
                                { user_settings_data.occupation && <Occupation>{user_settings_data.occupation}</Occupation> }
                                <TouchableOpacity onPress={() => router.push('home/edit-profile')}>
                                    <Text style={{ fontSize: 15 }}>Edit Profile</Text>
                                </TouchableOpacity>
                            </View>
                        </UserInfo>
        
                        <ListGroup>
                            <ListItem onPress={() => router.push('home/user-interactions')}>
                                <ListItemText>User Interactions</ListItemText>
                                <Ionicons name='people-circle-sharp' color='#1f1f1f' size={19} />
                            </ListItem>
                            <ListItem style={{ borderBottomWidth: 0 }} onPress={() => router.push('home/user-activity-history')}>
                                <ListItemText>Activity History</ListItemText>
                                <Ionicons name='newspaper' color='#1f1f1f' size={19} />
                            </ListItem>
                        </ListGroup>
        
                        <ListGroup>
                            <ListItem onPress={() => router.push('home/account')}>
                                <ListItemText>Account Settings</ListItemText>
                                <Ionicons name='person-circle-sharp' color='#1f1f1f' size={19} />
                            </ListItem>
                            <ListItem onPress={() => router.push('home/privacy')}>
                                <ListItemText>Privacy</ListItemText>
                                <Ionicons name='lock-closed' color='#1f1f1f' size={19} />
                            </ListItem>
                            <ListItem style={{ borderBottomWidth: 0 }} onPress={() => router.push('home/terms-and-conditions')}>
                                <ListItemText>Terms and Condition</ListItemText>
                                <Ionicons name='contract' color='#1f1f1f' size={19} />
                            </ListItem>
                        </ListGroup>
                    </ScrollView>
                </>
            }        
        </>
    );
};

export default Settings;

const ScrollView = styled.ScrollView`
    flex: 1;
    padding: 16px;
`;

const UserInfo = styled.View`
    align-items: center;
    background-color: #121212;
    border-radius: 12px;
    flex-direction: row;
    margin-bottom: 16px;
    padding: 16px;
`;

const ProfileImage = styled.Image`
    align-self: center;
    background-color: #121212;
    border-color: #ededed;
    border-width: 2px;
    border-radius: 50px;
    height: 100px;
    margin-right: 12px;
    width: 100px;
`;

const View = styled.View`
    flex-direction: column;
`;

const Username = styled.Text`
    color: #fff;
    font-size: 19px;
    font-weight: 600;
    margin-bottom: 1px;
`;

const Occupation = styled.Text`
    color: #fff;
    font-size: 16px;
    margin-top: 1px;
`;

const Text = styled.Text`
    color: #3888ff;
    font-weight: 500;
    margin-top: 3px;
`;

const ListGroup = styled.View`
    background-color: #fff;
    border-radius: 12px;
    margin-bottom: 16px;
`;

const ListItem = styled.TouchableOpacity`
    align-items: center;
    border-style: solid;
    border-color: #ededed;
    border-bottom-width: 1px;
    flex-direction: row;
    justify-content: space-between;
    padding: 14px;
`;

const ListItemText = styled.Text`
    font-size: 14px;
    font-weight: 500;
`;

const TouchableOpacity = styled.TouchableOpacity``;