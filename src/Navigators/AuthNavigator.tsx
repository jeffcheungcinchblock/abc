import { createNativeStackNavigator } from "@react-navigation/native-stack"
import React, { FC, useEffect, useState } from "react"
import {
  SignInScreen, SignUpScreen, SignUpWithCodeScreen, ValidationCodeScreen, RegistrationCompletedScreen,
  WelcomeGalleryScreen, ForgotPasswordScreen, WelcomeScreen, CreateNewPasswordScreen
} from '@/Screens/Auth'
import { RouteStacks } from "@/Navigators/routes"
import { useDispatch, useSelector } from "react-redux"
import { login } from "@/Store/Users/actions"
import EnterInvitaionCodeScreen from "@/Screens/Auth/EnterInvitaionCodeScreen"
import { createStackNavigator, StackScreenProps } from "@react-navigation/stack"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { navigationRef } from "./utils"
import { LinkingOptions, NavigationContainerRefWithCurrent, Route } from "@react-navigation/native"
import { StartupContainer } from "@/Screens"
import ProvideEmailScreen from "@/Screens/Auth/ProvideEmailScreen"

type ValidationCodeParam = {
  email: string,
  action: 'forgotPassword' | 'signUp' | 'resendSignUp' | 'registerEmail',
  code?: string
}

export type AuthNavigatorParamList = {
  [RouteStacks.welcomeGallery]: undefined
  [RouteStacks.welcome]: undefined
  [RouteStacks.signUp]: { code?: string } | undefined
  [RouteStacks.signIn]: undefined
  [RouteStacks.validationCode]: ValidationCodeParam | undefined
  [RouteStacks.enterInvitationCode]: undefined
  [RouteStacks.forgotPassword]: undefined
  [RouteStacks.signUpWithCode]: undefined
  [RouteStacks.createNewPassword]: { validationCode: string, email: string }
  [RouteStacks.provideEmail]: undefined
  [RouteStacks.registrationCompleted]: undefined
  // 🔥 Your screens go here
}
const Stack = createStackNavigator<AuthNavigatorParamList>()

const AuthNavigator = () => {

  const dispatch = useDispatch()

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={RouteStacks.welcome}
      // initialRouteName={RouteStacks.welcomeGallery}
    >

      <Stack.Screen name={RouteStacks.welcomeGallery} component={WelcomeGalleryScreen} />
      <Stack.Screen name={RouteStacks.welcome} component={WelcomeScreen} />
      <Stack.Screen name={RouteStacks.signUpWithCode} component={SignUpWithCodeScreen} />
      <Stack.Screen name={RouteStacks.signIn} component={SignInScreen} />
      <Stack.Screen name={RouteStacks.signUp} component={SignUpScreen} />
      <Stack.Screen name={RouteStacks.enterInvitationCode} component={EnterInvitaionCodeScreen} />
      <Stack.Screen name={RouteStacks.validationCode} component={ValidationCodeScreen} />
      <Stack.Screen name={RouteStacks.forgotPassword} component={ForgotPasswordScreen} />
      <Stack.Screen name={RouteStacks.createNewPassword} component={CreateNewPasswordScreen} />
      <Stack.Screen name={RouteStacks.provideEmail} component={ProvideEmailScreen} />
      <Stack.Screen name={RouteStacks.registrationCompleted} component={RegistrationCompletedScreen} />
    </Stack.Navigator>
  )
}

export default AuthNavigator