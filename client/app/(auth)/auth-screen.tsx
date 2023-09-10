import styled from 'styled-components/native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Lottie from 'lottie-react-native';

// Firebase
import { auth, sendPasswordResetEmail, signInWithEmailAndPassword } from '../../services/firebase';
import { verifyEmail } from '../../utils/verify_email';

// RTK Query
import { useCreateUserMutation } from '../../services/endpoints/user_settings_info';

const AuthScreen = () => {
    const router = useRouter();
    
    const { height: screen_height, width: screen_width } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const [createUserAccount, { isLoading, isError }] = useCreateUserMutation();
    
    const [createAccountActive, setCreateAccountActive] = useState(false);
    const [textInputActiveIndex, setTextInputActiveIndex] = useState(null);
    const [forgotPassword, setForgotPassword] = useState(false);
    const [passwordResetSentSuccess, setPasswordResetSentSuccess] = useState(false);

    const [userInfo, setUserInfo] = useState({
        firstname: undefined,
        lastname: undefined,
        password: undefined,
        email: undefined,
    });

    const containerStyleAnimes = useAnimatedStyle(() => {
        return {
                flex: 1,
                marginTop: createAccountActive && screen_width >= 430 ? withSpring(-50) : !createAccountActive && withSpring(0),
                top: screen_width >= 430 ? 115 : 70,
        };
    });

    const textInputStyleAnimes = useAnimatedStyle(() => {
        return {
            opacity: createAccountActive ? withTiming(1) : withTiming(0),
        };
    });

    const handleAuthenticatingAccount = async () => {
        const { firstname, lastname, email, password } = userInfo

        if(!createAccountActive) {
            if(!email || !password) {
                return alert('All fields are required to log in. Please try again.')
            } else {
                // Log User In
                signInWithEmailAndPassword(auth, email, password)
                    .catch(error => alert('Invalid account credentials. Please try again. 🚨'))
            }
        }

        if(createAccountActive) {
            if(!firstname || !lastname || !email || !password) {
                return alert('Please fields are required. Please try again.')
            } else {
                // Verify Email & Create User Account
                // const { isValid, message } = await verifyEmail(email)
                //    .then(result => result)
                //    .catch(error => alert(error))

                // if(!isValid) return alert(message)
                
                createUserAccount({ username: `${firstname} ${lastname}`, email, password })
                    .then(({ error }: any ) => {
                        if(error?.data.error === true) return alert('Invalid account credentials. Please try again. ⚠️')
                        signInWithEmailAndPassword(auth, email, password)
                            .catch(error => alert('Invalid account credentials. Please try again. ⚠️'))
                    }).catch(error => console.log(error))
            }
        }
    };

    const handlePasswordReset = async () => {
        sendPasswordResetEmail(auth, userInfo.email)
            .then(() => {
                setPasswordResetSentSuccess(true)
                setTimeout(() => {
                    setPasswordResetSentSuccess(false)
                }, 5000);
                setForgotPassword(false)
            })
            .catch(error => console.log(error))
    };
     
    return (
        <>
            <LinearGradient colors={['#fff', 'rgba(255,255,255,0)']} style={{ height: 80, left: 0, position: 'absolute', right: 0, zIndex: 1000 }} />
            <LinearGradient colors={['rgba(255,255,255,0)', '#fff']} style={{ bottom: 0, height: 80, left: 0, position: 'absolute', right: 0, zIndex: 1000 }} />
            
            <KeyboardAwareScrollView 
                showsVerticalScrollIndicator={false}
                extraScrollHeight={screen_width > 375 ? 40 : 0 } 
                contentContainerStyle={{ paddingTop: screen_width > 500 ? insets.top + 250 : insets.top + 14, paddingBottom: screen_width >= 430 ? 220 : 180, width: screen_width > 500 ? 500 : '100%', alignSelf: screen_width > 500 && 'center' }}>
                <Animated.View style={containerStyleAnimes}>
                    <Header>
                        <AppLongLogo source={require('../../assets/logos/logo-01.png')} />
                        <HeaderDivider />
                        <HeaderSubText style={{ fontSize: screen_width > 375 ? 14 : 12, width: screen_width > 375 ? 200 : '100%' }}>A Social Network for Medical Professionals</HeaderSubText>
                    </Header>

                    <LineDivider />

                    <ActionTitleView>
                        <ActionTitle>{createAccountActive ? 'Register' : 'Sign In'}</ActionTitle>
                    </ActionTitleView>

                    <Form>
                        { createAccountActive &&
                            <Animated.View style={textInputStyleAnimes}>
                                <TextInputItem style={{ borderColor: textInputActiveIndex === 2 ? '#6C66F6' : '#e3e3e3' }}>
                                    <TextInput 
                                        maxLength={32}
                                        onFocus={() => setTextInputActiveIndex(2)} 
                                        onBlur={() => setTextInputActiveIndex(null)}
                                        placeholder='First Name'
                                        onChangeText={(value) => setUserInfo(prevState => ({ ...prevState, firstname: value.trim() }))} 
                                        value={userInfo.firstname} />
                                    <Ionicons name='person-circle' color='#414141' size={32} />
                                </TextInputItem>
                                <TextInputItem style={{ borderColor: textInputActiveIndex === 3 ? '#6C66F6' : '#e3e3e3' }}>
                                    <TextInput 
                                        maxLength={42}
                                        onFocus={() => setTextInputActiveIndex(3)} 
                                        onBlur={() => setTextInputActiveIndex(null)}
                                        placeholder='Last Name'
                                        onChangeText={(value) => setUserInfo(prevState => ({ ...prevState, lastname: value.trim() }))} 
                                        value={userInfo.lastname} />
                                    <Ionicons name='person-circle' color='#414141' size={32} />
                                </TextInputItem>
                            </Animated.View>
                        }

                        <TextInputItem style={{ borderColor: textInputActiveIndex === 0 ? '#6C66F6' : '#e3e3e3' }}>
                            <TextInput 
                                maxLength={321}
                                onFocus={() => setTextInputActiveIndex(0)} 
                                onBlur={() => setTextInputActiveIndex(null)}
                                placeholder='Email'
                                onChangeText={(value) => setUserInfo(prevState => ({ ...prevState, email: value.trim() }))} 
                                value={userInfo.email} />
                            <Ionicons name='mail' color='#414141' size={28} />
                        </TextInputItem>
                        <TextInputItem style={{ borderColor: textInputActiveIndex === 1 ? '#6C66F6' : '#e3e3e3' }}>
                            <TextInput 
                                maxLength={300}
                                onFocus={() => setTextInputActiveIndex(1)} 
                                onBlur={() => setTextInputActiveIndex(null)}
                                secureTextEntry={true}
                                placeholder='Password'
                                onChangeText={(value) => setUserInfo(prevState => ({ ...prevState, password: value.trim() }))} 
                                value={userInfo.password} />
                            <FontAwesome name='lock' color='#414141' size={28} style={{ right: 5 }} />
                        </TextInputItem>

                        { screen_height < 812 && 
                            <ActionButtonsContainer>
                                <ActionButton onPress={() => setCreateAccountActive(!createAccountActive)}>
                                    <ActionButtonText style={{ color: '#6C66F6', fontWeight: 500 }}>
                                        {createAccountActive ? 'Have an Account: Login' : 'Join our Community'}
                                    </ActionButtonText>
                                </ActionButton>
                                <ActionButton>
                                    <ActionButtonText style={{ fontWeight: '500' }}>Forgot Password</ActionButtonText>
                                </ActionButton>
                            </ActionButtonsContainer>
                        }

                        { screen_height >= 812 &&
                            <ActionButton style={{ alignSelf: 'flex-end', right: 16 }}>
                                <ActionButtonText style={{ fontWeight: '500' }}>Forgot Password</ActionButtonText>
                            </ActionButton>
                        }

                        <SubmitButton onPress={() => !isLoading && handleAuthenticatingAccount()} style={{ backgroundColor: isLoading ? '#1f1f1f' : '#6C66F6' }}>
                            { isLoading && 
                                <Lottie 
                                    autoPlay 
                                    style={{ height: 35, width: 35 }} 
                                    source={require('../../assets/animations/loading_anime_white_01.json')} />
                            }
                            { !isLoading && <Ionicons name='arrow-forward' color='#fff' size={32} />}
                        </SubmitButton>
                    </Form>

                    <LegalBox style={{ top: screen_width > 375 ? 40 : 25 }}>
                        { screen_height >= 812 &&
                            <ActionButton onPress={() => setCreateAccountActive(!createAccountActive)}>
                                <ActionButtonText style={{ 
                                    color: '#6C66F6', 
                                    fontSize: 16, 
                                    fontWeight: 500, 
                                    marginBottom: 20, 
                                    textAlign: 'center' }}>
                                        {createAccountActive ? 
                                            <LoginActionText style={{ fontWeight: 400 }}>Have an Acount - 
                                                <LoginActionText style={{ color: '#6C66F6', fontWeight: 600 }}> Login</LoginActionText>
                                            </LoginActionText> : 
                                            <LoginActionText style={{ color: '#6C66F6', fontWeight: 600 }}>Join our Community</LoginActionText>
                                        }
                                </ActionButtonText>
                            </ActionButton>
                        }
                        <Text style={{ top: screen_width > 375 ? 10 : 3 }}>
                            By signing up, you agree to the
                            <TermsButton onPress={() => router.push('terms-conditions')}>
                                <Text style={{ color: '#6C66F6', fontWeight: 500, top: 3 }}> Terms of Service </Text>
                            </TermsButton> 
                            <Text>and </Text>
                            <TermsButton onPress={() => router.push('privacy-policy')}>
                                <Text style={{ color: '#6C66F6', fontWeight: 500, top: 3 }}>Privacy Policy.</Text>
                            </TermsButton> 
                        </Text>
                    </LegalBox>
                </Animated.View>
            </KeyboardAwareScrollView>
        </>
    );
};

