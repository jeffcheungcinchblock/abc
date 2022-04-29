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
    ImageBackground
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand, Header } from '@/Components'
import { useTheme } from '@/Hooks'
import { useLazyFetchOneQuery } from '@/Services/modules/users'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'

import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { config } from '@/Utils/constants'
import { AuthNavigatorParamList } from '@/Navigators/AuthNavigator'
import { RouteStacks } from '@/Navigators/routes'
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import AppLogo from '@/Components/Icons/AppLogo'
import AppIcon from '@/Components/Icons/AppIcon'
import TurquoiseButton from '@/Components/Buttons/TurquoiseButton'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'


const BUTTON_VIEW = {
    marginVertical: 20
}

const WelcomeScreen: FC<StackScreenProps<AuthNavigatorParamList, RouteStacks.welcome>> = (
    { navigation, route }
) => {
    const { t } = useTranslation()
    const { Common, Fonts, Gutters, Layout } = useTheme()
    const dispatch = useDispatch()

    const params = route!.params || { username: null }

    const onSignInPress = () => {
        navigation.navigate(RouteStacks.signIn)
    }

    return (
        <ScreenBackgrounds
            screenName={RouteStacks.welcome}
        >

            <Header
                headerText=" "
            />

            <KeyboardAwareScrollView
                style={Layout.fill}
                contentContainerStyle={[
                    Layout.fill,
                    Layout.colCenter,
                ]}
            >
                <View style={{
                    alignItems: "center",
                    width: "100%",
                    flex: 1,
                    justifyContent: "space-around",
                    paddingVertical: 10
                }}>

                    <AppLogo style={{
                        height: "30%",
                        // backgroundColor: "gray"
                    }} />

                    <View style={[{
                        flexGrow: 2,
                        justifyContent: "center",
                    }, Layout.fullWidth, Layout.fill]}>
                        <View style={[
                            Layout.fullWidth,
                            Gutters.regularVMargin
                        ]}>
                            <TurquoiseButton
                                text={t("login")}
                                onPress={() => navigation.navigate(RouteStacks.signIn)}
                            />
                        </View>

                        <View style={[
                            Layout.fullWidth,
                            Gutters.regularVMargin
                        ]}>
                            <TurquoiseButton
                                text={t("invitationCodeAllCapital")}
                                onPress={() => navigation.navigate(RouteStacks.enterInvitationCode)}
                            />
                        </View>
                    </View>

                    <View style={{flex: 1}}/>


                </View>

            </KeyboardAwareScrollView>
        </ScreenBackgrounds>
    )
}

export default WelcomeScreen