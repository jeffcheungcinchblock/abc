import React, { useState, useEffect, FC, useRef } from 'react'
import { Text, ViewStyle, StyleSheet, Platform, View, TextProps, ViewProps, Image, Pressable, Alert, TextStyle } from 'react-native'
import { Spacing } from '@/Theme/Variables'

import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { StackScreenProps } from '@react-navigation/stack'
import { CompositeScreenProps } from '@react-navigation/native'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { DrawerScreenProps } from '@react-navigation/drawer'
import { useTheme } from '@/Hooks'
import { Brand, Header } from '@/Components'
import notifee from '@notifee/react-native'
import crashlytics from '@react-native-firebase/crashlytics'

import { IOSHealthKit } from '../../../Healthkit/iosHealthKit'
import { GoogleFitKit } from '../../../Healthkit/androidHealthKit'
import BackgroundGeolocation, { Subscription } from 'react-native-background-geolocation'
import { ActivityType } from '@/Store/Map/reducer'
import { store } from '@/Store'
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
import { metersecond_2_kmhour, metersecond_2_milehour } from './utils'
import EndWorkoutModal from '@/Components/Modals/EndWorkoutModal'
import { use } from 'i18next'
// @ts-ignore
// import BackgroundTimer from 'react-native-background-timer'
import { any } from 'prop-types'
import moment from 'moment'
import SpeedIcon from '@/Assets/Images/map/speed_crystal.png'
import TimerLogo from '@/Assets/Images/map/timer_crystal.png'
import StepLogo from '@/Assets/Images/map/step.png'
import { speedconst } from '@/Utils/constants'
import { FontSize } from '@/Theme/Variables'
import { startLoading } from '@/Store/UI/actions'
import mapReducer from '@/Store/Map/reducer'
import GPSContainer from '@/Components/GPS'

type WorkoutScreenScreenNavigationProp = CompositeScreenProps<
  StackScreenProps<WorkoutNavigatorParamList>,
  CompositeScreenProps<BottomTabScreenProps<TabNavigatorParamList>, DrawerScreenProps<DrawerNavigatorParamList>>
