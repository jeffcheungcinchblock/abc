import React, { useState, useEffect, useCallback, FC, useRef } from 'react'
import { StackScreenProps } from "@react-navigation/stack"
import {
    View,
    ActivityIndicator,
    Text,
    TextInput,
    Pressable,
    ScrollView,
    TextStyle,
    Alert,
    ViewStyle,
    Image,
    Keyboard,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand } from '@/Components'
import { useTheme } from '@/Hooks'
import { useLazyFetchOneQuery } from '@/Services/modules/users'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login, logout } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'
import EncryptedStorage from 'react-native-encrypted-storage';
// @ts-ignore
import Amplify, { Auth, Hub } from 'aws-amplify';

import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { colors, config } from '@/Utils/constants'
import { AuthNavigatorParamList } from '@/Navigators/AuthNavigator'
import { RootState } from '@/Store'
import { Header } from '@/Components'
import { Spacing } from '@/Theme/Variables'
import LoadButton from '@/Components/Buttons/LoadButton'
import { RouteStacks, RouteTabs } from '@/Navigators/routes'
// @ts-ignore
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth'
// @ts-ignore
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import AppLogo from '@/Components/Icons/AppLogo'
import backBtn from '@/Assets/Images/buttons/back.png'
import WhiteInput from '@/Components/Inputs/WhiteInput'
import AppIcon from '@/Components/Icons/AppIcon'
import { color } from 'react-native-reanimated'
import TurquoiseButton from '@/Components/Buttons/TurquoiseButton'
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { firebase } from '@react-native-firebase/messaging'
import { showSnackbar, startLoading } from '@/Store/UI/actions'
import SocialSignInButton from '@/Components/Buttons/SocialSignInButton'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { triggerSnackbar } from '@/Utils/helpers'
import AsyncStorage from '@react-native-async-storage/async-storage'
import StandardInput from '@/Components/Inputs/StandardInput'
import ModalBox, { ModalProps } from 'react-native-modalbox';
import { useFocusEffect } from '@react-navigation/native'
import SlideInputModal from '@/Components/Modals/SlideInputModal'


const LOGIN_BUTTON: ViewStyle = {
    height: 40,
    flexDirection: "row"
}

const HEADER_TITLE: TextStyle = {
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1.5,
    lineHeight: 15,
    textAlign: "center",
}

const BUTTON_ICON = {
    width: 30
}

const BUTTON_TEXT: TextStyle = {
    width: 100,
    color: "#fff"
}

const INPUT_VIEW_LAYOUT: ViewStyle = {
    flexBasis: 80,
    justifyContent: "center"
}

const ERR_MSG_TEXT: TextStyle = {
    color: colors.magicPotion
}

const initErrMsg = {
    username: "",
    password: ""
}

