import React, { useState, useEffect, useCallback, FC } from 'react'
import { createStackNavigator, StackScreenProps } from "@react-navigation/stack"
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
import { Brand } from '@/Components'
import { useTheme } from '@/Hooks'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'

import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { config } from '@/Utils/constants'
import { TabNavigatorParamList } from '@/Navigators/MainNavigator'
import { RouteStacks, RouteTabs } from '@/Navigators/routes'
import { MainScreen } from './Social'

const Stack = createStackNavigator();

export type SocialNavigatorParamList = {
    [RouteStacks.socialMain]: undefined
}

const SocialScreen: FC<StackScreenProps<TabNavigatorParamList, RouteTabs.social>> = (
    { navigation, route }
) => {
    const { t } = useTranslation()
    const { Common, Fonts, Gutters, Layout } = useTheme()
    const dispatch = useDispatch()

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name={RouteStacks.socialMain} component={MainScreen} />

        </Stack.Navigator>
    )
}

export default SocialScreen