import React, { useState, useEffect, useCallback, FC } from 'react'
import { DrawerScreenProps } from '@react-navigation/drawer'
import { View, ActivityIndicator, Text, TextInput, ScrollView, TextStyle, Alert, ViewStyle, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand } from '@/Components'
import { useTheme } from '@/Hooks'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'

import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { colors, config } from '@/Utils/constants'
import { DrawerNavigatorParamList } from '@/Navigators/MainNavigator'
import { RouteStacks } from '@/Navigators/routes'
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
// @ts-ignore
import { useWalletConnect } from '@walletconnect/react-native-dapp'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import TurquoiseButton from '@/Components/Buttons/TurquoiseButton'
import AvenirText from '@/Components/FontText/AvenirText'

const SettingScreen: FC<DrawerScreenProps<DrawerNavigatorParamList, RouteStacks.setting>> = ({ navigation, route }) => {
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()
  const dispatch = useDispatch()

  const connector = useWalletConnect()
  const params = route!.params || { username: null }

  useEffect(() => {
    // FingerprintScanner
    //     .authenticate({ description: 'Scan your fingerprint on the device scanner to continue' })
    //     .then(() => {
    //         Alert.alert('Authenticated successfully');
    //     })
    //     .catch((error) => {
    //         Alert.alert(error.message);
    //     });
  }, [])

  const onToggleDrawerPress = async () => {
    navigation.toggleDrawer()
  }

  return (
    <ScreenBackgrounds screenName={RouteStacks.setting}>
      <KeyboardAwareScrollView contentContainerStyle={[Layout.fill, Layout.colCenter, Gutters.smallHPadding]}>
        <View
          style={{
            alignItems: 'center',
            width: '100%',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <AvenirText style={{ color: colors.black }}>Setting screen</AvenirText>

          {<TurquoiseButton onPress={onToggleDrawerPress} text={t('Toggle Drawer')} containerStyle={[Layout.fullWidth]} />}

          <TurquoiseButton
            onPress={() => (!connector.connected ? connector.connect() : connector.killSession())}
            text={!connector.connected ? t('Connect Wallet') : t('Disconnect Wallet')}
            containerStyle={[Layout.fullWidth, { flex: 1 }]}
          />
        </View>
      </KeyboardAwareScrollView>
    </ScreenBackgrounds>
  )
}

export default SettingScreen