export default AuthScreen;

const Header = styled.View`
    align-items: center;
`;

const AppLongLogo = styled.Image`
    height: 40px;
    overflow: visible;
    width: 60%;
`;

const HeaderDivider = styled.View`
    background-color: #6C66F6;
    border-radius: 8px;
    height: 4px;
    margin-bottom: 14px;
    margin-top: 26px;
    width: 100px;
`;

const HeaderSubText = styled.Text`
    color: #1f1f1f;
    font-size: 14px;
    font-weight: 500;
    line-height: 19px;
    letter-spacing: .1px;
    text-align: center;
    width: 200px;
`;

const LineDivider = styled.View`
    align-self: center;
    background-color: #dcdcdc;
    height: 1px;
    margin: 20px 0;
    width: 92%;
`;

const ActionTitleView = styled.View`
    border-radius: 16px;
    padding: 10px;
    margin: 0 16px;
    margin-bottom: 22px;
`;

const ActionTitle = styled.Text`
    color: #1f1f1f;
    font-size: 26px;
    font-weight: 600;
    text-align: center;
`;

const Form = styled.View`
    margin: 0 16px;
`;

const TextInputItem = styled.View`
    align-items: center;
    background-color: #e5e5e5;
    border-radius: 16px;
    border-width: 1px;
    flex-direction: row;
    margin-bottom: 20px;
    padding: 0 14px;
`;

