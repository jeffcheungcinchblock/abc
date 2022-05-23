import React, { useState, useEffect, FC } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import {
	View,
	Text,
	Pressable,
	TextStyle,
	Platform,
	ViewStyle,
	TouchableOpacity,

} from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/Hooks'
// @ts-ignore
import Amplify, { Auth, Hub } from 'aws-amplify'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { WorkoutNavigatorParamList } from '@/Navigators/WorkoutNavigator'
import { RouteStacks, RouteTabs } from '@/Navigators/routes'


//Map + HealthKit
import { IOSHealthKit } from '../../../Healthkit/iosHealthKit'
import { GoogleFitKit } from '../../../Healthkit/androidHealthKit'
import BackgroundGeolocation, {
	Subscription,
} from 'react-native-background-geolocation'
import { ActivityType, startGeoloaction } from '@/Store/Map/reducer'

import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import  StartButton from '@/Components/Buttons/StartButton'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

export type Region = {
	latitude: number
	longitude: number
	latitudeDelta: number
	longitudeDelta: number
}
const isIOS = Platform.OS === 'ios'
const health_kit = isIOS ? new IOSHealthKit() : new GoogleFitKit()

const StartScreen: FC<StackScreenProps<WorkoutNavigatorParamList>> = (
	{ navigation, route }
) => {
	const { t } = useTranslation()
	const { Common, Fonts, Gutters, Layout } = useTheme()
	const dispatch = useDispatch()
	const startTime = useSelector((state:any) => state.map.startTime)
	const currentState = useSelector((state:any) => state.map.currentState)
	const [ isHealthkitReady, setIstHealthKitReady ] = useState(false)
	const [ region, setRegion ] = useState<Region|null>(null)
	const [ isReady, setIsReady ] = useState<Boolean>(false)
	const [ enabled, setEnabled ] = useState<Boolean>(false)

	useEffect(() => {
		if (enabled === true) {
			dispatch({ type:'start', payload:{ startTime:new Date() } })
			navigation.replace(RouteStacks.workout)
		}
	}, [ enabled ])

	useEffect(()=>{
		console.log(ActivityType[currentState])
	}, [ currentState ])

	const StartRunningSession = async() => {
		const authed = await health_kit.GetAuthorizeStatus().then((isAuthorize) => {
			if (!isAuthorize) {
				health_kit.InitHealthKitPermission().then((val) => {
					console.log('init healthkit', val)
					return true
				})
			}
			return true
		})
		if (authed){
			setEnabled(true)
		} else {
			console.log('not authed health kit')
		}
	}


	return (
		<ScreenBackgrounds screenName={RouteStacks.workout}>
			<KeyboardAwareScrollView
				style={Layout.fill}
				contentContainerStyle={[
					Layout.fill,
					Layout.colCenter,
				]}>

				<View style={[ Layout.fill, Layout.rowCenter ]}>
					{currentState === ActivityType.READY && isReady ? (
						<TouchableOpacity
							style={[ Common.button.rounded, Gutters.regularBMargin ]}
							onPress={StartRunningSession}
						>
							<Text style={Fonts.textRegular}>Start Running {enabled}</Text>
						</TouchableOpacity>
					) : <Text>{ActivityType[currentState]}</Text>}
				</View>
			</KeyboardAwareScrollView>
		</ScreenBackgrounds>
	)
}

export default StartScreen
