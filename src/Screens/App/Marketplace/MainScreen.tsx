import React, { useState, useEffect, useCallback, FC } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
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
import { login, logout } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'

import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { colors, config } from '@/Utils/constants'
import { MarketplaceNavigatorParamList } from '@/Screens/App/MarketplaceScreen'
import EncryptedStorage from 'react-native-encrypted-storage'
import { RouteStacks, RouteTabs } from '@/Navigators/routes'
import { CompositeScreenProps } from '@react-navigation/native'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { DrawerScreenProps } from '@react-navigation/drawer'
import { DrawerNavigatorParamList, TabNavigatorParamList } from '@/Navigators/MainNavigator'
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const TEXT_INPUT = {
	height: 40,
	color: 'yellow',
	borderWidth: 1,
	borderRadius: 10,
	borderColor: '#000',
}

type MarketplaceScreenNavigationProp = CompositeScreenProps<
    StackScreenProps<MarketplaceNavigatorParamList, RouteStacks.marketplaceMain>,
    CompositeScreenProps<
        BottomTabScreenProps<TabNavigatorParamList>,
        DrawerScreenProps<DrawerNavigatorParamList>
    >
>

const MainScreen: FC<MarketplaceScreenNavigationProp> = (
	{ navigation, route }
) => {
	const { t } = useTranslation()
	const { Common, Fonts, Gutters, Layout } = useTheme()
	const dispatch = useDispatch()


    return (
        <ScreenBackgrounds
            screenName={RouteStacks.breedingMain}
        >
            <KeyboardAwareScrollView
                contentContainerStyle={[
                    Layout.fill,
                    Layout.colCenter,
                    Gutters.smallHPadding,
                ]}
            >

				<Text style={{ color: colors.black }}>Marketplace</Text>

			</KeyboardAwareScrollView>

		</ScreenBackgrounds>
	)
}

export default MainScreen
