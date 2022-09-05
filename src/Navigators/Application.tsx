import React, { useEffect } from 'react'
import { Dimensions, Image, ImageBackground, Linking, Pressable, StatusBar, Text, View } from 'react-native'
import { createStackNavigator, TransitionSpecs } from '@react-navigation/stack'
import { LinkingOptions, NavigationContainer, NavigationContainerRefWithCurrent, useNavigation } from '@react-navigation/native'
import { useTheme } from '@/Hooks'
import MainNavigator, { DrawerNavigatorParamList } from './MainNavigator'
import { navigationRef } from './utils'
import AuthNavigator, { AuthNavigatorParamList } from './AuthNavigator'
import { useDispatch, useSelector } from 'react-redux'
import { UserState } from '@/Store/Users/reducer'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
// @ts-ignore
import { Auth } from 'aws-amplify'
import { login } from '@/Store/Users/actions'
import messaging from '@react-native-firebase/messaging'
import { RouteStacks } from './routes'
import firebase from '@react-native-firebase/app'
import LoadingScreen from '@/Components/LoadingScreen'
import { UIState } from '@/Store/UI/reducer'
import { privateLinking, publicLinking, publicNavigationRef, privateNavigationRef } from './LinkingOptions'
import { startLoading } from '@/Store/UI/actions'
// @ts-ignore
import SnackBar from 'react-native-snackbar-component'
import { RootState } from '@/Store'
import SnackbarMsgContainer from '@/Components/SnackbarMsgContainer'
import { colors, config } from '@/Utils/constants'
import crashlytics from '@react-native-firebase/crashlytics'
// @ts-ignore
import Video from 'react-native-video'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import axios from 'axios'
// @ts-ignore
import { Hub } from 'aws-amplify'
import WelcomeGalleryScreen from '@/Screens/Auth/WelcomeGalleryScreen'
import { WelcomeScreen } from '@/Screens/Auth'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { awsLogout } from '@/Utils/helpers'

export type ApplicationNavigatorParamList = {
  [RouteStacks.application]: undefined
  [RouteStacks.mainNavigator]: undefined
  // 🔥 Your screens go here
}
const Stack = createStackNavigator<ApplicationNavigatorParamList>()

let abortController: AbortController

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

        let jwtToken = user?.signInUserSession?.idToken?.jwtToken
        const userProfileRes = await axios.get(config.userProfile, {
          signal: abortController.signal,
          headers: {
            Authorization: jwtToken, //the token is a variable which holds the token
          },
        })

        const { email, uuid, verified } = userProfileRes?.data

        if (verified === 'true') {
          dispatch(
            login({
              username: username,
              email: attributes.email,
              uuid,
            }),
          )
        } else {
          await awsLogout()
        }
      } catch (err: any) {
        crashlytics().recordError(err)
      } finally {
        dispatch(startLoading(false))
      }
    }

    if (!isLoggedIn) {
      retrieveLoggedInUser()
    }
  }, [isLoggedIn])

  useEffect(() => {
    abortController = new AbortController()
    return () => {
      abortController.abort()
    }
  }, [])

  let navProps: {
    ref: NavigationContainerRefWithCurrent<any>
    linking: LinkingOptions<any>
  } = isLoggedIn
    ? {
        ref: privateNavigationRef,
        linking: privateLinking,
      }
    : {
        ref: publicNavigationRef,
        linking: publicLinking,
      }

  useEffect(() => {
    const getUser = () => {
      return Auth.currentAuthenticatedUser()
        .then((userData: any) => userData)
        .catch(() => {})
    }

    const authListener = async ({ payload: { event, data } }: any) => {
      switch (event) {
        case 'signIn':
        case 'cognitoHostedUI':
          try {
            let userData = await getUser()
            let jwtToken = userData?.signInUserSession?.idToken?.jwtToken
            const userProfileRes = await axios.get(config.userProfile, {
              signal: abortController.signal,
              headers: {
                Authorization: jwtToken,
              },
            })
            const { email, uuid, username } = userProfileRes?.data
            if (
              (username.includes('Google') || username.includes('Facebook') || username.includes('SignInWithApple')) &&
              email === undefined
            ) {
              publicNavigationRef.navigate(RouteStacks.provideEmail)
              // dispatch(startLoading(false))
            } else {
              dispatch(
                login({
                  username: userData.username,
                  email: userData.email,
                  uuid,
                }),
              )
              // dispatch(startLoading(false))
            }
          } catch (err: any) {
            crashlytics().recordError(err)
          }
          break
        case 'signOut':
          break
        case 'signIn_failure':
        case 'cognitoHostedUI_failure':
          dispatch(startLoading(false))
          break
        default:
          break
      }
    }

    Hub.listen('auth', authListener)

    return () => {
      Hub.remove('auth', authListener)
    }
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SnackBar
        {...snackBarConfig}
        textMessage={() => {
          return <SnackbarMsgContainer textMessage={snackBarConfig.textMessage} />
        }}
        containerStyle={{
          borderRadius: 99,
        }}
        top={40}
        left={10}
        right={10}
      ></SnackBar>
      <NavigationContainer theme={NavigationTheme} {...navProps}>
        <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
        {isScreenLoading && <LoadingScreen />}

        {isLoggedIn ? <MainNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </GestureHandlerRootView>
  )
}

export default ApplicationNavigator
