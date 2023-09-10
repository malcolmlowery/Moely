import styled from 'styled-components/native';
import SkeletonLoader from '../../components/Skeleton-Loader';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import TextTicker from 'react-native-text-ticker';
import { useGetUserSettingsInfoQuery } from '../../services/endpoints/user_settings_info';

const Settings = () => {
    const router = useRouter();
    const { data: user_settings_data, isLoading: isLoadingUserSettingsData, isFetching: isFetchingUserSettingsData, isError: errorLoadingUserSettingsData, refetch: refetchUserSettingsData } = useGetUserSettingsInfoQuery();

    return(
        <>
            { isLoadingUserSettingsData && <SkeletonLoader type='settings' />}
            { !isLoadingUserSettingsData &&
                 <>
                    <Stack screenOptions={{ title: '' }} />
                    <ScrollView>
                        <UserInfo style={{ overflow: 'hidden' }}>
                            { user_settings_data.profile_image ?
                                <ProfileImage source={{ uri: user_settings_data.profile_image }} /> :
                                <ProfileImage source={require('../../assets/images/profile_image_placeholder_01.png')} />
                            }
                            <View>
                                { user_settings_data.username.length > 30 ?
                                    <View>
                                        <LinearGradient 
                                            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0)', '#000']}
                                            start={{ x: 0, y: 1 }}
                                            end={{ x: 1, y: 1 }} 
                                            style={{ height: 30, left: 0, position: 'absolute', right: 0, zIndex: 1000 }} />
                                            <TextTicker
                                                style={{ fontSize: 24 }}
                                                duration={user_settings_data.username.length > 80 ? 3000 : 12000}
                                                loop
                                                bounce
                                                repeatSpacer={50}
                                                marqueeDelay={1000}
                                                >
                                                <Username>{user_settings_data.username}</Username> 
                                            </TextTicker>
                                    </View> :
                                    <Username>{user_settings_data.username}</Username>
                                }
                                {/* <Username>{user_settings_data.username}</Username> */}
                                { user_settings_data.occupation &&
                                    <>
                                        { user_settings_data.occupation?.length > 50 ?
                                            <Occupation>{user_settings_data.occupation.slice(0,24).trim()}...</Occupation>:
                                            <Occupation>{user_settings_data.occupation}</Occupation>  
                                        }
                                    </>
                                }
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
                            <ListItem onPress={() => router.push('privacy-policy')}>
                                <ListItemText>Privacy Policy</ListItemText>
                                <Ionicons name='lock-closed' color='#1f1f1f' size={19} />
                            </ListItem>
                            <ListItem style={{ borderBottomWidth: 0 }} onPress={() => router.push('terms-conditions')}>
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