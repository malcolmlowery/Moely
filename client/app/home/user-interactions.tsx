import styled from 'styled-components/native';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { InstantSearch } from 'react-instantsearch-hooks';
import algoliasearch from 'algoliasearch';

// Components
import HeaderBackButton from '../../components/HeaderBackBtn';

// RTK Query
import { useFollowUserMutation, useGetFollowersQuery, useGetFollowingsQuery } from '../../services/endpoints/follow-interactions';

const algoliaClient = algoliasearch('8O25WENF0H', '8e249ef35c4feb97ec2d6169ba1602b6');

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
            
            <InstantSearch searchClient={algoliaClient}>
                <TabView 
                    renderTabBar={renderTabBar}
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    initialLayout={{ width: layout.width }}
                />
            </InstantSearch>
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

    const { data: following_uids, refetch: refetchFollowingQuery } = useGetFollowingsQuery();
    const { data: follower_uids, isLoading: isLoadingFollowerUids, refetch: refetchFollowerQuery } = useGetFollowersQuery();
    const [followUserQuery, { isLoading: isLoadingFollowInteraction, isError: errorLoadingFollowInteraction }] = useFollowUserMutation();
    
    const [userResults, setUserResults] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const handleFollowUserInteraction = (uid) => {
        if(!isLoadingFollowInteraction) {
            followUserQuery({ profile_uid: uid });
        };
    };
    
    useEffect(() => {
        if(!isLoadingFollowerUids || refreshing) {
            algoliaClient.initIndex('dev_medrant_followers').getObjects(follower_uids)
                .then(({ results }) => setUserResults(results));
        };
    }, [follower_uids, refreshing, isLoadingFollowInteraction]);

    return(
        <Container>
            <FlatList
                style={{ marginBottom: 80 }}
                refreshing={refreshing}
                onRefresh={() => {
                    setRefreshing(true)
                    refetchFollowingQuery()
                    refetchFollowerQuery().then(() => setRefreshing(false))
                }}
                data={userResults}
                renderItem={({ item }) => {
                    const { owner } = item || {};
                    const following_user = following_uids.find(following_uid => following_uid === item?.owner.uid)
                    return(
                        <FollowItem onPress={() => router.push({
                            pathname: `home/profile/${owner.uid}`,
                            params: { other_user_uid: owner.uid }
                        })}>
                             { owner?.profile_image ?
                                    <ProfileImage source={{ uri: owner.profile_image }} /> :
                                    <ProfileImage source={require('../../assets/images/profile_image_placeholder_01.png')} />
                                }
                            <FollowDetails>
                                <Username>{owner?.username}</Username>
                                { owner?.occupation && <Occupation>{owner.occupation}</Occupation> }
                            </FollowDetails>
                            <Spacer />
                            {/* { following_user &&
                                <FollowButton onPress={() => handleFollowUserInteraction(item?.owner.uid)}>
                                    <Text style={{ color: '#fff', fontWeight: '500' }}>Unfollow</Text>
                                </FollowButton>
                            }
                            { !following_user &&
                                <FollowButton onPress={() => handleFollowUserInteraction(item?.owner.uid)}>
                                    <Text style={{ color: '#fff', fontWeight: '500' }}>Follow</Text>
                                </FollowButton>
                            } */}
                        </FollowItem>
                    );
                }}
            />
        </Container>
    );
};

const FollowingTab = () => {
    const router = useRouter();

    const { data: follower_uids, refetch: refetchFollowerQuery } = useGetFollowersQuery();
    const { data: following_uids, isLoading: isLoadingFollowingUids, refetch: refetchFollowingQuery } = useGetFollowingsQuery();
    const [followUserQuery, { isLoading: isLoadingFollowInteraction, isError: errorLoadingFollowInteraction }] = useFollowUserMutation();

    const [userResults, setUserResults] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const handleFollowUserInteraction = (uid) => {
        if(!isLoadingFollowInteraction) {
            followUserQuery({ profile_uid: uid });
        };
    };
    
    useEffect(() => {
        if(!isLoadingFollowingUids || refreshing) {
            algoliaClient.initIndex('dev_medrant_following').getObjects(following_uids)
                .then(({ results }) => setUserResults(results));
        };
    }, [following_uids, refreshing, isLoadingFollowInteraction]);
    
    return(
        <Container>
            <FlatList
                style={{ marginBottom: 80 }}
                refreshing={refreshing}
                onRefresh={() => {
                    setRefreshing(true)
                    refetchFollowerQuery()
                    refetchFollowingQuery().then(() => setRefreshing(false))
                }}
                data={userResults}
                renderItem={({ item }) => {
                    const { owner } = item || {};
                    const follower_user = follower_uids.find(follower_uid => follower_uid === item?.owner.uid)
                    return(
                        <FollowItem onPress={() => router.push({
                            pathname: `home/profile/${owner.uid}`,
                            params: { other_user_uid: owner.uid }
                        })}>
                             { owner?.profile_image ?
                                    <ProfileImage source={{ uri: owner.profile_image }} /> :
                                    <ProfileImage source={require('../../assets/images/profile_image_placeholder_01.png')} />
                                }
                            <FollowDetails>
                                <Username>{owner?.username}</Username>
                                { owner?.occupation && <Occupation>{owner.occupation}</Occupation> }
                            </FollowDetails>
                            <Spacer />
                            {/* { follower_user &&
                                <FollowButton onPress={() => handleFollowUserInteraction(item?.owner.uid)}>
                                    <Text style={{ color: '#fff', fontWeight: '500' }}>Unfollow</Text>
                                </FollowButton>
                            }
                            { !follower_user &&
                                <FollowButton onPress={() => handleFollowUserInteraction(item?.owner.uid)}>
                                    <Text style={{ color: '#fff', fontWeight: '500' }}>Follow</Text>
                                </FollowButton>
                            } */}
                        </FollowItem>
                    );
                }}
            />
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
    height: 40px;
    width: 40px;
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
