import styled from 'styled-components/native';
import { Stack, useRouter } from 'expo-router';
import HeaderBackButton from '../../components/HeaderBackBtn';

const Privacy = () => {
    const router = useRouter();

    return(
        <>
            <Stack.Screen 
                options={{ 
                    headerLeft: () => <HeaderBackButton navigateBack={() => router.back()} title='Privacy' />
                }} 
            />
            
            <Container></Container>
        </>
    );
};

export default Privacy;

const Container = styled.View``;