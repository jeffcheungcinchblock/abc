import React, { useState, useEffect, useCallback, FC } from 'react'
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack'
import {
	View,
	ActivityIndicator,
	Text,
	TextInput,
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

import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { config } from '@/Utils/constants'
import { TabNavigatorParamList } from '@/Navigators/MainNavigator'
import { RouteTabs, RouteStacks } from '@/Navigators/routes'
import { MainScreen } from './Marketplace'

const Stack = createStackNavigator()

export type MarketplaceNavigatorParamList = {
    [RouteStacks.marketplaceMain]: undefined
}

const MarketplaceScreen: FC<StackScreenProps<TabNavigatorParamList, RouteTabs.marketplace>> = (
	{ navigation, route }
) => {
	const { t } = useTranslation()
	const { Common, Fonts, Gutters, Layout } = useTheme()
	const dispatch = useDispatch()

	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name={RouteStacks.marketplaceMain} component={MainScreen} />
		</Stack.Navigator>
	)

}

export default MarketplaceScreen
