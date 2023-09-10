import styled from 'styled-components/native';
import { useEffect, useState } from 'react';
import { AntDesign, Ionicons, FontAwesome } from '@expo/vector-icons';
import { Alert, Keyboard } from 'react-native';
import { LinkPreview } from '@flyerhq/react-native-link-preview';
import { CardI } from '../types/card.interface';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import TextTicker from 'react-native-text-ticker';
import Lottie from 'lottie-react-native';
import * as Device from 'expo-device';

const Card = ({
    post_id,
    is_post_owner,
    username,
    profileImage,
    occupation,
    created_at,
    text,
    post_liked,
    total_likes,
    total_comments,
    has_url_link,
    url_link,
    edit_post,
    navigate_to_post,
    navigate_to_profile,
    query_update_post,
    query_like_post,
    query_delete_post,
    query_report_post,
    query_hide_post,
    query_create_comment,
    create_comment_active,
}: Partial<CardI>) => {
    const device_brand = Device.brand;
    
    const [showOptions, setShowOptions] = useState(false);
    const [showMoreText, setShowMoreText] = useState(false);
    const [editTextActive, setEditTextActive] = useState(false);
    const [editedPostText, setEditedPostText] = useState(null);
    const [hideLinkPreview, setHideLinkPreview] = useState(false);
    const [hideExtraTextLines, setHideExtraTextLines] = useState(false);
    
    // For Query Loading Status
    const [postIsLiked, setPostIsLiked] = useState(post_liked);
    const [isLikingPost, setIsLikingPost] = useState(false);
    const [isUpdatingPost, setIsUpdatingPost] = useState(false);
    
    const post_text = text.length > 380 && !showMoreText ? `${text.slice(0, 380)}... ` : text + ' ';

    useEffect(() => {
        setPostIsLiked(post_liked);
    }, [post_liked]);

    const handleUpdatePost = async () => {
        setIsUpdatingPost(true);
        await query_update_post(editedPostText)
            .then(({ error }) => {
                if(!error) {
                    setShowOptions(false);
                    setIsUpdatingPost(false);
                    setEditTextActive(false);
                    setEditedPostText(null);
                };
            });
    };

    const handleLikePost = () => {
        setIsLikingPost(true);
        setPostIsLiked(!postIsLiked)
        query_like_post(!postIsLiked)
            .then(({ error }) => {
                setIsLikingPost(false)
            });
    };

    const handleShowOptions = () => {
        setEditTextActive(false);
        setEditedPostText(null);
        setShowOptions(!showOptions)
    };

    const handleCancelEditPost = () => {
        setShowMoreText(false);
        setEditTextActive(false);
        setShowOptions(false);
        setEditedPostText(null);
    };

    const navigateToProfile = () => navigate_to_profile();

    const handleDeletePost = () => {
        Alert.alert(
            'Delete Post',
            'Are you sure you want to delete this post?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'YES',
                    style: 'destructive',
                    onPress: () => query_delete_post()
                },
            ],
        );
    };

    const handleHideReportPostOptions = () => {
        Alert.alert(
            'Post Actions',
            'Is there something wrong with this post?',
            [
                {
                    text: 'Report post',
                    style: 'destructive',
                    onPress: () => query_report_post()
                },
                {
                    text: 'Hide post',
                    style: 'default',
                    onPress: () => query_hide_post()
                },
                { 
                    text: 'Cancel', 
                    style: 'cancel', 
                    onPress: () => {} 
                },
            ],
        );
    };

    const [createCommentActive, setCreateCommentActive] = useState(create_comment_active);
    const [commentText, setCommentText] = useState('');
    const [isCreatingComment, setIsCreatingComment] = useState(false);

    const handleCreateComment = async () => {
        setIsCreatingComment(true)
        await query_create_comment(commentText)
            .then(({ error }) => {
                if(!error) {
                    setCreateCommentActive(false);
                    setIsCreatingComment(false)
                    setCommentText('');
                };
            });
    };
    
    const createCommentViewAnimes = useAnimatedStyle(() => {
        return {
            backgroundColor: '#fff',
            height: createCommentActive ? withSpring(device_brand === 'Apple' ? 194 : 200, { stiffness: 99, damping: 15 }): 0,
            overflow: 'hidden',
            paddingTop: 16
        };
    });
    
    return(
        <Pressable onPress={() => Keyboard.dismiss()} key={post_id}>
            <Container onLayout={(event) => {
                // const { x, y, width, height } = event.nativeEvent.layout;
                // console.log(height)
                // if(post_text.length < 200 && height > 550) {
                //     setHideExtraTextLines(true);
                // }
            }}>
                <Header>
                    <Pressable onPress={() => navigateToProfile()}>
                        { profileImage ?
                            <ProfileImage source={{ uri: profileImage }} /> :
                            <ProfileImage source={require('../assets/images/profile_image_placeholder_01.png')} />
                        }
                    </Pressable>
                    <HeaderRight>
                        <HeaderTop>
                            <Pressable onPress={() => navigateToProfile()}>
                                { username?.length > 18 ?
                                    <View>
                                        <LinearGradient 
                                            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0)', '#fff']}
                                            start={{ x: 0, y: 1 }}
                                            end={{ x: 1, y: 1 }} 
                                            style={{ height: 30, left: 0, position: 'absolute', right: 0, zIndex: 1000 }} />
                                        <TextTicker
                                            style={{ fontSize: 24 }}
                                            duration={username.length > 80 ? 3000 : 12000}
                                            loop
                                            bounce
                                            repeatSpacer={50}
                                            marqueeDelay={1000}
                                            >
                                            <Username>{username}</Username> 
                                        </TextTicker>
                                    </View>:
                                    <Username>{username}</Username> 
                                }
                            </Pressable>
                            <Spacer />
                            { !showOptions && <Timestamp>{created_at}</Timestamp> }
                            { showOptions && is_post_owner && 
                                <>
                                    <TouchableOpacity style={{ marginRight: 18 }} onPress={() => handleDeletePost()}>
                                        <OptionText style={{ color: '#f34a4a' }}>Delete</OptionText>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ marginRight: 16 }} onPress={() => edit_post()}>
                                        <OptionText style={{ color: '#6C65F6' }}>Edit</OptionText>
                                    </TouchableOpacity>
                                </>
                            }
                            { is_post_owner && 
                                <TouchableOpacity onPress={() => handleShowOptions()}>
                                    <AntDesign name='ellipsis1' color='#BBB' size={30} style={{ top: -4 }} />
                                </TouchableOpacity>
                            }
                            { !is_post_owner && 
                                <TouchableOpacity onPress={() => handleHideReportPostOptions()}>
                                    <Ionicons name='md-alert-circle' color='#363636' size={19} />
                                </TouchableOpacity>  
                            }
                        </HeaderTop>
                        { occupation &&
                            <HeaderBottom>
                                <Occupation>{occupation}</Occupation>
                            </HeaderBottom>
                        }
                    </HeaderRight>
                </Header>

                    <Pressable onPress={() => setShowMoreText(!showMoreText)}  style={{ marginBottom: has_url_link ? 5 : 1 }}>
                        <Body>
                            { !editTextActive &&
                                <PostText>
                                    {/* { hideExtraTextLines && !showMoreText && post_text.slice(0, 19)}
                                    { hideExtraTextLines && showMoreText && post_text}
                                    { hideExtraTextLines &&
                                        <TouchableOpacity onPress={() => setShowMoreText(!showMoreText)}>
                                            <Text style={{ color: '#4f8fee', fontSize: 13 }}>
                                                {showMoreText ? 'show less' : 'show more'}
                                            </Text>
                                        </TouchableOpacity>
                                    } */}

                                    { !hideExtraTextLines && post_text}
                                    { !hideExtraTextLines && text.length > 380 &&
                                        <TouchableOpacity onPress={() => setShowMoreText(!showMoreText)}>
                                            <Text style={{ color: '#4f8fee', fontSize: 13 }}>
                                                {showMoreText ? 'show less' : 'show more'}
                                            </Text>
                                        </TouchableOpacity>
                                    }
                                </PostText>
                            }
                            { editTextActive &&
                                <TextInput 
                                    autoCapitalize='sentences'
                                    multiline={true}
                                    maxLength={3000}
                                    onChangeText={(value) => setEditedPostText(value)} 
                                    textAlignVertical='top'
                                    value={editedPostText} 
                                />
                            }
                        </Body>
                    </Pressable>

                    { has_url_link &&
                        <LinkPreview 
                            containerStyle={{
                                backgroundColor: '#f0f0f0',
                                borderRadius: 12,
                            }}
                            enableAnimation={true} 
                            text={url_link}
                            renderHeader={() => null}
                            renderText={() => null}
                            renderTitle={() => null}
                            renderLinkPreview={({ aspectRatio, previewData, containerWidth }) => {
                                return(
                                    <LinkImagePreviewContainer style={{ paddingBottom: hideLinkPreview ? 4 : 16 }}>
                                        { previewData?.title && <LinkTitle>{previewData?.title}</LinkTitle> }
                                        { !previewData?.description && <LinkTitle>{previewData?.link}</LinkTitle> }
                                        { previewData?.description && <LinkDescription>{previewData?.description}</LinkDescription> }
                                        {/* <HideLinkPreviewButton onPress={() => setHideLinkPreview(!hideLinkPreview)}>
                                            <HideLinkPreviewButtonText>{hideLinkPreview ? 'Show Preview' : 'Hide Preview'}</HideLinkPreviewButtonText>
                                        </HideLinkPreviewButton> */}
                                        { previewData?.image &&
                                            <LinkImagePreview style={{ aspectRatio, borderRadius: 10 }} source={{ uri: previewData?.image.url }} /> 
                                        }
                                    </LinkImagePreviewContainer>
                                )
                            }}
                        />
                    } 

                <Footer  style={{ marginTop: has_url_link ? 16 : 0}}>
                    { !isUpdatingPost &&
                        <>
                            <TouchableOpacity>
                                <Text style={{ color: '#7657F7' }}>{total_likes} likes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => navigate_to_post()}>
                                <Text style={{ color: '#969696' }}>{total_comments} comments</Text>
                            </TouchableOpacity>
                        </>
                    }

                    <Spacer />
                    
                    <ButtonGroup>
                        { !editTextActive && !isUpdatingPost &&
                            <>
                                <ButtonIcon style={{ backgroundColor: '#363636' }} onPress={() => !isCreatingComment && setCreateCommentActive(!createCommentActive)}>
                                    <Ionicons name='ios-chatbubbles' color='#fff' size={17} />
                                </ButtonIcon>
                                <ButtonIcon style={{ backgroundColor: '#424242' }} onPress={() => !isLikingPost && handleLikePost()}>
                                    <AntDesign name='heart' color={ postIsLiked ? '#ff5252' : '#fff' } size={17} />
                                </ButtonIcon>
                            </>
                        }
                        { editTextActive && !isUpdatingPost &&
                            <>
                                { editedPostText === text &&
                                    <UpdatePostButton style={{ backgroundColor: '#363636' }} onPress={() => handleCancelEditPost()}>
                                        <Text style={{ color: '#fff', fontSize: 15 }}>Cancel</Text>
                                    </UpdatePostButton>
                                }

                                { editedPostText !== text && !isUpdatingPost &&
                                    <UpdatePostButton onPress={() => !isUpdatingPost && handleUpdatePost()}>
                                        <Text style={{ color: '#fff', fontSize: 15 }}>Update Post</Text>
                                    </UpdatePostButton>
                                }
                            </>
                        }

                        { isUpdatingPost &&
                            <UpdatePostButton style={{ backgroundColor: '#363636', flexDirection: 'row', flex: 1, justifyContent: 'center' }}>
                                <ButtonText style={{ fontSize: 15, fontWeight: '600', left: 3 }}>Please wait...</ButtonText>
                                { device_brand === 'Apple' && <Lottie autoPlay style={{ height: 35, right: 3, top: -3, width: 35 }} source={require('../assets/animations/loading_anime_white_01.json')} /> }
                            </UpdatePostButton>
                        }
                    </ButtonGroup>
                </Footer>

                { createCommentActive &&
                    <Animated.View style={createCommentViewAnimes}>
                        <TextInput 
                            style={{ height: 130, paddingTop: device_brand === 'Apple' ? 14 : 20 }}
                            multiline={true} 
                            placeholder='What would you like to say?' 
                            onChangeText={(value) => setCommentText(value)}
                            textAlignVertical='top'
                        />
                        { commentText && !isCreatingComment &&
                            <CreateCommentButton onPress={() => handleCreateComment()}>
                                <Text style={{ color: '#fff', fontSize: 15 }}>Reply to Post</Text>
                            </CreateCommentButton>
                        }
                        
                        { isCreatingComment &&
                            <LoadingButton>
                                <ButtonText style={{ left: 3, fontSize: 15, fontWeight: '600' }}>Please wait...</ButtonText>
                                { device_brand === 'Apple' && <Lottie autoPlay style={{ height: 35, right: 3, top: -3, width: 35 }} source={require('../assets/animations/loading_anime_white_01.json')} /> }
                            </LoadingButton>
                        }

                        { !commentText &&
                            <CreateCommentButton style={{ backgroundColor: '#e7e7e7'  }}>
                                <Text style={{ color: '#c7c7c7', fontSize: 15 }}>Reply to Post</Text>
                            </CreateCommentButton>
                        }
                    </Animated.View>
                }
            </Container>
        </Pressable>
    );
};

