import React, { FC } from 'react'
import { View, Image, Text, ActivityIndicator, Pressable, PressableProps, ViewStyle } from 'react-native'
import { useTheme } from '@/Hooks'
import { colors } from '@/Utils/constants'

type YellowButtonProps = {
    text: string
    containerStyle?: object
    style?: object
    textStyle?: object
    onPress: () => void
    isLoading?: boolean
    leftIcon?: () => React.ReactNode
    rightIcon?: () => React.ReactNode
}

const DEFAULT_TEXT_STYLE = {
    fontSize: 16,
    color: colors.black,
    fontFamily: "Virus-Killer",
    marginLeft: 10
}

const BUTTON_STYLE: ViewStyle = {
    backgroundColor: colors.brightTurquoise,
    width: "100%",
    height: 40,
    justifyContent: "center"
}

const YellowButton = ({
    text,
    containerStyle,
    style,
    textStyle,
    onPress,
    isLoading,
    leftIcon,
    rightIcon,
}: YellowButtonProps) => {
    const { Layout, Images } = useTheme()

    return (
        <View style={{
            ...containerStyle,
            width: "100%",
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
                        {leftIcon && leftIcon()}
                        <Text
                            style={[DEFAULT_TEXT_STYLE, textStyle, { textAlign: "center" }]}
                        >{text}</Text>
                        {rightIcon && rightIcon()}
                    </View>
                }
            </Pressable>
        </View>
    )
}

YellowButton.defaultProps = {

}

export default YellowButton
