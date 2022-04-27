import React, { useState, useEffect, useCallback, FC } from 'react'
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
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand } from '@/Components'
import { useTheme } from '@/Hooks'
import { useLazyFetchOneQuery } from '@/Services/modules/users'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login, logout } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'
import EncryptedStorage from 'react-native-encrypted-storage';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Amplify, { Auth, Hub } from 'aws-amplify';
import {
    CognitoUserPool,
    CognitoUser,
    AuthenticationDetails,
    CognitoAccessToken,
    CognitoIdToken,
    CognitoRefreshToken,
    CognitoUserSession,

} from 'amazon-cognito-identity-js';
import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { colors, config } from '@/Utils/constants'
import { AuthNavigatorParamList } from '@/Navigators/AuthNavigator'
import { RootState } from '@/Store'
import { Header } from '@/Components'
import { Spacing } from '@/Theme/Variables'
import LoadButton from '@/Components/Buttons/LoadButton'
import { RouteStacks, RouteTabs } from '@/Navigators/routes'
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth'

import {
    useWalletConnect,
} from "@walletconnect/react-native-dapp";
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import AppLogo from '@/Components/Icons/AppLogo'
import backBtn from '@/Assets/Images/buttons/back.png'
import WhiteInput from '@/Components/Inputs/WhiteInput'
import AppIcon from '@/Components/Icons/AppIcon'
import { color } from 'react-native-reanimated'
import YellowButton from '@/Components/Buttons/YellowButton'
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { firebase } from '@react-native-firebase/messaging'
import { startLoading } from '@/Store/UI/actions'
import SocialSignInButton from '@/Components/Buttons/SocialSignInButton'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'


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

