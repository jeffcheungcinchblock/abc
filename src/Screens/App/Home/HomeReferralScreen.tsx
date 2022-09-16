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
import SlideInputModal from '@/Components/Modals/SlideInputModal'
import CircularProgress from 'react-native-circular-progress-indicator'
import Svg, { G, Circle } from 'react-native-svg'
import { startLoading } from '@/Store/UI/actions'
import AppIcon from '@/Components/Icons/AppIcon'
import reward from '@/Assets/Images/Modal/reward.png'
import welcomeToFitEvo from '@/Assets/Images/Home/welcomeToFitEvo.png'
import DailyRewardModal from '@/Components/Modals/DailyRewardModal'
import GoogleFitModal from '@/Components/Modals/GoogleFitModal'
import RuleOfReferralModal from '@/Components/Modals/RuleOfReferralModal'
import LocationPermissionModal from '@/Components/Modals/LocationPermissionModal'
//health kit - googlefit
import { IOSHealthKit } from '@/Healthkit/iosHealthKit'
import { GoogleFitKit } from '@/Healthkit/androidHealthKit'

import avatar from '@/Assets/Images/Home/avatar.png'
import InvitationRewardModal from '@/Components/Modals/InvitationRewardModal'
import logoutBtn from '@/Assets/Images/buttons/btn_logout.png'
import Orientation from 'react-native-orientation-locker'
import { storeReferralCode } from '@/Store/Referral/actions'

import circle from '@/Assets/Images/Home/circle.png'

import { check, request, RESULTS, PERMISSIONS, checkMultiple, requestMultiple } from 'react-native-permissions'
import { Results } from 'realm'
import BackgroundGeolocation, { Subscription } from 'react-native-background-geolocation'
import { forEach } from 'lodash'
import { runOnUI } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import LinearGradient from 'react-native-linear-gradient'
import InAppBrowser from 'react-native-inappbrowser-reborn'
import AvenirText from '@/Components/FontText/AvenirText'
import HomeInfoGraphics from '@/Components/HomeInfoGraphics'
import crashlytics from '@react-native-firebase/crashlytics'
import homeBanner from '@/Assets/Images/Home/homebanner.png'
import infoIcon from '@/Assets/Images/Home/info.png'
import GlobalRankingModal from '@/Components/Modals/GlobalRankingModal'

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

