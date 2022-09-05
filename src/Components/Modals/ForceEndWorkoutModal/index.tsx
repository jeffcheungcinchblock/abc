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

type ForceQuitWorkoutModalProps = {
  onModalClose: () => void
  style?: object
}

const MODAL_TEXT: TextStyle = {
  color: colors.white,
  textAlign: 'center',
  fontWeight: 'bold',
}

const forceQuitWorkout = forwardRef((props: ForceQuitWorkoutModalProps, ref) => {
  const { onModalClose, style } = props
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
        height: '40%',
        width: '80%',
        backgroundColor: colors.charcoal,
        borderRadius: 20,
        padding: 20,
        ...style,
      }}
    >
      <View style={{ flex: 2, justifyContent: 'center' }}>
        <AvenirText style={[MODAL_TEXT, { fontSize: 16, fontWeight: 'bold' }]}>{t('modalPrompt.caution')}</AvenirText>
      </View>
      <View style={{ flex: 2, justifyContent: 'center', paddingHorizontal: 14 }}>
        <AvenirText style={[MODAL_TEXT, { fontSize: 16, fontWeight: '400' }]}>{t('modalPrompt.forceQuitWorkout')}</AvenirText>
      </View>
      <View
        style={{
          justifyContent: 'space-around',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 2,
        }}
      >
        <TurquoiseButton
          onPress={onModalClose}
          text={t('close')}
          // isTransparentBackground
          containerStyle={{
            width: '80%',
            colors: colors.black,
          }}
        />
      </View>
    </ModalBox>
  )
})

export default forceQuitWorkout
