import 'expo-router/entry';
import { Redirect } from 'expo-router';

const Index = () => {
    return (
        <Redirect href='/newsfeed' />
    );
};

export default Index;