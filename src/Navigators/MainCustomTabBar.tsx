import { colors } from '@/Utils/constants'
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { CompositeScreenProps, NavigationHelpers, NavigatorScreenParams, TabNavigationState } from '@react-navigation/native'
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack'
import React, { FC, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, Easing, Image, ImageStyle, Pressable, Text, TextStyle, View, ViewStyle } from 'react-native'
import { RouteStacks, RouteTabs } from '@/Navigators/routes'
import map from 'lodash/map'
import {
  BottomTabDescriptorMap,
  BottomTabNavigationEventMap,
  BottomTabNavigationHelpers,
} from '@react-navigation/bottom-tabs/lib/typescript/src/types'
import { ApplicationNavigatorParamList } from './Application'
import { ImageSourcePropType } from 'react-native'
import { TabNavigatorParamList } from './MainNavigator'
import Animated, {
  FadeInDown,
  FadeOutDown,
  interpolate,
  interpolateColor,
  measure,
  runOnUI,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { times } from 'lodash'
import { useSelector } from 'react-redux'
import { RootState } from '@/Store'

import homeInactive from '@/Assets/Images/Tabbar/home_inactive.png'
import homeActive from '@/Assets/Images/Tabbar/home_active.png'
import referralInactive from '@/Assets/Images/Tabbar/referral_inactive.png'
import referralActive from '@/Assets/Images/Tabbar/referral_active.png'
import marketInactive from '@/Assets/Images/Tabbar/market_inactive.png'
import marketActive from '@/Assets/Images/Tabbar/market_active.png'
import companionInactive from '@/Assets/Images/Tabbar/companion_inactive.png'
import companionActive from '@/Assets/Images/Tabbar/companion_active.png'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import AvenirText from '@/Components/FontText/AvenirText'

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

type TabWrapperViewProps = { focused: boolean; children: React.ReactNode; onLongPress: () => void; onPress: () => void; style: object }
interface MainCustomTabBarProps extends BottomTabBarProps {}

const hideTabbarRoutes = [RouteStacks.startWorkout, RouteStacks.workoutMain, RouteStacks.endWorkout]

const TabWrapperView: FC<TabWrapperViewProps> = ({ focused, children, onPress, onLongPress, style }) => {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={{
        justifyContent: 'center',
        margin: 'auto',
        alignItems: 'center',
        ...style,
      }}
    >
      {children}
    </Pressable>
  )
}

let dimensionRatioTimeout: NodeJS.Timeout

const TABBAR_ICON_VIEW: ViewStyle = {
  justifyContent: 'center',
  alignItems: 'center',
}

const TABBAR_TEXT: TextStyle = {
  fontSize: 10,
  paddingTop: 6,
}

const TABBAR_ICON_IMAGE: ImageStyle = {
  height: 20,
  resizeMode: 'contain',
}

export const startButtonSize = 80

