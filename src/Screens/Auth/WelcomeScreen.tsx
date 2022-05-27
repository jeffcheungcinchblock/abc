import React, { useState, useEffect, useCallback, FC, useRef } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import {
  View,
  ActivityIndicator,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  TextStyle,
  Alert,
  ViewStyle,
  ImageBackground,
  Linking,
  Image,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand, Header } from '@/Components'
import { useTheme } from '@/Hooks'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'
// @ts-ignore
import Amplify, { Auth, Hub } from 'aws-amplify'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { colors, config } from '@/Utils/constants'
import { AuthNavigatorParamList } from '@/Navigators/AuthNavigator'
import { RouteStacks } from '@/Navigators/routes'
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import AppLogo from '@/Components/Icons/AppLogo'
import AppIcon from '@/Components/Icons/AppIcon'
import TurquoiseButton from '@/Components/Buttons/TurquoiseButton'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
// @ts-ignore
import notifee from '@notifee/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import SocialSignInButton from '@/Components/Buttons/SocialSignInButton'
import { startLoading } from '@/Store/UI/actions'
// @ts-ignore
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth'
import { emailUsernameHash } from '@/Utils/helpers'
import Animated, { FadeIn } from 'react-native-reanimated'
import axios from 'axios'
import InAppBrowser from 'react-native-inappbrowser-reborn'
import { RootState } from '@/Store'
import RNFS from 'react-native-fs'
import ViewShot from 'react-native-view-shot'
import Orientation from 'react-native-orientation-locker'
import crashlytics from '@react-native-firebase/crashlytics'
import BackgroundService from 'react-native-background-actions'
import TouchID from 'react-native-touch-id'
import { useRealm } from '@/Realms/RealmContext'
import { Post } from '@/Realms/Schemas/PostSchema'

const BUTTON_VIEW = {
  marginVertical: 20,
}

const { UUID } = Realm.BSON

