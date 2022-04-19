import React, { useEffect } from 'react'
import { Alert, Linking, SafeAreaView, StatusBar } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { LinkingOptions, NavigationContainer } from '@react-navigation/native'
import { StartupContainer } from '@/Screens'
import { useTheme } from '@/Hooks'
import MainNavigator from './MainNavigator'
import { navigationRef } from './utils'
import AuthNavigator from './AuthNavigator'
import { useSelector } from 'react-redux'
import { UserState } from '@/Store/Users/reducer'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SplashScreen from 'react-native-splash-screen'
// import firebase from "@react-native-firebase/app";
import messaging from '@react-native-firebase/messaging';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import { RouteStacks } from './routes'

const Stack = createStackNavigator()

const linking: LinkingOptions = {
  prefixes: ['com.fitevo://', 'http://fitevo.com/'],
  async getInitialURL(): Promise<string> {
    // Check if the app was opened by a deep link
    const url = await Linking.getInitialURL();
    const dynamicLinkUrl = await dynamicLinks().getInitialLink();

    console.log('@@@@@dynamicLinkUrl', dynamicLinkUrl)
    if (dynamicLinkUrl) {
      return dynamicLinkUrl.url;
    }
    if (url) {
      return url;
    }
    // If it was not opened by a deep link, go to the home screen
    return 'com.fitevo://welcome';
  },
  // Custom function to subscribe to incoming links
  subscribe(listener: (deeplink: string) => void) {
    // First, you may want to do the default deep link handling
    const onReceiveURL = ({url}: {url: string}) => listener(url);
    // Listen to incoming links from deep linking
    let onReceiveURLEvent = Linking.addEventListener('url', onReceiveURL);
    const handleDynamicLink = (link: any) => {
      console.log('++##== dynamicLink ', link)
    }
    const unsubscribeToDynamicLinks = dynamicLinks().onLink(handleDynamicLink);
    return () => {
      unsubscribeToDynamicLinks();
      // Linking.removeEventListener('url', onReceiveURL);
      onReceiveURLEvent.remove()
    };
  },
  config: {
    screens: {
      [RouteStacks.welcome]: {
        path: 'welcome',
      },
      [RouteStacks.signIn]: {
        path: 'signIn',
      },
      
    },
  },
};

// @refresh reset
const ApplicationNavigator = () => {
  const { Layout, darkMode, NavigationTheme } = useTheme()
  const { colors } = NavigationTheme
  const { isLogin } = useSelector(
    (state: { user: UserState }) => state.user
  )

  const getFcmToken = async () => {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
     console.log(fcmToken);
     console.log("Your Firebase Token is:", fcmToken);
    } else {
     console.log("Failed", "No token received");
    }
  }

  const requestUserPermission = async () => {
    // await messaging().registerDeviceForRemoteMessages()
    const authStatus = await messaging().requestPermission();

    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    console.log('enabled', enabled)
    if (enabled) {
      getFcmToken()
      console.log('Authorization status:', authStatus);
    }
  }

  // const generateLink = async (param: string, value: string) => {
  //   const link = await firebase.dynamicLinks().buildShortLink({
  //     link: `<your_link>/?${param}=${value}`,
  //     ios: {
  //       bundleId: <bundle_id>,
  //       appStoreId: <appstore_id>,
  //     },
  //     android: {
  //       packageName: <package_name>,
  //     },
  //     domainUriPrefix: 'https://exampledomain000.page.link',
  //   });
  
  //   return link;
  // }

  // useEffect(() => {
  //   const handleDynamicLink = (link: any) => {
  //     console.log('++======== dynamicLink ', link)
  //   }

  //   const unsubscribe = dynamicLinks().onLink(handleDynamicLink);

  //   dynamicLinks().getInitialLink().then(handleDynamicLink)
  //   return () => unsubscribe();
  // }, [])

  useEffect(() => {
   
    requestUserPermission()
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });
    return unsubscribe

    setTimeout(() => {
      console.log("### HIDE SPLASH SCREEN AFTER 4 seconds ###")
      SplashScreen.hide()
    }, 3000)
  }, [])

  return (
    <SafeAreaView style={[Layout.fill, { backgroundColor: colors.card }]}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer theme={NavigationTheme} ref={navigationRef} linking={linking}>
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
