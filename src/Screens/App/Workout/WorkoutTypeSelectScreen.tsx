import React, { useState, useEffect, FC, useCallback } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import { View, Text, StyleSheet, Image, TextProps, TextStyle, Platform, Pressable, Dimensions, ImageBackground } from 'react-native'
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
import { CompositeScreenProps, StackActions, useFocusEffect } from '@react-navigation/native'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { DrawerNavigatorParamList, TabNavigatorParamList } from '@/Navigators/MainNavigator'
import { DrawerScreenProps } from '@react-navigation/drawer'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

import runningIcon from '@/Assets/Images/Workout/running.png'
import boxingIcon from '@/Assets/Images/Workout/boxing.png'
import swimmingIcon from '@/Assets/Images/Workout/swimming.png'
import yogaIcon from '@/Assets/Images/Workout/yoga.png'
import weightTrainingIcon from '@/Assets/Images/Workout/weightTraining.png'
import closeIcon from '@/Assets/Images/Workout/close.png'
import workoutSelectBg from '@/Assets/Images/Workout/workoutSelectBg.png'
import LinearGradient from 'react-native-linear-gradient'

type WorkoutTypeSelectScreenNavigationProp = CompositeScreenProps<
  StackScreenProps<WorkoutNavigatorParamList, RouteStacks.workoutTypeSelect>,
  CompositeScreenProps<BottomTabScreenProps<TabNavigatorParamList>, DrawerScreenProps<DrawerNavigatorParamList>>
>

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

type OptionStyle = {
  x: number
  y: number
  opacity: number
}

type OptionState = 'start' | 'end'

const iconSize = 40
const iconButtonSize = 100

