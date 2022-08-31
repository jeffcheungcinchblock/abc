import React, { FC } from 'react'
import { View, Image, Text, StyleProp, ViewStyle, TextProps } from 'react-native'
import { useTheme } from '@/Hooks'
import { colors } from '@/Utils/constants'

interface AvenirTextProps extends TextProps {
  label: string
}

const AvenirText = (props: AvenirTextProps) => {
  const { Layout, Images } = useTheme()

  let styleProp = Array.isArray(props.style)
    ? [...props.style, { fontFamily: 'Avenir' }]
    : {
        ...(props.style as object),
        fontFamily: 'Avenir',
      }

  return (
    <Text {...props} style={styleProp}>
      {props.children}
    </Text>
  )
}

AvenirText.defaultProps = {}

export default AvenirText
