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
}
const isIOS = Platform.OS === 'ios'
const health_kit = isIOS ? new IOSHealthKit() : new GoogleFitKit()
const initialState:State = { startTime: new Date(), latitude:null, longitude:null, distance:0, calorie:0, steps:0, heartRate :0 }

function reducer(state:State, action:any) {
	console.log('inside reducer', action.type)
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
		const initialStateStart:State = { startTime: new Date(), latitude:null, longitude:null, distance:0, calorie:0, steps:0, heartRate :0 }
		return initialStateStart
		// return initialState
	case 'move':
		const newCarlorieBurned = action.calorie
		const newSteps = action.steps
		console.log(state.latitude, ' ', state.longitude, ' ', action.latitude, ' ', action.longitude)
		const distance = getDistanceBetweenTwoPoints(state.latitude!, state.longitude!, action.latitude!, action.longitude!)

		if (distance >= 0)
		{
			console.log('return 1')
			return { ...state, latitude : action.latitude, longitude :action.longitude, distance : state.distance!  + distance, calorie: newCarlorieBurned, steps: newSteps }
			// return { ...state }
		}
		console.log('return 2')

		return { ...state, latitude : action.latitude, longitude :action.longitude, calorie: newCarlorieBurned, steps: newSteps }
	default:
		return { ...state }
	}
}
const HealthkitContainer = () => {
	const { Common, Fonts, Gutters, Layout } = useTheme()
	const [ log, setLog ] = useState('')
	const [ enabled, setEnabled ] = React.useState(false)
	const [ ready, setReady ] = useState(false)

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
		})})

	useEffect(() => {

		const onLocation: Subscription = BackgroundGeolocation.onLocation((location) => {
			console.log('listening')
			if (location.coords && location.coords.latitude && location.coords.longitude && location.is_moving === true)
			{
				console.log(location.coords)
				if (location.coords.speed && location.coords.speed <= 12 && location.coords.speed >= 0){
					// const new_cal = health_kit.GetCaloriesBurned(state.startTime!, new Date())
					// const new_step = health_kit.GetSteps(state.startTime!, new Date())
					const new_cal = 123
					const new_step = 123
					// Promise.all([ new_cal, new_step ]).then((result)=>{
					// 	dispatch({ type:'move', latitude:location.coords.latitude, longitude:location.coords.longitude, calorie:result[0], steps:result[1] })
					// })
					Promise.all([ new_cal, new_step ]).then((result)=>{
						dispatch({ type:'move', latitude:location.coords.latitude, longitude:location.coords.longitude, calorie:result[0], steps:result[1] })
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
		// const onMotionChange:Subscription = BackgroundGeolocation.onMotionChange((event) => {
		// 	console.log('[onMotionChange]', event)
		// })

		// const onActivityChange:Subscription = BackgroundGeolocation.onActivityChange((event) => {
		// 	console.log('[onMotionChange]', event)
		// })

		// const onProviderChange:Subscription = BackgroundGeolocation.onProviderChange((event) => {
		// 	console.log('[onProviderChange]', event)
		// })

		BackgroundGeolocation.ready({
			locationAuthorizationRequest : 'WhenInUse',
			desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
			distanceFilter: 3,
			stopTimeout: 5,
			isMoving: true,
			reset: false,
			debug: true, // <-- enable this hear debug sounds.
			// locationUpdateInterval: 5000,
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
	}, [])
	/// Add the current state as first item in list.



	const UpdateHealthData = async () => {
		UpdateSteps()
		UpdateDistances()
		UpdateCalories()
		UpdateHeartRate()
		UpdateWorkoutSession()
	}
	const getGoogleAuth = async () => {
		health_kit.InitHealthKitPermission().then((result)=>{
			console.log('auth', result)
		})
	}
	const UpdateSteps = () => {
		// health_kit
		// 	.GetSteps(start_date, end_date)
		// 	.then((val: React.SetStateAction<number>) => {
		// 		setStep(val)
		// 	})
		console.log('update')
	}
	const UpdateDistances = () => {
		health_kit
			.GetDistances(start_date, end_date)
			.then((val: React.SetStateAction<number>) => {
				setDist(val)
			})
	}
	const UpdateCalories = () => {
		// health_kit
		// 	.GetCaloriesBurned(start_date, end_date)
		// 	.then((val: React.SetStateAction<number>) => {
		// 		setCalories(val)
		// 	})
	}
	const UpdateHeartRate = () => {
		health_kit
			.GetHeartRates(start_date, end_date)
			.then((val: React.SetStateAction<{}>) => {
				setHeartRate(val)
			})
	}
	const UpdateWorkoutSession = () => {
		// health_kit
		// 	.GetWorkoutSession(start_date, end_date)
		// 	.then((val: React.SetStateAction<{}>) => {
		// 		setWorkout(val)
		// 	})
		console.log('update')
	}

	const StartRunningSession = () => {
		health_kit.GetAuthorizeStatus().then((isAuthorize) => {
			if (!isAuthorize) {
				health_kit.InitHealthKitPermission().then((val) => {
					console.log('init healthkit', val)
				})
			}
		})
		console.log('start')
		if (!enabled){
			setEnabled(true)
		}
	}
	const StopRunningSession = () => {
		console.log('stop')
		if (enabled){
			setEnabled(false)
		}
		// health_kit.StopWorkoutSession()
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
			start()
		} else {
			console.log('button disable')
			BackgroundGeolocation.stop()
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
				onPress={getGoogleAuth}
			>
				<Text style={Fonts.textRegular}>Get Google Auth</Text>
			</TouchableOpacity>
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
			<TouchableOpacity
				style={[ Common.button.rounded, Gutters.regularBMargin ]}
				onPress={StopRunningSession}
			>
				<Text style={Fonts.textRegular}>Stop Workk</Text>
			</TouchableOpacity>
			<Text>Start : {state.startTime?.toString()}</Text>
			<Text>Steps : {state.steps}</Text>
			<Text>Distance : {state.distance}</Text>
			<Text>Calorie : {state.calorie}</Text>
			<Text>latitude : {state.latitude} </Text>
			<Text>longitude : {state.longitude}</Text>
			<Text>Log : {log}</Text>
		</ScrollView>
	)
}
export default HealthkitContainer
