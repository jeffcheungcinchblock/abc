import React, { useState, useEffect, useCallback, FC, useRef, LegacyRef } from 'react'
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
    Image,
    ViewStyle,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand, Header } from '@/Components'
import { useTheme } from '@/Hooks'
import { useLazyFetchOneQuery } from '@/Services/modules/users'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Amplify, { Auth } from 'aws-amplify';

import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { colors, config } from '@/Utils/constants'
import { AuthNavigatorParamList } from '@/Navigators/AuthNavigator'

import { HeaderLayout } from '@/Styles'
import { RouteStacks } from '@/Navigators/routes'
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import WhiteInput from '@/Components/Inputs/WhiteInput'
import TurquoiseButton from '@/Components/Buttons/TurquoiseButton'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { startLoading } from '@/Store/UI/actions'
import AppIcon from '@/Components/Icons/AppIcon'
import ModalBox from 'react-native-modalbox';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import StandardInput from '@/Components/Inputs/StandardInput'
import SlideInputModal from '@/Components/Modals/SlideInputModal'
import { emailUsernameHash } from '@/Utils/helpers'

const BUTTON_ICON = {
    width: 30
}

const BUTTON_TEXT: TextStyle = {
    width: 100
}

const INPUT_VIEW_LAYOUT: ViewStyle = {
    flexBasis: 80,
    justifyContent: "center"
}

const ERR_MSG_TEXT: TextStyle = {
    color: colors.magicPotion,
    paddingTop: 4
}

const initErrMsg = {
    email: "",
    password: ""
}

const SignUpScreen: FC<StackScreenProps<AuthNavigatorParamList, RouteStacks.signUp>> = (
    { navigation, route }
) => {
    const modalRef = useRef<any>()
    const { t } = useTranslation()
    const { Common, Fonts, Gutters, Layout } = useTheme()
    const dispatch = useDispatch()
    const [isCreatingAccount, setIsCreatingAccount] = useState(false)
    const [errMsg, setErrMsg] = useState({
        ...initErrMsg
    })
    const [credential, setCredential] = useState({
        email: "",
        password: "",
    })
    const [showPassword, setShowPassword] = useState(false)

    const onCredentialFieldChange = (field: string, text: string) => {
        setCredential(prevCredential => {
            return {
                ...prevCredential,
                [field]: text
            }
        })
    }

    const onCreateAccountPress = useCallback(async () => {
        console.log("onCreateAccountPress")
        if (credential.email === '') {
            setErrMsg({
                ...initErrMsg,
                email: t("error.emailEmpty"),
            })
            return
        }

        try {
            dispatch(startLoading(true))
            setIsCreatingAccount(true)
            // any type here as aws amplify has no typescript support
            const { user }: any = await Auth.signUp({
                username: emailUsernameHash(credential.email),
                password: credential.password,
                attributes: {
                    email: credential.email,
                }
            });
            setIsCreatingAccount(false)
            navigation.navigate(RouteStacks.validationCode, {
                email: credential.email,
                action: 'signUp',
            })
        } catch (error: any) {
            console.log('error.message', error.message)
            switch (error.message) {
                case 'Password did not conform with policy: Password must have uppercase characters':
                case 'Password cannot be empty':
                    setErrMsg({
                        ...errMsg,
                        password: error.message
                    })
                    break;
                case 'Invalid email address format.':
                default:
                    setErrMsg({
                        ...errMsg,
                        email: error.message
                    })
                    break;
            }
        } finally {
            dispatch(startLoading(false))
            setIsCreatingAccount(false)
        }

    }, [credential, errMsg])

    const goBack = () => {
        navigation.navigate(RouteStacks.welcome)
    }

    const onModalClose = () => {
        navigation.navigate(RouteStacks.welcome)
        // navigation.navigate(RouteStacks.validationCode)
        
    }

    const onPasswordEyePress = () => {
        setShowPassword(prev => !prev)
    }

    return (
        <ScreenBackgrounds
            screenName={RouteStacks.signUp}
        >

            <KeyboardAwareScrollView
                contentContainerStyle={[
                    Layout.fill,
                    Layout.colCenter,
                    Layout.justifyContentStart,
                ]}
            >

                <Header
                    headerText={t("createAccount")}
                    onLeftPress={goBack}
                />

                <View style={[{
                    height: "25%",
                    justifyContent: "center",
                }, Layout.fullWidth]}>

                    <AppIcon />

                    <View style={[Layout.fullWidth, { justifyContent: "center", paddingVertical: 30, paddingHorizontal: 20 }]}>
                        <Text style={[{ color: colors.white, fontWeight: "bold" }, Fonts.textRegular, Fonts.textCenter]}>
                            {t("getStarted")} !
                        </Text>
                    </View>

                </View>

                <SlideInputModal
                    ref={modalRef}
                    onModalClose={onModalClose}
                >
                    <View style={[Layout.fullWidth, Gutters.largeHPadding, INPUT_VIEW_LAYOUT, { flexBasis: 80 }]}>
                        <StandardInput
                            onChangeText={(text) => onCredentialFieldChange('email', text)}
                            value={credential.email}
                            placeholder={t("email")}
                            placeholderTextColor={colors.spanishGray}
                            autoCapitalize={"none"}
                        />
                        {
                            errMsg.email !== '' && <Text style={[ERR_MSG_TEXT, Gutters.smallHPadding]}>{errMsg.email}</Text>
                        }
                    </View>

                    <View style={[Layout.fullWidth, Gutters.largeHPadding, INPUT_VIEW_LAYOUT, { flexBasis: 80 }]}>
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
                            errMsg.password !== '' && <Text style={[ERR_MSG_TEXT, Gutters.smallHPadding]}>{errMsg.password}</Text>
                        }
                    </View>

                    <View style={[Layout.fullWidth, Layout.center, Gutters.largeVPadding, { flex: 1, justifyContent: "space-between" }]}>
                        <TurquoiseButton
                            onPress={onCreateAccountPress}
                            text={t("create")}
                            isTransparentBackground
                            containerStyle={{
                                width: "45%",
                            }}
                        />
                        <View style={{ flexDirection: "row" }}>
                            <Text style={{ color: colors.white }}>{t("alreadyHaveAnAccount")}</Text>
                            <Pressable style={{ paddingLeft: 6 }} onPress={() => navigation.navigate(RouteStacks.signIn)}>
                                <Text style={{ color: colors.brightTurquoise, fontWeight: "bold" }}>{t("logIn")}</Text>
                            </Pressable>
                        </View>
                    </View>
                </SlideInputModal>

            </KeyboardAwareScrollView>
        </ScreenBackgrounds>
    )
}

export default SignUpScreen