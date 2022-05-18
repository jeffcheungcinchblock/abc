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
    ImageBackground,
    Linking
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand, Header } from '@/Components'
import { useTheme } from '@/Hooks'
import { useLazyFetchOneQuery } from '@/Services/modules/users'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'
// @ts-ignore
import Amplify, { Auth, Hub } from 'aws-amplify';

import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { colors, config } from '@/Utils/constants'
import { AuthNavigatorParamList } from '@/Navigators/AuthNavigator'
import { RouteStacks } from '@/Navigators/routes'
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import AppLogo from '@/Components/Icons/AppLogo'
import AppIcon from '@/Components/Icons/AppIcon'
import TurquoiseButton from '@/Components/Buttons/TurquoiseButton'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
// @ts-ignore
import notifee from '@notifee/react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import AsyncStorage from '@react-native-async-storage/async-storage'
import SocialSignInButton from '@/Components/Buttons/SocialSignInButton'
import { startLoading } from '@/Store/UI/actions'
// @ts-ignore
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth'
import { emailUsernameHash } from '@/Utils/helpers'
import Animated, { FadeIn } from 'react-native-reanimated';
import axios from 'axios'
import InAppBrowser from 'react-native-inappbrowser-reborn'
import { RootState } from '@/Store'

const BUTTON_VIEW = {
    marginVertical: 20
}

const WelcomeScreen: FC<StackScreenProps<AuthNavigatorParamList, RouteStacks.welcome>> = (
    { navigation, route }
) => {
    const { t } = useTranslation()
    const { Common, Fonts, Gutters, Layout } = useTheme()
    const dispatch = useDispatch()
    const [isLoggingIn, setIsLoggingIn] = useState(false)


    const [errMsg, setErrMsg] = useState(" ")
    
    useEffect(() => {
            // navigation.navigate(RouteStacks.welcomeGallery)
    }, [])

    const onDisplayNotification = async () => {
        // Create a channel
        try {
            const channelId = await notifee.createChannel({
                id: 'default',
                name: 'Default Channel',
            });

            // Display a notification
            await notifee.displayNotification({
                title: 'Notification Title',
                body: 'Main body content of the notification',
                android: {
                    channelId,
                    smallIcon: 'ic_launcher',
                },
            });
        } catch (err) {
            // console.log(err)
        }
    }

    useEffect(() => {
        const getUser = () => {
            return Auth.currentAuthenticatedUser()
                .then((userData: any) => userData)
                .catch(() => console.log('Not signed in'));
        }

        const authListener = async ({ payload: { event, data } }: any) => {
            console.log("authListener event ", event)
            switch (event) {
                case 'cognitoHostedUI':
                    console.log("@@@@!")
                    getUser().then(async (userData: any) => {
                        let jwtToken = userData?.signInUserSession?.idToken?.jwtToken
                        console.log('jwtToken', jwtToken)
                        const userProfileRes = await axios.get(config.userProfile, {
                            headers: {
                                Authorization: jwtToken //the token is a variable which holds the token
                            }
                        })

                        const { email } = userProfileRes?.data

                        if (email) {
                            dispatch(login({
                                username: userData.username,
                                email: userData.email, // FederatedSignedIn doesnt have email exposed
                            }))
                            dispatch(startLoading(false))
                        } else {
                            navigation.navigate(RouteStacks.provideEmail)
                            dispatch(startLoading(false))
                        }

                    }).catch((err: any) => {
                        console.log(JSON.stringify(err))
                    })
                    break;
                case 'signOut':
                    break;
                case 'signIn_failure':
                case 'cognitoHostedUI_failure':
                    dispatch(startLoading(false))
                    break;
                default:
                    break;
            }
        }

        Hub.listen('auth', authListener);

        return () => {
            Hub.remove('auth', authListener)
        }
    }, [])

    const onSignInPress = async () => {
        navigation.navigate(RouteStacks.signIn)

    }

    const onLoginOptionPress = async (loginOpt: string) => {
        dispatch(startLoading(true))
        try {
            if (loginOpt === 'facebook') {
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
            dispatch(startLoading(false))
        } finally {
            setIsLoggingIn(false)
        }
    }

    const onSignUpPress = () => {
        navigation.navigate(RouteStacks.signUp)
    }

    return (
        <ScreenBackgrounds
            screenName={RouteStacks.welcome}
        >

            <KeyboardAwareScrollView
                contentContainerStyle={[
                    Layout.fill,
                    Layout.colCenter,
                    {
                        backgroundColor: "transparent"
                    }
                ]}
            >
                <Header
                    headerText=" "
                />

                <View style={{
                    alignItems: "center",
                    width: "100%",
                    flex: 1,
                    justifyContent: "flex-start",
                }}>

                    <AppLogo style={{
                        height: 150,
                    }} />

                    <View style={[{
                        flexGrow: 4,
                        justifyContent: "flex-end",
                    }, Layout.fullWidth, Layout.fill]}>


                        <View style={[
                            Layout.fullWidth,
                            Gutters.smallVPadding,
                            Layout.center
                        ]}>
                            <TurquoiseButton
                                text={t("signUp")}
                                onPress={onSignUpPress}
                                isTransparentBackground
                                containerStyle={{ width: "45%" }}
                            />
                        </View>

                        <View style={[
                            Layout.fullWidth,
                            Layout.center,
                            {
                                paddingBottom: 0,
                                paddingTop: 10
                            }
                        ]}>
                            <TurquoiseButton
                                text={t("invitationCode")}
                                containerStyle={{ width: "45%" }}
                                onPress={() => navigation.navigate(RouteStacks.enterInvitationCode)}
                            />
                        </View>


                    </View>

                    <View style={[
                        Layout.fullWidth,
                        Layout.center,
                        {
                            flex: 1,
                            paddingBottom: 40
                        }
                    ]}>
                        <Pressable
                            onPress={onSignInPress}
                        >
                            <Text style={[
                                Fonts.textSmall,
                                {
                                    color: colors.brightTurquoise,
                                }
                            ]}>{t("alreadyHaveAnAc")}</Text>
                        </Pressable>
                    </View>

                    <View style={[
                        Layout.fullWidth,
                        Gutters.largeVMargin,
                        Layout.center,
                        {
                            flex: 1
                        }
                    ]}>
                        <Text style={[
                            Fonts.textSmall,
                            {
                                color: "#fff",
                            }
                        ]}>{t("orViaSocialMedia")}</Text>

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
                    </View>


                </View>

            </KeyboardAwareScrollView>
        </ScreenBackgrounds>
    )
}

export default WelcomeScreen