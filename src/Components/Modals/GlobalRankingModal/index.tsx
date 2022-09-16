import React, { FC, forwardRef } from 'react'
import { View, ViewStyle, TextStyle, Pressable, Text, Image } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Spacing } from '@/Theme/Variables'
import { useTheme } from '@/Hooks'
import { colors } from '@/Utils/constants'
import ModalBox from 'react-native-modalbox'
import reward from '@/Assets/Images/Modal/reward.png'
import TurquoiseButton from '@/Components/Buttons/TurquoiseButton'
import AvenirText from '@/Components/FontText/AvenirText'
// @ts-ignore
import AnimateNumber from 'react-native-animate-number'

type GlobalRankingModalProps = {
  onModalClose: () => void
  style?: object
  onActionBtnPress: () => void
  globalAvgPoint: number
}

const MODAL_TEXT: TextStyle = {
  color: colors.white,
  textAlign: 'center',
}

const GlobalRankingModal = forwardRef((props: GlobalRankingModalProps, ref) => {
  const { onModalClose, style, onActionBtnPress } = props
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()

  return (
    <ModalBox
      ref={ref as any}
      backdropPressToClose={false}
      swipeToClose={false}
      position='center'
      entry='bottom'
      backdrop={true}
      backButtonClose={false}
      onClosed={onModalClose}
      keyboardTopOffset={40}
      animationDuration={500}
      style={{
        height: 280,
        width: '80%',
        backgroundColor: colors.charcoal,
        borderRadius: 10,
        ...style,
      }}
    >
      <View style={{ flex: 3, justifyContent: 'flex-end', paddingHorizontal: 14, alignItems: 'center' }}>
        <AvenirText style={[MODAL_TEXT, { fontSize: 16, lineHeight: 24 }]}>{t('modalPrompt.climbGlobalRanking')}</AvenirText>
      </View>
      <View
        style={{
          paddingTop: 20,
        }}
      >
        <AvenirText style={{ fontSize: 16, color: colors.white, textAlign: 'center' }}>{t('globalAvgKePoints')}</AvenirText>
        <AnimateNumber
          value={props.globalAvgPoint.toFixed(2)}
          style={{
            color: colors.white,
            fontSize: 32,
            paddingVertical: 4,
            fontWeight: 'bold',
            textAlign: 'center',
          }}
          formatter={(val: string) => {
            return parseFloat(val).toFixed(2)
          }}
        />
      </View>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flex: 2,
        }}
      >
        <TurquoiseButton
          onPress={onActionBtnPress}
          text={t('gotIt')}
          isTransparentBackground
          containerStyle={{
            width: 120,
          }}
        />
      </View>
    </ModalBox>
  )
})

export default GlobalRankingModal
