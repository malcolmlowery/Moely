import styled from 'styled-components/native';
import { WebView } from 'react-native-webview';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
const Moely_Logo_01 = require('../../assets/logos/moely_logo_01.png');

const PrivacyPolicy = () => {
    const router = useRouter();

    return(
        <>
            <Stack.Screen options={{
                headerRight: () => (
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name='close-circle' color='#000' size={24} />
                    </TouchableOpacity>
                ),
                headerLeft: () => <Logo_01 source={Moely_Logo_01} />
            }} />
            <WebView style={{ flex: 1 }} source={{ uri: 'https://www.freeprivacypolicy.com/live/c131e865-1ebc-4b23-9506-e0eeb2b43fcf' }} />
        </>
    );
};

export default PrivacyPolicy;

const TouchableOpacity = styled.TouchableOpacity``;

const Logo_01 = styled.Image`
    border-radius: 7px;
    height: 32px;
    width: 32px;
`;