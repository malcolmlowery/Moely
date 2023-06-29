import styled from 'styled-components/native';
import { Stack, useRouter } from 'expo-router';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import Card from '../../../components/Card';
import Comment from '../../../components/Comment';
const Moely_Logo_01 = require('../../../assets/logos/moely_logo_01.png');

const PostDetails = () => {
    const router = useRouter();

    return(
        <>
            <Stack.Screen 
                options={{ 
                    title: '', 
                    headerLeft: null,
                    headerRight: () => <Logo_01 source={Moely_Logo_01} />
                }} 
            />
            <KeyboardAwareFlatList 
                keyboardShouldPersistTaps='always'
                extraScrollHeight={30}
                ListHeaderComponent={() => {
                    return(
                        <Card 
                            post_id='c8n4rty89vgtn724tvg9u344t9r'
                            is_post_owner={false}
                            username='Regina Stella'
                            profileImage='https://www.barrowneuro.org/wp-content/uploads/Remiel-Gonda-OR-Nurse-e1566942309945.jpg'
                            occupation='Registered Nurse 🩺'
                            timestamp='54 mins'
                            text='Calling all health warriors! 🌟 As a newly registered nurse, I am thrilled to embark on this incredible journey of compassion, care, and healing. 🤗💙 Every day, I have the privilege of making a positive impact on peoples lives, providing comfort, and helping them navigate their health journeys. It is a calling that fills my heart with purpose and joy! ✨💕 From tending to wounds, administering medications, and offering a listening ear, I am here to support and advocate for my patients every step of the way. Together, we can conquer health challenges and create a brighter, healthier future. 💪🌈 Join me in celebrating the incredible work nurses do worldwide! 🎉🌍 Let us raise our stethoscopes high and spread love, knowledge, and kindness. 🌟💙 If you have any questions about nursing or need a friendly ear, feel free to reach out! Let us connect and make a difference together. 💌🤝'
                            post_liked={true}
                            number_of_post_likes={52}
                            number_of_post_comments={113}
                            navigate_to_profile={() => console.log('Navigate to profile')}
                            query_update_post={() => console.log('Update Post')}
                            query_like_post={() => console.log('Like/Unlike Post')}
                            query_delete_post={() => console.log('Delete Post')}
                            query_report_post={() => console.log('Report Post')}
                            query_hide_post={() => console.log('Hide Post')}
                        />
                    )
                }}
                data={[null]}
                renderItem={() => {
                    return(
                        <>
                            <Comment 
                                username='Malani Kai' 
                                occupation='Nurse Practitioner'
                                timestamp='29 mins'
                                profile_image='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWXQ20GQROw8W35FbnKP3RmYyulXAdn1IwSHrePCREElacANKMfJN1WUpOvaWCsxb1slY&usqp=CAU'
                                is_comment_owner={false}
                                text='Congratulations on becoming a registered nurse! 🎉💙 Your passion and dedication to caring for others shines through your words. Thank you for joining the noble profession of nursing and making a difference in peoples lives'
                                comment_liked={true}
                                total_comment_likes={14}
                                navigate_to_profile={() => console.log('Navigate to profile')}
                                query_update_comment={(updatedCommentText) => console.log(updatedCommentText)}
                                query_delete_comment={() => console.log('Delete Comment')}
                                query_like_comment={() => console.log('Like/Unlike Comment')}
                                query_report_comment={() => console.log('Report Comment')}
                                query_hide_comment={() => console.log('Hide Comment')}
                            />
                        </>
                    )
                }}
            />
        </>
    );
};

export default PostDetails;

const Logo_01 = styled.Image`
    border-radius: 7px;
    height: 32px;
    width: 32px;
`;