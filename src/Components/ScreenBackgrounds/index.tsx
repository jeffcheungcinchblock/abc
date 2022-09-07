import React, { FC, ReactChildren, useCallback, useEffect, useState } from 'react'
import { View, Image, Text, ActivityIndicator, Pressable, ImageBackground, ImageSourcePropType, Dimensions, AppState } from 'react-native'
import { useTheme } from '@/Hooks'
import { colors } from '@/Utils/constants'
import { RouteStacks } from '@/Navigators/routes'
import Video from 'react-native-video'

import bg1 from '@/Assets/Images/backgrounds/bg_01.png'
import bg2 from '@/Assets/Images/backgrounds/bg_02.png'
import bg3 from '@/Assets/Images/backgrounds/bg_03.png'
import congratsImg from '@/Assets/Images/backgrounds/Congrats_img.png'
import { useFocusEffect } from '@react-navigation/native'

type ScreenBackgroundsProps = {
  // source: ImageSourcePropType
  children: React.ReactNode
  uri?: string
  screenName: RouteStacks
}

// Refers to RouteStacks
const ScreenImageMap: any = {
  [RouteStacks.welcome]: 'video',
  [RouteStacks.logIn]: 'video',
  [RouteStacks.signUp]: 'video',
  [RouteStacks.signUpWithCode]: 'video',
  [RouteStacks.enterInvitationCode]: 'video',
  [RouteStacks.registrationCompleted]: congratsImg,
}

const ScreenBackgrounds = ({ uri, screenName, children }: ScreenBackgroundsProps) => {
  // if uri exists, then use uri
  let source: ImageSourcePropType = uri
    ? {
        uri,
      }
    : screenName
    ? ScreenImageMap[screenName]
    : {}

  // const [videoPaused, toggleVideoPaused] = useState(false)
  // const [appActive, setAppActive] = useState(false)

  // const handleAppStateChange = (nextAppState: string) => {
  //   if (nextAppState === 'active') {
  //     setAppActive(true)
  //   } else {
  //     setAppActive(false)
  //   }
  // }

  // useEffect(() => {
  //   AppState.addEventListener('change', handleAppStateChange)
  //   return () => AppState.removeEventListener('change', handleAppStateChange)
  // }, [])

  // useEffect(() => {
  //   appActive ? toggleVideoPaused(false) : toggleVideoPaused(true)
  // }, [appActive])

  return ScreenImageMap[screenName] === 'video' ? (
    <>
      <Video
        style={{
          height: Dimensions.get('window').height,
          position: 'absolute',
          top: 0,
          left: 0,
          alignItems: 'stretch',
          bottom: 0,
          right: 0,
        }}
        paused={false}
        source={require('../../Assets/Videos/sample-5s.mp4')}
        resizeMode='cover'
        rate={1.0}
        muted={true}
        playWhenInactive={true}
        repeat={true}
        ignoreSilentSwitch='obey'
      />
      {children}
    </>
  ) : ScreenImageMap[screenName] === undefined ? (
    <>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.darkGunmetal,
        }}
      >
        {children}
      </View>
    </>
  ) : (
    <>
      <ImageBackground
        source={source}
        style={{
          flex: 1,
          backgroundColor: colors.darkGunmetal,
        }}
        imageStyle={{
          resizeMode: 'cover',
        }}
      >
        {children}
      </ImageBackground>
    </>
  )
}

ScreenBackgrounds.defaultProps = {}

export default ScreenBackgrounds
