import React, { useEffect } from 'react'
import { Dimensions, Image, ImageBackground, Linking, Pressable, SafeAreaView, StatusBar, Text, View } from 'react-native'
import { createStackNavigator, TransitionSpecs } from '@react-navigation/stack'
import { LinkingOptions, NavigationContainer, NavigationContainerRefWithCurrent } from '@react-navigation/native'
import { StartupContainer } from '@/Screens'
import { useTheme } from '@/Hooks'
import MainNavigator, { DrawerNavigatorParamList } from './MainNavigator'
import { navigationRef } from './utils'
import AuthNavigator, { AuthNavigatorParamList } from './AuthNavigator'
import { useDispatch, useSelector } from 'react-redux'
import { UserState } from '@/Store/Users/reducer'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// @ts-ignore
import { Auth } from 'aws-amplify'
import { login } from '@/Store/Users/actions'
import messaging from '@react-native-firebase/messaging';
import { RouteStacks } from './routes'
import firebase from '@react-native-firebase/app';
import LoadingScreen from '@/Components/LoadingScreen'
import { UIState } from '@/Store/UI/reducer'
import { privateLinking, publicLinking, publicNavigationRef, privateNavigationRef } from './LinkingOptions'
import { startLoading } from '@/Store/UI/actions'
// @ts-ignore
import SnackBar from 'react-native-snackbar-component'
import { RootState } from '@/Store'
import SnackbarMsgContainer from '@/Components/SnackbarMsgContainer'
import { colors } from '@/Utils/constants'
import Video from 'react-native-video'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

export type ApplicationNavigatorParamList = {
  [RouteStacks.startUp]: undefined
  [RouteStacks.application]: undefined
  BgVideo: undefined
  // 🔥 Your screens go here
}
const Stack = createStackNavigator<ApplicationNavigatorParamList>()

// @refresh reset
const ApplicationNavigator = () => {
  const { Layout, darkMode, NavigationTheme } = useTheme()
  const { isScreenLoading, snackBarConfig } = useSelector((state: RootState) => state.ui)
  const dispatch = useDispatch()
  const { isLoggedIn } = useSelector((state: RootState) => state.user)

  useEffect(() => {
    const retrieveLoggedInUser = async () => {
      try {
        let user = await Auth.currentAuthenticatedUser()
        if (user === null) {
          return
        }

        let { attributes, username } = user

        dispatch(login({
          email: attributes.email,
          username,
        }))
      } catch (err) {
        console.log(err)
      } finally {
        dispatch(startLoading(false))
      }
    }

    if(!isLoggedIn){
      retrieveLoggedInUser()
    }

  }, [isLoggedIn])

  let navProps: {
    ref: NavigationContainerRefWithCurrent<any>,
    linking: LinkingOptions<any>
  } = isLoggedIn ? {
    ref: privateNavigationRef,
    linking: privateLinking
  } : {
      ref: publicNavigationRef,
      linking: publicLinking
    }


  return (
    <SafeAreaView style={[Layout.fill, { backgroundColor: colors.black }]}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SnackBar
          {...snackBarConfig}
          textMessage={() => {
            return <SnackbarMsgContainer textMessage={snackBarConfig.textMessage} />
          }}
          containerStyle={{
            borderRadius: 16,
            paddingHorizontal: 4,
            paddingVertical: 16,
            backgroundColor: '#1F2323',
          }}
          top={10}
          left={10}
          right={10}
        >

        </SnackBar>
        <NavigationContainer theme={NavigationTheme}
          {...navProps}
        >
          <StatusBar
            barStyle={darkMode ? 'light-content' : 'dark-content'} />
          {isScreenLoading && <LoadingScreen />}

          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              presentation: 'transparentModal',
            }} initialRouteName={RouteStacks.startUp}>
            <Stack.Screen name={RouteStacks.startUp} component={StartupContainer} />
            <Stack.Screen name={RouteStacks.application} component={
              isLoggedIn ? MainNavigator : AuthNavigator
            } />
          </Stack.Navigator>

        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaView>
  )
}

export default ApplicationNavigator
