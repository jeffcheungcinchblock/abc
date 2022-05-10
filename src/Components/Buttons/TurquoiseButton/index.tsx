import React, { FC } from 'react'
import { View, Image, Text, ActivityIndicator, Pressable, PressableProps, ViewStyle } from 'react-native'
import { useTheme } from '@/Hooks'
import { colors } from '@/Utils/constants'

type TurquoiseButtonProps = {
    text: string
    containerStyle?: object
    style?: object
    textStyle?: object
    onPress: () => void
    isLoading?: boolean
    leftIcon?: () => React.ReactNode
    rightIcon?: () => React.ReactNode
    isTransparentBackground?: boolean
}

const DEFAULT_TEXT_STYLE = {
    fontSize: 16,
    color: colors.black,
    marginLeft: 10,
}

const BUTTON_STYLE: ViewStyle = {
    backgroundColor: colors.brightTurquoise,
    width: "100%",
    height: 40,
    borderRadius: 20,
    justifyContent: "center"
}

const TurquoiseButton = ({
    text,
    containerStyle,
    style,
    textStyle,
    onPress,
    isLoading,
    leftIcon,
    rightIcon,
    isTransparentBackground
}: TurquoiseButtonProps) => {
    const { Layout, Images } = useTheme()

    return (
        <View style={{
            ...containerStyle,
        }}>
            <Pressable
                onPress={onPress}
                style={[BUTTON_STYLE, {
                    backgroundColor: isTransparentBackground ? "transparent" : colors.brightTurquoise,
                    borderColor: isTransparentBackground ? colors.brightTurquoise : "transparent",
                    borderWidth: isTransparentBackground ? 1 : 0

                }]}
            >
                {
                    isLoading ? <ActivityIndicator
                        size="small" color={"#fff"}
                    /> : <View style={[Layout.rowCenter]}>
                        {leftIcon && leftIcon()}
                        <Text
                            style={[DEFAULT_TEXT_STYLE, textStyle, {
                                textAlign: "center",
                                color: isTransparentBackground ? colors.brightTurquoise : "#000",
                            }]}
                        >{text}</Text>
                        {rightIcon && rightIcon()}
                    </View>
                }
            </Pressable>
        </View>
    )
}

TurquoiseButton.defaultProps = {

}

export default TurquoiseButton
