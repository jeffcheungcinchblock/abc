import React, { useState, useEffect, useCallback, FC, useRef, LegacyRef } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import { View, ActivityIndicator, Text, TextInput, Pressable, ScrollView, TextStyle, Alert, Image, ViewStyle } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand, Header } from '@/Components'
import { useTheme } from '@/Hooks'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
// @ts-ignore
import Amplify, { Auth } from 'aws-amplify'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { colors, config } from '@/Utils/constants'
import { AuthNavigatorParamList } from '@/Navigators/AuthNavigator'
import { HeaderLayout } from '@/Styles'
import { RouteStacks } from '@/Navigators/routes'
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import WhiteInput from '@/Components/Inputs/WhiteInput'
import TurquoiseButton from '@/Components/Buttons/TurquoiseButton'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { startLoading } from '@/Store/UI/actions'
import AppIcon from '@/Components/Icons/AppIcon'
import ModalBox from 'react-native-modalbox'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import StandardInput from '@/Components/Inputs/StandardInput'
import SlideInputModal from '@/Components/Modals/SlideInputModal'
import { emailUsernameHash, validateEmail } from '@/Utils/helpers'
import { SafeAreaView } from 'react-native-safe-area-context'
import AvenirText from '@/Components/FontText/AvenirText'

const BUTTON_ICON = {
  width: 30,
}

const BUTTON_TEXT: TextStyle = {
  width: 100,
}

const INPUT_VIEW_LAYOUT: ViewStyle = {
  flexBasis: 80,
  justifyContent: 'center',
}

const ERR_MSG_TEXT: TextStyle = {
  color: colors.magicPotion,
  paddingTop: 4,
  paddingHorizontal: 4,
  lineHeight: 21,
  fontSize: 14,
}

const initErrMsg = {
  email: '',
  password: '',
}

