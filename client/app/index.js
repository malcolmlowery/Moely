import 'expo-router/entry';
import styled from 'styled-components/native';

const Index = () => {
    return (
        <Container>
            <Text>Welcome to Moely 🩺</Text>
        </Container>
    );
};

export default Index;

const Container = styled.View`
    align-items: center;
    flex: 1;
    justify-content: center;
`;

const Text = styled.Text`
    font-size: 21px;
    font-weight: 600;
`;