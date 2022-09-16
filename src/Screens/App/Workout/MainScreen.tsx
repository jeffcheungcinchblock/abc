import React, { useState, useEffect, useCallback, FC, useRef } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import {
  View,
  ActivityIndicator,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  TextStyle,
  Alert,
  ViewStyle,
  Image,
  ImageStyle,
  Platform,
  Linking,
  Dimensions,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand, Header } from '@/Components'
import { useTheme } from '@/Hooks'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login, logout } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'

import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { colors, config } from '@/Utils/constants'
import { WorkoutNavigatorParamList } from '@/Screens/App/WorkoutScreen'
import EncryptedStorage from 'react-native-encrypted-storage'
import { RouteStacks, RouteTabs } from '@/Navigators/routes'
import { CompositeScreenProps, StackActions } from '@react-navigation/native'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { DrawerScreenProps } from '@react-navigation/drawer'
import { DrawerNavigatorParamList, TabNavigatorParamList } from '@/Navigators/MainNavigator'
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AvenirText from '@/Components/FontText/AvenirText'
import soloMode from '@/Assets/Images/Workout/soloMode.png'
import teamMode from '@/Assets/Images/Workout/teamMode.png'
import comingSoon from '@/Assets/Images/Workout/comingSoon.png'
import TurquoiseButton from '@/Components/Buttons/TurquoiseButton'
import { SafeAreaView } from 'react-native-safe-area-context'
import LocationPermissionModal from '@/Components/Modals/LocationPermissionModal'
import GoogleFitModal from '@/Components/Modals/GoogleFitModal'
import { IOSHealthKit } from '@/Healthkit/iosHealthKit'
import { GoogleFitKit } from '@/Healthkit/androidHealthKit'
import BackgroundGeolocation from 'react-native-background-geolocation'
import { check, request, RESULTS, PERMISSIONS, checkMultiple, requestMultiple } from 'react-native-permissions'
import { startLoading } from '@/Store/UI/actions'
import { RootState } from '@/Store'
import crashlytics from '@react-native-firebase/crashlytics'
import closeIcon from '@/Assets/Images/Workout/close.png'

const TEXT_INPUT = {
  height: 40,
  color: 'yellow',
  borderWidth: 1,
  borderRadius: 10,
  borderColor: '#000',
}

type WorkoutScreenNavigationProp = CompositeScreenProps<
  StackScreenProps<WorkoutNavigatorParamList, RouteStacks.workoutMain>,
  CompositeScreenProps<BottomTabScreenProps<TabNavigatorParamList>, DrawerScreenProps<DrawerNavigatorParamList>>
>

const windowWidth = Dimensions.get('window').width
const MODE_IMAGE: ImageStyle = {
  width: windowWidth * 0.85,
}

const MODE_PRESSABLE: ViewStyle = {
  height: (windowWidth * 0.85 * 736) / 1296,
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  marginVertical: 6,
}
const isIOS = Platform.OS === 'ios'
const health_kit = isIOS ? new IOSHealthKit() : new GoogleFitKit()

