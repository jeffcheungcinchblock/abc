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
  Alert,
  ViewStyle,
  Image,
  RefreshControl,
  NativeScrollEvent,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand, Header } from '@/Components'
import { useTheme } from '@/Hooks'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login, logout } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'

import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { colors, config } from '@/Utils/constants'
import { SocialNavigatorParamList } from '@/Screens/App/SocialScreen'
import EncryptedStorage from 'react-native-encrypted-storage'
import { RouteStacks, RouteTabs } from '@/Navigators/routes'
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { DrawerScreenProps } from '@react-navigation/drawer'
import { DrawerNavigatorParamList, TabNavigatorParamList } from '@/Navigators/MainNavigator'
import ScreenBackgrounds from '@/Components/ScreenBackgrounds'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AvenirText from '@/Components/FontText/AvenirText'
import InAppBrowser from 'react-native-inappbrowser-reborn'
import RuleOfReferralModal from '@/Components/Modals/RuleOfReferralModal'
import infoIcon from '@/Assets/Images/Home/info.png'
import { Auth } from 'aws-amplify'
import axios from 'axios'
import emptyAvatar from '@/Assets/Images/Home/avatar_empty.png'
import crashlytics from '@react-native-firebase/crashlytics'
import Clipboard from '@react-native-clipboard/clipboard'
import { triggerSnackbar } from '@/Utils/helpers'
import shareBtn from '@/Assets/Images/buttons/shareBtn.png'
import TurquoiseButton from '@/Components/Buttons/TurquoiseButton'
import share from '@/Utils/share'
import HomeInfoGraphics from '@/Components/HomeInfoGraphics'
import world from '@/Assets/Images/Home/world.png'
import howToEarn from '@/Assets/Images/Home/howToEarn.png'
import howToEarn2 from '@/Assets/Images/Home/howToEarn2.png'
import scrollDownBtn from '@/Assets/Images/Home/scroll_down.png'
import { SafeAreaView } from 'react-native-safe-area-context'

const TEXT_INPUT: TextStyle = {
  height: 40,
  color: 'yellow',
  borderWidth: 1,
  borderRadius: 10,
  borderColor: '#000',
}

const REFERRED_FRIEND_ICON: ViewStyle = {
  borderRadius: 99,
  width: 40,
  height: 40,
  backgroundColor: colors.crystal,
  justifyContent: 'center',
  alignItems: 'center',
  position: 'absolute',
}

type SocialMainScreenNavigationProp = CompositeScreenProps<
  StackScreenProps<SocialNavigatorParamList, RouteStacks.socialMain>,
  CompositeScreenProps<BottomTabScreenProps<TabNavigatorParamList>, DrawerScreenProps<DrawerNavigatorParamList>>
>

export type ReferralInfo = {
  // point: number
  // lastRank: number // lastRank === 0 for new account
  // queueNumber: number
  referral: string
  referred: number
  referredBy: string
  referredEmails: string[]
  username: string
  uuid: string
  // top100AvgKE: number
  // totalPoint: number
}

