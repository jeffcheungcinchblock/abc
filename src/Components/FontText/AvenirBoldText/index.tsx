import React, { FC } from 'react'
import { View, Image, Text, StyleProp, ViewStyle, TextProps } from 'react-native'
import { useTheme } from '@/Hooks'
import { colors } from '@/Utils/constants'

interface AvenirBoldTextProps extends TextProps {
    label: string
}

const AvenirBoldText = (props: AvenirBoldTextProps) => {
    const { Layout, Images } = useTheme()

    let styleProp = Array.isArray(props.style) ? [...props.style, {fontFamily: "AvenirNext-Bold"}] : {
        ...props.style as object, 
        fontFamily: "AvenirNext-Bold"
    }

    return (
        <Text {...props} style={styleProp}>
            {props.label}
        </Text>
    
    )
}

AvenirBoldText.defaultProps = {

}

export default AvenirBoldText
