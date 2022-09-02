import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, View, Text, Dimensions, Easing, ViewStyle } from 'react-native'
import { useTranslation } from 'react-i18next'
// @ts-ignore
import Video from 'react-native-video'
import { useTheme } from '@/Hooks'
import { Brand } from '@/Components'
import { setDefaultTheme } from '@/Store/Theme'
import { navigateAndSimpleReset } from '@/Navigators/utils'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import AppLogo from '@/Components/Icons/AppLogo'
import { RouteStacks } from '@/Navigators/routes'
import { StackScreenProps } from '@react-navigation/stack'
import { MainStackNavigatorParamList } from '@/Navigators/MainNavigator'
// @ts-nocheck
import Animated, { EasingNode, timing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { AuthNavigatorParamList } from '@/Navigators/AuthNavigator'

const appLogoHeight = 150
let nodeJsTimeout: NodeJS.Timeout

const AppSplashScreen: FC<StackScreenProps<MainStackNavigatorParamList, RouteStacks.appSplash>> = ({ navigation }) => {
  const { Layout, Gutters, Fonts } = useTheme()
  const windowHeight = Dimensions.get('window').height
  const { t } = useTranslation()
  // const animation = useSharedValue({ scale: 1, opacity: 1 })
  const animation = useSharedValue({ top: windowHeight / 2 - appLogoHeight / 2 })
  const animationStyle = useAnimatedStyle(() => {
    return {
      top: withTiming(animation.value.top, {
        duration: 2000,
      }),
    }
  })

  useFocusEffect(
    useCallback(() => {
      // animation.value = { scale: 1.1, opacity: 0 }
      animation.value = { top: 60 }
      nodeJsTimeout = setTimeout(() => {
        navigation.replace(RouteStacks.mainDrawer)
      }, 2000)

      return () => {
        clearTimeout(nodeJsTimeout)
      }
    }, []),
  )

  return (
    <View style={[Layout.fill, Layout.colCenter]}>
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
        source={require('../../Assets/Videos/sample-5s.mp4')}
        resizeMode='cover'
        rate={1.0}
        muted={true}
        repeat={true}
        ignoreSilentSwitch='obey'
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            // top: windowHeight / 2 - appLogoHeight / 2
          },
          animationStyle,
        ]}
      >
        <AppLogo
          style={{
            height: appLogoHeight,
          }}
        />
      </Animated.View>
    </View>
  )
}

export default AppSplashScreen
