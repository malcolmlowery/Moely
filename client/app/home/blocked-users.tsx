import styled from 'styled-components/native';
import { Stack, useRouter } from 'expo-router';
import { useGetBlockedUsersQuery, useUnblockUserMutation } from '../../services/endpoints/user-profile';
import HeaderBackButton from '../../components/HeaderBackBtn';

const BlockedUsers = () => {
    const router = useRouter();
    const { data: blocked_users, isLoading: isLoadingBlockedUsers, isFetching: isFetchingBlockedUsers, isError: isErrorLoadingBlockedUsers, refetch: refetchBlockedUsers } = useGetBlockedUsersQuery();
    const [unblockUser, { isLoading: isUnblockingUser, isError: errorUnblockingUser }] = useUnblockUserMutation();
    
    const handleUblockUser = (uid) => {
        unblockUser(uid).then(({ error }: any) => {
            if(!error) return;
            alert(error);
        });
    };

    return(
        <>
            <Stack.Screen 
                options={{ 
                    headerLeft: () => <HeaderBackButton navigateBack={() => router.back()} title='Blocked Users' />
                }} 
            />

            { !isLoadingBlockedUsers &&
                <FlatList
                    refreshing={isFetchingBlockedUsers}
                    onRefresh={() => refetchBlockedUsers()}
                    data={blocked_users} 
                    renderItem={({ item }: any) => {
                        return(
                            <ItemGroup>
                                <ProfileImage source={require('../../assets/images/profile_image_placeholder_01.png')} />
                                <UserInfo>
                                    <Username>{item.username}</Username>
                                    { item.occupation && <Occupation>{item.occupation}</Occupation> }
                                </UserInfo>
                                <Spacer />
                                <TouchableOpacity onPress={() => handleUblockUser(item.uid)}>
                                    <Text style={{ color: '#f64343', fontSize: 12, fontWeight: '500' }}>Unblock User</Text>
                                </TouchableOpacity>
                            </ItemGroup>
                        )
                    }} 
                />
            }

        </>
    );
};

export default BlockedUsers;

const FlatList = styled.FlatList`
    flex: 1;
`;

const Spacer = styled.View`
    flex: 1;
`;

const ItemGroup = styled.View`
    align-items: center;
    background-color: #fff;
    border-radius: 12px;
    flex-direction: row;
    padding: 16px 16px;
    margin: 4px;
    margin-bottom: 0px;
`;

const UserInfo = styled.View``;

const Username = styled.Text`
    color: #1f1f1f;
    font-weight: 500;
    font-size: 14px;
`;

const Occupation = styled.Text`
    color: #969696;
    font-size: 12px;
`;

const ProfileImage = styled.Image`
    border-radius: 20px;
    height: 35px;
    margin-right: 10px;
    width: 35px;
`;

const Text = styled.Text``;

const TouchableOpacity = styled.TouchableOpacity`
    background-color: #f3f3f3;
    border-radius: 20px;
    padding: 8px 16px;
`;