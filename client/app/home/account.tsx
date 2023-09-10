import styled from 'styled-components/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { Stack, useRouter, useNavigation, Redirect } from 'expo-router';
import { AntDesign, Ionicons, Entypo } from '@expo/vector-icons';

import { auth, getAuth } from '../../services/firebase';
import HeaderBackButton from '../../components/HeaderBackBtn';
import { api } from '../../services/endpoints/api';
import { useDeleteUserMutation } from '../../services/endpoints/user-profile';
import { useDeletePushTokenMutation } from '../../services/endpoints/push-tokens';

const Account = () => {
    const navigation = useNavigation();
    const auth_uid = getAuth().currentUser.uid;
    const router = useRouter();
    const [deleteUserQuery, { isLoading: isDeletingUser, isError: errorDeletingUser }] = useDeleteUserMutation();
    const [deletePushToken , { isLoading: isDeletingPushToken, isError: errorDeletingPushToken }] = useDeletePushTokenMutation();
    
    const handleSignOut = async () => {
        try {
            await deletePushToken();
            await getAuth().signOut()
                .then(() => {
                    api.util.resetApiState()
                });
            await AsyncStorage.clear();
        } catch(error) {
            alert(error);
        };
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'DELETE ACCOUNT',
            'Are you sure you want to delete you account forever?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'DELETE ACCOUNT',
                    style: 'destructive',
                    onPress: () => {
                        deleteUserQuery({ uid: auth_uid })
                            .then(async ({ error }: any) => {
                                if(!error) {
                                    await getAuth().signOut()
                                        .then(() => api.util.resetApiState())
                                    await AsyncStorage.clear();
                                }
                            })
                    }
                },
            ],
        );
    };

    return(
        <>
            <Stack.Screen 
                options={{ 
                    headerLeft: () => <HeaderBackButton navigateBack={() => router.back()} title='Account Settings' />
                }} 
            />
            
            <Container>
                <ListGroup>
                    <ListItem onPress={() => router.push('home/blocked-users')}>
                        <ListItemText>Blocked Users</ListItemText>
                        <Entypo name='block' color='#1f1f1f' size={19} />
                    </ListItem>
                    <ListItem style={{ borderBottomWidth: 0 }} onPress={() => handleDeleteAccount()}>
                        <ListItemText>Delete Account</ListItemText>
                        <AntDesign name='deleteuser' color='#f64343' size={19} />
                    </ListItem>
                </ListGroup>
                <SignOutButton onPress={() => handleSignOut()}>
                    <Text>Sign Out</Text>
                </SignOutButton>
            </Container>
        </>
    );
};

export default Account;

const Container = styled.View`
    flex: 1;
    justify-content: space-between;
    padding: 16px;
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

const SignOutButton = styled.Pressable`
    align-items: center;
    align-self: center;
    background-color: #fff;
    border-color: #f1f1f1;
    border-width: 1px;
    border-radius: 40px;
    margin-bottom: 40px;
    padding: 16px 0;
    width: 100%;
`;
const Text = styled.Text`
    color: #f64343;
    font-size: 14px;
    font-weight: 500;
`;