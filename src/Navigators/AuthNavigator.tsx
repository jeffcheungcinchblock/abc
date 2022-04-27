import { createNativeStackNavigator } from "@react-navigation/native-stack"
import React, { FC, useEffect } from "react"
import { SignInScreen, SignUpScreen, ValidationCodeScreen, WelcomeScreen } from '@/Screens/Auth'
import { RouteStacks } from "@/Navigators/routes"
import { useDispatch } from "react-redux"
import { login } from "@/Store/Users/actions"
import EnterInvitaionCodeScreen from "@/Screens/Auth/EnterInvitaionCodeScreen"
import { StackScreenProps } from "@react-navigation/stack"

export type AuthNavigatorParamList = {
  [RouteStacks.welcome]: undefined
  [RouteStacks.signUp]: undefined
  [RouteStacks.signIn]: { username: string } | undefined
  [RouteStacks.validationCode]: { username: string } | undefined
  [RouteStacks.enterInvitationCode]: undefined
  // 🔥 Your screens go here
}
const Stack = createNativeStackNavigator<AuthNavigatorParamList>()

const AuthNavigator = () => {

  const dispatch = useDispatch()

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={RouteStacks.welcome}
    >
      <Stack.Screen name={RouteStacks.welcome} component={WelcomeScreen}/>
      <Stack.Screen name={RouteStacks.signIn} component={SignInScreen}/>
      <Stack.Screen name={RouteStacks.signUp} component={SignUpScreen}/>
      <Stack.Screen name={RouteStacks.enterInvitationCode} component={EnterInvitaionCodeScreen}/>
      <Stack.Screen name={RouteStacks.validationCode} component={ValidationCodeScreen}/>
    </Stack.Navigator>
  )
}

export default AuthNavigator