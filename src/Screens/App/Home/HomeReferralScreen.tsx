/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useCallback, FC, useRef, useMemo } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import {
  View,
  ActivityIndicator,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  TextStyle,
  Platform,
  Alert,
  ViewStyle,
  RefreshControl,
  Image,
  Dimensions,
  Linking,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand, Header } from '@/Components'
import { useTheme } from '@/Hooks'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login, logout } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'
// @ts-ignore
import AnimateNumber from 'react-native-animate-number'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { colors, config } from '@/Utils/constants'
import { HomeNavigatorParamList } from '@/Screens/App/HomeScreen'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Share from 'react-native-share'
import share from '@/Utils/share'
import HeaderLayout from '@/Styles/HeaderLayout'
import { RouteStacks, RouteTabs } from '@/Navigators/routes'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { CompositeScreenProps } from '@react-navigation/native'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { DrawerScreenProps } from '@react-navigation/drawer'
import { DrawerNavigatorParamList, TabNavigatorParamList } from '@/Navigators/MainNavigator'
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import TurquoiseButton from '@/Components/Buttons/TurquoiseButton'
import CircleButton from '@/Components/Buttons/CircleButton'
import AvenirBoldText from '@/Components/FontText/AvenirBoldText'
import AvenirMediumText from '@/Components/FontText/AvenirMediumText'
import Clipboard from '@react-native-clipboard/clipboard'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { awsLogout, triggerSnackbar } from '@/Utils/helpers'
import times from 'lodash/times'
// @ts-ignore
import { Auth } from 'aws-amplify'
import axios, { Canceler, CancelTokenSource } from 'axios'
import { RootState } from '@/Store'
import world from '@/Assets/Images/Home/world.png'
import SlideInputModal from '@/Components/Modals/SlideInputModal'
import CircularProgress from 'react-native-circular-progress-indicator'
import Svg, { G, Circle } from 'react-native-svg'
import { startLoading } from '@/Store/UI/actions'
import AppIcon from '@/Components/Icons/AppIcon'
import reward from '@/Assets/Images/Modal/reward.png'
import DailyRewardModal from '@/Components/Modals/DailyRewardModal'
import GoogleFitModal from '@/Components/Modals/GoogleFitModal'
import RuleOfReferralModal from '@/Components/Modals/RuleOfReferralModal'
//health kit - googlefit
import { IOSHealthKit } from '@/Healthkit/iosHealthKit'
import { GoogleFitKit } from '@/Healthkit/androidHealthKit'

import scrollDownBtn from '@/Assets/Images/Home/scroll_down.png'
import avatar from '@/Assets/Images/Home/avatar.png'
import InvitationRewardModal from '@/Components/Modals/InvitationRewardModal'
import logoutBtn from '@/Assets/Images/buttons/btn_logout.png'
import Orientation from 'react-native-orientation-locker'
import { storeReferralCode } from '@/Store/Referral/actions'
import emptyAvatar from '@/Assets/Images/Home/avatar_empty.png'
import crashlytics from '@react-native-firebase/crashlytics'
import shareIcon from '@/Assets/Images/Home/share.png'
import moneyIcon from '@/Assets/Images/Home/money.png'
import infoIcon from '@/Assets/Images/Home/info.png'
import communityIcon from '@/Assets/Images/Home/community.png'

import howToEarn from '@/Assets/Images/Home/howToEarn.png'
import howToEarn2 from '@/Assets/Images/Home/howToEarn2.png'
import card1 from '@/Assets/Images/Home/card1.png'
import card2 from '@/Assets/Images/Home/card2.png'
import card3 from '@/Assets/Images/Home/card3.png'
import card4 from '@/Assets/Images/Home/card4.png'

import { check, request, RESULTS, PERMISSIONS, checkMultiple, requestMultiple } from 'react-native-permissions'
import { Results } from 'realm'
import BackgroundGeolocation, { Subscription } from 'react-native-background-geolocation'
import { forEach } from 'lodash'
import { runOnUI } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

import InAppBrowser from 'react-native-inappbrowser-reborn'
const PURPLE_COLOR = {
  color: colors.magicPotion,
}

type ReferralInfo = {
  point: number
  lastRank: number // lastRank === 0 for new account
  queueNumber: number
  referral: string
  referred: number
  referredBy: string
  referredEmails: string[]
  username: string
  uuid: string
  top100AvgKE: number
  totalPoint: number
}

type HomeReferralScreenNavigationProp = CompositeScreenProps<
  StackScreenProps<HomeNavigatorParamList, RouteStacks.homeReferral, RouteStacks.workout>,
  CompositeScreenProps<BottomTabScreenProps<TabNavigatorParamList>, DrawerScreenProps<DrawerNavigatorParamList>>
