import React, { FC, forwardRef } from "react"
import { View, ViewStyle, TextStyle, Pressable, Text, Image } from "react-native"
import { useTranslation } from 'react-i18next'
import { Spacing } from "@/Theme/Variables"
import { useTheme } from "@/Hooks"
import { colors } from "@/Utils/constants"
import ModalBox from 'react-native-modalbox';
import reward from '@/Assets/Images/Modal/reward.png'
import TurquoiseButton from "@/Components/Buttons/TurquoiseButton"

type DailyRewardModalProps = {
  onModalClose: () => void,
  style?: object,
  ke: number,
  onActionBtnPress: () => void,
}

const MODAL_TEXT: TextStyle = {
  color: colors.white, textAlign: "center", fontWeight: "bold"
}

const DailyRewardModal = forwardRef((props: DailyRewardModalProps, ref) => {

  const {
    onModalClose,
    style,
    onActionBtnPress,
    ke,
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
      <View style={[Layout.fullWidth, Layout.colCenter, { flex: 4 }]}>
        <Image source={reward} />
      </View>
      <Text style={[MODAL_TEXT, { fontSize: 18, paddingHorizontal: 14, flex: 2 }]}>{t("modalPrompt.claimedDailyReward")}</Text>
      <Text style={[MODAL_TEXT, { fontSize: 30, fontStyle: "italic", flex: 3 }]}>{ke}KE</Text>
      <View style={{
        alignItems: "center",
        flex: 3
      }}>
        <TurquoiseButton
          onPress={onActionBtnPress}
          text={t("lesGo")}
          isTransparentBackground
          containerStyle={{
            width: 120,
          }}
        />
      </View>
    </ModalBox>
  )
})

export default DailyRewardModal