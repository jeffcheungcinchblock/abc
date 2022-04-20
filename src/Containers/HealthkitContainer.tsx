import React, { useState, useEffect ,useRef } from 'react'
import {
  View,
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Brand } from '@/Components'
import { useTheme } from '@/Hooks'
import { useLazyFetchOneQuery } from '@/Services/modules/users'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { Image } from 'react-native'
import { IOSHealthKit } from '../Healthkit/iosHealthKit'
import { GoogleFitKit } from '../Healthkit/androidHealthKit'
import Buttons from '@/Theme/components/Buttons'
import BackgroundGeolocation, {
  Location,
  Subscription,
} from 'react-native-background-geolocation'


const HealthkitContainer = () => {
    const { Common, Fonts, Gutters, Layout, Images, Colors } = useTheme()
    const [step, setStep] = useState(-1)
    const [dist, setDist] = useState(-1)
    const [calories, setCalories] = useState(-1)
    // const [isAuthorize, setIsAuthorize] = useState(false)
    const [heartRate, setHeartRate] = useState({})
    const [workout, setWorkout] = useState({})
    const [latitude, setLatitude] = useState<number|null>(null)
    const [longitude, setLongitude] = useState<number|null>(null)

    const latRef = useRef(latitude)
    const lngRef = useRef(longitude)
    const distRef = useRef(dist)
    const [events, setEvents] = React.useState<any[]>([])

    const isIOS = Platform.OS === 'ios'
    const health_kit = isIOS ? new IOSHealthKit() : new GoogleFitKit()

    const [enabled, setEnabled] = React.useState(false)

  useEffect(() => {
    console.log('start init background geo')
    /// 1.  Subscribe to events.
    const onLocation:Subscription = BackgroundGeolocation.onLocation((location) => {
      console.log('[event] location', location)
      console.log('speed', location.coords.speed )
      if (location.coords.speed && location.coords.speed > 0 && location.coords.speed < 10 && location.is_moving === true){
        console.log('old dist', distRef.current)
        BackgroundGeolocation.getOdometer().then((odometer)=>{
          console.log('[event] odometer', odometer)
          setDist(odometer)
        })
      } else {
        console.log('not moving')
      }
    })

    BackgroundGeolocation.ready({
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 1,
      stopTimeout: 5,
      debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      stopOnTerminate: false,   // <-- Allow the b
    }).then(()=>{
      BackgroundGeolocation.setOdometer(0).then(()=>{
        console.log('odometer set to 0')
      })
    })
    return () => {
      onLocation.remove()
    }
  }, [])



  /// Add the current state as first item in list.

  useEffect(() => {
    health_kit.GetAuthorizeStatus().then((isAuthorize) => {
      if (!isAuthorize){
      health_kit
      .InitHealthKitPermission()
      .then(val => {
        console.log(val)
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

  const StartWorkoutSession = () => {
    setDist(0)
    setStep(0)
    health_kit.StartWorkoutSession(new Date(), setStep,setDist)
  }
  const StopSessionListener = () => {
    console.log('stop')
    health_kit.StopWorkoutSession()
  }

  const StartListenDistance = async() => {
    setEnabled(true)
  }

  const StopListenDistance = () => {
    setEnabled(false)
  }


  useEffect(() => {
    if (enabled) {
      console.log('enable')
      BackgroundGeolocation.start()

    } else {
      console.log('disable')
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
        onPress={StartListenDistance}
       >
          <Text style={Fonts.textRegular}>Listen Workk</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[Common.button.rounded, Gutters.regularBMargin]}
        onPress={StopListenDistance}
       >
          <Text style={Fonts.textRegular}>Stop Workk</Text>
      </TouchableOpacity>
      <Text>Steps : {step}</Text>
      <Text>Distance : {dist}</Text>
      <Text>latitude : {latitude} </Text>
      <Text>longitude : {longitude}</Text>
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