>

const REFERRED_FRIEND_ICON: ViewStyle = {
  borderRadius: 99,
  width: 40,
  height: 40,
  backgroundColor: colors.crystal,
  justifyContent: 'center',
  alignItems: 'center',
  position: 'absolute',
}

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height
const isIOS = Platform.OS === 'ios'
const health_kit = isIOS ? new IOSHealthKit() : new GoogleFitKit()

const HomeReferralScreen: FC<HomeReferralScreenNavigationProp> = ({ navigation, route }) => {
  const keyboardAwareScrollViewRef = useRef<any>(null)
  const dailyRewardModalRef = useRef<any>(null)
  const ruleOfReferralModalRef = useRef<any>(null)
  const invitationRewardModalRef = useRef<any>(null)
  const googleFitModalRef = useRef<any>(null)

  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()
  const { invitationCode } = useSelector((state: RootState) => state.user)
  const dispatch = useDispatch()
  const [isInvitingFriends, setIsInvitingFriends] = useState(false)
  const [needFetchDtl, setNeedFetchDtl] = useState(true)
  const [fetchedReferralInfo, setFetchedReferralInfo] = useState(false)
  const [referralInfo, setReferralInfo] = useState<ReferralInfo>({
    point: 0,
    lastRank: 0,
    queueNumber: 0,
    referral: '',
    referred: 0,
    username: '',
    referredBy: '',
    referredEmails: [],
    uuid: '',
    top100AvgKE: 0,
    totalPoint: 0,
  })
  const [isStartPressed, setIsStartPressed] = useState<boolean>(false)
  const [enabled, setEnabled] = useState(false)
  const startTime = useSelector((state: RootState) => state.map.startTime)

  useEffect(() => {
    dispatch(startLoading(false))
    dispatch({ type: 'init' })
  }, [])

  useEffect(() => {
    let cancelSourceArr: CancelTokenSource[] = []

    const dailyLogin = async (jwtToken: string) => {
      cancelSourceArr[3] = axios.CancelToken.source()
      let userDailyLoginRes = await axios.get(config.userDailyLogin, {
        cancelToken: cancelSourceArr[3].token,
        headers: {
          Authorization: jwtToken,
        },
      })
    }

    const run = async () => {
      try {
        let user = await Auth.currentAuthenticatedUser()
        let jwtToken = user?.signInUserSession?.idToken?.jwtToken

        cancelSourceArr[0] = axios.CancelToken.source()
        cancelSourceArr[1] = axios.CancelToken.source()
        cancelSourceArr[2] = axios.CancelToken.source()

        const [authRes, userFitnessInfoRes, topAvgPointRes] = await Promise.all([
          axios.get(config.userProfile, {
            cancelToken: cancelSourceArr[0].token,
            headers: {
              Authorization: jwtToken,
            },
          }),
          axios.get(config.userFitnessInfo, {
            headers: {
              'x-api-key': config.fitnessInfoApiKey,
              Authorization: jwtToken,
            },
          }),
          axios.get(config.userTopAvgPoint),
        ])

        const { dailyMission, loginCount, totalPoint } = userFitnessInfoRes.data

        dailyLogin(jwtToken)

        if (!fetchedReferralInfo) {
          if (loginCount === 0) {
            invitationRewardModalRef?.current?.open()
          } else if (!dailyMission?.isLogin) {
            dailyRewardModalRef?.current?.open()
          }
        }

        setReferralInfo({
          ...authRes.data,
          totalPoint,
          top100AvgKE: topAvgPointRes.data.data.topAveragePoint,
        })

        setFetchedReferralInfo(true)

        setTimeout(() => {
          setNeedFetchDtl(false)
        }, 1000)
      } catch (err: any) {
        crashlytics().recordError(err)
      }
    }

    if (needFetchDtl) {
      run()
    }

    return () => {
      cancelSourceArr.forEach((cancelSrc: null | CancelTokenSource) => {
        cancelSrc?.cancel()
      })
    }
  }, [needFetchDtl, fetchedReferralInfo])

  useEffect(() => {
    // TBD: To be placed some where upper level component later
    const confirmReferral = async () => {
      let user = await Auth.currentAuthenticatedUser()
      let jwtToken = user.signInUserSession.idToken.jwtToken

      try {
        let referralConfirmRes = await axios({
          method: 'post',
          url: `${config.referralConfirmation}`,
          headers: {
            'Content-Type': 'application/json',
            Authorization: jwtToken,
          },
          data: JSON.stringify({
            referral: invitationCode,
          }),
        })
      } catch (err: any) {
        // console.log('###', err.response)
      }
    }

    if (referralInfo.referredBy === '' && !fetchedReferralInfo) {
      // Not yet referred by anyone, if user entered invitation code, need to confirm
      confirmReferral()
      dispatch(storeReferralCode(''))
    }
  }, [referralInfo, fetchedReferralInfo])

  const onSharePress = async () => {
    const shareRes = await share({
      url: `${config.onelinkUrl}/?screen=${RouteStacks.enterInvitationCode}&deep_link_value=${referralInfo.referral}`,
      title: t('shareMsg'),
      message: t('shareMsg'),
    })
  }

  const onCopyPress = () => {
    Clipboard.setString(referralInfo.referral)
    triggerSnackbar(t('snackbarPrompt.referralCodeCopied'))
  }

  const onRefresh = () => {
    setNeedFetchDtl(true)
  }

  const onDailyRewardModalClose = () => {}

  const onRuleOfReferralModalClose = () => {}

  const onGoogleFitModalClose = () => {
    console.log('closed')
  }
  const onGoogleFitModalCloseBtnPress = () => {
    googleFitModalRef?.current?.close()
    setIsStartPressed(false)
  }

  const onLogoutPress = async () => {
    dispatch(startLoading(true))
    await awsLogout()
    dispatch(startLoading(false))
  }

  useEffect(() => {
    if (enabled === true && startTime !== null) {
      console.log('enabled, start', enabled, startTime)
      navigation.replace(RouteStacks.workout)
    }
  }, [startTime, enabled])

  const onTrialPlayPress = async () => {
    try {
      setIsStartPressed(true)
      const LocationpermissionStatus = await checkMultiple([
        PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      ])
      let locationPermission = false
      if (isIOS) {
        if (LocationpermissionStatus[PERMISSIONS.IOS.LOCATION_WHEN_IN_USE] === 'granted') {
          locationPermission = true
        }
      } else {
        if (
          LocationpermissionStatus[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === 'granted' &&
          LocationpermissionStatus[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] === 'granted'
        ) {
          locationPermission = true
        }
      }
      const permission = await health_kit.InitHealthKitPermission()
      const authed = await health_kit.GetAuthorizeStatus()

      console.log(permission)
      console.log('auth', authed, locationPermission)

      if (!permission) {
        googleFitModalRef?.current?.open()
        return
      }

      if (!authed) {
        googleFitModalRef?.current?.open()
        return
      }
      if (locationPermission) {
        BackgroundGeolocation.getCurrentPosition({
          samples: 1,
        })
          .then(location => {
            dispatch({
              type: 'start',
              payload: { startTime: new Date().getTime(), latitude: location.coords.latitude, longitude: location.coords.longitude },
            })
          })
          .then(() => {
            BackgroundGeolocation.start()
          })
          .then(() => {
            setEnabled(true)
          })
      } else {
        await requestMultiple([
          PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
        ])
        return onTrialPlayPress()
      }
    } catch (err) {
      crashlytics().recordError(err)
    }
  }
  const onLesGoBtnPress = () => dailyRewardModalRef?.current?.close()
  const onRuleOfReferralCloseBtnPress = () => ruleOfReferralModalRef?.current?.close()

  const onInfoBtnPress = () => ruleOfReferralModalRef?.current?.open()

  const onScrollDownPress = () => {
    keyboardAwareScrollViewRef?.current?.scrollToEnd()
  }

  const onInvitationRewardModalClose = () => {}

  const onInvitationRewardModalCloseBtnPress = () => {
    invitationRewardModalRef?.current?.close()
  }

  const onTAndCPress = async () => {
    await InAppBrowser.open('https://fitevo-nft.gitbook.io/agreement/')
  }

  const onLinkMediumPress = async () => {
    await InAppBrowser.open('https://medium.com/fitevo/introducing-ke-points-earn-massive-gains-through-simple-active-tasks-74a70d793c04')
  }

  let queueNoDiff = referralInfo.lastRank - referralInfo.queueNumber
  let referredNames = useMemo(() => {
    return referralInfo.referredEmails.map(elem => elem.toUpperCase())
  }, [referralInfo.referredEmails])

  let isNewAc = referralInfo.lastRank === 0

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'space-between', backgroundColor: colors.darkGunmetal }} edges={['top']}>
      <ScreenBackgrounds screenName={RouteStacks.homeReferral}>
        <DailyRewardModal ref={dailyRewardModalRef} onModalClose={onDailyRewardModalClose} onActionBtnPress={onLesGoBtnPress} ke={20} />

        <RuleOfReferralModal
          ref={ruleOfReferralModalRef}
          onModalClose={onRuleOfReferralModalClose}
          onActionBtnPress={onRuleOfReferralCloseBtnPress}
        />
        <GoogleFitModal ref={googleFitModalRef} onModalClose={onGoogleFitModalClose} onActionBtnPress={onGoogleFitModalCloseBtnPress} />
        <InvitationRewardModal
          ref={invitationRewardModalRef}
          ke={20}
          onModalClose={onInvitationRewardModalClose}
          onActionBtnPress={onInvitationRewardModalCloseBtnPress}
        />

        <Pressable onPress={onScrollDownPress} style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 2 }}>
          <Image source={scrollDownBtn} style={{}} />
        </Pressable>

        <KeyboardAwareScrollView
          ref={keyboardAwareScrollViewRef}
          contentContainerStyle={[Layout.colCenter]}
          refreshControl={
            <RefreshControl refreshing={needFetchDtl} onRefresh={onRefresh} progressViewOffset={10} tintColor={colors.brightTurquoise} />
          }
        >
          <Header headerText={t('home')} rightIcon={() => <Image source={logoutBtn} />} onRightPress={onLogoutPress} />
          <View
            style={{
              height: 220,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress
              value={referralInfo.totalPoint}
              radius={110}
              duration={2000}
              progressValueColor={colors.transparent}
              maxValue={config.totalPointsMaxCap}
              activeStrokeColor={colors.brightTurquoise}
              strokeLinecap={'butt'}
              inActiveStrokeWidth={14}
              activeStrokeWidth={14}
            />
            <View
              style={{
                position: 'absolute',
                top: 65,
                width: '100%',
              }}
            >
              <Text
                style={{
                  color: colors.white,
                  fontSize: 18,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                {t('totalPoints')}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginTop: 10,
                  alignItems: 'center',
                }}
              >
                {/* <Text style={{
                                color: colors.white, fontSize: 40, fontWeight: "bold",
                                textAlign: "center"
                            }}>{referralInfo.totalPoint}</Text> */}
                <AnimateNumber
                  value={referralInfo.totalPoint}
                  style={{
                    color: colors.white,
                    fontSize: 40,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                  formatter={(val: string) => {
                    return parseInt(val)
                  }}
                />
              </View>
            </View>
          </View>

          <View style={[Layout.fullWidth, { alignItems: 'center', justifyContent: 'flex-end', height: 100 }]}>
            <Text
              style={[
                {
                  paddingTop: 0,
                  paddingBottom: 2,
                  color: colors.white,
                  fontSize: 24,
                },
              ]}
            >
              {t('queueNumber')}
            </Text>
            <View
              style={[
                Layout.fullWidth,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}
            >
              <View
                style={{
                  backgroundColor:
                    isNewAc || queueNoDiff === 0 ? colors.philippineSilver : queueNoDiff > 0 ? colors.brightTurquoise : colors.magicPotion,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 2,
                  marginRight: 16,
                  justifyContent: 'center',
                }}
              >
                <Text style={[{ color: colors.darkGunmetal, fontSize: 18 }]}>
                  {isNewAc || queueNoDiff === 0 ? '+' : queueNoDiff > 0 ? '▲' : '▼'} {isNewAc ? 0 : queueNoDiff}
                </Text>
              </View>
              {/* <Text style={[{ fontWeight: "bold", color: colors.white, fontSize: 44 }]}>{referralInfo.queueNumber}</Text> */}
              <AnimateNumber
                value={referralInfo.queueNumber}
                style={{
                  color: colors.white,
                  fontSize: 44,
                  fontWeight: 'bold',
                }}
                formatter={(val: string) => {
                  return parseInt(val)
                }}
              />
            </View>
          </View>

          <View style={[Layout.fullWidth, { alignItems: 'center', justifyContent: 'center', height: 140 }]}>
            <Text style={[Layout.fullWidth, { color: colors.white, fontSize: 24, textAlign: 'center' }]}>{t('top100AvgKE')}</Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <AnimateNumber
                value={referralInfo.top100AvgKE.toFixed(2)}
                style={{
                  color: colors.white,
                  fontSize: 40,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
                formatter={(val: string) => {
                  return parseFloat(val).toFixed(2)
                }}
              />
            </View>
          </View>

          <View
            style={[
              Layout.fullWidth,
              Layout.center,
              {
                paddingBottom: 40,
              },
            ]}
          >
            <View
              style={{
                backgroundColor: isStartPressed ? colors.charcoal : colors.brightTurquoise,
                shadowColor: isStartPressed ? colors.charcoal : colors.brightTurquoise,
                elevation: 10,
                borderRadius: 30,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 10,
              }}
            >
              <Pressable
                style={{
                  borderRadius: 30,
                  paddingHorizontal: 40,
                  paddingVertical: 4,
                }}
                onPress={onTrialPlayPress}
                disabled={isStartPressed}
              >
                <Text
                  style={{
                    fontSize: 30,
                    fontWeight: 'bold',
                    fontStyle: 'italic',
                    fontFamily: 'Poppins-Bold',
                    color: colors.darkGunmetal,
                  }}
                >
                  {t('trialPlay')}
                </Text>
              </Pressable>
            </View>
          </View>

          <View
            style={{
              backgroundColor: colors.jacarta,
              borderRadius: 20,
              height: 110,
              marginBottom: 30,
              marginHorizontal: 20,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 10,
                paddingRight: 20,
              }}
            >
              <Text style={[{ color: colors.white, paddingTop: 0, paddingHorizontal: 20 }, Fonts.textSmall]}>{t('yourReferralCode')}</Text>
              <Pressable
                onPress={onCopyPress}
                style={{
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: colors.darkBlueGray,
                  opacity: 0.5,
                  width: 45,
                  height: 30,
                }}
              >
                <MaterialCommunityIcons name='content-copy' size={20} color={colors.white} />
              </Pressable>
            </View>

            <View
              style={[
                {
                  flexDirection: 'row',
                  paddingHorizontal: 20,
                  position: 'relative',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingTop: 10,
                },
              ]}
            >
              <TextInput
                value={referralInfo.referral}
                editable={false}
                style={{
                  color: colors.white,
                  backgroundColor: colors.chineseBlack,
                  borderRadius: 10,
                  width: '100%',
                  paddingHorizontal: 20,
                  height: 44,
                  fontSize: 16,
                }}
              />

              <TurquoiseButton
                text={t('share')}
                onPress={onSharePress}
                isTransparentBackground
                containerStyle={{
                  position: 'absolute',
                  right: 30,
                  zIndex: 2,
                  width: 80,
                  bottom: 5,
                }}
                style={{
                  borderRadius: 10,
                }}
              />
            </View>
          </View>

          <View style={[{ height: 40, flexDirection: 'row', alignItems: 'center' }, Gutters.largeHPadding]}>
            <View style={{ flex: 4, flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[Gutters.smallVPadding, { color: colors.white, fontSize: 18, marginRight: 6 }]}>{t('totalReferred')}</Text>
              <Pressable onPress={onInfoBtnPress}>
                <MaterialCommunityIcons name='information-outline' color={colors.brightTurquoise} size={24} />
              </Pressable>
            </View>

            <Text style={[Fonts.textSmall, { color: colors.brightTurquoise }]}>
              {referralInfo.referred} {t(`friend${referralInfo.referred <= 1 ? '' : 's'}`)}
            </Text>
          </View>

          <View style={{ height: 80, alignItems: 'flex-start', width: '85%' }}>
            {referredNames.map((elem, idx) => {
              return (
                <View style={[REFERRED_FRIEND_ICON, { top: 0, left: idx * 35 }]} key={`Friend-${idx}`}>
                  <Text
                    style={{
                      color: colors.black,
                      fontWeight: 'bold',
                      fontSize: 18,
                    }}
                  >
                    {elem}
                  </Text>
                </View>
              )
            })}
            {referredNames.length === 0 ? (
              <View style={[REFERRED_FRIEND_ICON, { top: 0, left: 0 }]}>
                <Image source={emptyAvatar} style={{}} />
              </View>
            ) : referredNames.length > 4 ? (
              <View style={[REFERRED_FRIEND_ICON, { top: 0, left: 4 * 35, backgroundColor: colors.indigo }]}>
                <Text style={{ color: colors.white, fontWeight: 'bold', fontSize: 18 }}>+{referredNames.length - 4}</Text>
              </View>
            ) : null}
          </View>

          <View style={{ width: '90%', backgroundColor: colors.white, height: 1 }} />

          <View style={[Layout.fullWidth, Layout.center, { justifyContent: 'center', paddingHorizontal: 40 }]}>
            <Text
              style={{
                fontFamily: 'Poppins-Bold',
                color: colors.brightTurquoise,
                fontWeight: 'bold',
                lineHeight: 30,
                paddingTop: 30,
                fontStyle: 'italic',
                fontSize: 30,
                textAlign: 'center',
              }}
            >
              {t('moreBonus')}
            </Text>
            <Text style={{ color: colors.crystal, fontSize: 14, textAlign: 'center', paddingVertical: 16 }}>{t('madeItToBeta')}</Text>
          </View>

          <View style={[Layout.fullWidth, Layout.center, { height: 300 }]}>
            <Image source={world} style={{ width: '100%' }} />
          </View>

          <View style={[Layout.fullWidth, Layout.center, { paddingVertical: 10, paddingHorizontal: 40, alignItems: 'flex-start' }]}>
            <Text style={[{ color: colors.white, fontSize: 18, fontWeight: 'bold', lineHeight: 20, textAlign: 'left' }]}>
              {t('whatIsFitEvoBeta')}
            </Text>
            <Text style={[{ color: colors.white, fontSize: 16, letterSpacing: 1, lineHeight: 22, textAlign: 'left' }]}>
              {t('FitEvoBetaDesc')}
            </Text>
          </View>

          <View
            style={[
              Layout.fullWidth,
              {
                // height: 50,
                paddingHorizontal: 40,
                marginTop: 20,
                justifyContent: 'flex-start',
                alignItems: 'center',
                flexDirection: 'row',
              },
            ]}
          >
            <Text style={[{ fontSize: 18, color: colors.white, fontWeight: 'bold' }]}>{t('howToEarnKe')}</Text>
          </View>

          <View
            style={[
              Layout.fullWidth,
              { paddingHorizontal: 40, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', marginBottom: 20 },
            ]}
          >
            <Image source={howToEarn} style={{ resizeMode: 'contain', width: '100%', height: 100, marginVertical: 20 }} />

            <Image source={howToEarn2} style={{ resizeMode: 'contain', width: '100%', height: 100 }} />
            <Text style={[{ marginTop: 4, fontSize: 14, color: colors.white, textAlign: 'center' }]}>{t('maxReferral30Friends')}</Text>
          </View>

          <View style={[Layout.fullWidth, { paddingHorizontal: 40, marginTop: 20, justifyContent: 'flex-start', flexDirection: 'column' }]}>
            <Text style={[{ fontSize: 18, fontWeight: 'bold', color: colors.white, flexShrink: 1 }]}>{t('whatIsKE')}</Text>
            <Text style={[{ marginTop: 4, fontSize: 14, color: colors.white, lineHeight: 20 }]}>{t('KEDesc')}</Text>
          </View>

          <View
            style={[
              Layout.fullWidth,
              { paddingRight: 10, paddingHorizontal: 5, justifyContent: 'flex-start', flexDirection: 'column', marginBottom: 20 },
            ]}
          >
            <View
              style={[
                Layout.fullWidth,
                {
                  justifyContent: 'space-around',
                  flexDirection: 'row',
                  height: 200,
                  width: '100%',
                  display: 'flex',
                  marginTop: 20,
                },
              ]}
            >
              <View style={[{ height: '100%', width: '50%', position: 'relative' }]}>
                <Image source={card1} style={{ resizeMode: 'contain', height: '100%', width: '100%' }} />
                <View
                  style={{
                    width: '95%',
                    alignItems: 'center',
                    paddingHorizontal: 35,
                    paddingVertical: 30,
                    display: 'flex',
                    position: 'absolute',
                    marginLeft: 20,
                  }}
                >
                  <Text
                    style={[
                      {
                        color: colors.black,
                        fontSize: 14,
                        lineHeight: 15,
                        flexWrap: 'wrap',
                        textAlign: 'left',
                        fontWeight: '900',
                      },
                    ]}
                  >
                    {t('inGameToken')}
                  </Text>
                  <Text
                    style={[
                      {
                        color: colors.black,
                        fontSize: 12,
                        lineHeight: 15,
                        textAlign: 'left',
                        width: '100%',
                        flexWrap: 'wrap',
                        marginTop: 10,
                      },
                    ]}
                  >
                    {t('KEPointsTransfer')}
                  </Text>
                </View>
              </View>
              <View style={[{ height: '100%', width: '50%', position: 'relative' }]}>
                <Image source={card2} style={{ resizeMode: 'contain', height: '100%', width: '100%' }} />
                <View
                  style={{
                    width: '90%',
                    alignItems: 'center',
                    paddingHorizontal: 35,
                    paddingVertical: 30,
                    display: 'flex',
                    position: 'absolute',
                    marginLeft: 20,
                  }}
                >
                  <Text
                    style={[
                      {
                        color: colors.black,
                        fontSize: 14,
                        lineHeight: 15,
                        flexWrap: 'wrap',
                        width: '100%',
                        textAlign: 'left',
                        fontWeight: '900',
                      },
                    ]}
                  >
                    {t('NFTCompanions')}
                  </Text>
                  <Text
                    style={[
                      {
                        color: colors.black,
                        fontSize: 12,
                        lineHeight: 15,
                        textAlign: 'left',
                        width: '100%',
                        flexWrap: 'wrap',
                        marginTop: 10,
                      },
                    ]}
                  >
                    {t('NFTMint')}
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={[
                Layout.fullWidth,
                {
                  justifyContent: 'space-around',
                  flexDirection: 'row',
                  height: 200,
                  width: '100%',
                  display: 'flex',
                  marginTop: 20,
                },
              ]}
            >
              <View style={[{ height: '100%', width: '50%', position: 'relative' }]}>
                <Image source={card3} style={{ resizeMode: 'contain', height: '100%', width: '100%' }} />
                <View
                  style={{
                    width: '95%',
                    alignItems: 'center',
                    paddingHorizontal: 35,
                    paddingVertical: 30,
                    display: 'flex',
                    position: 'absolute',
                    marginLeft: 20,
                  }}
                >
                  <Text
                    style={[
                      {
                        color: colors.black,
                        fontSize: 14,
                        lineHeight: 15,
                        flexWrap: 'wrap',
                        width: '100%',
                        textAlign: 'left',
                        fontWeight: '900',
                      },
                    ]}
                  >
                    {t('exclusiveDrops')}
                  </Text>
                  <Text
                    style={[
                      {
                        color: colors.black,
                        fontSize: 12,
                        lineHeight: 15,
                        textAlign: 'left',
                        width: '100%',
                        flexWrap: 'wrap',
                        marginTop: 10,
                      },
                    ]}
                  >
                    {t('higherKE')}
                  </Text>
                </View>
              </View>
              <View style={[{ height: '100%', width: '50%', position: 'relative' }]}>
                <Image source={card4} style={{ resizeMode: 'contain', height: '100%', width: '100%' }} />
                <View
                  style={{
                    width: '95%',
                    alignItems: 'center',
                    paddingHorizontal: 35,
                    paddingVertical: 30,
                    display: 'flex',
                    position: 'absolute',
                    marginLeft: 20,
                  }}
                >
                  <Text
                    style={[
                      {
                        color: colors.black,
                        fontSize: 14,
                        lineHeight: 15,
                        flexWrap: 'wrap',
                        width: '100%',
                        textAlign: 'left',
                        fontWeight: '900',
                      },
                    ]}
                  >
                    {t('privilegedAppAccess')}
                  </Text>
                  <Text
                    style={[
                      {
                        color: colors.black,
                        fontSize: 12,
                        lineHeight: 15,
                        textAlign: 'left',
                        width: '100%',
                        flexWrap: 'wrap',
                        marginTop: 10,
                      },
                    ]}
                  >
                    {t('unlockGameAccess')}
                  </Text>
                </View>
              </View>

              {/* <View style={[{ height: '100%', width: '50%', position: 'relative' }]}>
                <Image source={card2} style={{ resizeMode: 'contain', height: '100%' }} />
                <View style={{ width: '100%', flexWrap: 'wrap', display: 'flex' }}>
                  <Text style={[{ color: colors.black, fontSize: 16, lineHeight: 20, textAlign: 'center', fontWeight: 'bold' }]}>
                    {t('inGameToken')}
                  </Text>
                  <Text style={[{ color: colors.black, fontSize: 14, lineHeight: 20, textAlign: 'left' }]}>{t('KEPointsTransfer')}</Text>
                </View>
              </View> */}
            </View>
          </View>
          <Pressable
            onPress={onLinkMediumPress}
            style={[
              Layout.fullWidth,
              { height: 40, paddingHorizontal: 40, justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row' },
            ]}
          >
            <Text style={[{ color: colors.white, fontSize: 18, textDecorationLine: 'underline', lineHeight: 20, textAlign: 'center' }]}>
              {t('linkToMeduim')}
            </Text>
          </Pressable>
          {/*
          <View style={[Layout.fullWidth, Layout.center, { paddingVertical: 10, paddingHorizontal: 0, alignItems: 'flex-start' }]}>
            <View
              style={[
                Layout.fullWidth,
                { paddingHorizontal: 40, justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row' },
              ]}
            >
              <Image source={communityIcon} style={{ resizeMode: 'contain', width: 20, height: 20, marginRight: 20 }} />
              <Text style={[{ fontSize: 14, color: colors.white, flexShrink: 1 }]}>{t('earnKEWhenReferredFriends')}</Text>
            </View>
            <Text style={[{ paddingLeft: 80, paddingRight: 40, marginTop: 4, fontSize: 14, color: colors.crystal }]}>
              {t('maxReferral30Friends')}
            </Text>
          </View>

          <View
            style={[
              Layout.fullWidth,
              { height: 60, paddingHorizontal: 40, justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row' },
            ]}
          >
            <Image source={moneyIcon} style={{ resizeMode: 'contain', width: 20, height: 20, marginRight: 20 }} />
            <Text style={[{ fontSize: 14, color: colors.white, flexShrink: 1 }]}>{t('dailyLogIn')}</Text>
          </View>

          <View style={[Layout.fullWidth, Layout.center, { paddingVertical: 10, paddingHorizontal: 0, alignItems: 'flex-start' }]}>
            <View
              style={[
                Layout.fullWidth,
                { paddingHorizontal: 40, justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row' },
              ]}
            >
              <Image source={infoIcon} style={{ resizeMode: 'contain', width: 20, height: 20, marginRight: 20 }} />
              <Text style={[{ fontSize: 14, color: colors.white, flexShrink: 1 }]}>{t('whatIsKE')}</Text>
            </View>
            <Text style={[{ paddingLeft: 80, paddingRight: 40, marginTop: 4, fontSize: 14, color: colors.white }]}>{t('KEDesc')}</Text>
          </View>

          <View style={[Layout.fullWidth, { paddingTop: 20, paddingBottom: 30, paddingHorizontal: 40, justifyContent: 'flex-start' }]}>
            <Text style={[{ color: colors.white, fontSize: 16, lineHeight: 20, textAlign: 'left', fontWeight: 'bold' }]}>
              {t('inGameToken')}
            </Text>
            <Text style={[{ color: colors.white, fontSize: 14, lineHeight: 20, textAlign: 'left' }]}>{t('KEPointsTransfer')}</Text>
          </View>

          <View style={[Layout.fullWidth, { paddingVertical: 0, paddingBottom: 30, paddingHorizontal: 40, justifyContent: 'flex-start' }]}>
            <Text style={[{ color: colors.white, fontSize: 16, lineHeight: 20, textAlign: 'left', fontWeight: 'bold' }]}>
              {t('NFTCompanions')}
            </Text>

            <Text style={[{ color: colors.white, fontSize: 14, lineHeight: 20, textAlign: 'left' }]}>{t('NFTMint')}</Text>
          </View>

          <View style={[Layout.fullWidth, { paddingVertical: 0, paddingBottom: 30, paddingHorizontal: 40, justifyContent: 'flex-start' }]}>
            <Text style={[{ color: colors.white, fontSize: 16, lineHeight: 20, textAlign: 'left', fontWeight: 'bold' }]}>
              {t('exclusiveDrops')}
            </Text>

            <Text style={[{ color: colors.white, fontSize: 14, lineHeight: 20, textAlign: 'left' }]}>{t('higherKE')}</Text>
          </View>

          <View style={[Layout.fullWidth, { paddingVertical: 0, paddingBottom: 0, paddingHorizontal: 40, justifyContent: 'flex-start' }]}>
            <Text style={[{ color: colors.white, fontSize: 16, lineHeight: 20, textAlign: 'left', fontWeight: 'bold' }]}>
              {t('privilegedAppAccess')}
            </Text>

            <Text style={[{ color: colors.white, fontSize: 14, lineHeight: 20, textAlign: 'left' }]}>{t('unlockGameAccess')}</Text>
          </View> */}

          <Pressable
            onPress={onTAndCPress}
            style={[
              Layout.fullWidth,
              Layout.center,
              { paddingTop: 40, paddingBottom: 30, paddingHorizontal: 30, justifyContent: 'center' },
            ]}
          >
            <Text
              style={[
                { color: colors.brightTurquoise, fontSize: 18, textDecorationLine: 'underline', lineHeight: 20, textAlign: 'center' },
              ]}
            >
              {t('tAndC')}
            </Text>
          </Pressable>

          <View style={[Layout.fullWidth, Layout.center, { paddingBottom: 60, paddingHorizontal: 30, justifyContent: 'center' }]}>
            <Text style={[{ color: colors.white, fontSize: 14, lineHeight: 20, textAlign: 'center' }]}>
              {t('effectiveDate')}: 20th May 2022
            </Text>
            <Text style={[{ color: colors.white, fontSize: 14, lineHeight: 20, textAlign: 'center' }]}>
              {t('lastUpdated')}: 1st June 2022
            </Text>
          </View>
        </KeyboardAwareScrollView>
      </ScreenBackgrounds>
    </SafeAreaView>
  )
}

export default HomeReferralScreen
