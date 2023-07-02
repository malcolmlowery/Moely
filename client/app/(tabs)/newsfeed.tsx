import styled from 'styled-components/native';
import { useRouter } from 'expo-router';
import { KeyboardAwareFlatList, KeyboardAwareFlatListProps } from 'react-native-keyboard-aware-scroll-view';
import Card from '../../components/Card';
import { CardI } from '../../types/card.interface';

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

const Newsfeed = () => {
    const router = useRouter();

    return (
        <KeyboardAwareFlatList 
            style={{ paddingTop: 3 }}
            keyboardShouldPersistTaps='always'
            extraScrollHeight={30}
            ListFooterComponent={() => {
                return(
                    <FooterContainer>
                        <Text>You have reached the end 📄</Text>
                    </FooterContainer>
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
                        navigate_to_profile={() => router.push({
                            pathname: `home/profile/${owner.uid}`,
                            params: { uid: owner.uid, username: owner.username }
                        })}
                        query_update_post={() => console.log('Update Post')}
                        query_like_post={() => console.log('Like/Unlike Post')}
                        query_delete_post={() => console.log('Delete Post')}
                        query_report_post={() => console.log('Report Post')}
                        query_hide_post={() => console.log('Hide Post')}
                    />
                )
            }}
        />
    );
};

export default Newsfeed;

const FooterContainer = styled.View`
    align-items: center;
    margin: 30px 0;
    margin-bottom: 35px;
`;

const Text = styled.Text`
    color: #a5a5a5;
    font-size: 13px;
`;