const TextInput = styled.TextInput`
    flex: 1;
    font-size: 15px;
    font-weight: 500;
    padding: 20px 0;
`;

const ActionButtonsContainer = styled.View`
    flex-direction: row;
    justify-content: space-between;
    margin: 0 16px;
`;

const ActionButton = styled.TouchableOpacity``;

const ActionButtonText = styled.Text`
    color: #3b3b3b;
    font-size: 13px;
    margin-bottom: 30px;
`;

const SubmitButton = styled.TouchableOpacity`
    align-self: center;
    align-items: center;
    background-color: #6C66F6;
    border-radius: 100px;
    justify-content: center;
    height: 65px;
    width: 65px;
`;

const LegalBox = styled.View`
    align-self: center;
    max-width: 300px;
    top: 30px;
`;

const TermsButton = styled.TouchableOpacity``;

const Text = styled.Text`
    color: #333333;
    font-size: 12px;
    font-weight: 400;
    line-height: 19px;
    letter-spacing: .1px;
`;

const LoginActionText = styled.Text`
    color: #333333;
    font-size: 14px;
    font-weight: 300;
    line-height: 19px;
    letter-spacing: .1px;
`;






































// const [accountExists, setAccountExists] = useState(true);
    // const [keyboardActive, setKeyboardActive] = useState(false);
    // const [userInfo, setUserInfo] = useState(initialUserState);
    // const [forgotPassword, setForgotPassword] = useState(false);
    // const [passwordResetSentSuccess, setPasswordResetSentSuccess] = useState(false);
    // const [createUserAccount, { isError, isLoading, isSuccess }] = useCreateUserMutation();

    // const containerViewAnimes = useAnimatedStyle(() => {
    //     return {
    //        top: forgotPassword ? withSpring(40) : withSpring(-30)
    //     }
    //  });
  
    // const inputTextAnimes = useAnimatedStyle(() => {
    // return {
    //     opacity: accountExists ? withTiming(0, { duration: 100 }) : withTiming(1, { duration: 500 })
    // }
    // });

    // const inputGroupViewAnimes = useAnimatedStyle(() => {
    //     return {
    //         marginTop: accountExists ? withSpring(-140) : withSpring(-45),
    //         marginBottom: accountExists ? withSpring(0) : withSpring(-20),
    //         top: forgotPassword ? withTiming(-10) : withTiming(0),
    //     }
    // });

    // const emailInputItemAnimes = useAnimatedStyle(() => {
    //     return {
    //         opacity: forgotPassword ?  withTiming(0, { duration: 200 }) : withTiming(1),
    //         marginTop: forgotPassword ?  withTiming(-70, { duration: 200 }) : withSpring(0),
    //         zIndex: -1
    //     }
    // });

    // const logoContainerViewAnimes = useAnimatedStyle(() => {
    //     return {
    //         top: 
    //             accountExists && !forgotPassword ? withSpring(10) : withSpring(0) && 
    //             forgotPassword ? withSpring(90) : withSpring(-30),
    //     }
    // });

    // const forgotPasswordTextAnimes = useAnimatedStyle(() => {
    //     return {
    //         opacity: accountExists ? withTiming(1) : withTiming(0),
    //         left: accountExists ? withTiming(0) : withTiming(50),
    //         marginBottom: forgotPassword ?  withTiming(30, { duration: 200 }) : withSpring(40),
    //     }
    // });

    // const keyboardActiveFadeOutAnimes = useAnimatedStyle(() => {
    //     return {
    //         opacity: keyboardActive ? withTiming(0, { duration: 200 }) : withTiming(1, { duration: 600 })
    //     }
    // });

    // const needAnAcccountTextAnimes = useAnimatedStyle(() => {
    //     return {
    //         opacity: forgotPassword ? withTiming(0, { duration: 200 }) : withTiming(1, { duration: 600 })
    //     }
    // });

    // useEffect(() => {
    //     const keyboardWillShowSubscription = Keyboard.addListener('keyboardWillShow', () => {
    //         setKeyboardActive(true)
    //     })

    //     const keyboardWillHideSubscription = Keyboard.addListener('keyboardWillHide', () => {
    //         setKeyboardActive(false)
    //     })

    //     return () => {
    //         keyboardWillShowSubscription.remove()
    //         keyboardWillHideSubscription.remove()
    //     }
    // }, []);

    // const handleCreateUserAccount = async () => {
    //     const { firstname, lastname, email, password } = userInfo

    //     if(accountExists) {
    //         if(!email || !password) {
    //             return alert('All fields are required to log in. Please try again.')
    //         } else {
    //             // Log User In
    //             signInWithEmailAndPassword(auth, email, password)
    //                 .catch(error => alert(error))
    //         }
    //     }

    //     if(!accountExists) {
    //         if(!firstname || !lastname || !email || !password) {
    //             return alert('Please fields are required. Please try again.')
    //         } else {
    //             // Verify Email & Create User Account
    //             // const { isValid, message } = await verifyEmail(email)
    //             //    .then(result => result)
    //             //    .catch(error => console.log(error))

    //             // if(!isValid) return console.log(message)
    //             createUserAccount({ username: `${firstname} ${lastname}`, email, password })
    //                 .then(({ error }: any ) => {
    //                     if(error?.data.error === true) return alert(error?.data.message)
    //                     signInWithEmailAndPassword(auth, email, password)
    //                         .catch(error => alert(error))
    //                 }).catch(error => console.log(error))
    //         }
    //     }
    // };

    // const handlePasswordReset = async () => {
    //     sendPasswordResetEmail(auth, userInfo.email)
    //         .then(() => {
    //             setPasswordResetSentSuccess(true)
    //             setTimeout(() => {
    //                 setPasswordResetSentSuccess(false)
    //             }, 5000);
    //             setForgotPassword(false)
    //         })
    //         .catch(error => console.log(error))
    // };

