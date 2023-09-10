import styled from 'styled-components/native';
import { useEffect, useState } from 'react';
import { Keyboard, useWindowDimensions } from 'react-native';
import { BlurView } from 'expo-blur'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useHeaderHeight } from '@react-navigation/elements';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import Lottie from 'lottie-react-native';
import { useSegments } from 'expo-router';

interface BottomSheetI {
    isCreatingPost: boolean,
    createPostViewActive: boolean,
    dismissBottomSheet: () => void
    query_create_post: (text: string) => void,
};

const BottomSheet = ({ createPostViewActive, dismissBottomSheet, isCreatingPost, query_create_post }: BottomSheetI) => {
    const segments = useSegments();
    
    const { height: screen_height } = useWindowDimensions();
    const header_height = useHeaderHeight();
    const tabbar_height = segments[1] === 'profile' || segments[1] === 'post' ? 0 : useBottomTabBarHeight();
    
    const [keyboardData, setKeyboardData] = useState({ keyboard_height: 0, keyboard_active: false });
    const [text, setText] = useState('');

    const bottomSheetAnimes = useAnimatedStyle(() => {
        return {
            position: 'absolute',
            padding: 10,
            paddingBottom: segments[1] === 'profile' && !keyboardData.keyboard_active ? 90 : 10,
            width: '100%',
            zIndex: 999,
            opacity: createPostViewActive ? withTiming(1) : withTiming(0),
            bottom: keyboardData.keyboard_active ? 
                withSpring(keyboardData.keyboard_height - tabbar_height, { stiffness: 40, damping: 50, mass: .1 }) : 
                withSpring(0, { stiffness: 67, damping: 13 }), 
            height: keyboardData.keyboard_active ? 
                withSpring(screen_height - keyboardData.keyboard_height - header_height - 2, { stiffness: 43, damping: 100, mass: .1 }) : 
                withSpring(screen_height - header_height - tabbar_height - 2, { stiffness: 67, damping: 13 }),
        };
    });

    const bottomSheetBlurAnimes = useAnimatedStyle(() => {
        return {
            height: '100%',
            position: 'absolute',
            opacity: createPostViewActive ? withTiming(1) : withTiming(0),
            width: '100%',
            zIndex: 999,
        };
    });

    useEffect(() => {
        if(!createPostViewActive) {
            setText('');
        };
    }, [createPostViewActive]);

    useEffect(() => {
        const keyboard_will_show = Keyboard.addListener('keyboardWillShow', listener => {
            setKeyboardData({ keyboard_height: listener.endCoordinates.height, keyboard_active: true })
        });

        const keyboard_will_hide = Keyboard.addListener('keyboardWillHide', (_) => {
            setKeyboardData({ keyboard_height: 0, keyboard_active: false })
        });

        return () => {
            keyboard_will_show.remove();
            keyboard_will_hide.remove();
        };
    }, []);

    const handleCreatePost = () => {
        if(text !== '') {
            query_create_post(text.trim());
        };
    };

    return(
        <>
            {createPostViewActive && 
                <>
                <Animated.View style={bottomSheetBlurAnimes}>
                    <BlurView tint='light' intensity={60} style={{ height: '100%', width: '100%' }} />
                </Animated.View>
                <Animated.View style={bottomSheetAnimes}>
                    <Content>
                        <BlurView tint='light' intensity={80} style={{ height: '100%', position: 'absolute', width: '100%' }} />
                        <Title>What would you like to say?</Title>

                        <TextInput 
                            multiline={true} 
                            placeholder='Say something...' 
                            onChangeText={(value) => setText(value)} 
                            value={text} 
                        />

                        <ActionItems>
                            <TouchableOpacity style={{ backgroundColor: '#f34a4a' }} onPress={() => dismissBottomSheet()}>
                                <ButtonText>Close</ButtonText>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleCreatePost()}>
                                { !isCreatingPost && <ButtonText>Create Post</ButtonText> }
                                { isCreatingPost &&
                                    <>
                                        <ButtonText style={{ left: 3 }}>Please wait...</ButtonText>
                                        <Lottie autoPlay style={{ height: 35, right: 3, top: -3, width: 35 }} source={require('../assets/animations/loading_anime_white_01.json')} />
                                    </>
                                }
                            </TouchableOpacity>
                        </ActionItems>
                    </Content>
                </Animated.View>
                </>
            }
        </>
    );
};

export default BottomSheet;

const Content = styled.View`
    background-color: rgba(255,255,255, 0.9);
    border-radius: 16px;
    border-color: #eaeaea;
    border-width: 1px;
    flex: 1;
    overflow: hidden;
`;

const Title = styled.Text`
    align-self: center;
    font-size: 17px;
    font-weight: 500;
    margin: 16px;
    margin-top: 24px;
`;

const TextInput = styled.TextInput`
    border-color: #eaeaea;
    border-bottom-width: 1px;
    color: #1f1f1f;
    font-size: 15px;
    height: 350px;
    margin: 0 16px;
    flex: 1;
`;

const ActionItems = styled.View`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    margin: 16px;
`;

const TouchableOpacity = styled.TouchableOpacity`
    align-items: center;
    background-color: #1f1f1f;
    border-radius: 30px;
    flex-direction: row;
    justify-content: center;
    padding: 12px 20px;
`;

const ButtonText = styled.Text`
    color: #fff;
    font-weight: 500;
    font-size: 14px;
`;