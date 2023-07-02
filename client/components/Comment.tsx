import styled from 'styled-components/native';
import { useState } from 'react';
import { Alert } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';

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
    query_update_comment: (a: string) => any,
    query_delete_comment: () => void,
    query_like_comment: () => void,
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

    const [showOptionsActive, setShowOptionsActive] = useState(false);
    const [editTextActive, setEditTextActive] = useState(false);
    const [updatedText, setUpdatedText] = useState(null);

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

    const handleUpdateComment = () => {
        query_update_comment(updatedText)
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
                    <ProfileImage source={{ uri: profile_image }} />
                    <UserInfo>
                        <Username>{username}</Username>
                        <Occupation>{occupation}</Occupation>
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
            { !editTextActive && <CommentText>{text}</CommentText> }
            { editTextActive && 
                <TextInput
                    multiline={true}
                    onChangeText={(value) => setUpdatedText(value)}
                    value={updatedText}
                />
            }
            <Footer>
                {!editTextActive && <Text style={{ color: '#6C65F6' }}>{total_comment_likes} likes</Text> }
                <Spacer />
                { !editTextActive && 
                    <ButtonIcon style={{ borderColor: comment_liked ? '#6C65F6' : '#6c65f64f' }} onPress={() => query_like_comment()}>
                        <AntDesign name='heart' color={ comment_liked ? '#6C65F6' : '#6c65f64f' } size={15} />
                    </ButtonIcon>
                }
                { editTextActive && 
                    <>
                        { updatedText === text &&
                            <UpdateCommentButton style={{ backgroundColor: '#363636' }} onPress={() => handleCancelUpdate()}>
                                <Text style={{ color: '#fff', fontSize: 15 }}>Cancel</Text>
                            </UpdateCommentButton>
                        }
                        { updatedText !== text &&
                            <UpdateCommentButton onPress={() => handleUpdateComment()}>
                                <Text style={{ color: '#fff', fontSize: 15 }}>Update Post</Text>
                            </UpdateCommentButton>
                        }
                    </>
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
    line-height: 19px;
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
    border-radius: 12px;
    min-width: 140px;
    overflow: hidden;
    padding: 7px 32px;
`;

const TouchableOpacity = styled.TouchableOpacity``;