import 'react-native-gesture-handler'
import React, { useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux'
import { PersistGate } from 'redux-persist/lib/integration/react'
import { store, persistor } from '@/Store'
import ApplicationNavigator from '@/Navigators/Application'
import './Translations'
import { LogBox, Linking, Alert, Platform, Dimensions, BackHandler, ToastAndroid } from 'react-native'
// @ts-ignore
import WalletConnectProvider, { WalletConnectStorageOptions } from '@walletconnect/react-native-dapp'
// @ts-ignore
import AsyncStorage from '@react-native-async-storage/async-storage'
// @ts-ignore
import Amplify, { Auth } from 'aws-amplify'
import { credentials } from './Utils/firebase'
import awsconfig from '@/aws-exports'
import { InAppBrowser } from 'react-native-inappbrowser-reborn'
import messaging from '@react-native-firebase/messaging'
import firebase from '@react-native-firebase/app'
import appsFlyer from 'react-native-appsflyer'
import { config } from './Utils/constants'
import { RouteStacks } from './Navigators/routes'
import { startLoading } from './Store/UI/actions'
import { storeReferralCode } from './Store/Referral/actions'
import RNBootSplash from 'react-native-bootsplash'
import Orientation from 'react-native-orientation-locker'
import crashlytics from '@react-native-firebase/crashlytics'
import BackgroundGeolocation, { Subscription, Config } from 'react-native-background-geolocation'
import RealmProvider from './Realms/RealmProvider'
import { SafeAreaProvider } from 'react-native-safe-area-context'

// TBD: remove later
console.warn = () => {}
type geoConfigProps = {
  [k in keyof Config]: Config[k]
}

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

const geolocationConfig: {
  ios: geoConfigProps
  android: geoConfigProps
  default: geoConfigProps
} = {
  ios: {
    desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_NAVIGATION,
    stationaryRadius: 2,
    showsBackgroundLocationIndicator: true,
    locationAuthorizationRequest: 'Always',
    activityType: BackgroundGeolocation.ACTIVITY_TYPE_OTHER,
    pausesLocationUpdatesAutomatically: false,
  },
  android: {
    desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
    allowIdenticalLocations: true,
    locationAuthorizationRequest: 'WhenInUse',
  },
  default: {
    persistMode: BackgroundGeolocation.PERSIST_MODE_LOCATION,
    distanceFilter: 5,
    stopTimeout: 120,
    stopOnStationary: false,
    isMoving: true,
    disableElasticity: true,
    preventSuspend: true,
    stopOnTerminate: true,
    reset: false,
    logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
  },
}
const onInstallConversionDataCanceller = appsFlyer.onInstallConversionData(res => {
  const isFirstLaunch = res?.data?.is_first_launch

  if (isFirstLaunch && JSON.parse(isFirstLaunch) === true) {
    if (res.data.af_status === 'Non-organic') {
      const media_source = res.data.media_source
      const campaign = res.data.campaign
    } else if (res.data.af_status === 'Organic') {
    } else {
    }
  }
  const referralCode = res?.data?.referralCode
  if (referralCode) {
    store.dispatch(storeReferralCode(referralCode))
  }
})

const onAppOpenAttributionCanceller = appsFlyer.onAppOpenAttribution(res => {
  const referralCode = res?.data.referralCode
  if (referralCode) {
    store.dispatch(storeReferralCode(referralCode))
  }
})

const onDeepLinkCanceller = appsFlyer.onDeepLink(res => {
  if (res?.deepLinkStatus !== 'NOT_FOUND') {
    const referralCode = res?.data.referralCode
    const mediaSrc = res?.data.media_source
    const param1 = res?.data.af_sub1
    const screen = res?.data.screen
    if (screen !== undefined) {
      Linking.openURL(`${config.urlScheme}${screen}`)
    }

    if (referralCode) {
      store.dispatch(storeReferralCode(referralCode))
    }
  }
})

appsFlyer.initSdk(
  {
    devKey: 'xLdsHZT9juiWRAjhGsjdSV',
    isDebug: false,
    appId: '1618412167',
    onInstallConversionDataListener: true,
    onDeepLinkListener: true,
    timeToWaitForATTUserAuthorization: 10,
  },
  result => {},
  error => {},
)

// This is to supress the error coming from unknown lib who is using react-native-gesture-handler
LogBox.ignoreLogs([
  "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
])

const getUser = () => {
  return Auth.currentAuthenticatedUser()
    .then((userData: any) => userData)
    .catch(() => {})
}

const urlOpener = async (url: string, redirectUrl: string) => {
  console.log(url, config.urlScheme, redirectUrl)
  try {
    if (redirectUrl === `${config.urlScheme}signIn` && (await InAppBrowser.isAvailable())) {
      const authRes: any = await InAppBrowser.openAuth(url, redirectUrl, {
        showTitle: false,
        enableUrlBarHiding: true,
        enableDefaultShare: false,
        ephemeralWebSession: true,
      })

      const { type, url: newUrl } = authRes

      if (type === 'success') {
        Linking.openURL(newUrl)
      } else if (type === 'cancel') {
        store.dispatch(startLoading(false))
      }
    }
  } catch (err: any) {
    crashlytics().recordError(err)
    await InAppBrowser.close()
    store.dispatch(startLoading(false))
  }
}

Amplify.configure({
  ...awsconfig,
  oauth: {
    ...awsconfig.oauth,
    urlOpener,
  },
})

const App = () => {
  const getFcmToken = async () => {
    const fcmToken = await messaging().getToken()
    if (fcmToken) {
    } else {
    }
  }

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission()
    const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL

    if (enabled) {
      getFcmToken()
    }
  }

  useEffect(() => {
    RNBootSplash.hide({ fade: true })

    requestUserPermission()

    let messageHandler = async (remoteMessage: any) => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage))
    }

    let onNotiPress = async (remoteMessage: any) => {
      const { link } = remoteMessage.data
      let toBeOpenURL = `${config.urlScheme}${link}`
      Linking.openURL(toBeOpenURL)
    }

    messaging().onNotificationOpenedApp(onNotiPress)

    const unsubscribe = messaging().onMessage(messageHandler)
    messaging().setBackgroundMessageHandler(messageHandler)

    store.dispatch(startLoading(false))

    return unsubscribe
  }, [])

  useEffect(() => {
    const run = async () => {
      const iOSConfig = {
        ...geolocationConfig.ios,
        ...geolocationConfig.default,
      }
      const androidConfig = {
        ...geolocationConfig.android,
        ...geolocationConfig.default,
      }

      if (Platform.OS === 'ios') {
        await BackgroundGeolocation.ready(
          // isIOS ? iOSConfig : androidConfig
          iOSConfig,
        )
      } else {
        await BackgroundGeolocation.ready(
          // isIOS ? iOSConfig : androidConfig
          androidConfig,
        )
      }
    }

    run()
  }, [])

  useEffect(() => {
    let backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)

    return () => {
      backHandler.remove()
    }
  }, [])

  return (
    <Provider store={store}>
      {/**
       * PersistGate delays the rendering of the app's UI until the persisted state has been retrieved
       * and saved to redux.
       * The `loading` prop can be `null` or any react instance to show during loading (e.g. a splash screen),
       * for example `loading={<SplashScreen />}`.
       * @see https://github.com/rt2zz/redux-persist/blob/master/docs/PersistGate.md
       */}

      <WalletConnectProvider
        redirectUrl={`${config.urlScheme}${RouteStacks.homeMain}`}
        storageOptions={{
          asyncStorage: AsyncStorage as any, // latest version of asyncstorage doesnt conforms to the IAsyncStorage interface declaration, without store, size and getStore properties
        }}
      >
        <SafeAreaProvider>
          <RealmProvider>
            <PersistGate loading={null} persistor={persistor}>
              <ApplicationNavigator />
            </PersistGate>
          </RealmProvider>
        </SafeAreaProvider>
      </WalletConnectProvider>
    </Provider>
  )
}

export default App
