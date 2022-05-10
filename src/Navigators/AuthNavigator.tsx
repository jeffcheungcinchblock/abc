import { createNativeStackNavigator } from "@react-navigation/native-stack"
import React, { FC, useEffect, useState } from "react"
import { SignInScreen, SignUpScreen, SignUpWithCodeScreen, ValidationCodeScreen, WelcomeGalleryScreen, ForgotPasswordScreen, WelcomeScreen } from '@/Screens/Auth'
import { RouteStacks } from "@/Navigators/routes"
import { useDispatch } from "react-redux"
import { login } from "@/Store/Users/actions"
import EnterInvitaionCodeScreen from "@/Screens/Auth/EnterInvitaionCodeScreen"
import { StackScreenProps } from "@react-navigation/stack"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { navigationRef } from "./utils"
import { LinkingOptions, NavigationContainerRefWithCurrent, Route } from "@react-navigation/native"

type ValidationCodeParam = {
  username: string,
  action: 'forgotPassword' | 'signUp',
  code?: string
}

export type AuthNavigatorParamList = {
  [RouteStacks.welcomeGallery]: undefined
  [RouteStacks.welcome]: undefined
  [RouteStacks.signUp]: { code?: string } | undefined
  [RouteStacks.signIn]: { username: string } | undefined
  [RouteStacks.validationCode]: ValidationCodeParam | undefined
  [RouteStacks.enterInvitationCode]: undefined
  [RouteStacks.forgotPassword]: undefined
  [RouteStacks.signUpWithCode]: undefined
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
      <Stack.Screen name={RouteStacks.welcomeGallery} component={WelcomeGalleryScreen} />
      <Stack.Screen name={RouteStacks.welcome} component={WelcomeScreen} />
      <Stack.Screen name={RouteStacks.signIn} component={SignInScreen} />
      <Stack.Screen name={RouteStacks.signUp} component={SignUpScreen} />
      <Stack.Screen name={RouteStacks.enterInvitationCode} component={EnterInvitaionCodeScreen} />
      <Stack.Screen name={RouteStacks.validationCode} component={ValidationCodeScreen} />
      <Stack.Screen name={RouteStacks.forgotPassword} component={ForgotPasswordScreen} />
      <Stack.Screen name={RouteStacks.signUpWithCode} component={SignUpWithCodeScreen} />
    </Stack.Navigator>
  )
}

export default AuthNavigator