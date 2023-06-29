import { Stack } from 'expo-router';
import styled from 'styled-components/native';
const Moely_Logo_01 = require('../../assets/logos/moely_logo_01.png');

const Layout = () => {
    const screenOptions = {
        headerShadowVisible: false,
        title: 'newsfeed',
        headerLeft: () => <Logo_01 source={Moely_Logo_01} />,
        headerRight: () => {
            return(
                <Pressable>
                    <Avatar source={{ uri: 'https://www.barrowneuro.org/wp-content/uploads/Remiel-Gonda-OR-Nurse-e1566942309945.jpg' }} />
                </Pressable>
            )
        },
    };

    return(
        <Stack screenOptions={{ ...screenOptions }} />
    );
};

export default Layout;

const Pressable = styled.Pressable``;

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