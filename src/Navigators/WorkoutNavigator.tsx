import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import React, { FC, useEffect } from 'react'
import { SignInScreen, SignUpScreen, ValidationCodeScreen, WelcomeScreen } from '@/Screens/Auth'
import {  StartScreen, MainScreen, EndScreen, LiteScreen } from '@/Screens/App/Workout'
import { RouteStacks, RouteTabs } from '@/Navigators/routes'
import { useDispatch } from 'react-redux'

import { Region } from '@/Screens/App/Workout/StartScreen'

export type WorkoutNavigatorParamList = {
  [RouteStacks.startWorkout]: undefined
  [RouteStacks.workout]:  undefined | {region: Region}
  [RouteStacks.endWorkout]: any
  // 🔥 Your screens go here
}

const Tab = createBottomTabNavigator()

const Stack = createNativeStackNavigator<WorkoutNavigatorParamList>()
export function Workout() {
	return (
		<Tab.Navigator>
			<Tab.Screen name="workout" component={MainScreen} />
			<Tab.Screen name="lite" component={LiteScreen} />
			<Tab.Screen name="end" component={EndScreen} />
		</Tab.Navigator>
	)
}


const WorkoutNavigator = () => {

	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
			}}
			initialRouteName={RouteStacks.workout}
		>
			{/* <Stack.Screen name={RouteStacks.startWorkout} component={StartScreen} /> */}
			<Stack.Screen name={RouteStacks.workout} component={MainScreen} />
			<Stack.Screen name={RouteStacks.endWorkout} component={EndScreen} />

		</Stack.Navigator>
	)
}

export default WorkoutNavigator
