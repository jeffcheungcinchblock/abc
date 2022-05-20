import React, { FC } from 'react'
import { View, Image, Text, ActivityIndicator, Pressable, PressableProps, ViewStyle, ImageSourcePropType } from 'react-native'
import { useTheme } from '@/Hooks'
import { colors } from '@/Utils/constants'
import facebookIcon from '@/Assets/Images/buttons/facebook.png'
import appleIcon from '@/Assets/Images/buttons/apple.png'
import googleIcon from '@/Assets/Images/buttons/google.png'
import DownloadIcon from '@/Assets/Images/map/download.png'
type SaveScreenButtonProps = {
    containerStyle?: object
    style?: object
    textStyle?: object
    onPress: () => void
    isLoading?: boolean
    text? : string
}

let size = 30

const BUTTON_STYLE: ViewStyle = {
	backgroundColor: 'transparent',
	height: 40,
	width: 180,
	borderRadius: 99,
	justifyContent: 'center',
	borderColor: colors.brightTurquoise,
	borderWidth:1,
}

const iconNameMap = {
	facebook: facebookIcon,
	// twitter: twitterIcon,
	apple: appleIcon,
	google: googleIcon,
}

const SaveScreenButton = ({
	containerStyle,
	onPress,
	isLoading,
	text,
}: SaveScreenButtonProps) => {
	const { Layout } = useTheme()

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
					/> : <View style={[ Layout.rowCenter, {justifyContent:'center'} ]}>
						<Text style={{ fontWeight:'500', lineHeight:24, fontSize:16, color:colors.brightTurquoise }}>{text}</Text>
						<Image source={DownloadIcon} style={{margin:10}}/>
					</View>
				}
			</Pressable>
		</View>
	)
}

SaveScreenButton.defaultProps = {

}

export default SaveScreenButton
