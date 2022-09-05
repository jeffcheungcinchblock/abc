import React, { FC } from 'react'
import { View, Image, Text, ActivityIndicator, Pressable, StyleProp, ViewStyle, ImageStyle, Dimensions } from 'react-native'
import { useTheme } from '@/Hooks'
import { colors } from '@/Utils/constants'
import appIcon from '@/Assets/Images/logos/logo1.png'

type AppIconProps = {
  style?: object
  imageStyle?: object
}

const windowHeight = Dimensions.get('window').height

const AppIcon = ({ style, imageStyle }: AppIconProps) => {
  const { Layout, Images } = useTheme()

  return (
    <View
      style={{
        width: '100%',
        alignItems: 'center',
        ...style,
      }}
    >
      <Image
        source={appIcon}
        style={{
          height: windowHeight / 12,
          resizeMode: 'contain',
          ...imageStyle,
        }}
      />
    </View>
  )
}

AppIcon.defaultProps = {}

export default AppIcon