export default Card;

const View = styled.ScrollView`
    width: 165px;
`;

const Text = styled.Text`
    font-size: 13px;
    font-weight: 600;
`;

const Pressable = styled.Pressable``;

const Container = styled.View`
    background-color: #fff;
    flex-direction: column;
    margin-bottom: 3px;
    padding: 16px;
`;

const Header = styled.View`
    align-items: center;
    flex-direction: row;
`;

const Spacer = styled.View`
    flex: 1;
`;

const HeaderRight = styled.View`
    flex: 1;
    margin-left: 10px;
    justify-content: center;
`;

const HeaderTop = styled.View`
    align-items: center;
    height: 21px;
    flex-direction: row;
`;
const HeaderBottom = styled.View``;

const ProfileImage = styled.Image`
    border-radius: 25px;
    height: 45px;
    width: 45px;
`;

const Username = styled.Text`
    color: #1f1f1f;
    font-weight: 500;
    font-size: 17px;
`;

const Occupation = styled.Text`
    color: #969696;
    font-size: 14px;
`;
const Timestamp = styled.Text`
    color: #969696;
    font-size: 13px;
    font-weight: 500;
    margin-right: 10px;
`;

const Body = styled.View`
    margin: 15px 0;
    margin-top: 15px;
`;

const PostText = styled.Text`
    color: #1f1f1f;
    font-size: 15px;
    line-height: 22px;
`;

