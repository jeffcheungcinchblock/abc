import React, { FC } from 'react'
import { View, Image, Text, StyleProp, ActivityIndicator, ViewStyle, TextProps, ViewProps } from 'react-native'
import { useTheme } from '@/Hooks'
import { colors } from '@/Utils/constants'
import iconCheck from '@/Assets/Images/icons/icon_check.png'

interface SnackbarMsgContainerProps extends ViewProps {
    textMessage: string

}

const SnackbarMsgContainer = ({
    textMessage
}: SnackbarMsgContainerProps) => {

    return (
        <View style={{ flex: 1, flexDirection: "row", paddingLeft: 30, paddingRight: 10 }}>
            <View style={{ flex: 4, justifyContent: "center" }}>
                <Text style={{ fontFamily: "AvenirNext-Bold", fontSize: 20, color: '#fff' }}>{textMessage}</Text>
            </View>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Image source={iconCheck} style={{ width: 26, height: 26, resizeMode: "contain" }} />
            </View>
        </View>

    )
}

SnackbarMsgContainer.defaultProps = {

}

export default SnackbarMsgContainer