let abortController: AbortController
const MainScreen: FC<SocialMainScreenNavigationProp> = ({ navigation, route }) => {
  const keyboardAwareScrollViewRef = useRef<any>(null)
  const ruleOfReferralModalRef = useRef<any>(null)
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()
  const dispatch = useDispatch()
  const [showScrollToBottom, setShowScrollToBottom] = useState(true)
  const [needFetchReload, setNeedFetchReload] = useState(false)
  const [referralInfo, setReferralInfo] = useState<ReferralInfo>({
    referral: '',
    referred: 0,
    username: '',
    referredBy: '',
    referredEmails: [],
    uuid: '',
  })

  useEffect(() => {
    const run = async () => {
      try {
        abortController = new AbortController()
        let user = await Auth.currentAuthenticatedUser()
        let jwtToken = user?.signInUserSession?.idToken?.jwtToken
        const [authRes] = await Promise.all([
          axios.get(config.userProfile, {
            signal: abortController.signal,
            headers: {
              Authorization: jwtToken,
            },
          }),
        ])
        setReferralInfo({
          ...authRes.data,
        })
      } catch (err: any) {
        crashlytics().recordError(err)
      } finally {
        setNeedFetchReload(false)
      }
    }
    if (needFetchReload) {
      run()
    }
  }, [needFetchReload])

  useEffect(() => {
    setNeedFetchReload(true)
    return () => {
      abortController?.abort()
    }
  }, [])

  const onTAndCPress = async () => {
    await InAppBrowser.open('https://fitevo-nft.gitbook.io/agreement/')
  }

  const onCopyPress = () => {
    Clipboard.setString(referralInfo.referral)
    triggerSnackbar(t('snackbarPrompt.referralCodeCopied'))
  }

  const onLinkMediumPress = async () => {
    await InAppBrowser.open('https://medium.com/fitevo/introducing-ke-points-earn-massive-gains-through-simple-active-tasks-74a70d793c04')
  }
  const onInfoBtnPress = () => ruleOfReferralModalRef?.current?.open()
  let referredNames = useMemo(() => {
    return referralInfo.referredEmails.map(elem => elem.toUpperCase())
  }, [referralInfo.referredEmails])
  const onRuleOfReferralCloseBtnPress = () => ruleOfReferralModalRef?.current?.close()
  const onRuleOfReferralModalClose = () => {}

  const onSharePress = async () => {
    const shareRes = await share({
      url: `${config.onelinkUrl}/?screen=${RouteStacks.enterInvitationCode}&referralCode=${referralInfo.referral}`,
      title: t('shareMsg'),
      message: t('shareMsg'),
    })
  }

  const onRefresh = () => {
    setNeedFetchReload(true)
  }

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent) => {
    const paddingToBottom = 20
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom
  }

  const onScrollDownPress = () => {
    keyboardAwareScrollViewRef?.current?.scrollToEnd()
  }

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'space-between', backgroundColor: colors.darkGunmetal }} edges={['top']}>
      <ScreenBackgrounds screenName={RouteStacks.socialMain}>
        <RuleOfReferralModal
          ref={ruleOfReferralModalRef}
          onModalClose={onRuleOfReferralModalClose}
          onActionBtnPress={onRuleOfReferralCloseBtnPress}
        />

        {showScrollToBottom ? (
          <Pressable onPress={onScrollDownPress} style={{ position: 'absolute', bottom: 0, right: 20, zIndex: 2 }}>
            <Image source={scrollDownBtn} style={{ width: 26, resizeMode: 'contain' }} />
          </Pressable>
        ) : null}

        <Header headerText={t('social')} />

        <KeyboardAwareScrollView
          ref={keyboardAwareScrollViewRef}
          contentContainerStyle={[
            Layout.colCenter,
            Gutters.smallHPadding,
            {
              flexGrow: 1,
              paddingBottom: 40,
            },
          ]}
          onScroll={({ nativeEvent }) => {
            if (isCloseToBottom(nativeEvent)) {
              setShowScrollToBottom(false)
            } else {
              setShowScrollToBottom(true)
            }
          }}
          refreshControl={
            <RefreshControl refreshing={needFetchReload} onRefresh={onRefresh} progressViewOffset={10} tintColor={colors.brightTurquoise} />
          }
        >
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

            <View
              style={{
                width: '100%',
                marginBottom: 10,
                marginTop: 0,
              }}
            >
              <AvenirText style={[{ marginTop: 4, fontSize: 14, lineHeight: 16, color: colors.white, textAlign: 'left' }]}>
                {t('maxReferral30Friends')}
              </AvenirText>
            </View>
            <AvenirText style={[{ color: colors.white, fontSize: 16, lineHeight: 24, textAlign: 'left' }]}>
              {t('FitEvoBetaDesc')}
            </AvenirText>
          </View>

          <View style={{ width: '90%', backgroundColor: colors.silverChalice, height: 1, opacity: 0.2 }} />

          <View style={[{ marginTop: 36, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 40 }]}>
            <View style={{ flex: 4, flexDirection: 'row', alignItems: 'center' }}>
              <AvenirText style={[{ color: colors.white, fontSize: 16, marginRight: 6, fontWeight: 'bold' }]}>
                {t('totalReferred')}
              </AvenirText>
              <Pressable onPress={onInfoBtnPress} style={{ justifyContent: 'center' }}>
                <Image source={infoIcon} style={{ width: 16, height: 16, resizeMode: 'contain' }} />
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
              marginBottom: 40,
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

          <View
            style={[
              Layout.fullWidth,
              {
                paddingHorizontal: 34,
                marginTop: 40,
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
          </View>

          <View
            style={[
              Layout.fullWidth,
              { paddingHorizontal: 34, marginTop: 20, marginBottom: 30, justifyContent: 'flex-start', flexDirection: 'column' },
            ]}
          >
            <AvenirText style={[{ fontSize: 18, lineHeight: 20, fontWeight: 'bold', color: colors.white, flexShrink: 1 }]}>
              {t('whatIsKE')}
            </AvenirText>
            <AvenirText style={[{ fontSize: 16, color: colors.white, lineHeight: 24 }]}>{t('KEDesc')}</AvenirText>
          </View>

          <HomeInfoGraphics titleTranslationText='inGameToken' contentTranslationText='KEPointsTransfer' index={0} />
          <HomeInfoGraphics titleTranslationText='NFTCompanions' contentTranslationText='NFTMint' index={1} />
          <HomeInfoGraphics titleTranslationText='exclusiveDrops' contentTranslationText='higherKE' index={2} />
          <HomeInfoGraphics titleTranslationText='privilegedAppAccess' contentTranslationText={'unlockGameAccess'} index={3} />

          <Pressable
            onPress={onLinkMediumPress}
            style={[
              Layout.fullWidth,
              {
                height: 30,
                paddingHorizontal: 40,
                marginTop: 12,
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

export default MainScreen
