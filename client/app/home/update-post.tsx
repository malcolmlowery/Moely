import styled from 'styled-components/native';
import { Stack, useRouter, useSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { LinkPreview } from '@flyerhq/react-native-link-preview';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useGetPostQuery, useUpdatePostMutation } from '../../services/endpoints/post';

const UpdatePost = () => {
    const router = useRouter();
    const { post_id, user_profile_uid } = useSearchParams();

    const [toggleAddUrl, setToggleAddUrl] = useState(false);
    const [postData, setPostData] = useState({ text: null, url_link: null, post_id: null, user_profile_uid });

    const { data: post_data, isLoading: isLoadingPostData, isError: isErrorLoadingPost, refetch: refetchPost } = useGetPostQuery({ post_id }, { refetchOnMountOrArgChange: true });
    const [updatePostQuery, { isLoading: isUpdatingPost, error: errorUpdatingPost }] = useUpdatePostMutation();

    const handleUpdatePost = () => {
        updatePostQuery(postData)
            .then(({ data, error }: any) => {
                if(!error) {
                    router.back();
                } else {
                    return alert(error.data.message);
                };
            });
    };

    useEffect(() => {
        setPostData(prevState => ({ ...prevState, text: post_data?.text, url_link: post_data?.url_link, post_id: post_data?.post_id }))
    }, [post_data])

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
                                <CreatePostText style={{ color: '#e1e1e1' }}>Update Post</CreatePostText>
                            </Pressable>
                        }
                        { postData.text &&
                            <TouchableOpacity onPress={() => !isUpdatingPost && handleUpdatePost()}>
                                { !isUpdatingPost && <CreatePostText>Update Post</CreatePostText> }
                                { isUpdatingPost && <CreatePostText>Updating post... 🚀</CreatePostText> }
                            </TouchableOpacity>
                        }
                    </>
                )
            }} />

            { post_data &&
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
                        { !postData.url_link &&
                            <TouchableOpacity onPress={() => setToggleAddUrl(!toggleAddUrl)}>
                                <FontAwesome name="chain" size={24} color="#d4d4d4" style={{ top: 1 }} />
                                <ActionItemText>Add URL Link</ActionItemText>
                            </TouchableOpacity>
                        }
                        { postData.url_link &&
                            <TouchableOpacity onPress={() => {
                                setPostData(prevState => ({ ...prevState, url_link: null }))
                                setToggleAddUrl(!toggleAddUrl)
                            }}>
                                <FontAwesome name="chain" size={24} color="#d4d4d4" style={{ top: 1 }} />
                                <ActionItemText style={{ color: '#f64343'}}>Remove Link</ActionItemText>
                            </TouchableOpacity>
                        }
                    </ActionItems>

                    { toggleAddUrl && 
                        <LinkTextInput 
                            placeholder='Add a website link here'
                            maxLength={130}
                            onChangeText={(value) => setPostData(prevState => ({ ...prevState, url_link: value }))}
                        />
                    }

                    { postData.url_link &&
                        <LinkPreview 
                            containerStyle={{ backgroundColor: '#eeeeee', borderRadius: 12 }}
                            enableAnimation={true} 
                            text={postData.url_link}
                            renderHeader={() => null}
                            renderText={() => null}
                            renderTitle={() => null}
                            renderLinkPreview={({ aspectRatio, previewData, containerWidth }) => {
                                return(
                                    <LinkImagePreviewContainer>
                                        { previewData?.title && <LinkTitle>{previewData?.title}</LinkTitle> }
                                        { !previewData?.description && <LinkTitle>{previewData?.link}</LinkTitle> }
                                        { previewData?.description && <LinkDescription>{previewData?.description}</LinkDescription> }
                                        { previewData?.image &&
                                            <LinkImagePreview style={{ aspectRatio, borderRadius: 8 }} source={{ uri: previewData?.image.url }} />
                                        }
                                    </LinkImagePreviewContainer>
                                )
                            }}
                        />
                    }
                </Container>
            }
        </>
    );
};

export default UpdatePost;

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
    max-height: 350px;
`;

const Divider = styled.View`
    background-color: #e4e4e4;
    height: 1px;
    margin-top: 20px;
    width: 100%;
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

const TouchableOpacity = styled.TouchableOpacity`
    align-items: center;
    flex-direction: row;
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

const Pressable = styled.Pressable`
    align-items: center;
    flex-direction: row;
`;