import React, { useState, useEffect, FC,useRef } from 'react'
import {
	Text,
	TouchableOpacity,
	StyleSheet,
	Platform,
	View,
	TextProps,
	Image
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { StackScreenProps } from '@react-navigation/stack'
import { CompositeScreenProps } from '@react-navigation/native'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { DrawerScreenProps } from '@react-navigation/drawer'
import { useTheme } from '@/Hooks'
import { Brand, Header } from '@/Components'

import { IOSHealthKit } from '../../../Healthkit/iosHealthKit'
import { GoogleFitKit } from '../../../Healthkit/androidHealthKit'
import BackgroundGeolocation, { Subscription } from 'react-native-background-geolocation'
import { ActivityType } from '@/Store/Map/reducer'
import { RouteStacks } from '@/Navigators/routes'
import { WorkoutNavigatorParamList } from '@/Screens/App/WorkoutScreen'
import { DrawerNavigatorParamList, TabNavigatorParamList } from '@/Navigators/MainNavigator'
import MapScreenBackgrounds from '@/Components/MapScreenBackgrounds'
import axios from 'axios'
import { colors, config } from '@/Utils/constants'

import ActiveMapView from '@/Components/Map/index'
import EnergyProgressBar from '@/Components/WorkoutScreen/energy_progress_bar'
import TokenProgressBar from '@/Components/WorkoutScreen/token_progress_bar'
import TokenEarned from '@/Components/WorkoutScreen/token_earned'
import NFTDisplay from '@/Components/WorkoutScreen/nft_display'
import { metersecond_2_kmhour } from './utils'
import EndWorkoutModal from '@/Components/Modals/EndWorkoutModal'
import { use } from 'i18next'
// @ts-ignore
// import BackgroundTimer from 'react-native-background-timer'
import { any } from 'prop-types'
import moment from 'moment'
import SpeedIcon from '@/Assets/Images/map/speed_crystal.png'
import TimerLogo from '@/Assets/Images/map/timer_crystal.png'
import StepLogo from '@/Assets/Images/map/step.png'
import {speedconst} from '@/Utils/constants'
import { FontSize } from '@/Theme/Variables'


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
	header:{
		backgroundColor:colors.darkGunmetal
	},
	distanceTextStyle:{
		fontSize: 100,
		fontWeight:'700',
		// lineHeight:150,
		color: colors.brightTurquoise,
	},

	mapDistanceText:{
		alignSelf:'center',
		alignItems:'center',
		fontSize: 20,
		fontWeight: 'bold',
		color:colors.crystal
	},

	mapText : {
		marginLeft:10,
		fontSize: 18,
		fontWeight: 'bold',
	},
	container:{
		flex:1,
		backgroundColor: 'transparent',
	},
	statusBarContainer: {
		flexDirection: 'row',
		// justifyContent: 'space-around',
		width:'100%',
		marginTop:20,
	},

	dataContainer:{
		flex:3,
		backgroundColor: colors.darkGunmetal,
		color:'#fff',
		borderTopLeftRadius:10,
		borderTopRightRadius:10,
		// borderWidth:1,

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
		width: '100%',
	},
	statePauseResumeButton:{
		backgroundColor: '#00F2DE',
		height:40,
		color:colors.brightTurquoise,
		width: '40%',

	},
	stateStopButton:{
		borderStyle: 'solid',
		borderColor: 'red',
		borderWidth: 2,
		backgroundColor:'transparent',
		width: '40%',
	},
	stateStopButtonText:{
		color:'red'
	},
	rowContentContainer : {
		flexDirection: 'row',
		alignItems:'center',
		alignContent:'center',
		width:'100%',
		justifyContent:'center',
	},
	rowContentContainer2 : {
		flexDirection: 'row',
		justifyContent:'space-around',
		display:'flex',
		// height:100,
		width:'100%',
		marginTop: 20,

	},
	colContentContainer : {
		flexDirection: 'column',
		alignItems:'center',
		width:'100%',
		// height:50,
	},
	contentContainer: {
		display: 'flex',
		width:'100%',
		
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
	const overSpeed = useSelector((state:any) => state.map.overSpeed)
	const overSpeedPaths = useSelector((state:any) => state.map.overSpeedPaths)
	const username = useSelector((state:any)=> state.user.uuid)


	// const [ startRegion, setStartRegion ] = useState<Region|null>({ latitude: 0.09, longitude:0.09, latitudeDelta:0.0922, longitudeDelta:0.0421 })
	const [ timer, setTimer ] = useState(0)
	const [ speed, setSpeed ] = useState(0)

	useEffect(() => {
		const intervalId = setInterval(() => {
			console.log('overSpeedPaths',overSpeedPaths)
			let totalPauseTime = 0
			paths.forEach((path) => {
				if (path.pathTotalPauseTime){
					totalPauseTime += path.pathTotalPauseTime
				}
			})
			const cur_timestamp = moment(new Date()).unix()
			const start_timestamp = moment(startTime).unix()
			const timer_second = cur_timestamp - start_timestamp - totalPauseTime
			const new_speed = metersecond_2_kmhour(distance/timer_second)
			if (currentState !== ActivityType.PAUSE){
				setTimer(Math.floor(timer_second))
				setSpeed(new_speed)
			}
		}, 1000)
		return () => {
			clearInterval(intervalId)
		}
	}, [ currentState, distance ])

	

	useEffect(()=>{
	
		const onLocation: Subscription = BackgroundGeolocation.onLocation((location) => {
			console.log(ActivityType[currentState], 'startTime', startTime)
			if (currentState !== ActivityType.PAUSE && startTime !== null && startTime !== undefined){
				if (location.coords && location.coords.latitude && location.coords.longitude && location.is_moving === true && location.coords.speed != -1)
				{
					if(!location.coords.speed){
						return
					}
					console.log('speed', location.coords.speed)
					if(location.coords.speed! <= speedconst.runningLowerLimit){
						return
					}
					console.log(ActivityType[currentState])
					if (location.coords.speed! >= speedconst.runningUpperLimit && currentState !== ActivityType.OVERSPEED){
						dispatch({type:'overSpeed',payload:{startOverSpeedTime: (new Date).getTime()}})
						console.log('Over speed')
						return
					}
					if (location.coords.speed! <= speedconst.runningUpperLimit && currentState === ActivityType.OVERSPEED){
				
					const pauseStateTime = paths[paths.length - 1].pauseTime
					const ReduceStep =  health_kit.GetSteps(new Date(pauseStateTime), new Date())
					const ReduceCalories = health_kit.GetCaloriesBurned(new Date(pauseStateTime), new Date())
						Promise.all([ReduceStep,ReduceCalories]).then((result)=>{
							dispatch({ type:'returnToNormalSpeed', payload:{ resumeTime:(new Date).getTime(), latitude:location.coords.latitude, longitude:location.coords.longitude, reduceStep:result[0], reduceCalories: result[1] }})
						}).then(()=>{return})
					}
					// if (currentState === ActivityType.OVERSPEED && )
					

					// const pauseStateTime = paths[paths.length - 1].pauseTime
					// const ReduceStep =  health_kit.GetSteps(new Date(pauseStateTime), new Date())
					// const ReduceCalories =  health_kit.GetCaloriesBurned(new Date(pauseStateTime), new Date())

					if (currentState === ActivityType.OVERSPEED){
						// Promise.all([ new_cal, new_step, new_heartrate ]).then((result)=>{
							dispatch({ type:'overSpeedMoving', payload:{ latitude:location.coords.latitude, longitude:location.coords.longitude
							} })
						// })
						
					}
					if (currentState === ActivityType.MOVING){

						const new_cal = health_kit.GetCaloriesBurned(new Date(startTime), new Date())
						const new_step = health_kit.GetSteps(new Date(startTime), new Date())
						const new_heartrate = health_kit.GetHeartRates( new Date(startTime), new Date())
					
						Promise.all([ new_cal, new_step, new_heartrate ]).then((result)=>{
							dispatch({ type:'move', payload:{ latitude:location.coords.latitude, longitude:location.coords.longitude,
								calories:result[0], steps:result[1], heartRate:result[2] } })
						})
					}
				} else {
					console.log('not moving')
				}
			}
		})


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
			speedJumpFilter:20,
			logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
			stopOnTerminate: true,
		}).then((state)=>{
			if(!state.enabled){
				BackgroundGeolocation.changePace(true)
				BackgroundGeolocation.start()
				console.log('ready')
			}
		})
		return () => {
			onLocation.remove()
		}
	}, [currentState])

	
	const StopRunningSession = async() => {
		await BackgroundGeolocation.changePace(false)
		// await BackgroundGeolocation.stop()
		dispatch({ type:'stop', payload:{ endTime: (new Date()).getTime() } })
		// setIsStopped(true)
		try{
			const paths_string = JSON.stringify(paths)
			const over_speed_paths_string = JSON.stringify(overSpeedPaths)
			const data = {
				startTime : startTime,
				endTime : (new Date()).getTime(),
				distance: distance,
				calories : calories,
				steps: steps,
				heartRate: heartRate,
				paths: paths_string,
				username: username,
				timer: timer,
				// speed: speed,
				overSpeedPath: over_speed_paths_string
			}
			console.log('data get', data)
			let response = await axios.post('https://85vamr0pne.execute-api.us-west-2.amazonaws.com/dev/sessions', data)
			navigation.replace(RouteStacks.endWorkout, data)
		
		}catch(err){
			console.log('err', err)
		}
		
	}

	const PauseRunningSession = async() => {
		const curTime = new Date()
		dispatch({ type:'pause', payload:{ pauseTime:curTime.getTime() } })
		await BackgroundGeolocation.changePace(false)
	}

	const ResumeRunningSession = async() => {
		// onTimerStart()
		let location = await BackgroundGeolocation.getCurrentPosition({ samples: 1,
			persist: true })
		const pauseStateTime = paths[paths.length - 1].pauseTime
		const ReduceStep = await  health_kit.GetSteps(new Date(pauseStateTime), new Date())
		const ReduceCalories = await health_kit.GetCaloriesBurned(new Date(pauseStateTime), new Date())
		await Promise.all([ReduceStep,ReduceCalories]).then((result)=>{
			//Resume bring to moving state
			dispatch({ type:'resume', payload:{ resumeTime:(new Date).getTime(), latitude:location.coords.latitude, longitude:location.coords.longitude, reduceStep:result[0], reduceCalories: result[1] }})
		})
		await BackgroundGeolocation.changePace(true)

	}
	const WhiteText = (props: TextProps) => {
		const { style, ...rest } = props
		return <Text style={[ styles.textStyle, style ]} {...rest} />
	}

	return (
		<MapScreenBackgrounds screenName={RouteStacks.workout} >
		
			<Header
				headerText={ActivityType[currentState]}
				style={styles.header}
			/>
			<View style={[ styles.container ]}>
				<View style={[ styles.mapContainer ]}>
					{/* {startRegion && ( */}
						<ActiveMapView timer={timer} speed={speed}/>
					{/* )} */}
				</View>
				{/* <View><Text>{ActivityType[currentState]}</Text></View> */}
				<View style={[ styles.dataContainer ]}>
					<View style={[ styles.dataPaddingContainer ]}>
						{/* <View style={[ styles.statusBarContainer ]}>
							<TokenProgressBar token="Token"/>
							<EnergyProgressBar energy="Energy"/>
						</View> */}
						{/* <TokenEarned /> */}
						{/* <NFTDisplay /> */}
						{/* <View style={[ styles.pointContainer ]}/> */}
						<WhiteText style={styles.distanceTextStyle}>{(distance / 1000).toFixed(2)}</WhiteText>
						<View>
						<Text style={[ styles.mapDistanceText ]}>Total Kilometers</Text>
						<View style={[styles.rowContentContainer]}>
						<Image source={StepLogo} style={{ width: 18.14, height: 20, resizeMode: 'contain', alignSelf:'center' }}></Image>
							<WhiteText> {steps.toFixed(0)}</WhiteText>
						</View>
						</View>
						<View style={[ styles.rowContentContainer2 ]}>
						<View style={[ styles.contentContainer ]}>
							<Image source={TimerLogo} style={{ width: 18.14, height: 20, resizeMode: 'contain', alignSelf:'center' }} />
							<WhiteText style={[{fontSize:30, fontWeight:'bold' }]}>{Math.floor(timer % 3600 / 60)}"{Math.ceil(timer % 60 )}'</WhiteText>
						</View>
						<View style={[ styles.contentContainer ]}>
							<Image source={SpeedIcon} style={{ width: 18.14, height: 20, resizeMode: 'contain', alignSelf:'center' }} />
							<View style={[ styles.rowContentContainer]} ><WhiteText style={[{fontSize:30, fontWeight:'bold' }]}>{speed.toFixed(1)}</WhiteText><WhiteText style={{ fontSize: 10, alignSelf:'flex-end' }}>km/h</WhiteText></View>
						</View>
						</View>
						<View style={[ styles.stateButtonContainer ]}>
							{ (currentState === ActivityType.PAUSE || currentState === ActivityType.MOVING || currentState === ActivityType.OVERSPEED) && (
								<TouchableOpacity
									style={[ Common.button.rounded, Gutters.regularBMargin, styles.stateStopButton ]}
									onPress={StopRunningSession}
								>
									<Text style={[ Fonts.textRegular, styles.stateStopButtonText ]}>Stop</Text>
								</TouchableOpacity>

							)}
							{currentState !== ActivityType.PAUSE && currentState !== ActivityType.ENDED && (
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
						</View>
					</View>
				</View>
				
			
			</View>
		</MapScreenBackgrounds>
	)
}

export default ActiveScreenSolo
