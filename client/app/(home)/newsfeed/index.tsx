import { useRouter } from 'expo-router';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import Card from '../../../components/Card';

const Newsfeed = () => {
    const router = useRouter();

    return (
        <KeyboardAwareFlatList 
            style={{ paddingTop: 3 }}
            keyboardShouldPersistTaps='always'
            extraScrollHeight={30}
            data={[null]}
            renderItem={() => {
                return(
                   <Card
                        post_id='c8n4rty89vgtn724tvg9u344t9r'
                        is_post_owner={true}
                        username='Regina Stella'
                        profileImage='https://www.barrowneuro.org/wp-content/uploads/Remiel-Gonda-OR-Nurse-e1566942309945.jpg'
                        occupation='Registered Nurse 🩺'
                        timestamp='54 mins'
                        text='Calling all health warriors! 🌟 As a newly registered nurse, I am thrilled to embark on this incredible journey of compassion, care, and healing. 🤗💙 Every day, I have the privilege of making a positive impact on peoples lives, providing comfort, and helping them navigate their health journeys. It is a calling that fills my heart with purpose and joy! ✨💕 From tending to wounds, administering medications, and offering a listening ear, I am here to support and advocate for my patients every step of the way. Together, we can conquer health challenges and create a brighter, healthier future. 💪🌈 Join me in celebrating the incredible work nurses do worldwide! 🎉🌍 Let us raise our stethoscopes high and spread love, knowledge, and kindness. 🌟💙 If you have any questions about nursing or need a friendly ear, feel free to reach out! Let us connect and make a difference together. 💌🤝'
                        post_liked={true}
                        number_of_post_likes={52}
                        number_of_post_comments={113}
                        navigate_to_post={() => router.push('post')}
                        navigate_to_profile={() => console.log('Navigate to profile')}
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