const Footer = styled.View`
    align-items: center;
    flex-direction: row;
    margin-top: 8px;
`;

const ButtonGroup = styled.View`
    border-radius: 12px;
    flex-direction: row;
    overflow: hidden;
`;

const ButtonIcon = styled.TouchableOpacity`
    padding: 6px 32px;
`;

const UpdatePostButton = styled.TouchableOpacity`
    align-items: center;
    background-color: #6C65F6;
    min-width: 140px;
    padding: 7px 32px;
`;

const OptionText = styled.Text`
    font-size: 14px;
    font-weight: 600;
`;

const TextInput = styled.TextInput`
    background-color: #efefef;
    border-radius: 12px;
    color: #1f1f1f;
    font-size: 15px;
    line-height: 22px;
    max-height: 350px;
    padding: 17px 22px;
`;

const TouchableOpacity = styled.TouchableOpacity``;

const HideLinkPreviewButton = styled.Pressable`
    align-items: center;
    background-color: #d2d2d2;
    border-radius: 10px;
    flex: 1;
    margin-bottom: 16px;
    padding: 12px 20px;
`;

const HideLinkPreviewButtonText = styled.Text`
    font-size: 12px;
`;

const CreateCommentButton = styled.TouchableOpacity`
    align-items: center;
    background-color: #6C65F6;
    border-radius: 12px;
    min-width: 140px;
    margin-top: 10px;
    padding: 10px 32px;
`;

const ButtonText = styled.Text`
    color: #fff;
    font-weight: 500;
    font-size: 14px;
`;

const LoadingButton = styled.TouchableOpacity`
    align-items: center;
    background-color: #1f1f1f;
    border-radius: 12px;
    flex-direction: row;
    justify-content: center;
    margin-top: 10px;
    padding: 10px 32px;
`;

const LinkImagePreviewContainer = styled.View`
    padding: 16px;
`;

const LinkTitle = styled.Text`
    font-weight: 600;
    font-size: 15px;
    top: 0px;
`;

const LinkDescription = styled.Text`
    font-weight: 500;
    font-size: 12px;
    top: 7px;
    margin-bottom: 22px;
`;

const LinkImagePreview = styled.Image``;