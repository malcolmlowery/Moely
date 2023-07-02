import styled from 'styled-components/native';
import { Stack, useRouter, useSearchParams } from 'expo-router';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { CardI } from '../../../types/card.interface';
import { useState } from 'react';
import Card from '../../../components/Card';

const bio_text = 'As a registered nurse, my primary goal is to provide compassionate and competent care to patients in need. With a solid foundation of medical knowledge and clinical skills, I am dedicated to promoting and restoring health, preventing illness, and supporting individuals and their families throughout their healthcare journeys. I am trained to assess patients, administer medications, perform treatments, and collaborate with the healthcare team to develop and implement comprehensive care plans. Whether it is in a hospital, clinic, or community setting, I strive to deliver patient-centered care with empathy, professionalism, and a commitment to continuous learning.'

const postsData = [
    {
        owner: {
            uid: '123',
            username: 'Regina Stella',
            profileImage: 'https://www.barrowneuro.org/wp-content/uploads/Remiel-Gonda-OR-Nurse-e1566942309945.jpg',
            occupation: 'Registered Nurse 🩺',
        },
        is_post_owner: true,
        post_id: 'c8n4rty89vgtn724tvg9u344t9r',
        timestamp: '54 mins',
        text: 'Calling all health warriors! 🌟 As a newly registered nurse, I am thrilled to embark on this incredible journey of compassion, care, and healing. 🤗💙 Every day, I have the privilege of making a positive impact on peoples lives, providing comfort, and helping them navigate their health journeys. It is a calling that fills my heart with purpose and joy! ✨💕 From tending to wounds, administering medications, and offering a listening ear, I am here to support and advocate for my patients every step of the way. Together, we can conquer health challenges and create a brighter, healthier future. 💪🌈 Join me in celebrating the incredible work nurses do worldwide! 🎉🌍 Let us raise our stethoscopes high and spread love, knowledge, and kindness. 🌟💙 If you have any questions about nursing or need a friendly ear, feel free to reach out! Let us connect and make a difference together. 💌🤝',
        post_liked: true,
        number_of_post_likes: 52,
        number_of_post_comments: 113,
    },
];