// <Animated.View style={containerViewAnimes}>
//     <Container>
//     <Animated.View style={logoContainerViewAnimes}>
//         <LogoContainer>
//             <Logo source={require('../../assets/logos/logo-01.png')} />
//             <LogoSpan/>
//             <LogoText>a medical social network</LogoText>
//         </LogoContainer>
//     </Animated.View>

//     <Animated.View style={inputGroupViewAnimes}>
//         <InputGroup>
//             <Animated.View style={inputTextAnimes}>
//                 <TextInput 
//                 icon='id-card-alt' 
//                 placeholder='first name' 
//                 onChangeText={(value) => setUserInfo(prevState => ({ ...prevState, firstname: value.trim() }))} 
//                 value={userInfo.firstname}/>
//                 <TextInput 
//                 icon='id-card-alt' 
//                 placeholder='last name' 
//                 onChangeText={(value) => setUserInfo(prevState => ({ ...prevState, lastname: value.trim() }))} 
//                 value={userInfo.lastname}/>
//             </Animated.View>

//             <TextInput 
//                 autoCorrect={false}
//                 autoCompleteType='email' 
//                 icon='envelope-open-text' 
//                 keyboardType='email-address' 
//                 onChangeText={(value) => setUserInfo(prevState => ({ ...prevState, email: value.trim() }))}
//                 placeholder='email' 
//                 spellCheck={false}
//                 textContentType='emailAddress' 
//                 value={userInfo.email} />
                
