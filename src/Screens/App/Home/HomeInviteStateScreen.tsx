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
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand, Header } from '@/Components'
import { useTheme } from '@/Hooks'
import { useLazyFetchOneQuery } from '@/Services/modules/users'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login, logout } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'

import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { colors, config } from '@/Utils/constants'
import { HomeNavigatorParamList } from '@/Screens/App/HomeScreen'
import EncryptedStorage from 'react-native-encrypted-storage'

import Share from 'react-native-share';
import share from '@/Utils/share'
import HeaderLayout from '@/Styles/HeaderLayout'
import { RouteStacks } from '@/Navigators/routes'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { CompositeScreenProps } from '@react-navigation/native'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { DrawerScreenProps } from '@react-navigation/drawer'
import { DrawerNavigatorParamList, TabNavigatorParamList } from '@/Navigators/MainNavigator'
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import TurquoiseButton from '@/Components/Buttons/TurquoiseButton'
import CircleButton from '@/Components/Buttons/CircleButton'
import AvenirBoldText from '@/Components/FontText/AvenirBoldText'
import AvenirMediumText from '@/Components/FontText/AvenirMediumText'
import Clipboard from '@react-native-clipboard/clipboard';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const PURPLE_COLOR = {
    color: colors.orangeCrayola
}

type HomeInviteStateScreenNavigationProp = CompositeScreenProps<
    StackScreenProps<HomeNavigatorParamList, RouteStacks.homeInviteState>,
    CompositeScreenProps<
        BottomTabScreenProps<TabNavigatorParamList>,
        DrawerScreenProps<DrawerNavigatorParamList>
    >
>

const HomeInviteStateScreen: FC<HomeInviteStateScreenNavigationProp> = (
    { navigation, route }
) => {
    const { t } = useTranslation()
    const { Common, Fonts, Gutters, Layout } = useTheme()
    const dispatch = useDispatch()

    const onConfirmPress = () => {
        navigation.navigate(RouteStacks.homeReferral)
    }

    return (
        <ScreenBackgrounds
            screenName={RouteStacks.homeInviteState}
        >

            <KeyboardAwareScrollView
                style={Layout.fill}
                contentContainerStyle={[
                    Layout.fill,
                    Layout.colCenter,
                ]}
            >

                <Header
                    onLeftPress={() => navigation.goBack()}
                />

                <View style={[{
                    flexGrow: 6
                }, Layout.fullWidth, Layout.fill]}>

                    <View style={{ flex: 3, justifyContent: "center" }}>
                        <View style={[Layout.fullWidth, Layout.colCenter]}>
                            <Text style={[Layout.colCenter, {
                                fontWeight: "bold",
                                textAlign: "center",
                                fontSize: 60,
                                width: "60%",
                                color: colors.white,
                                fontFamily: "Virus-Killer"
                            }]}>{t("inviteSucceeded")}</Text>
                        </View>
                    </View>

                    <View style={{ flex: 2, flexDirection: "row", justifyContent: "center", alignItems: "flex-start" }}>
                        <View style={{ justifyContent: "center", alignItems: "center" }}>
                            <Text style={[Fonts.textRegular, { color: colors.brightTurquoise, fontWeight: "bold" }]}>{t("invitationCode")}</Text>
                            <Text style={[Fonts.textSmall, { color: colors.brightTurquoise }]}>{1234567890}</Text>
                        </View>

                    </View>

                </View>

                <View style={[Layout.fullWidth, Layout.center, { flex: 1, justifyContent: "flex-start" }]}>
                    <TurquoiseButton
                        onPress={onConfirmPress}
                        text={t("confirm")}
                        containerStyle={Layout.fullWidth}
                    />
                </View>

            </KeyboardAwareScrollView>
        </ScreenBackgrounds>
    )
}

export default HomeInviteStateScreen