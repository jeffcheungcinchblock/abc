import React, { useState, useEffect, FC } from 'react'
import {
	Text,
	TouchableOpacity,
	ScrollView,
	Platform,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { StackScreenProps } from '@react-navigation/stack'
import { CompositeScreenProps } from '@react-navigation/native'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { DrawerScreenProps } from '@react-navigation/drawer'
import { useTheme } from '@/Hooks'
import { IOSHealthKit } from '../../../Healthkit/iosHealthKit'
import { GoogleFitKit } from '../../../Healthkit/androidHealthKit'
import BackgroundGeolocation, {
	Subscription,
} from 'react-native-background-geolocation'
import { ActivityType } from '@/Store/Map/reducer'
import { RouteStacks } from '@/Navigators/routes'
import { WorkoutNavigatorParamList } from '@/Screens/App/WorkoutScreen'
import { DrawerNavigatorParamList, TabNavigatorParamList } from '@/Navigators/MainNavigator'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import axios from 'axios'

type WorkoutScreenScreenNavigationProp = CompositeScreenProps<
    StackScreenProps<WorkoutNavigatorParamList>,
    CompositeScreenProps<
        BottomTabScreenProps<TabNavigatorParamList>,
        DrawerScreenProps<DrawerNavigatorParamList>
    >
>
const isIOS = Platform.OS === 'ios'
const health_kit = isIOS ? new IOSHealthKit() : new GoogleFitKit()

const WorkoutScreen: FC<WorkoutScreenScreenNavigationProp> = ({ navigation,route }) => {
	const dispatch = useDispatch()
	const { Common, Fonts, Gutters, Layout } = useTheme()
	const [ log, setLog ] = useState('')
	const [ isHealthkitReady, setIstHealthKitReady ] = useState(false)
	const [ enabled, setEnabled ] = React.useState(false)
	const [ number, setNumber ] = useState(0)
	const [ status, setStatus ] = useState('')

	const startTime = useSelector((state:any) => state.map.startTime)
	const endTime = useSelector((state:any) => state.map.endTime)
	const steps = useSelector((state:any) => state.map.steps)
	const calories = useSelector((state:any) => state.map.calories)
	const latitude = useSelector((state:any) => state.map.latitude)
	const longitude = useSelector((state:any) => state.map.longitude)
	const distance = useSelector((state:any) => state.map.distance)
	const heartRate = useSelector((state:any) => state.map.heartRate)
	const paths = useSelector((state:any) => state.map.paths)
	const currentState = useSelector((state:any) => state.map.currentState)
    const params = { data: ""}

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
				} else {
					setIstHealthKitReady(true)
				}
			})
		}
		startInit()

	}, [])

	useEffect(() => {
		const onLocation: Subscription = BackgroundGeolocation.onLocation((location) => {
			console.log('onLocation status', status)

			if (currentState !== ActivityType.PAUSE){
				if (location.coords && location.coords.latitude && location.coords.longitude && location.is_moving === true && location.coords.speed!=-1)
				{
					setNumber(location.coords.speed!)
					if (location.coords.speed && location.coords.speed <= 12 && location.coords.speed >= 0){
						const new_cal = health_kit.GetCaloriesBurned(startTime, new Date())
						const new_step = health_kit.GetSteps(startTime, new Date())
						const new_heartrate = health_kit.GetHeartRates( startTime, new Date())

						console.log('before move disoatch')
						Promise.all([ new_cal, new_step, new_heartrate ]).then((result)=>{
							console.log('result', result)
							dispatch({ type:'move', payload:{ latitude:location.coords.latitude, longitude:location.coords.longitude,
								calories:result[0], steps:result[1], heartRate:result[2] } })
							// setNumber(pre => pre + 1)
						})
					} else {
						console.log('moving too fast')
					}
				} else {
					console.log('not moving')
				}
				setLog(JSON.stringify(location))
			}
		})
		if (currentState === ActivityType.LOADING){
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
				if (currentState !== ActivityType.MOVING){
					health_kit.GetAuthorizeStatus().then((isAuthorize) => {
						console.log('isAuth', isAuthorize)
					})
					dispatch({ type:'ready' })
					console.log('dispatch ready', ActivityType[currentState])
				}
			})
		}
		return () => {
			onLocation.remove()
		}
	}, [ status ])
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
	const StopRunningSession = async() => {
		console.log('stop')
		if (enabled){
			setEnabled(false)
			try{
				dispatch({ type:'stop' ,payload:{endTime:new Date()}})
				const finalJsonToString = JSON.stringify({
					startTime : startTime,
					distance: distance,
					calories : calories,
					steps: steps,
					heartRate: heartRate,
					paths: paths,
				})
				console.log('send')
				let dataResponse = await axios({
					method: 'post',
					url:'https://i0n9e61kyl.execute-api.us-west-2.amazonaws.com/Prod/postsession',
					headers: {
                        'Content-Type': 'application/json'
                    },
					data:finalJsonToString
				})
				console.log('dataResponse',dataResponse)
				navigation.replace(RouteStacks.endWorkout)
					// data: finalJsonToString)
			}catch(err){
				console.log('error in ver',err)
			}
		}

		// health_kit.StopWorkoutSession()
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
		let location = await BackgroundGeolocation.getCurrentPosition({ samples: 1,
			persist: true })
		console.log('last path in resume click', paths[paths.length - 1])
		const pauseStateTime = paths[paths.length - 1].pauseTime
		console.log('pauseStateTime in resueme', pauseStateTime)
		const ReduceStep = await  health_kit.GetSteps(pauseStateTime, new Date())
		// Promise.resolve(ReduceStep).then((result)=>{
		console.log('resume promise', ReduceStep)
		dispatch({ type:'resume', payload:{ resumeTime:curTime, latitude : location.coords.latitude, longitude:location.coords.longitude, reduceStep:0 } })

		console.log('resumen', ActivityType[currentState])
		// })
	}

	useEffect(()=>{
		console.log('currentState', ActivityType[currentState])
		setStatus(ActivityType[currentState])
	}, [ currentState ])


	useEffect(() => {
		const start = async() => {
			if (currentState === ActivityType.READY){
				let location = await BackgroundGeolocation.getCurrentPosition({
					timeout: 30,          // 30 second timeout to fetch location
					maximumAge: 5000,
					samples: 1,           // How many location samples to attempt.
				})
				dispatch({ type:'start', payload:{ startTime : new Date(), latitude : location.coords.latitude, longitude:location.coords.longitude } })
				setLog(JSON.stringify(location))
				setIstHealthKitReady(true)
				const state = await BackgroundGeolocation.start()
				console.log("[start] success - ", state);

			}

		}
		if (enabled === true) {
			console.log('button enable')
			BackgroundGeolocation.setOdometer(0)
			BackgroundGeolocation.changePace(true)

			start()

		} else {
			BackgroundGeolocation.stop().then((res)=>{
				console.log('button disable', res)
				dispatch({ type:'stop', payload:{ endTime : new Date() } })
			})
		}
	}, [ enabled ])

	return (
		<ScreenBackgrounds screenName={RouteStacks.workout}>

		<KeyboardAwareScrollView
                style={Layout.fill}
                contentContainerStyle={[
                    Layout.fill,
                    Layout.colCenter,
                ]}>
				
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
			<Text>number : {number} - 			{ActivityType[currentState]}</Text>
			{ (currentState === ActivityType.PAUSE || currentState === ActivityType.MOVING) && (
				<TouchableOpacity
					style={[ Common.button.rounded, Gutters.regularBMargin ]}
					onPress={StopRunningSession}
				>
					<Text style={Fonts.textRegular}>Stop Workk</Text>
				</TouchableOpacity>

			)}


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

				</KeyboardAwareScrollView>
		</ScreenBackgrounds>
	)
}

export default WorkoutScreen
