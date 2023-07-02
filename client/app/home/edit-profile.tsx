import styled from 'styled-components/native';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import HeaderBackButton from '../../components/HeaderBackBtn';

const user_profile_data = {
    username: 'Malani Kai Lowery',
	occupation: 'Registered Nurse 🩺',
	location: 'Indianapolis, IN',
    place_of_work: 'UI Health',
    important_to_me: 'Family',
    about_me: 'As a registered nurse, my primary goal is to provide compassionate and competent care to patients in need. With a solid foundation of medical knowledge and clinical skills, I am dedicated to promoting and restoring health, preventing illness, and supporting individuals and their families throughout their healthcare journeys. I am trained to assess patients, administer medications, perform treatments, and collaborate with the healthcare team to develop and implement comprehensive care plans. Whether it is in a hospital, clinic, or community setting, I strive to deliver patient-centered care with empathy, professionalism, and a commitment to continuous learning.',
    wallpaper: 'https://images.unsplash.com/photo-1470390356535-d19bbf47bacb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    profileImage: 'https://www.barrowneuro.org/wp-content/uploads/Remiel-Gonda-OR-Nurse-e1566942309945.jpg'
};

const EditProfile = () => {
    const router = useRouter();

    const {
        username,
        occupation,
        location,
        place_of_work,
        important_to_me,
        about_me,
        wallpaper,
        profileImage,
    } = user_profile_data;

    const about_me_shortener = about_me.length > 380 ? `${about_me.slice(0, 200)}...` : about_me + ' ';
    
    const [updatedAboutMeText, setUpdatedAboutMeText] = useState(null);
    const [updatedUserProfileInfo, setUpdatedUserProfileInfo] = useState({
        username: undefined,
        occupation: undefined,
        location: undefined,
        place_of_work: undefined,
        important_to_me: undefined,
        about_me: undefined,
        wallpaper: undefined,
        profileImage: undefined,
    });
    
    const pickImage = async (image_action_type) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if(!result.canceled) {
            if(image_action_type === 'profile_image') {
                setUpdatedUserProfileInfo(prevState => ({ ...prevState, profileImage: result.assets[0].uri }));
                return;
            };

            if(image_action_type === 'wallpaper_image') {
                setUpdatedUserProfileInfo(prevState => ({ ...prevState, wallpaper: result.assets[0].uri }));
                return;
            };
        };
    };

    const handlePressImageButton = () => {
        return(
            Alert.alert(
                'Image Actions',
                'What would you like to upload?',
                [
                    {
                        text: 'Profile Image',
                        style: 'default',
                        onPress: () => pickImage('profile_image')
                    },
                    {
                        text: 'Wallpaper',
                        style: 'default',
                        onPress: () => pickImage('wallpaper_image')
                    },
                    { 
                        text: 'Cancel', 
                        style: 'cancel', 
                        onPress: () => {} 
                    },
                ],
            )
        );
    };
    
    const handleUpdateUserProfile = () => {
        if(updatedUserProfileInfo.profileImage) {
            console.log({ profileImage: updatedUserProfileInfo.profileImage });
            console.log('query upload profile image');
        };

        if(updatedUserProfileInfo.wallpaper) {
            console.log({ wallpaper: updatedUserProfileInfo.wallpaper });
            console.log('query upload wallpaper image');
        };

        if(
            updatedUserProfileInfo.about_me !== undefined || 
            updatedUserProfileInfo.important_to_me !== undefined ||
            updatedUserProfileInfo.location !== undefined ||
            updatedUserProfileInfo.place_of_work !== undefined || 
            updatedUserProfileInfo.username !== undefined ||
            updatedUserProfileInfo.occupation !== undefined
        ) {
            console.log({
                username: updatedUserProfileInfo.username,
                occupation: updatedUserProfileInfo.occupation,
                location: updatedUserProfileInfo.location,
                place_of_work: updatedUserProfileInfo.place_of_work,
                important_to_me: updatedUserProfileInfo.important_to_me,
                about_me: updatedUserProfileInfo.about_me,
            })
            console.log('query update user profile');
        };
    };

    return(
        <>
            <Stack.Screen 
                options={{ 
                    headerLeft: () => <HeaderBackButton navigateBack={() => router.back()} title='Edit Profile' />
                }} 
            />
            
            <KeyboardAwareScrollView 
                extraHeight={100}
                style={{ 
                    flex: 1, 
                    padding: 16, 
                    marginBottom: 60, 
                    overflow: 'visible'
                }}>

                <UserInfo>
                    <WallpaperContainer>
                        <TouchableOpacity style={{ bottom: 16, position: 'absolute', right: 20, zIndex: 100 }} onPress={() => handlePressImageButton()}>
                            <Ionicons name='ios-images' color='#fff' size={29} />
                        </TouchableOpacity>
                        { updatedUserProfileInfo.wallpaper &&
                            <TouchableOpacity style={{ top: 16, position: 'absolute', right: 20, zIndex: 100 }} onPress={() => setUpdatedUserProfileInfo(prevState => ({ ...prevState, wallpaper: undefined }))}>
                                <Ionicons name='trash' color='#ef4a4a' size={29} />
                            </TouchableOpacity>
                        }
                        <Wallpaper source={{ uri: updatedUserProfileInfo.wallpaper ? updatedUserProfileInfo.wallpaper : wallpaper }} />
                    </WallpaperContainer>
                    <UserMeta>
                        <ProfileImageView>
                            { updatedUserProfileInfo.profileImage &&
                                <TouchableOpacity style={{ justifyContent: 'center', alignItems:'center', top: 0, bottom: 0, left: 0, position: 'absolute', right: 0, zIndex: 100 }} onPress={() => setUpdatedUserProfileInfo(prevState => ({ ...prevState, profileImage: undefined }))}>
                                    <Ionicons name='close' color='#fff' size={38} />
                                </TouchableOpacity>
                            }
                            <ProfileImage source={{ uri: updatedUserProfileInfo.profileImage ? updatedUserProfileInfo.profileImage : profileImage }} />
                        </ProfileImageView>
                        <Username>{username}</Username>
                        <Occupation>{occupation}</Occupation>
                    </UserMeta>
                </UserInfo>

                <EditItemsGroup>

                    <TextInputItem>
                        <TextInputLabel>Full Name</TextInputLabel>
                        <TextInput placeholder={username} onChangeText={(value) => setUpdatedUserProfileInfo(prevState => ({ ...prevState, username: value.length === 0 ? undefined : value }))} />
                    </TextInputItem>

                    <TextInputItem>
                        <TextInputLabel>Occupation</TextInputLabel>
                        <TextInput placeholder={occupation} onChangeText={(value) => setUpdatedUserProfileInfo(prevState => ({ ...prevState, occupation: value.length === 0 ? undefined : value }))} />
                    </TextInputItem>

                    <TextInputItem>
                        <TextInputLabel>About Me</TextInputLabel>
                        <TextInput 
                            onFocus={() => !updatedAboutMeText && setUpdatedAboutMeText(about_me)} 
                            onBlur={() => updatedAboutMeText === about_me && setUpdatedAboutMeText(null)} 
                            onChangeText={(value) => {
                                setUpdatedAboutMeText(value)
                                setUpdatedUserProfileInfo(prevState => ({ ...prevState, about_me: value.length === 0 ? undefined : value }))
                            }}
                            placeholder={about_me_shortener} 
                            multiline={true} 
                            // maxLength={850}
                            value={updatedAboutMeText} 
                        />
                    </TextInputItem>

                    <TextInputItem>
                        <TextInputLabel>Location</TextInputLabel>
                        <TextInput placeholder={location} onChangeText={(value) => setUpdatedUserProfileInfo(prevState => ({ ...prevState, location: value.length === 0 ? undefined : value }))} />
                    </TextInputItem>

                    <TextInputItem>
                        <TextInputLabel>Where do you work?</TextInputLabel>
                        <TextInput placeholder={place_of_work} onChangeText={(value) => setUpdatedUserProfileInfo(prevState => ({ ...prevState, place_of_work: value.length === 0 ? undefined : value }))} />
                    </TextInputItem>

                    <TextInputItem>
                        <TextInputLabel>What is important to you?</TextInputLabel>
                        <TextInput placeholder={important_to_me} onChangeText={(value) => setUpdatedUserProfileInfo(prevState => ({ ...prevState, important_to_me: value.length === 0 ? undefined : value }))} />
                    </TextInputItem>

                    {   updatedUserProfileInfo.about_me !== undefined || 
                        updatedUserProfileInfo.important_to_me !== undefined ||
                        updatedUserProfileInfo.location !== undefined ||
                        updatedUserProfileInfo.place_of_work !== undefined || 
                        updatedUserProfileInfo.username !== undefined ||
                        updatedUserProfileInfo.occupation !== undefined ||
                        updatedUserProfileInfo.profileImage !== undefined ||
                        updatedUserProfileInfo.wallpaper !== undefined ?
                        <UpdateProfileButton onPress={() => handleUpdateUserProfile()}>
                            <Text style={{ color: '#fff', fontSize: 15 }}>Update Profile</Text>
                        </UpdateProfileButton> 
                        :
                        <UpdateProfileButton style={{ backgroundColor: '#e7e7e7' }}>
                            <Text style={{ color: '#c7c7c7', fontSize: 15 }}>Update Profile</Text>
                        </UpdateProfileButton>
                    }

                </EditItemsGroup>

            </KeyboardAwareScrollView>
        </>
    );
};

