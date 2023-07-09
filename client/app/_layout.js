import styled from 'styled-components/native';
import { Stack, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
const Moely_Logo_01 = require('../assets/logos/moely_logo_01.png');

import { Provider } from 'react-redux'
import { store } from '../services/store';

const Layout = () => {
    const segments = useSegments();
    const inSettingsTabs = 
        segments[1] === 'settings' ||
        segments[1] === 'notifications' ||
        segments[1] === 'edit-profile' ||
        segments[1] === 'user-interactions' ||
        segments[1] === 'user-activity-history' ||
        segments[1] === 'terms-and-conditions' ||
        segments[1] === 'privacy' ||
        segments[1] === 'account' && true;
        
    const renderHeaderLeft = () => {
        const current_tab_bar_name = segments[1];

        if(current_tab_bar_name === 'notifications') {
            return <HeaderText>Notifications</HeaderText>
        }
        if(current_tab_bar_name === 'settings') {
            return <HeaderText>Settings</HeaderText>
        }
    };

    const screenOptions = {
        title: '',
        headerShadowVisible: false,
        headerLeft: !inSettingsTabs ? () => <Logo_01 source={Moely_Logo_01} /> : renderHeaderLeft,
        headerRight: () => {
            return(
                <>
                    { segments[1] === 'newsfeed' &&
                        <>
                            <Pressable>
                                <Avatar source={{ uri: 'https://www.barrowneuro.org/wp-content/uploads/Remiel-Gonda-OR-Nurse-e1566942309945.jpg' }} />
                            </Pressable>
                        </>
                    }
                </>
            )
        },
    };
    
    return(
        <Provider store={store}>
            <Stack screenOptions={{ ...screenOptions }} />
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

const IconButton = styled.Pressable`
    align-items: center;
    border-color: #656565;
    border-width: 1px;
    border-style: solid;
    border-radius: 20px;
    height: 33px;
    justify-content: center;
    margin-right: 10px;
    width: 33px;
`;