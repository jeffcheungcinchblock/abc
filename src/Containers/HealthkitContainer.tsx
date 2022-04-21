import React, { useState, useEffect,useReducer } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Platform,
} from 'react-native'

import { useTheme } from '@/Hooks'

import { Image } from 'react-native'
import { IOSHealthKit } from '../Healthkit/iosHealthKit'
import { GoogleFitKit } from '../Healthkit/androidHealthKit'
import BackgroundGeolocation, {
    Subscription,
} from 'react-native-background-geolocation'
import { getDistanceBetweenTwoPoints } from '@/Healthkit/utils'

const initialState:any = { latitude:null, longitude:null, dist:0 }


function reducer(state:any, action:any) {
    console.log('state',state)
    console.log('action',action)
    switch (action.type) {
      case 'move':
          const dist = getDistanceBetweenTwoPoints(state.latitude,state.longitude,action.latitude,action.longitude)
        return { latitude : action.latitude, longitude :action.longitude, dist : state.dist + dist }
      default:
        throw new Error()
    }
}



const HealthkitContainer = () => {
    const { Common, Fonts, Gutters, Layout, Images } = useTheme()
    const [step, setStep] = useState(-1)
    const [calories, setCalories] = useState(-1)
    // const [isAuthorize, setIsAuthorize] = useState(false)
    const [heartRate, setHeartRate] = useState({})
    const [workout, setWorkout] = useState({})
    const [log, setLog] = useState('')
    const isIOS = Platform.OS === 'ios'
    const health_kit = isIOS ? new IOSHealthKit() : new GoogleFitKit()
    const [enabled, setEnabled] = React.useState(false)

    const [state, dispatch] = useReducer(reducer, initialState)

    useEffect(() => {
        console.log('start init background geo')
        const onLocation: Subscription = BackgroundGeolocation.onLocation((location) => {
            setLog(log + '\n' + JSON.stringify(location))
            console.log('[event] location', location)

            if (location.coords && location.coords.latitude && location.coords.longitude && location.is_moving === true)
             {
                 if (location.coords.speed && location.coords.speed <= 12){
                    dispatch({ type:'move', latitude:location.coords.latitude, longitude:location.coords.longitude })
                 } else {
                     console.log('moving too fast')
                 }
            } else {
                console.log('not moving')
            }


            // if (location && location.coords && location.is_moving && location.coords.speed && location.coords.speed < 10 ) {
            //     // const newDist = dist +  getDistanceBetweenTwoPoints(latitude, longitude, location.coords.latitude, location.coords.longitude)
            // setLatitude(location.coords.latitude)
            // setLongitude(location.coords.longitude)
            //     setDist(getDistanceBetweenTwoPoints())
            // } else {
            //     console.log('stopped')
            // }
        })
        // const onMotionChange: Subscription = BackgroundGeolocation.onMotionChange((event) => {console.log('[event] motionchange', event)})

        BackgroundGeolocation.ready({
            locationAuthorizationRequest : 'WhenInUse',
            desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
            distanceFilter: 1 ,
            stopTimeout: 5,
            isMoving: true,
            reset: false,
            logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
            stopOnTerminate: false,   // <-- Allow the b
        }).then(()=>{
            console.log('ready')
        })
        return () => {
            onLocation.remove()
        }
    }, [])
    /// Add the current state as first item in list.

    useEffect(() => {
        health_kit.GetAuthorizeStatus().then((isAuthorize) => {
            if (!isAuthorize) {
                health_kit
                    .InitHealthKitPermission()
                    .then(val => {
                        console.log('inti health kit',val)
                    })
                    .catch(err => {
                        console.error(err)
                    })
            }
        })
    }, [])

    const UpdateHealthData = async () => {
        UpdateSteps()
        UpdateDistances()
        UpdateCalories()
        UpdateHeartRate()
        UpdateWorkoutSession()
    }

    const getGoogleAuth = async () => {
        const auth = await health_kit.InitHealthKitPermission()
        console.log('auth', auth)
    }

    const start_date = new Date(2022, 3, 1)
    const end_date = new Date()
    const UpdateSteps = () => {
        health_kit
            .GetSteps(start_date, end_date)
            .then((val: React.SetStateAction<number>) => {
                setStep(val)
            })
    }
    const UpdateDistances = () => {
        health_kit
            .GetDistances(start_date, end_date)
            .then((val: React.SetStateAction<number>) => {
                setDist(val)
            })
    }
    const UpdateCalories = () => {
        health_kit
            .GetCaloriesBurned(start_date, end_date)
            .then((val: React.SetStateAction<number>) => {
                setCalories(val)
            })
    }
    const UpdateHeartRate = () => {
        health_kit
            .GetHeartRates(start_date, end_date)
            .then((val: React.SetStateAction<{}>) => {
                setHeartRate(val)
            })
    }
    const UpdateWorkoutSession = () => {
        health_kit
            .GetWorkoutSession(start_date, end_date)
            .then((val: React.SetStateAction<{}>) => {
                setWorkout(val)
            })
    }

    const StartRunningSession = () => {
        setEnabled(true)
        setStep(0)
        // health_kit.StartWorkoutSession(new Date(), setStep, setDist)
    }
    const StopRunningSession = () => {
        console.log('stop')
        setEnabled(false)
        // health_kit.StopWorkoutSession()
    }


    useEffect(() => {
        if (enabled === true) {
            console.log('button enable')
            BackgroundGeolocation.start()

        } else {
            console.log('button disable')
            BackgroundGeolocation.stop()
        }
    }, [enabled])

    return (
        <ScrollView
            style={Layout.fill}
            contentContainerStyle={[
                Layout.fill,
                Layout.colCenter,
                Gutters.smallHPadding,
            ]}
        >
            <View style={{ height: 200, width: 200 }}>
                <Image
                    style={Layout.fullSize}
                    source={Images.logo}
                    resizeMode={'contain'}
                />
            </View>
            <TouchableOpacity
                style={[Common.button.rounded, Gutters.regularBMargin]}
                onPress={getGoogleAuth}
            >
                <Text style={Fonts.textRegular}>Get Google Auth</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[Common.button.rounded, Gutters.regularBMargin]}
                onPress={UpdateHealthData}
            >


                <Text style={Fonts.textRegular}>Update Health Data</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
        style={[Common.button.rounded, Gutters.regularBMargin]}
        onPress={(StartWorkoutSession)}
       >
          <Text style={Fonts.textRegular}>Work</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[Common.button.rounded, Gutters.regularBMargin]}
        onPress={StopSessionListener}
       >
          <Text style={Fonts.textRegular}>End Workk</Text>
      </TouchableOpacity> */}
            <TouchableOpacity
                style={[Common.button.rounded, Gutters.regularBMargin]}
                onPress={StartRunningSession}
            >
                <Text style={Fonts.textRegular}>Start Running</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[Common.button.rounded, Gutters.regularBMargin]}
                onPress={StopRunningSession}
            >
                <Text style={Fonts.textRegular}>Stop Workk</Text>
            </TouchableOpacity>
            <Text>Steps : {step}</Text>
            <Text>Distance : {state.dist}</Text>

            <Text>latitude : {state.latitude} </Text>
            <Text>longitude : {state.longitude}</Text>
            <Text>Log : {log}</Text>


            {/* <Text>location : {location}</Text> */}
            {/* <Text>prevLatitude : { prevLatitude}</Text> */}

            {/* <Text>HeartRate : {heartRate}</Text>
    return (
        <ScrollView
            style={Layout.fill}
            contentContainerStyle={[
                Layout.fill,
                Layout.colCenter,
                Gutters.smallHPadding,
            ]}
        >
            <View style={{ height: 200, width: 200 }}>
                <Image style={Layout.fullSize} source={Images.logo} resizeMode={"contain"} />
            </View>
            <TouchableOpacity
                style={[Common.button.rounded, Gutters.regularBMargin]}
                onPress={UpdateHealthData}
            >
                <Text style={Fonts.textRegular}>Update Health Data</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[Common.button.rounded, Gutters.regularBMargin]}
                onPress={health_kit.StartWorkoutSession}
            >
                <Text style={Fonts.textRegular}>Start Workout Session</Text>
            </TouchableOpacity>
            <Text>Steps : {step}</Text>
            <Text>Distance : {dist}</Text>
            {/* <Text>HeartRate : {heartRate}</Text>
            <Text>Workout : {workout}</Text> */}
        </ScrollView>
    )
}
export default HealthkitContainer
