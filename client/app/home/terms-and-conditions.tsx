import styled from 'styled-components/native';
import { Stack, useRouter } from 'expo-router';
import HeaderBackButton from '../../components/HeaderBackBtn';

const Terms = () => {
    const router = useRouter();

    return(
        <>
            <Stack.Screen 
                options={{ 
                    headerLeft: () => <HeaderBackButton navigateBack={() => router.back()} title='Terms & Conditions' />
                }} 
            />
            
            <Container></Container>
        </>
    );
};

export default Terms;

const Container = styled.View``;