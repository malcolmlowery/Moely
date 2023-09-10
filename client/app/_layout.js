import styled from 'styled-components/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments, Slot, SplashScreen, useNavigation } from 'expo-router';
import * as Device from 'expo-device';
import * as Updates from 'expo-updates';

// Assets
const Moely_Logo_01 = require('../assets/logos/moely_logo_01.png');

// RTK Query
import { auth, getAuth, onAuthStateChanged } from '../services/firebase';
import { Provider } from 'react-redux'
import { store } from '../services/store';

SplashScreen.preventAutoHideAsync();

const Layout = () => {
    const segments = useSegments();
    const router = useRouter();

    const inSettingsTabs = 
        segments[1] === 'settings' ||
        segments[1] === 'notifications' ||
        segments[1] === 'edit-profile' ||
        segments[1] === 'user-interactions' ||
        segments[1] === 'user-activity-history' ||
        segments[1] === 'account' ||
        segments[1] === 'blocked-users' ||
        segments[1] === 'users' && true;
        
    const renderHeaderLeft = () => {
        const current_tab_bar_name = segments[1];
        if(current_tab_bar_name === 'users') {
            return <HeaderText>User Search</HeaderText>
        };
        if(current_tab_bar_name === 'notifications') {
            return <HeaderText>Notifications</HeaderText>
        };
        if(current_tab_bar_name === 'settings') {
            return <HeaderText>Settings</HeaderText>
        };
    };

    const screenOptions = {
        title: '',
        headerShadowVisible: false,
        headerLeft: !inSettingsTabs ? () => <Logo_01 source={Moely_Logo_01} /> : renderHeaderLeft,
        headerRight: () => {
            const profile_image = getAuth().currentUser?.photoURL;
            const uid = getAuth().currentUser?.uid;
            return(
                <>
                    { segments[1] === 'newsfeed' &&
                        <HeaderRightGroup>
                            <Pressable onPress={() => {
                                if(uid) {
                                    router.push({
                                        pathname: `home/profile/${uid}`,
                                        params: { user_profile_uid: uid },
                                    });
                                };
                            }}>
                                { !profile_image && <Avatar source={require('../assets/images/profile_image_placeholder_01.png')} /> }
                                { profile_image && <Avatar source={{ uri: profile_image }} /> }
                            </Pressable>
                        </HeaderRightGroup>
                    }
                </>
            )
        },
    };

    const navigation = useNavigation();
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        const fireAuth = onAuthStateChanged(auth, async (user) => {
            if(user) {
                const user_token = await user.getIdToken(true).then(token => token)
                    .catch(error => error);
                    
                await AsyncStorage.setItem('token', user_token).then(() => {
                    router.replace('/(tabs)/newsfeed');
                    SplashScreen.hideAsync();
                });
            } else {
                router.replace('/(auth)/auth-screen');
                SplashScreen.hideAsync();
            };
            setAppIsReady(true)
        });
        return () => fireAuth();
    }, []);
    
    return(
        <Provider store={store}>
            {!appIsReady && <Slot />}
            {appIsReady && 
                <Stack screenOptions={{ ...screenOptions }}>
                    <Stack.Screen name='(auth)/auth-screen' options={{ headerShown: false }} />
                    <Stack.Screen name='(auth)/privacy-policy' options={{ presentation: 'modal' }} />
                    <Stack.Screen name='(auth)/terms-conditions' options={{ presentation: 'modal' }} />
                    <Stack.Screen name='home/create-post' options={{ presentation: 'modal', headerShadowVisible: true }} />
                    <Stack.Screen name='home/update-post' options={{ presentation: 'modal', headerShadowVisible: true }} />
                </Stack>
            }
        </Provider>
    );
};

export default Layout;

const Pressable = styled.Pressable``;

const HeaderText = styled.Text`
    color: #1f1f1f;
    font-size: 28px;
    font-weight: 600;
`;

const Avatar = styled.Image`
    background-color: #e1e1e1;
    border-radius: 20px;
    height: 33px;
    width: 33px;
`;

const Logo_01 = styled.Image`
    border-radius: 7px;
    height: 32px;
    width: 32px;
`;

const HeaderRightGroup = styled.View`
    align-items: center;
    flex-direction: row;
`;