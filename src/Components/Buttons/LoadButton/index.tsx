import React, { FC } from 'react'
import { View, Image, Text, ActivityIndicator } from 'react-native'
import { useTheme } from '@/Hooks'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { colors } from '@/Utils/constants'

type LoadButtonProps = {
    text: string
    containerStyle?: object
    style?: object
    textStyle?: object
    onPress: () => void
    isLoading: boolean
    leftIcon?: () => React.ReactNode
    rightIcon?: () => React.ReactNode
}

const DEFAULT_TEXT_STYLE = {
    fontSize: 20,
    color: "#fff",
    marginLeft: 10
}

const BUTTON_STYLE = {
    backgroundColor: colors.frenchPink,
    paddingVertical: 10,
    borderRadius: 10,
}


const LoadButton = ({
    text,
    containerStyle,
    style,
    textStyle,
    onPress,
    isLoading,
    leftIcon,
    rightIcon,
}: LoadButtonProps) => {
    const { Layout, Images } = useTheme()

    return (
        <View style={containerStyle}>
            <TouchableOpacity
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
            </TouchableOpacity>
        </View>
    )
}

LoadButton.defaultProps = {

}

export default LoadButton
