import React, { useState, useEffect, FC, useCallback } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import { View, Text, StyleSheet, Image, TextProps, TextStyle, Platform, Pressable, Dimensions, ViewStyle, ImageStyle } from 'react-native'
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
import { CompositeScreenProps, StackActions, useFocusEffect } from '@react-navigation/native'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { DrawerNavigatorParamList, TabNavigatorParamList } from '@/Navigators/MainNavigator'
import { DrawerScreenProps } from '@react-navigation/drawer'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import soloMode from '@/Assets/Images/Workout/soloMode.png'
import teamMode from '@/Assets/Images/Workout/teamMode.png'

type WorkoutSelectScreenNavigationProp = CompositeScreenProps<
  StackScreenProps<WorkoutNavigatorParamList, RouteStacks.workoutSelect>,
  CompositeScreenProps<BottomTabScreenProps<TabNavigatorParamList>, DrawerScreenProps<DrawerNavigatorParamList>>
>

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

const MODE_PRESSABLE: ViewStyle = {
  height: (windowWidth * 0.85 * 736) / 1296,
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  marginVertical: 6,
}

const MODE_IMAGE: ImageStyle = {
  width: windowWidth * 0.85,
}

const WorkoutSelectScreen: FC<WorkoutSelectScreenNavigationProp> = ({ navigation, route }) => {
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()
  const params = route?.params
  const dispatch = useDispatch()

  const onConfirmBtnPress = () => {
    navigation.navigate(RouteStacks.workoutMain)
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: colors.darkGunmetal,
      }}
      edges={['top', 'bottom']}
    >
      <ScreenBackgrounds screenName={RouteStacks.workout}>
        <Header headerText={t('workoutType')} onLeftPress={() => navigation.goBack()} />

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
              height: 60,
              justifyContent: 'center',
            }}
          >
            <AvenirText
              style={{
                fontSize: 16,
                lineHeight: 24,
                fontWeight: '400',
                color: colors.white,
              }}
            >
              {t('selectExerciseMode')}
            </AvenirText>
          </View>

          {/* <Pressable style={[MODE_PRESSABLE, {}]} onPress={() => onWorkoutModePress("run"))}>
    <Image source={soloMode} style={[MODE_IMAGE, {}]} resizeMode='contain' />
  </Pressable>

  <Pressable style={[MODE_PRESSABLE, {}]} onPress={() => onWorkoutModePress("gym"))}>
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
  </Pressable> */}

          <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 60 }}>
            <TurquoiseButton
              onPress={onConfirmBtnPress}
              text={t('confirm')}
              containerStyle={{
                width: 160,
              }}
            />
          </View>
        </KeyboardAwareScrollView>
      </ScreenBackgrounds>
    </SafeAreaView>
  )
}

export default WorkoutSelectScreen