const initOptionStyle: OptionStyle = {
  x: windowWidth / 2 - iconButtonSize / 2,
  y: 0,
  opacity: 0.2,
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

const springOptions = {
  damping: 12,
  mass: 0.5,
  stiffness: 100,
  overshootClamping: false,
}

const optionTypeImageMap = {
  running: runningIcon,
  boxing: boxingIcon,
  yoga: yogaIcon,
  swimming: swimmingIcon,
  weightTraining: weightTrainingIcon,
}

const AnimatedOption: FC<{
  state: OptionState // first state should be end
  optionType: keyof typeof optionTypeImageMap
  stateStyles: {
    start: OptionStyle
    end: OptionStyle
  }
  onPress: () => void
  disabled?: boolean
}> = ({ state, optionType, stateStyles, onPress, disabled = false }) => {
  const sharedValue = useSharedValue<OptionStyle>({ ...initOptionStyle })

  const animatedStyle = useAnimatedStyle(() => {
    return {
      left: withSpring(sharedValue.value.x, springOptions),
      bottom: withSpring(sharedValue.value.y, springOptions),
      opacity: withSpring(sharedValue.value.opacity),
    }
  }, [])

  useEffect(() => {
    sharedValue.value = stateStyles[state]
  }, [state])

  return (
    <AnimatedPressable
      style={[
        {
          position: 'absolute',
          bottom: 0,
          left: '45%',
          alignItems: 'center',
          width: iconButtonSize,
          height: iconButtonSize,
          justifyContent: 'center',
        },
        animatedStyle,
      ]}
      onPress={onPress}
    >
      <Image source={optionTypeImageMap[optionType]} style={{ height: iconButtonSize, resizeMode: 'contain' }} />
    </AnimatedPressable>
  )
}

const WorkoutTypeSelectScreen: FC<WorkoutTypeSelectScreenNavigationProp> = ({ navigation, route }) => {
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()
  const params = route?.params
  const dispatch = useDispatch()
  const [optionState, setOptionState] = useState<'start' | 'end'>('end')
  const pressableSharedValue = useSharedValue({ opacity: 0 })
  const bgSharedValue = useSharedValue({ opacity: 0.6 })

  useFocusEffect(
    useCallback(() => {
      setOptionState('end')
      pressableSharedValue.value = {
        opacity: 1,
      }
      bgSharedValue.value = {
        opacity: 1,
      }
      return () => {}
    }, []),
  )

  const clearWorkoutTypeSelect = () => {
    setOptionState('start')
    pressableSharedValue.value = {
      opacity: 0,
    }
    bgSharedValue.value = {
      opacity: 0.6,
    }
  }

  const delayNavigateToHome = () => {
    setTimeout(() => {
      navigation.navigate(RouteTabs.home, {
        screen: RouteStacks.homeReferral,
      })
    }, 400)
  }

  const onBackgroundPress = () => {
    clearWorkoutTypeSelect()
    delayNavigateToHome()
  }

  const animatedPressableStyle = useAnimatedStyle(() => {
    return {
      opacity: withSpring(pressableSharedValue.value.opacity),
    }
  }, [])

  const linearGradientAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withSpring(pressableSharedValue.value.opacity),
    }
  }, [])

  const onCloseBtnPress = () => {
    clearWorkoutTypeSelect()
    delayNavigateToHome()
  }

  const onAnimatedOptionPress = (option: string) => {
    if (option === 'running') {
      clearWorkoutTypeSelect()
      navigation.navigate(RouteStacks.workoutMain)
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.darkGunmetal,
      }}
    >
      <AnimatedLinearGradient
        start={{
          x: 0.5,
          y: 0,
        }}
        end={{
          x: 0.5,
          y: 1,
        }}
        colors={['#245063', '#194050', '#152037']}
        style={[
          {
            flex: 1,
          },
          linearGradientAnimatedStyle,
        ]}
      >
        <ImageBackground
          source={workoutSelectBg}
          style={{
            flex: 1,
          }}
        >
          <AnimatedPressable style={[{ flex: 1 }, animatedPressableStyle]} onPress={onBackgroundPress}>
            <AnimatedOption
              state={optionState}
              optionType={'swimming'}
              stateStyles={{
                start: {
                  ...initOptionStyle,
                },
                end: {
                  x: 30,
                  y: 1.5 * iconButtonSize,
                  opacity: 1,
                },
              }}
              onPress={() => onAnimatedOptionPress('swimming')}
            />

            <AnimatedOption
              state={optionState}
              optionType={'running'}
              stateStyles={{
                start: {
                  ...initOptionStyle,
                },
                end: {
                  x: 30,
                  y: 3.5 * iconButtonSize,
                  opacity: 1,
                },
              }}
              onPress={() => onAnimatedOptionPress('running')}
              disabled
            />

            <AnimatedOption
              state={optionState}
              optionType={'weightTraining'}
              stateStyles={{
                start: {
                  ...initOptionStyle,
                },
                end: {
                  x: windowWidth / 2 - iconSize - 10,
                  y: 2.5 * iconButtonSize,
                  opacity: 1,
                },
              }}
              onPress={() => onAnimatedOptionPress('weightTraining')}
              disabled
            />

            <AnimatedOption
              state={optionState}
              optionType={'yoga'}
              stateStyles={{
                start: {
                  ...initOptionStyle,
                },
                end: {
                  x: windowWidth - 2 * iconSize - 50,
                  y: 3.5 * iconButtonSize,
                  opacity: 1,
                },
              }}
              onPress={() => onAnimatedOptionPress('yoga')}
              disabled
            />

            <AnimatedOption
              state={optionState}
              optionType={'boxing'}
              stateStyles={{
                start: {
                  ...initOptionStyle,
                },
                end: {
                  x: windowWidth - 2 * iconSize - 50,
                  y: 1.5 * iconButtonSize,
                  opacity: 1,
                },
              }}
              onPress={() => onAnimatedOptionPress('boxing')}
              disabled
            />

            <Pressable
              onPress={onCloseBtnPress}
              style={{
                borderRadius: 99,
                backgroundColor: colors.white,
                width: 40,
                height: 40,
                position: 'absolute',
                left: windowWidth / 2 - 20,
                bottom: 50,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Image source={closeIcon} style={{ width: 40, resizeMode: 'contain' }} />
            </Pressable>
          </AnimatedPressable>
        </ImageBackground>
      </AnimatedLinearGradient>
    </View>
  )
}

export default WorkoutTypeSelectScreen