const WelcomeScreen: FC<StackScreenProps<AuthNavigatorParamList, RouteStacks.welcome>> = ({ navigation, route }) => {
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()
  const dispatch = useDispatch()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const realm = useRealm()

  useEffect(() => {
    const run = async () => {
      try {
        let rawFirstVisit = (await AsyncStorage.getItem('firstVisit')) ?? 'true'
        let firstVisit = JSON.parse(rawFirstVisit)
        if (firstVisit) {
          navigation.replace(RouteStacks.welcomeGallery)
        }
      } catch (err: any) {
        crashlytics().recordError(err)
      }
    }
    run()
  }, [])

  const onDisplayNotification = async () => {
    // Create a channel
    try {
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
      })

      // Display a notification
      await notifee.displayNotification({
        title: 'Notification Title',
        body: 'Main body content of the notification',
        android: {
          channelId,
          smallIcon: 'ic_launcher',
        },
      })
    } catch (err: any) {
      crashlytics().recordError(err)
    }
  }

  const onSignInPress = async () => {
    navigation.navigate(RouteStacks.logIn)
  }

  const onLoginOptionPress = async (loginOpt: string) => {
    dispatch(startLoading(true))
    try {
      if (loginOpt === 'facebook') {
        await Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Facebook })
      } else if (loginOpt === 'apple') {
        await Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Apple })
      } else if (loginOpt === 'google') {
        await Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google })
      }
    } catch (err: any) {
      switch (err.message) {
        case 'Username should be either an email or a phone number.':
          setErrMsg(err.message)
          break
        case 'Password did not conform with policy: Password not long enough':
          setErrMsg(err.message)
          break
        case 'User is not confirmed.':
          setErrMsg(err.message)
          break
        case 'Incorrect username or password.':
          setErrMsg(err.message)
          break
        case 'Username cannot be empty':
          setErrMsg(err.message)
          break
        case 'User does not exist.':
          setErrMsg(t('error.invalidUser'))
          break
        default:
      }
      dispatch(startLoading(false))
    } finally {
      setIsLoggingIn(false)
    }
  }
  const onSignUpPress = async () => {
    navigation.navigate(RouteStacks.signUp)

    // realm?.write(() => {
    //   realm.create<Post>('Post', {
    //     title: 'ABC',
    //     createdBy: 'Jeff cheung',
    //   })
    // })

    try {
      // const realm = await Realm.open({
      //     path: "myrealm",
      //     schema: [{
      //         name: "Task",
      //         properties: {
      //             _id: "int",
      //             name: "string",
      //             status: "string?",
      //         },
      //         primaryKey: "_id",
      //     }],
      // });
      // const tasks = realm.objects("Task");
      // console.log('tasks',)
      // let task1, task2;
      // realm.write(() => {
      //     task1 = realm.create("Task", {
      //         _id: 1,
      //         name: "go grocery shopping",
      //         status: "Open",
      //     });
      //     task2 = realm.create("Task", {
      //         _id: 2,
      //         name: "go exercise",
      //         status: "Open",
      //     });
      //     console.log(`created two tasks: ${task1.name} & ${task2.name}`);
      // });
      // realm.close()
    } catch (err: any) {
      console.log(err)
    }
  }

  const onTAndCPress = () => {}

  return (
    <ScreenBackgrounds screenName={RouteStacks.welcome}>
      <KeyboardAwareScrollView
        contentContainerStyle={[
          Layout.fill,
          Layout.colCenter,
          {
            backgroundColor: 'transparent',
          },
        ]}
      >
        <Header headerText=' ' />

        <View
          style={{
            alignItems: 'center',
            width: '100%',
            flex: 1,
            justifyContent: 'flex-start',
          }}
        >
          <AppLogo
            style={{
              height: 150,
            }}
          />

          <View
            style={[
              {
                flexGrow: 4,
                justifyContent: 'flex-end',
              },
              Layout.fullWidth,
              Layout.fill,
            ]}
          >
            <View style={[Layout.fullWidth, Gutters.smallVPadding, Layout.center]}>
              <TurquoiseButton text={t('signUp')} onPress={onSignUpPress} isTransparentBackground containerStyle={{ width: '45%' }} />
            </View>

            <View
              style={[
                Layout.fullWidth,
                Layout.center,
                {
                  paddingBottom: 0,
                  paddingTop: 10,
                },
              ]}
            >
              <TurquoiseButton
                text={t('invitationCode')}
                containerStyle={{ width: '45%' }}
                onPress={() => {
                  navigation.navigate(RouteStacks.enterInvitationCode)
                }}
              />
            </View>
          </View>

          <View
            style={[
              Layout.fullWidth,
              Layout.center,
              {
                flex: 1,
                paddingBottom: 40,
              },
            ]}
          >
            <Pressable onPress={onSignInPress}>
              <Text
                style={[
                  Fonts.textSmall,
                  {
                    color: colors.brightTurquoise,
                  },
                ]}
              >
                {t('alreadyHaveAnAc')}
              </Text>
            </Pressable>
          </View>

          <View
            style={[
              Layout.fullWidth,
              Gutters.largeVMargin,
              Layout.center,
              {
                flex: 1,
              },
            ]}
          >
            <Text
              style={[
                Fonts.textSmall,
                {
                  color: colors.white,
                },
              ]}
            >
              {t('orViaSocialMedia')}
            </Text>

            <View
              style={[Layout.fullWidth, Layout.colCenter, Layout.rowCenter, { flexBasis: 40, flexDirection: 'row', marginVertical: 30 }]}
            >
              <SocialSignInButton
                isLoading={isLoggingIn}
                onPress={() => onLoginOptionPress('facebook')}
                iconName='facebook'
                containerStyle={{
                  marginHorizontal: 8,
                }}
              />
              <SocialSignInButton
                isLoading={isLoggingIn}
                onPress={() => onLoginOptionPress('google')}
                iconName='google'
                containerStyle={{
                  marginHorizontal: 8,
                }}
              />
              <SocialSignInButton
                isLoading={isLoggingIn}
                onPress={() => onLoginOptionPress('apple')}
                iconName='apple'
                containerStyle={{
                  marginHorizontal: 8,
                }}
              />
            </View>
          </View>

          <View
            style={[Layout.fullWidth, Layout.colCenter, Layout.rowCenter, { flexBasis: 60, flexDirection: 'column', marginVertical: 30 }]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Text style={[{ textAlign: 'center', color: colors.white }]}>{t('agreeTo')}</Text>
              <Pressable style={{}} onPress={onTAndCPress}>
                <Text
                  style={{
                    color: colors.brightTurquoise,
                    lineHeight: 14,
                    marginTop: 3,
                  }}
                >
                  {t('T&C')}
                </Text>
              </Pressable>
            </View>

            <Text style={[Layout.fullWidth, { textAlign: 'center', color: colors.white }]}>{t('byRegisteringAc')}</Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </ScreenBackgrounds>
  )
}

export default WelcomeScreen
