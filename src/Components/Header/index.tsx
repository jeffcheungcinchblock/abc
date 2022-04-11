import React, { FC } from "react"
import { View, ViewStyle, TextStyle, TouchableOpacity, Text } from "react-native"
import { useTranslation } from 'react-i18next'
import { Spacing } from "@/Theme/Variables"

// static styles
const ROOT: ViewStyle = {
  flexDirection: "row",
  paddingHorizontal: Spacing[4],
  alignItems: "center",
  paddingTop: Spacing[5],
  paddingBottom: Spacing[5],
  justifyContent: "flex-start",
}
const TITLE: TextStyle = { textAlign: "center" }
const TITLE_MIDDLE: ViewStyle = { flex: 1, justifyContent: "center" }
const LEFT: ViewStyle = { width: 32 }
const RIGHT: ViewStyle = { width: 32 }

/**
 * Header that appears on many screens. Will hold navigation buttons and screen title.
 */
const Header = (props: {
  onLeftPress?: () => void,
  onRightPress?: () => void,
  rightIcon?: () => React.ReactNode,
  leftIcon?: () => React.ReactNode,
  headerText?: string,
  headerTx?: string,
  style?: object,
  titleStyle?: object,
}) => {
  const {
    onLeftPress,
    onRightPress,
    rightIcon,
    leftIcon,
    headerText,
    headerTx,
    style,
    titleStyle,
  } = props

  const {t : translate} = useTranslation()
  const header = headerText || (headerTx && translate(headerTx)) || ""

  return (
    <View style={[ROOT, style]}>
      {leftIcon ? (
        <TouchableOpacity onPress={onLeftPress}>
          {leftIcon()}
        </TouchableOpacity>
      ) : (
        <View style={LEFT} />
      )}
      <View style={TITLE_MIDDLE}>
        <Text style={[TITLE, titleStyle]}>{header}</Text>
      </View>
      {rightIcon ? (
        <TouchableOpacity onPress={onRightPress}>
          {rightIcon()}
        </TouchableOpacity>
      ) : (
        <View style={RIGHT} />
      )}
    </View>
  )
}

export default Header