//             <Animated.View style={[emailInputItemAnimes]}>
//                 <TextInput 
//                     autoCompleteType='password' 
//                     icon='lock' 
//                     onChangeText={(value) => setUserInfo(prevState => ({ ...prevState, password: value.trim() }))}
//                     placeholder='password' 
//                     secureTextEntry={true} 
//                     textContentType='password'
//                     value={userInfo.password} /> 
//             </Animated.View>

//             <Animated.View style={forgotPasswordTextAnimes}>
//                 {!passwordResetSentSuccess && 
//                 <Button 
//                     buttonType='text-only'
//                     fontSize={14}
//                     fontWeight='500'
//                     textColor={forgotPassword ? '#F45D51' : '#B9B9B9'}
//                     onPress={() => setForgotPassword(!forgotPassword)}
//                     style={{ 
//                         alignSelf: forgotPassword ? 'center' : 'flex-end',
//                         marginRight: !forgotPassword && 16 }}>{forgotPassword ? 'Cancel' : 'forgot password'}</Button> 
//                 }
//                 {passwordResetSentSuccess && 
//                 <Button 
//                     buttonType='text-only'
//                     fontSize={14}
//                     fontWeight='500'
//                     textColor='green'
//                     style={{ alignSelf: 'center'}}>Password reset email sent!</Button> 
//                 }
//             </Animated.View>
//         </InputGroup>
//     </Animated.View>
    
