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
// @ts-ignore
import Amplify, { Auth, Hub } from 'aws-amplify';
// @ts-ignore
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth'

import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { colors, config } from '@/Utils/constants'
import { AuthNavigatorParamList } from '@/Navigators/AuthNavigator'
import { RootState } from '@/Store'
import { Header } from '@/Components'
import { Spacing } from '@/Theme/Variables'
import LoadButton from '@/Components/Buttons/LoadButton'
import { RouteStacks, RouteTabs } from '@/Navigators/routes'

import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import AppLogo from '@/Components/Icons/AppLogo'
import backBtn from '@/Assets/Images/buttons/back.png'
import WhiteInput from '@/Components/Inputs/WhiteInput'
import AppIcon from '@/Components/Icons/AppIcon'
import { color } from 'react-native-reanimated'
import TurquoiseButton from '@/Components/Buttons/TurquoiseButton'
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
    justifyContent: "center"
}

const EnterInvitaionCodeScreen: FC<StackScreenProps<AuthNavigatorParamList, RouteStacks.enterInvitationCode>> = (
    { navigation, route }
) => {
    const { t } = useTranslation()
    const { Common, Fonts, Gutters, Layout } = useTheme()
    const dispatch = useDispatch()

    const params = route?.params || { username: "" }

    const [isLoggingIn, setIsLoggingIn] = useState(false)
    const [errMsg, setErrMsg] = useState(" ")

    const [invitationCode, setInvitationCode] = useState("")

    useEffect(() => {
        setInvitationCode("")
    }, [])

    const goBack = () => {
        navigation.navigate(RouteStacks.welcome)
    }

    const onConfirmPress = async () => {


        setErrMsg(t("error.invalidInvitationCode"))
    }

    const onInvitationCodeChange = (text: string) => {
        setInvitationCode(text)
    }

    const onSignUpPress = () => {
        navigation.navigate(RouteStacks.signUp)
    }

    return (
        <ScreenBackgrounds
            screenName={RouteStacks.signIn}
        >
            <Header
                headerText=" "
                onLeftPress={goBack}
            />


            <KeyboardAwareScrollView
                style={Layout.fill}
                contentContainerStyle={[
                    Layout.fill,
                    Layout.colCenter,

                ]}
            >

                <AppLogo style={{
                    // height: "30%"
                    flex: 2
                }} />

                <View style={[{
                    flexGrow: 4,
                    justifyContent: "center",
                }, Layout.fullWidth, Layout.fill]}>


                    <View style={[Layout.fullWidth, { justifyContent: "center", flexBasis: 80 }]}>
                        <Text style={[{ color: colors.white, fontFamily: "AvenirNext-Bold" }, Fonts.textRegular, Fonts.textCenter]}>
                            {t("enterInvitationCode")}
                        </Text>
                    </View>

                    <View style={[Layout.fullWidth, Gutters.largeHPadding, INPUT_VIEW_LAYOUT, { flexBasis: 80 }]}>
                        <WhiteInput
                            onChangeText={onInvitationCodeChange}
                            value={invitationCode}
                            placeholder={t("invitationCodeAllCapital")}
                            placeholderTextColor={colors.spanishGray}
                        />
                    </View>

                    <View style={[Layout.fullWidth, Layout.colCenter, { flexBasis: 20 }]}>
                        {
                            errMsg && <Text style={{ color: colors.orangeCrayola }}>{errMsg}</Text>
                        }
                    </View>

                </View>

                <View style={[Layout.fullWidth, Layout.center, { flex: 1, justifyContent: "flex-start" }]}>
                    <TurquoiseButton
                        onPress={() => onConfirmPress()}
                        text={t("confirm")}
                        containerStyle={Layout.fullWidth}
                        isLoading={isLoggingIn}
                    />
                </View>


            </KeyboardAwareScrollView>
        </ScreenBackgrounds>
    )
}

export default EnterInvitaionCodeScreen