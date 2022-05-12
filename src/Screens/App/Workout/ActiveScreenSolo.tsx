import React, { useState, useEffect, FC } from 'react'
import {
	Text,
	TouchableOpacity,
	StyleSheet,
	Platform,
	View,
	TextProps,
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
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import axios from 'axios'
import ActiveMapView from '@/Components/Map'

type WorkoutScreenScreenNavigationProp = CompositeScreenProps<
    StackScreenProps<WorkoutNavigatorParamList>,
    CompositeScreenProps<
        BottomTabScreenProps<TabNavigatorParamList>,
        DrawerScreenProps<DrawerNavigatorParamList>
    >
>
const styles = StyleSheet.create({
	mapContainer: {
		...StyleSheet.absoluteFillObject,
		height: 300,
		width: 400,
		alignItems: 'center',
	},
	map: {
		...StyleSheet.absoluteFillObject,
	},
	container:{
		flex:1,
	},
	statusBarContainer: {
		flex:1,
		flexDirection: 'row',
		justifyContent: 'space-around',
		width: '100%',
		height: '10%',
		padding:10,
	},
	dataContainer:{
		flex:3,
		backgroundColor:'#151C35',
		color:'#fff',
	},

	textStyle:{
		color:'#fff',
		fontSize:20,
		textAlign:'center',
		backgroundColor: 'red',
	},
})

const isIOS = Platform.OS === 'ios'
const health_kit = isIOS ? new IOSHealthKit() : new GoogleFitKit()

const ActiveScreenSolo: FC<WorkoutScreenScreenNavigationProp> = ({ navigation, route }) => {
	const dispatch = useDispatch()
	const { Common, Fonts, Gutters, Layout } = useTheme()
	const [ log, setLog ] = useState('')
	const [ isHealthkitReady, setIstHealthKitReady ] = useState(false)
	const [ enabled, setEnabled ] = useState(false)
	const [ number, setNumber ] = useState(0)
	const [ region, setRegion ] = useState<Region|null>(null)
	const [ isReady, setIsReady ] = useState(false)
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

	// useEffect(() => {
	// 	// setCurrentState('initialing')
	// 	const startInit = async () => {
	// 		health_kit.GetAuthorizeStatus().then((isAuthorize) => {
	// 			if (!isAuthorize) {
	// 				health_kit
	// 					.InitHealthKitPermission()
	// 					.then(val => {
	// 						console.log('inti health kit', val)
	// 					})
	// 					.catch(err => {
	// 						console.error(err)
	// 					})
	// 			} else {
	// 				setIstHealthKitReady(true)
	// 			}
	// 		})
	// 	}
	// 	startInit()

	// }, [])

	// useEffect(() => {
	// 	const onLocation: Subscription = BackgroundGeolocation.onLocation((location) => {
	// 		console.log('onLocation status', status)

	// 		if (currentState !== ActivityType.PAUSE){
	// 			if (location.coords && location.coords.latitude && location.coords.longitude && location.is_moving === true && location.coords.speed != -1)
	// 			{
	// 				if (location.coords.speed && location.coords.speed <= 12 && location.coords.speed >= 0){
	// 					const new_cal = health_kit.GetCaloriesBurned(startTime, new Date())
	// 					const new_step = health_kit.GetSteps(startTime, new Date())
	// 					const new_heartrate = health_kit.GetHeartRates( startTime, new Date())

	// 					console.log('before move disoatch')
	// 					Promise.all([ new_cal, new_step, new_heartrate ]).then((result)=>{
	// 						console.log('result', result)
	// 						dispatch({ type:'move', payload:{ latitude:location.coords.latitude, longitude:location.coords.longitude,
	// 							calories:result[0], steps:result[1], heartRate:result[2] } })
	// 						// setNumber(pre => pre + 1)
	// 					})
	// 				} else {
	// 					console.log('moving too fast')
	// 				}
	// 			} else {
	// 				console.log('not moving')
	// 			}
	// 			setLog(JSON.stringify(location))
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
	// 			 	BackgroundGeolocation.getCurrentPosition({ samples: 1,
	// 					persist: true }).then(result => {
	// 					setRegion({ latitude:result.coords.latitude, longitude:result.coords.longitude, latitudeDelta:0.0922, longitudeDelta:0.0421 })
	// 					setIsReady(true)
	// 					console.log('ready', region)
	// 				})
	// 			}
	// 		})
	// 	}
	// 	return () => {
	// 		onLocation.remove()
	// 	}
	// }, [ status ])
	/// Add the current state as first item in list.


	const StopRunningSession = async() => {
		console.log('stop')
		if (enabled){
			setEnabled(false)
			try {
				dispatch({ type:'stop', payload:{ endTime:new Date() } })
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
						'Content-Type': 'application/json',
					},
					data:finalJsonToString,
				})
				console.log('dataResponse', dataResponse)
				navigation.replace(RouteStacks.endWorkout)
			} catch (err){
				console.log('error in ver', err)
			}
		}
	}

	const PauseRunningSession = () => {
		const curTime = new Date()
		dispatch({ type:'pause', payload:{ pauseTime:curTime } })
		console.log('pause')
	}

	const ResumeRunningSession = async() => {
		const curTime = new Date()
		let location = await BackgroundGeolocation.getCurrentPosition({ samples: 1,
			persist: true })
		const pauseStateTime = paths[paths.length - 1].pauseTime
		const ReduceStep = await  health_kit.GetSteps(pauseStateTime, new Date())
		Promise.resolve(ReduceStep).then((result)=>{
			dispatch({ type:'resume', payload:{ resumeTime:curTime, latitude : location.coords.latitude, longitude:location.coords.longitude, reduceStep:result } })
			console.log('resumen', ActivityType[currentState])
		})
	}

	useEffect(()=>{
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
				console.log('[start] success - ', state)
			}

		}
		if (enabled === true) {
			BackgroundGeolocation.setOdometer(0)
			BackgroundGeolocation.changePace(true)

			start()

		} else {
			BackgroundGeolocation.stop().then((res)=>{
				dispatch({ type:'stop', payload:{ endTime : new Date() } })
			})
		}
	}, [ enabled ])


	const WhiteText = (props: TextProps) => {
		const { style, ...rest } = props
		return <Text style={[ styles.textStyle, style ]} {...rest} />
	}
	return (
		<ScreenBackgrounds screenName={RouteStacks.workout}>
			<View style={[ styles.container ]}>


				<View style={[ styles.dataContainer ]}>
					{isReady && region && (
						// <View style={styles.container} >
						<ActiveMapView region={region} />
						/* </View> */
					)}
				</View>
				<View style={[ styles.dataContainer ]}>

					<View style={[ styles.statusBarContainer ]}>
						<View style={{ flex:0.5 }}><WhiteText style={{ fontSize:10 }}>Token</WhiteText></View>
						<View style={{ flex:0.5 }}><WhiteText>Energy</WhiteText></View>
					</View>

					<WhiteText>Start : {startTime?.toDateString()}</WhiteText>
					<WhiteText>Steps : {steps}</WhiteText>
					<WhiteText>Distance : {distance}</WhiteText>
					<WhiteText>Heart Rates : {heartRate}</WhiteText>
					<WhiteText>calories : {calories}</WhiteText>
					<WhiteText>latitude : {latitude} </WhiteText>
					<WhiteText>longitude : {longitude}</WhiteText>
					<WhiteText>number : {number} - 			{ActivityType[currentState]}</WhiteText>
					{ (currentState === ActivityType.PAUSE || currentState === ActivityType.MOVING) && (
						<TouchableOpacity
							style={[ Common.button.rounded, Gutters.regularBMargin ]}
							onPress={StopRunningSession}
						>
							<WhiteText style={Fonts.textRegular}>Stop Workk</WhiteText>
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

				</View>
			</View>
		</ScreenBackgrounds>
	)
}

export default ActiveScreenSolo
