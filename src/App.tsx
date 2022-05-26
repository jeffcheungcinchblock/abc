import 'react-native-gesture-handler'
import React, { useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux'
import { PersistGate } from 'redux-persist/lib/integration/react'
import { store, persistor } from '@/Store'
import ApplicationNavigator from '@/Navigators/Application'
import './Translations'
import { LogBox, Linking, Alert, Platform } from 'react-native';
// @ts-ignore
import WalletConnectProvider from "@walletconnect/react-native-dapp";
import AsyncStorage from "@react-native-async-storage/async-storage";
// @ts-ignore
import Amplify, { Auth } from "aws-amplify";
import { credentials } from "./Utils/firebase";
import awsconfig from "@/aws-exports";
import { InAppBrowser } from "react-native-inappbrowser-reborn";
import messaging from "@react-native-firebase/messaging";
import firebase from "@react-native-firebase/app";
import appsFlyer from "react-native-appsflyer";
import { config } from "./Utils/constants";
import { RouteStacks } from "./Navigators/routes";
import { startLoading } from "./Store/UI/actions";
import { storeReferralCode } from "./Store/Referral/actions";
import RNBootSplash from "react-native-bootsplash";
import Orientation from "react-native-orientation-locker";
import crashlytics from "@react-native-firebase/crashlytics";
import BackgroundGeolocation, {
  Subscription,
} from "react-native-background-geolocation";
import CameraRoll from "@react-native-community/cameraroll";
import {hasAndroidPermission} from '@/Utils/permissionHandlers'

// TBD: remove later
console.warn = () => {};
const geolocationConfig = {
  ios: {
    desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_NAVIGATION,
    stationaryRadius: 6,
    showsBackgroundLocationIndicator: true,
    locationAuthorizationRequest: "WhenInUse",
    activityType: "FITNESS",
    disableLocationAuthorizationAlert: true,
  },
  android: {
    desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
    allowIdenticalLocations: true,
    locationAuthorizationRequest: "WhenInUse",
  },
  default: {
    distanceFilter: 2,
    stopTimeout: 5,
    isMoving: true,
    disableElasticity: true,
    preventSuspend: true,
    stopOnTerminate: true,
    reset: false,
    debug: true,
    logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
  },
};
const onInstallConversionDataCanceller = appsFlyer.onInstallConversionData(
  (res) => {
    const isFirstLaunch = res?.data?.is_first_launch;

    if (isFirstLaunch && JSON.parse(isFirstLaunch) === true) {
      if (res.data.af_status === "Non-organic") {
        const media_source = res.data.media_source;
        const campaign = res.data.campaign;
        console.log(
          "appsFlyer Conversion Data: ",
          "This is first launch and a Non-Organic install. Media source: " +
            media_source +
            " Campaign: " +
            campaign
        );
      } else if (res.data.af_status === "Organic") {
        console.log(
          "appsFlyer Conversion Data: ",
          "This is first launch and a Organic Install"
        );
      } else {
        console.log("appsFlyer Conversion Data: ", "This is not first launch");
      }
    }
    const DLValue = res?.data?.deep_link_value;
    if (DLValue) {
      store.dispatch(storeReferralCode(DLValue));
    }
  }
);

const onAppOpenAttributionCanceller = appsFlyer.onAppOpenAttribution((res) => {
  console.log(`status: ${res.status}`);
  console.log(`campaign: ${res.data.campaign}`);
  console.log(`af_dp: ${res.data.af_dp}`);
  console.log(`link: ${res.data.link}`);
  console.log(`DL value: ${res.data.deep_link_value}`);
  console.log(`media source: ${res.data.media_source}`);
  const DLValue = res?.data.deep_link_value;
  if (DLValue) {
    store.dispatch(storeReferralCode(DLValue));
  }
});

const onDeepLinkCanceller = appsFlyer.onDeepLink((res) => {
  if (res?.deepLinkStatus !== "NOT_FOUND") {
    const DLValue = res?.data.deep_link_value;
    const mediaSrc = res?.data.media_source;
    const param1 = res?.data.af_sub1;
    const screen = res?.data.screen;
    if (screen !== undefined) {
      Linking.openURL(`${config.urlScheme}${screen}`);
    }

    if (DLValue) {
      store.dispatch(storeReferralCode(DLValue));
    }
  }
});

appsFlyer.initSdk(
  {
    devKey: "xLdsHZT9juiWRAjhGsjdSV",
    isDebug: false,
    appId: "1618412167",
    onInstallConversionDataListener: true,
    onDeepLinkListener: true,
    timeToWaitForATTUserAuthorization: 10,
  },
  (result) => {
    // console.log("appsFlyer Result: ", result);
  },
  (error) => {
    // console.log("appsFlyer Error: ", error);
  }
);

// This is to supress the error coming from unknown lib who is using react-native-gesture-handler
LogBox.ignoreLogs([
  "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
]);

const getUser = () => {
  return Auth.currentAuthenticatedUser()
    .then((userData: any) => userData)
    .catch(() => {});
};

const urlOpener = async (url: string, redirectUrl: string) => {
  try {
    if (
      redirectUrl === `${config.urlScheme}${RouteStacks.signIn}` &&
      (await InAppBrowser.isAvailable())
    ) {
      // const authRes: any = await InAppBrowser.open(url)
      const authRes: any = await InAppBrowser.openAuth(url, redirectUrl, {
        showTitle: false,
        enableUrlBarHiding: true,
        enableDefaultShare: false,
        ephemeralWebSession: false,
      });

      const { type, url: newUrl } = authRes;

      if (type === "success") {
        Linking.openURL(newUrl);
      } else if (type === "cancel") {
        store.dispatch(startLoading(false));
      }
    }
  } catch (err: any) {
    crashlytics().recordError(err);
    await InAppBrowser.close();
    store.dispatch(startLoading(false));
  }
};

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
      console.log("Firebase Token:", fcmToken);
    } else {
      console.log("Failed", "No token received");
    }
  };

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      getFcmToken();
    }
  };

  useEffect(() => {
    RNBootSplash.hide({ fade: true });

    requestUserPermission();

    let messageHandler = async (remoteMessage: any) => {
      Alert.alert("A new FCM message arrived!", JSON.stringify(remoteMessage));
    };

    let onNotiPress = async (remoteMessage: any) => {
      const { link } = remoteMessage.data;
      let toBeOpenURL = `${config.urlScheme}${link}`;
      Linking.openURL(toBeOpenURL);
    };

    messaging().onNotificationOpenedApp(onNotiPress);

    const unsubscribe = messaging().onMessage(messageHandler);
    messaging().setBackgroundMessageHandler(messageHandler);

    store.dispatch(startLoading(false));

    return unsubscribe;
  }, []);

  useEffect(() => {
    const run = async () => {
      const iOSConfig = {
        ...geolocationConfig.ios,
        ...geolocationConfig.default,
      };
      const androidConfig = {
        ...geolocationConfig.android,
        ...geolocationConfig.default,
      };

      if(Platform.OS === 'ios') {
        await BackgroundGeolocation.ready(
          // isIOS ? iOSConfig : androidConfig
          iOSConfig
        );
      }
      else{
        await BackgroundGeolocation.ready(
          // isIOS ? iOSConfig : androidConfig
          androidConfig
        );
      }
     console.log('ready geolocation')
    };

    run();
    
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
        redirectUrl={`${config.urlScheme}${RouteStacks.homeMain}`}
        storageOptions={{
          asyncStorage: AsyncStorage,
        }}
      >
        <PersistGate loading={null} persistor={persistor}>
          <ApplicationNavigator />
        </PersistGate>
      </WalletConnectProvider>
    </Provider>
  );
};

export default App;
