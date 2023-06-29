import styled from 'styled-components/native';
import { useState } from 'react';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Alert, Keyboard } from 'react-native';

interface CardI {
    post_id: string,
    is_post_owner: boolean,
    username: string,
    profileImage: string | null,
    occupation: string | null,
    timestamp: string | null,
    text: string,
    post_liked: boolean,
    number_of_post_likes: number,
    number_of_post_comments: number,
    navigate_to_post?: () => void,
    navigate_to_profile?: () => void,
    query_update_post: () => void,
    query_like_post: () => void,
    query_delete_post: () => void,
    query_report_post: () => void,
    query_hide_post: () => void,
};

const Card = ({
    post_id,
    is_post_owner,
    username,
    profileImage,
    occupation,
    timestamp,
    text,
    post_liked,
    number_of_post_likes,
    number_of_post_comments,
    navigate_to_post,
    navigate_to_profile,
    query_update_post,
    query_like_post,
    query_delete_post,
    query_report_post,
    query_hide_post,
}: CardI) => {
    const [showOptions, setShowOptions] = useState(false);
    const [editTextActive, setEditTextActive] = useState(false);
    const [editedPostText, setEditedPostText] = useState(null);
    const [showMoreText, setShowMoreText] = useState(false);
    const [postIsLiked, setPostIsLiked] = useState(post_liked);

    const post_text = text.length > 380 && !showMoreText ? `${text.slice(0, 380)}... ` : text + ' ';

    const handleUpdatePost = () => {
        query_update_post();
    };

    const handleLikePost = () => {
        query_like_post();
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

    const navigateToPost = () => navigate_to_post();
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

    return(
        <Pressable onPress={() => Keyboard.dismiss()}>
            <Container>
                <Pressable onPress={() => navigateToProfile()}>
                    <Header>
                        <ProfileImage source={{ uri: profileImage }} />
                        <HeaderRight>
                            <HeaderTop>
                                <Username>{username}</Username>
                                <Spacer />
                                { !showOptions && <Timestamp>{timestamp}</Timestamp> }
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
                            <HeaderBottom>
                                <Occupation>{occupation}</Occupation>
                            </HeaderBottom>
                        </HeaderRight>
                    </Header>
                </Pressable>

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
                        <Text style={{ color: '#6C65F6' }}>{number_of_post_likes} likes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => navigateToPost()}>
                        <Text style={{ color: '#969696' }}>{number_of_post_comments} comments</Text>
                    </TouchableOpacity>

                    <Spacer />
                    
                    <ButtonGroup>
                        { !editTextActive &&
                            <>
                                <ButtonIcon style={{ backgroundColor: '#363636' }} onPress={() => navigateToPost()}>
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