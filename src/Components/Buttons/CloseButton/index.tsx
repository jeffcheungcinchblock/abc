import React, { FC } from 'react'
import { View, Image, Text, ActivityIndicator, Pressable, PressableProps, ViewStyle, ImageSourcePropType } from 'react-native'
import { useTheme } from '@/Hooks'
import { colors } from '@/Utils/constants'
import facebookIcon from '@/Assets/Images/buttons/facebook.png'
import closeIcon from '@/Assets/Images/buttons/btn_cross.png'
import { Icon } from 'react-native-vector-icons/Icon'

type CloseButtonProps = {
    containerStyle?: object
    style?: object
    textStyle?: object
    onPress: () => void
    IconName: 'close'
    isLoading?: boolean
}

let size = 30

const BUTTON_STYLE: ViewStyle = {
	backgroundColor: colors.brightTurquoise,
	height: 30,
	width: 30,
	borderRadius: 99,
	justifyContent: 'center',
}

const iconNameMap = {
	close: closeIcon,
}
const CloseButton = ({
	containerStyle,
	style,
	textStyle,
	onPress,
	IconName,
	isLoading,
}: CloseButtonProps) => {
	const { Layout, Images } = useTheme()

	return (
		<View style={{
			...containerStyle,

		}}>
			<Pressable
				onPress={onPress}
				style={[ BUTTON_STYLE, {
				} ]}
			>
				{
					isLoading ? <ActivityIndicator
						size="small" color={'#fff'}
					/> : <View style={[ Layout.rowCenter ]}>
						<Image source={iconNameMap[IconName]} style={{ width: 30, height: 30 }} />
					</View>
				}
			</Pressable>
		</View>
	)
}

CloseButton.defaultProps = {

}

export default CloseButton
