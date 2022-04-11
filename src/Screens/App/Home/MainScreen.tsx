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

import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { config } from '@/Utils/constants'
import { HomeNavigatorParamList } from '@/Screens/App/HomeScreen'
import EncryptedStorage from 'react-native-encrypted-storage'
import { RouteStacks, RouteTabs } from '@/Navigators/routes'

const TEXT_INPUT = {
    height: 40,
    color: "yellow",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#000",
}

const MainScreen: FC<StackScreenProps<HomeNavigatorParamList, RouteStacks.homeMain>> = (
    { navigation, route }
) => {
    const { t } = useTranslation()
    const { Common, Fonts, Gutters, Layout } = useTheme()
    const dispatch = useDispatch()

    const onSignOutPress = useCallback(async () => {

        await EncryptedStorage.removeItem("user_session_info")
        dispatch(logout())

    }, [])

    const onReferFriendsPress = useCallback(() => {
        navigation.navigate(RouteTabs.home, {
            screen: RouteStacks.homeReferral
        })
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
            

            <View style={{
                alignItems: "center",
                width: "100%",
                flex: 1,
                justifyContent: "center",
            }}>



                <Text>Welcome</Text>

                <TouchableOpacity style={{ backgroundColor: "pink", marginTop: 40 }} onPress={onReferFriendsPress}>
                    <Text>Refer friends</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ backgroundColor: "pink", marginTop: 40 }} onPress={onSignOutPress}>
                    <Text>Sign out</Text>
                </TouchableOpacity>


            </View>

        </ScrollView>
    )
}

export default MainScreen