import { createNativeStackNavigator } from "@react-navigation/native-stack"
import React from "react"
import {SignInScreen, SignUpScreen, ValidationCodeScreen, WelcomeScreen} from '@/Screens/Auth'
import { RouteStacks } from "@/Navigators/routes"

export type AuthNavigatorParamList = {
  [RouteStacks.welcome]: undefined
  [RouteStacks.signUp]: undefined
  [RouteStacks.signIn]: undefined
  [RouteStacks.validationCode]: undefined
  // 🔥 Your screens go here
}
const Stack = createNativeStackNavigator<AuthNavigatorParamList>()

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={RouteStacks.welcome}
    >
      <Stack.Screen name={RouteStacks.welcome} component={WelcomeScreen}
        options={({ navigation }) => ({
        })}
      />
      <Stack.Screen name={RouteStacks.signIn} component={SignInScreen}
        options={({ navigation }) => ({
        })}
      />
      <Stack.Screen name={RouteStacks.signUp} component={SignUpScreen}
        options={({ navigation }) => ({
        })}
      />

      <Stack.Screen name={RouteStacks.validationCode} component={ValidationCodeScreen}
        options={({ navigation }) => ({
        })}
      />

    </Stack.Navigator>
  )
}

export default AuthNavigator