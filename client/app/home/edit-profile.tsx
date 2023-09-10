import styled from 'styled-components/native';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import Lottie from 'lottie-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Device from 'expo-device';
import HeaderBackButton from '../../components/HeaderBackBtn';

// RTK Query
import { 
    useGetUserSettingsInfoQuery, 
    useUpdateUserSettingsMutation, 
    useUploadPhotoCoverMutation, 
    useUploadProfileImageMutation 
} from '../../services/endpoints/user_settings_info';

const EditProfile = () => {
    const device_brand = Device.brand;

    const router = useRouter();
    const { data: user_settings_data, isLoading: isLoadingUserSettingsData, isFetching: isFetchingUserSettingsData, isError: errorLoadingUserSettingsData, refetch: refetchUserSettingsData } = useGetUserSettingsInfoQuery();
    const [updateUserSettings, { isLoading: isLoadingUpdatedUserSettings, isError: errorUpdatingUserSettings }] = useUpdateUserSettingsMutation();
    const [uploadProfileImage, { isLoading: isLoadingUploadedProfileImage, isError: errorUploadingProfileImage }] = useUploadProfileImageMutation();
    const [uploadCoverPhoto, { isLoading: isLoadingUploadedCoverPhoto, isError: errorUploadingCoverPhoto }] = useUploadPhotoCoverMutation();

    const about_me_shortener = !user_settings_data.about_me ? '' :
        user_settings_data?.about_me.length > 380 ? `${user_settings_data?.about_me.slice(0, 200)}...` : user_settings_data?.about_me + ' ';

    const fullname_ref = useRef(null);
    const occupation_ref = useRef(null);
    const about_me_ref = useRef(null);
    const location_ref = useRef(null);
    const place_of_work_ref = useRef(null);
    const important_to_me_ref = useRef(null);

    const [updatedAboutMeText, setUpdatedAboutMeText] = useState(null);
    const [updatedUserProfileInfo, setUpdatedUserProfileInfo]: any = useState({
        username: undefined,
        occupation: undefined,
        location: undefined,
        place_of_work: undefined,
        important_to_me: undefined,
        about_me: undefined,
        wallpaper: undefined,
        wallpaper_formdata: undefined,
        profileImage: undefined,
        profileImage_formdata: undefined,
    });
    
    const pickImage = async (image_action_type) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if(!result.canceled) {

            let localUri = result.assets[0].uri;
			let filename = localUri.split('/').pop();
			let match = /\.(\w+)$/.exec(filename);
			let type = match ? `image/${match[1]}` : `image`;

            if(image_action_type === 'profile_image') {
                let formData: any = new FormData();
                formData.append('profile_image', { uri: localUri, name: filename, type });
                setUpdatedUserProfileInfo(prevState => ({ ...prevState, profileImage: result.assets[0].uri, profileImage_formdata: formData }));
                return;
            };

            if(image_action_type === 'wallpaper_image') {
                let formData: any = new FormData();
                formData.append('cover_photo_image', { uri: localUri, name: filename, type });
                setUpdatedUserProfileInfo(prevState => ({ ...prevState, wallpaper: result.assets[0].uri, wallpaper_formdata: formData }));
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
            console.log(updatedUserProfileInfo.profileImage_formdata )
            uploadProfileImage({ profile_image: updatedUserProfileInfo.profileImage_formdata })
                .then(({ data, error }: any) => {
                    if(data.warning) {
                        return alert(data.message);
                    }

                    if(!error) {
                        setUpdatedUserProfileInfo(prevState => ({ ...prevState, profileImage: undefined, profileImage_formdata: undefined }))
                        return;
                    }
                });
        };

        if(updatedUserProfileInfo.wallpaper) {
            console.log(updatedUserProfileInfo.wallpaper_formdata)
            uploadCoverPhoto({ cover_photo_image: updatedUserProfileInfo.wallpaper_formdata })
                .then(({ data, error }: any) => {
                    if(data.warning) {
                        return alert(data.message);
                    }

                    if(!error) {
                        setUpdatedUserProfileInfo(prevState => ({ ...prevState, wallpaper: undefined, wallpaper_formdata: undefined }))
                    }
                });
        };

        if(
            updatedUserProfileInfo.about_me !== undefined || 
            updatedUserProfileInfo.important_to_me !== undefined ||
            updatedUserProfileInfo.location !== undefined ||
            updatedUserProfileInfo.place_of_work !== undefined || 
            updatedUserProfileInfo.username !== undefined ||
            updatedUserProfileInfo.occupation !== undefined
        ) {
            fullname_ref.current.blur();
            occupation_ref.current.blur();
            about_me_ref.current.blur();
            location_ref.current.blur();
            place_of_work_ref.current.blur();
            important_to_me_ref.current.blur();

            updateUserSettings({
                username: updatedUserProfileInfo.username,
                occupation: updatedUserProfileInfo.occupation,
                location: updatedUserProfileInfo.location,
                place_of_work: updatedUserProfileInfo.place_of_work,
                important_to_me: updatedUserProfileInfo.important_to_me,
                about_me: updatedUserProfileInfo.about_me,
            }).then(({ error }: any) => {
                if(!error) {
                    setUpdatedUserProfileInfo({
                        username: undefined,
                        occupation: undefined,
                        location: undefined,
                        place_of_work: undefined,
                        important_to_me: undefined,
                        about_me: undefined,
                    });

                    fullname_ref.current.clear();
                    occupation_ref.current.clear();
                    about_me_ref.current.clear();
                    location_ref.current.clear();
                    place_of_work_ref.current.clear();
                    important_to_me_ref.current.clear();
                };
            });
        };
    };

    return(
        <>
            { !isLoadingUserSettingsData &&
                <>
                    <Stack.Screen 
                        options={{ 
                            headerLeft: () => <HeaderBackButton navigateBack={() => router.back()} title='Edit Profile' />
                        }} 
                    />
                    
                    <KeyboardAwareScrollView 
                        extraHeight={120}
                        style={{ 
                            flex: 1, 
                            padding: 16, 
                            overflow: 'visible'
                        }}>
        
                        <UserInfo>
                            <WallpaperContainer>
                                <TouchableOpacity style={{ top: 16, position: 'absolute', right: 20, zIndex: 2000 }} onPress={() => handlePressImageButton()}>
                                    <Ionicons name='ios-images' color='#fff' size={29} />
                                </TouchableOpacity>
                                { updatedUserProfileInfo.wallpaper &&
                                    <TouchableOpacity style={{ top: 16, position: 'absolute', left: 20, zIndex: 2000 }} onPress={() => setUpdatedUserProfileInfo(prevState => ({ ...prevState, wallpaper: undefined }))}>
                                        <Ionicons name='trash' color='#ef4a4a' size={29} />
                                    </TouchableOpacity>
                                }
                                { !updatedUserProfileInfo.wallpaper && !user_settings_data.cover_photo &&
                                    <Wallpaper source={require('../../assets/images/wallpaper_placeholder_01.png')} />
                                }
                                { updatedUserProfileInfo.wallpaper &&
                                    <Wallpaper source={{  uri: updatedUserProfileInfo.wallpaper }} />
                                }
                                { user_settings_data.cover_photo && !updatedUserProfileInfo.wallpaper &&
                                    <Wallpaper source={{  uri: user_settings_data.cover_photo }} />
                                }
                                {/* <Wallpaper source={{ uri: 
                                    updatedUserProfileInfo.wallpaper ? updatedUserProfileInfo.wallpaper : 
                                    user_settings_data.cover_photo ? user_settings_data.cover_photo : 'https://verlag.oeaw.ac.at/assets/images/video-placeholder.jpg' }} /> */}
                            </WallpaperContainer>
                            <UserMeta>
                                <ProfileImageView>
                                    { updatedUserProfileInfo.profileImage &&
                                        <TouchableOpacity style={{ justifyContent: 'center', alignItems:'center', top: 0, bottom: 0, left: 0, position: 'absolute', right: 0, zIndex: 100 }} onPress={() => setUpdatedUserProfileInfo(prevState => ({ ...prevState, profileImage: undefined }))}>
                                            <Ionicons name='close' color='#fff' size={38} />
                                        </TouchableOpacity>
                                    }
                                    { updatedUserProfileInfo.profileImage &&
                                        <ProfileImage source={{ uri: updatedUserProfileInfo.profileImage ? updatedUserProfileInfo.profileImage : user_settings_data.profile_image }} />
                                    }
                                    { !updatedUserProfileInfo.profileImage && user_settings_data.profile_image &&
                                        <ProfileImage source={{ uri: updatedUserProfileInfo.profileImage ? updatedUserProfileInfo.profileImage : user_settings_data.profile_image }} />
                                    }
                                    { !updatedUserProfileInfo.profileImage && !user_settings_data.profile_image &&
                                        <ProfileImage source={require('../../assets/images/profile_image_placeholder_01.png')} />
                                    }
                                </ProfileImageView>
                            </UserMeta>

                            <View>
                                <Username>{user_settings_data.username}</Username>
                                { user_settings_data.occupation && <Occupation>{user_settings_data.occupation}</Occupation>}
                            </View>

                        </UserInfo>
        
                        <EditItemsGroup style={{ flex: device_brand === 'Apple' ? 1 : 0, marginBottom: 80 }}>
        
                            <TextInputItem>
                                <TextInputLabel>Full Name</TextInputLabel>
                                <TextInput 
                                    maxLength={78}
                                    ref={fullname_ref} 
                                    placeholder={user_settings_data.username} 
                                    onChangeText={(value) => setUpdatedUserProfileInfo(prevState => ({ ...prevState, username: value.length === 0 ? undefined : value }))} />
                            </TextInputItem>
        
                            <TextInputItem>
                                <TextInputLabel>Occupation</TextInputLabel>
                                <TextInput 
                                    maxLength={70}
                                    ref={occupation_ref} 
                                    placeholder={user_settings_data.occupation} 
                                    onChangeText={(value) => setUpdatedUserProfileInfo(prevState => ({ ...prevState, occupation: value }))} />
                            </TextInputItem>
        
                            <TextInputItem>
                                <TextInputLabel>About Me</TextInputLabel>
                                <TextInput 
                                    maxLength={1200}
                                    ref={about_me_ref}
                                    onFocus={() => !updatedAboutMeText && setUpdatedAboutMeText(user_settings_data.about_me)} 
                                    onBlur={() => updatedAboutMeText === user_settings_data.about_me && setUpdatedAboutMeText(null)} 
                                    onChangeText={(value) => {
                                        setUpdatedAboutMeText(value)
                                        setUpdatedUserProfileInfo(prevState => ({ ...prevState, about_me: value }))
                                    }}
                                    placeholder={about_me_shortener} 
                                    multiline={true} 
                                    // maxLength={850}
                                    value={updatedAboutMeText} 
                                />
                            </TextInputItem>
        
                            <TextInputItem>
                                <TextInputLabel>Location</TextInputLabel>
                                <TextInput 
                                    maxLength={100}
                                    ref={location_ref} 
                                    placeholder={user_settings_data.location} 
                                    onChangeText={(value) => setUpdatedUserProfileInfo(prevState => ({ ...prevState, location: value }))} />
                            </TextInputItem>
        
                            <TextInputItem>
                                <TextInputLabel>Where do you work?</TextInputLabel>
                                <TextInput 
                                    maxLength={80}
                                    ref={place_of_work_ref} 
                                    placeholder={user_settings_data.place_of_work} 
                                    onChangeText={(value) => setUpdatedUserProfileInfo(prevState => ({ ...prevState, place_of_work: value }))} />
                            </TextInputItem>
        
                            <TextInputItem>
                                <TextInputLabel>What is important to you?</TextInputLabel>
                                <TextInput
                                    maxLength={30}
                                    ref={important_to_me_ref} 
                                    placeholder={user_settings_data.important_to_me} 
                                    onChangeText={(value) => setUpdatedUserProfileInfo(prevState => ({ ...prevState, important_to_me: value }))} />
                            </TextInputItem>
        
                            {   updatedUserProfileInfo.about_me !== undefined || 
                                updatedUserProfileInfo.important_to_me !== undefined ||
                                updatedUserProfileInfo.location !== undefined ||
                                updatedUserProfileInfo.place_of_work !== undefined || 
                                updatedUserProfileInfo.username !== undefined ||
                                updatedUserProfileInfo.occupation !== undefined ||
                                updatedUserProfileInfo.profileImage !== undefined ||
                                updatedUserProfileInfo.wallpaper !== undefined ?
                                <>
                                   <SubmitButton onPress={() => !isLoadingUpdatedUserSettings && !isLoadingUploadedProfileImage && !isLoadingUploadedCoverPhoto && handleUpdateUserProfile()} style={{ backgroundColor: '#6C65F6' }}>
                                        { !isLoadingUpdatedUserSettings && !isLoadingUploadedProfileImage && !isLoadingUploadedCoverPhoto ?
                                             <Ionicons name='checkmark' color='#fff' size={32} /> :
                                             <>
                                                { device_brand === 'Apple' ? 
                                                    <Lottie 
                                                        autoPlay 
                                                        style={{ height: 35, width: 35 }} 
                                                        source={require('../../assets/animations/loading_anime_white_01.json')} /> :
                                                    <Text>Wait</Text>
                                                }
                                             </>
                                        }
                                    </SubmitButton>
                                </>
                                :
                                <SubmitButton style={{ backgroundColor: '#e7e7e7' }}>
                                    <Ionicons name='checkmark' color='#fff' size={32} />
                                </SubmitButton>
                            }
        
                        </EditItemsGroup>
        
                    </KeyboardAwareScrollView>
                </>
            }
        </>
    );
};

export default EditProfile;

const Text = styled.Text`
    color: #fff;
`;

const View = styled.View`
    margin-top: -40px;
    padding-bottom: 20px;
`;

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
    margin-bottom: 4px;
    padding: 0 10px;
    text-align: center;
`;

const Occupation = styled.Text`
    color: #121212;
    font-size: 15px;
    text-align: center;
`;

const EditItemsGroup = styled.View`
    background-color: #fff;
    border-radius: 12px;
    /* flex: 1; */
    margin-top: 16px;
    padding: 16px;
    padding-top: 20px;
`;

const TextInputItem = styled.View`
    /* flex: 1; */
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

const TouchableOpacity = styled.TouchableOpacity``;

const SubmitButton = styled.TouchableOpacity`
    align-self: center;
    align-items: center;
    background-color: #6C66F6;
    border-radius: 100px;
    height: 65px;
    justify-content: center;
    margin: 30px 0;
    width: 65px;
`;