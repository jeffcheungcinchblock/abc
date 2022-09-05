import React, { useState, useEffect, useCallback, FC } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import { View, ActivityIndicator, Text, TextInput, Pressable, ScrollView, TextStyle, Alert, ViewStyle } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand, Header } from '@/Components'
import { useTheme } from '@/Hooks'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'

import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field'
// @ts-ignore
import Amplify, { Auth } from 'aws-amplify'

import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { colors, config } from '@/Utils/constants'
import { AuthNavigatorParamList } from '@/Navigators/AuthNavigator'
import { RouteStacks } from '@/Navigators/routes'
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import TurquoiseButton from '@/Components/Buttons/TurquoiseButton'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { startLoading } from '@/Store/UI/actions'
import WhiteInput from '@/Components/Inputs/WhiteInput'
import axios from 'axios'
import { emailUsernameHash, triggerSnackbar } from '@/Utils/helpers'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Keychain from 'react-native-keychain'
import crashlytics from '@react-native-firebase/crashlytics'
import AvenirText from '@/Components/FontText/AvenirText'

const TEXT_INPUT = {
  height: 40,
  color: 'yellow',
  borderWidth: 1,
  borderRadius: 10,
  borderColor: '#000',
}

const BUTTON_ICON = {
  width: 30,
}

const BUTTON_TEXT: TextStyle = {
  width: 100,
}

const CONTENT_ELEMENT_WRAPPER: ViewStyle = {
  justifyContent: 'center',
  padding: 2,
  width: '90%',
}
let abortController: AbortController

const RegistrationCompletedScreen: FC<StackScreenProps<AuthNavigatorParamList, RouteStacks.registrationCompleted>> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()
  const dispatch = useDispatch()

  const [errMsg, setErrMsg] = useState('')

  const onDonePress = async () => {
    // navigation.navigate(RouteStacks.logIn)
    try {
      dispatch(startLoading(true))
      const keychainCred = await Keychain.getGenericPassword()
      if (keychainCred) {
        const user = await Auth.signIn(keychainCred.username, keychainCred.password)
        let { attributes, username } = user
        let jwtToken = user?.signInUserSession?.idToken?.jwtToken

        const userProfileRes = await axios.get(config.userProfile, {
          signal: abortController.signal,
          headers: {
            Authorization: jwtToken,
          },
        })
        const { email, uuid } = userProfileRes?.data

        dispatch(
          login({
            email: attributes.email,
            username,
            uuid,
          }),
        )
      }
    } catch (err: any) {
      crashlytics().recordError(err)
    } finally {
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'space-between',
        // alignItems: 'center',
        backgroundColor: colors.darkGunmetal,
      }}
      edges={['top']}
    >
      <ScreenBackgrounds screenName={RouteStacks.registrationCompleted}>
        <KeyboardAwareScrollView contentContainerStyle={[Layout.fill, Layout.colCenter]}>
          <Header
            // onLeftPress={goBack}
            headerText={t('completed')}
          />
          <View
            style={[
              {
                flexGrow: 6,
                justifyContent: 'flex-start',
                alignItems: 'center',
              },
              Layout.fullWidth,
              Layout.fill,
            ]}
          >
            <View style={[CONTENT_ELEMENT_WRAPPER, { flexBasis: 45, alignItems: 'center' }]}>
              <AvenirText
                style={[
                  { color: colors.brightTurquoise, fontWeight: '700', fontStyle: 'italic', fontSize: 30, lineHeight: 45 },
                  Fonts.textLeft,
                ]}
              >
                {t('congrats')}
              </AvenirText>
            </View>

            <View
              style={[CONTENT_ELEMENT_WRAPPER, { flexBasis: 90, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
            >
              <AvenirText style={{ color: colors.white }}>{t('registeredSuccess')}</AvenirText>
            </View>
          </View>

          <View style={[Layout.fullWidth, Layout.center, { flex: 1, justifyContent: 'flex-start' }]}>
            <TurquoiseButton
              text={t('done')}
              onPress={onDonePress}
              isTransparentBackground
              containerStyle={{
                width: '45%',
              }}
              isBoldText
            />
          </View>
        </KeyboardAwareScrollView>
      </ScreenBackgrounds>
    </SafeAreaView>
  )
}

export default RegistrationCompletedScreen
