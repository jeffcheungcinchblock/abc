import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { AppNavigator } from "./app-navigator"
import { AuthNavigator } from "./auth-navigator"

interface NavigationProps extends Partial<React.ComponentProps<typeof NavigationContainer>> {}

export const AuthLoadingNavigator = (props: NavigationProps) => {
  const isLogin = false;

  return isLogin ? (
    <AppNavigator {...props} />
  ) : (
    <AuthNavigator {...props} />
  )
}