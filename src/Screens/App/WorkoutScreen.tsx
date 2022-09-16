import React, { useState, useEffect, useCallback, FC } from 'react'
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack'
import { View, ActivityIndicator, Text, TextInput, ScrollView, TextStyle, Alert, ViewStyle } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand } from '@/Components'
import { useTheme } from '@/Hooks'
import { useLazyFetchOneQuery } from '@/Services/modules/users'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'

import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { config } from '@/Utils/constants'
import { TabNavigatorParamList } from '@/Navigators/MainNavigator'
import { RouteTabs, RouteStacks } from '@/Navigators/routes'
import MainScreen from './Workout/MainScreen'
import ActiveScreenSolo, { Region } from './Workout/ActiveScreenSolo'
import EndScreen from './Workout/EndScreen'
import WorkoutSelectScreen from './Workout/WorkoutSelectScreen'
import WorkoutTypeSelectScreen from './Workout/WorkoutTypeSelectScreen'

const Stack = createStackNavigator()

export type WorkoutNavigatorParamList = {
  [RouteStacks.workoutMain]: undefined | { region: Region }
  // [RouteStacks.workoutSelect]: undefined
  [RouteStacks.workoutTypeSelect]: undefined
  [RouteStacks.startWorkout]: undefined
  [RouteStacks.endWorkout]: {
    speed: number | string
    timer: number | string
    steps: number | string
  }
}

const WorkoutScreen: FC<StackScreenProps<TabNavigatorParamList, RouteTabs.workout>> = ({ navigation, route }) => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, presentation: 'transparentModal' }}
      initialRouteName={RouteStacks.workoutTypeSelect}
    >
      <Stack.Screen name={RouteStacks.workoutMain} component={MainScreen} />
      <Stack.Screen name={RouteStacks.startWorkout} component={ActiveScreenSolo} />
      <Stack.Screen name={RouteStacks.endWorkout} component={EndScreen} />
      {/* <Stack.Screen name={RouteStacks.workoutSelect} component={WorkoutSelectScreen} /> */}
      <Stack.Screen name={RouteStacks.workoutTypeSelect} component={WorkoutTypeSelectScreen} />
    </Stack.Navigator>
  )
}

export default WorkoutScreen