export type ReferralInfo = {
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

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

const HomeReferralScreen: FC<HomeReferralScreenNavigationProp> = ({ navigation, route }) => {
  const keyboardAwareScrollViewRef = useRef<any>(null)
  const dailyRewardModalRef = useRef<any>(null)
  const invitationRewardModalRef = useRef<any>(null)
  const globalRankingModalRef = useRef<any>(null)

  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()
  const { invitationCode } = useSelector((state: RootState) => ({
    invitationCode: state.user.invitationCode,
  }))
  const dispatch = useDispatch()
  const [isInvitingFriends, setIsInvitingFriends] = useState(false)
  const [needFetchReload, setNeedFetchReload] = useState(false)
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

  useEffect(() => {
    dispatch(startLoading(false))
    setNeedFetchReload(true)
  }, [])

  useEffect(() => {
    const run = async () => {
      try {
        abortController = new AbortController()
        let user = await Auth.currentAuthenticatedUser()
        let jwtToken = user?.signInUserSession?.idToken?.jwtToken
        const [authRes, userFitnessInfoRes, topAvgPointRes, dailyLoginRes] = await Promise.all([
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
          axios.get(config.userDailyLogin, {
            signal: abortController.signal,
            headers: {
              Authorization: jwtToken,
            },
          }),
        ])

        const { dailyMission, loginCount, totalPoint } = userFitnessInfoRes.data

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
          setNeedFetchReload(false)
        }, 1000)
      }
    }

    if (needFetchReload) {
      run()
    }
  }, [needFetchReload, fetchedReferralInfo])

  useEffect(() => {
    return () => {
      abortController?.abort()
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
      } catch (err: any) {
        crashlytics().recordError(err)
      }
    }

    if (referralInfo.referredBy === '' && !fetchedReferralInfo) {
      // Not yet referred by anyone, if user entered invitation code, need to confirm
      confirmReferral()
      dispatch(storeReferralCode(''))
    }
  }, [referralInfo, fetchedReferralInfo])

  const onRefresh = () => {
    setNeedFetchReload(true)
  }

  const onDailyRewardModalClose = () => {}

  const onLogoutPress = async () => {
    dispatch(startLoading(true))
    await awsLogout()
    dispatch(startLoading(false))
  }

  const onLesGoBtnPress = () => dailyRewardModalRef?.current?.close()

  const onInvitationRewardModalClose = () => {}

  const onInvitationRewardModalCloseBtnPress = () => {
    invitationRewardModalRef?.current?.close()
  }

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent) => {
    const paddingToBottom = 20
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom
  }

  let queueNoDiff = referralInfo.lastRank - referralInfo.queueNumber

  let isNewAc = referralInfo.lastRank === 0
  let kePointNotMeetRequirement = referralInfo.totalPoint < 120

  const onGlobalRankingCloseBtnPress = () => globalRankingModalRef?.current?.close()
  const onGlobalRankingModalClose = () => {}
  const onInfoBtnPress = () => globalRankingModalRef?.current?.open()

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'space-between', backgroundColor: colors.darkGunmetal }} edges={['top']}>
      <ScreenBackgrounds screenName={RouteStacks.homeReferral}>
        <DailyRewardModal ref={dailyRewardModalRef} onModalClose={onDailyRewardModalClose} onActionBtnPress={onLesGoBtnPress} ke={20} />

        <GlobalRankingModal
          ref={globalRankingModalRef}
          onModalClose={onGlobalRankingModalClose}
          onActionBtnPress={onGlobalRankingCloseBtnPress}
          globalAvgPoint={referralInfo.top100AvgKE}
        />

        <InvitationRewardModal
          ref={invitationRewardModalRef}
          ke={20}
          onModalClose={onInvitationRewardModalClose}
          onActionBtnPress={onInvitationRewardModalCloseBtnPress}
        />

        <Header
          headerText={t('home')}
          rightIcon={() => <Image source={logoutBtn} style={{ width: 20, resizeMode: 'contain' }} />}
          onRightPress={onLogoutPress}
        />

        <KeyboardAwareScrollView
          ref={keyboardAwareScrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            {
              justifyContent: 'center',
              alignItems: 'center',
              flexGrow: 1,
              paddingBottom: 60,
            },
          ]}
          refreshControl={
            <RefreshControl refreshing={needFetchReload} onRefresh={onRefresh} progressViewOffset={0} tintColor={colors.brightTurquoise} />
          }
        >
          <Image
            source={welcomeToFitEvo}
            style={{
              resizeMode: 'contain',
              height: windowHeight / 12,
              marginBottom: 20,
            }}
          />
          <View
            style={{
              height: windowHeight / 4,
              maxHeight: 180,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image source={circle} style={{ resizeMode: 'contain', height: '100%' }} />
            <View
              style={{
                height: '100%',
                justifyContent: 'center',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                alignItems: 'center',
              }}
            >
              <View>
                <AvenirText
                  style={{
                    color: colors.white,
                    fontSize: 14,
                    lineHeight: 24,
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
                      fontSize: 32,
                      lineHeight: 42,
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
          </View>

          <View style={[Layout.fullWidth, { alignItems: 'center', justifyContent: 'flex-start', height: 75, paddingTop: 12 }]}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <AvenirText
                style={[
                  {
                    color: colors.white,
                    fontSize: 16,
                    lineHeight: 24,
                    fontWeight: '500',
                  },
                ]}
              >
                {t('globalRanking')}
              </AvenirText>
              <Pressable onPress={onInfoBtnPress} style={{ paddingLeft: 4, justifyContent: 'center' }}>
                <Image source={infoIcon} style={{ width: 16, height: 16, resizeMode: 'contain' }} />
              </Pressable>
            </View>

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

          <View style={[Layout.fullWidth, { alignItems: 'center', justifyContent: 'center', height: 70, paddingHorizontal: 40 }]}>
            <AvenirText
              style={[Layout.fullWidth, { color: colors.white, fontSize: 16, lineHeight: 24, fontWeight: '500', textAlign: 'center' }]}
            >
              Earn KE points by{' '}
              <AvenirText
                style={{
                  color: colors.brightTurquoise,
                }}
              >
                Running
              </AvenirText>{' '}
              and{' '}
              <AvenirText
                style={{
                  color: colors.brightTurquoise,
                }}
              >
                Referring Friends
              </AvenirText>
            </AvenirText>
          </View>

          <View>
            <Image
              source={homeBanner}
              style={{
                // width: '100%',
                height: 100,
                resizeMode: 'contain',
              }}
            />
          </View>
        </KeyboardAwareScrollView>
      </ScreenBackgrounds>
    </SafeAreaView>
  )
}

export default HomeReferralScreen
