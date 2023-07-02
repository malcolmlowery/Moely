import styled from 'styled-components/native';
import { Tabs } from 'expo-router';
import { AntDesign, Ionicons } from '@expo/vector-icons';

const TabNavigator = () => {
    const tabOptions = {};

    return(
        <Tabs screenOptions={({ route }) => ({ 
            headerShown: false, 
            tabBarLabel: '',
            tabBarActiveTintColor: '#6C65F6',
            tabBarIcon: ({ color, focused, size }) => {
                let iconName;

                if(route.name === 'newsfeed') {
                    iconName = focused ? 'newspaper' : 'newspaper-outline';
                };
                if(route.name === 'notifications') {
                    iconName = focused ? 'notifications' : 'notifications-outline';
                };
                if(route.name === 'settings') {
                    iconName = focused ? 'ios-settings' : 'ios-settings-outline';
                };
                
                return <Ionicons color={color} name={iconName} size={24} style={{ top: 10 }} />
            },
        })}>
            <Tabs.Screen name='newsfeed' options={{}} />
            <Tabs.Screen name='notifications' options={{}} />
            <Tabs.Screen name='settings' options={{}} />
        </Tabs>
    );
};

export default TabNavigator;

const TextLabel = styled.Text`
    font-size: 12px;
`;