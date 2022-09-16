import React, { useState, useEffect, FC } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import { View, Text, StyleSheet, Image, TextProps, TextStyle, Platform, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/Hooks'
// @ts-ignore
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { RouteStacks, RouteTabs } from '@/Navigators/routes'
// @ts-ignore
// @ts-ignore
import { useWalletConnect } from '@walletconnect/react-native-dapp'
import CameraRoll from '@react-native-community/cameraroll'
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { colors } from '@/Utils/constants'
import { Brand, Header } from '@/Components'
// import SpeedLogo from '@/Assets/Images/map/speed.png'
import TurquoiseButton from '@/Components/Buttons/TurquoiseButton'
import SocialShareButton from '@/Components/Buttons/SocialShareButton'
import SaveScreenButton from '@/Components/Buttons/SaveScreenButton'
import CloseButton from '@/Components/Buttons/CloseButton'
import ConGratualtion from '@/Assets/Images/Modal/reward.png'
import SpeedIcon from '@/Assets/Images/map/speed_crystal.png'
import TimerLogo from '@/Assets/Images/map/timer_crystal.png'
import StepLogo from '@/Assets/Images/map/step.png'

import { captureScreen } from 'react-native-view-shot'
import Share from 'react-native-share'
import { FontSize } from '@/Theme/Variables'
import { hasAndroidPermission } from '@/Utils/permissionHandlers'
import crashlytics from '@react-native-firebase/crashlytics'
import { triggerSnackbar } from '@/Utils/helpers'
import { metersecond_2_kmhour, metersecond_2_milehour } from './utils'
import { SpeedUnit } from './ActiveScreenSolo'
import { SafeAreaView } from 'react-native-safe-area-context'
import AvenirText from '@/Components/FontText/AvenirText'
import { WorkoutNavigatorParamList } from '../WorkoutScreen'
import { CompositeScreenProps, StackActions } from '@react-navigation/native'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { DrawerNavigatorParamList, TabNavigatorParamList } from '@/Navigators/MainNavigator'
import { DrawerScreenProps } from '@react-navigation/drawer'
// import share from '@/Utils/endshare'

type EndScreenNavigationProp = CompositeScreenProps<
  StackScreenProps<WorkoutNavigatorParamList, RouteStacks.endWorkout>,
  CompositeScreenProps<BottomTabScreenProps<TabNavigatorParamList>, DrawerScreenProps<DrawerNavigatorParamList>>
>

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.darkGunmetal,
    justifyContent: 'center',
  },

  rowContentContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignContent: 'center',
  },
  // Speed and Time
  rowContentContainer2: {
    // display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },

  speedContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  colContentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  contentContainer: {
    display: 'flex',
    width: '50%',
    justifyContent: 'flex-start',
  },
  titleTextStyle: {
    fontSize: 30,
    fontStyle: 'italic',
    fontWeight: '700',
  },

  distanceTextStyle: {
    fontSize: 100,
    fontWeight: '700',
    color: colors.brightTurquoise,
  },
  lightTextStyle: {
    color: colors.crystal,
  },
  textStyle: {
    color: colors.white,
    fontSize: 25,
    fontWeight: '700',
    textAlign: 'center',
  },
})

