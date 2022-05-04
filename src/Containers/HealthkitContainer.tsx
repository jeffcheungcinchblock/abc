import React, { useState, useEffect, useReducer } from 'react'
import {
	Text,
	TouchableOpacity,
	ScrollView,
	Platform,
	DrawerLayoutAndroidBase,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { useTheme } from '@/Hooks'
import { IOSHealthKit } from '../Healthkit/iosHealthKit'
import { GoogleFitKit } from '../Healthkit/androidHealthKit'
import BackgroundGeolocation, {
	Subscription,
} from 'react-native-background-geolocation'
import { ActivityType } from '@/Store/Map/reducer'

const isIOS = Platform.OS === 'ios'
const health_kit = isIOS ? new IOSHealthKit() : new GoogleFitKit()

const HealthkitContainer = ({ navigation }) => {
	const dispatch = useDispatch()
	const { Common, Fonts, Gutters, Layout } = useTheme()
	const [ log, setLog ] = useState('')
	const [ isHealthkitReady, setIstHealthKitReady ] = useState(false)
	const [ enabled, setEnabled ] = React.useState(false)
	const [ number, setNumber ] = useState(0)

	const startTime = useSelector((state:any) => state.map.startTime)
	const steps = useSelector((state:any) => state.map.steps)
	const calories = useSelector((state:any) => state.map.calories)
	const latitude = useSelector((state:any) => state.map.latitude)
	const longitude = useSelector((state:any) => state.map.longitude)
	const distance = useSelector((state:any) => state.map.distance)
	const heartRate = useSelector((state:any) => state.map.heartRate)
	const paths = useSelector((state:any) => state.map.paths)
	const currentState = useSelector((state:any) => state.map.currentType)

	useEffect(() => {
		// setCurrentState('initialing')
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
			} else {
				setIstHealthKitReady(true)
			}
		})}, [])

	useEffect(() => {
		const onLocation: Subscription = BackgroundGeolocation.onLocation((location) => {
			console.log('startTime', startTime)
			if (currentState === ActivityType.PAUSE){
				return
			}
			if (location.coords && location.coords.latitude && location.coords.longitude && location.is_moving === true)
			{
				if (location.coords.speed && location.coords.speed <= 12 && location.coords.speed >= 0){
					const new_cal = health_kit.GetCaloriesBurned(startTime, new Date())
					const new_step = health_kit.GetSteps(startTime, new Date())
					const new_heartrate = health_kit.GetHeartRates( startTime, new Date())
					Promise.all([ new_cal, new_step, new_heartrate ]).then((result)=>{
						dispatch({ type:'move', payload:{ latitude:location.coords.latitude, longitude:location.coords.longitude,
							calories:result[0], steps:result[1], heartRate:result[2] } })
						setNumber(pre => pre + 1)
					})
				} else {
					console.log('moving too fast')
				}
			} else {
				console.log('not moving')
			}
			setLog(JSON.stringify(location))
		})
		// const onMotionChange: Subscription = BackgroundGeolocation.onMotionChange((event) => {
		// 	const new_heartrate = health_kit.GetHeartRates( startTime, new Date())
		// 	Promise.resolve(new_heartrate ).then((result)=>{
		// 		dispatch({ type:'heartrate', payload:{ heartRate:result } })
		// 		setNumber(pre => pre + 1)
		// 	})
		// })
		BackgroundGeolocation.ready({
			triggerActivities: 'on_foot, walking, running',
			locationAuthorizationRequest : 'WhenInUse',
			desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
			distanceFilter: 5,
			stopTimeout: 5,
			isMoving: true,
			reset: false,
			debug: true,
			disableElasticity : true,
			speedJumpFilter:50,
			logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
			stopOnTerminate: false,
		}).then(()=>{
			// setCurrentState('ready')
			dispatch({ type:'ready' })
			console.log('dispatch ready', ActivityType[currentState])
		})
		return () => {
			onLocation.remove()
		}
	}, [])
	/// Add the current state as first item in list.

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
			console.log('start')
			if (!enabled){
				setEnabled(true)
			}
		} else {
			console.log('not authed health kit')
		}

	}
	const StopRunningSession = () => {
		console.log('stop')
		if (enabled){
			setEnabled(false)
		}
		// health_kit.StopWorkoutSession()
	}

	const ShowMap = () => {
		console.log('show map')
		navigation.navigate('GeoLocation', { data: paths, startTime: startTime })
	}

	const UpdateHealthData = () => {
		health_kit.InitHealthKitPermission().then((val) => {
			console.log('init healthkit', val)
		})
	}

	const PauseRunningSession = () => {
		const curTime = new Date()
		dispatch({ type:'pause', payload:{ pauseTime:curTime } })
		console.log('pause')
		// setCurrentState('paused')
	}

	const ResumeRunningSession = async() => {
		const curTime = new Date()
		let location = await BackgroundGeolocation.getCurrentPosition({})
		dispatch({ type:'pause', payload:{ resumeTime:curTime, latitude : location.coords.latitude, longitude:location.coords.longitude } })
	}

	useEffect(()=>{
		console.log('currentState', ActivityType[currentState])
	}, [ currentState ])


	useEffect(() => {
		const start = async() => {
			if (currentState === ActivityType.READY){
				let location = await BackgroundGeolocation.getCurrentPosition({
					timeout: 30,          // 30 second timeout to fetch location
					maximumAge: 5000,
					samples: 3,           // How many location samples to attempt.
				})
				dispatch({ type:'start', payload:{ startTime : new Date(), latitude : location.coords.latitude, longitude:location.coords.longitude } })
				setLog(JSON.stringify(location))
				setIstHealthKitReady(true)
				await BackgroundGeolocation.start()
				await BackgroundGeolocation.changePace(true)
			}

		}
		if (enabled === true) {
			console.log('button enable')
			BackgroundGeolocation.setOdometer(0)
			start()
		} else {
			BackgroundGeolocation.stop().then((res)=>{
				console.log('button disable', res)
				dispatch({ type:'stop', payload:{ endTime : new Date() } })
			})
		}
	}, [ enabled ])

	return (
		<ScrollView
			style={Layout.fill}
			contentContainerStyle={[
				Layout.fill,
				Layout.colCenter,
				Gutters.smallHPadding,
			]}
		>
			<TouchableOpacity
				style={[ Common.button.rounded, Gutters.regularBMargin ]}
				onPress={UpdateHealthData}
			>

				<Text style={Fonts.textRegular}>Update Health Data</Text>
			</TouchableOpacity>
			{currentState === ActivityType.READY && (
				<TouchableOpacity
					style={[ Common.button.rounded, Gutters.regularBMargin ]}
					onPress={StartRunningSession}
				>
					<Text style={Fonts.textRegular}>Start Running</Text>
				</TouchableOpacity>
			)}

			<Text>Start : {startTime?.toDateString()}</Text>
			<Text>Steps : {steps}</Text>
			<Text>Distance : {distance}</Text>
			<Text>Heart Rates : {heartRate}</Text>
			<Text>calories : {calories}</Text>
			<Text>latitude : {latitude} </Text>
			<Text>longitude : {longitude}</Text>
			<Text>number : {number}</Text>

			{ (currentState === ActivityType.PAUSE || currentState === ActivityType.MOVING) && (
				<TouchableOpacity
					style={[ Common.button.rounded, Gutters.regularBMargin ]}
					onPress={StopRunningSession}
				>
					<Text style={Fonts.textRegular}>Stop Workk</Text>
				</TouchableOpacity>

			)}

			<TouchableOpacity
				style={[ Common.button.rounded, Gutters.regularBMargin ]}
				onPress={ShowMap}
			>
				<Text style={Fonts.textRegular}>View Map</Text>
			</TouchableOpacity>
			{currentState === ActivityType.MOVING && (
				<TouchableOpacity
					style={[ Common.button.rounded, Gutters.regularBMargin ]}
					onPress={PauseRunningSession}
				>
					<Text style={Fonts.textRegular}>Pause</Text>
				</TouchableOpacity>
			)}
			{currentState === ActivityType.PAUSE && (

				<TouchableOpacity
					style={[ Common.button.rounded, Gutters.regularBMargin ]}
					onPress={ResumeRunningSession}
				>
					<Text style={Fonts.textRegular}>Resume</Text>
				</TouchableOpacity>
			)}

		</ScrollView>
	)
}

export default HealthkitContainer
