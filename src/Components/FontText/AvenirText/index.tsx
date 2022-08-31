import React, { FC } from 'react'
import { View, Image, Text, StyleProp, ViewStyle, TextProps } from 'react-native'
import { useTheme } from '@/Hooks'
import { colors } from '@/Utils/constants'

interface AvenirMediumTextProps extends TextProps {}

const AvenirMediumText = (props: AvenirMediumTextProps) => {
  const { Layout, Images } = useTheme()

  let styleProp = Array.isArray(props.style)
    ? [...props.style, { fontFamily: 'AvenirNext-Medium' }]
    : {
        ...(props.style as object),
        fontFamily: 'AvenirNext-Medium',
      }

  return <Text {...props} style={styleProp} />
}

AvenirMediumText.defaultProps = {}

export default AvenirMediumText
