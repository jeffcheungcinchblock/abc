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
import moment from 'moment'
import { awsLogout, triggerSnackbar } from '@/Utils/helpers'
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
import RuleOfReferralModal from '@/Components/Modals/RuleOfReferralModal'
//health kit - googlefit
import { IOSHealthKit } from '@/Healthkit/iosHealthKit'
import { GoogleFitKit } from '@/Healthkit/androidHealthKit'
import BackgroundGeolocation, {
	Subscription,
} from 'react-native-background-geolocation'

const PURPLE_COLOR = {
	color: colors.magicPotion,
}

type ReferralInfo = {
    queueNumber: number
    referral: string
    referred: number
    username: string
    referredBy: string
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
	const dailyRewardModalRef = useRef<any>(null)
	const ruleOfReferralModalRef = useRef<any>(null)
	const { t } = useTranslation()
	const { Common, Fonts, Gutters, Layout } = useTheme()
	const { invitationCode } = useSelector((state: RootState) => state.user)
	const dispatch = useDispatch()
	const [ isInvitingFriends, setIsInvitingFriends ] = useState(false)
	const [ needFetchDtl, setNeedFetchDtl ] = useState(true)
	const [ fetchedReferralInfo, setFetchedReferralInfo ] = useState(false)
	const [ points, setPoints ] = useState(25)
	const [ referralInfo, setReferralInfo ] = useState<ReferralInfo>({
		queueNumber: 0,
		referral: '',
		referred: 0,
		username: '',
		referredBy: '',
	})
	const [ isHealthkitReady, setIstHealthKitReady ] = useState(false)
	const [ isReady, setIsReady ] = useState<Boolean>(false)
	const [ enabled, setEnabled ] = useState(false)
	useEffect(() => {
		const run = async () => {
			try {
				let user = await Auth.currentAuthenticatedUser()
				let jwtToken = user.signInUserSession.idToken.jwtToken

				const authRes = await axios.get(config.userAuthInfo, {
					headers: {
						Authorization: jwtToken, //the token is a variable which holds the token
					},
				})
				setReferralInfo(authRes.data)

			} catch (err) {
				console.log(err)
			}
		}

		if (needFetchDtl) {
			run()
			setTimeout(() => {
				setNeedFetchDtl(false)
			}, 1000)
			if (!fetchedReferralInfo) {
				setFetchedReferralInfo(true)
			}
		}
	}, [ needFetchDtl, fetchedReferralInfo ])

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
		}
	}, [ referralInfo, fetchedReferralInfo ])


	useEffect(() => {
		// setCurrentState('initialing')
		const startInit = async () => {
			health_kit.GetAuthorizeStatus().then((isAuthorize) => {
				if (!isAuthorize) {
					health_kit
						.InitHealthKitPermission()
						.then(val => {
							console.log('inti health kit', val)
						})
						.catch(err => {
							console.error(err)
							setIstHealthKitReady(false)
						})
				} else {
					setIstHealthKitReady(true)
				}
			}).then(()=>{
				dispatch({ type:'inital' })
				console.log('set health kit readty')
			})
		}
		startInit()
	}, [])

	useEffect(() => {
		console.log('home ready')
		BackgroundGeolocation.ready({
			triggerActivities: 'on_foot, walking, running',
			locationAuthorizationRequest : 'WhenInUse',
			desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
			distanceFilter: 5,
			stopTimeout: 5,
			isMoving: true,
			reset: false,
			debug: true,
			disableElasticity : true,
			speedJumpFilter:20,
			logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
			stopOnTerminate: true,
		}).then(()=>{
			dispatch({ type:'ready' })
			setIsReady(true)
		})
	}, [ isHealthkitReady ])

	useEffect(() => {
		if (enabled === true) {
			dispatch({ type:'start', payload:{ startTime:new Date() } })
			navigation.replace(RouteStacks.workout)
			console.log('replace to workout')
		}
	}, [ enabled ])

	const onSharePress = async () => {

		const shareRes = await share({
			url: `${config.onelinkUrl}/?screen=enterInvitationCode&deep_link_value=${referralInfo.referral}`,
			title: 'Invite your friend', message: 'Invite your friend',
		})

		if (shareRes !== false) {
			navigation.navigate(RouteTabs.home, {
				screen: RouteStacks.homeInviteState,
			})
		}

	}

	const goBack = () => {
		navigation.navigate(RouteStacks.homeMain)

	}

	const onCopyPress = () => {
		Clipboard.setString(referralInfo.referral)
		triggerSnackbar('Invitation code copied !')

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
		const authed = await health_kit.GetAuthorizeStatus()
		console.log('auth', authed)
		if (authed){
			setEnabled(true)
		} else {
			await health_kit.InitHealthKitPermission()
			console.log('not authed health kit')
		}
	}

	const onLesGoBtnPress = () => {
        dailyRewardModalRef?.current?.close()
	}

	const onCloseBtnPress = () => {
        ruleOfReferralModalRef?.current?.close()
	}

	const onInfoBtnPress = () => {
        ruleOfReferralModalRef?.current?.open()

	}

	return (
		<ScreenBackgrounds
			screenName={RouteStacks.homeReferral}
		>
			<DailyRewardModal
				ref={dailyRewardModalRef}
				onModalClose={onDailyRewardModalClose}
				onActionBtnPress={onLesGoBtnPress}
				ke={25}
			/>

			<RuleOfReferralModal
				ref={ruleOfReferralModalRef}
				onModalClose={onRuleOfReferralModalClose}
				onActionBtnPress={onCloseBtnPress}
			/>

			<KeyboardAwareScrollView
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
					headerText={t('dashboard')}
					rightIcon={() => <MaterialCommunityIcons name="logout" color={colors.white} size={24} />}
					onRightPress={onLogoutPress}
				/>


				<View style={{
					height: 220,
					width: '100%',
					alignItems: 'center',
					justifyContent: 'center',
				}}>
					<CircularProgress
						value={points}
						radius={110}
						duration={2000}
						progressValueColor={colors.transparent}
						maxValue={200}
						activeStrokeColor={colors.brightTurquoise}
						strokeLinecap={'butt'}
						inActiveStrokeWidth={14}
						activeStrokeWidth={14}
					 />
					<View style={{
						position: 'absolute', top: 65, width: '100%',
					}}>
						<Text style={{
							color: colors.white, fontSize: 18, fontWeight: 'bold',
							textAlign: 'center',
						}}>{t('totalPoints')}</Text>
						<View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
							<AppIcon
								style={{
									width: 16,
									marginRight: 6,
								}}
								imageStyle={{
									width: '100%',
								}}
							/>
							<Text style={{
								color: colors.white, fontSize: 40, fontWeight: 'bold',
								textAlign: 'center',
							}}>{points.toFixed(2)}</Text>
						</View>
					</View>

				</View>

				<View style={[ Layout.fullWidth, { alignItems: 'center', justifyContent: 'center', height: 150 } ]}>
					<Text style={[ { fontWeight: 'bold', color: colors.white, fontSize: 44 } ]}>{referralInfo.queueNumber}</Text>
					<Text style={[ { paddingTop: 0, paddingBottom: 2, color: colors.white, fontSize: 20 } ]}>{t('queueNumber')}</Text>
					<Text style={[ { fontWeight: 'bold', color: colors.brightTurquoise, fontSize: 26 } ]}>▲  {referralInfo.queueNumber}</Text>
				</View>

				<View style={{
					backgroundColor: colors.jacarta,
					borderRadius: 20,
					height: 130,
					marginBottom: 30,
					marginHorizontal: 20,
				}}>
					<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 20 }}>
						<Text style={[ { color: colors.white, paddingTop: 30, paddingBottom: 16, paddingHorizontal: 20 }, Fonts.textSmall ]}>{t('yourReferralCode')}</Text>
						<Pressable onPress={onCopyPress} style={{
							borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.darkBlueGray,
							opacity: 0.5, width: 45, height: 30,
						}}>
							<MaterialCommunityIcons name="content-copy" size={20} color={colors.white} />
						</Pressable>
					</View>
					<View style={[
						{
							flexDirection: 'row',
							paddingHorizontal: 20,
							position: 'relative',
							justifyContent: 'center',
							alignItems: 'center',
						},
					]}>
						<TextInput
							value={referralInfo.referral}
							style={{
								color: colors.white,
								backgroundColor: colors.chineseBlack,
								borderRadius: 10,
								width: '100%',
								paddingHorizontal: 20,
								height: 40,
								fontSize: 16,
							}}
						/>

						<TurquoiseButton
							text={t('share')}
							onPress={onSharePress}
							isTransparentBackground
							containerStyle={{
								position: 'absolute',
								right: 25,
								zIndex: 2,
								width: 80,
							}}
							style={{
								borderRadius: 10,
							}}
						/>

					</View>
				</View>


				<View style={[ { height: 40, flexDirection: 'row', alignItems: 'center' }, Gutters.largeHPadding ]}>
					<View style={{ flex: 4, flexDirection: 'row', alignItems: 'center' }}>
						<Text style={[ Gutters.smallVPadding, { color: colors.white, fontSize: 18, marginRight: 6 } ]}>{t('totalReferred')}</Text>
						<Pressable onPress={onInfoBtnPress}>
							<MaterialCommunityIcons name="information-outline" color={colors.brightTurquoise} size={24} />
						</Pressable>
					</View>

					<Text style={[ Fonts.textSmall, { color: colors.brightTurquoise } ]}>{7} {t('friends')}</Text>
				</View>

				<View style={{ height: 80, alignItems: 'flex-start', width: '85%' }}>
					<View style={[ REFERRED_FRIEND_ICON, { top: 0, left: 0 } ]}>
						<Text style={{ color: colors.black, fontWeight: 'bold', fontSize: 18 }}>K</Text>
					</View>
					<View style={[ REFERRED_FRIEND_ICON, { top: 0, left: 35 } ]}>
						<Text style={{ color: colors.black, fontWeight: 'bold', fontSize: 18 }}>A</Text>
					</View>
					<View style={[ REFERRED_FRIEND_ICON, { top: 0, left: 70 } ]}>
						<Text style={{ color: colors.black, fontWeight: 'bold', fontSize: 18 }}>B</Text>
					</View>
					<View style={[ REFERRED_FRIEND_ICON, { top: 0, left: 105, backgroundColor: colors.indigo } ]}>
						<Text style={{ color: colors.white, fontWeight: 'bold', fontSize: 18 }}>+3</Text>
					</View>
				</View>

				<View style={{ width: '90%', backgroundColor: colors.white, height: 1 }} />

				<View style={[ Layout.fullWidth, Layout.center, { height: 90, justifyContent: 'flex-end' } ]}>
					<Text style={{ color: colors.brightTurquoise, fontWeight: 'bold', fontStyle: 'italic', fontSize: 30 }}>{t('referredAndGetUsd')}</Text>
					<Text style={{ color: colors.crystal, fontSize: 14 }}>{t('unlimitedBonus')}</Text>
				</View>

				<View style={[ Layout.fullWidth, Layout.center, { height: 300 } ]}>
					<Image source={world} style={{ width: '100%' }} />
				</View>

				<View style={[ Layout.fullWidth, { height: 50, paddingHorizontal: 40, justifyContent: 'flex-start', flexDirection: 'row' } ]}>
					<Ionicons name="share-outline" color={colors.white} size={20} style={{ marginRight: 20 }} />
					<Text style={[ { fontSize: 14, color: colors.white } ]}>{t('shareReferralLink')}</Text>
				</View>

				<View style={[ Layout.fullWidth, { height: 80, paddingHorizontal: 40, justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'row' } ]}>
					<Ionicons name="people-outline" color={colors.white} size={20} style={{ marginRight: 20 }} />
					<Text style={[ { fontSize: 14, color: colors.white, flexShrink: 1 } ]}>{t('stakeForARubyCard')}</Text>
				</View>

				<View style={[ Layout.fullWidth, Layout.center, { height: 80 } ]}>
					<Text style={[ { color: colors.brightTurquoise, fontWeight: 'bold', fontSize: 18 } ]}>{t('learnMoreAllCapital')}</Text>
				</View>

				<View style={[ Layout.fullWidth, Layout.center, { height: 80, paddingHorizontal: 30, justifyContent: 'flex-start' } ]}>
					<Text style={[ { color: colors.white, fontSize: 14, lineHeight: 20 } ]}>
						{t('theReferralIsGoverned')}
						<Text style={[ { color: colors.white, fontWeight: 'bold', fontSize: 14 } ]}>{t('bg25')}</Text>
					</Text>
				</View>

				<View style={[ Layout.fullWidth, Layout.center, { paddingBottom: 40 } ]}>
					<Pressable style={{ backgroundColor: colors.brightTurquoise, borderRadius: 30, paddingHorizontal: 40, paddingVertical: 4 }} onPress={onTrialPlayPress}>
						<Text style={{ fontSize: 30, fontWeight: 'bold', fontStyle: 'italic', color: colors.darkGunmetal }}>{t('trialPlay')}</Text>
					</Pressable>
				</View>

			</KeyboardAwareScrollView>
		</ScreenBackgrounds>
	)
}

export default HomeReferralScreen
