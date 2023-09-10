import styled from 'styled-components/native';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import Lottie from 'lottie-react-native';
import * as Device from 'expo-device';

interface CommentI {
    comment_id?: string,
    timestamp: number | string,
    username: string,
    occupation: string | null,
    profile_image: string | null,
    is_comment_owner: boolean,
    text: string,
    comment_liked: boolean,
    total_comment_likes: number,
    navigate_to_profile: () => void,
    query_update_comment: (a: string) => Promise<any>,
    query_delete_comment: () => void,
    query_like_comment: (a: any) => Promise<any>,
    query_report_comment: () => void,
    query_hide_comment: () => void,
};

const Comment = ({
    comment_id,
    timestamp,
    username,
    occupation,
    profile_image,
    is_comment_owner,
    text,
    comment_liked,
    total_comment_likes,
    navigate_to_profile,
    query_update_comment,
    query_delete_comment,
    query_like_comment,
    query_report_comment,
    query_hide_comment,
}: CommentI) => {
    const device_brand = Device.brand;

    const [showMoreText, setShowMoreText] = useState(false);
    const [showOptionsActive, setShowOptionsActive] = useState(false);
    const [editTextActive, setEditTextActive] = useState(false);
    const [updatedText, setUpdatedText] = useState(null);
    const [commentIsLiked, setCommentIsLiked] = useState(null);
    const [isUpdatingComment, setIsUpdatingComment] = useState(false);
    const [isLikingComment, setIsLikingComment] = useState(false);

    const comment_text = text.length > 380 && !showMoreText ? `${text.slice(0, 380)}... ` : text + ' ';

    useEffect(() => {
        setCommentIsLiked(comment_liked)
    }, [comment_liked])

    const toggleShowOptions = () => {
        setUpdatedText(null);
        setEditTextActive(false);
        setShowOptionsActive(!showOptionsActive);
    };

    const toggleEditPost = () => {
        setUpdatedText(text);
        setEditTextActive(true);
    };

    const handleUndoEditedCommentText = () => {
        setUpdatedText(text);
    };

    const handleCancelUpdate = () => {
        setUpdatedText(null);
        setShowOptionsActive(false);
        setEditTextActive(false);
    };

    const handleUpdateComment = async () => {
        setIsUpdatingComment(true);
        await query_update_comment(updatedText)
            .then(({ error }) => {

                setIsUpdatingComment(false);

                if(!error) {
                    setEditTextActive(false);
                    setUpdatedText(null);
                    setShowOptionsActive(false);
                };
            })
    };

    const handleLikeComment = () => {
        setIsLikingComment(true);
        setCommentIsLiked(!commentIsLiked)
        query_like_comment(!commentIsLiked)
            .then(() => setIsLikingComment(false))
    };

    const handleDeleteComment = () => {
        Alert.alert(
            'Delete Comment',
            'Are you sure you want to delete this comment?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'YES',
                    style: 'destructive',
                    onPress: () => query_delete_comment()
                },
            ],
        );
    };

    const handleHideReportCommentOptions = () => {
        Alert.alert(
            'Comment Actions',
            'Is there something wrong with this comment?',
            [
                {
                    text: 'Report comment',
                    style: 'destructive',
                    onPress: () => query_report_comment()
                },
                {
                    text: 'Hide comment',
                    style: 'default',
                    onPress: () => query_hide_comment()
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
        <Container>
            <Header>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => navigate_to_profile()}>
                    { profile_image ?
                        <ProfileImage source={{ uri: profile_image }} /> :
                        <ProfileImage source={require('../assets/images/profile_image_placeholder_01.png')} />
                    }
                    <UserInfo>
                        <Username>{username}</Username>
                        { occupation && <Occupation>{occupation}</Occupation>}
                    </UserInfo>
                </TouchableOpacity>
                <Spacer />
                { !showOptionsActive && <Timestamp>{timestamp}</Timestamp> }
                { showOptionsActive &&
                    <>
                        <TouchableOpacity style={{ marginRight: 16 }} onPress={() => handleDeleteComment()}>
                            <Text style={{ color: '#f34a4a' }} >Delete</Text>
                        </TouchableOpacity>
                        { !editTextActive && 
                            <TouchableOpacity style={{ marginRight: 16 }} onPress={() => toggleEditPost()}>
                                <Text style={{ color: '#6C65F6' }}>Edit</Text>
                            </TouchableOpacity>
                        }
                        { editTextActive &&
                            <TouchableOpacity style={{ marginRight: 16 }} onPress={() => handleUndoEditedCommentText()}>
                                <Text style={{ color: updatedText !== text ? '#363636' : '#dedede' }}>Undo</Text>
                            </TouchableOpacity>
                        }
                    </>
                }
                { is_comment_owner &&
                    <TouchableOpacity onPress={() => toggleShowOptions()}>
                        <AntDesign name='ellipsis1' color='#BBB' size={26} />
                    </TouchableOpacity>
                }
                { !is_comment_owner &&
                    <TouchableOpacity onPress={() => handleHideReportCommentOptions()}>
                        <Ionicons name='md-alert-circle' color='#363636' size={17} />
                    </TouchableOpacity>
                }
            </Header>

            { !editTextActive && 
                <Pressable onPress={() => setShowMoreText(!showMoreText)}>
                        {/* <Body> */}
                            { !editTextActive &&
                                <CommentText>
                                    {comment_text}
                                    {text.length > 380 &&
                                        <TouchableOpacity onPress={() => setShowMoreText(!showMoreText)}>
                                            <Text style={{ color: '#4f8fee', fontSize: 13 }}>
                                                {showMoreText ? 'show less' : 'show more'}
                                            </Text>
                                        </TouchableOpacity>
                                    }
                                </CommentText>
                            }
                        {/* </Body> */}
                </Pressable>
            }

            { editTextActive && 
                <TextInput
                    style={{ paddingTop: device_brand === 'Apple' ? 8 : 18  }}
                    maxLength={800}
                    multiline={true}
                    onChangeText={(value) => setUpdatedText(value)}
                    textAlignVertical='top'
                    value={updatedText}
                />
            }

            <Footer>
                { !editTextActive && 
                    <>
                        <Text style={{ color: '#6C65F6' }}>{total_comment_likes} likes</Text> 
                        <Spacer />
                    </>
                }


                { !editTextActive && 
                    <ButtonIcon style={{ borderColor: commentIsLiked ? '#6C65F6' : '#6c65f64f' }} onPress={() => !isLikingComment && handleLikeComment()}>
                        <AntDesign name='heart' color={ commentIsLiked ? '#6C65F6' : '#6c65f64f' } size={15} />
                    </ButtonIcon>
                }

                { editTextActive && !isUpdatingComment && 
                    <>
                        { updatedText === text &&
                            <UpdateCommentButton style={{ backgroundColor: '#363636' }} onPress={() => handleCancelUpdate()}>
                                <Text style={{ color: '#fff', fontSize: 13 }}>Cancel</Text>
                            </UpdateCommentButton>
                        }
                        { updatedText !== text &&
                            <UpdateCommentButton onPress={() => !isUpdatingComment && handleUpdateComment()}>
                                <Text style={{ color: '#fff', fontSize: 13 }}>Update Post</Text>
                            </UpdateCommentButton>
                        }
                    </>
                }

                { isUpdatingComment &&
                    <UpdateCommentButton style={{ backgroundColor: '#363636', flexDirection: 'row', flex: 1, justifyContent: 'center', minWidth: '100%' }}>
                        <ButtonText style={{ fontSize: 13, fontWeight: '600', left: 3 }}>Please wait...</ButtonText>
                        { device_brand === 'Apple' && <Lottie autoPlay style={{ height: 35, right: 5, top: -3, width: 35 }} source={require('../assets/animations/loading_anime_white_01.json')} /> }
                    </UpdateCommentButton>
                }
            </Footer>
        </Container>
    );
};

export default Comment;

const Text = styled.Text`
    font-size: 13px;
    font-weight: 500;
`;

const Container = styled.View`
    background-color: #fff;
    border-radius: 12px;
    margin: 6px 8px;
    padding: 16px;
`;

const Spacer = styled.View`
    flex: 1;
`;

const Header = styled.View`
    align-items: center;
    flex-direction: row;
`;

const ProfileImage = styled.Image`
    border-radius: 20px;
    height: 35px;
    width: 35px;
`;

const UserInfo = styled.View`
    margin-left: 10px;
`;

const Username = styled.Text`
    font-weight: 500;
`;

const Occupation = styled.Text`
    color: #969696;
    font-size: 13px;
`;

const Timestamp = styled.Text`
    color: #969696;
    font-size: 13px;
    margin-right: 10px;
`;

const CommentText = styled.Text`
    line-height: 20px;
    margin-top: 10px;
`;

const Footer = styled.View`
    align-items: center;
    flex-direction: row;
    margin-top: 10px;
`;

const ButtonIcon = styled.TouchableOpacity`
    align-items: center;
    border-radius: 12px;
    border-width: 1px;
    border-style: solid;
    padding: 7px 0;
    width: 100px;
`;

const TextInput = styled.TextInput`
    background-color: #efefef;
    border-radius: 12px;
    color: #1f1f1f;
    font-size: 14px;
    line-height: 22px;
    max-height: 200px;
    margin-top: 14px;
    margin-bottom: 5px;
    padding: 14px 16px;
    padding-top: 8px;
`;

const UpdateCommentButton = styled.TouchableOpacity`
    align-items: center;
    background-color: #6C65F6;
    border-radius: 10px;
    flex: 1;
    overflow: hidden;
    padding: 12px 32px;
`;

const TouchableOpacity = styled.TouchableOpacity``;

const ButtonText = styled.Text`
    color: #fff;
    font-weight: 500;
    font-size: 14px;
`;

const Pressable = styled.Pressable`
    margin-top: 6px;
`;