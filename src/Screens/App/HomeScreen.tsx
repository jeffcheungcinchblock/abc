import React, { useState, useEffect, useCallback, FC } from 'react'
import { createStackNavigator, StackScreenProps } from "@react-navigation/stack"
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
import { MainNavigatorParamList } from '@/Navigators/MainNavigator'
import EncryptedStorage from 'react-native-encrypted-storage'
import { MainScreen, ReferralScreen } from '@/Screens/App/Home'
import { RouteStacks, RouteTabs } from '@/Navigators/routes'

const Stack = createStackNavigator();

export type HomeNavigatorParamList = {
    [RouteStacks.homeMain]: undefined
    [RouteStacks.homeReferral]: undefined
}

const HomeScreen: FC<StackScreenProps<MainNavigatorParamList, RouteTabs.home>> = (
    { navigation, route }
) => {
    const { t } = useTranslation()
    const { Common, Fonts, Gutters, Layout } = useTheme()
    const dispatch = useDispatch()


    return (
        <Stack.Navigator screenOptions={{ headerShown: true }} initialRouteName={RouteStacks.homeMain}>
            <Stack.Screen name={RouteStacks.homeMain} component={MainScreen}
                options={({ navigation }) => ({
                    title: "HOME"
                })}
            />

            <Stack.Screen name={RouteStacks.homeReferral} component={ReferralScreen}
                options={({ navigation }) => ({
                    title: "Referral"
                })}
            />


        </Stack.Navigator>
    )
}

export default HomeScreen