const SignInScreen: FC<StackScreenProps<AuthNavigatorParamList, RouteStacks.signIn>> = (
    { navigation, route }
) => {
    const { t } = useTranslation()
    const { Common, Fonts, Gutters, Layout } = useTheme()
    const dispatch = useDispatch()

    const connector = useWalletConnect();

    const params = route?.params || { username: "" }

    const [isLoggingIn, setIsLoggingIn] = useState(false)
    const [errMsg, setErrMsg] = useState(" ")

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

    const goBack = () => {
        navigation.navigate(RouteStacks.welcome)

    }

    const onLoginOptionPress = async (loginOpt: string) => {
        // await InAppBrowser.close()
        // await InAppBrowser.closeAuth()
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

        } catch (error: any) {

            switch (error.message) {
                case 'Username should be either an email or a phone number.':
                    setErrMsg(error.message)
                    break;
                case 'Password did not conform with policy: Password not long enough':
                    setErrMsg(error.message)
                    break;
                case 'User is not confirmed.':
                    setErrMsg(error.message)
                    break;
                case 'Incorrect username or password.':
                    setErrMsg(error.message)
                    break;
                case 'User does not exist.':
                    setErrMsg(t("error.invalidUser"))
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
                [field]: text
            }
        })
    }

    const onSignUpPress = () => {
        navigation.navigate(RouteStacks.signUp)
    }

    return (
        <ScreenBackgrounds
            screenName={RouteStacks.signIn}
        >
            <Header
                onLeftPress={goBack}
            />

            <KeyboardAwareScrollView
                style={Layout.fill}
                contentContainerStyle={[
                    Layout.fill,
                    Layout.colCenter,

                ]}
            >

                {/* <View> style={[Layout.fullWidth]}>
                    <Pressable style={[LOGIN_BUTTON, Layout.center, { backgroundColor: "steelblue" }]} onPress={() => onLoginOptionPress("apple")}>
                        <FontAwesome style={BUTTON_ICON} name="apple" size={20} color="#fff" />
                        <Text style={[BUTTON_TEXT, Fonts.textCenter]}>Apple</Text>
                    </Pressable>
                </View> */}

                <View style={[{
                    flexGrow: 6,
                    justifyContent: "flex-start",
                }, Layout.fullWidth, Layout.fill]}>

                    {/* <View style={[Layout.fullWidth]}>
                        <Pressable style={[LOGIN_BUTTON, Layout.center, { backgroundColor: "powderblue" }]} onPress={() => onLoginOptionPress("google")}>
                            <FontAwesome style={BUTTON_ICON} name="google" size={20} color="#fff" />
                            <Text style={[BUTTON_TEXT, Fonts.textCenter]}>Google</Text>
                        </Pressable>
                    </View>

                    <View style={[Layout.fullWidth]}>
                        <Pressable style={[LOGIN_BUTTON, Layout.center, { backgroundColor: "skyblue" }]} onPress={() => onLoginOptionPress("facebook")}>
                            <FontAwesome style={BUTTON_ICON} name="facebook-square" size={20} color="#fff" />
                            <Text style={[BUTTON_TEXT, Fonts.textCenter]}>Facebook</Text>
                        </Pressable>
                    </View> */}


                    <View style={[Layout.fullWidth, { justifyContent: "center", flex: 1 }]}>
                        <Text style={[{ color: colors.white, fontFamily: "AvenirNext-Bold" }, Fonts.textRegular, Fonts.textCenter]}>
                            {t("accountLogin")}
                        </Text>
                    </View>

                    <View style={[Layout.fullWidth, Gutters.largeHPadding, INPUT_VIEW_LAYOUT]}>
                        <WhiteInput
                            onChangeText={(text) => onCredentialFieldChange('username', text)}
                            value={credential.username}
                            placeholder={t("accountName")}
                            placeholderTextColor={colors.spanishGray}
                        />
                    </View>

                    <View style={[Layout.fullWidth, Gutters.largeHPadding, INPUT_VIEW_LAYOUT]}>
                        <WhiteInput
                            onChangeText={(text) => onCredentialFieldChange('password', text)}
                            value={credential.password}
                            placeholder={t("password")}
                            secureTextEntry={true}
                            placeholderTextColor={colors.spanishGray}
                        />
                    </View>

                    <View style={[Layout.fullWidth, Layout.colCenter, { flexBasis: 20 }]}>
                        {
                            errMsg && <Text style={{ color: colors.electricViolet }}>{errMsg}</Text>
                        }
                    </View>

                    <View style={[Layout.fullWidth, Layout.colCenter, Layout.rowCenter, { flexBasis: 40, flexDirection: "row", marginVertical: 30 }]}>
                        <SocialSignInButton
                            isLoading={isLoggingIn}
                            onPress={() => onLoginOptionPress("facebook")}
                            iconName="facebook"
                            containerStyle={{
                                marginHorizontal: 8
                            }}
                        />
                        <SocialSignInButton
                            isLoading={isLoggingIn}
                            onPress={() => onLoginOptionPress("google")}
                            iconName="google"
                            containerStyle={{
                                marginHorizontal: 8
                            }}
                        />
                        <SocialSignInButton
                            isLoading={isLoggingIn}
                            onPress={() => onLoginOptionPress("apple")}
                            iconName="apple"
                            containerStyle={{
                                marginHorizontal: 8
                            }}
                        />
                    </View>

                    <View style={[Layout.fullWidth, Gutters.largeHPadding, Layout.center, { flex: 1, justifyContent: "flex-start", }]}>
                        <Pressable style={[Layout.fullWidth, Layout.center]} onPress={onSignUpPress}>
                            <Text style={[{ color: colors.lemonGlacier }, Fonts.textSmall]}>{t("createANewAccount")}</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={[Layout.fullWidth, Layout.center, { flex: 1, justifyContent: "flex-start" }]}>
                    <YellowButton
                        onPress={() => onLoginOptionPress("normal")}
                        text={t("login")}
                        containerStyle={Layout.fullWidth}
                        isLoading={isLoggingIn}
                    />
                </View>


            </KeyboardAwareScrollView>
        </ScreenBackgrounds>
    )
}

export default SignInScreen