export default EditProfile;

const WallpaperContainer = styled.View`
    background-color: #121212;
    height: 170px;
    position: relative;
    width: 100%;
`;

const Wallpaper = styled.Image`
    background-color: gray;
    flex: 1;
`;

const UserInfo = styled.View`
    align-items: center;
    background-color: #fff;
    border-radius: 12px;
    height: 296px;
    overflow: hidden;
`;

const ProfileImageView = styled.View`
    position: relative;
`;

const ProfileImage = styled.Image`
    align-self: center;
    background-color: #121212;
    border-color: #fff;
    border-width: 4px;
    border-radius: 50px;
    height: 100px;
    width: 100px;
`;

const UserMeta = styled.View`
    align-items: center;
    top: -50px;
`;

const Username = styled.Text`
    color: #121212;
    font-size: 19px;
    font-weight: 600;
    margin-top: 10px;
    margin-bottom: 4px;
`;

const Occupation = styled.Text`
    color: #121212;
    font-size: 15px;
`;

const EditItemsGroup = styled.View`
    background-color: #fff;
    border-radius: 12px;
    flex: 1;
    margin-top: 16px;
    padding: 16px;
    padding-top: 20px;
`;

const TextInputItem = styled.View`
    flex: 1;
    margin-bottom: 16px;
`;

const TextInputLabel = styled.Text`
    color: #969696;
    font-size: 13px;
    left: 6px;
`;

const TextInput = styled.TextInput`
    border-color: #e4e4e4;
    border-bottom-width: 1px;
    color: #1f1f1f;
    font-size: 15px;
    font-weight: 500;
    letter-spacing: 0.1px;
    padding: 12px 0;
    padding-left: 6px;
`;

const UpdateProfileButton = styled.TouchableOpacity`
    align-items: center;
    background-color: #6C65F6;
    border-radius: 8px;
    min-width: 140px;
    margin-top: 16px;
    padding: 12px 32px;
    padding-bottom: 15px;
`;

const Text = styled.Text`
    color: #121212;
    font-weight: 500;
    margin-top: 3px;
`;

const TouchableOpacity = styled.TouchableOpacity``;