const MainScreen: FC<WorkoutScreenNavigationProp> = ({ navigation, route }) => {
  const googleFitModalRef = useRef<any>(null)
  const locationPermissionModalRef = useRef<any>(null)
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()
  const dispatch = useDispatch()
  const startTime = useSelector((state: RootState) => state.map.startTime)
  const [isStartPressed, setIsStartPressed] = useState<boolean>(false)
  const [enabled, setEnabled] = useState(false)

  const onSoloModePress = () => {}

  const onTeamModePress = () => {}

  const onLocationPermissionModalClose = () => {}

  const onLocationPermissionModalCloseBtnPress = () => {
    locationPermissionModalRef?.current?.close()
    Linking.openSettings()
  }

  const onGoogleFitModalClose = () => {}
  const onGoogleFitModalCloseBtnPress = () => {
    googleFitModalRef?.current?.close()
    setIsStartPressed(false)
  }

  useEffect(() => {
    dispatch(startLoading(false))
    dispatch({ type: 'init' })
  }, [])

  useEffect(() => {
    if (enabled === true && startTime !== null) {
      navigation.replace(RouteStacks.startWorkout)
    }
  }, [startTime, enabled])

  const onConfirmBtnPress = async () => {
    try {
      dispatch(startLoading(true))
      setIsStartPressed(true)
      const LocationpermissionStatus = await checkMultiple([
        // PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        PERMISSIONS.IOS.LOCATION_ALWAYS,
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      ])
      if (LocationpermissionStatus['ios.permission.LOCATION_ALWAYS'] === 'blocked') {
        locationPermissionModalRef?.current?.open()
      }
      let locationPermission = false
      if (isIOS) {
        if (LocationpermissionStatus[PERMISSIONS.IOS.LOCATION_ALWAYS] === 'granted') {
          locationPermission = true
        }
      } else {
        if (
          LocationpermissionStatus[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === 'granted' &&
          LocationpermissionStatus[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] === 'granted'
        ) {
          locationPermission = true
        }
      }
      const permission = await health_kit.InitHealthKitPermission()
      const authed = await health_kit.GetAuthorizeStatus()
      if (!permission) {
        googleFitModalRef?.current?.open()
        return
      }

      if (!authed) {
        googleFitModalRef?.current?.open()
        return
      }

      if (locationPermission) {
        BackgroundGeolocation.getCurrentPosition({
          samples: 1,
        })
          .then(location => {
            dispatch({
              type: 'start',
              payload: { startTime: new Date().getTime(), latitude: location.coords.latitude, longitude: location.coords.longitude },
            })
          })
          .then(() => {
            BackgroundGeolocation.start()
          })
          .then(() => {
            setEnabled(true)
          })
          .catch(err => {})
      } else {
        const response = await requestMultiple([
          // PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
          PERMISSIONS.IOS.LOCATION_ALWAYS,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
        ])
        onConfirmBtnPress()
        return
      }
    } catch (err: any) {
      crashlytics().recordError(err)
    } finally {
      dispatch(startLoading(false))
    }
  }

  const onBackBtnPress = () => {
    navigation.goBack()
  }

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'space-between', backgroundColor: colors.darkGunmetal }} edges={['top']}>
      <LocationPermissionModal
        ref={locationPermissionModalRef}
        onModalClose={onLocationPermissionModalClose}
        onActionBtnPress={onLocationPermissionModalCloseBtnPress}
      />

      <GoogleFitModal ref={googleFitModalRef} onModalClose={onGoogleFitModalClose} onActionBtnPress={onGoogleFitModalCloseBtnPress} />
      <ScreenBackgrounds screenName={RouteStacks.workoutMain}>
        <Header headerText={t('exerciseMode')} />

        <KeyboardAwareScrollView
          contentContainerStyle={[
            Gutters.smallHPadding,
            {
              flexGrow: 1,
              alignItems: 'center',
              justifyContent: 'flex-start',
            },
          ]}
        >
          <View
            style={{
              height: 70,
              justifyContent: 'center',
              paddingHorizontal: 70,
              paddingBottom: 20,
            }}
          >
            <AvenirText
              style={{
                fontSize: 16,
                lineHeight: 24,
                fontWeight: '500',
                color: colors.white,
              }}
            >
              {t('selectExerciseMode')}
            </AvenirText>
          </View>

          <Pressable style={[MODE_PRESSABLE, {}]} onPress={onSoloModePress}>
            <Image source={soloMode} style={[MODE_IMAGE, {}]} resizeMode='contain' />
          </Pressable>

          <Pressable style={[MODE_PRESSABLE, {}]} onPress={onTeamModePress}>
            <Image source={teamMode} style={[MODE_IMAGE, {}]} resizeMode='contain' />
            <View
              style={{
                position: 'absolute',
                alignItems: 'center',
                justifyContent: 'flex-end',
                top: 0,
                left: 0,
                height: '100%',
                width: '100%',
                zIndex: 1,
              }}
            >
              <Image
                source={comingSoon}
                style={[
                  {
                    width: 140,
                    height: 70,
                    resizeMode: 'contain',
                  },
                ]}
              />
            </View>
          </Pressable>

          <View
            style={{
              flex: 1,
              justifyContent: 'space-evenly',
              alignItems: 'center',
              paddingBottom: 60,
              width: '100%',
              flexDirection: 'row',
            }}
          >
            <TurquoiseButton
              onPress={onBackBtnPress}
              text={t('back')}
              isTransparentBackground
              containerStyle={{
                width: '40%',
              }}
            />
            <TurquoiseButton
              onPress={onConfirmBtnPress}
              text={t('confirm')}
              containerStyle={{
                width: '40%',
              }}
            />
          </View>
        </KeyboardAwareScrollView>
      </ScreenBackgrounds>
    </SafeAreaView>
  )
}

export default MainScreen
