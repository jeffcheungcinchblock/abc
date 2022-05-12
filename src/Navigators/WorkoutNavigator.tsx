import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import React, { FC, useEffect } from 'react'
import { SignInScreen, SignUpScreen, ValidationCodeScreen, WelcomeScreen } from '@/Screens/Auth'
import { MapScreen, StartScreen, MainScreen, EndScreen, LiteScreen } from '@/Screens/App/Workout'
import { RouteStacks, RouteTabs } from '@/Navigators/routes'
import { useDispatch } from 'react-redux'
import { login } from '@/Store/Users/actions'
import EnterInvitaionCodeScreen from '@/Screens/Auth/EnterInvitaionCodeScreen'
import { StackScreenProps } from '@react-navigation/stack'
import ForgotPasswordScreen from '@/Screens/Auth/ForgotPasswordScreen'
import { DrawerItem, DrawerScreenProps } from '@react-navigation/drawer'
import { createDrawerNavigator, DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'
import { awsLogout } from '@/Utils/helpers'
import { Region } from '@/Screens/App/Workout/StartScreen'

export type WorkoutNavigatorParamList = {
  [RouteStacks.startWorkout]: undefined
  [RouteStacks.workout]:  undefined | {region: Region}
  [RouteStacks.endWorkout]:  undefined
  // 🔥 Your screens go here
}

const Tab = createBottomTabNavigator()
const Drawer = createDrawerNavigator()

const Stack = createNativeStackNavigator<WorkoutNavigatorParamList>()
export function Workout() {
	return (
		<Tab.Navigator>
			<Tab.Screen name="workout" component={MainScreen} />
			<Tab.Screen name="Lite" component={LiteScreen} />
		</Tab.Navigator>
	)
}


const WorkoutNavigator = () => {
	const dispatch = useDispatch()

	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
			}}
			initialRouteName={RouteStacks.startWorkout}
		>
			<Stack.Screen name={RouteStacks.startWorkout} component={StartScreen} options={{ headerShown:false }}/>
			{/* <Stack.Screen name={RouteStacks.workout} component={Workout} options={{ headerShown: false }}/> */}
			<Stack.Screen name={RouteStacks.workout} component={MainScreen} options={{ headerShown: false }}/>
			<Stack.Screen name={RouteStacks.endWorkout} component={EndScreen} options={{ headerShown: false }}/>

		</Stack.Navigator>
	)
}

export default WorkoutNavigator
