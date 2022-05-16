import React, { FC, forwardRef } from "react"
import { View, ViewStyle, TextStyle, Pressable, Text, Image } from "react-native"
import { useTranslation } from 'react-i18next'
import { Spacing } from "@/Theme/Variables"
import { useTheme } from "@/Hooks"
import { colors } from "@/Utils/constants"
import ModalBox from 'react-native-modalbox';
import reward from '@/Assets/Images/Modal/reward.png'
import TurquoiseButton from "@/Components/Buttons/TurquoiseButton"

type RuleOfReferralModalProps = {
  onModalClose: () => void,
  style?: object,
  onActionBtnPress: () => void,
}

const MODAL_TEXT: TextStyle = {
  color: colors.white, textAlign: "center", 
}

const RuleOfReferralModal = forwardRef((props: RuleOfReferralModalProps, ref) => {

  const {
    onModalClose,
    style,
    onActionBtnPress,
  } = props
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()

  return (
    <ModalBox
      ref={ref as any}
      backdropPressToClose={false}
      swipeToClose={false}
      position="center"
      entry="bottom"
      backdrop={false}
      backButtonClose={false}
      isOpen={true}
      onClosed={onModalClose}
      keyboardTopOffset={40}
      animationDuration={500}
      style={{
        height: '50%',
        width: "80%",
        backgroundColor: colors.charcoal,
        borderRadius: 20,
        ...style
      }}
    >
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text style={[MODAL_TEXT, { fontSize: 18, fontWeight: "bold" }]}>{t("modalPrompt.ruleOfReferral")}</Text>

      </View>
      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 14 }}>
        <Text style={[MODAL_TEXT, { fontSize: 18 }]}>{t("modalPrompt.maximum30Friends")}</Text>
      </View>
      <View style={{
        justifyContent: "center",
        alignItems: "center",
        flex: 1
      }}>
        <TurquoiseButton
          onPress={onActionBtnPress}
          text={t("close")}
          isTransparentBackground
          containerStyle={{
            width: 120,
          }}
        />
      </View>
    </ModalBox>
  )
})

export default RuleOfReferralModal