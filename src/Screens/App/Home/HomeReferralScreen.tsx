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
  StyleSheet,
  NativeScrollEvent,
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
import Clipboard from '@react-native-clipboard/clipboard'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { awsLogout, triggerSnackbar } from '@/Utils/helpers'
import times from 'lodash/times'
// @ts-ignore
import { Auth } from 'aws-amplify'
import axios from 'axios'
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
import circle from '@/Assets/Images/Home/circle.png'
import shareBtn from '@/Assets/Images/buttons/shareBtn.png'

import { check, request, RESULTS, PERMISSIONS, checkMultiple, requestMultiple } from 'react-native-permissions'
import { Results } from 'realm'
import BackgroundGeolocation, { Subscription } from 'react-native-background-geolocation'
import { forEach } from 'lodash'
import { runOnUI } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

import InAppBrowser from 'react-native-inappbrowser-reborn'
import AvenirText from '@/Components/FontText/AvenirText'

let abortController: AbortController
const styles = StyleSheet.create({
  card: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 36,
    paddingRight: 26,
    paddingTop: 36,
    display: 'flex',
    position: 'absolute',
    marginLeft: 10,
  },
  cardTitle: {
    color: colors.black,
    fontSize: 14,
    lineHeight: 18,
    flexWrap: 'wrap',
    width: '100%',
    textAlign: 'left',
    fontWeight: 'bold',
    paddingBottom: 4,
  },
})

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
  const [showScrollToBottom, setShowScrollToBottom] = useState(true)
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
    const dailyLogin = async (jwtToken: string) => {
      let userDailyLoginRes = await axios.get(config.userDailyLogin, {
        signal: abortController.signal,
        headers: {
          Authorization: jwtToken,
        },
      })
    }

    const run = async () => {
      try {
        let user = await Auth.currentAuthenticatedUser()
        let jwtToken = user?.signInUserSession?.idToken?.jwtToken
        const [authRes, userFitnessInfoRes, topAvgPointRes] = await Promise.all([
          axios.get(config.userProfile, {
            signal: abortController.signal,
            headers: {
              Authorization: jwtToken,
            },
          }),
          axios.get(config.userFitnessInfo, {
            signal: abortController.signal,
            headers: {
              Authorization: jwtToken,
            },
          }),
          axios.get(config.userTopAvgPoint, {
            signal: abortController.signal,
          }),
        ])

        const { dailyMission, loginCount, totalPoint } = userFitnessInfoRes.data

        await dailyLogin(jwtToken)

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
      } catch (err: any) {
        crashlytics().recordError(err)
      } finally {
        setTimeout(() => {
          setNeedFetchDtl(false)
        }, 1000)
      }
    }

    if (needFetchDtl) {
      run()
    }
  }, [needFetchDtl, fetchedReferralInfo])

  useEffect(() => {
    abortController = new AbortController()
    return () => {
      abortController.abort()
    }
  }, [])

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
      } catch (err: any) {}
    }

    if (referralInfo.referredBy === '' && !fetchedReferralInfo) {
      // Not yet referred by anyone, if user entered invitation code, need to confirm
      confirmReferral()
      dispatch(storeReferralCode(''))
    }
  }, [referralInfo, fetchedReferralInfo])

  const onSharePress = async () => {
    console.log('share clicked')
    const shareRes = await share({
      url: `${config.onelinkUrl}/?screen=${RouteStacks.enterInvitationCode}&referralCode=${referralInfo.referral}`,
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

  const onGoogleFitModalClose = () => {}
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
      navigation.replace(RouteStacks.workout)
    }
  }, [startTime, enabled])

  const onTrialPlayPress = async () => {
    try {
      dispatch(startLoading(true))
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
        onTrialPlayPress()
        return
      }
    } catch (err: any) {
      crashlytics().recordError(err)
    } finally {
      dispatch(startLoading(false))
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

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent) => {
    const paddingToBottom = 20
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom
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
  let kePointNotMeetRequirement = referralInfo.totalPoint < 120

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

        {showScrollToBottom ? (
          <Pressable onPress={onScrollDownPress} style={{ position: 'absolute', bottom: 0, right: 20, zIndex: 2 }}>
            <Image source={scrollDownBtn} style={{ width: 26, resizeMode: 'contain' }} />
          </Pressable>
        ) : null}

        <KeyboardAwareScrollView
          ref={keyboardAwareScrollViewRef}
          contentContainerStyle={[Layout.colCenter]}
          onScroll={({ nativeEvent }) => {
            if (isCloseToBottom(nativeEvent)) {
              setShowScrollToBottom(false)
            } else {
              setShowScrollToBottom(true)
            }
          }}
          refreshControl={
            <RefreshControl refreshing={needFetchDtl} onRefresh={onRefresh} progressViewOffset={10} tintColor={colors.brightTurquoise} />
          }
        >
          <Header
            headerText={t('home')}
            rightIcon={() => <Image source={logoutBtn} style={{ width: 20, resizeMode: 'contain' }} />}
            onRightPress={onLogoutPress}
          />
          <View
            style={{
              height: 200,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image source={circle} style={{ resizeMode: 'contain', height: '100%' }} />
            {/* <CircularProgress
              value={referralInfo.totalPoint}
              radius={100}
              duration={2000}
              progressValueColor={colors.transparent}
              maxValue={config.totalPointsMaxCap}
              activeStrokeColor={colors.brightTurquoise}
              strokeLinecap={'butt'}
              inActiveStrokeWidth={14}
              activeStrokeWidth={14}
            /> */}
            <View
              style={{
                position: 'absolute',
                top: 75,
                width: '100%',
              }}
            >
              <AvenirText
                style={{
                  color: colors.white,
                  fontSize: 14,
                  lineHeight: 20,
                  textAlign: 'center',
                }}
              >
                {t('totalKEPoints')}
              </AvenirText>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginTop: 0,
                  alignItems: 'center',
                }}
              >
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

          <View style={[Layout.fullWidth, { alignItems: 'center', justifyContent: 'flex-start', height: 75, paddingTop: 12 }]}>
            <AvenirText
              style={[
                {
                  color: colors.white,
                  fontSize: 16,
                  lineHeight: 24,
                  marginBottom: 4,
                  fontWeight: 'bold',
                },
              ]}
            >
              {t('ranking')}
            </AvenirText>
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
                  borderRadius: 10,
                  paddingHorizontal: 8,
                  marginRight: 8,
                  justifyContent: 'center',
                }}
              >
                <AvenirText style={[{ color: colors.darkGunmetal, fontSize: 16, lineHeight: 24 }]}>
                  {isNewAc || queueNoDiff === 0 ? '+' : queueNoDiff > 0 ? '▲' : '▼'} {isNewAc ? 0 : queueNoDiff}
                </AvenirText>
              </View>
              <AnimateNumber
                value={referralInfo.queueNumber}
                style={{
                  color: colors.white,
                  fontSize: 32,
                  fontWeight: 'bold',
                }}
                formatter={(val: string) => {
                  return parseInt(val)
                }}
              />
            </View>
          </View>

          <View style={[Layout.fullWidth, { alignItems: 'center', justifyContent: 'center', height: 120 }]}>
            <AvenirText
              style={[Layout.fullWidth, { color: colors.white, fontSize: 16, lineHeight: 24, fontWeight: 'bold', textAlign: 'center' }]}
            >
              {t('top100AvgKE')}
            </AvenirText>
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
                  fontSize: 32,
                  paddingVertical: 4,
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
                paddingBottom: 28,
              },
            ]}
          >
            <View
              style={{
                backgroundColor: kePointNotMeetRequirement || isStartPressed ? colors.charcoal : colors.brightTurquoise,
                shadowColor: kePointNotMeetRequirement || isStartPressed ? colors.charcoal : colors.brightTurquoise,
                elevation: 10,
                borderRadius: 20,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 10,
              }}
            >
              <Pressable
                style={{
                  paddingHorizontal: 50,
                  paddingVertical: 2,
                }}
                onPress={onTrialPlayPress}
                disabled={kePointNotMeetRequirement || isStartPressed}
              >
                <AvenirText
                  style={{
                    fontSize: 30,
                    fontWeight: 'bold',
                    fontStyle: 'italic',
                    color: colors.darkGunmetal,
                  }}
                >
                  {t('trialPlay')}
                </AvenirText>
              </Pressable>
            </View>
          </View>

          <View style={{ width: '90%', backgroundColor: colors.silverChalice, height: 1, opacity: 0.2 }} />

          <View style={[{ marginTop: 24, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 42 }]}>
            <View style={{ flex: 4, flexDirection: 'row', alignItems: 'center' }}>
              <AvenirText style={[{ color: colors.white, fontSize: 16, marginRight: 6, fontWeight: 'bold' }]}>
                {t('totalReferred')}
              </AvenirText>
              <Pressable onPress={onInfoBtnPress} style={{ justifyContent: 'center' }}>
                <Image source={infoIcon} style={{ width: 18, height: 18, resizeMode: 'contain' }} />
              </Pressable>
            </View>

            <AvenirText style={[Fonts.textSmall, { color: colors.brightTurquoise, fontWeight: 'bold' }]}>
              {referredNames.length} {t(`friend${referredNames.length <= 1 ? '' : 's'}`)}
            </AvenirText>
          </View>

          <View style={{ height: 65, alignItems: 'flex-start', width: '78%', marginTop: 4 }}>
            {referredNames.map((elem, idx) => {
              return (
                <View style={[REFERRED_FRIEND_ICON, { top: 0, left: idx * 35 }]} key={`Friend-${idx}`}>
                  <AvenirText
                    style={{
                      color: colors.black,
                      fontWeight: 'bold',
                      fontSize: 18,
                    }}
                  >
                    {elem}
                  </AvenirText>
                </View>
              )
            })}
            {referredNames.length === 0 ? (
              <View style={[REFERRED_FRIEND_ICON, { top: 0, left: 0 }]}>
                <Image source={emptyAvatar} style={{ width: 40, resizeMode: 'contain' }} />
              </View>
            ) : referredNames.length > 4 ? (
              <View style={[REFERRED_FRIEND_ICON, { top: 0, left: 4 * 35, backgroundColor: colors.indigo }]}>
                <AvenirText style={{ color: colors.white, fontWeight: 'bold', fontSize: 18 }}>+{referredNames.length - 4}</AvenirText>
              </View>
            ) : null}
          </View>

          <View
            style={{
              backgroundColor: colors.jacarta,
              borderRadius: 20,
              height: 110,
              paddingTop: 6,
              marginBottom: 32,
              marginHorizontal: 16,
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
              <AvenirText
                style={[
                  {
                    color: colors.white,
                    paddingTop: 0,
                    paddingHorizontal: 24,
                    fontSize: 16,
                    lineHeight: 24,
                    fontWeight: '500',
                  },
                ]}
              >
                {t('yourReferralCode')}
              </AvenirText>
              <Pressable
                onPress={onCopyPress}
                style={{
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 40,
                }}
              >
                <Image
                  source={shareBtn}
                  style={{
                    height: 30,
                    resizeMode: 'contain',
                  }}
                />
              </Pressable>
            </View>

            <View
              style={[
                {
                  flexDirection: 'row',
                  paddingHorizontal: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingTop: 6,
                  zIndex: 2,
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
                  paddingHorizontal: 12,
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
                  right: 28,
                  width: 80,
                  bottom: 5,
                  zIndex: 4,
                }}
                style={{
                  borderRadius: 10,
                }}
              />
            </View>
          </View>

          <View style={{ width: '90%', backgroundColor: colors.silverChalice, height: 1, opacity: 0.2 }} />

          <View style={[Layout.fullWidth, Layout.center, { justifyContent: 'center', paddingHorizontal: 40 }]}>
            <AvenirText
              style={{
                color: colors.brightTurquoise,
                fontWeight: 'bold',
                lineHeight: 40,
                paddingTop: 30,
                paddingBottom: 6,
                fontStyle: 'italic',
                fontSize: 30,
                textAlign: 'center',
              }}
            >
              {t('moreBonus')}
            </AvenirText>
            <AvenirText
              style={{
                color: colors.crystal,
                fontSize: 14,
                textAlign: 'center',
                paddingVertical: 10,
                lineHeight: 18,
              }}
            >
              {t('madeItToBeta')}
            </AvenirText>
          </View>

          <View style={[Layout.fullWidth, Layout.center, { height: 280, paddingHorizontal: 0 }]}>
            <Image source={world} style={{ width: '100%', height: 280, resizeMode: 'contain' }} />
          </View>

          <View
            style={[
              Layout.fullWidth,
              Layout.center,
              { marginVertical: 10, paddingHorizontal: 34, paddingBottom: 30, alignItems: 'flex-start' },
            ]}
          >
            <AvenirText
              style={[
                {
                  color: colors.white,
                  fontSize: 18,
                  fontWeight: 'bold',
                  lineHeight: 20,
                  textAlign: 'left',
                },
              ]}
            >
              {t('whatIsFitEvoBeta')}
            </AvenirText>
            <AvenirText style={[{ color: colors.white, fontSize: 16, lineHeight: 24, textAlign: 'left' }]}>
              {t('FitEvoBetaDesc')}
            </AvenirText>
          </View>

          <View
            style={[
              Layout.fullWidth,
              {
                paddingHorizontal: 34,
                marginTop: 20,
                justifyContent: 'flex-start',
                alignItems: 'center',
                flexDirection: 'row',
                paddingBottom: 8,
              },
            ]}
          >
            <AvenirText style={[{ fontSize: 18, lineHeight: 20, color: colors.white, fontWeight: 'bold' }]}>{t('howToEarnKe')}</AvenirText>
          </View>

          <View
            style={[
              Layout.fullWidth,
              {
                paddingHorizontal: 40,
                justifyContent: 'center',

                alignItems: 'center',
                flexDirection: 'column',
                marginBottom: 20,
              },
            ]}
          >
            <Image
              source={howToEarn}
              style={{ resizeMode: 'contain', width: '100%', height: undefined, aspectRatio: 1190 / 345, marginVertical: 5 }}
            />
            <Image
              source={howToEarn2}
              style={{ resizeMode: 'contain', width: '100%', height: undefined, aspectRatio: 1190 / 345, marginVertical: 5 }}
            />
            <AvenirText style={[{ marginTop: 4, fontSize: 14, color: colors.white, textAlign: 'center' }]}>
              {t('maxReferral30Friends')}
            </AvenirText>
          </View>

          <View style={[Layout.fullWidth, { paddingHorizontal: 34, marginTop: 20, justifyContent: 'flex-start', flexDirection: 'column' }]}>
            <AvenirText style={[{ fontSize: 18, lineHeight: 20, fontWeight: 'bold', color: colors.white, flexShrink: 1 }]}>
              {t('whatIsKE')}
            </AvenirText>
            <AvenirText style={[{ fontSize: 16, color: colors.white, lineHeight: 24 }]}>{t('KEDesc')}</AvenirText>
          </View>

          <View
            style={[
              Layout.fullWidth,
              {
                paddingTop: 6,
                justifyContent: 'flex-start',
                alignItems: 'center',
                flexDirection: 'column',
                marginBottom: 18,
              },
            ]}
          >
            <Image source={card1} style={{ resizeMode: 'stretch', width: '92%', height: undefined, aspectRatio: 1384 / 612 }} />
            <Image source={card2} style={{ resizeMode: 'stretch', width: '92%', height: undefined, aspectRatio: 692 / 298 }} />
            <Image source={card3} style={{ resizeMode: 'stretch', width: '92%', height: undefined, aspectRatio: 692 / 322 }} />
            <Image source={card4} style={{ resizeMode: 'stretch', width: '92%', height: undefined, aspectRatio: 684 / 414 }} />
          </View>
          <Pressable
            onPress={onLinkMediumPress}
            style={[
              Layout.fullWidth,
              {
                height: 30,
                paddingHorizontal: 40,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              },
            ]}
          >
            <AvenirText
              style={[{ color: colors.white, fontSize: 16, textDecorationLine: 'underline', lineHeight: 18, textAlign: 'center' }]}
            >
              {t('linkToMeduim')}
            </AvenirText>
          </Pressable>

          <Pressable
            onPress={onTAndCPress}
            style={[
              Layout.fullWidth,
              Layout.center,
              { paddingTop: 46, paddingBottom: 24, paddingHorizontal: 34, justifyContent: 'center' },
            ]}
          >
            <AvenirText
              style={[
                { color: colors.brightTurquoise, fontSize: 16, textDecorationLine: 'underline', lineHeight: 24, textAlign: 'center' },
              ]}
            >
              {t('tAndC')}
            </AvenirText>
          </Pressable>

          <View style={[Layout.fullWidth, Layout.center, { paddingBottom: 30, paddingHorizontal: 34, justifyContent: 'center' }]}>
            <View style={{ flexDirection: 'row' }}>
              <AvenirText style={[{ color: colors.white, fontSize: 12, lineHeight: 18, textAlign: 'center' }]}>
                {t('effectiveDate')}:
              </AvenirText>
              <AvenirText style={[{ marginLeft: 3, color: colors.white, fontSize: 12, lineHeight: 18, textAlign: 'center' }]}>
                20th May 2022
              </AvenirText>
            </View>

            <View style={{ flexDirection: 'row' }}>
              <AvenirText style={[{ color: colors.white, fontSize: 12, lineHeight: 18, textAlign: 'center' }]}>
                {t('lastUpdated')}:
              </AvenirText>
              <AvenirText style={[{ marginLeft: 3, color: colors.white, fontSize: 12, lineHeight: 18, textAlign: 'center' }]}>
                1st June 2022
              </AvenirText>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </ScreenBackgrounds>
    </SafeAreaView>
  )
}

export default HomeReferralScreen
