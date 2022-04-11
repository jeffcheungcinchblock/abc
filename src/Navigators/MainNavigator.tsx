import React, { useEffect } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { HomeScreen, BreedingScreen, MarketplaceScreen, SocialScreen } from '@/Screens/App'


import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Entypo from 'react-native-vector-icons/Entypo'
import Ionicons from 'react-native-vector-icons/Ionicons'


import { useTranslation } from 'react-i18next'
import { colors } from '@/Utils/constants'
import { createStackNavigator } from '@react-navigation/stack'
import { RouteTabs } from './routes'


export type MainNavigatorParamList = {
  home: undefined
  breeding: undefined
  marketplace: undefined
  social: undefined
  // 🔥 Your screens go here
}

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

const MainTabNavigator = () => {

  const { t } = useTranslation()

  useEffect(() => {

  }, [])

  return <Tab.Navigator
    screenOptions={{ 
      headerShown: false,
    }}
  >
    <Tab.Screen
      name={RouteTabs.home}
      component={HomeScreen}
      options={{
        tabBarLabelPosition: 'below-icon',
        tabBarLabel: t("tabBarLabels.home"),
        tabBarIcon: ({ focused, color, size }) => {
          return <FontAwesome name="home" size={20} color={focused ? colors.frenchPink : "#000"} />
        },

      }}
    />
    <Tab.Screen
      name={RouteTabs.breeding}
      component={BreedingScreen}
      options={{
        tabBarLabelPosition: 'below-icon',
        tabBarLabel: t("tabBarLabels.breeding"),
        tabBarIcon: ({ focused, color, size }) => {
          return <Entypo name="new" size={20} color={focused ? colors.frenchPink : "#000"} />
        },
      }}
    />
    <Tab.Screen
      name={RouteTabs.marketplace}
      component={MarketplaceScreen}
      options={{
        tabBarLabelPosition: 'below-icon',
        tabBarLabel: t("tabBarLabels.marketplace"),
        tabBarIcon: ({ focused, color, size }) => {
          return <Entypo name="shop" size={20} color={focused ? colors.frenchPink : "#000"} />
        },
      }}
    />

    <Tab.Screen
      name={RouteTabs.social}
      component={SocialScreen}
      options={{
        tabBarLabelPosition: 'below-icon',
        tabBarLabel: t("tabBarLabels.social"),
        tabBarIcon: ({ focused, color, size }) => {
          return <Ionicons name="share-social" size={20} color={focused ? colors.frenchPink : "#000"} />
        },
      }}
    />


  </Tab.Navigator>
}

const MainNavigator = () => {

  const { t } = useTranslation()

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="mainTab">
      <Stack.Screen name="mainTab" component={MainTabNavigator} />
      {/* Additional hidden stack screens to be added here ,e.g. Setting Screen*/}
    </Stack.Navigator>
  )
}

export default MainNavigator
