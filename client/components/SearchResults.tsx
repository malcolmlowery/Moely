import styled from 'styled-components/native';
import { useInfiniteHits } from 'react-instantsearch-hooks';
import { useRouter } from 'expo-router';
import { getAuth, doc, getDoc, db } from '../services/firebase';
import { useEffect, useState } from 'react';

const SearchResults = ({ ...props }) => {
	const auth_uid = getAuth().currentUser.uid;
   const router = useRouter();
   const { hits, isLastPage, showMore } = useInfiniteHits(props);


   // useEffect(() => {
   //    const getBlockedUsersDoc = async () => {
   //       const doc_ref = doc(db, 'blocked_users', auth_uid);
   //       const doc_data = (await getDoc(doc_ref)).data().user_uids;    
   //    };
      
   //    getBlockedUsersDoc();

   // }, []);

   return(
      <FlatList
         showsVerticalScrollIndicator={false}
         data={hits}
         keyExtractor={(item) => item.objectID}
         onEndReached={() => {
               if(!isLastPage) showMore()
         }}
         ListFooterComponent={() => {
            return(
                <FooterContainer>
                    <Text>You have reached the end 🩺</Text>
                </FooterContainer>
            );
        }}
         renderItem={({ item }) => {
               return(
                  <>
                     { item.uid !== auth_uid &&
                        <Pressable onPress={() => router.push({
                           pathname: `home/profile/${item.uid}`,
                           params: { user_profile_uid: item.uid }
                       })}>
                           <UserItemContainer>
                              { item.profile_image && <ProfileImage source={{ uri: item.profile_image }} /> }
                              { !item.profile_image && <ProfileImage source={require('../assets/images/profile_image_placeholder_01.png')} />}
                              <UserInfo>
                                 <Username>{item.username}</Username>
                                 {item.occupation && <Occupation>{item.occupation}</Occupation>}
                              </UserInfo>
                           </UserItemContainer>
                        </Pressable>
                     }
                  </>
               )
         }}
      />
   )
};

export default SearchResults;

const FlatList = styled.FlatList`
   flex: 1;
`;

const Pressable = styled.TouchableOpacity`
   background-color: #fff;
   margin-top: 2px;
`;

const UserItemContainer = styled.View`
   align-items: center;
   flex-direction: row;
   padding: 16px 10px;
`;

const UserInfo = styled.View`
   margin-left: 10px;
`;

const Username = styled.Text`
   font-size: 16px;
   font-weight: 500;
   margin-bottom: 2px;
`;

const Occupation = styled.Text`
   color: #969696;
`;

const ProfileImage = styled.Image`
   background-color: #edebe9;
   border-radius: 22px;
   height: 44px;
   width: 44px;
`;

const FooterContainer = styled.View`
   align-items: center;
   margin: 30px 0;
`;

const Text = styled.Text`
   color: #a5a5a5;
   font-size: 13px;
`;