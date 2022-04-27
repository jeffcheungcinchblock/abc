import React, { FC } from 'react'
import { View, Image, Text, ActivityIndicator, Pressable, StyleProp, ViewStyle, ImageStyle } from 'react-native'
import { useTheme } from '@/Hooks'
import { colors } from '@/Utils/constants'
import appLogo from '@/Assets/Images/logos/logo.png'

type AppLogoProps = {
    style?: object
    imageStyle?: object
}

const AppLogo = ({
    style,
    imageStyle
}: AppLogoProps) => {
    const { Layout, Images } = useTheme()

    return (
        <View style={{
            width: "100%",
            alignItems: "center",
            ...style,
        }}>
            <Image source={appLogo} style={{
                height: "100%",
                resizeMode: "contain",
                ...imageStyle,
            }}/>
        </View>
    )
}

AppLogo.defaultProps = {

}

export default AppLogo
