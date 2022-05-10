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
import FontAwesome from 'react-native-vector-icons/FontAwesome'
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
                    setErrMsg(err.message)
                    break;
                case 'Password did not conform with policy: Password not long enough':
                    setErrMsg(err.message)
                    break;
                case 'User is not confirmed.':
                    setErrMsg(err.message)
                    break;
                case 'Incorrect username or password.':
                    setErrMsg(err.message)
                    break;
                case 'Username cannot be empty':
                    setErrMsg(err.message)
                    break;
                case 'User does not exist.':
                    setErrMsg(t("error.invalidUser"))
                    break;
                default:
            }
            console.log('err ', err.message)
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

    const onSignUpPress = () => {
        navigation.navigate(RouteStacks.signUp)
    }

    const onForgotPasswordPress = async () => {
        navigation.navigate(RouteStacks.forgotPassword)
    }

    return (
        <ScreenBackgrounds
            screenName={RouteStacks.signIn}
        >


            <KeyboardAwareScrollView
                style={Layout.fill}
                contentContainerStyle={[
                    Layout.fill,
                    Layout.colCenter,

                ]}
            >
                <Header
                    onLeftPress={goBack}
                />
                <View style={[{
                    flexGrow: 6,
                    justifyContent: "flex-start",
                }, Layout.fullWidth, Layout.fill]}>

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
                            errMsg && <Text style={{ color: colors.orangeCrayola }}>{errMsg}</Text>
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

                    <View style={[Layout.fullWidth, Gutters.largeHPadding, Layout.center, { flexBasis: 50, justifyContent: "flex-start", }]}>
                        <Pressable style={[Layout.fullWidth, Layout.center]} onPress={onSignUpPress}>
                            <Text style={[{ color: colors.white }, Fonts.textSmall]}>{t("createANewAccount")}</Text>
                        </Pressable>
                    </View>

                    <View style={[Layout.fullWidth, Gutters.largeHPadding, Layout.center, { flexBasis: 50, justifyContent: "flex-start", }]}>
                        <Pressable style={[Layout.fullWidth, Layout.center]} onPress={onForgotPasswordPress}>
                            <Text style={[{ color: colors.white }, Fonts.textSmall]}>{t("forgotPassword")}</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={[Layout.fullWidth, Layout.center, { flex: 1, justifyContent: "flex-start" }]}>
                    <TurquoiseButton
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