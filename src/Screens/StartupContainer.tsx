import React, { FC, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, View, Text, Dimensions, Easing, ViewStyle } from 'react-native'
import { useTranslation } from 'react-i18next'
// @ts-ignore
import Video from 'react-native-video'
import { useTheme } from '@/Hooks'
import { Brand } from '@/Components'
import { setDefaultTheme } from '@/Store/Theme'
import { navigateAndSimpleReset } from '@/Navigators/utils'
import { useNavigation } from '@react-navigation/native'
import AppLogo from '@/Components/Icons/AppLogo'
import { RouteStacks } from '@/Navigators/routes'
import { StackScreenProps } from '@react-navigation/stack'
import { ApplicationNavigatorParamList } from '@/Navigators/Application'
// @ts-nocheck
import Animated, { EasingNode, timing } from 'react-native-reanimated'


const StartupContainer: FC<StackScreenProps<ApplicationNavigatorParamList, RouteStacks.startUp>> = ({ navigation }) => {
	const { Layout, Gutters, Fonts } = useTheme()

	const { t } = useTranslation()
	const topAnimatedVal = new Animated.Value(200)

	const init = async () => {
		await new Promise(resolve =>
			setTimeout(() => {
				resolve(true)
			}, 2000),
		)
		navigation.replace(RouteStacks.application)
	}

	useEffect(() => {
		init()
	}, [])


	const startAnimation = (toValue: any) => {
		timing(topAnimatedVal, {
			toValue,
			duration: 2000,
			easing: EasingNode.linear,
		}).start()
	}

	useEffect(() => {
		startAnimation(80)
	}, [])

	const APP_LOGO_ANIMATED_VIEW : any = {
		top: topAnimatedVal,
		position: 'absolute',
	}

	return (
		<View style={[ Layout.fill, Layout.colCenter ]}>
			<Video
				style={{
					height: Dimensions.get('window').height,
					position: 'absolute',
					top: 0,
					left: 0,
					alignItems: 'stretch',
					bottom: 0,
					right: 0,
				}}
				source={require('../Assets/Videos/sample-5s.mp4')}
				resizeMode="cover"
				rate={1.0}
				muted={true}
				repeat={true}
				ignoreSilentSwitch="obey"
			/>
			<Animated.View
				style={APP_LOGO_ANIMATED_VIEW}
			>
				<AppLogo style={{
					height: 150,
				}} />
			</Animated.View>
		</View>
	)
}

export default StartupContainer
