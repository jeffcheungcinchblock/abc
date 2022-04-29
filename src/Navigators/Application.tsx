import React, { useEffect } from 'react'
import { Image, ImageBackground, Linking, SafeAreaView, StatusBar, Text, View } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { LinkingOptions, NavigationContainer } from '@react-navigation/native'
import { StartupContainer } from '@/Screens'
import { useTheme } from '@/Hooks'
import MainNavigator, { DrawerNavigatorParamList } from './MainNavigator'
import { navigationRef } from './utils'
import AuthNavigator from './AuthNavigator'
import { useDispatch, useSelector } from 'react-redux'
import { UserState } from '@/Store/Users/reducer'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// @ts-ignore
import { Auth } from 'aws-amplify'
import { login } from '@/Store/Users/actions'
import messaging from '@react-native-firebase/messaging';
import dynamicLinks from '@react-native-firebase/dynamic-links';
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

const Stack = createStackNavigator()

// @refresh reset
const ApplicationNavigator = () => {
  const { Layout, darkMode, NavigationTheme } = useTheme()
  const { colors } = NavigationTheme
  const { isScreenLoading, snackBarConfig } = useSelector((state: RootState) => state.ui)
  const dispatch = useDispatch()
  const { isLogin } = useSelector((state: RootState) => state.user)

  useEffect(() => {
    const retrieveLoggedInUser = async () => {
      console.log('retrieveLoggedInUser')
      try {
        let user = await Auth.currentAuthenticatedUser()
        if (user === null) {
          console.log("no active session found")
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
    retrieveLoggedInUser()

  }, [])

  return (
    <SafeAreaView style={[Layout.fill, { backgroundColor: colors.card }]}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SnackBar
          {...snackBarConfig}
          textMessage={() => {
            return <SnackbarMsgContainer textMessage={snackBarConfig.textMessage}/>
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
          // ref={publicNavigationRef} linking={publicLinking}
          ref={publicNavigationRef}
          linking={publicLinking}
        >
          <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
          {
            isScreenLoading && <LoadingScreen />
          }

          {
            isLogin ? <MainNavigator /> : <AuthNavigator />
          }
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaView>
  )
}

export default ApplicationNavigator
