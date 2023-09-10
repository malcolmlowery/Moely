import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { db, onSnapshot, getAuth, doc, getDoc } from '../../services/firebase';

const TabNavigator = () => {
    const [totalNotifications, setTotalNotifications] = useState(null);

    useEffect(() => {
        const notifications_subscription = async () => {
            const docRef = doc(db, 'notifications', getAuth().currentUser.uid);
            const docSnap = await getDoc(docRef);
        
            if(docSnap.exists()) {
                const query_doc = doc(db, 'notifications', getAuth().currentUser.uid);
                onSnapshot(query_doc, async (querySnapshot) => {
                    if(querySnapshot.exists) {
                        setTotalNotifications(querySnapshot.data().total_notifications === 0 ? null : querySnapshot.data().total_notifications);
                        // await Notifications.setBadgeCountAsync(querySnapshot.data().total_notifications) 
                    };
                });
            };
        };

        notifications_subscription();
    }, []);
    
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
                if(route.name === 'users') {
                    return <Feather color={color} name='search' size={24} style={{ top: 10 }} />
                };
                
                return <Ionicons color={color} name={iconName} size={24} style={{ top: 10 }} />
            }
        })}>
            <Tabs.Screen name='newsfeed' options={{}} />
            <Tabs.Screen name='notifications' options={{ tabBarBadge: totalNotifications }} />
            <Tabs.Screen name='users' options={{}} />
            <Tabs.Screen name='settings' options={{}} />
        </Tabs>
    );
};

export default TabNavigator;