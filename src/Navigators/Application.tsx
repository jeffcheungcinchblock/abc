import React, { useEffect } from 'react'
import { SafeAreaView, StatusBar } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import { StartupContainer } from '@/Screens'
import { useTheme } from '@/Hooks'
import MainNavigator from './MainNavigator'
import { navigationRef } from './utils'
import AuthNavigator from './AuthNavigator'
import { useSelector } from 'react-redux'
import { UserState } from '@/Store/Users/reducer'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SplashScreen from 'react-native-splash-screen'

const Stack = createStackNavigator()

// @refresh reset
const ApplicationNavigator = () => {
  const { Layout, darkMode, NavigationTheme } = useTheme()
  const { colors } = NavigationTheme
  const { isLogin } = useSelector(
    (state: { user: UserState }) => state.user
  )

  useEffect(() => {
    setTimeout(() => {
      console.log("### HIDE SPLASH SCREEN AFTER 3 seconds ###")
      SplashScreen.hide()
    }, 3000)
  }, [])

  return (
    <SafeAreaView style={[Layout.fill, { backgroundColor: colors.card }]}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer theme={NavigationTheme} ref={navigationRef}>
          <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />

          {
            isLogin ? <MainNavigator /> : <AuthNavigator />
          }
   
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaView>
  )
}

export default ApplicationNavigator