>
const styles = StyleSheet.create({
  mapContainer: {
    flex: 3,
  },
  header: {
    color: colors.white,
    fontFamily: 'Avenir',
    fontWeight: 'bold',
  },
  distanceTextStyle: {
    fontSize: 85,
    fontWeight: '700',
    color: colors.brightTurquoise,
    flex: 4,
  },

  mapDistanceText: {
    alignSelf: 'center',
    alignItems: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.crystal,
    flex: 1,
  },
  mapText: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
  },
  statusBarContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 20,
  },

  dataContainer: {
    flex: 3,
    backgroundColor: colors.darkGunmetal,
    color: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    // borderWidth:1,
  },
  dataPaddingContainer: {
    flex: 1,
    marginHorizontal: 15,
  },
  distanceContainer: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
  },
  textStyle: {
    fontSize: 18,
    textAlign: 'center',
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  stateButtonContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    width: '100%',
  },
  statePauseResumeButton: {
    backgroundColor: colors.brightTurquoise,
    height: 40,
    color: colors.black,
    width: '40%',
  },
  stateStopButton: {
    borderStyle: 'solid',
    borderColor: 'red',
    borderWidth: 2,
    backgroundColor: 'transparent',
    width: '40%',
  },
  stateStopButtonText: {
    color: 'red',
  },
  rowStepContentContainer: {
    flex: 0.5,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  rowSpeedTextContentContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  timerSpeedRowContentContainer: {
    flexDirection: 'row',
    width: '100%',
    flex: 1,
  },
  contentContainer: {
    display: 'flex',
    width: '100%',
    flex: 1,
    justifyContent: 'space-between',
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

export enum SpeedUnit {
  KILOMETRE_PER_HOUR = 'km/h',
  METER_PER_SECOND = 'm/s',
  MILE_PER_HOUR = 'm/h',
}

export enum TimeUnit {
  SECOND,
  HOUR,
  MINUTE,
}
const ActiveScreenSolo: FC<WorkoutScreenScreenNavigationProp> = ({ navigation, route }) => {
  const dispatch = useDispatch()
  const { Common, Fonts, Gutters, Layout } = useTheme()
  const { t } = useTranslation()

  // Redux
  const startTime = useSelector((state: any) => state.map.startTime)
  const steps = useSelector((state: any) => state.map.steps)
  const calories = useSelector((state: any) => state.map.calories)
  const distance = useSelector((state: any) => state.map.distance)
  const heartRate = useSelector((state: any) => state.map.heartRate)
  const paths = useSelector((state: any) => state.map.paths)
  const currentState = useSelector((state: any) => state.map.currentState)
  const overSpeedPaths = useSelector((state: any) => state.map.overSpeedPaths)
  const username = useSelector((state: any) => state.user.uuid)
  const speedUnit = useSelector((state: any) => state.unit.speedUnit)
  const currentSpeed = useSelector((state: any) => state.map.currentSpeed)
  const accuracy = useSelector((state: any) => state.map.accuracy)

  const [timer, setTimer] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [isStopping, setIsStopping] = useState(false)

  let timerIntervalId: NodeJS.Timer
  let stepIntervalId: NodeJS.Timer

  const endWorkoutRef = useRef<any>(null)

  // const onLesGoBtnPress = () =>
  useEffect(() => {
    timerIntervalId = setInterval(() => {
      let totalPauseTime = 0
      const temp_paths = store.getState().map.paths
      temp_paths.forEach((path: { pathTotalPauseTime: number }) => {
        if (path.pathTotalPauseTime) {
          totalPauseTime += path.pathTotalPauseTime
        }
      })
      const cur_timestamp = moment(new Date()).unix()
      const start_timestamp = moment(startTime).unix()
      const timer_second = cur_timestamp - start_timestamp - totalPauseTime
      const temp_state = store.getState().map.currentState
      if (temp_state !== ActivityType.PAUSE) {
        setTimer(Math.floor(timer_second))
      }
      if (temp_state === ActivityType.ENDED) {
        clearInterval(timerIntervalId)
      }
    }, 1000)
    return () => {
      clearInterval(timerIntervalId)
    }
  }, [])

  useEffect(() => {
    stepIntervalId = setInterval(() => {
      let totalReduceStep = 0
      const temp_paths = store.getState().map.paths
      temp_paths.forEach((path: { pathTotalPauseTime: number; pathTotalReduceStep: number }) => {
        if (path.pathTotalPauseTime) {
          totalReduceStep += path.pathTotalReduceStep
        }
      })
      if (isNaN(totalReduceStep)) {
        totalReduceStep = 0
      }
      const temp_state = store.getState().map.currentState
      if (temp_state !== ActivityType.PAUSE && temp_state !== ActivityType.OVERSPEED && startTime !== undefined) {
        const temp_step = health_kit.GetSteps(new Date(startTime), new Date())
        Promise.resolve(temp_step).then(step => {
          dispatch({ type: 'readSteps', payload: { steps: Math.floor(step) } })
        })
      }
      if (temp_state === ActivityType.ENDED) {
        clearInterval(stepIntervalId)
      }
      console.log('step interval', totalReduceStep, temp_paths)
    }, 10000)
    return () => {
      clearInterval(stepIntervalId)
    }
  }, [])

  const SUBSCRIPTIONS: Subscription[] = []
  const subscribe = (subscription: Subscription) => {
    SUBSCRIPTIONS.push(subscription)
  }
  const unsubscribe = () => {
    SUBSCRIPTIONS.forEach((subscription: Subscription) => subscription.remove())
  }
  const initLocation = async () => {
    subscribe(
      BackgroundGeolocation.onLocation(async location => {
        const temp_currentState = store.getState().map.currentState
        const temp_paths = store.getState().map.paths
        console.log(ActivityType[temp_currentState])
        if (temp_currentState !== ActivityType.PAUSE && startTime !== null && startTime !== undefined) {
          console.log('location', location)
          if (location.coords && location.coords.latitude && location.coords.longitude) {
            let speed = location.coords.speed!
            if (location.activity.type === 'still' && location.activity.confidence >= 90) {
              return
            }
            if (location.coords.accuracy > 20) {
              return
            }
            if (!location.coords.speed) {
              speed = 0
            }
            if (location.coords.speed === -1) {
              speed = 0
            }
            if (speed! >= speedconst.runningUpperLimit && temp_currentState !== ActivityType.OVERSPEED) {
              dispatch({
                type: 'overSpeed',
                payload: { startOverSpeedTime: new Date().getTime() },
              })
              return
            }
            if (speed! <= speedconst.runningUpperLimit && temp_currentState === ActivityType.OVERSPEED) {
              console.log('return to normal speed', startTime)
              const resumeTime = new Date()
              const pauseStateTime = temp_paths[temp_paths.length - 1].pauseTime!
              console.log('pauseStateTime', JSON.stringify(paths))
              const ReduceStep = health_kit.GetSteps(new Date(pauseStateTime), resumeTime)
              const ReduceCalories = health_kit.GetCaloriesBurned(new Date(pauseStateTime), resumeTime)
              Promise.all([ReduceStep, ReduceCalories])
                .then(result => {
                  dispatch({
                    type: 'returnToNormalSpeed',
                    payload: {
                      resumeTime: resumeTime.getTime(),
                      latitude: location.coords.latitude,
                      longitude: location.coords.longitude,
                      reduceStep: Math.floor(result[0]),
                      reduceCalories: Math.floor(result[1]),
                    },
                  })
                })
                .then(() => {
                  return
                })
            }

            if (temp_currentState === ActivityType.OVERSPEED) {
              console.log('overspeedmoving', location.coords.latitude, location.coords.longitude)
              dispatch({
                type: 'overSpeedMoving',
                payload: {
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  currentSpeed: speed,
                  accuracy: location.coords.accuracy,
                  curTime: new Date().getTime(),
                },
              })
            }
            if (temp_currentState === ActivityType.MOVING) {
              const new_cal = health_kit.GetCaloriesBurned(new Date(startTime), new Date())
              const new_step = health_kit.GetSteps(new Date(startTime), new Date())
              const new_heartrate = health_kit.GetHeartRates(new Date(startTime), new Date())
              Promise.all([new_cal, new_step, new_heartrate]).then(result => {
                dispatch({
                  type: 'move',
                  payload: {
                    curTime: new Date().getTime(),
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    calories: Math.floor(result[0]),
                    steps: Math.floor(result[1]),
                    heartRate: result[2],
                    firstLoad: false,
                    currentSpeed: speed,
                    accuracy: location.coords.accuracy,
                  },
                })
              })
            }
          } else {
            console.log('not moving')
          }
        }
      }),
    )
  }

  useEffect(() => {
    try {
      initLocation()
      BackgroundGeolocation.changePace(true)
    } catch (err) {
      crashlytics().recordError(err)
    }
    return () => {
      unsubscribe()
    }
  }, [])

  const stopButtonPress = () => {
    endWorkoutRef?.current?.open()
  }

  const closeStopModal = () => {
    endWorkoutRef?.current?.close()
  }
  const StopRunningSession = async () => {
    // Alert.alert(t('areYouSureToStop'), '', [
    //   {
    //     text: 'OK',
    //     onPress: async () => {
    dispatch(startLoading(true))
    clearInterval(timerIntervalId)
    clearInterval(stepIntervalId)
    setIsStopping(true)
    // await BackgroundGeolocation.changePace(false)
    await BackgroundGeolocation.stop()
    // await BackgroundGeolocation.changePace(false)
    dispatch({
      type: 'stop',
      payload: { endTime: new Date().getTime() },
    })
    // setIsStopped(true)
    try {
      const paths_string = JSON.stringify(paths)
      const over_speed_paths_string = JSON.stringify(overSpeedPaths)
      let new_speed = distance / timer

      const data = {
        startTime: startTime,
        endTime: new Date().getTime(),
        distance: distance,
        calories: calories,
        steps: steps,
        heartRate: heartRate,
        paths: paths_string,
        username: username,
        timer: timer,
        speed: new_speed,
        overSpeedPath: over_speed_paths_string,
      }
      console.log('data get', JSON.stringify(data, null, 2))
      let response = await axios.post('https://85vamr0pne.execute-api.us-west-2.amazonaws.com/dev/sessions', data)
      if (response) {
        setIsStopping(false)
        navigation.navigate(RouteStacks.endWorkout, data)
      }
    } catch (err) {
      console.log('err', err)
      navigation.replace(RouteStacks.endWorkout)
      crashlytics().recordError(err)
    } finally {
      dispatch(startLoading(false))
    }
  }
  // }
  // {
  //   text: 'Cancel',
  //   onPress: () => {},
  //   style: 'destructive',
  // },
  // ])
  // }

  const PauseRunningSession = async () => {
    console.log('pause')
    await BackgroundGeolocation.changePace(false)
    const curTime = new Date()
    dispatch({ type: 'pause', payload: { pauseTime: curTime.getTime() } })
  }

  const ResumeRunningSession = async () => {
    await BackgroundGeolocation.changePace(true)
    let location = await BackgroundGeolocation.getCurrentPosition({
      samples: 1,
      timeout: 10,
      maximumAge: 5000,
      desiredAccuracy: 5,
      persist: false,
    })
    const pauseStateTime = paths[paths.length - 1].pauseTime
    const ReduceStep = await health_kit.GetSteps(new Date(pauseStateTime), new Date())
    const ReduceCalories = await health_kit.GetCaloriesBurned(new Date(pauseStateTime), new Date())
    await Promise.all([ReduceStep, ReduceCalories]).then(result => {
      //Resume bring to moving state
      console.log('reduce step', result[0])
      dispatch({
        type: 'resume',
        payload: {
          resumeTime: new Date().getTime(),
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          reduceStep: result[0],
          reduceCalories: result[1],
        },
      })
      // dispatch({ type:'resume', payload:{ resumeTime:(new Date).getTime(), latitude:latitude, longitude:longitude, reduceStep:result[0], reduceCalories: result[1] }})
    })
  }

  const chanageSpeedUnit = () => {
    if (speedUnit === SpeedUnit.KILOMETRE_PER_HOUR) {
      // setSpeedUnit(SpeedUnit.MILE_PER_HOUR)
      dispatch({
        type: 'changeSpeedUnit',
        payload: { speedUnit: SpeedUnit.MILE_PER_HOUR },
      })
    } else if (speedUnit === SpeedUnit.MILE_PER_HOUR) {
      // setSpeedUnit(SpeedUnit.METER_PER_SECOND)
      dispatch({
        type: 'changeSpeedUnit',
        payload: { speedUnit: SpeedUnit.METER_PER_SECOND },
      })
    } else if (speedUnit === SpeedUnit.METER_PER_SECOND) {
      // setSpeedUnit(SpeedUnit.KILOMETRE_PER_HOUR)
      dispatch({
        type: 'changeSpeedUnit',
        payload: { speedUnit: SpeedUnit.KILOMETRE_PER_HOUR },
      })
    }
  }

  const BrightTurquoiseText = (props: TextProps) => {
    const { style, ...rest } = props
    return <Text style={[styles.textStyle, style, { color: colors.brightTurquoise, fontFamily: 'Poppins-Bold' }]} {...rest} />
  }
  const WhiteText = (props: TextProps) => {
    const { style, ...rest } = props
    return <Text style={[styles.textStyle, style, { color: colors.white, fontFamily: 'Poppins-Bold' }]} {...rest} />
  }

  const CrystalText = (props: TextProps) => {
    const { style, ...rest } = props
    return <Text style={[styles.textStyle, style, { color: colors.crystal, fontFamily: 'Poppins' }]} {...rest} />
  }
  const TITLE_MIDDLE: ViewStyle = {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  }
  const LEFT: ViewStyle = { flex: 1 }
  const RIGHT: ViewStyle = { flex: 1 }

  const ROOT: ViewStyle = {
    flexDirection: 'row',
    paddingHorizontal: Spacing[4],
    alignItems: 'center',
    paddingTop: Spacing[5],
    paddingBottom: Spacing[5],
    justifyContent: 'flex-start',
    backgroundColor: colors.darkGunmetal,
  }

  const HEADER: TextStyle = {
    paddingBottom: Spacing[5] - 1,
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[4],
    height: 80,
  }
  const StatusDot = (props: ViewProps) => {
    const { style, ...rest } = props
    return <View style={[style, { height: 10, width: 10, borderRadius: 50, margin: 10 }]} />
  }

  return (
    <MapScreenBackgrounds screenName={RouteStacks.workout}>
      {/* <Header headerText={ActivityType[currentState]} style={styles.header} /> */}
      <EndWorkoutModal ref={endWorkoutRef} onModalClose={closeStopModal} onActionBtnPress={StopRunningSession} />

      <View style={[ROOT, HEADER]}>
        <View style={LEFT} />
        <View style={TITLE_MIDDLE}>
          {currentState === ActivityType.OVERSPEED && (
            <>
              <StatusDot style={{ backgroundColor: 'red' }} />

              <Text style={[Fonts.textRegular, styles.header]}>{t('movingStatus.Overspeed')}</Text>
            </>
          )}
          {currentState === ActivityType.PAUSE && (
            <>
              <StatusDot style={{ backgroundColor: 'red' }} />
              <Text style={[Fonts.textRegular, styles.header]}>{t('movingStatus.Pause')}</Text>
            </>
          )}
          {currentState === ActivityType.MOVING && (
            <>
              <StatusDot style={{ backgroundColor: 'green' }} />
              <Text style={[Fonts.textRegular, styles.header]}>{t('movingStatus.Running')}</Text>
            </>
          )}
          {currentState === ActivityType.LOADING && (
            <>
              <StatusDot style={{ backgroundColor: 'red' }} />
              <Text style={[Fonts.textRegular, styles.header]}>{t('movingStatus.Loading')}</Text>
            </>
          )}
          {currentState === ActivityType.ENDED && (
            <>
              <StatusDot style={{ backgroundColor: 'red' }} />
              <Text style={[Fonts.textRegular, styles.header]}>{t('movingStatus.Ended')}</Text>
            </>
          )}
        </View>
        <View style={RIGHT}>
          <GPSContainer accuracy={accuracy}></GPSContainer>
        </View>
      </View>
      <View style={[styles.container]}>
        <View style={[styles.mapContainer]}>
          {/* {startRegion && ( */}
          <ActiveMapView timer={timer} speed={speed} />
          {/* )} */}
        </View>
        {/* <View><Text>{ActivityType[currentState]}</Text></View> */}
        <View style={[styles.dataContainer]}>
          <View style={[styles.dataPaddingContainer]}>
            {/* <View style={[ styles.statusBarContainer ]}>
							<TokenProgressBar token="Token"/>
							<EnergyProgressBar energy="Energy"/>
						</View> */}
            {/* <TokenEarned /> */}
            {/* <NFTDisplay /> */}
            {/* <View style={[ styles.pointContainer ]}/> */}
            <View style={[styles.distanceContainer]}>
              <BrightTurquoiseText style={styles.distanceTextStyle}>{(distance / 1000).toFixed(2)}</BrightTurquoiseText>
              <Text style={[styles.mapDistanceText]}>{t('totalKilo')}</Text>
            </View>
            <View style={[styles.rowStepContentContainer]}>
              <Image
                source={StepLogo}
                style={{
                  width: 20,
                  height: 20,
                  resizeMode: 'contain',
                  alignSelf: 'center',
                }}
              />
              <WhiteText> {steps}</WhiteText>
            </View>
            <View style={[styles.timerSpeedRowContentContainer]}>
              <View style={[styles.contentContainer]}>
                <Pressable style={{ flex: 1 }}>
                  <Image
                    source={TimerLogo}
                    style={{
                      resizeMode: 'contain',
                      alignSelf: 'center',
                      flex: 2,
                    }}
                  />
                  <WhiteText style={[{ lineHeight: 30, fontSize: 25, fontWeight: 'bold' }]}>
                    {Math.floor((timer % 3600) / 60)}"{Math.ceil(timer % 60)}'
                  </WhiteText>
                </Pressable>
              </View>
              <View style={[styles.contentContainer]}>
                <Pressable onPress={chanageSpeedUnit} style={{ flex: 1 }}>
                  <Image
                    source={SpeedIcon}
                    style={{
                      resizeMode: 'contain',
                      alignSelf: 'center',
                      flex: 2,
                    }}
                  />
                  <View style={[styles.rowSpeedTextContentContainer]}>
                    {speedUnit === SpeedUnit.KILOMETRE_PER_HOUR && (
                      <WhiteText style={[{ lineHeight: 30, fontSize: 25, fontWeight: 'bold' }]}>
                        {metersecond_2_kmhour(currentSpeed).toFixed(1)}
                      </WhiteText>
                    )}
                    {speedUnit === SpeedUnit.MILE_PER_HOUR && (
                      <WhiteText style={[{ lineHeight: 30, fontSize: 25, fontWeight: 'bold' }]}>
                        {metersecond_2_milehour(currentSpeed).toFixed(1)}
                      </WhiteText>
                    )}
                    {speedUnit === SpeedUnit.METER_PER_SECOND && (
                      <WhiteText style={[{ lineHeight: 30, fontSize: 25, fontWeight: 'bold' }]}>{currentSpeed.toFixed(1)}</WhiteText>
                    )}
                    <CrystalText style={{ lineHeight: 30, fontSize: 15 }}>{speedUnit}</CrystalText>
                  </View>
                </Pressable>
              </View>
            </View>
            <View style={[styles.stateButtonContainer]}>
              {currentState === ActivityType.PAUSE &&
                // currentState === ActivityType.MOVING ||
                // currentState === ActivityType.OVERSPEED) &&
                !isStopping && (
                  <Pressable style={[Common.button.rounded, Gutters.regularBMargin, styles.stateStopButton]} onPress={stopButtonPress}>
                    <Text
                      style={[
                        Fonts.textRegular,
                        styles.stateStopButtonText,
                        {
                          fontFamily: 'Poppins-Bold',
                          fontWeight: '600',
                          fontSize: 16,
                        },
                      ]}
                    >
                      {t('stop')}
                    </Text>
                  </Pressable>
                )}
              {currentState !== ActivityType.PAUSE && currentState !== ActivityType.ENDED && !isStopping && (
                <Pressable
                  style={[Common.button.rounded, Gutters.regularBMargin, styles.statePauseResumeButton]}
                  onPress={PauseRunningSession}
                >
                  <Text
                    style={
                      (Fonts.textRegular,
                      {
                        fontFamily: 'Poppins-Bold',
                        fontWeight: '600',
                        fontSize: 16,
                      })
                    }
                  >
                    {t('pause')}
                  </Text>
                </Pressable>
              )}
              {currentState === ActivityType.PAUSE && !isStopping && (
                <Pressable
                  style={[Common.button.rounded, Gutters.regularBMargin, styles.statePauseResumeButton]}
                  onPress={ResumeRunningSession}
                >
                  <Text
                    style={
                      (Fonts.textRegular,
                      {
                        fontFamily: 'Poppins-Bold',
                        fontWeight: '600',
                        fontSize: 16,
                      })
                    }
                  >
                    {t('resume')}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </View>
    </MapScreenBackgrounds>
  )
}

export default ActiveScreenSolo
