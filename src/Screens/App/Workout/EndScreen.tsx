import React, { useState, useEffect, FC } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import {
	View,
	Text,
	StyleSheet, Image, TextProps,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/Hooks'
// @ts-ignore
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { WorkoutNavigatorParamList } from '@/Navigators/WorkoutNavigator'
import { RouteStacks, RouteTabs } from '@/Navigators/routes'
// @ts-ignore
// @ts-ignore
import { useWalletConnect } from '@walletconnect/react-native-dapp'

import ScreenBackgrounds from '@/Components/ScreenBackgrounds'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { colors } from '@/Utils/constants'
import { Brand, Header } from '@/Components'
import SpeedLogo from '@/Assets/Images/map/speed.png'
import TimerLogo from '@/Assets/Images/map/timer.png'
import TurquoiseButton from '@/Components/Buttons/TurquoiseButton'
import SocialShareButton from '@/Components/Buttons/SocialShareButton'
import SaveScreenButton from '@/Components/Buttons/SaveScreenButton'
import CloseButton from '@/Components/Buttons/CloseButton'

const EndScreen: FC<StackScreenProps<WorkoutNavigatorParamList>> = (
	{ navigation, route }
) => {
	const { t } = useTranslation()
	const { Common, Fonts, Gutters, Layout } = useTheme()
	const params = route?.params || { username: '' }
	// console.log('route', route.params)

	const startTime = useSelector((state:any) => state.map.startTime)
	const endTime = useSelector((state:any) => state.map.endTime)
	const steps = useSelector((state:any) => state.map.steps)
	const calories = useSelector((state:any) => state.map.calories)
	const distance = useSelector((state:any) => state.map.distance)
	const heartRate = useSelector((state:any) => state.map.heartRate)
	const paths = useSelector((state:any) => state.map.paths)
	const currentState = useSelector((state:any) => state.map.currentState)
	const latitude = useSelector((state:any) => state.map.latitude)
	const longitude = useSelector((state:any) => state.map.longitude)

	const styles = StyleSheet.create({
		container:{
			flex: 1,
			// justifyContent: 'center',
			backgroundColor: colors.darkGunmetal,
		},
		contentContainer: {
			display: 'flex',
			justifyContent: 'center',
			alignContent: 'center',
			alignItems: 'center',
		},
		rowContentContainer : {
			flexDirection: 'row',
			alignItems:'center',
			justifyContent: 'space-around',
			width:'100%',
			marginTop: 20,
			marginBottom: 20,
		},
		colContentContainer : {
			flexDirection: 'column',
			alignItems:'center',
			width:'100%',
			marginTop: 20,
		},
		titleTextStyle : {
			color: colors.brightTurquoise,
			fontSize: 30,
			lineHeight:45,
			fontStyle:'italic',
			fontWeight: '600',
			paddingTop:10,
		},
		distanceTextStyle:{
			fontSize: 100,
			fontWeight:'700',
			lineHeight:150,
			color: colors.brightTurquoise,

		},
		lightTextStyle : {
			color:colors.crystal,
		},
		textStyle:{
			color: colors.white,
			fontSize:20,
			textAlign:'center',
		},
	})


	const [ isLoggingIn, setIsLoggingIn ] = useState(false)
	const [ errMsg, setErrMsg ] = useState(' ')
	const returnStart = () => {
		navigation.reset({
			index: 0,
			routes: [ { name: RouteStacks.startWorkout } ],
		})
	}
	const WhiteText = (props: TextProps) => {
		const { style, ...rest } = props
		return <Text style={[ styles.textStyle, style ]} {...rest} />
	}

	const BackToMainScreen = () => {
		navigation.replace(RouteStacks.homeMain)
	}
	return (
		<ScreenBackgrounds screenName={RouteStacks.workout}>
			<Header
				// onLeftPress={goBack}
				headerText={'Result'}
				style={{ backgroundColor: colors.darkGunmetal }}
			/>
			<KeyboardAwareScrollView
				style={[ Layout.fill, styles.container ]}
				contentContainerStyle={[
					Layout.fill,
					Layout.colCenter,
				]}>

				<View style={[ Layout.fill, Layout.colCenter, styles.contentContainer ]}>
					<WhiteText style={styles.titleTextStyle}>congratulations</WhiteText>
					<WhiteText style={styles.distanceTextStyle}>{(distance / 1000).toFixed(2)}</WhiteText>
					<WhiteText style={{ color:colors.crystal }}>Total Kilometers</WhiteText>
					<WhiteText>{steps}</WhiteText>
					<View style={[ styles.rowContentContainer ]}>
						<View style={[ styles.contentContainer ]}>
							<Image source={TimerLogo} style={{ width: 18.14, height: 20, resizeMode: 'contain', alignSelf:'center' }} />
							<WhiteText>01'30"</WhiteText>
						</View>
						<View style={[ styles.contentContainer ]}>
							<Image source={SpeedLogo} style={{ width: 18.14, height: 20, resizeMode: 'contain', alignSelf:'center' }} />
							<WhiteText>3.13km/h</WhiteText>
						</View>
					</View>
					<View style={[ styles.colContentContainer ]}>
						<SocialShareButton
							onPress={() => {console.log('share')}}
							text={t('Share on Twitter')}
							iconName="twitter"
							containerStyle={[ Layout.fullWidth ]}
						/>
						<SaveScreenButton
							onPress={() => {console.log('saved')}}
							text={t('Save Screen')}
							containerStyle={[ Layout.fullWidth ]}
						/>
						<CloseButton
							onPress={() => {console.log('close')}}
							iconName = {t('close')}
							containerStyle={[ Layout.fullWidth ]}/>
						<TurquoiseButton
							text={t('close')}
							onPress={BackToMainScreen}
							containerStyle={{
								width: '45%',
							}}
							isTransparentBackground
						/>
					</View>
				</View>
			</KeyboardAwareScrollView>
		</ScreenBackgrounds>
	)
}

export default EndScreen
