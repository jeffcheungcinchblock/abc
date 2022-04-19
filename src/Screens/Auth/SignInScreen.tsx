import React, { useState, useEffect, useCallback, FC } from 'react'
import { StackScreenProps } from "@react-navigation/stack"
import {
    View,
    ActivityIndicator,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    TextStyle,
    Alert,
    ViewStyle,
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
import { config } from '@/Utils/constants'
import { AuthNavigatorParamList } from '@/Navigators/AuthNavigator'
import { RootState } from '@/Store'
import { Header } from '@/Components'
import { Spacing } from '@/Theme/Variables'
import LoadButton from '@/Components/Buttons/LoadButton'
import { routes, RouteStacks, RouteTabs } from '@/Navigators/routes'

const TEXT_INPUT = {
    height: 40,
    color: "#000",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#000",
    paddingHorizontal: 20
}

const LOGIN_BUTTON: ViewStyle = {
    height: 40,
    flexDirection: "row"
}

const HEADER: TextStyle = {
    paddingBottom: Spacing[5] - 1,
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[3],
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

const SignInScreen: FC<StackScreenProps<AuthNavigatorParamList, RouteStacks.signIn>> = (
    { navigation, route }
) => {
    const { t } = useTranslation()
    const { Common, Fonts, Gutters, Layout } = useTheme()
    const dispatch = useDispatch()

    const params = route?.params || { username: "" }

    const [isLoggingIn, setIsLoggingIn] = useState(false)

    const [credential, setCredential] = useState({
        username: "",
        password: ""
    })

    useEffect(() => {
        setCredential({
            username: "",
            password: ""
        })
    }, [])

    const goBack = useCallback(() => {
        navigation.navigate(RouteStacks.welcome)
    }, [])

    const cognitoAuthUser = useCallback((username, password, saveKeyChain = false) => {
        var authenticationDtl = new AuthenticationDetails({
            Username: username,
            Password: password
        });

        var userPool = new CognitoUserPool(config.aws.cognito.poolData);

        var userData = {
            Username: username,
            Pool: userPool,
        };

        var currCognitoUser = new CognitoUser(userData);
        currCognitoUser.authenticateUser(authenticationDtl, {
            onSuccess: async (session) => {

                try {
                    let payload = session.getIdToken().payload

                    let accessToken = session.getAccessToken().getJwtToken()
                    let idToken = session.getIdToken().getJwtToken()
                    let refreshToken = session.getRefreshToken().getToken()

                    dispatch(login({
                        email: payload.email,
                        username: payload["cognito:username"],
                    }))

                    await EncryptedStorage.setItem(
                        "user_session_info",
                        JSON.stringify({
                            username,
                            accessToken,
                            idToken,
                            refreshToken
                        })
                    );

                    setIsLoggingIn(false)
                } catch (error) {
                    // Alert.alert(JSON.stringify(error))
                    setIsLoggingIn(false)
                }

            },

            onFailure: function (err) {
                Alert.alert(err.message || JSON.stringify(err));
                setIsLoggingIn(false)
            },
        })

    }, [credential])

    useEffect(() => {

        const tryRetrieveKeyChainStoredCred = async () => {
            // let { username, password } = await load("aws_cognity")
            // if (!['', null, undefined].includes(username)) {
            //   cognitoAuthUser(username, password, false)
            // }

            let userSessionInfo = await EncryptedStorage.getItem("user_session_info")

            if (!["", null, undefined].includes(userSessionInfo)) {
                let parsedUserSessionInfo = JSON.parse(userSessionInfo as string)
                let username = parsedUserSessionInfo.username
                const accessToken = new CognitoAccessToken({ AccessToken: parsedUserSessionInfo.accessToken });
                const idToken = new CognitoIdToken({ IdToken: parsedUserSessionInfo.idToken });
                const refreshToken = new CognitoRefreshToken({ RefreshToken: parsedUserSessionInfo.refreshToken });

                const sessionData = {
                    IdToken: idToken,
                    AccessToken: accessToken,
                    RefreshToken: refreshToken
                };

                const userSession = new CognitoUserSession(sessionData);

                var userPool = new CognitoUserPool(config.aws.cognito.poolData);

                let currCognitoUser = new CognitoUser({
                    Username: username,
                    Pool: userPool
                });

                currCognitoUser.setSignInUserSession(userSession);
                currCognitoUser.getSession((err: any, session: any) => {

                    let payload = session.getIdToken().payload

                    dispatch(login({
                        email: payload.email,
                        username: payload["cognito:username"],
                    }))
                })
            }
        }

        tryRetrieveKeyChainStoredCred()
    }, [])

    const onLoginOptionPress = (loginOpt: string) => {
        // TBD: frontend fields validation 

        if (loginOpt === 'normal') {
            setIsLoggingIn(true)
            cognitoAuthUser(credential.username, credential.password, true)
        }
    }

    const onCredentialFieldChange = useCallback((field, text) => {
        setCredential(prevCredential => {
            return {
                ...prevCredential,
                [field]: text
            }
        })
    }, [])

    const onSignUpPress = useCallback(() => {
        navigation.navigate(RouteStacks.signUp) 
    }, [])

    return (
        <ScrollView
            style={Layout.fill}
            contentContainerStyle={[
                Layout.fill,
                Layout.colCenter,
                Gutters.smallHPadding,
            ]}
        >
            <Header headerTx="signInScreen.screenTitle" style={HEADER} titleStyle={HEADER_TITLE}
                onLeftPress={goBack}
                leftIcon={() => <FontAwesome name="arrow-left" size={20} color="#000" />}
            />

            <View style={[Layout.fullWidth]}>
                <TouchableOpacity style={[LOGIN_BUTTON, Layout.center, { backgroundColor: "powderblue" }]} onPress={() => onLoginOptionPress("google")}>
                    <FontAwesome style={BUTTON_ICON} name="google" size={20} color="#fff" />
                    <Text style={[BUTTON_TEXT, Fonts.textCenter]}>Google</Text>
                </TouchableOpacity>
            </View>

            <View style={[Layout.fullWidth]}>
                <TouchableOpacity style={[LOGIN_BUTTON, Layout.center, { backgroundColor: "skyblue" }]} onPress={() => onLoginOptionPress("facebook")}>
                    <FontAwesome style={BUTTON_ICON} name="facebook-square" size={20} color="#fff" />
                    <Text style={[BUTTON_TEXT, Fonts.textCenter]}>Facebook</Text>
                </TouchableOpacity>
            </View>

            <View style={[Layout.fullWidth]}>
                <TouchableOpacity style={[LOGIN_BUTTON, Layout.center, { backgroundColor: "steelblue" }]} onPress={() => onLoginOptionPress("twitter")}>
                    <FontAwesome style={BUTTON_ICON} name="twitter" size={20} color="#fff" />
                    <Text style={[BUTTON_TEXT, Fonts.textCenter]}>Twitter</Text>
                </TouchableOpacity>
            </View>

            <View style={[Layout.fullWidth]}>
                <TextInput
                    style={TEXT_INPUT}
                    onChangeText={(text) => onCredentialFieldChange('username', text)}
                    value={credential.username}
                    placeholder={"User Name"}
                    placeholderTextColor={"#000"}
                />
            </View>

            <View style={[Layout.fullWidth]}>
                <TextInput
                    style={TEXT_INPUT}
                    onChangeText={(text) => onCredentialFieldChange('password', text)}
                    value={credential.password}
                    placeholder={"Password"}
                    secureTextEntry={true}
                    placeholderTextColor={"#000"}
                />
            </View>

            <View style={[Layout.fullWidth, Layout.center]}>
                <TouchableOpacity style={[Layout.fullWidth, Layout.center]} onPress={onSignUpPress}>
                    <Text style={{color:"#fff"}}>Sign up</Text>
                </TouchableOpacity>
            </View>

            <View style={[Layout.fullWidth, Layout.center]}>
                <LoadButton
                    onPress={() => onLoginOptionPress("normal")}
                    text={t("Login")}
                    containerStyle={Layout.fullWidth}
                    isLoading={isLoggingIn}
                    leftIcon={() => <FontAwesome name="home" size={20} color="#fff"/>}
                />
            </View>
        </ScrollView>
    )
}

export default SignInScreen