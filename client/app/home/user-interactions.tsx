import styled from 'styled-components/native';
import { Stack, useRouter } from 'expo-router';
import HeaderBackButton from '../../components/HeaderBackBtn';

const UserInteractions = () => {
    const router = useRouter();

    return(
        <>
            <Stack.Screen 
                options={{ 
                    headerLeft: () => <HeaderBackButton navigateBack={() => router.back()} title='Interactions' />
                }} 
            />
            
            <Container></Container>
        </>
        
    );
};

export default UserInteractions;

const Container = styled.View``;