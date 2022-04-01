import { StackScreenProps } from "@react-navigation/stack"
import React, { FC } from "react"
import { TextStyle, View } from "react-native"
import { Header, GradientBackground, Text, Screen } from "../../components"
import { AuthNavigatorParamList } from "../../navigators"
import { spacing } from "../../theme/spacing"

const FULL = {
  flex: 1
}
const HEADER: TextStyle = {
  paddingBottom: spacing[5] - 1,
  paddingHorizontal: spacing[4],
  paddingTop: spacing[3],
}
const HEADER_TITLE: TextStyle = {
  fontSize: 12,
  fontWeight: "bold",
  letterSpacing: 1.5,
  lineHeight: 15,
  textAlign: "center",
}

export const SignUpScreen: FC<StackScreenProps<AuthNavigatorParamList, "signUp">> = 
  ({ navigation }) => {
    const goBack = navigation.goBack;
    return (
      <View style={FULL}>
        <Screen>
          <GradientBackground colors={["#422443", "#281b34"]} />
          <Header
            headerTx="demoScreen.howTo"
            leftIcon="back"
            onLeftPress={goBack}
            style={HEADER}
            titleStyle={HEADER_TITLE}
          />
          <Text>Sign Up</Text>
        </Screen>
      </View>
    )
  }
