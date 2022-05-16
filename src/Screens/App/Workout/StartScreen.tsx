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
		// setCurrentState('initialing')
		const startInit = async () => {
			health_kit.GetAuthorizeStatus().then((isAuthorize) => {
				if (!isAuthorize) {
					health_kit
						.InitHealthKitPermission()
						.then(val => {
							console.log('inti health kit', val)
						})
						.catch(err => {
							console.error(err)
						})
				}
			})
		}
		startInit()
		dispatch({ type:'inital' })
		setIstHealthKitReady(true)
		console.log('set health kit readty')
	}, [])

	useEffect(() => {
		BackgroundGeolocation.ready({
			triggerActivities: 'on_foot, walking, running',
			locationAuthorizationRequest : 'WhenInUse',
			desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
			distanceFilter: 3,
			stopTimeout: 5,
			isMoving: true,
			reset: false,
			debug: true,
			disableElasticity : true,
			speedJumpFilter:50,
			logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
			stopOnTerminate: true,
		}).then(()=>{
			// if (currentState !== ActivityType.MOVING && currentState === ActivityType.LOADING){
			dispatch({ type:'ready' })
			setIsReady(true)
			console.log('ready in []')

			//
			// }
		})
	}, [ isHealthkitReady ])
	// useEffect(() => {
	// 	const onLocation: Subscription = BackgroundGeolocation.onLocation((location) => {
	// 		if (currentState !== ActivityType.PAUSE){
	// 			if (location.coords && location.coords.latitude && location.coords.longitude && location.is_moving === true && location.coords.speed != -1)
	// 			{
	// 				if (location.coords.speed && location.coords.speed <= 12 && location.coords.speed >= 0){
	// 					const new_cal = health_kit.GetCaloriesBurned(startTime, new Date())
	// 					const new_step = health_kit.GetSteps(startTime, new Date())
	// 					const new_heartrate = health_kit.GetHeartRates( startTime, new Date())
	// 					Promise.all([ new_cal, new_step, new_heartrate ]).then((result)=>{
	// 						console.log('result', result)
	// 						dispatch({ type:'move', payload:{ latitude:location.coords.latitude, longitude:location.coords.longitude,
	// 							calories:result[0], steps:result[1], heartRate:result[2] } })
	// 					})
	// 				} else {
	// 					console.log('moving too fast')
	// 				}
	// 			} else {
	// 				console.log('not moving')
	// 			}
	// 		}
	// 	})
	// 	if (currentState === ActivityType.LOADING){
	// 		BackgroundGeolocation.ready({
	// 			triggerActivities: 'on_foot, walking, running',
	// 			locationAuthorizationRequest : 'WhenInUse',
	// 			desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
	// 			distanceFilter: 3,
	// 			stopTimeout: 5,
	// 			isMoving: true,
	// 			reset: false,
	// 			debug: true,
	// 			disableElasticity : true,
	// 			speedJumpFilter:50,
	// 			logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
	// 			stopOnTerminate: true,
	// 		}).then(()=>{
	// 			if (currentState !== ActivityType.MOVING){
	// 				health_kit.GetAuthorizeStatus().then((isAuthorize) => {
	// 					console.log('isAuth', isAuthorize)
	// 				})
	// 				dispatch({ type:'ready' })
	// 				console.log('dispatch ready', ActivityType[currentState])
	// 			 	BackgroundGeolocation.getCurrentPosition({ samples: 1, persist: true }).then(result => {
	// 					setRegion({ latitude:result.coords.latitude, longitude:result.coords.longitude, latitudeDelta:0.0922, longitudeDelta:0.0421 })
	// 					setIsReady(true)
	// 				})
	// 			}
	// 		})
	// 	}
	// 	return () => {
	// 		onLocation.remove()
	// 	}
	// }, [ isHealthkitReady ])

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
