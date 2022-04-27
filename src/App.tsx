import 'react-native-gesture-handler'
import React, { useEffect } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/lib/integration/react'
import { store, persistor } from '@/Store'
import ApplicationNavigator from '@/Navigators/Application'
import './Translations'
import { LogBox, Linking, Alert } from 'react-native';
import WalletConnectProvider from '@walletconnect/react-native-dapp';
import AsyncStorage from '@react-native-async-storage/async-storage';
// @ts-ignore
import Amplify, { Auth } from 'aws-amplify';
import { credentials } from './Utils/firebase'
import awsconfig from '@/aws-exports';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import messaging from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';
import { config } from './Utils/constants'
import { RouteStacks } from './Navigators/routes'


// This is to supress the error coming from unknown lib who is using react-native-gesture-handler
LogBox.ignoreLogs([
  "[react-native-gesture-handler] Seems like you\'re using an old API with gesture components, check out new Gestures system!",
]);

const getUser = () => {
  return Auth.currentAuthenticatedUser()
      .then(userData => userData)
      .catch(() => console.log('Not signed in'));
}

const urlOpener = async (url: string, redirectUrl: string) => {
  console.log('redirectUrl ', redirectUrl)
  try {
    if (redirectUrl === `${config.urlScheme}${RouteStacks.signIn}` && await InAppBrowser.isAvailable()) {
      const authRes: any = await InAppBrowser.openAuth(url, redirectUrl, {
        showTitle: false,
        enableUrlBarHiding: true,
        enableDefaultShare: false,
        ephemeralWebSession: false,
      });

      const { type, url: newUrl } = authRes
      console.log('newUrl', authRes)
      if (type === 'success') {
        Linking.openURL(newUrl);
      }
    }
  } catch (err) {
    console.log('err ', err)
  }

}

Amplify.configure({
  ...awsconfig,
  oauth: {
    ...awsconfig.oauth,
    urlOpener,
  },
});

const App = () => {

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
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      getFcmToken()
      console.log('Authorization status:', authStatus);
    }
  }



  useEffect(() => {
    console.log("Initialized firebae")

    firebase.apps.forEach((app) => {
      console.log('firebase app ', app)

      requestUserPermission()

      const unsubscribe = messaging().onMessage(async remoteMessage => {
        Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
      });
      return unsubscribe;
    })

  }, []);

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
        redirectUrl={'com.fitevo://homeMain'}
        storageOptions={{
          asyncStorage: AsyncStorage,
        }}>

        <PersistGate loading={null} persistor={persistor}>
          <ApplicationNavigator />
        </PersistGate>
      </WalletConnectProvider>
    </Provider>
  )
}

export default App
