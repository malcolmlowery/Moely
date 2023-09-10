import styled from 'styled-components/native';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { LinkPreview } from '@flyerhq/react-native-link-preview';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useCreatePostMutation } from '../../services/endpoints/post';

const CreatePost = () => {
    const router = useRouter();

    const [toggleAddUrllink, setToggleUrlLink] = useState(false);
    const [postData, setPostData] = useState({
        text: null,
        linkUrlText: null,
    });


    const [createPostQuery, { isLoading: isCreatingPost, error: errorCreatingPost, reset: resetCreatePostQuery }] = useCreatePostMutation();

    const handleCreatePost = () => {
        createPostQuery(postData)
            .then(({ data, error }: any) => {
                if(!error) {
                    router.back();
                } else {
                    return alert(error.data.message);
                };
            });
    };

    return(
        <>
            <Stack.Screen options={{ 
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name='close-circle' color='#000' size={24} />
                    </TouchableOpacity>
                ),
                headerRight: () => (
                    <>
                        { !postData.text &&
                            <Pressable>
                                <CreatePostText style={{ color: '#e1e1e1' }}>Create Post</CreatePostText>
                            </Pressable>
                        }
                        { postData.text &&
                            <TouchableOpacity onPress={() => !isCreatingPost && handleCreatePost()}>
                                { !isCreatingPost && <CreatePostText>Create Post</CreatePostText> }
                                { isCreatingPost && <CreatePostText>Creating post... 🚀</CreatePostText> }
                            </TouchableOpacity>
                        }
                    </>
                )
            }} />

            <Container contentContainerStyle={{ paddingBottom: 40 }}>
                <TextInput 
                    multiline={true}
                    maxLength={1200}
                    placeholder='What would you like to say?'
                    onChangeText={(value) => setPostData(prevState => ({ ...prevState, text: value}))}
                    textAlignVertical='top'
                    value={postData.text}
                />

                <Divider />

                <ActionItems>
                    { !postData.linkUrlText &&
                        <TouchableOpacity onPress={() => setToggleUrlLink(!toggleAddUrllink)}>
                            <FontAwesome name="chain" size={24} color="#d4d4d4" style={{ top: 1 }} />
                            <ActionItemText>Add URL Link</ActionItemText>
                        </TouchableOpacity>
                    }
                    { postData.linkUrlText &&
                        <TouchableOpacity onPress={() => {
                            setPostData(prevState => ({ ...prevState, linkUrlText: null }))
                            setToggleUrlLink(!toggleAddUrllink)
                        }}>
                            <FontAwesome name="chain" size={24} color="#d4d4d4" style={{ top: 1 }} />
                            <ActionItemText style={{ color: '#f64343'}}>Remove Link</ActionItemText>
                        </TouchableOpacity>
                    }
                </ActionItems>

                { toggleAddUrllink && 
                    <LinkTextInput 
                        placeholder='Add a website link here'
                        maxLength={130}
                        onChangeText={(value) => setPostData(prevState => ({ ...prevState, linkUrlText: value}))}
                    />
                }

                { postData.linkUrlText &&
                    <LinkPreviewContainer>
                        <LinkPreview 
                            enableAnimation={true} 
                            text={postData.linkUrlText}
                            renderText={(description) => (<LinkTitle>{description}</LinkTitle>)}
                            onPreviewDataFetched={(previewData => {
                                console.log(previewData)
                            })}
                         />
                    </LinkPreviewContainer>
                }
            </Container>
        </>
    );
};

export default CreatePost;

const CreatePostText = styled.Text`
    color: #3888ff;
    font-weight: 600;
    font-size: 15px;
`;

const Container = styled.ScrollView`
    background-color: #fff;
    flex: 1;
    padding: 16px;
`;

const TextInput = styled.TextInput`
    border-radius: 12px;
    color: #1f1f1f;
    font-size: 15px;
    line-height: 22px;
    min-height: 150px;
    max-height: 250px;
`;

const Divider = styled.View`
    background-color: #e4e4e4;
    height: 1px;
    margin-top: 20px;
    width: 100%;
`;

const LinkTitle = styled.Text`
    font-weight: 500;
    font-size: 14px;
`;

const ActionItems = styled.View`
    align-items: center;
    justify-content: flex-end;
    flex-direction: row;
    margin: 16px 0;
    width: 100%;
`;

const ActionItemText = styled.Text`
    color: #3888ff;
    font-weight: 500;
    font-size: 13px;
    margin-left: 6px;
`;

const LinkTextInput = styled.TextInput`
    background-color: #f0f0f0;
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 16px;
`;


const LinkPreviewContainer = styled.View`
    background-color: #eeeeee;
    border-radius: 12px;
    overflow: hidden;
`;

const TouchableOpacity = styled.TouchableOpacity`
    align-items: center;
    flex-direction: row;
`;

const Pressable = styled.Pressable`
    align-items: center;
    flex-direction: row;
`;