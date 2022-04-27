import React, { FC } from "react"
import { View, ViewStyle, TextStyle, Pressable, Text, Image } from "react-native"
import { useTranslation } from 'react-i18next'
import { Spacing } from "@/Theme/Variables"
import backBtn from '@/Assets/Images/buttons/back.png'
import AppIcon from "../Icons/AppIcon"

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

const HEADER: TextStyle = {
  paddingBottom: Spacing[5] - 1,
  paddingHorizontal: Spacing[4],
  paddingTop: Spacing[4],
  height: 80,
}

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

  const { t: translate } = useTranslation()
  const header = headerText || (headerTx && translate(headerTx)) || ""

  return (
    <View style={[ROOT, HEADER, style]}>
      {onLeftPress ? (
        <Pressable style={{position: "absolute", left: 10, top: '50%', zIndex: 1}} onPress={onLeftPress}>
          {leftIcon ? leftIcon() : <Image source={backBtn} style={{ width: 16, resizeMode: "contain" }} />}
        </Pressable>
      ) : (
        <View style={LEFT} />
      )}
      {
        header ? <View style={TITLE_MIDDLE}>
          <Text style={[TITLE, titleStyle]}>{header}</Text>
        </View> : <AppIcon />
      }
      {rightIcon ? (
        <Pressable onPress={onRightPress}>
          {rightIcon()}
        </Pressable>
      ) : (
        <View style={RIGHT} />
      )}
    </View>
  )
}

export default Header