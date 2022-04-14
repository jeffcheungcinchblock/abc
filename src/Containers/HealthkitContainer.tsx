import React, { useState, useEffect } from 'react'
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

const HealthkitContainer = () => {
<<<<<<< HEAD
  const { Common, Fonts, Gutters, Layout, Images, Colors } = useTheme()
  console.log('hihihi')
  const [step, setStep] = useState(-1)
  const [dist, setDist] = useState(-1)
  const [calories, setCalories] = useState(-1)
  const [isAuthorize, setIsAuthorize] = useState(false)
  const [heartRate, setHeartRate] = useState({})
  const [workout, setWorkout] = useState({})
  const isIOS = Platform.OS === 'ios'
  const health_kit = isIOS ? new IOSHealthKit() : new GoogleFitKit()
=======
    const { Common, Fonts, Gutters, Layout, Images, Colors } = useTheme()
    const [step, setStep] = useState(-1)
    const [dist, setDist] = useState(-1)
    const [calories, setCalories] = useState(-1)
    const [isAuthorize, setIsAuthorize] = useState(false)
    const [heartRate, setHeartRate] = useState({})
    const [workout, setWorkout] = useState({})
    const isIOS = Platform.OS === "ios"
    const health_kit = isIOS ? new IOSHealthKit() : new GoogleFitKit()
    health_kit.GetAuthorizeStatus()
        .then(isAuthorize => {
            if (!isAuthorize) {
            }
        })
        .catch(err => {
            console.error(err)
        })
    health_kit.InitHealthKitPermission()
        .then(val => {
            console.log('InitHealthKitPermission', val)
        })
        .catch(err => {
            console.error(err)
        })
    // console.log('isIOS', isIOS)
    const UpdateHealthData = async () => {
        console.log('call Update')
        UpdateSteps()
        UpdateDistances()
        UpdateCalories()
        UpdateHeartRate()
        UpdateWorkoutSession()
    }
>>>>>>> 7ee512ad0b0a21eb6725f381fb130542e4fcc1c6

  useEffect(() => {
    health_kit
    .InitHealthKitPermission()
    .then(val => {
      console.log(val)
    })
    .catch(err => {
      console.error(err)
    })
  console.log('isIOS', isIOS)
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

<<<<<<< HEAD
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

  const StartSessionListener = () => {
    setDist(0)
    setStep(0)
    health_kit.StartSessionListener(setStep,setDist)
  }
  const StopSessionListener = () => {
    health_kit.StopSessionListener()
  }

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

      <TouchableOpacity
        style={[Common.button.rounded, Gutters.regularBMargin]}
        onPress={()=>StartSessionListener()}
       >
          <Text style={Fonts.textRegular}>Work</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[Common.button.rounded, Gutters.regularBMargin]}
        onPress={StopSessionListener}
       >
          <Text style={Fonts.textRegular}>End Workk</Text>
      </TouchableOpacity>
      <Text>Steps : {step}</Text>
      <Text>Distance : {dist}</Text>


      {/* <Text>HeartRate : {heartRate}</Text>
=======
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
>>>>>>> 7ee512ad0b0a21eb6725f381fb130542e4fcc1c6
            <Text>Workout : {workout}</Text> */}
    </ScrollView>
  )
}
export default HealthkitContainer
