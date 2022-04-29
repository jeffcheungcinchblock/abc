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
    RefreshControl,
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
import { RouteStacks, RouteTabs } from '@/Navigators/routes'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { CompositeScreenProps } from '@react-navigation/native'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { DrawerScreenProps } from '@react-navigation/drawer'
import { DrawerNavigatorParamList, TabNavigatorParamList } from '@/Navigators/MainNavigator'
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import YellowButton from '@/Components/Buttons/YellowButton'
import CircleButton from '@/Components/Buttons/CircleButton'
import AvenirBoldText from '@/Components/FontText/AvenirBoldText'
import AvenirMediumText from '@/Components/FontText/AvenirMediumText'
import Clipboard from '@react-native-clipboard/clipboard';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import moment from 'moment'
import { triggerSnackbar } from '@/Utils/helpers'
const PURPLE_COLOR = {
    color: colors.orangeCrayola
}

type HomeReferralScreenNavigationProp = CompositeScreenProps<
    StackScreenProps<HomeNavigatorParamList, RouteStacks.homeReferral>,
    CompositeScreenProps<
        BottomTabScreenProps<TabNavigatorParamList>,
        DrawerScreenProps<DrawerNavigatorParamList>
    >
>

const HomeReferralScreen: FC<HomeReferralScreenNavigationProp> = (
    { navigation, route }
) => {
    const { t } = useTranslation()
    const { Common, Fonts, Gutters, Layout } = useTheme()
    const dispatch = useDispatch()
    const [isInvitingFriends, setIsInvitingFriends] = useState(false)

    console.log('#### route', route)
    const params = route.params || {code: "1234"}

    const onSharePress = async () => {

        const shareRes = await share({
            url: "https://fitevo.page.link/signIn",
            title: "Refer your friend", message: "Refer your friend",
        })

        if(shareRes !== false){
            navigation.navigate(RouteTabs.home, {
                screen: RouteStacks.homeInviteState
            })
        }

    }

    const goBack = () => {
        navigation.navigate(RouteStacks.homeMain)

    }

    const onCopyPress = () => {
        Clipboard.setString('123456789');
        triggerSnackbar("Invitation code copied !")

    }

    return (
        <ScreenBackgrounds
            screenName={RouteStacks.homeReferral}
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

                <View style={[{
                    flexGrow: 6
                }, Layout.fullWidth, Layout.fill]}>

                    <View style={{ flex: 3, justifyContent: "flex-end" }}>
                        <View style={[Layout.fullWidth]}>
                            <Text style={[PURPLE_COLOR, Layout.colCenter, Layout.fullWidth, {
                                fontWeight: "bold",
                                textAlign: "center",
                                fontSize: 60
                            }]}>{params.code}</Text>
                        </View>

                        <View style={[Layout.fullWidth]}>
                            <Text style={[Fonts.textSmall, Layout.colCenter, Layout.fullWidth, {
                                color: colors.black,
                                textAlign: "center",
                            }]}>{t('yourQueueNumber')}</Text>
                        </View>

                        <View style={[Layout.fullWidth]}>
                            <Text style={[PURPLE_COLOR, Fonts.textRegular, Layout.colCenter, Layout.fullWidth, {
                                color: colors.black,
                                fontWeight: "bold",
                                textAlign: "center",
                            }]}>{`( ${t("invited")}: 100 )`}</Text>
                        </View>
                    </View>

                    <View style={{ flex: 3, justifyContent: "center" }}>
                        <View style={[Layout.fullWidth]}>
                            <AvenirBoldText style={[PURPLE_COLOR, Fonts.textLarge, Layout.colCenter, Layout.fullWidth, {
                                textAlign: "center",
                            }]}
                                label={'18/06/2022'}
                            />
                        </View>

                        <View style={[Layout.fullWidth]}>
                            <AvenirBoldText style={[PURPLE_COLOR, Fonts.textRegular, Layout.colCenter, Layout.fullWidth, {
                                textAlign: "center",
                                fontWeight: "bold",
                            }]}
                                label={'10 : 00 : 00 UST'}
                            />
                        </View>

                        <View style={[Layout.fullWidth]}>
                            <AvenirMediumText style={[Fonts.textSmall, Layout.colCenter, Layout.fullWidth, {
                                textAlign: "center",
                                color: colors.black
                            }]}
                                label={t('eventStartDate')}
                            />
                        </View>
                    </View>

                    <View style={{ flex: 2, flexDirection: "row" }}>
                        <View style={{ flex: 4, justifyContent: "center", paddingLeft: 50 }}>
                            <Text style={[Fonts.textRegular, { color: colors.white, fontWeight: "bold" }]}>{t("yourInvitationCode")}</Text>
                            <Text style={[Fonts.textSmall, { color: colors.brightTurquoise }]}>{1234567890}</Text>
                        </View>
                        <CircleButton
                            onPress={onCopyPress}
                            containerStyle={{
                                flex: 2,
                                justifyContent: "center",
                            }}
                        />
                    </View>

                </View>

                <View style={[Layout.fullWidth, Layout.center, { flex: 1, justifyContent: "flex-start" }]}>
                    <YellowButton
                        onPress={onSharePress}
                        text={t("inviteFriends")}
                        containerStyle={Layout.fullWidth}
                        isLoading={isInvitingFriends}
                    />
                </View>

            </KeyboardAwareScrollView>
        </ScreenBackgrounds>
    )
}

export default HomeReferralScreen