const MainCustomTabBar: FC<MainCustomTabBarProps> = ({ state, descriptors, navigation: bottomTabNavigation }) => {
  const highlightRef = useRef(null)
  const { t } = useTranslation()
  let routeNames: string[] = state.routeNames

  const tabBarIconsMap: {
    [Key in RouteStacks as string]?: (focused: boolean, onPress?: () => void) => React.ReactNode
  } = {
    home: focused => (
      <View style={TABBAR_ICON_VIEW}>
        <Image source={focused ? homeActive : homeInactive} style={[TABBAR_ICON_IMAGE, {}]} />
        <AvenirText
          style={[
            TABBAR_TEXT,
            {
              color: focused ? colors.brightTurquoise : colors.white,
            },
          ]}
        >
          {t('home')}
        </AvenirText>
      </View>
    ),
    marketplace: focused => (
      <View style={TABBAR_ICON_VIEW}>
        <Image source={focused ? marketActive : marketInactive} style={[TABBAR_ICON_IMAGE, {}]} />
        <AvenirText
          style={[
            TABBAR_TEXT,
            {
              color: focused ? colors.brightTurquoise : colors.white,
            },
          ]}
        >
          {t('market')}
        </AvenirText>
      </View>
    ),
    workout: (focused, onPress) => (
      <View
        style={{
          position: 'absolute',
          width: '100%',
          top: 0,
          left: 0,
          alignItems: 'center',
        }}
      >
        <Pressable
          style={({ pressed }) => {
            return [
              TABBAR_ICON_VIEW,
              {
                backgroundColor: colors.brightTurquoise,
                borderRadius: 99,
                width: startButtonSize,
                height: startButtonSize,
                bottom: 30,
                borderWidth: 1,
                borderColor: colors.white,
                shadowColor: colors.brightTurquoise,
                elevation: 10,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 10,
              },
            ]
          }}
          onPress={onPress}
        >
          <AvenirText
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              fontStyle: 'italic',
            }}
          >
            {t('start')}
          </AvenirText>
        </Pressable>
      </View>
    ),
    social: focused => (
      <View style={TABBAR_ICON_VIEW}>
        <Image source={focused ? referralActive : referralInactive} style={[TABBAR_ICON_IMAGE, {}]} />
        <AvenirText
          style={[
            TABBAR_TEXT,
            {
              color: focused ? colors.brightTurquoise : colors.white,
            },
          ]}
        >
          {t('social')}
        </AvenirText>
      </View>
    ),
    companion: focused => (
      <View style={TABBAR_ICON_VIEW}>
        <Image source={focused ? companionActive : companionInactive} style={[TABBAR_ICON_IMAGE, {}]} />
        <AvenirText
          style={[
            TABBAR_TEXT,
            {
              color: focused ? colors.brightTurquoise : colors.white,
            },
          ]}
        >
          {t('companion')}
        </AvenirText>
      </View>
    ),
  }

  return (
    <View
      style={{
        backgroundColor: colors.lightGrayBlue,
        height: 70,
        display: state.index !== 2 ? 'flex' : 'none',
        paddingRight: 8,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
          zIndex: 2,
        }}
      >
        {map(state.routes, (route: TabNavigationState<TabNavigatorParamList>, idx: number) => {
          const onTabPress = () => {
            let focused = idx === state.index
            const event = bottomTabNavigation.emit({
              type: 'tabPress',
              target: state.routes[idx].key,
              canPreventDefault: true,
            })
            if (!focused && !event.defaultPrevented) {
              bottomTabNavigation.navigate({ ...route, merge: true })
            }
          }
          const onLongPress = () => {
            bottomTabNavigation.emit({
              type: 'tabLongPress',
              target: route.key,
            })
          }

          let focused = idx === state.index
          let startEndRoute = [0, routeNames.length - 1].includes(idx)

          return routeNames[idx] && tabBarIconsMap[routeNames[idx]] ? (
            <TabWrapperView
              focused={focused}
              key={`TabWrapperView-${idx}`}
              onLongPress={onLongPress}
              onPress={onTabPress}
              style={{
                ...(startEndRoute
                  ? {
                      flex: 1,
                    }
                  : {
                      flex: 1,
                    }),
                justifyContent: 'center',
                alignItems: idx === 1 ? 'flex-start' : idx === 2 ? 'flex-end' : 'center',
              }}
            >
              {tabBarIconsMap[routeNames[idx]]?.(focused, onTabPress)}
            </TabWrapperView>
          ) : null
        })}
      </View>

      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: windowWidth * (state.index * 0.2) + windowWidth / 10,
            transform: [{ translateX: -15 }],
            height: '100%',
            justifyContent: 'center',
            zIndex: 1,
          },
        ]}
      >
        <Animated.View
          ref={highlightRef}
          style={[
            {
              width: 30,
              height: 30,
              borderRadius: 10,
            },
          ]}
        />
      </Animated.View>
    </View>
  )
}

export default MainCustomTabBar
