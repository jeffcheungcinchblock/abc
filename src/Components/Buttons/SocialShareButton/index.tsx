import React, { FC } from 'react'
import { View, Image, Text, ActivityIndicator, Pressable, PressableProps, ViewStyle, ImageSourcePropType } from 'react-native'
import { useTheme } from '@/Hooks'
import { colors } from '@/Utils/constants'
import facebookIcon from '@/Assets/Images/buttons/facebook.png'
import appleIcon from '@/Assets/Images/buttons/apple.png'
import googleIcon from '@/Assets/Images/buttons/google.png'
import twitterIcon from '@/Assets/Images/icons/twitter.png'

// import twitterIcon from '@/Assets/Images/icons/twitter2.png'

type SocialShareButtonProps = {
    containerStyle?: object
    style?: object
    textStyle?: object
    onPress: () => void
    isLoading?: boolean
    iconName: 'google' | 'apple' | 'facebook'| 'twitter'
    text?  : string
}

const BUTTON_STYLE: ViewStyle = {
	backgroundColor: colors.brightTurquoise,
	height: 40,
	width: 200,
	borderRadius: 99,
	justifyContent: 'space-around',
}

const iconNameMap = {
	facebook: facebookIcon,
	twitter: twitterIcon,
	apple: appleIcon,
	google: googleIcon,
}

const SocialShareButton = ({
	containerStyle,
	onPress,
	isLoading,
	iconName,
	text,
}: SocialShareButtonProps) => {
	const { Layout, Images } = useTheme()

	return (
		<View style={{
			...containerStyle,
			marginBottom:10,
		}}>
			<Pressable
				onPress={onPress}
				style={[ BUTTON_STYLE, {
				} ]}
			>
				{
					isLoading ? <ActivityIndicator
						size="small" color={'#fff'}
					/> : <View style={[ Layout.rowCenter, {justifyContent:'space-around'} ]}>
						<Text style={{ fontWeight:'500', lineHeight:24, fontSize:16 }}>{text}</Text>
						<Image source={iconNameMap[iconName]} style={{  width:24, height: 22 }} />
					</View>
				}
			</Pressable>
		</View>
	)
}

SocialShareButton.defaultProps = {

}

export default SocialShareButton