const Profile = () => {
    const router = useRouter();
    const { other_user_uid: uid, username }: any = useSearchParams();

    const [showMoreText, setShowMoreText] = useState(false);
    const bio = bio_text.length > 380 && !showMoreText ? `${bio_text.slice(0, 200)}... ` : bio_text + ' ';

    const handleReportUser = () => {};

    return(
        <>
            <Stack.Screen 
                options={{ 
                    title: '',
                    headerBackVisible: true,
                    headerLeft: () => null, 
                    headerRight: () => {
                        return(
                            <TouchableOpacity onPress={() => handleReportUser()}>
                                    <Ionicons name='md-alert-circle' color='#121212' size={21} />
                                </TouchableOpacity>  
                        )
                    },  
                }}
            />

            <KeyboardAwareFlatList 
                keyboardShouldPersistTaps='always'
                extraScrollHeight={30}
                ListHeaderComponent={() => {
                    return(
                        <Container>
                            <Wallpaper source={{ uri: 'https://images.unsplash.com/photo-1470390356535-d19bbf47bacb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }} />
                            <Header>
                                <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                                    <ProfileImage source={{ uri: 'https://www.barrowneuro.org/wp-content/uploads/Remiel-Gonda-OR-Nurse-e1566942309945.jpg' }} />
                                    <View>
                                        <Username>Malani Kai Lowery</Username>
                                        <Occupation>Registered Nurse 🩺</Occupation>
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', width: '100%' }}>
                                    <Capsule style={{ backgroundColor: '#4f8fee' }}>
                                        <Ionicons name='business' color='#fff' size={15} style={{ marginRight: 6 }} />
                                        <Text>IU Health</Text>
                                    </Capsule>
                                    <Capsule style={{ backgroundColor: '#6C65F6' }}>
                                        <Ionicons name='ios-earth' color='#fff' size={15} style={{ marginRight: 6 }} />
                                        <Text>Indianapolis, IN</Text>
                                    </Capsule>
                                    <Capsule style={{ backgroundColor: '#ff9500' }}>
                                        <Ionicons name='heart' color='#fff' size={15} style={{ marginRight: 6 }} />
                                        <Text>Family</Text>
                                    </Capsule>
                                </View>
        
                                <AboutMeSection>
                                    <Bio>
                                        {bio}
                                        <TouchableOpacity onPress={() => setShowMoreText(!showMoreText)}>
                                            <Text style={{ color: '#5599ff', fontSize: 13, top: 1 }}>
                                                {showMoreText ? 'show less' : 'show more'}
                                            </Text>
                                        </TouchableOpacity>
                                    </Bio>
                                </AboutMeSection>

                                <View style={{ flexDirection: 'row' }}>
                                    <FollowButton style={{ marginRight: 6 }}>
                                        <Text style={{ fontSize: 13 }}>Follow Malani</Text>
                                    </FollowButton>
                                    <FollowButton style={{ marginLeft: 6, backgroundColor: '#4f8fee' }}>
                                        <Text style={{ fontSize: 13 }}>Message</Text>
                                        <Ionicons name='paper-plane' color='#fff' size={15} style={{ marginLeft: 5 }} />
                                    </FollowButton>
                                </View>
                            </Header>
                            <HeaderFooter>
                                <Line />
                                <Text style={{ color: '#a5a5a5', fontSize: 13, fontWeight: '400', marginHorizontal: 12 }}>User Post Feed</Text>
                                <Line />
                            </HeaderFooter>
                        </Container>
                    );
                }}
                ListFooterComponent={() => {
                    return(
                        <ListViewFooter>
                            <Text style={{ color: '#a5a5a5', fontSize: 13, fontWeight: '400' }}>You have reached the end 📄</Text>
                        </ListViewFooter>
                    );
                }}
                data={postsData}
                renderItem={({ item }) => {
                
                    const {
                        post_id,
                        is_post_owner,
                        owner,
                        timestamp,
                        text,
                        post_liked,
                        number_of_post_likes,
                        number_of_post_comments,
                    }: Partial<CardI> = item;
    
                    return(
                        <Card
                            post_id={post_id}
                            is_post_owner={is_post_owner}
                            username={owner.username}
                            profileImage={owner.profileImage}
                            occupation={owner.occupation}
                            timestamp={timestamp}
                            text={text}
                            post_liked={post_liked}
                            number_of_post_likes={number_of_post_likes}
                            number_of_post_comments={number_of_post_comments}
                            navigate_to_post={() => router.push({ 
                                pathname: `home/post/${post_id}`, 
                                params: { post_id },
                            })}
                            navigate_to_profile={() => {}}
                            query_update_post={() => console.log('Update Post')}
                            query_like_post={() => console.log('Like/Unlike Post')}
                            query_delete_post={() => console.log('Delete Post')}
                            query_report_post={() => console.log('Report Post')}
                            query_hide_post={() => console.log('Hide Post')}
                        />
                    )
                }}
            />

        </>
    );
};

export default Profile;

const Container = styled.View``;

const Wallpaper = styled.Image`
    background-color: gray;
    height: 170px;
    /* margin: 16px; */
    /* border-radius: 12px; */
`;

const Header = styled.View`
    align-items: center;
    background-color: #fff;
    padding: 18px 16px;
`;

const ProfileImage = styled.Image`
    align-self: center;
    background-color: #121212;
    border-radius: 50px;
    height: 100px;
    margin-right: 12px;
    width: 100px;
`;

const Username = styled.Text`
    font-size: 19px;
    font-weight: 600;
    margin-bottom: 1px;
`;

const Occupation = styled.Text`
    font-size: 15px;
    margin-top: 1px;
`;

const View = styled.View`
    flex-direction: column;
    flex: 1;
`;

const Text = styled.Text`
    color: #fff;
    font-weight: 500;
    font-size: 12px;
`;

const Capsule = styled.View`
    align-items: center;
    background-color: #121212;
    border-radius: 20px;
    flex-direction: row;
    margin: 18px 0;
    margin-right: 12px;
    padding: 6px 12px;
    padding-right: 14px;
`;

const AboutMeSection = styled.View`
    background-color: #121212;
    border-radius: 12px;
    padding: 20px 26px;
    padding-bottom: 22px;
    width: 100%;
`;

const Bio = styled.Text`
    color: #fff;
    line-height: 19px;
`;

const HeaderFooter = styled.View`
    align-items: center;
    flex-direction: row;
    margin: 18px 0;
`;

const Line = styled.View`
    background-color: #e4e4e4;
    border-radius: 3px;
    flex: 1;
    height: 2px;
`;

const TouchableOpacity = styled.TouchableOpacity``;

const FollowButton = styled.TouchableOpacity`
    align-items: center;
    background-color: #6C65F6;
    border-radius: 12px;
    flex-direction: row;
    flex: 1;
    justify-content: center;
    margin-top: 18px;
    padding: 12px 0;
`;

const ListViewFooter = styled.View`
    align-items: center;
    margin: 30px 0;
    margin-bottom: 35px;
`;

const HeaderTitle = styled.Text``;