const SignInScreen: FC<StackScreenProps<AuthNavigatorParamList, RouteStacks.signIn>> = (
    { navigation, route }
) => {

    const modalRef = useRef<any>()
    const { t } = useTranslation()
    const { Common, Fonts, Gutters, Layout } = useTheme()
    const dispatch = useDispatch()

    const connector = useWalletConnect();

    const params = route?.params || { username: "" }

    const [isLoggingIn, setIsLoggingIn] = useState(false)
    const [errMsg, setErrMsg] = useState({
        ...initErrMsg
    })

    const [showPassword, setShowPassword] = useState(false)
    const [credential, setCredential] = useState({
        username: "",
        password: ""
    })

    const [socialIdentityUser, setSocialIdentityUser] = useState(null)

    useEffect(() => {
        setCredential({
            username: "",
            password: ""
        })

        const getUser = () => {
            return Auth.currentAuthenticatedUser()
                .then(userData => userData)
                .catch(() => console.log('Not signed in'));
        }

        const authListener = ({ payload: { event, data } }: any) => {
            switch (event) {
                case 'signIn':
                case 'cognitoHostedUI':
                    getUser().then(userData => {
                        dispatch(login({
                            username: userData.username,
                            email: userData.email, // FederatedSignedIn doesnt have email exposed
                        }))
                        dispatch(startLoading(false))
                    });
                    break;
                case 'signOut':
                    break;
                case 'signIn_failure':
                case 'cognitoHostedUI_failure':
                    console.log('Sign in failure', data);
                    dispatch(startLoading(false))
                    break;
            }
        }

        Hub.listen('auth', authListener);

        return () => {
            Hub.remove('auth', authListener)
        }

    }, [])

    const onPasswordEyePress = () => {
        setShowPassword(prev => !prev)
    }

    const onLoginOptionPress = async (loginOpt: string) => {
        dispatch(startLoading(true))
        try {
            if (loginOpt === 'normal') {
                const user = await Auth.signIn(credential.username, credential.password)
                let { attributes, username } = user

                dispatch(login({
                    email: attributes.email,
                    username,
                }))

                setIsLoggingIn(true)

            } else if (loginOpt === 'facebook') {
                await Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Facebook })
            } else if (loginOpt === 'apple') {
                await Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Apple })
            } else if (loginOpt === 'google') {
                await Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google })
            }

        } catch (err: any) {

            switch (err.message) {
                case 'Username should be either an email or a phone number.':
                case 'User is not confirmed.':
                case 'Incorrect username or password.':
                case 'Username cannot be empty':
                case 'User does not exist.':
                    setErrMsg({
                        ...initErrMsg,
                        username: err.message
                    })
                    break;
                case 'Password did not conform with policy: Password not long enough':
                    setErrMsg({
                        ...initErrMsg,
                        password: err.message
                    })
                    break;
                default:
            }
            dispatch(startLoading(false))
        } finally {
            setIsLoggingIn(false)
        }
    }

    const onCredentialFieldChange = (field: string, text: string) => {
        setCredential(prevCredential => {
            return {
                ...prevCredential,
                [field]: text.toLowerCase()
            }
        })
    }

    const onForgotPasswordPress = async () => {
        navigation.navigate(RouteStacks.forgotPassword)
    }

    const goBack = () => {
        navigation.navigate(RouteStacks.welcome)
    }
    
    const onModalClose = () => {
        navigation.navigate(RouteStacks.welcome)
    }

    useFocusEffect(useCallback(() => {
        modalRef?.current?.open()
    }, [modalRef]))


    return (
        <ScreenBackgrounds
            screenName={RouteStacks.signIn}
        >


            <KeyboardAwareScrollView
                style={Layout.fill}
                contentContainerStyle={[
                    Layout.fill,
                    Layout.colCenter,
                    Layout.justifyContentStart,
                ]}
            >
                <Header
                    onLeftPress={goBack}
                    headerText={t("login")}
                />

                <View style={[{
                    height: "25%",
                    justifyContent: "center",
                }, Layout.fullWidth]}>

                    <AppIcon />

                    <View style={[Layout.fullWidth, { justifyContent: "center", paddingVertical: 40, paddingHorizontal: 20 }]}>
                        <Text style={[{ color: colors.white, fontWeight: "bold" }, Fonts.textRegular, Fonts.textCenter]}>
                            {t("welcomeBack")} !
                        </Text>
                    </View>

                </View>


                <SlideInputModal
                    ref={modalRef}
                    onModalClose={onModalClose}
                >

                    <View style={[Layout.fullWidth, Gutters.largeHPadding, INPUT_VIEW_LAYOUT]}>
                        <StandardInput
                            onChangeText={(text) => onCredentialFieldChange('username', text)}
                            value={credential.username}
                            placeholder={t("username")}
                            placeholderTextColor={colors.spanishGray}

                        />
                         {
                            <Text style={ERR_MSG_TEXT}>{errMsg.username}</Text>
                        }
                    </View>
                    

                    <View style={[Layout.fullWidth, Gutters.largeHPadding, INPUT_VIEW_LAYOUT]}>
                        <StandardInput
                            onChangeText={(text) => onCredentialFieldChange('password', text)}
                            value={credential.password}
                            placeholder={t("password")}
                            placeholderTextColor={colors.spanishGray}
                            secureTextEntry={!showPassword}
                            showPassword={showPassword}
                            onPasswordEyePress={onPasswordEyePress}
                        />
                         {
                            <Text style={ERR_MSG_TEXT}>{errMsg.password}</Text>
                        }
                    </View>

                    <View style={[Layout.fullWidth, Layout.center, Gutters.regularVPadding, { flex: 1, justifyContent: "center" }]}>
                        <TurquoiseButton
                            onPress={() => onLoginOptionPress("normal")}
                            text={t("login")}
                            isTransparentBackground
                            containerStyle={{
                                width: "45%",
                            }}
                        />
                        <Pressable style={[Layout.fullWidth, Layout.center, {marginBottom: 30, marginTop: 10}]}
                            onPress={onForgotPasswordPress}
                        >
                            <Text style={{color: colors.white, textDecorationLine: "underline"}}>{t("forgotPassword")}</Text>
                        </Pressable>
                        
                        <View style={{ flexDirection: "row" }}>
                            <Text style={{ color: colors.white }}>{t("dontHaveAnAccount")}</Text>
                            <Pressable style={{ paddingLeft: 6 }} onPress={() => navigation.navigate(RouteStacks.signUp)}>
                                <Text style={{ color: colors.brightTurquoise, fontWeight: "bold" }}>{t("signUp")}</Text>
                            </Pressable>
                        </View>
                    </View>
               
                </SlideInputModal>

            </KeyboardAwareScrollView>
        </ScreenBackgrounds>
    )
}

export default SignInScreen