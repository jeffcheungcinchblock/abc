import React, { useState, useEffect, useCallback, FC } from 'react'
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack'
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
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login, logout } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'

import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { config } from '@/Utils/constants'
import { DrawerNavigatorParamList, TabNavigatorParamList } from '@/Navigators/MainNavigator'
import EncryptedStorage from 'react-native-encrypted-storage'
import { MainScreen, HomeReferralScreen, HomeInviteStateScreen, SocialSignInEnterEmailScreen } from '@/Screens/App/Home'
import { ActiveScreenSolo } from '@/Screens/App/Workout'
import { RouteStacks, RouteTabs } from '@/Navigators/routes'
import { CompositeScreenProps } from '@react-navigation/native'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { DrawerScreenProps } from '@react-navigation/drawer'
import WorkoutNavigator from '@/Navigators/WorkoutNavigator'

const Stack = createStackNavigator()

export type HomeNavigatorParamList = {
    [RouteStacks.homeMain]: undefined
    [RouteStacks.homeReferral]: undefined
    [RouteStacks.homeInviteState]: undefined

    // To be moved somewhere else
    [RouteStacks.workout]: undefined
    [RouteStacks.socialSignInEnterEmail]: undefined
}

type HomeScreenNavigationProp = CompositeScreenProps<
    BottomTabScreenProps<TabNavigatorParamList, RouteTabs.home>,
    DrawerScreenProps<DrawerNavigatorParamList>
>

const HomeScreen: FC<HomeScreenNavigationProp> = (
	{ navigation, route }
) => {
	const { t } = useTranslation()
	const { Common, Fonts, Gutters, Layout } = useTheme()
	const dispatch = useDispatch()


	return (
		<Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={RouteStacks.homeReferral}>
			<Stack.Screen name={RouteStacks.homeReferral} component={HomeReferralScreen} />
			<Stack.Screen name={RouteStacks.socialSignInEnterEmail} component={SocialSignInEnterEmailScreen} />
			<Stack.Screen name={RouteStacks.workout} component={WorkoutNavigator} />
		</Stack.Navigator>
	)
}

export default HomeScreen
