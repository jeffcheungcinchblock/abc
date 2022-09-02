import React, { FC, useEffect } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { HomeScreen, BreedingScreen, MarketplaceScreen, SocialScreen, SettingScreen, WorkoutScreen } from '@/Screens/App'

import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Entypo from 'react-native-vector-icons/Entypo'
import Ionicons from 'react-native-vector-icons/Ionicons'

import { useTranslation } from 'react-i18next'
import { colors } from '@/Utils/constants'
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack'
import { RouteStacks, RouteTabs } from './routes'
import { DrawerItem, DrawerScreenProps } from '@react-navigation/drawer'

import { createDrawerNavigator, DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'
import { Dimensions, ImageBackground, View } from 'react-native'
import { NavigatorScreenParams } from '@react-navigation/native'
import { HomeNavigatorParamList } from '@/Screens/App/HomeScreen'
import { BreedingNavigatorParamList } from '@/Screens/App/BreedingScreen'
import { MarketplaceNavigatorParamList } from '@/Screens/App/MarketplaceScreen'
import { SocialNavigatorParamList } from '@/Screens/App/SocialScreen'
import { Auth } from 'aws-amplify'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '@/Store/Users/actions'
import { awsLogout } from '@/Utils/helpers'
import { WelcomeGalleryScreen } from '@/Screens/Auth'
import { RootState } from '@/Store'

import { WorkoutNavigatorParamList } from '@/Screens/App/WorkoutScreen'
import WorkoutNavigator from '@/Navigators/WorkoutNavigator'
import { ApplicationNavigatorParamList } from './Application'
import AppSplashScreen from '@/Screens/App/AppSplashScreen'

export type TabNavigatorParamList = {
  [RouteTabs.home]: NavigatorScreenParams<HomeNavigatorParamList>
  [RouteTabs.breeding]: NavigatorScreenParams<BreedingNavigatorParamList>
  [RouteTabs.marketplace]: NavigatorScreenParams<MarketplaceNavigatorParamList>
  [RouteTabs.social]: NavigatorScreenParams<SocialNavigatorParamList>
  [RouteTabs.workout]: NavigatorScreenParams<WorkoutNavigatorParamList>
  // 🔥 Your screens go here
}

export type DrawerNavigatorParamList = {
  [RouteStacks.setting]: undefined
  [RouteStacks.mainTab]: NavigatorScreenParams<TabNavigatorParamList>
}

export type MainStackNavigatorParamList = {
  [RouteStacks.appSplash]: undefined
  [RouteStacks.mainDrawer]: undefined
}

const Tab = createBottomTabNavigator()
const Drawer = createDrawerNavigator()
const Stack = createStackNavigator()

export type MainTabNavigatorProps = DrawerScreenProps<DrawerNavigatorParamList, RouteStacks.mainTab>
export type MainNavigatorProps = StackScreenProps<MainStackNavigatorParamList, RouteStacks.mainDrawer>

type TabWrapperViewProps = { focused: boolean }

const TabWrapperView: FC<TabWrapperViewProps> = props => {
  return (
    <View
      style={{
        borderBottomWidth: 4,
        borderBottomColor: props.focused ? colors.brightTurquoise : colors.black,
        height: 40,
        justifyContent: 'center',
      }}
    >
      {props.children}
    </View>
  )
}

const MainTabNavigator: FC<MainTabNavigatorProps> = () => {
  const { t } = useTranslation()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.black,
          display: 'none', // TBD: need to remove later to show tab
        },
      }}
    >
      <Tab.Screen
        name={RouteTabs.home}
        component={HomeScreen}
        options={{
          tabBarLabelPosition: 'below-icon',
          tabBarIcon: ({ focused, color, size }) => {
            return (
              <TabWrapperView focused={focused}>
                <FontAwesome name='home' size={20} color={focused ? colors.brightTurquoise : colors.white} />
              </TabWrapperView>
            )
          },
        }}
      />
      <Tab.Screen
        name={RouteTabs.breeding}
        component={BreedingScreen}
        options={{
          tabBarLabelPosition: 'below-icon',
          tabBarIcon: ({ focused, color, size }) => {
            return (
              <TabWrapperView focused={focused}>
                <Entypo name='new' size={20} color={focused ? colors.brightTurquoise : colors.white} />
              </TabWrapperView>
            )
          },
        }}
      />
      <Tab.Screen
        name={RouteTabs.marketplace}
        component={MarketplaceScreen}
        options={{
          tabBarLabelPosition: 'below-icon',
          tabBarIcon: ({ focused, color, size }) => {
            return (
              <TabWrapperView focused={focused}>
                <Entypo name='shop' size={20} color={focused ? colors.brightTurquoise : colors.white} />
              </TabWrapperView>
            )
          },
        }}
      />

      <Tab.Screen
        name={RouteTabs.social}
        component={SocialScreen}
        options={{
          tabBarLabelPosition: 'below-icon',
          tabBarIcon: ({ focused, color, size }) => {
            return (
              <TabWrapperView focused={focused}>
                <Ionicons name='share-social' size={20} color={focused ? colors.brightTurquoise : colors.white} />
              </TabWrapperView>
            )
          },
        }}
      />
      <Tab.Screen
        name={RouteTabs.workout}
        component={MarketplaceScreen}
        options={{
          tabBarLabelPosition: 'below-icon',
          tabBarIcon: ({ focused, color, size }) => {
            return (
              <TabWrapperView focused={focused}>
                <Entypo name='shop' size={20} color={focused ? colors.brightTurquoise : colors.white} />
              </TabWrapperView>
            )
          },
        }}
      />
    </Tab.Navigator>
  )
}

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const dispatch = useDispatch()

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem label='Sign Out' style={{ bottom: 0 }} onPress={awsLogout} />
    </DrawerContentScrollView>
  )
}

const DrawerNavigator: FC<MainNavigatorProps> = ({ navigation }) => {
  const { t } = useTranslation()

  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false, swipeEnabled: false }}
      drawerContent={props => <CustomDrawerContent {...props} />}
      initialRouteName={RouteStacks.mainTab}
    >
      <Drawer.Screen name={RouteStacks.mainTab} component={MainTabNavigator} />
    </Drawer.Navigator>
  )
}
const MainNavigator: FC = () => {
  const { t } = useTranslation()

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={RouteStacks.mainDrawer}>
      {/* <Stack.Screen name={RouteStacks.appSplash} component={AppSplashScreen} /> */}
      <Stack.Screen
        name={RouteStacks.mainDrawer}
        component={DrawerNavigator}
        options={{
          presentation: 'transparentModal',
        }}
      />
      <Stack.Screen name={RouteStacks.workout} component={WorkoutNavigator} />
    </Stack.Navigator>
  )
}

export default MainNavigator
