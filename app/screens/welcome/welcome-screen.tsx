import React, { FC } from "react"
import { View, ViewStyle, TextStyle, ImageStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import {
  Button,
  Screen,
  Text,
  GradientBackground,
  AutoImage as Image,
} from "../../components"
import { color, spacing, typography } from "../../theme"
import { AuthNavigatorParamList } from "../../navigators"

const logo = require("./logo.png")

const FULL: ViewStyle = { flex: 1 }
const CONTAINER: ViewStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  backgroundColor: color.transparent,
  paddingHorizontal: spacing[4],
}
const TEXT: TextStyle = {
  color: color.palette.white,
  fontFamily: typography.primary,
}
const BOLD: TextStyle = { fontWeight: "bold" }
const TITLE_WRAPPER: TextStyle = {
  ...TEXT,
  textAlign: "center",
}
const LOGO: ImageStyle = {
  alignSelf: "center",
  marginVertical: spacing[5],
  maxWidth: "100%",
  width: 343,
  height: 230,
}
const CONTENT: TextStyle = {
  ...TEXT,
  color: "#BAB6C8",
  fontSize: 15,
  lineHeight: 22,
  marginBottom: spacing[5],
}
const LINK: TextStyle = {
  ...CONTENT,
  color: color.palette.lightBlue,
  textDecorationLine: "underline",
}
const CONTINUE: ViewStyle = {
  paddingVertical: spacing[4],
  paddingHorizontal: spacing[4],
  backgroundColor: color.palette.deepPurple,
}
const CONTINUE_TEXT: TextStyle = {
  ...TEXT,
  ...BOLD,
  fontSize: 13,
  letterSpacing: 2,
}

export const WelcomeScreen: FC<StackScreenProps<AuthNavigatorParamList, "welcome">> = 
  ({ navigation }) => {
    const nextScreen = () => navigation.navigate("signUp")

    return (
      <View style={FULL}>
        <GradientBackground colors={["#422443", "#281b34"]} />
        <Screen style={CONTAINER} backgroundColor={color.transparent}>
          <Image source={logo} style={LOGO} />
          <Button
            style={CONTINUE}
            textStyle={CONTINUE_TEXT}
            tx="welcomeScreen.waitlist"
            onPress={nextScreen}
          />
          <Text style={TITLE_WRAPPER}>
            <Text style={CONTENT} text="already have account? " />
            <Text style={LINK} onPress={nextScreen} text="Log In" />
          </Text>
        </Screen>
      </View>
    )
  }