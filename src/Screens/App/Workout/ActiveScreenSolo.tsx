import React, { useState, useEffect, FC } from 'react'
import {
	Text,
	TouchableOpacity,
	StyleSheet,
	Platform,
	View,
	ButtonProps,
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
import BackgroundGeolocation, { Subscription } from 'react-native-background-geolocation'
import { ActivityType } from '@/Store/Map/reducer'
import { RouteStacks } from '@/Navigators/routes'
import { WorkoutNavigatorParamList } from '@/Screens/App/WorkoutScreen'
import { DrawerNavigatorParamList, TabNavigatorParamList } from '@/Navigators/MainNavigator'
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import axios from 'axios'
import { colors, config } from '@/Utils/constants'

import ActiveMapView from '@/Components/Map/index'
import EnergyProgressBar from '@/Components/WorkoutScreen/energy_progress_bar'
import TokenProgressBar from '@/Components/WorkoutScreen/token_progress_bar'
import TokenEarned from '@/Components/WorkoutScreen/token_earned'
import NFTDisplay from '@/Components/WorkoutScreen/nft_display'
import { use } from 'i18next'

type WorkoutScreenScreenNavigationProp = CompositeScreenProps<
    StackScreenProps<WorkoutNavigatorParamList>,
    CompositeScreenProps<
        BottomTabScreenProps<TabNavigatorParamList>,
        DrawerScreenProps<DrawerNavigatorParamList>
    >
>
const styles = StyleSheet.create({
	mapContainer: {
		flex:3,
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
		flexDirection: 'row',
		// justifyContent: 'space-around',
		width:'100%',
		marginTop:20,
	},

	dataContainer:{
		flex:3,
		backgroundColor:'#151C35',
		color:'#fff',
	},
	dataPaddingContainer:{
		flex:3,
		margin:15,
	},
	textStyle:{
		color:'#fff',
		fontSize:20,
		textAlign:'center',
	},
	stateButtonContainer:{
		flex:1,
		display:'flex',
		flexDirection:'row',
		justifyContent: 'space-around',
		marginTop:15,
	},
	statePauseResumeButton:{
		backgroundColor: '#00F2DE',
		height:40,
		color:colors.brightTurquoise,
	},
	stateStopButton:{
		borderStyle: 'solid',
		borderColor: 'red',
		color:'white',
		backgroundColor:'none',
	},
})

const isIOS = Platform.OS === 'ios'
const health_kit = isIOS ? new IOSHealthKit() : new GoogleFitKit()

export type Region = {
	latitude: number
	longitude: number
	latitudeDelta: number
	longitudeDelta: number
}
const ActiveScreenSolo: FC<WorkoutScreenScreenNavigationProp> = ({ navigation, route }) => {
	const dispatch = useDispatch()
	const { Common, Fonts, Gutters, Layout } = useTheme()
	const startTime = useSelector((state:any) => state.map.startTime)
	const endTime = useSelector((state:any) => state.map.endTime)
	const steps = useSelector((state:any) => state.map.steps)
	const calories = useSelector((state:any) => state.map.calories)
	const distance = useSelector((state:any) => state.map.distance)
	const heartRate = useSelector((state:any) => state.map.heartRate)
	const paths = useSelector((state:any) => state.map.paths)
	const currentState = useSelector((state:any) => state.map.currentState)
	const latitude = useSelector((state:any) => state.map.latitude)
	const longitude = useSelector((state:any) => state.map.longitude)

	const [ enabled, setEnabled ] = useState(false)
	const [ isReady, setIsReady ] = useState(false)
	const [ startRegion, setStartRegion ] = useState<Region|null>(null)

	useEffect(()=>{
		console.log('updatedState', latitude, longitude, startRegion)
	}, [ currentState ])

	useEffect(()=>{
		const onLocation: Subscription = BackgroundGeolocation.onLocation((location) => {
			console.log('listening', ActivityType[currentState], location)
			if (currentState !== ActivityType.PAUSE && startTime !== null){
				if (location.coords && location.coords.latitude && location.coords.longitude && location.is_moving === true && location.coords.speed != -1)
				{
					if (location.coords.speed && location.coords.speed <= 12 && location.coords.speed >= 0){
						const new_cal = health_kit.GetCaloriesBurned(startTime, new Date())
						const new_step = health_kit.GetSteps(startTime, new Date())
						const new_heartrate = health_kit.GetHeartRates( startTime, new Date())
						Promise.all([ new_cal, new_step, new_heartrate ]).then((result)=>{
							console.log('result', result)
							dispatch({ type:'move', payload:{ latitude:location.coords.latitude, longitude:location.coords.longitude,
								calories:result[0], steps:result[1], heartRate:result[2] } })
						})
					} else {
						console.log('moving too fast')
					}
				} else {
					console.log('not moving')
				}
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
				if (currentState !== ActivityType.MOVING && currentState === ActivityType.LOADING){
					health_kit.GetAuthorizeStatus().then((isAuthorize) => {
						console.log('isAuth', isAuthorize)
					})
					dispatch({ type:'ready' })
					BackgroundGeolocation.getCurrentPosition({
						timeout: 30,          // 30 second timeout to fetch location
						maximumAge: 5000,
						samples: 1,
					}).then((location)=>{
						setStartRegion({ latitude:location.coords.latitude, longitude:location.coords.longitude, latitudeDelta:0.0922, longitudeDelta:0.0421 })
					})
					setIsReady(true)
					console.log('start region', startRegion)
					console.log('dispatch ready', ActivityType[currentState])
				}
			})
		}

		return () => {
			onLocation.remove()
		}
	}, [  ])

	// useEffect(() => {
	// }, [  ])

	useEffect(()=>{
		dispatch({ type:'start', payload:{ startTime: new Date() } })
		BackgroundGeolocation.start()
	}, [ isReady ])

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
	const WhiteText = (props: TextProps) => {
		const { style, ...rest } = props
		return <Text style={[ styles.textStyle, style ]} {...rest} />
	}

	return (
		<ScreenBackgrounds screenName={RouteStacks.workout}>
			<View style={[ styles.container ]}>
				<View style={[ styles.mapContainer ]}>
					{startRegion && latitude && longitude && (
						<ActiveMapView startRegion={startRegion}/>
					)}
				</View>
				<View><Text>{ActivityType[currentState]}</Text></View>
				<View style={[ styles.dataContainer ]}>
					<View style={[ styles.dataPaddingContainer ]}>
						<View style={[ styles.statusBarContainer ]}>
							<TokenProgressBar token="Token"/>
							<EnergyProgressBar energy="Energy"/>
						</View>
						<TokenEarned />
						<NFTDisplay />
						{/* <View style={[ styles.pointContainer ]}/> */}
						<View style={[ styles.stateButtonContainer ]}>
							{ (currentState === ActivityType.PAUSE || currentState === ActivityType.MOVING) && (
								<TouchableOpacity
									style={[ Common.button.rounded, Gutters.regularBMargin, styles.stateStopButton ]}
									onPress={StopRunningSession}
								>
									<Text style={Fonts.textRegular}>Stop Workk</Text>
								</TouchableOpacity>

							)}
							{currentState === ActivityType.MOVING && (
								<TouchableOpacity
									style={[ Common.button.rounded, Gutters.regularBMargin, styles.statePauseResumeButton ]}
									onPress={PauseRunningSession}
								>
									<Text style={Fonts.textRegular}>Pause</Text>
								</TouchableOpacity>
							)}
							{currentState === ActivityType.PAUSE && (
								<TouchableOpacity
									style={[ Common.button.rounded, Gutters.regularBMargin, styles.statePauseResumeButton ]}
									onPress={ResumeRunningSession}
								>
									<Text style={Fonts.textRegular}>Resume</Text>
								</TouchableOpacity>
							)}
							<WhiteText>{ActivityType[currentState]}</WhiteText>
						</View>
					</View>
				</View>
			</View>
		</ScreenBackgrounds>
	)
}

export default ActiveScreenSolo
