import React, { FC, useEffect } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { HomeScreen, BreedingScreen, MarketplaceScreen, SocialScreen, SettingScreen } from '@/Screens/App'

import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Entypo from 'react-native-vector-icons/Entypo'
import Ionicons from 'react-native-vector-icons/Ionicons'

import { useTranslation } from 'react-i18next'
import { colors } from '@/Utils/constants'
import { createStackNavigator } from '@react-navigation/stack'
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
import { useDispatch } from 'react-redux'
import { logout } from '@/Store/Users/actions'
import { awsLogout } from '@/Utils/helpers'

const { width, height } = Dimensions.get("screen");

export type TabNavigatorParamList = {
  [RouteTabs.home]: NavigatorScreenParams<HomeNavigatorParamList>
  [RouteTabs.breeding]: NavigatorScreenParams<BreedingNavigatorParamList>
  [RouteTabs.marketplace]: NavigatorScreenParams<MarketplaceNavigatorParamList>
  [RouteTabs.social]: NavigatorScreenParams<SocialNavigatorParamList>
  // 🔥 Your screens go here
}

export type DrawerNavigatorParamList = {
  [RouteStacks.setting]: undefined
  [RouteStacks.mainTab]: NavigatorScreenParams<TabNavigatorParamList>
}

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()
const Drawer = createDrawerNavigator();

export type MainTabNavigatorProps = DrawerScreenProps<DrawerNavigatorParamList, RouteStacks.mainTab>

type TabWrapperViewProps = { focused: boolean }

const TabWrapperView: FC<TabWrapperViewProps> = (props) => {
  return <View style={{ borderBottomWidth: 4, borderBottomColor: props.focused ? colors.brightTurquoise : colors.black, height: 40, justifyContent: 'center' }}>
    {props.children}
  </View>
}

const MainTabNavigator: FC<MainTabNavigatorProps> = () => {

  const { t } = useTranslation()

  return <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: {
        backgroundColor: colors.black,
        display: "none" // TBD: need to remove later to show tab
      }
    }}

  >
    <Tab.Screen
      name={RouteTabs.home}
      component={HomeScreen}
      options={{
        tabBarLabelPosition: 'below-icon',
        tabBarIcon: ({ focused, color, size }) => {
          return <TabWrapperView focused={focused}>
            <FontAwesome name="home" size={20} color={focused ? colors.brightTurquoise : colors.white} />
          </TabWrapperView>
        },


      }}
    />
    <Tab.Screen
      name={RouteTabs.breeding}
      component={BreedingScreen}
      options={{
        tabBarLabelPosition: 'below-icon',
        tabBarIcon: ({ focused, color, size }) => {
          return <TabWrapperView focused={focused}>
            <Entypo name="new" size={20} color={focused ? colors.brightTurquoise : colors.white} />
          </TabWrapperView>
        },
      }}
    />
    <Tab.Screen
      name={RouteTabs.marketplace}
      component={MarketplaceScreen}
      options={{
        tabBarLabelPosition: 'below-icon',
        tabBarIcon: ({ focused, color, size }) => {
          return <TabWrapperView focused={focused}>
            <Entypo name="shop" size={20} color={focused ? colors.brightTurquoise : colors.white} />
          </TabWrapperView>
        },
      }}
    />

    <Tab.Screen
      name={RouteTabs.social}
      component={SocialScreen}
      options={{
        tabBarLabelPosition: 'below-icon',
        tabBarIcon: ({ focused, color, size }) => {
          return <TabWrapperView focused={focused}>
            <Ionicons name="share-social" size={20} color={focused ? colors.brightTurquoise : colors.white} />
          </TabWrapperView>
        },
      }}
    />


  </Tab.Navigator>
}

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const dispatch = useDispatch()

  return (
    <DrawerContentScrollView {...props}>
      {/* <DrawerItemList {...props} /> */}
      <DrawerItem
        label="Sign Out"
        style={{bottom: 0}}
        onPress={awsLogout}
      />
    </DrawerContentScrollView>
  );
}
const MainNavigator = () => {

  const { t } = useTranslation()

  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      initialRouteName={RouteStacks.mainTab}>

      {/* <Drawer.Screen name={RouteStacks.setting} component={SettingScreen} /> */}
      <Drawer.Screen name={RouteStacks.mainTab} component={MainTabNavigator} />

    </Drawer.Navigator>

  )
}


export default MainNavigator