//     {/* <Animated.View style={loginActionButtonAnimes}> */}
//         {!forgotPassword && accountExists &&
//             <SubmitButton onPress={handleCreateUserAccount}>
//                 <Text>Login</Text>
//             </SubmitButton>
//         }

//         {!forgotPassword && !accountExists &&
//             <SubmitButton onPress={handleCreateUserAccount}>
//                 <Text>Submit</Text>
//             </SubmitButton>
//         }
//     {/* </Animated.View> */}
    
//     {forgotPassword &&
//         <Button
//             buttonType='gradient-button' 
//             onPress={handlePasswordReset}
//             text='Recover Password' />
//     }
    
//     <Animated.View style={[needAnAcccountTextAnimes]}>
//         <Button
//             buttonType='text-only'
//             fontSize={14}
//             fontWeight='600'
//             onPress={() => {
//                 if(!forgotPassword) {
//                 setForgotPassword(false) }
//                 setAccountExists(!accountExists)
//             }}
//             textColor='#6C69F5'
//             style={{ alignSelf: 'center', marginTop: 18 }}>
//                 {accountExists ? 'Need an Account?' : 'Have an Account?'}
//         </Button>
//     </Animated.View>
//     </Container>
// </Animated.View>


// const Container = styled.View`
//    align-items: center;
//    display: flex;
//    flex: 1;
//    padding-top: 140px;
//    z-index: 2;
// `;

// const LogoContainer = styled.View`
//    align-self: center;
//    align-items: center;
//    overflow: visible;
//    width: 100%;
// `;

// const Logo = styled.Image`
//    height: 41px;
//    margin-bottom: 24px;
//    overflow: visible;
//    width: 240px;
// `;

// const LogoSpan = styled.View`
//    background-color: #6C69F5;
//    border-radius: 3px;
//    height: 3px;
//    margin-bottom: 16px;
//    width: 140px;
// `;

// const LogoText = styled.Text`
//    color: #363636;
//    font-weight: 500;
//    font-size: 16px;
//    letter-spacing: 0.2px;
// `;

// const InputGroup = styled.View`
//    margin-top: 60px;
// `;

// const Text = styled.Text`
//     color: #333333;
//     font-size: 12px;
//     font-weight: 300;
// `;


// { !accountExists &&
//     <Animated.View style={[
//         keyboardActiveFadeOutAnimes, { 
//         alignSelf: 'center',
//         bottom: 50,
//         position: 'absolute',
//         maxWidth: 280 
//         }]}>
//             <Text>
//                 By signing up, you agree to the
//                 <TermsButton onPress={() => router.push('terms-conditions')}>
//                     <Text style={{ fontWeight: 500, top: 2 }}> Terms of Service </Text>
//                 </TermsButton> 
//                 <Text>and </Text>
//                 <TermsButton onPress={() => router.push('privacy-policy')}>
//                     <Text style={{ fontWeight: 500, top: 2 }}>Privacy Policy.</Text>
//                 </TermsButton> 
//             </Text>
//     </Animated.View>
// }