const SignUpScreen: FC<StackScreenProps<AuthNavigatorParamList, RouteStacks.signUp>> = ({ navigation, route }) => {
  const modalRef = useRef<any>()
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()
  const dispatch = useDispatch()
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [errMsg, setErrMsg] = useState({
    ...initErrMsg,
  })
  const [credential, setCredential] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)

  const onCredentialFieldChange = (field: string, text: string) => {
    setCredential(prevCredential => {
      return {
        ...prevCredential,
        [field]: text,
      }
    })
  }

  const onCreateAccountPress = useCallback(async () => {
    let currErrMsg: { email: string; password: string } = { email: '', password: '' }
    if (credential.email === '') {
      currErrMsg = {
        ...initErrMsg,
        email: t('error.emailEmpty'),
      }
    }

    if (!validateEmail(credential.email)) {
      currErrMsg = {
        ...initErrMsg,
        email: t('error.loginInputEmpty'),
      }
    }

    if (credential.password.length === 0) {
      currErrMsg = {
        ...initErrMsg,
        password: t('error.loginInputEmpty'),
      }
    }

    if (
      credential.password.length < 8 ||
      !!!credential.password.match(/[A-Z]/) ||
      !!!credential.password.match(/[a-z]/) ||
      !!!credential.password.match(/\d/)
    ) {
      currErrMsg = {
        ...initErrMsg,
        password: t('error.passwordPolicyErr'),
      }
    }

    if (currErrMsg.email !== '' || currErrMsg.password !== '') {
      setErrMsg(currErrMsg)
      return
    }

    try {
      dispatch(startLoading(true))
      setIsCreatingAccount(true)
      // any type here as aws amplify has no typescript support
      const { user }: any = await Auth.signUp({
        username: emailUsernameHash(credential.email),
        password: credential.password,
        attributes: {
          email: credential.email,
        },
      })
      setIsCreatingAccount(false)
      navigation.navigate(RouteStacks.validationCode, {
        email: credential.email,
        password: credential.password,
        action: 'signUp',
      })
    } catch (err: any) {
      console.log('err ', err)
      switch (err.message) {
        case 'Password did not conform with policy: Password must have uppercase characters':
        case 'Password did not conform with policy: Password not long enough':
        case 'Password cannot be empty':
          setErrMsg({
            ...initErrMsg,
            password: t('error.passwordPolicyErr'),
          })
          break
        case 'User already exists':
          setErrMsg({
            ...initErrMsg,
            email: t('error.emailUsed'),
          })
          break
        case 'Invalid email address format.':
        default:
          setErrMsg({
            ...initErrMsg,
            email: t('error.loginInputEmpty'),
          })
          break
      }
    } finally {
      dispatch(startLoading(false))
      setIsCreatingAccount(false)
    }
  }, [credential, errMsg])

  const goBack = () => navigation.navigate(RouteStacks.welcome)

  const onPasswordEyePress = () => setShowPassword(prev => !prev)

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
      <ScreenBackgrounds screenName={RouteStacks.signUp}>
        <ScrollView contentContainerStyle={[Layout.fill, Layout.colCenter, Layout.justifyContentStart]}>
          <Header headerText={t('createAccount')} onLeftPress={goBack} />

          <View
            style={[
              {
                height: '30%',
                justifyContent: 'center',
              },
              Layout.fullWidth,
            ]}
          >
            <AppIcon />

            <View style={[Layout.fullWidth, { justifyContent: 'center', paddingVertical: 30, paddingHorizontal: 20 }]}>
              <AvenirText style={[{ color: colors.white, fontWeight: 'bold', fontSize: 24, lineHeight: 32 }, Fonts.textCenter]}>
                {t('getStarted')}!
              </AvenirText>
            </View>
          </View>

          <SlideInputModal
            ref={modalRef}
            style={{
              height: '60%',
            }}
            onModalClose={goBack}
          >
            <KeyboardAwareScrollView contentContainerStyle={[Layout.fill]}>
              <View style={[Layout.fullWidth, Gutters.largeHPadding, INPUT_VIEW_LAYOUT]}>
                <StandardInput
                  onChangeText={text => onCredentialFieldChange('email', text)}
                  value={credential.email}
                  placeholder={t('email')}
                  placeholderTextColor={colors.spanishGray}
                  autoCapitalize={'none'}
                />
                {errMsg.email !== '' && <AvenirText style={[ERR_MSG_TEXT]}>{errMsg.email}</AvenirText>}
              </View>

              <View style={[Layout.fullWidth, Gutters.largeHPadding, INPUT_VIEW_LAYOUT]}>
                <StandardInput
                  onChangeText={text => onCredentialFieldChange('password', text)}
                  value={credential.password}
                  placeholder={t('password')}
                  placeholderTextColor={colors.spanishGray}
                  secureTextEntry={!showPassword}
                  showPassword={showPassword}
                  onPasswordEyePress={onPasswordEyePress}
                />
                {errMsg.password !== '' && <AvenirText style={[ERR_MSG_TEXT]}>{errMsg.password}</AvenirText>}
              </View>

              <View style={[Layout.fullWidth, Layout.center, Gutters.largeVPadding, { flex: 1, justifyContent: 'center' }]}>
                <TurquoiseButton
                  onPress={onCreateAccountPress}
                  text={t('create')}
                  isTransparentBackground
                  containerStyle={{
                    width: '45%',
                    paddingBottom: 40,
                  }}
                  isBoldText
                />
                <View style={{ flexDirection: 'row' }}>
                  <AvenirText style={{ color: colors.white, fontSize: 16, lineHeight: 24 }}>{t('alreadyHaveAnAccount')}</AvenirText>
                  <Pressable style={{ paddingLeft: 6 }} onPress={() => navigation.navigate(RouteStacks.logIn)}>
                    <AvenirText style={{ color: colors.brightTurquoise, fontWeight: 'bold', fontSize: 16, lineHeight: 24 }}>
                      {t('logIn')}
                    </AvenirText>
                  </Pressable>
                </View>
              </View>
            </KeyboardAwareScrollView>
          </SlideInputModal>
        </ScrollView>
      </ScreenBackgrounds>
    </SafeAreaView>
  )
}

export default SignUpScreen
