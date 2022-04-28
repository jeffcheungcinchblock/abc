import React, { FC } from 'react'
import { View, Image, Text, ActivityIndicator, Pressable, PressableProps, ViewStyle, ImageSourcePropType } from 'react-native'
import { useTheme } from '@/Hooks'
import { colors } from '@/Utils/constants'
import facebookIcon from '@/Assets/Images/buttons/facebook.png'
import appleIcon from '@/Assets/Images/buttons/apple.png'
import googleIcon from '@/Assets/Images/buttons/google.png'

type SocialSignInButtonProps = {
    containerStyle?: object
    style?: object
    textStyle?: object
    onPress: () => void
    isLoading?: boolean
    iconName: 'google' | 'apple' | 'facebook'
}


const BUTTON_STYLE: ViewStyle = {
    backgroundColor: colors.brightTurquoise,
    height: 40,
    width: 40,
    borderRadius: 99,
    justifyContent: "center"
}

const iconNameMap = {
    facebook: facebookIcon,
    apple: appleIcon,
    google: googleIcon,
}

const SocialSignInButton = ({
    containerStyle,
    style,
    textStyle,
    onPress,
    isLoading,
    iconName
}: SocialSignInButtonProps) => {
    const { Layout, Images } = useTheme()

    return (
        <View style={{
            ...containerStyle,
        }}>
            <Pressable
                onPress={onPress}
                style={[BUTTON_STYLE, {
                }]}
            >
                {
                    isLoading ? <ActivityIndicator
                        size="small" color={"#fff"}
                    /> : <View style={[Layout.rowCenter]}>
                        <Image source={iconNameMap[iconName]} style={{width: 40, height: 40}} />
                    </View>
                }
            </Pressable>
        </View>
    )
}

SocialSignInButton.defaultProps = {

}

export default SocialSignInButton
