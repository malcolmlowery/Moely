import styled from 'styled-components/native';
import { useEffect, useState } from 'react';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Alert, Keyboard } from 'react-native';
import { CardI } from '../types/card.interface';
import Animated, { useAnimatedStyle, withDelay, withSpring, withTiming } from 'react-native-reanimated';

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
    navigate_to_post,
    navigate_to_profile,
    query_update_post,
    query_like_post,
    query_delete_post,
    query_report_post,
    query_hide_post,
    query_create_comment,
    navigatingTo,
    create_comment_active,
}: Partial<CardI>) => {
    const [showOptions, setShowOptions] = useState(false);
    const [editTextActive, setEditTextActive] = useState(false);
    const [editedPostText, setEditedPostText] = useState(null);
    const [showMoreText, setShowMoreText] = useState(false);
    const [postIsLiked, setPostIsLiked] = useState(null);
    
    const post_text = text.length > 380 && !showMoreText ? `${text.slice(0, 380)}... ` : text + ' ';

    useEffect(() => {
        setPostIsLiked(post_liked);
    }, [post_liked]);

    const handleUpdatePost = async () => {
        await query_update_post(editedPostText)
            .then(({ error }) => {
                if(!error) {
                    setEditTextActive(false);
                    setEditedPostText(null);
                    setShowOptions(!showOptions);
                };
            });
    };

    const handleLikePost = () => {
        setPostIsLiked(!postIsLiked)
        query_like_post(!postIsLiked);
    };

    const handleShowOptions = () => {
        setEditTextActive(false)
        setEditedPostText(null);
        setShowOptions(!showOptions)
    };

    const handleEditTextActive = () => {
        setEditedPostText(text);
        setEditTextActive(true);
    };

    const handleCancelEditPost = () => {
        setShowMoreText(false)
        setEditTextActive(false);
        setShowOptions(false);
        setEditedPostText(null);
    };

    const handleUndoEditedPostText = () => {
        if(editedPostText === text) return;
        setEditedPostText(text);
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

    const handleCreateComment = async () => {
        await query_create_comment(commentText)
            .then(({ error }) => {
                if(!error) {
                    setCreateCommentActive(false);
                    setCommentText('');
                };
            });
    };
    
    const createCommentViewAnimes = useAnimatedStyle(() => {
        return {
            backgroundColor: '#fff',
            height: createCommentActive ? withSpring(194, { stiffness: 99, damping: 15 }): 0,
            overflow: 'hidden',
            paddingTop: 16
        };
    });
    
    return(
        <Pressable onPress={() => Keyboard.dismiss()}>
            <Container>
                <Header>
                    <Pressable onPress={() => navigateToProfile()}>
                        <ProfileImage source={{ uri: profileImage ? profileImage : 'https://img.freepik.com/premium-vector/stethoscope-icon-flat-style-heart-diagnostic-vector-illustration-isolated-background-medicine-sign-business-concept_157943-866.jpg?w=2000' }} />
                    </Pressable>
                    <HeaderRight>
                        <HeaderTop>
                            <Pressable onPress={() => navigateToProfile()}>
                                <Username>{username}</Username>
                            </Pressable>
                            <Spacer />
                            { !showOptions && <Timestamp>{created_at}</Timestamp> }
                            { showOptions && is_post_owner && 
                                <>
                                    <TouchableOpacity style={{ marginRight: 18 }} onPress={() => handleDeletePost()}>
                                        <OptionText style={{ color: '#f34a4a' }}>Delete</OptionText>
                                    </TouchableOpacity>
                                    { !editTextActive && editedPostText !== text &&
                                        <TouchableOpacity style={{ marginRight: 16 }} onPress={() => handleEditTextActive()}>
                                            <OptionText style={{ color: '#6C65F6' }}>Edit</OptionText>
                                        </TouchableOpacity>
                                    }
                                    { editTextActive &&
                                        <TouchableOpacity style={{ marginRight: 16 }} onPress={() => handleUndoEditedPostText()}>
                                            <OptionText style={{ color: editedPostText !== text ? '#363636' : '#dedede' }}>Undo</OptionText>
                                        </TouchableOpacity>
                                    }
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

                    <Pressable onPress={() => setShowMoreText(!showMoreText)}>
                        <Body>
                            { !editTextActive &&
                                <PostText>
                                    {post_text}
                                    {text.length > 380 &&
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
                                    multiline={true}
                                    maxLength={3000}
                                    onChangeText={(value) => setEditedPostText(value)} 
                                    value={editedPostText} 
                                />
                            }
                        </Body>
                    </Pressable>

                <Footer>
                    <TouchableOpacity>
                        <Text style={{ color: '#6C65F6' }}>{total_likes} likes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => navigate_to_post()}>
                        <Text style={{ color: '#969696' }}>{total_comments} comments</Text>
                    </TouchableOpacity>

                    <Spacer />
                    
                    <ButtonGroup>
                        { !editTextActive &&
                            <>
                                <ButtonIcon style={{ backgroundColor: '#363636' }} onPress={() => setCreateCommentActive(!createCommentActive)}>
                                    <Ionicons name='ios-chatbubbles' color='#fff' size={17} />
                                </ButtonIcon>
                                <ButtonIcon style={{ backgroundColor: '#424242' }} onPress={() => handleLikePost()}>
                                    <AntDesign name='heart' color={ postIsLiked ? '#ef4a4a' : '#fff' } size={17} />
                                </ButtonIcon>
                            </>
                        }
                        { editTextActive &&
                            <>
                                { editedPostText === text &&
                                    <UpdatePostButton style={{ backgroundColor: '#363636' }} onPress={() => handleCancelEditPost()}>
                                        <Text style={{ color: '#fff', fontSize: 15 }}>Cancel</Text>
                                    </UpdatePostButton>
                                }
                                { editedPostText !== text &&
                                    <UpdatePostButton onPress={() => handleUpdatePost()}>
                                        <Text style={{ color: '#fff', fontSize: 15 }}>Update Post</Text>
                                    </UpdatePostButton>
                                }
                            </>
                        }
                    </ButtonGroup>
                </Footer>

                { createCommentActive &&
                    <Animated.View style={createCommentViewAnimes}>
                        <TextInput 
                            style={{ height: 130, paddingTop: 14 }}
                            multiline={true} 
                            placeholder='What would you like to say?' 
                            onChangeText={(value) => setCommentText(value)}
                        />
                        { commentText &&
                            <CreateCommentButton onPress={() => handleCreateComment()}>
                                <Text style={{ color: '#fff', fontSize: 15 }}>Reply to Post</Text>
                            </CreateCommentButton>
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
    margin: 12px 0;
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

const CreateCommentButton = styled.TouchableOpacity`
    align-items: center;
    background-color: #6C65F6;
    border-radius: 12px;
    min-width: 140px;
    margin-top: 10px;
    padding: 10px 32px;
`;