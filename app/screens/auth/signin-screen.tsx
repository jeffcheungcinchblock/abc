import { StackScreenProps } from "@react-navigation/stack"
import React, { FC } from "react"
import { View } from "react-native"
import { GradientBackground, Screen, Text } from "../../components"
import { AuthNavigatorParamList } from "../../navigators"

const FULL = {
  flex: 1
}

export const SignInScreen: FC<StackScreenProps<AuthNavigatorParamList, "signIn">> =
  ({ navigation }) => {
    return (
      <View style={FULL}>
        <Screen>
          <GradientBackground colors={["#422443", "#281b34"]} />
          <Text>Sign Up</Text>
        </Screen>
      </View>
    )
  }