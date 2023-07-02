import styled from 'styled-components/native';
import { Stack, useRouter } from 'expo-router';
import HeaderBackButton from '../../components/HeaderBackBtn';

const Account = () => {
    const router = useRouter();

    return(
        <>
            <Stack.Screen 
                options={{ 
                    headerLeft: () => <HeaderBackButton navigateBack={() => router.back()} title='Account Settings' />
                }} 
            />
            
            <Container></Container>
        </>
    );
};

export default Account;

const Container = styled.View``;