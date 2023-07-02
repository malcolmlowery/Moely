import styled from 'styled-components/native';
import { Stack, useRouter } from 'expo-router';
import HeaderBackButton from '../../components/HeaderBackBtn';

const UserActivityHistory = () => {
    const router = useRouter();

    return(
        <>
            <Stack.Screen 
                options={{ 
                    headerLeft: () => <HeaderBackButton navigateBack={() => router.back()} title='Activity History' />
                }} 
            />
            
            <Container></Container>
        </>
    );
};

export default UserActivityHistory;

const Container = styled.View``;