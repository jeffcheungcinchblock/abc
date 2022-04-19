import 'react-native-gesture-handler'
import React from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/lib/integration/react'
import { store, persistor } from '@/Store'
import ApplicationNavigator from '@/Navigators/Application'
import './Translations'
import { LogBox, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import WalletConnectProvider from '@walletconnect/react-native-dapp';

LogBox.ignoreLogs([
  "[react-native-gesture-handler] Seems like you\'re using an old API with gesture components, check out new Gestures system!",
]);
const App = () => (
  <Provider store={store}>
    {/**
     * PersistGate delays the rendering of the app's UI until the persisted state has been retrieved
     * and saved to redux.
     * The `loading` prop can be `null` or any react instance to show during loading (e.g. a splash screen),
     * for example `loading={<SplashScreen />}`.
     * @see https://github.com/rt2zz/redux-persist/blob/master/docs/PersistGate.md
     */}
    {/* <WalletConnectProvider
      redirectUrl={'https://fitevo.page.link/xEYL'}
      // storageOptions={{
      //   asyncStorage: AsyncStorage,
      // }}
      > */}
      <PersistGate loading={null} persistor={persistor}>
        <ApplicationNavigator />
      </PersistGate>

    {/* </WalletConnectProvider> */}
  </Provider>
)

export default App
