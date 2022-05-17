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
// import SpeedLogo from '@/Assets/Images/map/speed.png'
import TurquoiseButton from '@/Components/Buttons/TurquoiseButton'
import SocialShareButton from '@/Components/Buttons/SocialShareButton'
import SaveScreenButton from '@/Components/Buttons/SaveScreenButton'
import CloseButton from '@/Components/Buttons/CloseButton'
import ConGratualtion from '@/Assets/Images/map/congratulation.png'
import SpeedIcon from '@/Assets/Images/map/speed_crystal.png'
import TimerLogo from '@/Assets/Images/map/timer_crystal.png'

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
			alignItems:'center',
			backgroundColor: colors.darkGunmetal,
			width: '100%',
			justifyContent: 'center',
			marginBottom: 50,
		},
		contentContainer: {
			display: 'flex',
			width:'100%',
		},
		rowContentContainer : {
			flexDirection: 'row',
			alignItems:'center',
			alignContent:'center',
			width:'100%',
			marginTop: 20,
			marginBottom: 20,
			justifyContent:'center',
		},
		rowContentContainer2 : {
			flexDirection: 'row',
			justifyContent:'space-around',
			display:'flex',
			height:100,
			width:'100%',
			marginTop: 20,

		},
		colContentContainer : {
			flexDirection: 'column',
			alignItems:'center',
			width:'100%',

		},
		titleTextStyle : {
			color: colors.brightTurquoise,
			fontSize: 30,
			lineHeight:45,
			fontStyle:'italic',
			fontWeight: '700',
			// width:'80%',
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
			fontSize:25,
			lineHeight:45,
			fontWeight:'700',
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

	return (
		<ScreenBackgrounds screenName={RouteStacks.workout}>
			<Header
				// onLeftPress={goBack}
				headerText={'Result'}
				style={{ backgroundColor: colors.darkGunmetal }}
			/>
			<View
				style={[ styles.container ]}
			>
				<View style={[ Layout.colCenter, styles.contentContainer ]}>
					<View style={[ styles.rowContentContainer, { height:45 } ]}>
						<WhiteText style={styles.titleTextStyle}>congratulations</WhiteText>
						<Image source={ConGratualtion} style={{ width: 18.14, height: 20, resizeMode: 'contain', alignSelf:'center' }} />
					</View>
					<WhiteText style={styles.distanceTextStyle}>{(distance / 1000).toFixed(2)}</WhiteText>
					<WhiteText style={{ color:colors.crystal }}>Total Kilometers</WhiteText>
					<WhiteText>{steps}</WhiteText>
					<View style={[ styles.rowContentContainer2 ]}>
						<View style={[ styles.contentContainer ]}>
							<Image source={TimerLogo} style={{ width: 18.14, height: 20, resizeMode: 'contain', alignSelf:'center' }} />
							<WhiteText>01'30"</WhiteText>
						</View>
						<View style={[ styles.contentContainer ]}>
							<Image source={SpeedIcon} style={{ width: 18.14, height: 20, resizeMode: 'contain', alignSelf:'center' }} />
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
							onPress={() => {navigation.navigate(RouteStacks.homeReferral)}}
							containerStyle={[ Layout.fullWidth ]}/>

					</View>
				</View>
			</View>
		</ScreenBackgrounds>
	)
}

export default EndScreen
