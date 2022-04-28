import React, { useState, useEffect, useReducer } from 'react'
import {
	Text,
	TouchableOpacity,
	ScrollView,
	Platform,
	DrawerLayoutAndroidBase,
} from 'react-native'

import { useTheme } from '@/Hooks'
import { IOSHealthKit } from '../Healthkit/iosHealthKit'
import { GoogleFitKit } from '../Healthkit/androidHealthKit'
import BackgroundGeolocation, {
	Subscription,
} from 'react-native-background-geolocation'
import { getDistanceBetweenTwoPoints } from '@/Healthkit/utils'

type State = {
    startTime? : Date
    latitude? : number|null
    longitude? : number|null
    distance? : number
    calorie? : number
    steps?: number
    heartRate?: number
	coordinates? : Array<Coordinate>
}

type Coordinate = {
	latitude:number
	longitude:number
}
const isIOS = Platform.OS === 'ios'
const health_kit = isIOS ? new IOSHealthKit() : new GoogleFitKit()
const initialState:State = { startTime: new Date(), latitude:null, longitude:null, distance:0, calorie:0, steps:0, heartRate :0, coordinates :[ { latitude:0, longitude:0 } ] }

function reducer(state:State, action:any) {

	switch (action.type) {
	case 'ready':
		if (!action.location){
			console.log('no location ready')
			return { ...state }
		}
		if (!action.location.latitude || !action.location.longitude){
			console.log('have location ready')
			return { ...state }
		}
		return { ...state, latitude:action.location.latitude, longitude:action.location.longitude }
	case 'start':
		const initialStateStart:State = { startTime: new Date(), latitude:null, longitude:null, distance:0, calorie:0, steps:0, heartRate :0, coordinates :[] }
		return initialStateStart
	case 'move':
		const newCarlorieBurned = action.calorie
		const newSteps = action.steps
		const distance = getDistanceBetweenTwoPoints(state.latitude!, state.longitude!, action.latitude!, action.longitude!)
		// const newCoor = state.coordinates!.push({ latitude:action.latitude, longitude:action.longitude })
		const newCoor = [ ...state.coordinates!, { latitude:action.latitude, longitude:action.longitude } ]
		if (distance > 50){
			console.log('skit')
			return { ...state, latitude : action.latitude, longitude :action.longitude, calorie: newCarlorieBurned, steps: newSteps }
		}
		if (distance > 0)
		{
			return { ...state, latitude : action.latitude, longitude :action.longitude, distance : state.distance!  + distance, calorie: newCarlorieBurned, steps: newSteps, coordinates: newCoor, heartRate: action.heartRate }
		}
		console.log('skip')
		return { ...state, latitude : action.latitude, longitude :action.longitude, calorie: newCarlorieBurned, steps: newSteps }
	default:
		return { ...state }
	}
}
const HealthkitContainer = ({ navigation }) => {
	const { Common, Fonts, Gutters, Layout } = useTheme()
	const [ log, setLog ] = useState('')
	const [ isHealthkitReady, setIstHealthKitReady ] = useState(false)
	const [ enabled, setEnabled ] = React.useState(false)
	const [ ready, setReady ] = useState(false)
	const [ number, setNumber ] = useState(0)

	const [ state, dispatch ] = useReducer(reducer, initialState)

	useEffect(() => {
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
			setIstHealthKitReady(true)
		})})

	useEffect(() => {
		const onLocation: Subscription = BackgroundGeolocation.onLocation((location) => {
			if (location.coords && location.coords.latitude && location.coords.longitude && location.is_moving === true)
			{
				if (location.coords.speed && location.coords.speed <= 12 && location.coords.speed >= 0){
					const new_cal = health_kit.GetCaloriesBurned(state.startTime!, new Date())
					const new_step = health_kit.GetSteps(state.startTime!, new Date())
					const new_heartrate = health_kit.GetHeartRates(state.startTime!, new Date())
					Promise.all([ new_cal, new_step, new_heartrate ]).then((result)=>{
						dispatch({ type:'move', latitude:location.coords.latitude, longitude:location.coords.longitude,
							calorie:result[0], steps:result[1], heartRate:result[2] })
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
		// const onMotionChange: Subscription = BackgroundGeolocation.onMotionChange((event) => {console.log('[event] motionchange', event)})
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
			setReady(true)
			dispatch({ type:'ready' })
		})
		return () => {
			onLocation.remove()
			// onMotionChange.remove()
			// onActivityChange.remove()
			// onProviderChange.remove()
		}
	}, [ isHealthkitReady ])
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
		navigation.navigate('GeoLocation', { data: state })
	}

	const UpdateHealthData = () => {
		health_kit.InitHealthKitPermission().then((val) => {
			console.log('init healthkit', val)
		}
		)
	}
	useEffect(() => {
		const start = async() => {
			if (ready){
				let location = await BackgroundGeolocation.getCurrentPosition({
					timeout: 30,          // 30 second timeout to fetch location
					maximumAge: 5000,
					samples: 3,           // How many location samples to attempt.
				})
				dispatch({ type:'start', latitude : location.coords.latitude, longitude:location.coords.longitude })
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

			 {/* <TouchableOpacity
				style={[ Common.button.rounded, Gutters.regularBMargin ]}
				onPress={getGoogleAuth}
			>
				<Text style={Fonts.textRegular}>Get Google Auth</Text>
			</TouchableOpacity> */}
			<TouchableOpacity
				style={[ Common.button.rounded, Gutters.regularBMargin ]}
				onPress={UpdateHealthData}
			>

				<Text style={Fonts.textRegular}>Update Health Data</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={[ Common.button.rounded, Gutters.regularBMargin ]}
				onPress={StartRunningSession}
			>
				<Text style={Fonts.textRegular}>Start Running</Text>
			</TouchableOpacity>

			<Text>Start : {state.startTime?.toString()}</Text>
			<Text>Steps : {state.steps}</Text>
			<Text>Distance : {state.distance}</Text>
			<Text>Heart Rates : {state.heartRate}</Text>
			<Text>Calorie : {state.calorie}</Text>
			<Text>latitude : {state.latitude} </Text>
			<Text>longitude : {state.longitude}</Text>
			<Text>number : {number}</Text>
			<TouchableOpacity
				style={[ Common.button.rounded, Gutters.regularBMargin ]}
				onPress={StopRunningSession}
			>
				<Text style={Fonts.textRegular}>Stop Workk</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={[ Common.button.rounded, Gutters.regularBMargin ]}
				onPress={ShowMap}
			>
				<Text style={Fonts.textRegular}>View Map</Text>
			</TouchableOpacity>
		</ScrollView>
	)
}

export default HealthkitContainer
