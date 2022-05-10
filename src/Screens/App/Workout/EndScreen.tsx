import React, { useState, useEffect, FC } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import {
	View,
	Text,
	Pressable,
	TextStyle,
	ViewStyle,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/Hooks'
// @ts-ignore
import Amplify, { Auth, Hub } from 'aws-amplify'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { WorkoutNavigatorParamList } from '@/Navigators/WorkoutNavigator'
import { RouteStacks, RouteTabs } from '@/Navigators/routes'
// @ts-ignore
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth'
// @ts-ignore
import { useWalletConnect } from '@walletconnect/react-native-dapp'

import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import { Brand, Header } from '@/Components'
import  CircleButton from '@/Components/Buttons/CircleButton'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'


const EndScreen: FC<StackScreenProps<WorkoutNavigatorParamList>> = (
	{ navigation, route }
) => {
	const { t } = useTranslation()
	const { Common, Fonts, Gutters, Layout } = useTheme()
	const dispatch = useDispatch()

	const connector = useWalletConnect()

	const params = route?.params || { username: '' }

	const [ isLoggingIn, setIsLoggingIn ] = useState(false)
	const [ errMsg, setErrMsg ] = useState(' ')


	const startButton = () => {
		console.log('start')

	}
	const returnStart = () => {
		navigation.reset({
            index: 0,
            routes: [{ name: RouteStacks.startWorkout}],
        })
	}
	return (
		<ScreenBackgrounds screenName={RouteStacks.workout}>
            <KeyboardAwareScrollView
                style={Layout.fill}
                contentContainerStyle={[
                    Layout.fill,
                    Layout.colCenter,
                ]}>
				
                <View style={[Layout.fill, Layout.rowCenter]}>
						<CircleButton onPress={returnStart}></CircleButton>
                        <Text>End</Text>
				</View>
			</KeyboardAwareScrollView>
		</ScreenBackgrounds>
	)
}

export default EndScreen
