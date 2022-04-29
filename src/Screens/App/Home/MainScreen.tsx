import React, { useState, useEffect, useCallback, FC } from 'react'
import { StackScreenProps } from "@react-navigation/stack"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
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
import { Brand } from '@/Components'
import { useTheme } from '@/Hooks'
import { useLazyFetchOneQuery } from '@/Services/modules/users'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login, logout } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'
import { CompositeScreenProps } from '@react-navigation/native';
import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { colors, config } from '@/Utils/constants'
import { HomeNavigatorParamList } from '@/Screens/App/HomeScreen'
import EncryptedStorage from 'react-native-encrypted-storage'
import { RouteStacks, RouteTabs } from '@/Navigators/routes'
// @ts-ignore
import { Auth } from 'aws-amplify';
import { DrawerScreenProps } from '@react-navigation/drawer'
import { DrawerNavigatorParamList, TabNavigatorParamList } from '@/Navigators/MainNavigator'
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import YellowButton from '@/Components/Buttons/YellowButton'
import axios from 'axios'

const TEXT_INPUT = {
    height: 40,
    color: "yellow",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#000",
}

type HomeMainScreenNavigationProp = CompositeScreenProps<
    StackScreenProps<HomeNavigatorParamList, RouteStacks.homeMain>,
    CompositeScreenProps<
        BottomTabScreenProps<TabNavigatorParamList, RouteTabs.home>,
        DrawerScreenProps<DrawerNavigatorParamList, RouteStacks.mainTab>
    >
>

const MainScreen: FC<HomeMainScreenNavigationProp> = (
    { navigation, route }
) => {
    const { t } = useTranslation()
    const { Common, Fonts, Gutters, Layout } = useTheme()
    const dispatch = useDispatch()

    const onSignOutPress = async () => {
        await Auth.signOut({ global: true })
        dispatch(logout())
    }

    const onReferFriendsPress = () => {
        navigation.navigate(RouteTabs.home, {
            screen: RouteStacks.homeReferral
        })
    }

    const onToggleDrawer = () => {
        navigation.toggleDrawer()
    }

    const [refreshing, setRefreshing] = useState(false)

    const onRefresh = useCallback(async() => {
        setRefreshing(true);

        let user = await Auth.currentAuthenticatedUser()
        let accessToken = user.signInUserSession.accessToken.jwtToken
        console.log('accessToken', accessToken)

        const authRes = await axios.get("https://api-dev.dragonevolution.gg/users/auth", {
            params: {
                accessToken
            }
        })
        console.log('authRes', authRes)
        setTimeout(() => {
            setRefreshing(false)
        }, 1000)
    }, []);

    return (
        <ScreenBackgrounds
            screenName={RouteStacks.homeMain}
        >
            <KeyboardAwareScrollView
                style={Layout.fill}
                contentContainerStyle={[
                    Layout.fill,
                    Layout.colCenter,
                    Gutters.smallHPadding,
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        progressViewOffset={50}
                        tintColor={colors.brightTurquoise}
                    />
                }
            >


                <View style={{
                    alignItems: "center",
                    width: "100%",
                    flex: 1,
                    justifyContent: "center",
                }}>


                    <Text style={Fonts.textRegular}>Welcome</Text>

                    {
                        <YellowButton
                            onPress={onReferFriendsPress}
                            text={t("Refer friends")}
                            containerStyle={[Layout.fullWidth]}
                        />
                    }

                    {
                        <YellowButton
                            onPress={onToggleDrawer}
                            text={t("Toggle Drawer")}
                            containerStyle={[Layout.fullWidth]}
                        />
                    }

                    {
                        <YellowButton
                            onPress={onSignOutPress}
                            text={t("Sign out")}
                            containerStyle={[Layout.fullWidth]}
                        />
                    }

                </View>

            </KeyboardAwareScrollView>
        </ScreenBackgrounds>
    )
}

export default MainScreen