const EndScreen: FC<EndScreenNavigationProp> = ({ navigation, route }) => {
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()
  const params = route?.params || { username: '' }
  const dispatch = useDispatch()

  // const steps = useSelector((state: any) => state.map.steps)
  const distance = useSelector((state: any) => state.map.distance)

  const speed = params.speed
  const timer = params.timer
  const steps = params.steps
  const speedUnit = useSelector((state: any) => state.unit.speedUnit)

  const [result, setResult] = useState<String>()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [errMsg, setErrMsg] = useState(' ')
  const returnStart = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: RouteStacks.startWorkout }],
    })
  }

  const takeScreenShot = async () => {
    captureScreen({
      format: 'jpg',
      quality: 0.8,
      result: 'base64',
    }).then(
      uri => {
        shareImage(uri)
      },
      (error: any) => {},
    )
  }

  const shareImage = async (image: string) => {
    try {
      const base64_encode = 'data:image/jpeg;base64,' + image
      const options = {
        title: 'End of Workout',
        url: base64_encode,
        type: 'image/jpeg',
      }
      const response = await Share.open(options)
      // const response = await Share.open(options)
      setResult(JSON.stringify(response, null, 2))
    } catch (err: any) {
      crashlytics().recordError(err)
      setResult('error: ')
    }
  }

  const onSaveToPhotosPress = async () => {
    try {
      if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
        return
      }
      let uri = await captureScreen({
        format: 'jpg',
        quality: 0.8,
        result: 'tmpfile',
      })

      await CameraRoll.save(uri, { type: 'photo' })
      triggerSnackbar(t('saveToPhotosSuccess'))
    } catch (err: any) {
      crashlytics().recordError(err)
    }
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
  const WhiteText = (props: TextProps) => {
    const { style, ...rest } = props
    return <AvenirText style={[styles.textStyle, style, { color: colors.white }]} {...rest} />
  }

  const CrystalText = (props: TextProps) => {
    const { style, ...rest } = props
    return <AvenirText style={[styles.textStyle, style, { color: colors.crystal }]} {...rest} />
  }

  const BrightTurquoiseText = (props: TextProps) => {
    const { style, ...rest } = props
    return <AvenirText style={[styles.textStyle, style, { color: colors.brightTurquoise }]} {...rest} />
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'space-between',
        // alignItems: 'center',
        backgroundColor: colors.darkGunmetal,
      }}
      edges={['top', 'bottom']}
    >
      <ScreenBackgrounds screenName={RouteStacks.workout}>
        <Header headerText={t('result')} style={{ backgroundColor: colors.darkGunmetal }} />
        <KeyboardAwareScrollView contentContainerStyle={[styles.container, { flex: 1 }]}>
          {/* {distance > 2000 && ( */}
          <View style={[styles.rowContentContainer, { height: 40, alignItems: 'center' }]}>
            <BrightTurquoiseText style={[styles.titleTextStyle]}>{t('congratulations')}</BrightTurquoiseText>
            <Image source={ConGratualtion} style={{ width: 30, height: 30, marginHorizontal: 10, resizeMode: 'contain' }} />
          </View>
          {/* )} */}
          <View style={[styles.colContentContainer, { height: 110, justifyContent: 'flex-start' }]}>
            <AvenirText style={styles.distanceTextStyle}>{(distance / 1000).toFixed(2)}</AvenirText>
          </View>

          <View style={[styles.colContentContainer, { minHeight: 60, flex: 1, justifyContent: 'center' }]}>
            <CrystalText style={{ fontSize: 20, lineHeight: 30, width: '100%' }}>{t('totalKilo')}</CrystalText>
            <View style={[styles.rowContentContainer, { paddingTop: 4 }]}>
              <Image
                source={StepLogo}
                style={{ width: 26, height: 26, resizeMode: 'contain', alignSelf: 'center', marginHorizontal: 10 }}
              />
              <WhiteText style={{ fontSize: 24, lineHeight: 36 }}>{steps}</WhiteText>
            </View>
          </View>

          <View style={[styles.rowContentContainer2, { minHeight: 60, flex: 1, justifyContent: 'center' }]}>
            <View style={[styles.contentContainer]}>
              <View
                style={{
                  height: 30,
                }}
              >
                <Image source={TimerLogo} style={{ width: 26, height: 26, resizeMode: 'contain', alignSelf: 'center' }} />
              </View>

              <View style={{ justifyContent: 'center', flexBasis: 70 }}>
                <WhiteText style={[{ lineHeight: 40, fontSize: 30, fontWeight: 'bold' }]}>
                  {Math.floor((timer % 3600) / 60)}'{Math.ceil(timer % 60)}"
                </WhiteText>
              </View>
            </View>

            <View style={[styles.contentContainer]}>
              <View
                style={{
                  height: 30,
                }}
              >
                <Image source={SpeedIcon} style={{ width: 26, height: 26, resizeMode: 'contain', alignSelf: 'center' }} />
              </View>

              <Pressable onPress={chanageSpeedUnit} style={{ justifyContent: 'center', flexBasis: 70 }}>
                <AvenirText style={[styles.speedContainer, {}]}>
                  {speedUnit === SpeedUnit.KILOMETRE_PER_HOUR && (
                    <WhiteText style={[{ fontSize: 30, fontWeight: 'bold' }]}>{metersecond_2_kmhour(speed).toFixed(1)}</WhiteText>
                  )}
                  {speedUnit === SpeedUnit.MILE_PER_HOUR && (
                    <WhiteText style={[{ fontSize: 30, fontWeight: 'bold' }]}>{metersecond_2_milehour(speed).toFixed(1)}</WhiteText>
                  )}
                  {speedUnit === SpeedUnit.METER_PER_SECOND && (
                    <WhiteText style={[{ fontSize: 30, fontWeight: 'bold' }]}>{speed.toFixed(1)}</WhiteText>
                  )}
                  <CrystalText style={{ lineHeight: 24, fontSize: 16 }}>{speedUnit}</CrystalText>
                </AvenirText>
              </Pressable>
            </View>
          </View>

          <View style={[styles.contentContainer, { flex: 1, minHeight: 40, justifyContent: 'center' }]}>
            {distance > 2000 ? (
              <WhiteText style={[{ lineHeight: 46, fontSize: 40, fontWeight: '700' }]}>+ 20 KE</WhiteText>
            ) : (
              <WhiteText style={[{ lineHeight: 46, fontSize: 40, fontWeight: '700' }]}>+ 0 KE</WhiteText>
            )}
            <WhiteText style={{ fontSize: 16, lineHeight: 18, fontWeight: '400' }}>{t('points')}</WhiteText>
          </View>

          <View style={[styles.colContentContainer, { flex: 5, justifyContent: 'center' }]}>
            <SocialShareButton
              onPress={takeScreenShot}
              text={t('shareWithFriends')}
              iconName='friends'
              containerStyle={[Layout.rowCenter, Layout.fullWidth]}
              btnStyle={{
                width: 220,
              }}
            />
            <SaveScreenButton
              onPress={onSaveToPhotosPress}
              text={t('saveToAlbum')}
              containerStyle={[Layout.rowCenter, Layout.fullWidth, Gutters.regularVPadding]}
              btnStyle={{
                width: 220,
              }}
            />
            <CloseButton
              onPress={() => {
                // navigation.navigate(RouteStacks.workoutMain)
                navigation.dispatch(StackActions.popToTop())
                navigation.navigate(RouteTabs.home, {
                  screen: RouteStacks.homeMain,
                })
              }}
              containerStyle={[Layout.fullWidth, Layout.rowCenter]}
            />
          </View>
        </KeyboardAwareScrollView>
      </ScreenBackgrounds>
    </SafeAreaView>
  )
}

export default EndScreen
