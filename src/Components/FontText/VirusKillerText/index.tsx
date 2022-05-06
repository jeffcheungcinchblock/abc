import React, { FC } from 'react'
import { View, Image, Text, StyleProp, ViewStyle, TextProps } from 'react-native'
import { useTheme } from '@/Hooks'
import { colors } from '@/Utils/constants'

interface VirusKillerTextProps extends TextProps {
    label: string
}

const VirusKillerText = (props: VirusKillerTextProps) => {
    const { Layout, Images } = useTheme()

    let styleProp = Array.isArray(props.style) ? [...props.style, {fontFamily: "Virus-Killer"}] : {
        ...props.style as object, 
        fontFamily: "Virus-Killer"
    }

    return (
        <Text {...props} style={styleProp}>
            {props.label}
        </Text>
    
    )
}

VirusKillerText.defaultProps = {

}

export default VirusKillerText
