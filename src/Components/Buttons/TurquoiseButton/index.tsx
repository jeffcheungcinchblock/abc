import React, { FC } from 'react'
import { View, Image, Text, ActivityIndicator, Pressable, PressableProps, ViewStyle, TextStyle, Dimensions } from 'react-native'
import { useTheme } from '@/Hooks'
import { colors } from '@/Utils/constants'
import AvenirText from '@/Components/FontText/AvenirText'

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
  isBoldText?: boolean
  disabled?: boolean
}

const DEFAULT_TEXT_STYLE: TextStyle = {
  fontSize: 16,
  color: colors.black,
}
const windowHeight = Dimensions.get('window').height
const BUTTON_STYLE: ViewStyle = {
  backgroundColor: colors.brightTurquoise,
  width: '100%',
  height: 32,
  minHeight: 32,
  borderRadius: 20,
  justifyContent: 'center',
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
  isTransparentBackground,
  isBoldText,
  disabled,
}: TurquoiseButtonProps) => {
  const { Layout, Images } = useTheme()

  return (
    <View
      style={{
        ...containerStyle,
      }}
    >
      <Pressable
        onPress={onPress}
        style={[
          BUTTON_STYLE,
          {
            backgroundColor: isTransparentBackground ? 'transparent' : colors.brightTurquoise,
            borderColor: isTransparentBackground ? colors.brightTurquoise : 'transparent',
            borderWidth: isTransparentBackground ? 1.7 : 0,
            alignItems: 'center',
            ...style,
          },
        ]}
        disabled={disabled}
      >
        {isLoading ? (
          <ActivityIndicator size='small' color={colors.white} />
        ) : (
          <View style={[Layout.rowCenter]}>
            {leftIcon && leftIcon()}
            <AvenirText
              style={[
                DEFAULT_TEXT_STYLE,
                textStyle,
                {
                  textAlign: 'center',
                  fontWeight: isBoldText ? '600' : '500',
                  color: isTransparentBackground ? colors.brightTurquoise : colors.black,
                },
              ]}
            >
              {text}
            </AvenirText>
            {rightIcon && rightIcon()}
          </View>
        )}
      </Pressable>
    </View>
  )
}

TurquoiseButton.defaultProps = {}

export default TurquoiseButton
