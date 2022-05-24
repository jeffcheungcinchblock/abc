import React, { useState, useEffect, useCallback, FC, useRef, useMemo } from 'react'
import { StackScreenProps } from "@react-navigation/stack"
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
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Brand, Header } from '@/Components'
import { useTheme } from '@/Hooks'
import { changeTheme, ThemeState } from '@/Store/Theme'
import { login, logout } from '@/Store/Users/actions'
import { UserState } from '@/Store/Users/reducer'
// @ts-ignore
import AnimateNumber from 'react-native-animate-number'
import { shallowEqual, useDispatch, useSelector } from "react-redux"
import { colors, config } from '@/Utils/constants'
import { HomeNavigatorParamList } from '@/Screens/App/HomeScreen'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Share from 'react-native-share';
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
import crashlytics from '@react-native-firebase/crashlytics';
import BackgroundGeolocation, { Subscription } from 'react-native-background-geolocation'

const PURPLE_COLOR = {
    color: colors.magicPotion,
}

type ReferralInfo = {
    point: number
    lastRank: number      // lastRank === 0 for new account
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
    CompositeScreenProps<
        BottomTabScreenProps<TabNavigatorParamList>,
        DrawerScreenProps<DrawerNavigatorParamList>
    >
>

const REFERRED_FRIEND_ICON: ViewStyle = {
    borderRadius: 99, width: 40, height: 40, backgroundColor: colors.crystal, justifyContent: 'center', alignItems: 'center',
    position: 'absolute',
}

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height
const isIOS = Platform.OS === 'ios'
const health_kit = isIOS ? new IOSHealthKit() : new GoogleFitKit()

const HomeReferralScreen: FC<HomeReferralScreenNavigationProp> = (
    { navigation, route }
) => {
    const keyboardAwareScrollViewRef = useRef<any>(null)
    const dailyRewardModalRef = useRef<any>(null)
    const ruleOfReferralModalRef = useRef<any>(null)
    const invitationRewardModalRef = useRef<any>(null)

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
        referral: "",
        referred: 0,
        username: "",
        referredBy: "",
        referredEmails: [],
        uuid: "",
        top100AvgKE: 0,
        totalPoint: 0,
    })
    const [isReady, setIsReady] = useState<Boolean>(false)
    const [enabled, setEnabled] = useState(false)
    const [isHealthkitReady, setIstHealthKitReady] = useState(false)
    const startTime = useSelector((state: RootState) => state.map.startTime)


    useEffect(() => {
        dispatch(startLoading(false))

    }, [])

    useEffect(() => {
        let cancelSourceArr: CancelTokenSource[] = []

        const dailyLogin = async (jwtToken: string) => {
            let userDailyLoginRes = await axios.get(config.userDailyLogin, {
                headers: {
                    'Authorization': jwtToken,
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
                            Authorization: jwtToken
                        }
                    }),
                    axios.get(config.userFitnessInfo, {
                        headers: {
                            'x-api-key': config.fitnesssInfoApiKey,
                            Authorization: jwtToken
                        }
                    }),
                    axios.get(config.userTopAvgPoint)
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

        let cancelSource : CancelTokenSource
        // TBD: To be placed some where upper level component later
        const confirmReferral = async () => {
            let user = await Auth.currentAuthenticatedUser()
            let jwtToken = user.signInUserSession.idToken.jwtToken

            cancelSource = axios.CancelToken.source()

            try {
                let referralConfirmRes = await axios({
                    cancelToken: cancelSource.token,
                    method: 'post',
                    url: `${config.referralConfirmation}`,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': jwtToken,
                    },
                    data: JSON.stringify({
                        'referral': invitationCode,
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

            return () => {
                cancelSource.cancel()
            }
        }

        
    }, [referralInfo, fetchedReferralInfo])

    useEffect(() => {
        if (isHealthkitReady) {
            dispatch({ type: 'init' })
            setIsReady(true)
        } else {
            const initPermission = health_kit.InitHealthKitPermission()
            Promise.resolve(initPermission).then(val => {
                setIstHealthKitReady(val)
            })
        }
    }, [isHealthkitReady])

    useEffect(() => {
        if (enabled === true && startTime !== null) {
            navigation.replace(RouteStacks.workout)
        }
    }, [startTime, enabled])


    const onSharePress = async () => {

        const shareRes = await share({
            url: `${config.onelinkUrl}/?screen=${RouteStacks.enterInvitationCode}&deep_link_value=${referralInfo.referral}`,
            title: t("shareMsg"),
            message: t("shareMsg"),
        })

    }

    const onCopyPress = () => {
        Clipboard.setString(referralInfo.referral);
        triggerSnackbar(t("snackbarPrompt.referralCodeCopied"))
    }

    const onRefresh = () => {
        setNeedFetchDtl(true)
    }

    const onDailyRewardModalClose = () => {
    }

    const onRuleOfReferralModalClose = () => {

    }

    const onLogoutPress = async () => {
        dispatch(startLoading(true))
        await awsLogout()
        dispatch(startLoading(false))
    }

    const onTrialPlayPress = async () => {

        try {
            const authed = await health_kit.GetAuthorizeStatus()
            // BackgroundGeolocation.ready(config).then(async(state)=>{
            //     await BackgroundGeolocation.changePace(true)
            //     await BackgroundGeolocation.start()
            // })

            if (authed || isReady) {
                setEnabled(true)
                dispatch({ type: 'start', payload: { startTime: (new Date()).getTime() } })
            } else {
                health_kit.InitHealthKitPermission()
                console.log('not ready')
            }

        } catch (err: any) {
            console.log('Error: ', err)
        }
    }

    const onLesGoBtnPress = () => dailyRewardModalRef?.current?.close()

    const onRuleOfReferralCloseBtnPress = () => ruleOfReferralModalRef?.current?.close()

    const onInfoBtnPress = () => ruleOfReferralModalRef?.current?.open()

    const onScrollDownPress = () => {
        keyboardAwareScrollViewRef?.current?.scrollToEnd()
    }

    const onInvitationRewardModalClose = () => {

    }

    const onInvitationRewardModalCloseBtnPress = () => {
        invitationRewardModalRef?.current?.close()
    }

    let queueNoDiff = referralInfo.lastRank - referralInfo.queueNumber
    let referredNames = useMemo(() => {
        return referralInfo.referredEmails.map((elem) => elem.toUpperCase())
    }, [referralInfo.referredEmails])

    let isNewAc = referralInfo.lastRank === 0

    return (
        <ScreenBackgrounds
            screenName={RouteStacks.homeReferral}
        >
            <DailyRewardModal
                ref={dailyRewardModalRef}
                onModalClose={onDailyRewardModalClose}
                onActionBtnPress={onLesGoBtnPress}
                ke={20}
            />

            <RuleOfReferralModal
                ref={ruleOfReferralModalRef}
                onModalClose={onRuleOfReferralModalClose}
                onActionBtnPress={onRuleOfReferralCloseBtnPress}
            />

            <InvitationRewardModal
                ref={invitationRewardModalRef}
                ke={20}
                onModalClose={onInvitationRewardModalClose}
                onActionBtnPress={onInvitationRewardModalCloseBtnPress}
            />

            <Pressable onPress={onScrollDownPress} style={{ position: "absolute", bottom: 20, right: 20, zIndex: 2 }}>
                <Image source={scrollDownBtn} style={{}} />
            </Pressable>

            <KeyboardAwareScrollView
                ref={keyboardAwareScrollViewRef}
                contentContainerStyle={[
                    Layout.colCenter,
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={needFetchDtl}
                        onRefresh={onRefresh}
                        progressViewOffset={10}
                        tintColor={colors.brightTurquoise}
                    />
                }
            >
                <Header
                    headerText={t("dashboard")}
                    rightIcon={() => <Image source={logoutBtn} />}
                    onRightPress={onLogoutPress}
                />

                <View style={{
                    height: 220,
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <CircularProgress
                        value={referralInfo.totalPoint}
                        radius={110}
                        duration={2000}
                        progressValueColor={colors.transparent}
                        maxValue={config.totalPointsMaxCap}
                        activeStrokeColor={colors.brightTurquoise}
                        strokeLinecap={"butt"}
                        inActiveStrokeWidth={14}
                        activeStrokeWidth={14}
                    >

                    </CircularProgress>
                    <View style={{
                        position: "absolute", top: 65, width: "100%"
                    }}>
                        <Text style={{
                            color: colors.white, fontSize: 18, fontWeight: "bold",
                            textAlign: "center"
                        }}>{t("totalPoints")}</Text>
                        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 10, alignItems: "center" }}>
                            {/* <Text style={{
                                color: colors.white, fontSize: 40, fontWeight: "bold",
                                textAlign: "center"
                            }}>{referralInfo.totalPoint}</Text> */}
                            <AnimateNumber value={referralInfo.totalPoint} style={{
                                color: colors.white,
                                fontSize: 40,
                                fontWeight: "bold",
                                textAlign: "center"
                            }}
                                formatter={(val: string) => {
                                    return parseInt(val)
                                }} />
                        </View>
                    </View>

                </View>

                <View style={[Layout.fullWidth, { alignItems: "center", justifyContent: "flex-end", height: 100 }]}>
                    <Text style={[{ paddingTop: 0, paddingBottom: 2, color: colors.white, fontSize: 24 }]}>{t("queueNumber")}</Text>
                    <View style={[Layout.fullWidth, { flexDirection: "row", alignItems: "center", justifyContent: "center" }]}>
                        <View style={{
                            backgroundColor: isNewAc || queueNoDiff === 0 ? colors.philippineSilver : queueNoDiff > 0 ? colors.brightTurquoise : colors.magicPotion,
                            borderRadius: 12, paddingHorizontal: 12, paddingVertical: 2, marginRight: 16,
                            justifyContent: "center",
                        }}>
                            <Text style={[{ color: colors.darkGunmetal, fontSize: 18 }]}>{isNewAc || queueNoDiff === 0 ? "+" : queueNoDiff > 0 ? "▲" : "▼"} {isNewAc ? 0 : queueNoDiff}</Text>
                        </View>
                        {/* <Text style={[{ fontWeight: "bold", color: colors.white, fontSize: 44 }]}>{referralInfo.queueNumber}</Text> */}
                        <AnimateNumber value={referralInfo.queueNumber} style={{
                            color: colors.white,
                            fontSize: 44,
                            fontWeight: "bold",
                        }}
                            formatter={(val: string) => {
                                return parseInt(val)
                            }} />
                    </View>
                </View>

                <View style={[Layout.fullWidth, { alignItems: "center", justifyContent: "center", height: 140 }]}>
                    <Text style={[Layout.fullWidth, { color: colors.white, fontSize: 24, textAlign: "center" }]}>{t("top100AvgKE")}</Text>
                    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                        {/* <Text style={{
                            color: colors.white, fontSize: 40, fontWeight: "bold",
                            textAlign: "center"
                        }}>{referralInfo.top100AvgKE.toFixed(2)}</Text> */}
                        <AnimateNumber value={referralInfo.top100AvgKE.toFixed(2)} style={{
                            color: colors.white,
                            fontSize: 40,
                            fontWeight: "bold",
                            textAlign: "center"
                        }}
                            formatter={(val: string) => {
                                return parseFloat(val).toFixed(2)
                            }} />
                    </View>
                </View>

                <View style={[Layout.fullWidth, Layout.center, {
                    paddingBottom: 40,
                }]}>
                    <View style={{
                        backgroundColor: colors.brightTurquoise,
                        shadowColor: colors.brightTurquoise,
                        elevation: 10,
                        borderRadius: 30,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.5,
                        shadowRadius: 10,
                    }}>
                        <Pressable style={{
                            borderRadius: 30,
                            paddingHorizontal: 40, paddingVertical: 4
                        }} onPress={onTrialPlayPress}>
                            <Text style={{ fontSize: 30, fontWeight: "bold", fontStyle: "italic", fontFamily: "Poppins-Bold", color: colors.darkGunmetal }}>{t("trialPlay")}</Text>
                        </Pressable>
                    </View>

                </View>

                <View style={{
                    backgroundColor: colors.jacarta,
                    borderRadius: 20,
                    height: 110,
                    marginBottom: 30,
                    marginHorizontal: 20
                }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 10, paddingRight: 20 }}>
                        <Text style={[{ color: colors.white, paddingTop: 0, paddingHorizontal: 20 }, Fonts.textSmall]}>{t("yourReferralCode")}</Text>
                        <Pressable onPress={onCopyPress} style={{
                            borderRadius: 10, justifyContent: "center", alignItems: "center", backgroundColor: colors.darkBlueGray,
                            opacity: 0.5, width: 45, height: 30
                        }}>
                            <MaterialCommunityIcons name="content-copy" size={20} color={colors.white} />
                        </Pressable>
                    </View>

                    <View style={[
                        {
                            flexDirection: "row",
                            paddingHorizontal: 20,
                            position: "relative",
                            justifyContent: "center",
                            alignItems: "center",
                            paddingTop: 10
                        }
                    ]}>
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
                                fontSize: 16
                            }}
                        />

                        <TurquoiseButton
                            text={t("share")}
                            onPress={onSharePress}
                            isTransparentBackground
                            containerStyle={{
                                position: "absolute",
                                right: 30,
                                zIndex: 2,
                                width: 80,
                                bottom: 5
                            }}
                            style={{
                                borderRadius: 10
                            }}
                        />

                    </View>
                </View>


                <View style={[{ height: 40, flexDirection: 'row', alignItems: 'center' }, Gutters.largeHPadding]}>
                    <View style={{ flex: 4, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[Gutters.smallVPadding, { color: colors.white, fontSize: 18, marginRight: 6 }]}>{t('totalReferred')}</Text>
                        <Pressable onPress={onInfoBtnPress}>
                            <MaterialCommunityIcons name="information-outline" color={colors.brightTurquoise} size={24} />
                        </Pressable>
                    </View>

                    <Text style={[Fonts.textSmall, { color: colors.brightTurquoise }]}>{referralInfo.referred} {t(`friend${referralInfo.referred <= 1 ? '' : 's'}`)}</Text>
                </View>

                <View style={{ height: 80, alignItems: "flex-start", width: "85%" }}>
                    {
                        referredNames.map((elem, idx) => {
                            return <View style={[REFERRED_FRIEND_ICON, { top: 0, left: idx * 35 }]} key={`Friend-${idx}`}>
                                <Text style={{ color: colors.black, fontWeight: "bold", fontSize: 18 }}>{elem}</Text>
                            </View>
                        })
                    }
                    {
                        referredNames.length === 0 ? <View style={[REFERRED_FRIEND_ICON, { top: 0, left: 0 }]}>
                            <Image source={emptyAvatar} style={{}} />
                        </View> : referredNames.length > 4 ? <View style={[REFERRED_FRIEND_ICON, { top: 0, left: 4 * 35, backgroundColor: colors.indigo }]}>
                            <Text style={{ color: colors.white, fontWeight: "bold", fontSize: 18 }}>+{referredNames.length - 4}</Text>
                        </View> : null
                    }

                </View>

                <View style={{ width: '90%', backgroundColor: colors.white, height: 1 }} />

                <View style={[Layout.fullWidth, Layout.center, { height: 140, justifyContent: "center", paddingHorizontal: 40 }]}>
                    <Text style={{ fontFamily: "Poppins-Bold", color: colors.brightTurquoise, fontWeight: 'bold', lineHeight: 30, paddingTop: 30, fontStyle: "italic", fontSize: 30, textAlign: "center" }}>{t("moreBonus")}</Text>
                    <Text style={{ color: colors.crystal, fontSize: 14, textAlign: "center", paddingTop: 20 }}>{t("madeItToBeta")}</Text>
                </View>

                <View style={[Layout.fullWidth, Layout.center, { height: 300 }]}>
                    <Image source={world} style={{ width: '100%' }} />
                </View>

                <View style={[Layout.fullWidth, { height: 50, paddingHorizontal: 40, justifyContent: "flex-start", alignItems: "center", flexDirection: "row" }]}>
                    <Ionicons name="share-outline" color={colors.white} size={20} style={{ marginRight: 20 }} />
                    <Text style={[{ fontSize: 14, color: colors.white }]}>{t("shareReferralLink")}</Text>
                </View>

                <View style={[Layout.fullWidth, { height: 120, paddingHorizontal: 40, justifyContent: "flex-start", alignItems: "center", flexDirection: "row" }]}>
                    <Ionicons name="people-outline" color={colors.white} size={20} style={{ marginRight: 20 }} />
                    <Text style={[{ fontSize: 14, color: colors.white, flexShrink: 1 }]}>{t("earnKEWhenReferredFriends")}</Text>
                </View>

                {/* <View style={[Layout.fullWidth, Layout.center, { height: 80 }]}>
                    <Text style={[{ color: colors.brightTurquoise, fontWeight: "bold", fontSize: 18 }]}>{t("learnMoreAllCapital")}</Text>
                </View> */}

                <View style={[Layout.fullWidth, Layout.center, { height: 120, paddingBottom: 40, paddingHorizontal: 30, justifyContent: "center", }]}>
                    <Text style={[{ color: colors.white, fontSize: 14, lineHeight: 20, textAlign: "center" }]}>
                        {t("theReferralIsGoverned")}
                        <Text style={[{ color: colors.white, fontWeight: "bold", fontSize: 14 }]}>{t("programTC")}</Text>
                    </Text>
                </View>



            </KeyboardAwareScrollView>
        </ScreenBackgrounds>
    )

}

export default HomeReferralScreen
