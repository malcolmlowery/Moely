import styled from 'styled-components/native';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import HeaderBackButton from '../../components/HeaderBackBtn';

const follower_data = [
    {
        followed_on: '2 days ago',
        owner: {
            uid: 'kUSuHr8CP0hOPhhNxRbF',
            username: 'Michael Jones',
            profileImage: 'https://purple.com/sites/default/files/styles/small_1_1/public/2022-06/medical-disc-hero.jpg?itok=rjAqjVtN',
            occupation: 'Registered Nurse'
        },
    },
    {
        followed_on: '2 days ago',
        owner: {
            uid: 'cji0we0iewfie2i0iimkds',
            username: 'Cynthia Maddison',
            profileImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBfLm-zj2JgN--o56LdquoouH05e2nQgJ7RQ&usqp=CAU',
        },
    },
    {
        followed_on: '5 days ago',
        owner: {
            uid: '79qdgubf32jfj3f3dfew',
            username: 'Sally Vladdin',
            profileImage: 'https://advantagemedicalprofessionals.com/wp-content/uploads/2021/02/about-img-1.jpg',
            occupation: 'Doctor'
        },
    },
];

const UserInteractions = () => {
    const router = useRouter();
    const layout = useWindowDimensions();

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'first', title: 'Followers' },
        { key: 'second', title: 'Following' },
    ]);

    const renderScene = SceneMap({ first: FollowersTab, second: FollowingTab });

    return(
        <>
            <Stack.Screen 
                options={{ 
                    headerLeft: () => <HeaderBackButton navigateBack={() => router.back()} title='Interactions' />
                }} 
            />
            
            <TabView 
                renderTabBar={renderTabBar}
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
            />
        </>
        
    );
};

export default UserInteractions;

const renderTabBar = (props) => (
    <TabBar 
        {...props} 
        renderLabel={({ route, focused }) => (
             <Text style={{ fontWeight: '500', letterSpacing: 0.3, opacity: !focused ? 0.5 : 1 }}>{route.title}</Text>
        )}
        indicatorStyle={{ backgroundColor: '#1f1f1f' }} 
        style={{ backgroundColor: '#fff' }} 
    />
);

const FollowersTab = () => {
    const router = useRouter();

    return(
        <Container>
            <FlatList
                style={{ marginBottom: 80 }}
                data={follower_data}
                renderItem={({ item }) => {
                    const {
                        followed_on,
                        owner
                    } = item;
                    
                    return(
                        <FollowItem onPress={() => router.push({ pathname: `home/profile/${owner.uid}` })}>
                            <ProfileImage source={{ uri: owner.profileImage }} />
                            <FollowDetails>
                                <Username>{owner.username}</Username>
                                { owner.occupation && <Occupation>{owner.occupation}</Occupation> }
                            </FollowDetails>
                            <Spacer />
                            <FollowButton>
                                <Text style={{ color: '#fff', fontWeight: '500' }}>Follow</Text>
                            </FollowButton>
                        </FollowItem>
                    )
                }}
            />
        </Container>
    );
};

const FollowingTab = () => {
    const router = useRouter();
    return(
        <Container>
            <Text>Following Tab</Text>
        </Container>
    );
};

const Container = styled.View`
    align-items: center;
    flex: 1;
    justify-content: center;
`;

const Text = styled.Text``;

const FlatList = styled.FlatList`
    flex: 1;
    width: 100%;
`;

const FollowItem = styled.TouchableOpacity`
    align-items: center;
    background-color: #fff;
    flex-direction: row;
    margin-top: 2px;
    padding: 16px 12px;
`;

const FollowDetails = styled.View`
    flex-direction: column;
    margin-left: 10px;
    max-width: 90%;
`;

const ProfileImage = styled.Image`
    border-radius: 20px;
    height: 35px;
    width: 35px;
`;

const Username = styled.Text`
    font-weight: 500;
    font-size: 16px;
`;

const Occupation = styled.Text`
    color: #969696;
`;

const Spacer = styled.View`
    flex: 1;
`;

const FollowButton = styled.TouchableOpacity`
    align-items: center;
    background-color: #1f1f1f;
    border-radius: 30px;
    flex-direction: row;
    flex: 1;
    justify-content: center;
    min-width: 110px;
    max-width: 110px;
    padding: 10px 22px;
`;
